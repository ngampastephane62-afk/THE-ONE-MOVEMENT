import { clerkClient } from "@clerk/express";
import {
  db, ecosystemMembersTable as members, networkProfiles as profiles, networkPosts as posts,
  networkCertifications as certs, networkReports as reports, institutionalInquiriesTable as inquiries,
  professionalBusinesses as businesses, joinInterestsTable as joins, founderNotifications as notifications,
  founderControlSettings as settings, founderServiceMessages as messages, auditLogTable as audit, memberProfileRemindersTable as reminders,
} from "@workspace/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { FounderAdminMember, FounderCommandOverview, FounderSectorDetail, FounderServiceMessage } from "@workspace/api-zod";
import { accountDataset, memberAccountSnapshot } from "./membershipDashboard";
import { NetworkError } from "./networkAuth";
import { isBlocked } from "./networkState";
import { ADMIN_SECTORS, commandTotals, publishedPostCount, FOUNDER_NOTIFICATION_KINDS } from "./founderControlPolicy";
import { reconcileFounderEvents } from "./founderReconciliation";

export const serviceMessageDto = (r: typeof messages.$inferSelect): FounderServiceMessage => ({
  id: r.id, text: r.text, fromAdministration: r.fromAdministration, createdAt: r.createdAt.toISOString(), readAt: r.readAt?.toISOString() ?? null,
});
export const certificationDto = (c: typeof certs.$inferSelect) => ({
  id: c.id, role: c.role, program: c.program, status: c.status, note: c.note,
  agreementConfirmed: c.agreementConfirmed, paymentConfirmed: c.paymentConfirmed, expiresAt: c.expiresAt?.toISOString() ?? null,
});
export async function founderPreferences(clerkId: string) {
  await db.insert(settings).values({ key: clerkId, enabledKinds: [...FOUNDER_NOTIFICATION_KINDS] }).onConflictDoNothing();
  const [row] = await db.select().from(settings).where(eq(settings.key, clerkId));
  return row!;
}
async function commandDataset() {
  const snapshot = await memberAccountSnapshot();
  const [allMembers, allPosts, allCerts, allReports] = await Promise.all([
    db.select().from(members), db.select().from(posts), db.select().from(certs), db.select().from(reports),
  ]);
  const accountsByClerk = new Map(snapshot.accounts.map(a => [a.clerkId, a]));
  const memberAccounts = new Map(allMembers.filter(m => accountsByClerk.has(m.clerkId)).map(m => [m.id, accountsByClerk.get(m.clerkId)!]));
  const visiblePosts = allPosts.filter(p => !p.hidden && (p.visibility === "community" || p.visibility === "sector") && !memberAccounts.get(p.authorId)?.suspended);
  const sectors = ADMIN_SECTORS.map(slug => {
    const participants = snapshot.accounts.filter(a => a.sectors.includes(slug));
    const participantIds = new Set([...memberAccounts].filter(([, a]) => a.sectors.includes(slug)).map(([id]) => id));
    const activity = visiblePosts.filter(p => participantIds.has(p.authorId) || p.visibilitySector === slug);
    const postIds = new Set(activity.map(p => p.id));
    return {
      slug, participants: participants.length, newMembers: participants.filter(a => Date.parse(a.createdAt) >= Date.now() - 7 * 86400000).length,
      posts: activity.length, pendingCertifications: allCerts.filter(c => c.status === "pending" && participantIds.has(c.memberId)).length,
      pendingReports: allReports.filter(r => !r.resolved && ((r.memberId && participantIds.has(r.memberId)) || (r.postId && postIds.has(r.postId)))).length,
    };
  });
  return { snapshot, allMembers, allPosts, allCerts, allReports, visiblePosts, memberAccounts, sectors };
}
export async function founderOverview(clerkId: string): Promise<FounderCommandOverview> {
  await reconcileFounderEvents();
  const [data, prefs, baseline, events, inquiryCount, commercialCount, joinCount] = await Promise.all([
    commandDataset(), founderPreferences(clerkId), db.select().from(settings).where(eq(settings.key, "__baseline")),
    db.select().from(notifications).orderBy(desc(notifications.id)),
    db.select({ n: sql<number>`count(*)::integer` }).from(inquiries).where(and(eq(inquiries.status, "new"), eq(inquiries.consentTextVersion, "tropik-media-request-v1"))),
    db.select({ n: sql<number>`count(*)::integer` }).from(businesses).where(eq(businesses.status, "pending")),
    db.select({ n: sql<number>`count(*)::integer` }).from(joins).where(eq(joins.status, "pending")),
  ]);
  const shown = events.filter(e => prefs.enabledKinds.includes(e.kind));
  return {
    environment: process.env.REPLIT_DEPLOYMENT === "1" ? "production" : "development", refreshedAt: data.snapshot.refreshedAt,
    initializedAt: baseline[0]!.createdAt.toISOString(),
    totals: { ...commandTotals(data.snapshot.accounts), posts: publishedPostCount(data.allPosts),
      pendingCertifications: data.allCerts.filter(c => c.status === "pending").length,
      pendingReports: data.allReports.filter(r => !r.resolved).length,
      mediaInquiries: inquiryCount[0]!.n,
      commercialApplications: commercialCount[0]!.n + data.allCerts.filter(c => c.status === "pending" && ["partner", "sponsor", "designer", "exhibitor"].includes(c.role)).length,
      administrativeRequests: joinCount[0]!.n },
    sectors: data.sectors, enabledKinds: prefs.enabledKinds, unread: shown.filter(e => e.id > prefs.readThrough).length,
    notifications: shown.slice(0, 100).map(e => ({
      id: e.id, kind: e.kind, title: e.title, targetClerkId: e.targetClerkId, detail: e.detail, occurredAt: e.occurredAt.toISOString(),
    })),
  };
}
export async function founderAccount(clerkId: string, founderMemberId: number): Promise<FounderAdminMember> {
  let user;
  try { user = await clerkClient.users.getUser(clerkId); } catch (e) {
    if ((e as { status?: number }).status === 404) throw new NetworkError(404, "Compte introuvable dans le service d’authentification.");
    throw new NetworkError(503, "Le service d’authentification ne peut pas confirmer ce compte.");
  }
  const [member] = await db.select().from(members).where(eq(members.clerkId, clerkId));
  const [network] = member ? await db.select().from(profiles).where(eq(profiles.memberId, member.id)) : [];
  const [certificates, log, service, reminder] = await Promise.all([
    member ? db.select().from(certs).where(eq(certs.memberId, member.id)) : [],
    db.select().from(audit).where(and(eq(audit.targetType, "clerk_account"), sql`${audit.details}->>'targetClerkId' = ${clerkId}`)).orderBy(desc(audit.id)).limit(100),
    db.select().from(messages).where(eq(messages.recipientClerkId, clerkId)).orderBy(desc(messages.id)).limit(100),
    db.select().from(reminders).where(eq(reminders.clerkId, clerkId)),
  ]);
  const profile: Record<string, string> = {};
  if (member) for (const key of ["fullName", "profession", "organization", "accountType", "organizationType", "contactName", "country", "cityRegion",
    "locationVisibility", "otherProfessionalActivity", "bio", "offering", "lookingFor", "website", "instagramUrl", "linkedinUrl", "facebookUrl", "tiktokUrl"] as const) {
    profile[key] = String(member[key] ?? "");
  }
  const blocked = member ? await isBlocked(founderMemberId, member.id) : true;
  return {
    account: accountDataset([user], member ? [member] : [], network ? [network] : [], reminder)[0]!,
    memberId: member?.id ?? null, profile, discoverable: !!network?.enabled && !network.suspended && !user.banned && !user.locked,
    publicProfile: !!member?.isPublic && !network?.suspended && !user.banned && !user.locked, banned: user.banned, locked: user.locked,
    lastActivityAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
    followAllowed: !!network?.enabled && !network.suspended && !user.banned && !user.locked && !blocked && member!.id !== founderMemberId,
    certifications: certificates.map(certificationDto), serviceMessages: service.reverse().map(serviceMessageDto),
    audit: log.map(r => {
      const d = r.details as Record<string, unknown> | null;
      return { id: r.id, action: r.action, actor: String(d?.actorClerkId ?? ""), reason: String(d?.reason ?? ""), status: String(d?.status ?? "recorded"), createdAt: r.createdAt.toISOString() };
    }),
  };
}
export async function founderSector(slug: string): Promise<FounderSectorDetail> {
  if (!ADMIN_SECTORS.includes(slug as typeof ADMIN_SECTORS[number])) throw new NetworkError(404, "Secteur inconnu.");
  const d = await commandDataset();
  const accounts = d.snapshot.accounts.filter(a => a.sectors.includes(slug));
  const ids = new Set([...d.memberAccounts].filter(([, a]) => a.sectors.includes(slug)).map(([id]) => id));
  return {
    summary: d.sectors.find(s => s.slug === slug)!, accounts,
    activity: d.visiblePosts.filter(p => ids.has(p.authorId) || p.visibilitySector === slug).sort((a, b) => b.id - a.id).slice(0, 100)
      .map(p => ({ id: p.id, authorId: p.authorId, text: p.text, kind: p.kind, createdAt: p.createdAt.toISOString() })),
    certifications: d.allCerts.filter(c => ids.has(c.memberId)).map(certificationDto),
    reports: d.sectors.find(s => s.slug === slug)!.pendingReports,
  };
}
