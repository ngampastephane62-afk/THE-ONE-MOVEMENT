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

for (const slug of ["goma-donation", "previous-editions"]) {
  for (const ext of ["mp4", "webm", "webp"]) {
    const filename = `${slug}.${ext}`;
    await storage.bucket(bucket).upload(
      fileURLToPath(new URL(`../../generated-artifacts/editorial-media/${filename}`, import.meta.url)),
      {
        destination: `public/editorial-media/${filename}`, resumable: false,
        metadata: {
          contentType: ext === "webp" ? "image/webp" : `video/${ext}`,
          cacheControl: "public,max-age=86400",
        },
      },
    );
    console.log(`Stored editorial asset: ${filename}`);
  }
}
const [privateBucket, ...prefix] = privateDir.replace(/^\/+/, "").replace(/\/$/, "").split("/");
for (const [source, name, contentType] of [
  ["v09025g40000cpi0aivog65o7bmt50l0_1792105269754.mp4", "goma-donation-original.mp4", "video/mp4"],
  ["99f4549341f3407681793a8e1f2e4a5f_1791970203748.mov", "previous-editions-original.mov", "video/quicktime"],
  ["The_One_Movement_International_Narrative_FINAL_1792105099109.pdf", "movement-narrative.pdf", "application/pdf"],
  ["THE_ONE_MOVEMENT_X_THANKS_EMIRATES_1792105175121.pdf", "thanks-emirates-strategic-vision.pdf", "application/pdf"],
]) {
  await storage.bucket(privateBucket!).upload(
    fileURLToPath(new URL(`../../attached_assets/${source}`, import.meta.url)),
    { destination: `${prefix.join("/")}/editorial-originals/${name}`, resumable: false,
      metadata: { contentType, cacheControl: "private,no-store" } },
  );
  console.log(`Archived source privately: ${name}`);
}
process.exit(0);
