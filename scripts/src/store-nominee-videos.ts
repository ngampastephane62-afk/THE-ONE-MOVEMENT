import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
process.chdir(fileURLToPath(new URL("../../", import.meta.url)));
const storage = new Storage({ projectId: "", credentials: {
  audience: "replit", subject_token_type: "access_token", token_url: "http://127.0.0.1:1106/token", type: "external_account",
  credential_source: { url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" } }, universe_domain: "googleapis.com",
}});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucket) throw new Error("App Storage is required");
await mkdir("generated-artifacts/nominee-videos", { recursive: true });
for (const [slug, input] of [
  ["mohombi-announcement", "attached_assets/reallygreatsite_1792125639933.mp4"],
  ["ciara-announcement", "attached_assets/video-output-DEF5DF6A-CFB7-4708-925D-37C981DF38A9-1_1792125639933.mov"],
]) {
  for (const ext of ["mp4", "webm"]) {
    const output = `generated-artifacts/nominee-videos/${slug}.${ext}`;
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", input!, "-vf", "scale=720:-2",
      ...(ext === "mp4" ? ["-c:v", "libx264", "-crf", "24", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart"] : ["-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-deadline", "realtime", "-cpu-used", "6", "-c:a", "libopus"]),
      output]);
    await storage.bucket(bucket).upload(output, { destination: `public/nominee-videos/${slug}.${ext}`, resumable: false, metadata: { contentType: `video/${ext}`, cacheControl: "public,max-age=86400" } });
    console.log(`Stored ${slug}.${ext}`);
  }
}
process.exit(0);
