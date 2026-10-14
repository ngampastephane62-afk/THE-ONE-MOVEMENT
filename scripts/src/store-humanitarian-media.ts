import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";

const storage = new Storage({
  projectId: "",
  credentials: {
    audience: "replit", subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token", type: "external_account",
    credential_source: {
      url: "http://127.0.0.1:1106/credential",
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const privateDir = process.env.PRIVATE_OBJECT_DIR;
if (!bucket || !privateDir) throw new Error("App Storage is required");

// Browser-ready derivatives are the only publicly served objects.
for (const slug of ["panzi-appeal", "tomi-fonarev-story"]) {
  for (const ext of ["mp4", "webm", "webp"]) {
    const filename = `${slug}.${ext}`;
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../generated-artifacts/humanitarian/${filename}`, import.meta.url)),
      {
        destination: `public/humanitarian-media/${filename}`, resumable: false,
        metadata: {
          contentType: ext === "webp" ? "image/webp" : `video/${ext}`,
          cacheControl: "public,max-age=86400",
        },
      },
    );
    console.log(`Stored browser-ready film asset: ${filename}`);
  }
}

// Keep the original full-resolution Founder uploads privately, outside Git.
const [privateBucket, ...prefix] = privateDir.replace(/^\/+/, "").replace(/\/$/, "").split("/");
for (const [source, name, type] of [
  ["inmark_1791996940684.mp4", "panzi-appeal-original.mp4", "video/mp4"],
  ["video-output-0C5E9A74-18E7-41E2-A8C5-809391537A55-1_1791996940684.mov", "tomi-fonarev-story-original.mov", "video/quicktime"],
]) {
  await storage.bucket(privateBucket!).upload(
    fileURLToPath(new URL(`../../attached_assets/${source}`, import.meta.url)),
    {
      destination: `${prefix.join("/")}/humanitarian-originals/${name}`,
      resumable: false, metadata: { contentType: type, cacheControl: "private,no-store" },
    },
  );
  console.log(`Archived original privately: ${name}`);
}
console.log("Humanitarian films and original archives stored.");
process.exit(0);
