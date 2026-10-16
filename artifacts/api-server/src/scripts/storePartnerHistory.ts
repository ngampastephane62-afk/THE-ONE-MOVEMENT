import { fileURLToPath } from "node:url";
import { storage } from "../services/networkFiles";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
try {
  for (let index = 1; index <= 41; index++) {
    const filename = `archive-partner-${String(index).padStart(2, "0")}.webp`;
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../../../generated-artifacts/partner-history/${filename}`, import.meta.url)),
      {
        destination: `public/documentary/${filename}`,
        resumable: false,
        metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" },
      },
    );
    logger.info({ index, total: 41 }, "Stored historical partner logo");
  }
} finally {
  await pool.end();
}
