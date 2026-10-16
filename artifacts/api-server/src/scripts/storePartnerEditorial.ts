import { fileURLToPath } from "node:url";
import { storage } from "../services/networkFiles";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const files = [
  ["ben-amadasun.webp", "image/webp"],
  ["canal-logo.png", "image/png"],
  ["netflix-logo.svg", "image/svg+xml"],
] as const;

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
try {
  for (const [name, contentType] of files) {
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../../../generated-artifacts/partner-editorial/${name}`, import.meta.url)),
      {
        destination: `public/documentary/${name}`,
        resumable: false,
        metadata: { contentType, cacheControl: "public,max-age=86400" },
      },
    );
    logger.info({ filename: name }, "Stored partner editorial asset");
  }
} finally {
  await pool.end();
}
