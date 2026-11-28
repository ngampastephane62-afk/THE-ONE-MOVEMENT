import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// No DB, cloud credentials, HTTP requests or real files are written by this suite.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/services/networkFiles.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const isolationSource = readFileSync(new URL("../src/services/mediaIsolation.ts", import.meta.url), "utf8");
const isolationModule = { exports: {} };
runInNewContext(ts.transpileModule(isolationSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { module: isolationModule, exports: isolationModule.exports });

function fixture(scope = "news-pending", kind = "image/png") {
  const id = "fc85dd5f-d93c-40ca-9c8a-32f47c297ab1";
  const row = { id, ownerId: 17, objectPath: `/bucket/private/${scope}/17/${id}`, size: 8, contentType: kind, ready: false };
  let reads = 0, deleted = false;
  let bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  let size = row.size;
  const matches = c => c.op === "and" ? c.parts.every(matches) : row[c.key] === c.value;
  const db = {
    select: () => ({ from: () => ({ where: async c => matches(c) ? [row] : [] }) }),
    update: () => ({ set: patch => ({ where: async () => Object.assign(row, patch) }) }),
  };
  class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const cloudFile = {
    getMetadata: async () => { reads++; return [{ size, contentType: row.contentType }]; },
    download: async () => [bytes],
    delete: async () => { deleted = true; },
  };
  class Storage { bucket() { return { file: () => cloudFile }; } }
  const mockRequire = name => {
    if (name === "@google-cloud/storage") return { Storage };
    if (name === "./objectStorage") return { objectFile: () => cloudFile, replitStorage: () => new Storage() };
    if (name === "@workspace/db") return { db, networkUploads: { id: "id", ownerId: "ownerId" } };
    if (name === "./networkAuth") return { NetworkError };
    if (name === "./mediaIsolation") return isolationModule.exports;
    if (name === "@workspace/shared") return { maxUploadBytes: () => 500 * 1024 * 1024, UPLOAD_LIMITS: {} };
    if (name === "drizzle-orm") return { eq: (key, value) => ({ key, value }), and: (...parts) => ({ op: "and", parts }) };
    return require(name);
  };
  const module = { exports: {} };
  runInNewContext(code, { module, exports: module.exports, require: mockRequire, Buffer, process });
  return { id, row, api: module.exports, setBytes: value => { bytes = value; }, setSize: value => { size = value; },
    get reads() { return reads; }, get deleted() { return deleted; } };
}

test("News route can validate its pending upload without opening ordinary member finalization", async () => {
  const f = fixture();
  await assert.rejects(f.api.completeUpload(17, f.id), e => e.status === 400);
  assert.equal(f.reads, 0);
  await f.api.completeUpload(17, f.id, undefined, "news");
  assert.equal(f.row.ready, true);
  assert.equal(f.deleted, false);
});

test("dedicated News scope cannot finalize another owner's file or gratitude media", async () => {
  const news = fixture();
  await assert.rejects(news.api.completeUpload(18, news.id, undefined, "news"), e => e.status === 404);
  const gratitude = fixture("gratitude-pending");
  await assert.rejects(gratitude.api.completeUpload(17, gratitude.id, undefined, "news"), e => e.status === 400);
  assert.equal(gratitude.reads, 0);
  await gratitude.api.completeUpload(17, gratitude.id, undefined, "gratitude");
  assert.equal(gratitude.row.ready, true);
});

test("gratitude scope cannot finalize News pending uploads, and private review media stay private", async () => {
  const news = fixture();
  await assert.rejects(news.api.completeUpload(17, news.id, undefined, "gratitude"), e => e.status === 400);
  const privateFile = fixture("gratitude-private");
  await assert.rejects(privateFile.api.completeUpload(17, privateFile.id, undefined, "gratitude"), e => e.status === 400);
});

test("News dedicated finalization retains exact size and byte signature checks", async () => {
  const mismatch = fixture();
  mismatch.setSize(9);
  await assert.rejects(mismatch.api.completeUpload(17, mismatch.id, undefined, "news"), /declared type and size/);
  assert.equal(mismatch.row.ready, false);
  assert.equal(mismatch.deleted, true);
  const spoofed = fixture();
  spoofed.setBytes(Buffer.from("not a png"));
  await assert.rejects(spoofed.api.completeUpload(17, spoofed.id, undefined, "news"), /allowed media format/);
  assert.equal(spoofed.row.ready, false);
});

test("supported MP4 header and ordinary network uploads still finalize", async () => {
  const video = fixture("news-pending", "video/mp4");
  video.setBytes(Buffer.from("\0\0\0\x18ftypisom", "latin1"));
  await video.api.completeUpload(17, video.id, undefined, "news");
  assert.equal(video.row.ready, true);
  const ordinary = fixture("network");
  await ordinary.api.completeUpload(17, ordinary.id);
  assert.equal(ordinary.row.ready, true);
});

test("authorized News route passes dedicated scope only after checking owner and pending suffix", () => {
  const route = readFileSync(new URL("../src/routes/newsPublishing.ts", import.meta.url), "utf8");
  assert.match(route, /eq\(uploads\.ownerId, ownerId\)/);
  assert.match(route, /if \(!row\.objectPath\.endsWith\(pendingSuffix\)\)[\s\S]*?completeUpload\(ownerId, id, tx, "news"\)/);
  assert.match(route, /copy\(objectFile\(finalPath\)\)/);
});
