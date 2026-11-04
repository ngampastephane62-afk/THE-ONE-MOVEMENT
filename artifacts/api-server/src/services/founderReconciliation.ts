import {
  db, founderAccountObservations as observations, founderControlSettings as settings,
  founderNotifications as notifications, ecosystemMembersTable as members,
  networkCertifications as certs, networkReports as reports, joinInterestsTable as joins,
  institutionalInquiriesTable as inquiries, professionalBusinesses as businesses,
} from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { memberAccountSnapshot } from "./membershipDashboard";
import { registrationEvents } from "./founderControlPolicy";
import { logger } from "../lib/logger";

let pending: Promise<void> | undefined;
export async function reconcileFounderEvents() {
  if (pending) return pending;
  pending = reconcile().finally(() => { pending = undefined; });
  return pending;
}
async function reconcile() {
  // A durable installation baseline prevents a flood of historical announcements.
  await db.insert(settings).values({ key: "__baseline" }).onConflictDoNothing();
  const [baseline] = await db.select().from(settings).where(eq(settings.key, "__baseline"));
  const snapshot = await memberAccountSnapshot();
  await db.transaction(async tx => {
    // Serialize observers from different autoscale workers, not merely this process.
    const locked = await tx.execute(sql`SELECT pg_try_advisory_xact_lock(19087412) AS locked`);
    if (!locked.rows[0]?.locked) return;
    const prior = new Map((await tx.select().from(observations)).map(row => [row.clerkId, row]));
    const profiles = new Map((await tx.select().from(members)).map(row => [row.clerkId, row]));
    for (const account of snapshot.accounts) {
      const previous = prior.get(account.clerkId);
      for (const kind of registrationEvents(account, previous, baseline!.createdAt)) {
        const profile = profiles.get(account.clerkId);
        const title = kind === "registration" ? "NEW MEMBER JOINED THE ONE MOVEMENT"
          : kind === "email_verified" ? "Adresse email vérifiée" : "Profil complété";
        await tx.insert(notifications).values({
          eventKey: `${kind}:${account.clerkId}`, kind, title, targetClerkId: account.clerkId,
          occurredAt: kind === "registration" ? new Date(account.createdAt) : new Date(),
          detail: { name: account.name, emailVerified: account.emailVerified, registeredAt: account.createdAt,
            country: profile?.country ?? "", sectors: account.sectors },
        }).onConflictDoNothing();
      }
      await tx.insert(observations).values({ clerkId: account.clerkId, verified: account.emailVerified, complete: account.profileStatus === "complete" })
        .onConflictDoUpdate({ target: observations.clerkId, set: { verified: account.emailVerified, complete: account.profileStatus === "complete", observedAt: new Date() } });
    }
    const byMember = new Map([...profiles.values()].map(p => [p.id, p.clerkId]));
    // A transaction owns one pg connection; avoid concurrent query dispatch.
    const applications = await tx.select().from(certs).where(gte(certs.createdAt, baseline!.createdAt));
    const flags = await tx.select().from(reports).where(gte(reports.createdAt, baseline!.createdAt));
    const requests = await tx.select().from(joins).where(gte(joins.createdAt, baseline!.createdAt));
    const institutional = await tx.select().from(inquiries).where(gte(inquiries.createdAt, baseline!.createdAt));
    const commercial = await tx.select().from(businesses).where(gte(businesses.submittedAt, baseline!.createdAt));
    for (const c of applications) await tx.insert(notifications).values({
      eventKey: `certification:${c.id}`, kind: "certification", title: "Demande de certification officielle",
      targetClerkId: byMember.get(c.memberId) ?? null, occurredAt: c.createdAt, detail: { applicationId: c.id, role: c.role, program: c.program },
    }).onConflictDoNothing();
    for (const r of flags) await tx.insert(notifications).values({
      eventKey: `report:${r.id}`, kind: "report", title: "Nouveau signalement à examiner",
      targetClerkId: r.memberId ? byMember.get(r.memberId) ?? null : null, occurredAt: r.createdAt,
      detail: { reportId: r.id, postId: r.postId },
    }).onConflictDoNothing();
    for (const [source, rows] of [["join", requests], ["inquiry", institutional], ["business", commercial]] as const) {
      for (const r of rows) await tx.insert(notifications).values({
        eventKey: `request:${source}:${"id" in r ? r.id : r.memberId}`, kind: "request",
        title: "Demande administrative à examiner", occurredAt: "createdAt" in r ? r.createdAt : r.submittedAt,
        detail: { source, recordId: "id" in r ? r.id : r.memberId },
      }).onConflictDoNothing();
    }
  });
}
let started = false;
export function startFounderObserver() {
  if (started) return;
  started = true;
  const observe = () => reconcileFounderEvents().catch(() => {
    logger.warn("Founder event reconciliation unavailable; private command center reports the failure and retries. No fallback totals.");
  });
  void observe();
  setInterval(() => { void observe(); }, 60_000).unref();
}
