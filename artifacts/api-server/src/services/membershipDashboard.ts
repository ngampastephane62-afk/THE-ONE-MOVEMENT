import { clerkClient } from "@clerk/express";
import { db, ecosystemMembersTable as members, networkProfiles, memberProfileRemindersTable as reminders, siteVisitSessionsTable as visits } from "@workspace/db";
import { missingProfileEssentials, PROFILE_REQUIREMENTS } from "@workspace/shared";
import { asc, gte, inArray, sql } from "drizzle-orm";
import type { MembershipAccount } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";

type Identity = Awaited<ReturnType<typeof clerkClient.users.getUser>>;
type Member = typeof members.$inferSelect;
type Network = typeof networkProfiles.$inferSelect;
type Reminder = typeof reminders.$inferSelect;

/** Explicit private projection. Orphaned application profiles are not accounts. */
export function accountDataset(users: Identity[], profiles: Member[], networks: Network[], states: Reminder[]): MembershipAccount[] {
  const byIdentity = new Map(profiles.map(p => [p.clerkId, p]));
  const byMember = new Map(networks.map(p => [p.memberId, p]));
  const byReminder = new Map(states.map(p => [p.clerkId, p]));
  return users.map(user => {
    const member = byIdentity.get(user.id);
    const network = member ? byMember.get(member.id) : undefined;
    const reminder = byReminder.get(user.id);
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    const missing = missingProfileEssentials(member);
    return {
      clerkId: user.id,
      name: member?.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Compte sans nom",
      email: email?.emailAddress ?? "",
      emailVerified: email?.verification?.status === "verified",
      createdAt: new Date(user.createdAt).toISOString(),
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
      profileStatus: !member ? "no_profile" : missing.length ? "incomplete" : "complete",
      missingFields: missing.map(k => PROFILE_REQUIREMENTS[k]),
      sectors: member?.activeSectors ?? [],
      networkEnabled: !!network?.enabled,
      suspended: !!network?.suspended || user.banned || user.locked,
      lastReminderAt: reminder?.acceptedAt?.toISOString() ?? null,
      reminderStatus: reminder?.status ?? null,
      remindersOptedOut: !!reminder?.optOutAt,
    };
  });
}
export function accountTotals(accounts: MembershipAccount[]) {
  return {
    accounts: accounts.length,
    noProfile: accounts.filter(a => a.profileStatus === "no_profile").length,
    incomplete: accounts.filter(a => a.profileStatus === "incomplete").length,
    complete: accounts.filter(a => a.profileStatus === "complete").length,
    active: accounts.filter(a => a.networkEnabled && !a.suspended).length,
  };
}

let snapshot: { accounts: MembershipAccount[]; refreshedAt: string; expires: number } | undefined;
let pending: Promise<NonNullable<typeof snapshot>> | undefined;
export function invalidateMemberDashboard() { snapshot = undefined; }

async function readAccounts() {
  // Clerk pagination is not a database transaction. Retry if its population
  // changes during collection; never label a truncated or duplicate list exact.
  for (let attempt = 0; attempt < 2; attempt++) {
    const identities: Identity[] = [];
    let total: number | undefined;
    let changed = false;
    for (let offset = 0; ; offset += 100) {
      const page = await clerkClient.users.getUserList({ limit: 100, offset, orderBy: "+created_at" });
      total ??= page.totalCount;
      if (total > 20_000) throw new NetworkError(503, "Le volume des comptes nécessite une synchronisation dédiée. Aucun total partiel n’est affiché.");
      if (total !== page.totalCount) { changed = true; break; }
      identities.push(...page.data);
      if (identities.length >= total) break;
      if (!page.data.length) { changed = true; break; }
    }
    if (changed || identities.length !== total || new Set(identities.map(u => u.id)).size !== total) continue;
    const ids = identities.map(u => u.id);
    const [profiles, networks, reminderStates] = ids.length ? await Promise.all([
      db.select().from(members).where(inArray(members.clerkId, ids)),
      db.select().from(networkProfiles),
      db.select().from(reminders).where(inArray(reminders.clerkId, ids)),
    ]) : [[], [], []];
    const accounts = accountDataset(identities, profiles, networks, reminderStates);
    return { accounts, refreshedAt: new Date().toISOString(), expires: Date.now() + 60_000 };
  }
  throw new NetworkError(503, "La liste des comptes évolue pendant le chargement. Actualisez ; aucun chiffre incomplet n’est présenté comme un total.");
}
export async function memberAccountSnapshot() {
  if (snapshot && snapshot.expires > Date.now()) return snapshot;
  if (!pending) pending = readAccounts().then(value => (snapshot = value)).finally(() => { pending = undefined; });
  return pending;
}

export function reminderConfiguration() {
  const from = process.env.TOMI_PROFILE_REMINDER_FROM?.trim() ?? "";
  const site = process.env.TOMI_PUBLIC_SITE_URL?.trim() ?? "";
  let validSite = false;
  try { const u = new URL(site); validSite = u.protocol === "https:" && !u.username && !u.password && u.pathname === "/" && !u.search && !u.hash; } catch { /* unset */ }
  const configured = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(from) && validSite && !!process.env.SESSION_SECRET;
  return {
    from, site,
    configured,
    message: configured
      ? "Expéditeur configuré. La connexion et le domaine Resend seront vérifiés avant chaque envoi."
      : "Envoi désactivé : configurez un expéditeur Resend vérifié et l’adresse officielle du site. La clé Resend doit également être valide.",
  };
}

export async function trafficSummary(days: number) {
  const start = new Date(); start.setUTCDate(start.getUTCDate() - days + 1);
  const since = start.toISOString().slice(0, 10);
  const [daily, first] = await Promise.all([
    db.select({ day: visits.day, sessions: sql<number>`count(*)::integer`, pageViews: sql<number>`sum(${visits.pageViews})::integer` })
      .from(visits).where(gte(visits.day, since)).groupBy(visits.day).orderBy(asc(visits.day)),
    db.select({ started: sql<Date | null>`min(${visits.firstSeenAt})` }).from(visits),
  ]);
  const begun = first[0]?.started;
  return {
    days, sessions: daily.reduce((n, d) => n + Number(d.sessions), 0),
    pageViews: daily.reduce((n, d) => n + Number(d.pageViews), 0),
    measurementStartedAt: begun ? new Date(begun).toISOString() : null,
    daily: daily.map(d => ({ ...d, sessions: Number(d.sessions), pageViews: Number(d.pageViews) })),
  };
}
