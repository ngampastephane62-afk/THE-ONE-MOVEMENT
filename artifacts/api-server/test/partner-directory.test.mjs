import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { buildSync } from "esbuild";
import ts from "typescript";

// Isolated persistence/HTTP contract fixtures: no actual DB, Clerk or App Storage.
const require = createRequire(import.meta.url);
function evaluate(path, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  runInNewContext(code, { exports, require: id => {
    if (id in imports) return imports[id];
    throw new Error(`Unmocked dependency ${id}`);
  }, URL, Date, Set, Map, Buffer, Object, console });
  return exports;
}
const bundled = buildSync({ entryPoints: [new URL("../../../lib/api-zod/src/generated/api.ts", import.meta.url).pathname], bundle: true, write: false, platform: "node", format: "cjs" }).outputFiles[0].text;
const module = { exports: {} };
runInNewContext(bundled, { module, exports: module.exports, require, URL, Date });
const schemas = module.exports;
class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
const shared = evaluate("../../../lib/shared/src/partner-directory.ts", {});
const validation = evaluate("../src/services/partnerDirectoryValidation.ts", { "@workspace/api-zod": schemas, "./networkAuth": { NetworkError }, "@workspace/shared/partner-directory": shared });
const catalog = evaluate("../src/services/partnerDirectoryCatalog.ts", { "@workspace/shared/partner-directory": shared });
const input = (extra = {}) => ({
  name: "Example Organization", category: "corporate-brands", relationship: "event-collaborator",
  description: "An approved event relationship.", website: "https://example.org",
  logoUploadId: null, legacyLogoId: null, status: "draft",
  relationshipVerified: false, rightsConfirmed: false, priority: 10, expectedUpdatedAt: null, ...extra,
});

function fixture() {
  let rows = [{ id: 1, type: "unrelated", title: "Preserve me", body: "untouched", status: "published", updatedAt: new Date("2026-01-01") }];
  const uploaded = [
    { id: "own", ownerId: 1, ready: true, contentType: "image/png", size: 100, objectPath: "private/own" },
    { id: "other", ownerId: 2, ready: true, contentType: "image/png", size: 100, objectPath: "private/other" },
    { id: "svg", ownerId: 1, ready: true, contentType: "image/svg+xml", size: 100, objectPath: "private/svg" },
    { id: "large", ownerId: 1, ready: true, contentType: "image/png", size: 6000000, objectPath: "private/large" },
  ];
  const media = Object.fromEntries(["id", "type", "title", "body", "status", "updatedAt"].map(k => [k, k]));
  const uploads = Object.fromEntries(["id", "ready"].map(k => [k, k]));
  const drizzle = {
    eq: (k, v) => row => row[k] instanceof Date && v instanceof Date ? row[k].getTime() === v.getTime() : row[k] === v,
    inArray: (k, values) => row => values.includes(row[k]),
    and: (...predicates) => row => predicates.every(p => p(row)), sql: () => "transaction lock",
  };
  let serial = 100, tail = Promise.resolve();
  const db = {
    select: () => ({ from: table => ({ where: async predicate => (table === uploads ? uploaded : rows).filter(predicate) }) }),
    insert: () => ({ values: data => {
      const result = { ...data, id: ++serial, createdAt: new Date(), updatedAt: data.updatedAt ?? new Date() };
      rows.push(result);
      return { returning: async () => [result] };
    } }),
    update: () => ({ set: data => ({ where: predicate => {
      const found = rows.filter(predicate); found.forEach(row => Object.assign(row, data));
      return { returning: async () => found };
    } }) }),
    execute: async () => {},
    transaction: fn => {
      const run = tail.then(() => fn(db));
      tail = run.catch(() => {});
      return run;
    },
  };
  const auth = {
    NetworkError, requireFounder: res => { if (!res.locals.actor?.founder) throw new NetworkError(403, "Founder only"); },
    actor: res => res.locals.actor,
    networkAuth: (req, res, next) => {
      if (!req.user) throw new NetworkError(401, "Sign in");
      res.locals.actor = { founder: req.user === "founder", member: { id: 1 } };
      return next();
    },
    networkWrite: (req, _res, next) => { if (req.crossOrigin) throw new NetworkError(403, "Origin"); return next(); },
  };
  const files = {
    ownedMedia: async (ownerId, ids) => ids.map(id => {
      const row = uploaded.find(x => x.id === id && x.ownerId === ownerId && x.ready);
      if (!row) throw new NetworkError(400, "Own ready image required");
      return row;
    }),
    objectFile: () => ({ download: async () => [Buffer.from("image")] }),
  };
  const imageValidation = { MEDIA_IMAGE_TYPES: new Set(["image/png", "image/jpeg", "image/webp"]), MEDIA_IMAGE_MAX: 5 * 1024 * 1024 };
  const imports = {
    "node:crypto": require("node:crypto"), "drizzle-orm": drizzle,
    "@workspace/db": { db, mediaItemsTable: media, networkUploads: uploads },
    "@workspace/api-zod": schemas, "./networkAuth": auth, "./networkFiles": files,
    "./mediaCenterValidation": imageValidation, "./partnerDirectoryCatalog": catalog, "./partnerDirectoryValidation": validation,
  };
  const store = evaluate("../src/services/partnerDirectoryStore.ts", imports);
  const endpoints = new Map();
  const router = Object.fromEntries(["get", "post", "put", "delete"].map(method => [method, (path, ...handlers) => endpoints.set(`${method} ${path}`, handlers)]));
  evaluate("../src/routes/partnerDirectory.ts", {
    express: { Router: () => router }, "drizzle-orm": drizzle, "@workspace/db": imports["@workspace/db"],
    "@workspace/api-zod": schemas, "../services/networkAuth": auth,
    "../services/networkFiles": files, "../services/partnerDirectoryStore": store, "../services/mediaCenterValidation": imageValidation,
  });
  return {
    store, rows: () => rows,
    async request(method, path, options = {}) {
      const hs = endpoints.get(`${method} ${path}`);
      assert.ok(hs, `${method} ${path}`);
      const req = { params: {}, body: {}, ...options };
      const res = {
        locals: {}, statusCode: 200, headers: {},
        set(k, v) { if (typeof k === "object") Object.assign(this.headers, k); else this.headers[k] = v; return this; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
        send(body) { this.body = body; return this; },
      };
      function run(n = 0) {
        if (!hs[n]) return;
        let downstream;
        const own = hs[n](req, res, error => { if (error) throw error; downstream = run(n + 1); return downstream; });
        return Promise.resolve(own).then(() => downstream);
      }
      await run(); await Promise.resolve(); await Promise.resolve();
      return res;
    },
  };
}

test("archive identities stay unique, names visible in data, Banking excluded and reference candidates private", async () => {
  const f = fixture();
  const publicRes = await f.request("get", "/partner-directory");
  const admin = await f.request("get", "/founder/partner-directory", { user: "founder" });
  const names = publicRes.body.items.map(p => shared.normalizedOrganization(p.name));
  assert.equal(new Set(names).size, names.length);
  assert.ok(publicRes.body.items.some(p => p.name === "Rawbank"));
  assert.ok(!names.includes("banking"));
  for (const name of ["Netflix", "France 24", "AMAYA"]) {
    assert.ok(admin.body.items.some(p => p.name === name && p.status === "draft" && !p.relationshipVerified));
    assert.ok(!publicRes.body.items.some(p => p.name === name));
  }
  assert.equal(publicRes.body.content.heroTitle, "OUR GLOBAL NETWORK.");
  assert.equal(f.rows().length, 1, "GET must not seed or migrate database");
});

test("only Founder can manage records or text; origin gate and strict publish rules apply", async () => {
  const f = fixture();
  for (const [user, status] of [[undefined, 401], ["member", 403]]) {
    await assert.rejects(f.request("post", "/founder/partner-directory", { user, body: input() }), e => e.status === status);
    await assert.rejects(f.request("put", "/founder/partner-directory/content", { user, body: {} }), e => e.status === status);
  }
  await assert.rejects(f.request("post", "/founder/partner-directory", { user: "founder", crossOrigin: true, body: input() }), e => e.status === 403);
  for (const extra of [{ name: "" }, { name: "Banking" }, { name: "BANK" }, { status: "published" }, { website: "javascript:alert(1)" }, { website: "https://x:password@example.org" }, { name: "Example", evil: true }]) {
    assert.throws(() => validation.partnerInput(input(extra)), e => e.status === 400);
  }
});

test("draft, logo, publication, replacement, unpublish and removal persist with no baseline resurrection", async () => {
  const f = fixture();
  const draft = await f.store.savePartner(input(), 1);
  assert.ok(!(await f.request("get", "/partner-directory")).body.items.some(p => p.id === draft.id));
  const publishInput = input({ logoUploadId: "own", rightsConfirmed: true, relationshipVerified: true, status: "published", expectedUpdatedAt: draft.updatedAt });
  const published = await f.store.savePartner(publishInput, 1, draft.id);
  const publicRecord = (await f.request("get", "/partner-directory")).body.items.find(p => p.id === draft.id);
  assert.equal(publicRecord.logoUploadId, null, "public cannot see raw private upload IDs");
  assert.match(publicRecord.logoUrl, /partner-directory\/custom-/);
  const img = await f.request("get", "/partner-directory/:id/logo", { params: { id: draft.id } });
  assert.equal(img.statusCode, 200);
  const unpublished = await f.store.savePartner({ ...publishInput, status: "draft", expectedUpdatedAt: published.updatedAt }, 1, draft.id);
  await assert.rejects(f.request("get", "/partner-directory/:id/logo", { params: { id: draft.id } }), e => e.status === 401);
  await f.store.removePartner(draft.id, unpublished.updatedAt);
  assert.ok(!(await f.store.partnerState()).items.some(p => p.id === draft.id));
  const baseline = (await f.store.partnerState()).items.find(p => p.name === "Rawbank");
  await f.store.removePartner(baseline.id, "baseline");
  assert.ok(!(await f.store.partnerState()).items.some(p => p.id === baseline.id));
  assert.ok(!(await f.store.partnerState()).items.some(p => p.id === baseline.id), "new reads must retain tombstone");
  assert.equal(f.rows().find(r => r.type === "unrelated").body, "untouched");
});

test("duplicate aliases and concurrent first writes are serialized; stale versions do not overwrite", async () => {
  const f = fixture();
  await assert.rejects(f.store.savePartner(input({ name: "TV5MONDE Afrique" }), 1), e => e.status === 409);
  await assert.rejects(f.store.savePartner(input({ name: "Tropic Agency" }), 1), e => e.status === 409);
  const pair = await Promise.allSettled([f.store.savePartner(input(), 1), f.store.savePartner(input({ name: "Example Organization" }), 1)]);
  assert.equal(pair.filter(p => p.status === "fulfilled").length, 1);
  const draft = pair.find(p => p.status === "fulfilled").value;
  await f.store.savePartner(input({ expectedUpdatedAt: draft.updatedAt, description: "Changed" }), 1, draft.id);
  await assert.rejects(f.store.savePartner(input({ expectedUpdatedAt: draft.updatedAt }), 1, draft.id), e => e.status === 409);
  await assert.rejects(f.store.removePartner(draft.id, draft.updatedAt), e => e.status === 409);
});

test("new logo references require owned, ready, safe images; archived logos never get reassigned", async () => {
  const f = fixture();
  for (const logoUploadId of ["other", "svg", "large"]) {
    await assert.rejects(f.store.savePartner(input({ logoUploadId, rightsConfirmed: true }), 1), e => e.status === 400);
  }
  await assert.rejects(f.store.savePartner(input({ legacyLogoId: 38 }), 1), e => e.status === 400);
  const baseline = (await f.store.partnerState()).items.find(p => p.id === "history-38");
  const { id, updatedAt, logoUrl, ...fields } = baseline;
  const edited = await f.store.savePartner({ ...fields, expectedUpdatedAt: updatedAt, description: "Founder-approved campaign relationship." }, 1, id);
  assert.equal(edited.legacyLogoId, 38);
  assert.equal(f.rows().find(r => r.type === "unrelated").body, "untouched");
});

test("page text edits persist independently, reject blanks and retain optimistic concurrency", async () => {
  const f = fixture();
  const { updatedAt, ...text } = (await f.store.partnerState()).content;
  const edited = await f.store.savePartnerContent({ ...text, heroTitle: "A VERIFIED NETWORK.", expectedUpdatedAt: updatedAt });
  assert.equal((await f.request("get", "/partner-directory")).body.content.heroTitle, "A VERIFIED NETWORK.");
  await assert.rejects(f.store.savePartnerContent({ ...text, expectedUpdatedAt: updatedAt }), e => e.status === 409);
  assert.throws(() => validation.partnerContentInput({ ...text, heroTitle: "  ", expectedUpdatedAt: edited.updatedAt }), e => e.status === 400);
});
