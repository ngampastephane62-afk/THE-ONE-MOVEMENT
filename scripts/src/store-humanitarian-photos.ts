import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";

// Deliberately independent of DB, auth and payment modules. No startup side effects.
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
if (!bucket) throw new Error("App Storage is required");
for (let i = 1; i <= 9; i++) {
  const filename = `photo-${String(i).padStart(2, "0")}.webp`;
  await storage.bucket(bucket).upload(
    fileURLToPath(new URL(`../../generated-artifacts/humanitarian-gallery/${filename}`, import.meta.url)),
    { destination: `public/humanitarian-media/${filename}`, resumable: false,
      metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" } },
  );
  console.log(`Stored humanitarian photograph ${i}/9`);
}
process.exit(0);
