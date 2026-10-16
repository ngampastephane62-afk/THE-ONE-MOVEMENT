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
const [privateBucket, ...privatePrefix] = privateDir.replace(/^\/+|\/+$/g, "").split("/");
const outputDir = "generated-artifacts/public-home-reels";
await mkdir(outputDir, { recursive: true });

// Only these two films have been approved for the public carousel.
// Event-planning details and the other supplied artwork are not published here.
for (const item of [
  {
    slug: "movement-vision-2026",
    input: "attached_assets/video-output-5FC32061-9C2F-4CA5-9EE4-75BC8F22A85A-1_1792180117903.mov",
    duration: "52.733333",
    stillVideo: false,
  },
  {
    slug: "movement-together-2026",
    input: "attached_assets/2D3C5DA1-B061-485D-AD65-CF5A09A51F09_1792180117903.mov",
    duration: "29.998333",
    stillVideo: true,
  },
]) {
  for (const ext of ["mp4", "webm", "webp"] as const) {
    const output = `${outputDir}/${item.slug}.${ext}`;
    if (ext === "webp") {
      execFileSync("ffmpeg", [
        "-v", "error", "-y", "-i", item.input,
        "-frames:v", "1", "-vf", "scale=720:-2", "-quality", "85", output,
      ]);
    } else {
      execFileSync("ffmpeg", [
        "-v", "error", "-y", "-i", item.input,
        "-vf", `${item.stillVideo ? "tpad=stop_mode=clone:stop_duration=30," : ""}scale=720:-2,fps=24`,
        "-t", item.duration, "-threads", "2",
        ...(ext === "mp4"
          ? ["-c:v", "libx264", "-crf", "24", "-preset", "fast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]
          : ["-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
            "-deadline", "realtime", "-cpu-used", "6", "-c:a", "libopus"]),
        output,
      ]);
    }
    await storage.bucket(bucket).upload(output, {
      destination: `public/home-reels/${item.slug}.${ext}`,
      resumable: false,
      metadata: {
        contentType: ext === "webp" ? "image/webp" : `video/${ext}`,
        cacheControl: "public,max-age=86400",
      },
    });
    console.log(`Stored ${item.slug}.${ext}`);
  }
  await storage.bucket(privateBucket!).upload(item.input, {
    destination: `${privatePrefix.join("/")}/programme-originals/${item.slug}.mov`,
    resumable: false,
    metadata: { contentType: "video/quicktime", cacheControl: "private,no-store" },
  });
  console.log(`Archived original for ${item.slug}`);
}
