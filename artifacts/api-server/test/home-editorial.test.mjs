import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import ts from "typescript";

// Execute real services and routes with isolated storage; no Clerk, DB or GCS calls.
const require = createRequire(import.meta.url);
function evaluate(path, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, { exports, require: id => {
    if (id in imports) return imports[id];
    throw Error(`Unmocked dependency: ${id}`);
  }, URL, Date, Map, Set, Object, Buffer });
  return exports;
}
const bundle = buildSync({ entryPoints: [new URL("../../../lib/api-zod/src/generated/api.ts", import.meta.url).pathname],
  bundle: true, write: false, platform: "node", format: "cjs" }).outputFiles[0].text;
const mod = { exports: {} };
runInNewContext(bundle, { module: mod, exports: mod.exports, require, URL, Date });
const shared = evaluate("../../../lib/shared/src/homeEditorial.ts", {});
class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
const image = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa", video = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
function fixture() {
  const rows = [{ id: 1, type: "unrelated", category: "keep", body: "untouched" }];
  const uploads = [
    { id: image, ownerId: 1, ready: true, contentType: "image/png", size: 100 },
    { id: video, ownerId: 2, ready: true, contentType: "video/mp4", size: 100 },
  ];
  const media = Object.fromEntries(["id", "type", "category"].map(k => [k, k]));
  const files = { id: "id", ready: "ready" };
  const drizzle = { eq: (k, v) => r => r[k] === v, and: (...ps) => r => ps.every(p => p(r)), sql: () => "lock" };
  let serial = 1, tail = Promise.resolve();
  const db = {
    select: () => ({ from: table => ({ where: async predicate => (table === files ? uploads : rows).filter(predicate) }) }),
    insert: () => ({ values: async fields => { rows.push({ ...fields, id: ++serial }); } }),
    update: () => ({ set: fields => ({ where: async predicate => { rows.filter(predicate).forEach(r => Object.assign(r, fields)); } }) }),
    execute: async () => {},
    transaction: fn => { const pending = tail.then(() => fn(db)); tail = pending.catch(() => {}); return pending; },
  };
  const auth = {
    NetworkError,
    requireFounder: res => { if (!res.locals.actor?.founder) throw new NetworkError(403, "Founder only"); },
    actor: res => res.locals.actor,
    networkAuth: (req, res, next) => {
      if (!req.user) throw new NetworkError(401, "Sign in");
      res.locals.actor = { founder: req.user === "founder", member: { id: 1 } }; return next();
    },
    networkWrite: (req, _res, next) => { if (req.crossOrigin) throw new NetworkError(403, "Origin"); return next(); },
  };
  const storage = {
    ownedMedia: async (owner, ids) => ids.map(id => {
      const u = uploads.find(u => u.id === id && u.ownerId === owner && u.ready);
      if (!u) throw new NetworkError(400, "Own completed upload required");
      return u;
    }),
    objectFile: () => ({ download: async () => [Buffer.from("image")] }),
  };
  const store = evaluate("../src/services/homeEditorial.ts", {
    "drizzle-orm": drizzle, "@workspace/db": { db, mediaItemsTable: media },
    "@workspace/shared": shared, "@workspace/api-zod": mod.exports,
    "./networkAuth": auth, "./networkFiles": storage,
    "./mediaCenterValidation": { MEDIA_IMAGE_TYPES: new Set(["image/png"]), MEDIA_IMAGE_MAX: 5 * 1024 * 1024 },
  });
  const endpoints = new Map();
  const router = Object.fromEntries(["get", "put"].map(method => [method, (path, ...handlers) => endpoints.set(`${method} ${path}`, handlers)]));
  evaluate("../src/routes/homeEditorial.ts", {
    express: { Router: () => router }, "drizzle-orm": drizzle, "@workspace/db": { db, networkUploads: files },
    "../services/networkAuth": auth, "../services/networkFiles": storage, "../services/homeEditorial": store,
  });
  return { store, rows, uploads, async request(method, path, options = {}) {
    const req = { body: {}, headers: {}, params: {}, ...options };
    const res = { locals: {}, set() { return this; }, json(body) { this.body = body; return this; },
      status(code) { this.statusCode = code; return this; }, send(body) { this.body = body; }, end() {} };
    const handlers = endpoints.get(`${method} ${path}`);
    async function run(n = 0) {
      if (!handlers[n]) return;
      let downstream;
      await handlers[n](req, res, error => { if (error) throw error; downstream = run(n + 1); return downstream; });
      await downstream;
    }
    await run();
    // The authenticated media fallback deliberately sends after auth's callback.
    await new Promise(resolve => setImmediate(resolve));
    return res;
  } };
}
const payload = content => ({ content, expectedUpdatedAt: content.updatedAt });
const asset = () => ({ key: "image", uploadId: image, kind: "image", url: "https://ignored.invalid", alt: "Approved scene", credit: "Owner archive", rightsConfirmed: true });

test("defaults are read-only and match the original eight-section order", async () => {
  const f = fixture(), doc = await f.store.homeDocument();
  assert.equal(doc.sections.map(s => s.type).join(","), "hero,universe,programmes,movement,origin,archive,paths,join");
  assert.ok(doc.sections.every(s => s.enabled && s.layout === "original"));
  assert.equal(f.rows.length, 1);
});
test("draft edits, reordering, new sections and removals remain private until publication", async () => {
  const f = fixture(), doc = shared.defaultHomeEditorial();
  doc.status = "draft";
  doc.sections[0].fields.title = "Private title";
  doc.sections[0].media.push(asset());
  doc.sections.reverse();
  const saved = await f.store.saveHome(payload(doc), 1);
  assert.equal(saved.sections[7].fields.title, "Private title");
  assert.equal((await f.store.homeDocument()).sections[0].fields.title, undefined);
  assert.equal((await f.store.homeDocument(true)).sections[7].fields.title, "Private title");
  saved.sections = [saved.sections[7], { ...saved.sections[0], id: "custom-one", type: "custom", fields: { title: "New block" } }];
  saved.status = "published";
  const live = await f.store.saveHome(payload(saved), 1);
  assert.equal((await f.store.homeDocument()).sections.length, 2);
  assert.equal((await f.store.homeDocument()).sections[1].fields.title, "New block");
  live.status = "draft"; live.sections[0].fields.title = "Next draft";
  await f.store.saveHome(payload(live), 1);
  assert.equal((await f.store.homeDocument()).sections[0].fields.title, "Private title");
  assert.equal(f.rows[0].body, "untouched");
});
test("stale and simultaneous saves cannot overwrite newer content", async () => {
  const f = fixture(), doc = shared.defaultHomeEditorial();
  doc.status = "draft";
  const results = await Promise.allSettled([f.store.saveHome(payload(doc), 1), f.store.saveHome(payload(doc), 1)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.find(r => r.status === "rejected").reason.status, 409);
});
test("public response excludes hidden sections and derives media URLs; drafts and removed media stay protected", async () => {
  const f = fixture(), doc = shared.defaultHomeEditorial();
  doc.sections[0].enabled = false;
  doc.sections[0].fields.title = "Not public";
  doc.sections[0].media = [asset()];
  const saved = await f.store.saveHome(payload(doc), 1);
  const dto = f.store.homeDTO(saved);
  assert.equal(dto.sections.some(s => s.id === "hero"), false);
  assert.equal(f.store.homeUploads(saved, true).has(image), false);
  const admin = f.store.homeDTO(saved, true);
  assert.match(admin.sections[0].media[0].url, /^\/api\/home-editorial\/assets\//);
  assert.equal(saved.sections[0].media[0].url, null);
  await assert.rejects(f.request("get", "/home-editorial/assets/:id", { params: { id: image } }), e => e.status === 401);
  await assert.rejects(f.request("get", "/home-editorial/assets/:id", { params: { id: image }, user: "member" }), e => e.status === 403);
  assert.ok((await f.request("get", "/home-editorial/assets/:id", { params: { id: image }, user: "founder" })).body);
});
test("Founder and same-origin gates protect reads and writes", async () => {
  const f = fixture(), body = payload(shared.defaultHomeEditorial());
  for (const method of ["get", "put"]) {
    await assert.rejects(f.request(method, "/founder/home-editorial", { body }), e => e.status === 401);
    await assert.rejects(f.request(method, "/founder/home-editorial", { user: "member", body }), e => e.status === 403);
  }
  await assert.rejects(f.request("put", "/founder/home-editorial", { user: "founder", body, crossOrigin: true }), e => e.status === 403);
  assert.equal(f.rows.length, 1);
});
test("unsafe links, duplicate sections, invalid media and missing publishing rights are rejected", async () => {
  for (const badLink of ["javascript:alert(1)", "//outside.invalid", "/\\outside.invalid", "data:text/html,test", "https://user:pass@example.com"]) {
    const f = fixture(), doc = shared.defaultHomeEditorial();
    doc.sections[0].fields.ctaHref = badLink;
    await assert.rejects(f.store.saveHome(payload(doc), 1), e => e.status === 400);
  }
  for (const link of ["/join", "/ecosystem#explore", "#archive", "https://example.com/page"]) assert.equal(fixture().store.safeHomeLink(link), true);
  const automatic = shared.defaultHomeEditorial();
  automatic.status = "draft";
  automatic.sections[0].fields.primaryHref = "auto";
  automatic.sections[7].fields.primaryHref = "auto";
  assert.ok(await fixture().store.saveHome(payload(automatic), 1));
  for (const change of [
    d => d.sections.push(structuredClone(d.sections[0])),
    d => { d.sections[0].media = [{ ...asset(), rightsConfirmed: false }]; },
    d => { d.sections[0].media = [{ ...asset(), alt: "" }]; },
    d => { d.sections[0].media = [{ ...asset(), uploadId: video, kind: "video" }]; },
    d => { d.sections[0].fields.title = "x".repeat(5001); },
    d => { d.sections = []; },
    d => { d.sections[0].fields = JSON.parse('{"__proto__":"no"}'); },
  ]) {
    const f = fixture(), doc = shared.defaultHomeEditorial(); change(doc);
    await assert.rejects(f.store.saveHome(payload(doc), 1), e => e.status === 400);
    assert.equal(f.rows.length, 1);
  }
});
