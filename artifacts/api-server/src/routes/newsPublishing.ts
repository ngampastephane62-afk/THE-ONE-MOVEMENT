import { Router, type Request, type Response, type NextFunction } from "express";
import { and, desc, eq, exists, sql } from "drizzle-orm";
import { db, newsArticles as articles, newsArticleRevisions as revisions, networkUploads as uploads } from "@workspace/db";
import { PARTNER_INTRODUCTION_TARGETS, PROGRAM_SLUGS } from "@workspace/shared";
import { actor, networkAuth, networkWrite, requireFounder } from "../services/networkAuth";
import { completeUpload, objectFile, requestUpload } from "../services/networkFiles";
import { changeNewsArticle, findEditorialUpload, findPublicNews, founderNewsDto, NEWS_PAGE_SIZE, publicNewsDto } from "../services/newsPublishing";
import { isEditorialUpload, newsMediaReferences, NewsError, parseNewsAction, parseNewsUpload } from "../services/newsValidation";

const router = Router();
const pageNumber = (value: unknown) => {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d{0,5}$/.test(value)) throw new NewsError(400, "Invalid page.");
  return Number(value);
};
const positiveId = (value: unknown) => {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value) || Number(value) > 2147483647) throw new NewsError(404, "Article not found.");
  return Number(value);
};
router.use("/news/articles", (_req, res, next) => {
  res.set("Cache-Control", "private, no-store"); next();
});
router.use("/founder/news", networkAuth, (_req, res, next) => {
  requireFounder(res);
  res.set("Cache-Control", "private, no-store");
  next();
});

router.get("/news/articles", async (req, res) => {
  const page = pageNumber(req.query.page);
  if (req.query.category !== undefined && req.query.category !== "tropik-article") throw new NewsError(400, "Invalid article collection.");
  const rows = await db.select({ article: articles, snapshot: revisions.snapshot }).from(articles)
    .innerJoin(revisions, and(eq(articles.id, revisions.articleId), eq(articles.publishedRevisionId, revisions.id)))
    .where(and(eq(articles.status, "published"), req.query.category === "tropik-article"
      ? sql`${revisions.snapshot}->>'category' = 'tropik-article'` : undefined)).orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(NEWS_PAGE_SIZE + 1).offset((page - 1) * NEWS_PAGE_SIZE);
  res.json({ items: rows.slice(0, NEWS_PAGE_SIZE).map(row => publicNewsDto(row.article, row.snapshot)), page, hasMore: rows.length > NEWS_PAGE_SIZE });
});
router.get("/news/articles/:slug", async (req, res) => {
  const row = await findPublicNews(String(req.params.slug));
  res.json(publicNewsDto(row.article, row.snapshot));
});
router.get("/founder/news", async (req, res) => {
  const page = pageNumber(req.query.page);
  if (req.query.category !== undefined && req.query.category !== "tropik-article") throw new NewsError(400, "Invalid article collection.");
  const rows = await db.select().from(articles).where(req.query.category === "tropik-article" ? exists(
    db.select({ id: revisions.id }).from(revisions).where(and(eq(revisions.articleId, articles.id),
      eq(revisions.id, sql`coalesce(${articles.draftRevisionId}, ${articles.publishedRevisionId})`),
      sql`${revisions.snapshot}->>'category' = 'tropik-article'`)),
  ) : undefined).orderBy(desc(articles.updatedAt), desc(articles.id))
    .limit(NEWS_PAGE_SIZE + 1).offset((page - 1) * NEWS_PAGE_SIZE);
  res.json({ items: await Promise.all(rows.slice(0, NEWS_PAGE_SIZE).map(row => founderNewsDto(db, row))), page, hasMore: rows.length > NEWS_PAGE_SIZE });
});
router.get("/founder/news/options", (_req, res) => {
  res.json({
    partners: PARTNER_INTRODUCTION_TARGETS.map(p => ({ key: String(p.id), label: p.name })),
    programmes: PROGRAM_SLUGS.map(key => ({ key, label: key.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") })),
  });
});
router.post("/founder/news/actions", networkWrite, async (req, res) => {
  const input = parseNewsAction(req.body);
  const result = await changeNewsArticle(input, actor(res, false).member.id);
  res.json(result);
});
router.post("/founder/news/uploads", networkWrite, async (req, res) => {
  const input = parseNewsUpload(req.body);
  res.status(201).json(await requestUpload(actor(res, false).member.id, input, "news"));
});
router.post("/founder/news/uploads/:uploadId/complete", networkWrite, async (req, res) => {
  const id = String(req.params.uploadId);
  const ownerId = actor(res, false).member.id;
  await db.transaction(async tx => {
    const [row] = await tx.select().from(uploads).where(and(eq(uploads.id, id), eq(uploads.ownerId, ownerId))).for("update");
    if (!row) throw new NewsError(404, "Editorial upload not found.");
    if (isEditorialUpload(row)) {
      if (!row.ready) await completeUpload(ownerId, id, tx);
      return;
    }
    const pendingSuffix = `/news-pending/${ownerId}/${id}`;
    if (!row.objectPath.endsWith(pendingSuffix)) throw new NewsError(400, "Only editorial uploads can be finalized here.");
    await completeUpload(ownerId, id, tx, "news");
    const finalPath = row.objectPath.slice(0, -pendingSuffix.length) + `/news/${ownerId}/${id}`;
    // The temporary signed PUT can never overwrite the final publication object.
    await objectFile(row.objectPath).copy(objectFile(finalPath));
    await tx.update(uploads).set({ objectPath: finalPath, ready: false }).where(eq(uploads.id, id));
    await completeUpload(ownerId, id, tx);
  });
  res.json({ id });
});

async function sendEditorialFile(req: Request, res: Response, upload: Awaited<ReturnType<typeof findEditorialUpload>>) {
  const file = objectFile(upload.objectPath);
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size);
  if (!Number.isSafeInteger(size) || size !== upload.size) throw new NewsError(503, "This editorial file is temporarily unavailable.");
  res.set({
    "Content-Type": upload.contentType, "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(upload.filename)}`,
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });
  let start = 0, end = size - 1;
  const range = req.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    if (match[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    } else {
      start = Math.max(0, size - Number(match[2]));
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
      return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set("Content-Length", String(end - start + 1));
  if (req.method === "HEAD") return void res.end();
  // Do not abort the cloud SDK before its response arrives (preview SDK quirk).
  const stream = file.createReadStream({ start, end });
  stream.on("error", () => {
    if (res.headersSent) res.destroy();
    else { res.status(503); res.removeHeader("Content-Length"); res.end(); }
  });
  stream.pipe(res);
}
router.get("/founder/news/media/:uploadId", async (req, res) => {
  const row = await findEditorialUpload(String(req.params.uploadId), actor(res, false).member.id);
  await sendEditorialFile(req, res, row);
});
router.get("/news/articles/:slug/media/:uploadId", async (req, res) => {
  const row = await findPublicNews(String(req.params.slug));
  const id = String(req.params.uploadId);
  if (!newsMediaReferences(row.snapshot).some(ref => ref.id === id)) throw new NewsError(404, "Editorial media not found.");
  await sendEditorialFile(req, res, await findEditorialUpload(id));
});
router.get("/founder/news/:id", async (req, res) => {
  const [row] = await db.select().from(articles).where(eq(articles.id, positiveId(req.params.id)));
  if (!row) throw new NewsError(404, "Article not found.");
  res.json(await founderNewsDto(db, row, pageNumber(req.query.historyPage)));
});
router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof NewsError) res.status(error.status).json({ error: error.message });
  else next(error);
});
export default router;
