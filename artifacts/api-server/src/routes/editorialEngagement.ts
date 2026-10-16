import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, editorialLikes as likes, editorialComments as comments, ecosystemMembersTable as members, networkProfiles as profiles } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { UpdateVideoEngagementBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
const router = Router();
// Stable editorial IDs; no unbounded arbitrary-comment namespaces.
export const EDITORIAL_VIDEO_IDS = new Set([
  "goma", "radio-okapi", "panzi", "nyota", "movement-unity",
  "nancy-isime-nomination", "peace-award-announcement", "ciara-nomination",
  "mohombi-nomination",
  "movement-reel", "fashion-week-reel", "awards-reel",
  "goma-donation", "previous-editions", "home-reel-1", "home-reel-2", "home-reel-3",
  "fashion-archive-reel", "institutional-meeting", "impact-community",
]);
function videoId(value: unknown) {
  const id = String(value);
  if (!EDITORIAL_VIDEO_IDS.has(id)) throw new NetworkError(404, "Video not found.");
  return id;
}
async function engagement(id: string, memberId?: number, founder = false) {
  const [counts] = await db.select({ count: sql<number>`count(*)::integer` }).from(likes).where(eq(likes.videoId, id));
  const own = memberId ? await db.select({ id: likes.id }).from(likes).where(and(eq(likes.videoId, id), eq(likes.memberId, memberId))).limit(1) : [];
  const rows = await db.select({
    id: comments.id, author: members.fullName, memberId: comments.memberId, text: comments.text, createdAt: comments.createdAt,
  }).from(comments).innerJoin(members, eq(members.id, comments.memberId)).innerJoin(profiles, eq(profiles.memberId, members.id))
    .where(and(eq(comments.videoId, id), eq(comments.hidden, false), eq(profiles.suspended, false)))
    .orderBy(desc(comments.id)).limit(100);
  return { likes: counts?.count ?? 0, liked: own.length > 0, comments: rows.reverse().map(row => ({ ...row, createdAt: row.createdAt.toISOString(), canDelete: founder || row.memberId === memberId })) };
}
router.get("/editorial/videos/:videoId/engagement", async (req, res, next) => {
  const complete = async () => {
    try {
      const who = res.locals.actor;
      res.set("Cache-Control", "no-store").json(await engagement(videoId(req.params.videoId), who?.member?.id, who?.founder));
    } catch (error) { next(error); }
  };
  if (getAuth(req).userId) return void networkAuth(req, res, complete);
  await complete();
});
router.post("/editorial/videos/:videoId/engagement", networkAuth, networkWrite, async (req, res) => {
  const id = videoId(req.params.videoId), who = actor(res, false);
  const parsed = UpdateVideoEngagementBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid video action.");
  const input = parsed.data;
  if (input.action === "like") {
    if (typeof input.accepted !== "boolean") throw new NetworkError(400, "Choose like or unlike.");
    if (input.accepted) await db.insert(likes).values({ videoId: id, memberId: who.member.id }).onConflictDoNothing();
    else await db.delete(likes).where(and(eq(likes.videoId, id), eq(likes.memberId, who.member.id)));
  } else if (input.action === "comment") {
    const text = (input.text ?? "").trim();
    if (!text || text.length > 1500) throw new NetworkError(400, "Write a comment of 1–1,500 characters.");
    await db.insert(comments).values({ videoId: id, memberId: who.member.id, text });
  } else {
    if (!Number.isSafeInteger(input.id) || input.id! < 1) throw new NetworkError(400, "Choose a valid comment.");
    if (input.action === "moderate") requireFounder(res);
    const [row] = await db.select().from(comments).where(and(eq(comments.id, input.id!), eq(comments.videoId, id)));
    if (!row || row.memberId !== who.member.id && !who.founder) throw new NetworkError(404, "Your comment was not found.");
    await db.update(comments).set({ hidden: true }).where(eq(comments.id, row.id));
  }
  res.json(await engagement(id, who.member.id, who.founder));
});
export default router;
