import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { db, ecosystemMembersTable as members, memberProfileRemindersTable as reminders, networkProfiles } from "@workspace/db";
import { missingProfileEssentials, PROFILE_REQUIREMENTS } from "@workspace/shared";
import { eq, sql } from "drizzle-orm";
import { NetworkError } from "./networkAuth";
import { invalidateMemberDashboard, reminderConfiguration } from "./membershipDashboard";
import { profileReminderMessage } from "./profileReminderMessage";

export const REMINDER_INTERVAL = 7 * 24 * 60 * 60 * 1000;
const connectors = new ReplitConnectors();
const digest = (value: string) => {
  if (!process.env.SESSION_SECRET) throw new NetworkError(503, "La configuration sécurisée des relances est indisponible.");
  return createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("hex");
};
export const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export const optOutSignature = (id: string) => digest(`profile-reminder-opt-out:${id}`);
type Reminder = typeof reminders.$inferSelect;
export function reminderBlock(state: Reminder | undefined, missing: string[], verified: boolean, now = Date.now()) {
  if (!missing.length) return "Ce profil est déjà complet.";
  if (!verified) return "L’adresse principale doit être vérifiée avant une relance.";
  if (state?.optOutAt) return "Ce membre a choisi de ne plus recevoir de rappels.";
  if (state?.status === "failed" && now - state.lastAttemptAt.getTime() < 60_000)
    return "Attendez une minute avant de réessayer cette relance.";
  if (state && state.status !== "failed" && now - state.lastAttemptAt.getTime() < REMINDER_INTERVAL)
    return "Une relance a déjà été acceptée ou reste à vérifier. Attendez sept jours avant une nouvelle tentative.";
  return "";
}
async function recipient(clerkId: string) {
  if (!/^user_[a-zA-Z0-9]{1,90}$/.test(clerkId)) throw new NetworkError(400, "Compte invalide.");
  let user;
  try { user = await clerkClient.users.getUser(clerkId); }
  catch { throw new NetworkError(503, "Le compte actuel ne peut pas être vérifié. Aucun email n’a été envoyé."); }
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
  const [member] = await db.select().from(members).where(eq(members.clerkId, clerkId)).limit(1);
  const [state] = await db.select().from(reminders).where(eq(reminders.clerkId, clerkId)).limit(1);
  const [network] = member ? await db.select().from(networkProfiles).where(eq(networkProfiles.memberId, member.id)).limit(1) : [];
  const missing = missingProfileEssentials(member).map(k => PROFILE_REQUIREMENTS[k]);
  return {
    clerkId, email: email?.emailAddress ?? "", verified: email?.verification?.status === "verified",
    name: member?.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "TOMI member",
    firstName: user.firstName?.trim() || member?.fullName?.trim().split(/\s+/)[0] || "TOMI member",
    missing, state, updatedAt: member?.updatedAt.toISOString() ?? "",
    restricted: user.banned || user.locked || !!network?.suspended,
  };
}
type Recipient = Awaited<ReturnType<typeof recipient>>;
function tokenFor(who: Recipient, issued: number, preferenceId: string, providerMode: ProviderMode) {
  const config = reminderConfiguration();
  return `${issued}.${preferenceId}.${providerMode}.${digest(JSON.stringify(["profile-preview", issued, preferenceId, providerMode, who.state?.id ?? null, who.clerkId, who.email, who.name, who.firstName, who.missing, who.updatedAt, config.from, config.site]))}`;
}
function message(who: Recipient, optOutUrl?: string, preferenceId?: string) {
  const config = reminderConfiguration();
  const url = config.configured ? new URL("/member/onboarding", config.site) : null;
  if (url && preferenceId) url.searchParams.set("reminder", `${preferenceId}.${digest(`profile-reminder-target:${preferenceId}`)}`);
  return profileReminderMessage({
    firstName: who.firstName, email: who.email, profileUrl: url?.toString() ?? "[Official profile link — site configuration required]",
    site: config.site, contact: config.from, preferencesUrl: optOutUrl,
  });
}
type ProviderMode = "verified" | "manual_check" | "unavailable";
type ProviderReadiness = { available: boolean; mode: ProviderMode; reason: string };
export async function reminderProviderStatus(): Promise<ProviderReadiness> {
  const config = reminderConfiguration();
  if (!config.configured) return { available: false, mode: "unavailable", reason: config.message };
  try {
    const response = await connectors.proxy("resend", "/domains", { method: "GET" });
    if (!response.ok) {
      let providerMessage = "";
      try {
        const body = await response.clone().json() as { message?: string; error?: string };
        providerMessage = `${body.message ?? ""} ${body.error ?? ""}`;
      } catch { /* Keep provider response content private and fail closed. */ }
      if (/API key is invalid|invalid api key/i.test(providerMessage))
        return { available: false, mode: "unavailable", reason: "La clé de l’intégration Resend est invalide. Corrigez-la dans les intégrations ; aucun email n’a été envoyé." };
      if ((response.status === 401 || response.status === 403) && /restricted.*only send emails|only send emails/i.test(providerMessage))
        return { available: true, mode: "manual_check", reason: "Cette clé Resend autorise uniquement l’envoi et ne peut pas vérifier les domaines. Avant de confirmer, vérifiez dans Resend que le domaine de l’expéditeur est marqué Verified." };
      return { available: false, mode: "unavailable", reason: "Resend ne permet pas de vérifier le domaine de l’expéditeur. La configuration doit être corrigée avant l’envoi." };
    }
    const body = await response.json() as { data?: { name: string; status: string }[] };
    const domain = config.from.split("@")[1].toLowerCase();
    if (!body.data?.some(d => d.name.toLowerCase() === domain && d.status === "verified"))
      return { available: false, mode: "unavailable", reason: "Le domaine de l’expéditeur doit être vérifié dans Resend." };
    return { available: true, mode: "verified", reason: "" };
  } catch { return { available: false, mode: "unavailable", reason: "La connexion Resend est indisponible. Aucun envoi n’est possible." }; }
}
export async function previewReminder(clerkId: string) {
  const who = await recipient(clerkId);
  const accountBlock = who.restricted ? "Ce compte est restreint ; aucune relance n’est autorisée." :
    reminderBlock(who.state, who.missing, who.verified);
  const provider = accountBlock
    ? { available: false, mode: "unavailable" as const, reason: "" }
    : await reminderProviderStatus();
  const reason = accountBlock || provider.reason;
  const preferenceId = who.state?.id ?? randomUUID();
  const preferences = reminderConfiguration().configured
    ? new URL(`/api/profile-reminders/preferences/${preferenceId}/${optOutSignature(preferenceId)}`, reminderConfiguration().site).toString() : undefined;
  const senderDomain = reminderConfiguration().from.split("@")[1] ?? "";
  return { clerkId, recipient: who.email, senderDomain, domainVerification: provider.mode,
    ...message(who, preferences, preferenceId), canSend: !accountBlock && provider.available, reason,
    previewToken: process.env.SESSION_SECRET ? tokenFor(who, Date.now(), preferenceId, provider.mode) : "" };
}
export async function sendReminder(clerkId: string, requestedBy: string, previewToken: string, domainVerifiedByFounder: boolean) {
  const who = await recipient(clerkId);
  const [issuedText, preferenceId = "", previewMode = "unavailable"] = previewToken.split(".");
  const issued = Number(issuedText);
  const provider = await reminderProviderStatus();
  if (!Number.isSafeInteger(issued) || issued > Date.now() || Date.now() - issued > 15 * 60_000 ||
    !/^[a-f0-9-]{36}$/.test(preferenceId) ||
    !["verified", "manual_check", "unavailable"].includes(previewMode) ||
    previewMode !== provider.mode ||
    !safeEqual(tokenFor(who, issued, preferenceId, previewMode as ProviderMode), previewToken))
    throw new NetworkError(409, "Le compte ou l’aperçu a changé. Ouvrez un nouvel aperçu avant de confirmer.");
  if (who.restricted) throw new NetworkError(409, "Compte restreint.");
  const blocked = reminderBlock(who.state, who.missing, who.verified);
  if (blocked) throw new NetworkError(409, blocked);
  if (!provider.available) throw new NetworkError(409, provider.reason || "La connexion d’envoi n’est pas disponible.");
  if (provider.mode === "manual_check" && domainVerifiedByFounder !== true)
    throw new NetworkError(409, "Vérifiez que le domaine d’expédition est marqué Verified dans Resend et confirmez cette vérification.");
  const reserved = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`profile-reminder:${clerkId}`}, 0))`);
    const [current] = await tx.select().from(reminders).where(eq(reminders.clerkId, clerkId)).limit(1);
    if (current && current.id !== preferenceId) throw new NetworkError(409, "Une autre relance a modifié cet aperçu. Actualisez avant de continuer.");
    const [profile] = await tx.select().from(members).where(eq(members.clerkId, clerkId)).limit(1);
    const reason = reminderBlock(current, missingProfileEssentials(profile), who.verified);
    if (reason) throw new NetworkError(409, reason);
    const values = { requestedBy, attemptId: randomUUID(), status: "sending" as const, providerMessageId: null,
      lastAttemptAt: new Date(), updatedAt: new Date() };
    const [row] = await tx.insert(reminders).values({ id: preferenceId, clerkId, ...values }).onConflictDoUpdate({
      target: reminders.clerkId, set: values,
    }).returning();
    return row!;
  });
  const config = reminderConfiguration();
  const preferences = new URL(`/api/profile-reminders/preferences/${reserved.id}/${optOutSignature(reserved.id)}`, config.site).toString();
  const content = message(who, preferences, reserved.id);
  const setStatus = async (status: "failed" | "unknown" | "accepted", id?: string) => {
    await db.update(reminders).set({ status, providerMessageId: id ?? null,
      ...(status === "accepted" ? { acceptedAt: new Date() } : {}), updatedAt: new Date() }).where(eq(reminders.attemptId, reserved.attemptId));
    invalidateMemberDashboard();
  };
  let response: Response;
  try {
    response = await connectors.proxy("resend", "/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": `profile-reminder/${reserved.attemptId}` },
      body: JSON.stringify({ from: `The One Movement International <${config.from}>`, to: [who.email], reply_to: config.from, ...content }),
    });
  } catch {
    await setStatus("unknown");
    throw new NetworkError(503, "L’envoi reste à vérifier. Il ne sera pas relancé automatiquement afin d’éviter un doublon.");
  }
  if (!response.ok) {
    // A server error may occur after provider acceptance; treat it as ambiguous.
    const ambiguous = response.status >= 500 || response.status === 408 || response.status === 409;
    await setStatus(ambiguous ? "unknown" : "failed");
    throw new NetworkError(503, ambiguous ? "Résultat d’envoi incertain ; aucune nouvelle tentative automatique." : "Resend a refusé l’envoi. Vérifiez la connexion, l’expéditeur ou les limites du service.");
  }
  let id: string | undefined;
  try { const body = await response.json() as { id?: string }; id = body.id; } catch { /* accepted but malformed response */ }
  if (!id) { await setStatus("unknown"); throw new NetworkError(503, "Résultat d’envoi à vérifier ; aucune relance automatique."); }
  await setStatus("accepted", id);
  return { status: "accepted" as const, acceptedAt: new Date().toISOString() };
}

export async function checkReminderTarget(token: string, clerkId: string) {
  const [id = "", signature = "", extra] = token.split(".");
  if (extra || !/^[a-f0-9-]{36}$/.test(id) || !safeEqual(signature, digest(`profile-reminder-target:${id}`)))
    throw new NetworkError(404, "Ce lien de rappel est invalide.");
  const [row] = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
  return { matches: !!row && row.clerkId === clerkId };
}
