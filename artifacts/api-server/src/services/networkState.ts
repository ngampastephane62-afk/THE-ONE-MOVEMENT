import {
  db, ecosystemMembersTable as members, networkProfiles as profiles, networkUploads as uploads,
  networkPosts as posts, networkComments as comments, networkFollows as follows,
  networkLikes as likes, networkViews as views, networkBlocks as blocks,
  networkThreads as threads, networkMessages as messages,
  networkCertifications as certifications, networkReports as reports,
} from "@workspace/db";
import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import type { NetworkMember, NetworkPost, NetworkState } from "@workspace/api-zod";
import { type NetworkActor, NetworkError } from "./networkAuth";
import { catalog, DOCUMENTS, stripeReady } from "./networkPayments";
import { mediaDto } from "./networkFiles";

export const ROLES = new Set(["business", "partner", "sponsor", "media-partner", "official-model", "exhibitor", "speaker", "designer", "investor"]);
export const PROGRAMS = new Set(["ecosystem", "diplomatic-gala", "summit", "fashion-week", "awards", "fashion-night", "investment-forum"]);
export async function qualifiedInviteCount(memberId: number) {
  const [count] = await db.select({ value: sql<number>`count(*)::integer` }).from(profiles)
    .innerJoin(follows, and(eq(follows.followerId, profiles.memberId), eq(follows.followingId, memberId)))
    .where(and(eq(profiles.referredBy, memberId), eq(profiles.enabled, true), eq(profiles.suspended, false)));
  return count?.value ?? 0;
}
export function activeBadge(row: typeof certifications.$inferSelect) {
  if (row.status !== "approved" || (row.expiresAt && row.expiresAt.getTime() <= Date.now())) return false;
  const commercial = ["partner", "sponsor", "designer", "exhibitor"].includes(row.role);
  return !commercial || (row.agreementConfirmed && row.paymentConfirmed);
}
export async function isBlocked(a: number, b: number) {
  const [row] = await db.select({ id: blocks.id }).from(blocks).where(or(
    and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)),
    and(eq(blocks.blockerId, b), eq(blocks.blockedId, a)),
  )).limit(1);
  return !!row;
}
export async function visibleMember(id: number, viewerId: number) {
  const [row] = await db.select({ member: members }).from(members).innerJoin(profiles, eq(members.id, profiles.memberId))
    .where(and(eq(members.id, id), eq(profiles.enabled, true), eq(profiles.suspended, false))).limit(1);
  if (!row || (id !== viewerId && await isBlocked(id, viewerId))) throw new NetworkError(404, "This profile is not available.");
  return row.member;
}
export async function visiblePost(id: number, viewerId: number) {
  const [row] = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.hidden, false))).limit(1);
  if (!row) throw new NetworkError(404, "This publication is not available.");
  await visibleMember(row.authorId, viewerId);
  return row;
}
export async function ownThread(id: number, memberId: number) {
  const [row] = await db.select().from(threads).where(and(eq(threads.id, id), or(eq(threads.memberA, memberId), eq(threads.memberB, memberId)))).limit(1);
  if (!row) throw new NetworkError(404, "Conversation not found.");
  if (await isBlocked(row.memberA, row.memberB)) throw new NetworkError(403, "This conversation is unavailable while a member is blocked.");
  await visibleMember(row.memberA === memberId ? row.memberB : row.memberA, memberId);
  return row;
}
export async function networkState(context: NetworkActor, query: Record<string, unknown>): Promise<NetworkState> {
  const empty: NetworkState = {
    me: null, founder: null, members: [], posts: [], nextCursor: null, person: null,
    threads: [], messages: [], certifications: [], reports: [], packages: [], documents: [], stripeReady, growth: null,
  };
  const self = context.member;
  if (!self) return empty;
  const rows = await db.select({ member: members, profile: profiles }).from(members)
    .innerJoin(profiles, eq(members.id, profiles.memberId))
    .where(or(eq(profiles.enabled, true), eq(members.id, self.id))).limit(2000);
  const blockedRows = await db.select().from(blocks).where(or(eq(blocks.blockerId, self.id), eq(blocks.blockedId, self.id)));
  const blockedIds = new Set(blockedRows.map(b => b.blockerId === self.id ? b.blockedId : b.blockerId));
  const myBlocks = new Set(blockedRows.filter(b => b.blockerId === self.id).map(b => b.blockedId));
  const allFollows = await db.select().from(follows).limit(100_000);
  const certs = await db.select().from(certifications).where(context.founder ? undefined :
    or(eq(certifications.memberId, self.id), eq(certifications.status, "approved"))).orderBy(desc(certifications.id)).limit(2000);
  const usableRows = rows.filter(r => context.founder || !r.profile.suspended || r.member.id === self.id);
  const eligible = usableRows.filter(r => r.member.id === self.id || (!r.profile.suspended && !blockedIds.has(r.member.id)));
  const eligibleIds = eligible.map(r => r.member.id);
  const followedIds = allFollows.filter(f => f.followerId === self.id).map(f => f.followingId);
  const targetId = Number(query.person) || null;
  const before = Number(query.before) || null;
  const postFilters = [
    eq(posts.hidden, false),
    inArray(posts.authorId, eligibleIds.length ? eligibleIds : [-1]),
  ];
  if (targetId) postFilters.push(eq(posts.authorId, targetId));
  if (before) postFilters.push(lt(posts.id, before));
  if (query.feed === "following") postFilters.push(inArray(posts.authorId, followedIds.length ? followedIds : [-1]));
  if (query.feed === "business" || query.feed === "reel") postFilters.push(eq(posts.kind, String(query.feed)));
  const myProfile = rows.find(r => r.member.id === self.id)?.profile;
  const postRows = await db.select().from(posts).where(and(...postFilters)).orderBy(desc(posts.id)).limit(31);
  const page = postRows.slice(0, 30);
  const postIds = page.map(p => p.id);
  const [likeRows, viewRows, commentRows] = postIds.length ? await Promise.all([
    db.select().from(likes).where(inArray(likes.postId, postIds)),
    db.select().from(views).where(inArray(views.postId, postIds)),
    db.select().from(comments).where(inArray(comments.postId, postIds)).orderBy(desc(comments.id)).limit(1000),
  ]) : [[], [], []];
  const neededMedia = new Set([
    ...eligible.flatMap(r => [r.profile.avatarId, r.profile.coverId].filter((x): x is string => !!x)),
    ...page.flatMap(p => p.mediaIds),
    ...certs.filter(c => context.founder || c.memberId === self.id).flatMap(c => c.evidenceIds),
  ]);
  const mediaRows = neededMedia.size ? await db.select().from(uploads).where(and(eq(uploads.ready, true), inArray(uploads.id, [...neededMedia]))) : [];
  const media = new Map(mediaRows.map(u => [u.id, mediaDto(u)]));
  const dto = new Map<number, NetworkMember>();
  for (const { member: m, profile: p } of usableRows) {
    const badges = certs.filter(c => c.memberId === m.id && activeBadge(c)).map(c => ({
      role: c.role, program: c.program, expiresAt: c.expiresAt?.toISOString() ?? null,
    }));
    dto.set(m.id, {
      id: m.id, fullName: m.fullName, profession: m.profession, organization: m.organization,
      country: m.country, bio: m.bio, offering: m.offering, lookingFor: m.lookingFor, website: m.website,
      instagramUrl: m.instagramUrl, facebookUrl: m.facebookUrl, tiktokUrl: m.tiktokUrl, linkedinUrl: m.linkedinUrl,
      sectors: m.sectors as NetworkMember["sectors"], isPublic: m.isPublic, enabled: p.enabled, founder: p.founder,
      avatarUrl: p.avatarId ? media.get(p.avatarId)?.url ?? null : null,
      coverUrl: p.coverId ? media.get(p.coverId)?.url ?? null : null,
      profileLayout: m.profileLayout, coverPosition: m.coverPosition, postsLayout: m.postsLayout,
      followers: allFollows.filter(f => f.followingId === m.id).length,
      following: allFollows.filter(f => f.followerId === m.id).length,
      followed: followedIds.includes(m.id), blocked: myBlocks.has(m.id), badges, suspended: p.suspended,
    });
  }
  const me = dto.get(self.id)!;
  if (!me) return empty;
  const qualifiedInvites = await qualifiedInviteCount(self.id);
  const growth = {
    inviteCode: myProfile!.inviteCode, qualifiedInvites, requiredInvites: 10,
    canPost: me.enabled && (context.founder || qualifiedInvites >= 10),
  };
  const q = String(query.q ?? "").trim().slice(0, 100).toLowerCase();
  const roleTerms: Record<string, string[]> = {
    stylist: ["stylist", "styliste", "designer", "couturi", "modéliste", "tailor"],
    model: ["model", "modèle", "mannequin", "runway", "défilé"],
    photographer: ["photograph", "photographe", "photography", "photographie"],
    influencer: ["influenc", "content creator", "créateur de contenu", "créatrice de contenu"],
  };
  const searchTerms = roleTerms[q] ?? [q];
  const sector = String(query.sector ?? "");
  const connectionIds = query.connections && targetId ? new Set(allFollows
    .filter(f => query.connections === "followers" ? f.followingId === targetId : f.followerId === targetId)
    .map(f => query.connections === "followers" ? f.followerId : f.followingId)) : null;
  // An unavailable target must not reveal its relationships through this filter.
  const connectionTargetVisible = !query.connections || (!!targetId && eligibleIds.includes(targetId));
  const memberList = (context.founder && !query.connections ? usableRows : eligible).filter(r => r.profile.enabled && connectionTargetVisible &&
    (!query.connections || connectionIds?.has(r.member.id))).map(r => dto.get(r.member.id)!)
    .filter(m => (!sector || m.sectors.includes(sector as NetworkMember["sectors"][number])) &&
      (!q || searchTerms.some(term => [m.fullName, m.profession, m.organization, m.country, m.bio, m.offering, m.lookingFor].join(" ").toLowerCase().includes(term))));
  const postDtos: NetworkPost[] = page.filter(p => dto.has(p.authorId)).map(p => ({
    id: p.id, author: dto.get(p.authorId)!, text: p.text, kind: p.kind, createdAt: p.createdAt.toISOString(),
    edited: p.updatedAt.getTime() > p.createdAt.getTime(),
    media: p.mediaIds.flatMap(id => media.has(id) ? [media.get(id)!] : []),
    likes: likeRows.filter(l => l.postId === p.id).length,
    views: viewRows.filter(v => v.postId === p.id).length,
    liked: likeRows.some(l => l.postId === p.id && l.memberId === self.id),
    comments: commentRows.filter(c => c.postId === p.id && dto.has(c.authorId) && !blockedIds.has(c.authorId)).slice(0, 30).reverse()
      .map(c => ({ id: c.id, author: dto.get(c.authorId)!, text: c.text, createdAt: c.createdAt.toISOString() })),
  }));
  const ownThreads = await db.select().from(threads).where(or(eq(threads.memberA, self.id), eq(threads.memberB, self.id))).orderBy(desc(threads.updatedAt)).limit(100);
  const allowedThreads = ownThreads.filter(t => {
    const other = t.memberA === self.id ? t.memberB : t.memberA;
    return dto.has(other) && !blockedIds.has(other) && dto.get(other)?.enabled;
  });
  const threadIds = allowedThreads.map(t => t.id);
  const threadMessages = threadIds.length ? await db.select().from(messages).where(inArray(messages.threadId, threadIds)).orderBy(desc(messages.id)).limit(5000) : [];
  const selectedThread = Number(query.thread) || null;
  if (selectedThread && !allowedThreads.some(t => t.id === selectedThread)) throw new NetworkError(404, "Conversation not found.");
  const canInvestor = context.founder || certs.some(c => c.memberId === self.id && c.role === "investor" && activeBadge(c));
  const reportRows = context.founder ? await db.select().from(reports).orderBy(desc(reports.id)).limit(100) : [];
  return {
    growth,
    me, founder: [...dto.values()].find(m => m.founder && m.enabled && !blockedIds.has(m.id)) ?? null,
    members: memberList.slice(0, 200), person: targetId && !blockedIds.has(targetId) ? dto.get(targetId) ?? null :
      targetId && myBlocks.has(targetId) ? dto.get(targetId) ?? null : null,
    posts: postDtos, nextCursor: postRows.length > 30 ? page.at(-1)!.id : null,
    threads: allowedThreads.map(t => ({
      id: t.id, other: dto.get(t.memberA === self.id ? t.memberB : t.memberA)!,
      accepted: t.accepted, declined: t.declined, requestedByMe: t.requestedBy === self.id, updatedAt: t.updatedAt.toISOString(),
      lastMessage: threadMessages.find(m => m.threadId === t.id)?.text.slice(0, 200) ?? "",
      unread: threadMessages.filter(m => m.threadId === t.id && m.senderId !== self.id && !m.read).length,
    })),
    messages: selectedThread ? threadMessages.filter(m => m.threadId === selectedThread).slice(0, 100).reverse().map(m => ({
      id: m.id, senderId: m.senderId, text: m.text, read: m.read, createdAt: m.createdAt.toISOString(),
    })) : [],
    certifications: certs.filter(c => (context.founder || c.memberId === self.id) && dto.has(c.memberId)).map(c => ({
      id: c.id, member: dto.get(c.memberId)!, role: c.role, program: c.program, packageSlug: c.packageSlug,
      note: c.note, status: c.status, decisionNote: c.decisionNote, agreementConfirmed: c.agreementConfirmed,
      paymentConfirmed: c.paymentConfirmed, createdAt: c.createdAt.toISOString(), expiresAt: c.expiresAt?.toISOString() ?? null,
      evidence: c.evidenceIds.flatMap(id => media.has(id) ? [media.get(id)!] : []),
    })),
    reports: reportRows.map(r => ({ id: r.id, reporter: dto.get(r.reporterId)?.fullName ?? "Member", postId: r.postId, memberId: r.memberId, reason: r.reason, resolved: r.resolved })),
    packages: await catalog(), stripeReady,
    documents: DOCUMENTS.map(d => ({ ...d, url: `/api/network/documents/${d.slug}`, accessible: !d.restricted || canInvestor })),
  };
}
