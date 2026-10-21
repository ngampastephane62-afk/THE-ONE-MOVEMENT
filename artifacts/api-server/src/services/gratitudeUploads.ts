import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { db, networkUploads as uploads } from "@workspace/db";
import { and, eq, or } from "drizzle-orm";
import { RequestGratitudeUploadBody } from "@workspace/api-zod";
import { GRATITUDE_LIMITS } from "@workspace/shared";
import { NetworkError } from "./networkAuth";
import { requestUpload, objectFile, completeUpload } from "./networkFiles";
import { media, contributions, lockedStory, campaigns, rate, log, type GratitudeTx } from "./gratitudeStore";
import { positiveId, versionMatch } from "./gratitudePolicy";
import { processGratitudeFile } from "./gratitudeVideo";

export async function reserveGratitudeUpload(owner: number, body: unknown) {
  const input = RequestGratitudeUploadBody.strict().safeParse(body);
  if (!input.success) throw new NetworkError(400, "Choose a supported image or video within the size limit.");
  const data = input.data;
  const kind = data.contentType.startsWith("video/") ? "video" : "image";
  if (data.size > (kind === "video" ? GRATITUDE_LIMITS.videoBytes : GRATITUDE_LIMITS.imageBytes)) throw new NetworkError(400, "Limit: 100 MiB per video or 10 MiB per image.");
  return db.transaction(async tx => {
    const row = await lockedStory(tx, positiveId(data.contributionId));
    if (row.authorId !== owner) throw new NetworkError(404, "Your draft was not found.");
    versionMatch(row.version, data.version);
    if (!["draft", "rejected", "archived"].includes(row.status)) throw new NetworkError(409, "Save an editable draft before uploading.");
    const [campaign] = await tx.select().from(campaigns).where(eq(campaigns.id, row.campaignId));
    if (campaign?.status !== "active") throw new NetworkError(409, "This campaign is not accepting uploads.");
    const files = await tx.select().from(media).where(eq(media.contributionId, row.id));
    if (files.length >= 3 || kind === "video" && files.length > 0 || files.some(m => m.kind === "video")) throw new NetworkError(400, "Attach one video OR up to three images.");
    await rate(tx, owner, "upload");
    const result = await requestUpload(owner, data, "gratitude");
    await tx.insert(media).values({ contributionId: row.id, originalUploadId: result.id, kind, altText: data.altText ?? "", position: files.length ? Math.max(...files.map(m => m.position)) + 1 : 0 });
    await tx.update(contributions).set({
      version: row.version + 1, status: "draft", featured: false, approvedVersion: null,
      publicConsentAt: null, rightsConfirmedAt: null, consentVersion: null, updatedAt: new Date(),
    }).where(eq(contributions.id, row.id));
    await log(tx, owner, "upload.reserve", row.id, { mediaId: result.id, version: row.version + 1 });
    return { ...result, version: row.version + 1 };
  });
}

async function derivative(tx: GratitudeTx, owner: number, sourcePath: string, filename: string, type: string, root: string) {
  const id = randomUUID();
  const objectPath = `${root}/gratitude-private/${owner}/${id}`;
  const file = objectFile(objectPath);
  const size = (await stat(sourcePath)).size;
  await file.bucket.upload(sourcePath, { destination: file.name, resumable: false, metadata: { contentType: type, cacheControl: "private, no-store" } });
  await tx.insert(uploads).values({ id, ownerId: owner, objectPath, filename, contentType: type, size, ready: true });
  return id;
}
// Bound CPU work; retries after a process restart remain possible from persisted pending state.
const processing = new Set<string>();
export async function finishGratitudeUpload(owner: number, uploadId: string) {
  if (!/^[a-f0-9-]{36}$/i.test(uploadId)) throw new NetworkError(400, "Invalid upload.");
  if (processing.size || processing.has(uploadId)) throw new NetworkError(429, "Media processing is busy. Retry shortly.");
  processing.add(uploadId);
  let owned = false;
  try {
    return await db.transaction(async tx => {
      const [reference] = await tx.select().from(media).where(eq(media.originalUploadId, uploadId));
      if (!reference) throw new NetworkError(404, "Campaign upload not found.");
      const story = await lockedStory(tx, reference.contributionId);
      if (story.authorId !== owner) throw new NetworkError(404, "Campaign upload not found.");
      owned = true;
      const [attachment] = await tx.select().from(media).where(eq(media.id, reference.id)).for("update");
      if (attachment.processingStatus === "ready") return { id: uploadId };
      if (!["draft", "rejected", "archived"].includes(story.status)) throw new NetworkError(409, "This story cannot accept media changes.");
      const [original] = await tx.select().from(uploads).where(and(eq(uploads.id, uploadId), eq(uploads.ownerId, owner))).for("update");
      if (!original || !original.objectPath.includes("/gratitude-pending/")) throw new NetworkError(400, "Only reserved campaign uploads can be processed.");
      const root = original.objectPath.split("/gratitude-pending/")[0];
      const finalPath = `${root}/gratitude-private/${owner}/${uploadId}`;
      // Freeze bytes outside the signed PUT target before validating or reading.
      await objectFile(original.objectPath).copy(objectFile(finalPath));
      await tx.update(uploads).set({ objectPath: finalPath, ready: false }).where(eq(uploads.id, uploadId));
      await completeUpload(owner, uploadId, tx, true);
      await tx.update(media).set({ processingStatus: "processing", failureCode: null, updatedAt: new Date() }).where(eq(media.id, attachment.id));
      await processGratitudeFile(async destination => {
        await objectFile(finalPath).download({ destination });
      }, attachment.kind as "image" | "video", async files => {
        const playbackId = await derivative(tx, owner, files.playback, "gratitude" + (attachment.kind === "video" ? ".mp4" : ".jpg"), files.type, root);
        const thumbnailId = files.thumbnail ? await derivative(tx, owner, files.thumbnail, "thumbnail.jpg", "image/jpeg", root) : null;
        await tx.update(media).set({
          playbackUploadId: playbackId, thumbnailUploadId: thumbnailId, durationMs: files.durationMs,
          width: files.width, height: files.height, processingStatus: "ready", failureCode: null, updatedAt: new Date(),
        }).where(eq(media.id, attachment.id));
      });
      await log(tx, owner, "upload.ready", story.id, { mediaId: attachment.id });
      return { id: uploadId };
    });
  } catch (error) {
    // Do not expose parser stderr, storage paths or signed URL details.
    if (owned) await db.update(media).set({ processingStatus: "failed", failureCode: "validation_or_processing_failed", updatedAt: new Date() })
      .where(and(eq(media.originalUploadId, uploadId), or(eq(media.processingStatus, "pending"), eq(media.processingStatus, "failed"))));
    if (error instanceof NetworkError) throw error;
    throw new NetworkError(422, "This media could not be validated or processed. Use a playable MP4, WebM or MOV within three minutes, or a supported image, then retry.");
  } finally { processing.delete(uploadId); }
}
