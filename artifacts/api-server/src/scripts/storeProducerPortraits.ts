import { fileURLToPath } from "node:url";
import { storage } from "../services/networkFiles";
import { pool } from "@workspace/db";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
try {
  for (let index = 1; index <= 26; index++) {
    const name = `tfm-portrait-${String(index).padStart(2, "0")}.webp`;
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../../../generated-artifacts/tfm-review/${name}`, import.meta.url)),
      { destination: `public/documentary/${name}`, resumable: false,
        metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" } },
    );
    console.log(`Stored producer portfolio portrait ${index}/26`);
  }
} finally {
  await pool.end();
}
