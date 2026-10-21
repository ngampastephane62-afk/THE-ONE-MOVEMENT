import {
  db, gratitudeCampaigns as campaigns, gratitudeContributions as contributions,
  gratitudeMedia as media, gratitudeComments as comments, gratitudeEngagement as engagement,
  gratitudeRateWindows as windows, networkProfiles as profiles, networkBlocks as blocks,
  ecosystemMembersTable as members, networkAudit as audit,
} from "@workspace/db";
import { and, eq, sql, type SQL } from "drizzle-orm";
import { NetworkError } from "./networkAuth";
import { rateRules } from "./gratitudePolicy";
export type GratitudeTx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export { campaigns, contributions, media, comments, engagement, profiles, members };

// Public feed and media use precisely the same visibility predicate.
export const publicStory = and(
  eq(contributions.status, "published"), eq(campaigns.status, "active"),
  sql`${contributions.approvedVersion} = ${contributions.version}`,
  sql`${contributions.publicConsentAt} IS NOT NULL`,
  sql`${contributions.rightsConfirmedAt} IS NOT NULL`,
  eq(members.isPublic, true), eq(profiles.suspended, false),
  sql`(${members.publicMedia} = true OR btrim(${contributions.body}) <> '')`,
)!;
export const notBlocked = (viewer?: number): SQL => viewer ? sql`NOT EXISTS (
  SELECT 1 FROM network_blocks b WHERE
  (b.blocker_id = ${viewer} AND b.blocked_id = ${contributions.authorId})
  OR (b.blocked_id = ${viewer} AND b.blocker_id = ${contributions.authorId})
)` : sql`true`;

export async function blockCheck(tx: GratitudeTx, viewer: number, author: number) {
  const found = await tx.select({ id: blocks.id }).from(blocks).where(sql`
    (${blocks.blockerId} = ${viewer} AND ${blocks.blockedId} = ${author})
    OR (${blocks.blockedId} = ${viewer} AND ${blocks.blockerId} = ${author})`).limit(1);
  if (found.length) throw new NetworkError(404, "This story is not available.");
}
export async function rate(tx: GratitudeTx, member: number, action: keyof typeof rateRules) {
  for (const [seconds, max] of rateRules[action]) {
    const start = new Date(Math.floor(Date.now() / (seconds * 1000)) * seconds * 1000);
    // Atomic conflict update; independent processes cannot spend the same slot.
    const rows = await tx.insert(windows).values({ memberId: member, action, windowStart: start })
      .onConflictDoUpdate({
        target: [windows.memberId, windows.action, windows.windowStart],
        set: { count: sql`${windows.count} + 1` }, setWhere: sql`${windows.count} < ${max}`,
      }).returning({ count: windows.count });
    if (!rows.length) throw new NetworkError(429, "Please wait before repeating this campaign action.");
  }
  // Short-lived counters only, not user content or decisions.
  await tx.delete(windows).where(sql`${windows.windowStart} < now() - interval '2 days'`);
}
export async function log(tx: GratitudeTx, actor: number, action: string, target: number, detail: Record<string, unknown>) {
  await tx.insert(audit).values({ actorId: actor, action: `gratitude.${action}`, targetId: target, detail: JSON.stringify(detail) });
}
export async function lockedStory(tx: GratitudeTx, id: number) {
  const [row] = await tx.select().from(contributions).where(eq(contributions.id, id)).for("update");
  if (!row) throw new NetworkError(404, "Story not found.");
  return row;
}
export async function requirePublic(tx: GratitudeTx, id: number, viewer?: number, ignoreBlocks = false) {
  const [row] = await tx.select({ story: contributions }).from(contributions)
    .innerJoin(campaigns, eq(campaigns.id, contributions.campaignId))
    .innerJoin(members, eq(members.id, contributions.authorId))
    .innerJoin(profiles, eq(profiles.memberId, members.id))
    .where(and(eq(contributions.id, id), publicStory, ignoreBlocks ? undefined : notBlocked(viewer))).limit(1);
  if (!row) throw new NetworkError(404, "This story is not publicly available.");
  return row.story;
}
export async function validateSubmission(tx: GratitudeTx, row: typeof contributions.$inferSelect) {
  if (!row.title.trim() || !row.countryCode || !row.theme) throw new NetworkError(400, "Add a title, country and theme.");
  const [campaign] = await tx.select().from(campaigns).where(eq(campaigns.id, row.campaignId)).for("share");
  if (!campaign || campaign.status !== "active") throw new NetworkError(409, "This campaign is not accepting contributions.");
  const files = await tx.select().from(media).where(eq(media.contributionId, row.id));
  if (files.some(m => m.processingStatus !== "ready")) throw new NetworkError(409, "Finish or remove every incomplete attachment.");
  if (files.length > 3 || files.some(m => m.kind === "video") && files.length !== 1) throw new NetworkError(400, "Use one video or up to three images.");
  if (!row.body.trim() && !files.some(m => m.kind === "video")) throw new NetworkError(400, "Write your gratitude message or attach a validated video.");
}

// Account state must be checked again on every read, not frozen at approval.
export const metric = (kind: string) => sql<number>`(SELECT count(*)::integer FROM gratitude_engagement e
  JOIN network_profiles p ON p.member_id=e.member_id AND p.suspended=false
  WHERE e.contribution_id=${contributions.id} AND e.kind=${kind} AND e.member_id<>${contributions.authorId})`;
export const commentMetric = sql<number>`(SELECT count(*)::integer FROM gratitude_comments c
  JOIN network_profiles p ON p.member_id=c.author_id AND p.suspended=false
  WHERE c.contribution_id=${contributions.id} AND c.hidden=false AND c.author_id<>${contributions.authorId})`;
