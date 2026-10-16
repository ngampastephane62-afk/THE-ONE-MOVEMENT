import { fileURLToPath } from "node:url";
import { storage } from "../services/networkFiles";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
try {
  for (const [filename, contentType] of [
    ["fashion-week-tv5.mp4", "video/mp4"],
    ["fashion-week-tv5-runway.webp", "image/webp"],
  ]) {
    if (process.argv.includes("--poster-only") && contentType === "video/mp4") continue;
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../../../generated-artifacts/fashion-week-broadcast/${filename}`, import.meta.url)),
      {
        destination: `public/documentary/${filename}`,
        resumable: false,
        metadata: { contentType, cacheControl: "public,max-age=86400" },
      },
    );
    logger.info({ filename }, "Stored supplied TV5MONDE archive excerpt");
  }
} finally {
  await pool.end();
}
