import { fileURLToPath } from "node:url";
import { storage } from "../services/networkFiles";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
try {
  for (let index = 1; index <= 4; index++) {
    for (const extension of ["mp4", "webp"]) {
      const filename = `documentary-teaser-${String(index).padStart(2, "0")}.${extension}`;
      await storage.bucket(bucket).upload(
        fileURLToPath(new URL(`../../../../generated-artifacts/documentary-teasers/${filename}`, import.meta.url)),
        {
          destination: `public/documentary/${filename}`,
          resumable: false,
          metadata: {
            contentType: extension === "mp4" ? "video/mp4" : "image/webp",
            cacheControl: "public,max-age=86400",
          },
        },
      );
      logger.info({ filename }, "Stored Founder-supplied documentary excerpt");
    }
  }
} finally {
  await pool.end();
}
