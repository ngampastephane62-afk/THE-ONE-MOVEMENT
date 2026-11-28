import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

// Replit stays the default; other hosts opt in explicitly. No cloud calls.
const bundled = await build({ stdin: { contents: 'export * from "./src/lib/deployment"; export { storageBackend, splitObjectPath } from "./src/services/objectStorage";',
  resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false, plugins: [{
  name: "no-cloud-sdks", setup(b) {
    b.onResolve({ filter: /^@google-cloud\/storage$|^@aws-sdk\// }, () => ({ path: "sdk", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: `export class Storage {} export class S3Client {}
      export class GetObjectCommand {} export class HeadObjectCommand {} export class PutObjectCommand {}
      export class DeleteObjectCommand {} export class CopyObjectCommand {} export const getSignedUrl = () => { throw Error("stub"); };` }));
  },
}] });
const m = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);

test("storage backend defaults to Replit and only accepts known values", () => {
  assert.equal(m.storageBackend({}), "replit");
  assert.equal(m.storageBackend({ OBJECT_STORAGE_BACKEND: "replit" }), "replit");
  assert.equal(m.storageBackend({ OBJECT_STORAGE_BACKEND: "S3" }), "s3");
  assert.throws(() => m.storageBackend({ OBJECT_STORAGE_BACKEND: "gcs" }));
});
test("object paths keep their /bucket/key meaning", () => {
  assert.deepEqual(m.splitObjectPath("/tomi-public/public/home-reels/reel-1.mp4"), { bucket: "tomi-public", key: "public/home-reels/reel-1.mp4" });
  assert.throws(() => m.splitObjectPath("/only-bucket"));
});
test("production is Replit's deployment flag or an explicit APP_ENV", () => {
  assert.equal(m.isProductionDeployment({}), false);
  assert.equal(m.isProductionDeployment({ REPLIT_DEPLOYMENT: "1" }), true);
  assert.equal(m.isProductionDeployment({ APP_ENV: "production" }), true);
  assert.equal(m.isProductionDeployment({ APP_ENV: "staging", NODE_ENV: "production" }), false);
});
test("webhook host prefers Replit domains, then the public site URL", () => {
  assert.equal(m.publicWebhookHost({ REPLIT_DOMAINS: "a.replit.app,b.example" , TOMI_PUBLIC_SITE_URL: "https://x.example" }), "a.replit.app");
  assert.equal(m.publicWebhookHost({ TOMI_PUBLIC_SITE_URL: "https://staging.fly.dev/" }), "staging.fly.dev");
  assert.equal(m.publicWebhookHost({ TOMI_PUBLIC_SITE_URL: "not a url" }), undefined);
  assert.equal(m.publicWebhookHost({}), undefined);
});
