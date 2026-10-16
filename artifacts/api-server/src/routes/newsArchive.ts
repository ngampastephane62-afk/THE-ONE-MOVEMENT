import { Router, type Request, type Response, type NextFunction } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, mediaItemsTable as news, networkUploads as uploads } from "@workspace/db";
import { CreateNewsEntryBody, UpdateNewsEntryBody, type PressEntry, type PressEntryInput } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { objectFile, ownedMedia } from "../services/networkFiles";

const router = Router();
const TYPE = "press-coverage-v1";
type Asset = { archive: string } | { uploadId: string };
type Stored = {
  summary: string; category: PressEntry["category"]; dateLabel: string;
  sourceUrl: string; websiteUrl: string; evidence: Asset[]; logo: Asset | null;
};
type Row = typeof news.$inferSelect;
const imageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
// Only these 22 curated files can enter this bounded in-process cache.
// Newly uploaded private images are deliberately never cached here.
const curatedAssets = new Set([
  ...["licence", "tv5monde", "monusco", "acp"].map(name => `${name}-logo.png`),
  ...[["licence", 9], ["tv5monde", 3], ["monusco", 3], ["acp", 3]].flatMap(([name, count]) =>
    Array.from({ length: Number(count) }, (_, i) => `${name}-${String(i + 1).padStart(2, "0")}.webp`)),
]);
const archiveCache = new Map<string, Promise<Buffer>>();
const metadata = (row: Row): Stored => JSON.parse(row.body!) as Stored;
function dto(row: Row): PressEntry {
  const data = metadata(row);
  return {
    id: row.id, title: row.title, outlet: row.category!, summary: data.summary,
    category: data.category, dateLabel: data.dateLabel, sourceUrl: data.sourceUrl,
    websiteUrl: data.websiteUrl, status: row.status as PressEntry["status"],
    evidenceUrls: data.evidence.map((_, i) => `/api/news/${row.id}/assets/${i}`),
    logoUrl: data.logo ? `/api/news/${row.id}/assets/logo` : null,
  };
}
async function find(id: string) {
  if (!/^[1-9]\d*$/.test(id)) throw new NetworkError(404, "Article not found.");
  const [row] = await db.select().from(news).where(and(eq(news.id, Number(id)), eq(news.type, TYPE)));
  if (!row) throw new NetworkError(404, "Article not found.");
  return row;
}
function sourceUrl(value: string, optional = false) {
  const clean = value.trim();
  if (!clean && optional) return "";
  let url: URL;
  try { url = new URL(clean); } catch { throw new NetworkError(400, "Enter a full https:// publisher URL."); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) {
    throw new NetworkError(400, "Use a public http:// or https:// publisher URL without credentials.");
  }
  return url.toString();
}
async function values(input: PressEntryInput, ownerId: number, existing?: Row) {
  const previous = existing ? metadata(existing) : null;
  const removed = new Set(input.removeEvidenceIndexes);
  if ([...removed].some(i => !previous?.evidence[i])) throw new NetworkError(400, "Choose an existing screenshot to remove.");
  const retained = previous?.evidence.filter((_, i) => !removed.has(i)) ?? [];
  const ids = [...new Set([...input.evidenceUploadIds, ...(input.logoUploadId ? [input.logoUploadId] : [])])];
  const files = await ownedMedia(ownerId, ids);
  if (files.some(f => !imageTypes.has(f.contentType))) throw new NetworkError(400, "Screenshots and logos must be JPEG, PNG or WebP images.");
  if (retained.length + input.evidenceUploadIds.length > 12) throw new NetworkError(400, "Keep at most twelve screenshots per article.");
  const evidence: Asset[] = [...retained, ...[...new Set(input.evidenceUploadIds)].map(uploadId => ({ uploadId }))];
  const logo = input.logoUploadId ? { uploadId: input.logoUploadId } : input.removeLogo ? null : previous?.logo ?? null;
  if (input.status === "published" && (!input.publicAssetsConsent || !logo || !evidence.length)) {
    throw new NetworkError(400, "To publish, attach a publisher logo and at least one screenshot, and confirm public display permission.");
  }
  const title = input.title.trim(), outlet = input.outlet.trim(), summary = input.summary.trim();
  if (title.length < 2 || outlet.length < 2 || summary.length < 10) throw new NetworkError(400, "Enter an article title, publisher and summary.");
  const data: Stored = {
    summary, category: input.category, dateLabel: input.dateLabel.trim(),
    sourceUrl: sourceUrl(input.sourceUrl, true), websiteUrl: sourceUrl(input.websiteUrl),
    evidence, logo,
  };
  return {
    title, category: outlet, type: TYPE, status: input.status, body: JSON.stringify(data),
    publishedAt: input.status === "published" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
    updatedAt: new Date(),
  };
}

router.get("/news", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  const rows = await db.select().from(news).where(and(eq(news.type, TYPE), eq(news.status, "published"))).orderBy(desc(news.id));
  res.json(rows.map(dto));
});
router.get("/news/admin", networkAuth, (_req, res, next) => {
  try { requireFounder(res); next(); } catch (error) { next(error); }
}, async (_req, res) => {
  res.set("Cache-Control", "private,no-store");
  const rows = await db.select().from(news).where(eq(news.type, TYPE)).orderBy(desc(news.id));
  res.json(rows.map(dto));
});
router.post("/news/admin", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const parsed = CreateNewsEntryBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid news entry.");
  const who = actor(res, false);
  const [row] = await db.insert(news).values(await values(parsed.data, who.member.id)).returning();
  res.status(201).json(dto(row!));
});
router.put("/news/admin/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const parsed = UpdateNewsEntryBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Invalid news entry.");
  const existing = await find(String(req.params.id));
  const who = actor(res, false);
  const [row] = await db.update(news).set(await values(parsed.data, who.member.id, existing)).where(eq(news.id, existing.id)).returning();
  res.json(dto(row!));
});
async function sendAsset(req: Request, res: Response, row: Row) {
  const data = metadata(row);
  const key = String(req.params.asset);
  const asset = key === "logo" ? data.logo : /^\d{1,2}$/.test(key) ? data.evidence[Number(key)] : null;
  if (!asset) throw new NetworkError(404, "Image not found.");
  let file, contentType: string, curatedKey: string | undefined;
  if ("archive" in asset) {
    if (!curatedAssets.has(asset.archive)) throw new NetworkError(404, "Image not found.");
    curatedKey = asset.archive;
    const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucket) throw new NetworkError(503, "Image storage is unavailable.");
    file = objectFile(`/${bucket}/public/press-archive/${asset.archive}`);
    contentType = asset.archive.endsWith(".webp") ? "image/webp" : asset.archive.endsWith(".png") ? "image/png" : "image/jpeg";
  } else {
    const [upload] = await db.select().from(uploads).where(and(eq(uploads.id, asset.uploadId), eq(uploads.ready, true)));
    if (!upload || !imageTypes.has(upload.contentType)) throw new NetworkError(404, "Image not found.");
    file = objectFile(upload.objectPath);
    contentType = upload.contentType;
  }
  // Authorization above runs on every request, including cache hits, so drafts
  // remain private immediately after unpublishing. Cloud downloads are not aborted
  // when a browser leaves before the SDK has received its HTTP response.
  let bytes: Buffer;
  if (curatedKey) {
    let pending = archiveCache.get(curatedKey);
    if (!pending) {
      const key = curatedKey;
      pending = file.download().then(([data]) => data).catch(error => { archiveCache.delete(key); throw error; });
      archiveCache.set(key, pending);
    }
    bytes = await pending;
  } else {
    [bytes] = await file.download();
  }
  if (res.destroyed) return;
  res.set({
    "Content-Type": contentType, "Content-Length": String(bytes.length),
    "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  }).send(bytes);
}
router.get("/news/:id/assets/:asset", async (req, res, next: NextFunction) => {
  const row = await find(String(req.params.id));
  if (row.status === "published") return sendAsset(req, res, row);
  // Unpublishing also immediately protects former public image URLs.
  return networkAuth(req, res, () => {
    try {
      requireFounder(res);
      void sendAsset(req, res, row).catch(next);
    } catch (error) { next(error); }
  });
});
export default router;
