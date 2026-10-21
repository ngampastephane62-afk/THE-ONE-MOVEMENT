import { Router } from "express";
import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db, networkUploads as uploads } from "@workspace/db";
import { ecosystemMembersTable as memberTable } from "@workspace/db";
import { and, eq, or } from "drizzle-orm";
import { GetGratitudeStoriesQueryParams } from "@workspace/api-zod";
import { GRATITUDE_COUNTRIES, GRATITUDE_THEMES, GRATITUDE_CONSENT_VERSION } from "@workspace/shared";
import { networkAuth, networkWrite, actor, requireFounder, NetworkError, type NetworkActor } from "../services/networkAuth";
import { campaigns, media, contributions, requirePublic } from "../services/gratitudeStore";
import { readGratitude, founderGratitude } from "../services/gratitudeRead";
import { gratitudeAction } from "../services/gratitudeActions";
import { reserveGratitudeUpload, finishGratitudeUpload } from "../services/gratitudeUploads";
import { pageNumber, positiveId } from "../services/gratitudePolicy";
import { objectFile } from "../services/networkFiles";

const router = Router();
router.use("/gratitude", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
router.use("/gratitude", (req, res, next) => {
  if (getAuth(req).userId) return networkAuth(req, res, next);
  return next();
});
const viewer = (res: Response) => (res.locals.actor as NetworkActor | undefined)?.member?.id;
router.get("/gratitude/options", async (_req, res) => {
  const rows = await db.select({ id: campaigns.id, parentId: campaigns.parentId, slug: campaigns.slug, name: campaigns.name, description: campaigns.description, status: campaigns.status, identity: campaigns.identity }).from(campaigns).where(eq(campaigns.status, "active")).orderBy(campaigns.id);
  res.json({ campaigns: rows, countries: GRATITUDE_COUNTRIES, themes: GRATITUDE_THEMES, consentVersion: GRATITUDE_CONSENT_VERSION });
});
router.get("/gratitude/stories", async (req, res) => {
  const parsed = GetGratitudeStoriesQueryParams.strict().safeParse(req.query);
  if (!parsed.success) throw new NetworkError(400, "Invalid discovery filters.");
  const q = parsed.data;
  res.json(await readGratitude(pageNumber(q.page), { scope: "public", memberId: viewer(res) }, q));
});
router.get("/gratitude/stories/:id", async (req, res) => {
  const id = positiveId(Number(req.params.id));
  const page = await readGratitude(1, { scope: "public", memberId: viewer(res) }, { id });
  if (!page.items.length) throw new NetworkError(404, "This story is not publicly available.");
  res.json(page.items[0]);
});
router.get("/gratitude/me", async (req, res) => {
  if (!viewer(res)) throw new NetworkError(401, "Sign in with your existing TOMI account.");
  res.json(await readGratitude(pageNumber(req.query.page), { scope: "owner", memberId: actor(res, false).member.id }));
});
router.get("/gratitude/founder", async (req, res) => {
  if (!viewer(res)) throw new NetworkError(401, "Sign in with your existing TOMI account.");
  const who = actor(res, false); requireFounder(res);
  res.json(await founderGratitude(pageNumber(req.query.page), who.member.id));
});
router.get("/gratitude/review/:id", async (req, res) => {
  if (!viewer(res)) throw new NetworkError(401, "Sign in with your existing TOMI account.");
  const who = actor(res, false); requireFounder(res);
  const page = await readGratitude(1, { scope: "founder", memberId: who.member.id, founder: true }, { id: positiveId(Number(req.params.id)) });
  if (!page.items.length) throw new NetworkError(404, "Story not found.");
  res.json(page.items[0]);
});
router.post("/gratitude/actions", (req, res, next) => {
  if (!getAuth(req).userId) return void res.status(401).json({ error: "Sign in with your existing TOMI account." });
  networkWrite(req, res, next);
}, async (req, res) => { res.json(await gratitudeAction(req.body, res)); });
router.post("/gratitude/uploads", (req, res, next) => {
  if (!getAuth(req).userId) return void res.status(401).json({ error: "Sign in to upload." });
  networkWrite(req, res, next);
}, async (req, res) => {
  res.status(201).json(await reserveGratitudeUpload(actor(res, false).member.id, req.body));
});
router.post("/gratitude/uploads/:id/complete", (req, res, next) => {
  if (!getAuth(req).userId) return void res.status(401).json({ error: "Sign in to finish your upload." });
  networkWrite(req, res, next);
}, async (req, res) => { res.json(await finishGratitudeUpload(actor(res, false).member.id, String(req.params.id))); });

async function sendFile(req: Request, res: Response, row: typeof uploads.$inferSelect) {
  const file = objectFile(row.objectPath);
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size);
  if (size !== row.size || !Number.isSafeInteger(size)) throw new NetworkError(503, "Media temporarily unavailable.");
  let start = 0, end = size - 1;
  const range = req.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || !match[1] && !match[2]) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    if (!match[1]) start = Math.max(0, size - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(size - 1, Number(match[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set({
    "Content-Type": row.contentType, "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes", "Cache-Control": "private, no-store",
    "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") return void res.end();
  // Do not cancel a cloud SDK stream while its HTTP response is still opening.
  file.createReadStream({ start, end }).on("error", () => {
    if (!res.headersSent) res.status(502).end(); else if (!res.destroyed) res.end();
  }).pipe(res);
}
router.get("/gratitude/media/:id", async (req, res) => {
  const id = String(req.params.id);
  const [record] = await db.select({ upload: uploads, attachment: media, authorId: contributions.authorId, status: contributions.status, submittedAt: contributions.submittedAt })
    .from(media).innerJoin(contributions, eq(contributions.id, media.contributionId))
    .innerJoin(uploads, and(eq(uploads.id, id), or(eq(media.playbackUploadId, uploads.id), eq(media.thumbnailUploadId, uploads.id))))
    .where(and(eq(media.processingStatus, "ready"), eq(uploads.ready, true))).limit(1);
  if (!record) throw new NetworkError(404, "Media not found.");
  const who = res.locals.actor as NetworkActor | undefined;
  const reviewAccess = who?.founder && record.status !== "draft" && !!record.submittedAt;
  if (record.authorId !== who?.member?.id && !reviewAccess) {
    await db.transaction(async tx => {
      await requirePublic(tx, record.attachment.contributionId, who?.member?.id);
      const [author] = await tx.select({ allowed: memberTable.publicMedia }).from(memberTable).where(eq(memberTable.id, record.authorId));
      if (!author?.allowed) throw new NetworkError(404, "Media not found.");
    });
  }
  await sendFile(req, res, record.upload);
});
export default router;
