import { Storage } from "@google-cloud/storage";
import { readdir } from "node:fs/promises";
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
if (!bucket) throw new Error("App Storage is required");
const folder = new URL("../../generated-artifacts/media-catalogue/", import.meta.url);
const names = (await readdir(folder)).filter(n => /^outlet-\d{3}\.png$/.test(n));
// Bounded parallelism; no credentials or signed URLs are printed.
for (let i = 0; i < names.length; i += 12) {
  await Promise.all(names.slice(i, i + 12).map(name => storage.bucket(bucket).upload(
    fileURLToPath(new URL(name, folder)),
    { destination: `public/media-catalogue/${name}`, resumable: false,
      metadata: { contentType: "image/png", cacheControl: "public,max-age=86400" } },
  )));
}
await storage.bucket(bucket).upload(
  fileURLToPath(new URL("../../attached_assets/Tropic_Agency_International_Media_Coverage_1792029914839.pdf", import.meta.url)),
  { destination: "public/media-catalogue/tropik-media-coverage.pdf", resumable: false,
    metadata: { contentType: "application/pdf", cacheControl: "public,max-age=86400" } },
);
console.log(`Stored ${names.length} original outlet logos and the source media catalogue.`);
process.exit(0);
