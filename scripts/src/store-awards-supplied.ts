import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";

// Media-only maintenance: no DB, authentication or payment startup side effects.
const storage = new Storage({
  projectId: "",
  credentials: {
    audience: "replit", subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token", type: "external_account",
    credential_source: { url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" } },
    universe_domain: "googleapis.com",
  },
});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required.");
const clips = [
  { key: "nancy-isime-supplied", original: "reallygreatsite_1792762934572.mp4" },
  { key: "ciara-supplied", original: "video-output-DEF5DF6A-CFB7-4708-925D-37C981DF38A9-1_1792762934572.mov" },
  { key: "rosina-peace-supplied", original: "video-output-C6B72F39-3175-487C-93B2-BBFA79165B9E-1_1792762934572.mov" },
];
for (const clip of clips) {
  await storage.bucket(bucket).upload(fileURLToPath(new URL(`../../attached_assets/${clip.original}`, import.meta.url)), {
    destination: `public/program-media/originals/${clip.original}`, resumable: false,
    metadata: { contentType: clip.original.endsWith(".mov") ? "video/quicktime" : "video/mp4" },
  });
  for (const ext of ["mp4", "webp"]) {
    await storage.bucket(bucket).upload(fileURLToPath(new URL(`../../generated-artifacts/task30/${clip.key}.${ext}`, import.meta.url)), {
      destination: `public/program-media/${clip.key}.${ext}`, resumable: false,
      metadata: { contentType: ext === "mp4" ? "video/mp4" : "image/webp", cacheControl: "public,max-age=86400" },
    });
  }
  console.log(`Stored ${clip.key}: preserved original, lossless MP4 remux and poster.`);
}
process.exit(0);
