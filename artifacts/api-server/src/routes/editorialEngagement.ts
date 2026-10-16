import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, editorialLikes as likes, editorialComments as comments, ecosystemMembersTable as members, networkProfiles as profiles } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { UpdateVideoEngagementBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { editorialPhotoId } from "../services/editorialMedia";
import { objectFile } from "../services/networkFiles";
import { sendBufferedVideo } from "../services/bufferedVideo";
const router = Router();
// Stable editorial IDs; no unbounded arbitrary-comment namespaces.
export const EDITORIAL_VIDEO_IDS = new Set([
  "goma", "radio-okapi", "panzi", "nyota", "movement-unity",
  "nancy-isime-nomination", "peace-award-announcement", "ciara-nomination",
  "mohombi-nomination",
  "movement-reel", "fashion-week-reel", "awards-reel",
  "goma-donation", "previous-editions", "home-reel-1", "home-reel-2", "home-reel-3",
  "fashion-archive-reel", "institutional-meeting", "impact-community",
  "pink-october-burj-khalifa",
  "home-we-are-one-2026", "fashion-knight-2026", "awards-rosina-2027",
  "documentary-teaser-01", "documentary-teaser-02", "documentary-teaser-03", "documentary-teaser-04",
  "fashion-week-tv5",
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
router.get(["/editorial/videos/:videoId/engagement", "/editorial/media/engagement"], async (req, res, next) => {
  const complete = async () => {
    try {
      const who = res.locals.actor;
      const id = req.params.videoId ? videoId(req.params.videoId) : await editorialPhotoId(req.query.source, req);
      res.set("Cache-Control", "no-store").json(await engagement(id, who?.member?.id, who?.founder));
    } catch (error) { next(error); }
  };
  if (getAuth(req).userId) return void networkAuth(req, res, complete);
  await complete();
});
router.post(["/editorial/videos/:videoId/engagement", "/editorial/media/engagement"], networkAuth, networkWrite, async (req, res) => {
  const id = req.params.videoId ? videoId(req.params.videoId) : await editorialPhotoId(req.query.source, req);
  const who = actor(res, false);
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
const campaignAssets = new Map<string, Promise<Buffer>>();
router.get("/editorial/assets/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!/^pink-october-burj-khalifa\.(mp4|webp)$/.test(filename)) return void res.sendStatus(404);
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) throw new NetworkError(503, "Editorial media is unavailable.");
  let pending = campaignAssets.get(filename);
  if (!pending) {
    pending = objectFile(`/${bucket}/public/editorial/assets/${filename}`).download()
      .then(([bytes]) => bytes).catch(error => { campaignAssets.delete(filename); throw error; });
    campaignAssets.set(filename, pending);
  }
  sendBufferedVideo(req, res, await pending, filename.endsWith(".mp4") ? "video/mp4" : "image/webp");
});
export default router;
