import { randomUUID } from "node:crypto";
import { db, networkUploads as uploads } from "@workspace/db";
import { eq, and, inArray, gte } from "drizzle-orm";
import { NetworkError } from "./networkAuth";
import { isCampaignPath, isReservedMediaPath } from "./mediaIsolation";
import { maxUploadBytes, UPLOAD_LIMITS } from "@workspace/shared";
import { objectFile, replitStorage } from "./objectStorage";

const types = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/wav", "audio/ogg", "application/pdf"]);
export { objectFile };
/** Replit-only seeding scripts upload directly; the API uses objectFile. */
export const storage = { bucket: (name: string) => replitStorage().bucket(name) };
export async function requestUpload(ownerId: number, input: { filename: string; contentType: string; size: number }, scope: "network" | "news" | "gratitude" = "network") {
  const max = maxUploadBytes(input.contentType);
  if (!types.has(input.contentType) || input.size < 1 || input.size > max) throw new NetworkError(400, "Use an allowed image, video, audio or PDF within the displayed size limit.");
  const recent = await db.select({ size: uploads.size, ready: uploads.ready }).from(uploads)
    .where(and(eq(uploads.ownerId, ownerId), gte(uploads.createdAt, new Date(Date.now() - 24 * 60 * 60_000))));
  if (recent.filter(u => !u.ready).length >= UPLOAD_LIMITS.unfinishedUploads || recent.reduce((sum, u) => sum + u.size, input.size) > UPLOAD_LIMITS.dailyBytes) {
    throw new NetworkError(429, "Your daily upload allowance is reached or too many uploads are unfinished. Please try again later.");
  }
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateDir) throw new NetworkError(503, "Media storage is not configured.");
  const id = randomUUID();
  const objectPath = `${privateDir.replace(/\/$/, "")}/${scope === "gratitude" ? "gratitude-pending" : scope === "news" ? "news-pending" : "network"}/${ownerId}/${id}`;
  const file = objectFile(objectPath);
  let uploadUrl: string;
  try { uploadUrl = await file.signedUploadUrl(input.contentType, 60 * 60_000); }
  catch { throw new NetworkError(503, "The upload service is unavailable. Please retry."); }
  await db.insert(uploads).values({
    id, ownerId, objectPath, filename: input.filename.replace(/[^\p{L}\p{N} ._()-]/gu, "_").slice(0, 200),
    contentType: input.contentType, size: input.size,
  });
  return { id, uploadUrl };
}
export async function completeUpload(ownerId: number, id: string, executor: Pick<typeof db, "select" | "update"> = db, reviewScope: false | "gratitude" | "news" = false) {
  const [row] = await executor.select().from(uploads).where(and(eq(uploads.id, id), eq(uploads.ownerId, ownerId)));
  if (!row) throw new NetworkError(404, "Upload not found.");
  // Only a dedicated, authorized route may validate its own pending namespace.
  // Ordinary member uploads must not finalize News or gratitude review files.
  const authorizedPending = reviewScope === "news"
    ? row.objectPath.endsWith(`/news-pending/${ownerId}/${id}`)
    : reviewScope === "gratitude" && row.objectPath.endsWith(`/gratitude-pending/${ownerId}/${id}`);
  if (isReservedMediaPath(row.objectPath) && !authorizedPending) throw new NetworkError(400, "Finalize this file through its dedicated review workflow.");
  const file = objectFile(row.objectPath);
  const [metadata] = await file.getMetadata();
  if (Number(metadata.size) !== row.size || metadata.contentType?.split(";")[0] !== row.contentType) {
    await file.delete({ ignoreNotFound: true });
    throw new NetworkError(400, "The uploaded file does not match its declared type and size.");
  }
  const [head] = await file.download({ start: 0, end: 511 });
  const bytes = head.toString("latin1");
  const valid =
    row.contentType === "image/jpeg" ? head[0] === 255 && head[1] === 216 :
    row.contentType === "image/png" ? head.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    row.contentType === "image/gif" ? bytes.startsWith("GIF8") :
    row.contentType === "image/webp" ? bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP" :
    row.contentType === "application/pdf" ? bytes.startsWith("%PDF-") :
    row.contentType === "video/mp4" || row.contentType === "video/quicktime" ? bytes.slice(4, 8) === "ftyp" :
    row.contentType === "video/webm" ? head.subarray(0, 4).equals(Buffer.from([26,69,223,163])) :
    row.contentType === "audio/wav" ? bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WAVE" :
    row.contentType === "audio/ogg" ? bytes.startsWith("OggS") :
    row.contentType === "audio/mpeg" ? bytes.startsWith("ID3") || head[0] === 255 : false;
  if (!valid) {
    await file.delete({ ignoreNotFound: true });
    throw new NetworkError(400, "The file contents are not an allowed media format.");
  }
  await executor.update(uploads).set({ ready: true }).where(eq(uploads.id, id));
}
export async function ownedMedia(ownerId: number, ids: string[] = []) {
  const unique = [...new Set(ids)];
  if (!unique.length) return [];
  const found = await db.select().from(uploads).where(and(eq(uploads.ownerId, ownerId), eq(uploads.ready, true), inArray(uploads.id, unique)));
  if (found.length !== unique.length) throw new NetworkError(400, "Attach only your own completed uploads.");
  if (found.some(row => isCampaignPath(row.objectPath) || isReservedMediaPath(row.objectPath))) throw new NetworkError(400, "Campaign review files cannot be attached to another publication.");
  return found;
}
export function mediaDto(row: typeof uploads.$inferSelect) {
  return { id: row.id, filename: row.filename, contentType: row.contentType, url: `/api/network/media/${row.id}` };
}
