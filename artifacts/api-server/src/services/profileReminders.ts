import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { db, ecosystemMembersTable as members, memberProfileRemindersTable as reminders, networkProfiles } from "@workspace/db";
import { missingProfileEssentials, PROFILE_REQUIREMENTS } from "@workspace/shared";
import { eq, sql } from "drizzle-orm";
import { NetworkError } from "./networkAuth";
import { invalidateMemberDashboard, reminderConfiguration } from "./membershipDashboard";

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
    missing, state, updatedAt: member?.updatedAt.toISOString() ?? "",
    restricted: user.banned || user.locked || !!network?.suspended,
  };
}
type Recipient = Awaited<ReturnType<typeof recipient>>;
function tokenFor(who: Recipient, issued: number, preferenceId: string) {
  const config = reminderConfiguration();
  return `${issued}.${preferenceId}.${digest(JSON.stringify(["profile-preview", issued, preferenceId, who.state?.id ?? null, who.clerkId, who.email, who.name, who.missing, who.updatedAt, config.from, config.site]))}`;
}
function message(who: Recipient, optOutUrl?: string) {
  const config = reminderConfiguration();
  const profileUrl = config.configured ? new URL("/member/onboarding", config.site).toString() : "[Lien vers la page officielle de complétion — adresse du site à configurer]";
  return {
    subject: "The One Movement — complete your member profile",
    text: `Hello ${who.name},\n\nYour free The One Movement account is ready. To finish your essential profile, please add: ${who.missing.join(", ")}.\n\nContinue here: ${profileUrl}\n\nChoose your primary sector and up to two additional active sectors. When your profile is complete, you can explicitly activate your network profile to share your work, follow members and invite others. Your public directory visibility remains your choice. Programme participation follows each programme’s own application and approval process; an account is not an automatic acceptance.\n\nPhotos, a biography and social links are optional. No subscription or referral quota is required for ordinary participation.\n\n${optOutUrl ? `To stop profile reminders, review your preference here: ${optOutUrl}` : "Each email includes a link to stop profile reminders."}\n\nThe One Movement International`,
  };
}
async function providerReady() {
  const config = reminderConfiguration();
  if (!config.configured) return config.message;
  try {
    const response = await connectors.proxy("resend", "/domains", { method: "GET" });
    if (!response.ok) return "Resend refuse la connexion ou la vérification du domaine. Corrigez la clé et ses permissions avant l’envoi.";
    const body = await response.json() as { data?: { name: string; status: string }[] };
    const domain = config.from.split("@")[1].toLowerCase();
    if (!body.data?.some(d => d.name.toLowerCase() === domain && d.status === "verified"))
      return "Le domaine de l’expéditeur doit être vérifié dans Resend.";
    return "";
  } catch { return "La connexion Resend est indisponible. Aucun envoi n’est possible."; }
}
export async function previewReminder(clerkId: string) {
  const who = await recipient(clerkId);
  const reason = who.restricted ? "Ce compte est restreint ; aucune relance n’est autorisée." :
    reminderBlock(who.state, who.missing, who.verified) || await providerReady();
  const preferenceId = who.state?.id ?? randomUUID();
  const preferences = reminderConfiguration().configured
    ? new URL(`/api/profile-reminders/preferences/${preferenceId}/${optOutSignature(preferenceId)}`, reminderConfiguration().site).toString() : undefined;
  return { clerkId, recipient: who.email, ...message(who, preferences), canSend: !reason, reason,
    previewToken: process.env.SESSION_SECRET ? tokenFor(who, Date.now(), preferenceId) : "" };
}
export async function sendReminder(clerkId: string, requestedBy: string, previewToken: string) {
  const who = await recipient(clerkId);
  const issued = Number(previewToken.split(".")[0]);
  const preferenceId = previewToken.split(".")[1] ?? "";
  if (!Number.isSafeInteger(issued) || issued > Date.now() || Date.now() - issued > 15 * 60_000 ||
    !/^[a-f0-9-]{36}$/.test(preferenceId) ||
    !safeEqual(tokenFor(who, issued, preferenceId), previewToken)) throw new NetworkError(409, "Le compte ou l’aperçu a changé. Ouvrez un nouvel aperçu avant de confirmer.");
  if (who.restricted) throw new NetworkError(409, "Compte restreint.");
  const blocked = reminderBlock(who.state, who.missing, who.verified) || await providerReady();
  if (blocked) throw new NetworkError(409, blocked);
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
  const content = message(who, preferences);
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
      body: JSON.stringify({ from: `The One Movement <${config.from}>`, to: [who.email], ...content }),
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
