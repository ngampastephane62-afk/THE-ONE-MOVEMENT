import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { objectFile } from "../services/networkFiles";
import { pool } from "@workspace/db";
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("Magazine storage is unavailable.");
try {
  const folder = new URL("../../../../generated-artifacts/tropik-editorial/", import.meta.url);
  const wanted = new Set(process.argv.slice(2));
  const filenames = (await readdir(folder)).filter(n => n.endsWith(".webp") && (!wanted.size || wanted.has(n))).sort();
  if (wanted.size && filenames.length !== wanted.size) throw new Error("Some requested magazine images have not been prepared.");
  for (const filename of filenames) {
    await objectFile(`/${bucket}/public/magazine/editorial/${filename}`).save(
      await readFile(fileURLToPath(new URL(filename, folder))),
      { resumable: false, metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" } },
    );
    console.log(`Stored magazine artwork: ${filename}`);
  }
} finally { await pool.end(); }
