import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";
const storage = new Storage({
  projectId: "", credentials: {
    audience: "replit", subject_token_type: "access_token", token_url: "http://127.0.0.1:1106/token",
    type: "external_account", credential_source: {
      url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" },
    }, universe_domain: "googleapis.com",
  },
});
const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const privateDir = process.env.PRIVATE_OBJECT_DIR;
if (!bucket || !privateDir) throw new Error("App Storage must be configured.");
for (const filename of ["goma-preview.mp4", "radio-okapi-trailer.mp4", "goma.webp", "radio-okapi.webp", "goma-full.mp4"]) {
  const path = filename === "goma-full.mp4" ? `${privateDir.replace(/\/$/, "")}/documentary/${filename}` : `/${bucket}/public/documentary/${filename}`;
  const [b, ...parts] = path.replace(/^\/+/, "").split("/");
  await storage.bucket(b!).upload(fileURLToPath(new URL(`../../generated-artifacts/documentary/${filename}`, import.meta.url)), {
    destination: parts.join("/"), resumable: false,
    metadata: { contentType: filename.endsWith(".webp") ? "image/webp" : "video/mp4", cacheControl: filename === "goma-full.mp4" ? "private,no-store" : "public,max-age=3600" },
  });
  console.log(`Stored ${filename === "goma-full.mp4" ? "PRIVATE" : "public"} documentary asset: ${filename}`);
}
