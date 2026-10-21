import { db, gratitudeReports as reports } from "@workspace/db";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import {
  contributions, campaigns, media, comments, profiles, members, engagement,
  publicStory, notBlocked, metric, commentMetric,
} from "./gratitudeStore";
import { countries } from "./gratitudePolicy";

type Reader = { memberId?: number; founder?: boolean; scope: "public" | "owner" | "founder" };
type Filters = { country?: string; continent?: string; campaign?: number; author?: number; sort?: string; id?: number };
export async function readGratitude(page: number, reader: Reader, filters: Filters = {}) {
  const conditions: (SQL | undefined)[] = [];
  if (reader.scope === "public") conditions.push(publicStory, notBlocked(reader.memberId));
  if (reader.scope === "owner") conditions.push(eq(contributions.authorId, reader.memberId!));
  if (reader.scope === "founder") conditions.push(
    sql`${contributions.status} <> 'draft' AND ${contributions.submittedAt} IS NOT NULL`,
  );
  if (filters.id) conditions.push(eq(contributions.id, filters.id));
  if (filters.country) conditions.push(eq(contributions.countryCode, filters.country));
  if (filters.continent) conditions.push(inArray(contributions.countryCode, [...countries.values()].filter(c => c.continent === filters.continent).map(c => c.code)));
  if (filters.campaign) conditions.push(eq(contributions.campaignId, filters.campaign));
  if (filters.author) conditions.push(eq(contributions.authorId, filters.author));
  if (filters.sort === "featured") conditions.push(eq(contributions.featured, true));
  const sort = filters.sort === "views" ? metric("view") : filters.sort === "likes" ? metric("like") : filters.sort === "discussed" ? commentMetric : reader.scope === "public" ? contributions.publishedAt : contributions.updatedAt;
  const rows = await db.select({
    story: contributions, campaignName: campaigns.name, authorName: members.fullName,
    publicProfile: members.isPublic, publicMedia: members.publicMedia, suspended: profiles.suspended,
    views: metric("view"), likes: metric("like"), discussion: commentMetric, shareIntents: metric("share_intent"),
    commentCount: sql<number>`(SELECT count(*)::integer FROM gratitude_comments gc JOIN network_profiles np ON np.member_id=gc.author_id AND np.suspended=false WHERE gc.contribution_id=${contributions.id} AND gc.hidden=false)`,
    liked: reader.memberId ? sql<boolean>`EXISTS (SELECT 1 FROM gratitude_engagement ge WHERE ge.contribution_id=${contributions.id} AND ge.kind='like' AND ge.member_id=${reader.memberId})` : sql<boolean>`false`,
  }).from(contributions)
    .innerJoin(campaigns, eq(campaigns.id, contributions.campaignId))
    .innerJoin(members, eq(members.id, contributions.authorId))
    .innerJoin(profiles, eq(profiles.memberId, contributions.authorId))
    .where(and(...conditions)).orderBy(desc(sort), desc(contributions.id)).limit(21).offset((page - 1) * 20);
  const ids = rows.slice(0, 20).map(r => r.story.id);
  const files = ids.length ? await db.select().from(media).where(inArray(media.contributionId, ids)).orderBy(media.position) : [];
  const replies = filters.id ? await db.select({
    id: comments.id, authorId: comments.authorId, authorName: members.fullName, body: comments.body,
    createdAt: comments.createdAt, publicProfile: members.isPublic, hidden: comments.hidden,
  }).from(comments).innerJoin(members, eq(members.id, comments.authorId))
    .innerJoin(profiles, eq(profiles.memberId, comments.authorId))
    .where(and(eq(comments.contributionId, filters.id),
      reader.scope === "founder" ? undefined : eq(comments.hidden, false),
      reader.scope === "founder" ? undefined : eq(profiles.suspended, false),
      reader.memberId && reader.scope !== "founder" ? sql`NOT EXISTS (SELECT 1 FROM network_blocks b WHERE (b.blocker_id=${reader.memberId} AND b.blocked_id=${comments.authorId}) OR (b.blocked_id=${reader.memberId} AND b.blocker_id=${comments.authorId}))` : undefined))
    .orderBy(desc(comments.id)).limit(100) : [];
  return {
    page, hasMore: rows.length > 20,
    items: rows.slice(0, 20).map(({ story: s, ...r }) => {
      const country = countries.get(s.countryCode ?? "");
      return {
        id: s.id, authorId: s.authorId, authorName: r.authorName, campaignId: s.campaignId, campaignName: r.campaignName,
        title: s.title, body: s.body, countryCode: s.countryCode, countryName: country?.name ?? "",
        region: country?.region ?? "", continent: country?.continent ?? "", theme: s.theme,
        status: s.status, version: s.version, featured: s.featured, decisionReason: reader.scope === "public" ? "" : s.decisionReason,
        profileEligible: r.publicProfile && !r.suspended && (r.publicMedia || !!s.body.trim()),
        publishedAt: s.publishedAt?.toISOString() ?? null, updatedAt: s.updatedAt.toISOString(),
        media: reader.scope === "public" && !r.publicMedia ? [] : files.filter(m => m.contributionId === s.id).map(m => ({
          id: m.id, uploadId: m.originalUploadId, kind: m.kind, status: m.processingStatus,
          // Never emit an original file path or a signed read URL.
          url: m.processingStatus === "ready" && m.playbackUploadId ? `/api/gratitude/media/${m.playbackUploadId}` : null,
          thumbnailUrl: m.processingStatus === "ready" && m.thumbnailUploadId ? `/api/gratitude/media/${m.thumbnailUploadId}` : null,
          durationMs: m.durationMs, altText: m.altText,
        })),
        views: r.views, likes: r.likes, commentCount: r.commentCount, shareIntents: r.shareIntents, liked: r.liked,
        comments: replies.map(c => ({
          id: c.id, authorId: c.publicProfile || c.authorId === reader.memberId || reader.scope === "founder" ? c.authorId : 0,
          authorName: c.publicProfile || c.authorId === reader.memberId || reader.scope === "founder" ? c.authorName : "TOMI member",
          body: c.body, createdAt: c.createdAt.toISOString(), hidden: c.hidden,
        })).reverse(),
      };
    }),
  };
}
export async function founderGratitude(page: number, memberId: number) {
  const [stories, allCampaigns, openReports] = await Promise.all([
    readGratitude(page, { scope: "founder", founder: true, memberId }),
    db.select().from(campaigns).orderBy(campaigns.id),
    db.select({ id: reports.id, contributionId: reports.contributionId, commentId: reports.commentId, reason: reports.reason })
      .from(reports).where(eq(reports.status, "open")).orderBy(desc(reports.id)).limit(100),
  ]);
  return { ...stories, campaigns: allCampaigns.map(c => ({ id: c.id, parentId: c.parentId, slug: c.slug, name: c.name, description: c.description, status: c.status, identity: c.identity })), reports: openReports };
}
