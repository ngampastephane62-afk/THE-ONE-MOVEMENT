import { Router, type Request, type Response, type NextFunction } from "express";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db, mediaItemsTable as publications, networkUploads as uploads } from "@workspace/db";
import { DeleteMediaPublicationBody, type MediaPublication, type MediaPublicationSave } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { objectFile, ownedMedia } from "../services/networkFiles";
import { MEDIA_CENTER_TYPE, MEDIA_IMAGE_TYPES, MEDIA_IMAGE_MAX, mediaPublicationInput, mediaRevision } from "../services/mediaCenterValidation";

const router = Router();
type Row = typeof publications.$inferSelect;
type Stored = Omit<MediaPublicationSave, "expectedUpdatedAt" | "status" | "title">;
const metadata = (row: Row) => JSON.parse(row.body!) as Stored;
const kind = eq(publications.type, MEDIA_CENTER_TYPE);

function dto(row: Row, admin = false): MediaPublication {
  const p = metadata(row);
  return {
    ...p, instagramUrl: p.instagramUrl ?? "", id: row.id, title: row.title, status: row.status as MediaPublication["status"],
    coverUrl: p.coverUploadId ? `/api/media-center/${row.id}/assets/cover` : null,
    logoUrl: p.logoUploadId ? `/api/media-center/${row.id}/assets/logo` : null,
    coverUploadId: admin ? p.coverUploadId : null,
    logoUploadId: admin ? p.logoUploadId : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}
function id(value: unknown) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new NetworkError(404, "Publication not found.");
  return Number(value);
}
async function find(value: unknown) {
  const [row] = await db.select().from(publications).where(and(kind, eq(publications.id, id(value)), ne(publications.status, "deleted")));
  if (!row) throw new NetworkError(404, "Publication not found.");
  return row;
}
async function list(req: Request, res: Response, admin: boolean) {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) throw new NetworkError(400, "Choose a valid page.");
  const size = 24;
  const rows = await db.select().from(publications)
    .where(and(kind, admin ? ne(publications.status, "deleted") : eq(publications.status, "published")))
    .orderBy(
      asc(sql`coalesce((${publications.body}::jsonb->>'priority')::integer, 0)`),
      desc(sql`${publications.body}::jsonb->>'publicationDate'`),
      desc(publications.id),
    ).limit(size + 1).offset((page - 1) * size);
  res.set("Cache-Control", "private,no-store").json({
    items: rows.slice(0, size).map((r) => dto(r, admin)), page, hasMore: rows.length > size,
  });
}
async function values(input: unknown, ownerId: number, existing?: Row) {
  const p = mediaPublicationInput(input);
  const previous = existing ? metadata(existing) : null;
  const retained = new Set([previous?.coverUploadId, previous?.logoUploadId].filter(Boolean));
  const ids = [...new Set([p.coverUploadId, p.logoUploadId].filter((v): v is string => !!v))];
  // Retained references may come from an earlier authorized administrator.
  // Every newly selected image must belong to the authenticated uploader.
  const files = await ownedMedia(ownerId, ids.filter((key) => !retained.has(key)));
  if (files.some((f) => !MEDIA_IMAGE_TYPES.has(f.contentType) || f.size > MEDIA_IMAGE_MAX)) {
    throw new NetworkError(400, "Covers and logos must be JPEG, PNG or WebP images up to 5 MB.");
  }
  const { expectedUpdatedAt, status, title, ...stored } = p;
  return {
    expectedUpdatedAt,
    data: {
      title, status, type: MEDIA_CENTER_TYPE, category: p.category, body: JSON.stringify(stored),
      mediaUrl: null,
      publishedAt: status === "published" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
      updatedAt: new Date(Math.max(Date.now(), (existing?.updatedAt.getTime() ?? 0) + 1)),
    },
  };
}

router.get("/media-center", (req, res) => list(req, res, false));
router.get("/founder/media-center", networkAuth, (req, res) => {
  requireFounder(res);
  return list(req, res, true);
});
router.post("/founder/media-center", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const who = actor(res, false);
  const v = await values(req.body, who.member.id);
  const [row] = await db.insert(publications).values(v.data).returning();
  res.set("Cache-Control", "private,no-store").status(201).json(dto(row!, true));
});
router.put("/founder/media-center/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const old = await find(req.params.id);
  const who = actor(res, false);
  const v = await values(req.body, who.member.id, old);
  const revision = mediaRevision(v.expectedUpdatedAt);
  const [row] = await db.update(publications).set(v.data)
    .where(and(kind, eq(publications.id, old.id), ne(publications.status, "deleted"), eq(publications.updatedAt, revision))).returning();
  if (!row) throw new NetworkError(409, "This publication changed in another session. Your edits are kept; reload before saving.");
  res.set("Cache-Control", "private,no-store").json(dto(row, true));
});
router.delete("/founder/media-center/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const parsed = DeleteMediaPublicationBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "A saved publication revision is required.");
  const old = await find(req.params.id);
  const revision = mediaRevision(parsed.data.expectedUpdatedAt);
  const [row] = await db.update(publications).set({
    status: "deleted", updatedAt: new Date(Math.max(Date.now(), old.updatedAt.getTime() + 1)),
  }).where(and(kind, eq(publications.id, old.id), ne(publications.status, "deleted"), eq(publications.updatedAt, revision))).returning();
  if (!row) throw new NetworkError(409, "This publication changed in another session. Reload before deleting.");
  // Soft removal intentionally preserves media files and historical metadata.
  res.set("Cache-Control", "private,no-store").status(204).end();
});

async function sendAsset(req: Request, res: Response, row: Row) {
  const p = metadata(row);
  const slot = String(req.params.slot);
  const key = slot === "cover" ? p.coverUploadId : slot === "logo" ? p.logoUploadId : null;
  if (!key) throw new NetworkError(404, "Publication image not found.");
  const [upload] = await db.select().from(uploads).where(and(eq(uploads.id, key), eq(uploads.ready, true)));
  if (!upload || !MEDIA_IMAGE_TYPES.has(upload.contentType) || upload.size > MEDIA_IMAGE_MAX) throw new NetworkError(404, "Publication image not found.");
  const [bytes] = await objectFile(upload.objectPath).download();
  if (res.destroyed) return;
  res.set({
    "Content-Type": upload.contentType, "Content-Length": String(bytes.length),
    "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  }).send(bytes);
}
router.get("/media-center/:id/assets/:slot", async (req, res, next: NextFunction) => {
  // Recheck publication state on every request: unpublishing revokes old URLs.
  const row = await find(req.params.id);
  if (row.status === "published") return sendAsset(req, res, row);
  return networkAuth(req, res, () => {
    try { requireFounder(res); void sendAsset(req, res, row).catch(next); }
    catch (error) { next(error); }
  });
});

export default router;
