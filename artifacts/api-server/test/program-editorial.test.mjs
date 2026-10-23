import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import ts from "typescript";

// Contract and persistence fixtures only: no database, auth account or file writes.
const require = createRequire(import.meta.url);
function evaluate(path, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  runInNewContext(code, { exports, require: id => {
    if (id in imports) return imports[id];
    throw new Error(`Unmocked dependency ${id}`);
  }, URL, Date, Map, Set, Object, Buffer, console });
  return exports;
}
const bundled = buildSync({ entryPoints: [new URL("../../../lib/api-zod/src/generated/api.ts", import.meta.url).pathname], bundle: true, write: false, platform: "node", format: "cjs" }).outputFiles[0].text;
const module = { exports: {} };
runInNewContext(bundled, { module, exports: module.exports, require, URL, Date });
const schemas = module.exports;
const shared = evaluate("../../../lib/shared/src/ambassadorCatalogue.ts", {});
class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
const own = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const other = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const image = "cccccccc-cccc-4ccc-cccc-cccccccccccc";
function fixture() {
  const rows = [{ id: 1, type: "unrelated", category: "keep", body: "untouched", updatedAt: new Date() }];
  const uploads = [
    { id: own, ownerId: 1, ready: true, contentType: "video/mp4", size: 100 },
    { id: other, ownerId: 2, ready: true, contentType: "video/mp4", size: 100 },
    { id: image, ownerId: 1, ready: true, contentType: "image/png", size: 100 },
  ];
  const media = Object.fromEntries(["id", "type", "category", "body", "updatedAt"].map(k => [k, k]));
  const files = Object.fromEntries(["id", "ready"].map(k => [k, k]));
  const drizzle = { eq: (k, v) => row => row[k] === v, and: (...ps) => row => ps.every(p => p(row)), sql: () => "lock" };
  let serial = 1, tail = Promise.resolve();
  const db = {
    select: () => ({ from: table => ({ where: async predicate => (table === files ? uploads : rows).filter(predicate) }) }),
    insert: () => ({ values: fields => { rows.push({ ...fields, id: ++serial }); return Promise.resolve(); } }),
    update: () => ({ set: fields => ({ where: predicate => { rows.filter(predicate).forEach(r => Object.assign(r, fields)); return Promise.resolve(); } }) }),
    execute: async () => {},
    transaction: fn => { const pending = tail.then(() => fn(db)); tail = pending.catch(() => {}); return pending; },
  };
  const auth = {
    NetworkError, requireFounder: res => { if (!res.locals.actor?.founder) throw new NetworkError(403, "Founder only"); },
    actor: res => res.locals.actor,
    networkAuth: (req, res, next) => { if (!req.user) throw new NetworkError(401, "Sign in"); res.locals.actor = { founder: req.user === "founder", member: { id: 1 } }; return next(); },
    networkWrite: (req, _res, next) => { if (req.crossOrigin) throw new NetworkError(403, "Origin"); return next(); },
  };
  const storage = {
    ownedMedia: async (ownerId, ids) => ids.map(id => {
      const u = uploads.find(x => x.id === id && x.ownerId === ownerId && x.ready);
      if (!u) throw new NetworkError(400, "Own completed upload required");
      return u;
    }),
    objectFile: () => ({ download: async () => [Buffer.from("video")] }),
  };
  const store = evaluate("../src/services/programEditorial.ts", {
    "drizzle-orm": drizzle, "@workspace/db": { db, mediaItemsTable: media }, "@workspace/shared": shared,
    "@workspace/api-zod": schemas, "./networkAuth": auth, "./networkFiles": storage,
    "./mediaCenterValidation": { MEDIA_IMAGE_TYPES: new Set(["image/png", "image/jpeg", "image/webp"]), MEDIA_IMAGE_MAX: 5 * 1024 * 1024 },
  });
  const endpoints = new Map();
  const router = Object.fromEntries(["get", "put"].map(method => [method, (path, ...handlers) => endpoints.set(`${method} ${path}`, handlers)]));
  evaluate("../src/routes/programEditorial.ts", {
    express: { Router: () => router }, "drizzle-orm": drizzle,
    "@workspace/db": { db, networkUploads: files }, "../services/networkAuth": auth,
    "../services/networkFiles": storage, "../services/programEditorial": store,
  });
  return { store, rows,
    async request(method, path, options = {}) {
      const req = { params: { slug: "awards" }, headers: {}, body: {}, ...options };
      const res = { locals: {}, headers: {}, set() { return this; }, json(body) { this.body = body; return this; } };
      const handlers = endpoints.get(`${method} ${path}`);
      async function run(n = 0) {
        if (!handlers[n]) return;
        let downstream;
        await handlers[n](req, res, e => { if (e) throw e; downstream = run(n + 1); return downstream; });
        await downstream;
      }
      await run(); return res;
    },
  };
}
const payload = (content, expectedUpdatedAt = content.updatedAt) => ({ content, expectedUpdatedAt });

test("six read-only defaults preserve nominees, correct clips and no asserted Awards date", async () => {
  const f = fixture();
  for (const slug of Object.keys(f.store.PROGRAM_NAMES)) {
    const doc = await f.store.programDocument(slug);
    assert.equal(doc.slug, slug);
    assert.equal(doc.eventDate, slug === "fashion-week" ? "22 December 2026" : null);
    if (slug !== "awards") assert.equal(doc.people.length, 0);
  }
  const doc = await f.store.programDocument("awards");
  assert.equal(doc.people.filter(p => p.kind === "nominee").length, shared.AMBASSADOR_NOMINEES.length);
  assert.ok(doc.people.find(p => p.id === "ciara").videos.some(v => v.assetKey === "ciara-supplied"));
  assert.ok(doc.people.find(p => p.id === "nancy-isime").videos.some(v => v.assetKey === "nancy-isime-supplied"));
  assert.equal(f.rows.length, 1, "GET must never seed a row or migrate");
  assert.throws(() => f.store.programSlug("made-up"), e => e.status === 404);
});

test("private drafts do not replace the published page; explicit publish and reload persist", async () => {
  const f = fixture(), doc = f.store.defaultProgram("awards");
  doc.status = "draft"; doc.description = "Private working draft";
  const saved = await f.store.saveProgram(payload(doc), "awards", 1);
  assert.equal((await f.store.programDocument("awards")).description, "");
  assert.equal((await f.store.programDocument("awards", true)).description, "Private working draft");
  saved.status = "published";
  await f.store.saveProgram(payload(saved), "awards", 1);
  assert.equal((await f.store.programDocument("awards")).description, "Private working draft");
  assert.equal(f.rows.find(r => r.type === "unrelated").body, "untouched");
});

test("public projection hides drafts, private IDs and unconfirmed date/venue", async () => {
  const f = fixture(), doc = f.store.defaultProgram("awards");
  doc.heroVideoUploadId = own; doc.eventDate = "Unconfirmed"; doc.venue = "Private venue";
  doc.people[0].published = false;
  doc.people.find(p => p.id === "ciara").videos[0].published = false;
  const publicDoc = f.store.programDTO(doc);
  assert.equal(publicDoc.heroVideoUploadId, null);
  assert.ok(publicDoc.heroVideoUrl.includes(own));
  assert.equal(publicDoc.eventDate, null); assert.equal(publicDoc.venue, "");
  assert.ok(!publicDoc.people.some(p => p.id === doc.people[0].id));
  assert.ok(!publicDoc.people.find(p => p.id === "ciara").videos.some(v => v.id === "ciara-announcement"));
});

test("optimistic concurrency rejects stale and simultaneous overwrites", async () => {
  const f = fixture(), doc = f.store.defaultProgram("awards");
  const results = await Promise.allSettled([f.store.saveProgram(payload(doc), "awards", 1), f.store.saveProgram(payload(doc), "awards", 1)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.find(r => r.status === "rejected").reason.status, 409);
});

test("video ownership/type and approved portrait/confirmation gates are enforced", async () => {
  const f = fixture();
  let d = f.store.defaultProgram("awards"); d.heroVideoUploadId = other;
  await assert.rejects(f.store.saveProgram(payload(d), "awards", 1), e => e.status === 400);
  d = f.store.defaultProgram("awards"); d.heroVideoUploadId = image;
  await assert.rejects(f.store.saveProgram(payload(d), "awards", 1), e => e.status === 400);
  d = f.store.defaultProgram("awards"); d.people[0].confirmed = false;
  assert.throws(() => f.store.editorialInput(payload(d), "awards"), e => e.status === 400);
  d = f.store.defaultProgram("awards"); d.people[0].portraitKey = "ciara";
  assert.throws(() => f.store.editorialInput(payload(d), "awards"), e => e.status === 400);
  d = f.store.defaultProgram("awards"); d.people[0].profileUrl = "javascript:alert(1)";
  assert.throws(() => f.store.editorialInput(payload(d), "awards"), e => e.status === 400);
});

test("independent nominee video publication, ordering and replacement survive a reload", async () => {
  const f = fixture(), d = f.store.defaultProgram("awards");
  d.people[0].videos.push({ id: "new-clip", title: "Approved story", description: "Context", credit: "Founder-approved source",
    uploadId: own, assetKey: null, url: null, published: false, rightsConfirmed: false, order: 4 });
  const first = await f.store.saveProgram(payload(d), "awards", 1);
  let publicDoc = f.store.programDTO(await f.store.programDocument("awards"));
  assert.equal(publicDoc.people[0].videos.length, 0);
  first.people[0].videos[0].published = true; first.people[0].videos[0].rightsConfirmed = true;
  first.people[0].videos[0].order = 0;
  await f.store.saveProgram(payload(first), "awards", 1);
  publicDoc = f.store.programDTO(await f.store.programDocument("awards"));
  assert.equal(publicDoc.people[0].videos[0].title, "Approved story");
  assert.equal(publicDoc.people[0].videos[0].uploadId, null);
  assert.ok(publicDoc.people[0].videos[0].url.includes(own));
});

test("only existing Founder authorization can read or change private programme state", async () => {
  const f = fixture();
  for (const [user, status] of [[undefined, 401], ["member", 403]]) {
    await assert.rejects(f.request("get", "/founder/program-editorial/:slug", { user }), e => e.status === status);
    await assert.rejects(f.request("put", "/founder/program-editorial/:slug", { user, body: payload(f.store.defaultProgram("awards")) }), e => e.status === status);
  }
  await assert.rejects(f.request("put", "/founder/program-editorial/:slug", { user: "founder", crossOrigin: true }), e => e.status === 403);
  const res = await f.request("get", "/founder/program-editorial/:slug", { user: "founder" });
  assert.equal(res.body.slug, "awards");
  assert.equal(f.rows.length, 1);
});
