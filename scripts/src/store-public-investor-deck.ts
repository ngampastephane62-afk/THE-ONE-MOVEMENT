import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../../", import.meta.url)));
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
if (!bucket) throw new Error("App Storage is required.");
for (const document of [
  { folder: "investment-presentation", rendered: "public-investor-deck", source: "attached_assets/INVESTOR_DECK_TOM__1792181262036.pdf" },
  { folder: "partnership-presentation", rendered: "public-partnership-deck", source: "attached_assets/INVESTMENT_PACKAGE_TOMI_FINAL_1792181636122.pdf" },
]) {
 for (let page = 0; page <= 18; page++) {
  const filename = page ? `page-${String(page).padStart(2, "0")}.jpg` : "presentation.pdf";
  const source = page
    ? `generated-artifacts/${document.rendered}/${filename}`
    : document.source;
  await storage.bucket(bucket).upload(source, {
    destination: `public/${document.folder}/${filename}`, resumable: false,
    metadata: { contentType: page ? "image/jpeg" : "application/pdf", cacheControl: "public,max-age=3600" },
  });
  console.log(`Stored public ${document.folder}: ${filename}`);
 }
}
