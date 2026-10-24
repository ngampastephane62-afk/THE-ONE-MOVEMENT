import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";

// Asset-only upload; no database, authentication or payment bootstrap.
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
for (let i = 1; i <= 8; i++) {
  const filename = `summit-encounters-0${i}.webp`;
  await storage.bucket(bucket).upload(
    fileURLToPath(new URL(`../../generated-artifacts/summit-encounters/${filename}`, import.meta.url)),
    {
      destination: `public/people/${filename}`, resumable: false,
      metadata: { contentType: "image/webp", cacheControl: "public,max-age=86400" },
    },
  );
  console.log(`Stored encounter photograph ${i}/8`);
}
