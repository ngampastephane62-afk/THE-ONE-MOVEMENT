import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { pool } from "@workspace/db";
import { objectFile } from "../services/networkFiles";
import { logger } from "../lib/logger";

const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const folder = process.env.PRIVATE_OBJECT_DIR;
if (!bucket || !folder) throw new Error("Public cover and private magazine storage are required.");
try {
  const pdf = await readFile(fileURLToPath(new URL("../../../../attached_assets/Tropik_Magazine_1792157776832.pdf", import.meta.url)));
  await objectFile(`${folder.replace(/\/$/, "")}/magazines/tropik-2026.pdf`).save(pdf, {
    resumable: false, metadata: { contentType: "application/pdf", cacheControl: "private,no-store" },
  });
  const cover = await readFile(fileURLToPath(new URL("../../../../generated-artifacts/tropik-magazine/cover.webp", import.meta.url)));
  await objectFile(`/${bucket}/public/magazine/tropik-2026-cover.webp`).save(cover, {
    resumable: false, metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" },
  });
  logger.info("Stored the presentation kit and its cover; the free-kit route controls public download access");
} finally {
  await pool.end();
}
