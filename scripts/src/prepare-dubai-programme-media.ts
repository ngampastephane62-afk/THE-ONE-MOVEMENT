import { Storage } from "@google-cloud/storage";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../../", import.meta.url)));
const storage = new Storage({
  projectId: "",
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token",
    type: "external_account",
    credential_source: {
      url: "http://127.0.0.1:1106/credential",
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const privateDir = process.env.PRIVATE_OBJECT_DIR;
if (!bucket || !privateDir) throw new Error("App Storage is required.");
const outputDir = "generated-artifacts/dubai-programmes";
await mkdir(outputDir, { recursive: true });
const [privateBucket, ...privatePrefix] = privateDir.replace(/^\/+|\/+$/g, "").split("/");

for (const item of [
  {
    slug: "we-are-one-2026",
    folder: "home-reels",
    input: "attached_assets/We_are_One_Reel_Video_1792172482525.mp4",
    originalExtension: "mp4",
    posterTime: "1.5",
  },
  {
    slug: "fashion-knight-2026",
    folder: "program-media",
    input: "attached_assets/video-output-66F5D9C3-B5A0-440E-BC84-91DDBEFC7E56-1_1792172603840.mov",
    originalExtension: "mov",
    posterTime: "2",
  },
  {
    slug: "awards-rosina-2027",
    folder: "program-media",
    input: "attached_assets/video-output-C6B72F39-3175-487C-93B2-BBFA79165B9E-1_1792172685027.mov",
    originalExtension: "mov",
    posterTime: "3",
  },
]) {
  for (const ext of ["mp4", "webm", "webp"] as const) {
    const output = `${outputDir}/${item.slug}.${ext}`;
    if (ext === "webp") {
      execFileSync("ffmpeg", [
        "-v", "error", "-y", "-ss", item.posterTime, "-i", item.input,
        "-frames:v", "1", "-vf", "scale=720:-2", "-quality", "85", output,
      ]);
    } else {
      execFileSync("ffmpeg", [
        "-v", "error", "-y", "-i", item.input,
        "-vf", "scale=720:-2", "-threads", "2",
        ...(ext === "mp4"
          ? ["-c:v", "libx264", "-crf", "24", "-preset", "fast",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]
          : ["-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
            "-deadline", "realtime", "-cpu-used", "6", "-c:a", "libopus"]),
        output,
      ]);
    }
    await storage.bucket(bucket).upload(output, {
      destination: `public/${item.folder}/${item.slug}.${ext}`,
      resumable: false,
      metadata: {
        contentType: ext === "webp" ? "image/webp" : `video/${ext}`,
        cacheControl: "public,max-age=86400",
      },
    });
    console.log(`Stored ${item.slug}.${ext}`);
  }
  await storage.bucket(privateBucket!).upload(item.input, {
    destination: `${privatePrefix.join("/")}/programme-originals/${item.slug}.${item.originalExtension}`,
    resumable: false,
    metadata: {
      contentType: item.originalExtension === "mov" ? "video/quicktime" : "video/mp4",
      cacheControl: "private,no-store",
    },
  });
  console.log(`Archived original for ${item.slug}`);
}
