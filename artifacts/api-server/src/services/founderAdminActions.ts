import { clerkClient } from "@clerk/express";
import {
  db, ecosystemMembersTable as members, networkProfiles as profiles, networkCertifications as certs,
  auditLogTable as audit, founderServiceMessages as messages, founderNotifications as notifications,
} from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import type { FounderMemberAction } from "@workspace/api-zod";
import { invalidateMemberDashboard } from "./membershipDashboard";
import { invalidateNetworkIdentity, NetworkError, type NetworkActor } from "./networkAuth";
import { certificationDecisionIssue } from "./founderControlPolicy";

export async function founderMemberAction(who: NetworkActor, clerkId: string, input: FounderMemberAction) {
  if (!who.founder || !input.confirmed || input.reason.trim().length < 10) throw new NetworkError(403, "Action Founder explicitement confirmée requise.");
  let user;
  try { user = await clerkClient.users.getUser(clerkId); } catch (e) {
    if ((e as { status?: number }).status === 404) throw new NetworkError(404, "Compte introuvable.");
    throw new NetworkError(503, "Le service d’authentification ne peut pas confirmer ce compte.");
  }
  const [member] = await db.select().from(members).where(eq(members.clerkId, clerkId));
  const detail = { actorClerkId: who.clerkId, targetClerkId: clerkId, reason: input.reason.trim(), requestId: input.requestId, status: "completed" };
  if (input.action === "send_message") {
    await db.transaction(async tx => {
      const requestId = `${who.clerkId}:${clerkId}:${input.requestId}`;
      const [created] = await tx.insert(messages).values({
        requestId, recipientClerkId: clerkId, senderClerkId: who.clerkId, fromAdministration: true, text: input.reason.trim(),
      }).onConflictDoNothing().returning();
      if (created) await tx.insert(audit).values({ action: "founder.service_message", targetType: "clerk_account", details: detail });
      else {
        const [existing] = await tx.select().from(messages).where(eq(messages.requestId, requestId));
        if (existing?.text !== input.reason.trim()) throw new NetworkError(409, "Cette confirmation a déjà servi pour un autre message.");
      }
    });
    return;
  }
  if (input.action === "certification_decide") {
    if (!member || !input.certificationId || !input.decision) throw new NetworkError(400, "Choisissez une demande officielle appartenant à ce compte.");
    await db.transaction(async tx => {
      const [application] = await tx.select().from(certs).where(and(eq(certs.id, input.certificationId!), eq(certs.memberId, member.id))).for("update");
      if (!application) throw new NetworkError(404, "Demande officielle introuvable.");
      const issue = certificationDecisionIssue(application, input.decision!);
      if (issue) throw new NetworkError(409, issue);
      const expiry = new Date(); expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
      await tx.update(certs).set({
        status: input.decision!, decisionNote: input.reason.trim(), updatedAt: new Date(),
        expiresAt: input.decision === "approved" ? expiry : application.expiresAt,
      }).where(eq(certs.id, application.id));
      await tx.insert(audit).values({ action: `founder.certification.${input.decision}`, targetType: "clerk_account",
        details: { ...detail, certificationId: application.id, role: application.role, program: application.program } });
    });
    invalidateMemberDashboard();
    return;
  }
  if (input.action !== "suspend" && input.action !== "restore") throw new NetworkError(400, "Action inconnue.");
  const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress.toLowerCase();
  if (clerkId === who.clerkId || primary === process.env.TOMI_FOUNDER_EMAIL?.trim().toLowerCase())
    throw new NetworkError(400, "Le compte Founder autorisé ne peut pas être suspendu ou modifié par cette action.");
  if (input.action === "restore" && user.locked) throw new NetworkError(409, "Ce compte est verrouillé par le service d’authentification. Sa sécurité ne peut pas être contournée ici.");
  // Record intent BEFORE the external operation. If Clerk succeeds but the
  // follow-up DB write fails, the durable pending record remains investigable.
  const [intent] = await db.insert(audit).values({
    action: `founder.account.${input.action}`, targetType: "clerk_account", details: { ...detail, status: "pending" },
  }).returning();
  let applied = false;
  try {
    if (input.action === "suspend") await clerkClient.users.banUser(clerkId);
    else await clerkClient.users.unbanUser(clerkId);
    applied = true;
    await db.transaction(async tx => {
      if (member) await tx.update(profiles).set({ suspended: input.action === "suspend" }).where(eq(profiles.memberId, member.id));
      await tx.update(audit).set({ details: detail }).where(eq(audit.id, intent!.id));
    });
  } catch {
    await db.update(audit).set({ details: { ...detail, status: applied ? "provider_applied_local_pending" : "failed" } }).where(eq(audit.id, intent!.id));
    throw new NetworkError(503, applied
      ? "La restriction d’authentification a changé, mais la synchronisation locale doit être vérifiée. Consultez le journal avant toute nouvelle action."
      : "Le service d’authentification n’a pas confirmé cette action. Aucune réussite n’est annoncée.");
  } finally {
    invalidateNetworkIdentity(clerkId);
    invalidateMemberDashboard();
  }
}
export async function replyToService(who: NetworkActor, text: string, request: string) {
  const [channel] = await db.select({ id: messages.id }).from(messages)
    .where(and(eq(messages.recipientClerkId, who.clerkId), eq(messages.fromAdministration, true))).limit(1);
  if (!channel) throw new NetworkError(403, "L’administration doit d’abord ouvrir ce canal de service.");
  await db.transaction(async tx => {
    const requestId = `${who.clerkId}:reply:${request}`;
    const [reply] = await tx.insert(messages).values({
      requestId, recipientClerkId: who.clerkId, senderClerkId: who.clerkId, fromAdministration: false, text,
    }).onConflictDoNothing().returning();
    if (!reply) {
      const [existing] = await tx.select().from(messages).where(eq(messages.requestId, requestId));
      if (existing?.text !== text) throw new NetworkError(409, "Cette confirmation a déjà servi pour une autre réponse.");
      return;
    }
    await tx.update(messages).set({ readAt: new Date() })
      .where(and(eq(messages.recipientClerkId, who.clerkId), eq(messages.fromAdministration, true)));
    await tx.insert(notifications).values({
      eventKey: `service_reply:${reply.id}`, kind: "service_reply", targetClerkId: who.clerkId,
      title: "Réponse à un message administratif", occurredAt: reply.createdAt, detail: { messageId: reply.id },
    }).onConflictDoNothing();
  });
}
