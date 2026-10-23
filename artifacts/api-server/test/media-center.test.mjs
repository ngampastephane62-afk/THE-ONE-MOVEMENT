import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";
import ts from "typescript";

// No real database, Clerk, media storage, Stripe, network or schema changes.
const require = createRequire(import.meta.url);
const schemaSource = buildSync({
  entryPoints: [new URL("../../../lib/api-zod/src/generated/api.ts", import.meta.url).pathname],
  bundle: true, platform: "node", format: "cjs", write: false,
}).outputFiles[0].text;
const schemas = { exports: {} };
runInNewContext(schemaSource, { module: schemas, exports: schemas.exports, require, URL, Date });
const src = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
function evaluate(path, imports) {
  const exports = {};
  const js = ts.transpileModule(src(path), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  runInNewContext(js, {
    exports, URL, Date, Set, Buffer, console,
    require(name) { if (name in imports) return imports[name]; throw Error(`Unexpected import: ${name}`); },
  });
  return exports;
}
const validator = evaluate("services/mediaCenterValidation.ts", {
  "@workspace/api-zod": schemas.exports, "./networkAuth": { NetworkError },
});
const input = (changes = {}) => ({
  title: "International press publication", publisher: "Publisher",
  description: "The original reported publication and its context.",
  category: "international-press", publicationDate: "2026-10-23",
  externalUrl: "https://example.org/article", embed: null, priority: 5,
  status: "published", coverUploadId: null, logoUploadId: null,
  rightsConfirmed: true, expectedUpdatedAt: null, ...changes,
});

test("media validation accepts all eight categories, real dates, optional sources and safe embeds", () => {
  for (const category of ["international-press", "television", "magazine", "newspaper", "interview", "press-release", "official-announcement", "media-partnership"]) {
    assert.equal(validator.mediaPublicationInput(input({ category })).category, category);
  }
  assert.equal(validator.mediaPublicationInput(input({ externalUrl: "" })).externalUrl, "");
  assert.equal(validator.mediaPublicationInput(input({ embed: { provider: "youtube", videoId: "dQw4w9WgXcQ" } })).embed.provider, "youtube");
  assert.equal(validator.mediaPublicationInput(input({ embed: { provider: "vimeo", videoId: "76979871" } })).embed.provider, "vimeo");
  assert.equal(validator.mediaPublicationInput(input({ status: "draft", description: "", publicationDate: "", rightsConfirmed: false })).status, "draft");
});

test("publication rejects malformed dates, links, embeds, priorities, rights and unknown fields", () => {
  for (const changes of [
    { title: "  " }, { publicationDate: "2026-02-30" }, { publicationDate: "" },
    { rightsConfirmed: false }, { description: "" }, { priority: -1 },
    { priority: 1.5 }, { priority: 100001 }, { category: "anything" },
    { externalUrl: "javascript:alert(1)" }, { externalUrl: "https://user:password@example.org" },
    { embed: { provider: "youtube", videoId: "https://youtube.com" } },
    { embed: { provider: "vimeo", videoId: "bad" } },
    { embed: { provider: "youtube", videoId: "dQw4w9WgXcQ", src: "https://evil.test" } },
    { status: "published", ownerId: 1 },
    { status: "draft", coverUploadId: "image", rightsConfirmed: false },
  ]) assert.throws(() => validator.mediaPublicationInput(input(changes)), (e) => e.status === 400, JSON.stringify(changes));
  assert.equal(validator.validPublicationDate("2024-02-29"), true);
  assert.equal(validator.validPublicationDate("2026-02-29"), false);
  assert.throws(() => validator.mediaRevision(null), (e) => e.status === 409);
});

function fixture() {
  const rows = [], files = [], handlers = new Map();
  let nextId = 1;
  const table = (name, keys) => Object.fromEntries(keys.map((key) => [key, { table: name, key }]));
  const publications = table("publications", ["id", "title", "status", "type", "category", "body", "updatedAt"]);
  const uploads = table("uploads", ["id", "ready"]);
  const orm = {
    eq: (a, b) => ({ op: "eq", a, b }), ne: (a, b) => ({ op: "ne", a, b }),
    and: (...conditions) => ({ op: "and", conditions: conditions.filter(Boolean) }),
    asc: (v) => ({ direction: 1, v }), desc: (v) => ({ direction: -1, v }),
    sql: (...args) => ({ expression: args }),
  };
  const val = (x, row) => x?.key ? row[x.key] : x;
  const matches = (c, row) => {
    if (!c) return true;
    if (c.op === "and") return c.conditions.every((x) => matches(x, row));
    const a = val(c.a, row), b = val(c.b, row);
    const same = a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;
    return c.op === "ne" ? !same : same;
  };
  const lazy = (execute) => ({
    then(resolve, reject) { return Promise.resolve().then(execute).then(resolve, reject); },
    returning() { return this; },
  });
  const db = {
    select() {
      let records, where, count = Infinity, skip = 0, ordered = false;
      const q = lazy(() => {
        let result = records.filter((r) => matches(where, r));
        if (ordered && records === rows) result = result.toSorted((a, b) => {
          const x = JSON.parse(a.body), y = JSON.parse(b.body);
          return x.priority - y.priority || y.publicationDate.localeCompare(x.publicationDate) || b.id - a.id;
        });
        return result.slice(skip, skip + count);
      });
      Object.assign(q, {
        from(t) { records = t === uploads ? files : rows; return q; },
        where(c) { where = c; return q; }, limit(n) { count = n; return q; },
        offset(n) { skip = n; return q; }, orderBy() { ordered = true; return q; },
      });
      return q;
    },
    insert() { return { values(v) { return lazy(() => {
      const row = { ...v, id: nextId++, createdAt: new Date() }; rows.push(row); return [row];
    }); } }; },
    update() { return { set(v) { return { where(c) { return lazy(() => {
      const selected = rows.filter((r) => matches(c, r));
      selected.forEach((r) => Object.assign(r, v)); return selected;
    }); } }; } }; },
  };
  const networkAuth = (req, res, next) => {
    if (!req.user) throw new NetworkError(401, "Sign in.");
    res.user = req.user; next();
  };
  const networkWrite = (req, _res, next) => {
    if (req.headers.origin !== "https://preview.test") throw new NetworkError(403, "Invalid request origin.");
    next();
  };
  const auth = {
    NetworkError, networkAuth, networkWrite,
    requireFounder(res) { if (!res.user?.founder) throw new NetworkError(403, "Founder access required."); },
    actor: (res) => ({ member: { id: res.user.id } }),
  };
  evaluate("routes/mediaCenter.ts", {
    express: { Router: () => Object.fromEntries(["get", "post", "put", "delete"].map((method) => [method, (path, ...middleware) => handlers.set(`${method} ${path}`, middleware)])) },
    "drizzle-orm": orm, "@workspace/db": { db, mediaItemsTable: publications, networkUploads: uploads },
    "@workspace/api-zod": schemas.exports, "../services/networkAuth": auth,
    "../services/mediaCenterValidation": validator,
    "../services/networkFiles": {
      ownedMedia: async (owner, ids) => ids.map((id) => {
        const file = files.find((f) => f.id === id && f.ownerId === owner && f.ready);
        if (!file) throw new NetworkError(400, "Attach only your own completed uploads.");
        return file;
      }),
      objectFile: () => ({ download: async () => [Buffer.from("image bytes")] }),
    },
  });
  async function request(method, path, { body, user = { id: 1, founder: true }, params = {}, query = {}, origin = "https://preview.test" } = {}) {
    const req = { body, user, params, query, headers: { origin } };
    const res = { statusCode: 200, destroyed: false, headers: {},
      set(key, value) { typeof key === "string" ? this.headers[key] = value : Object.assign(this.headers, key); return this; },
      status(n) { this.statusCode = n; return this; }, json(v) { this.body = v; return this; },
      send(v) { this.body = v; return this; }, end() {},
    };
    const hs = handlers.get(`${method} ${path}`);
    function run(i = 0) {
      if (!hs[i]) return;
      let nextPromise;
      const own = hs[i](req, res, (err) => { if (err) throw err; nextPromise = run(i + 1); return nextPromise; });
      return Promise.resolve(own).then(() => nextPromise);
    }
    await run();
    // Draft asset callbacks may send asynchronously after auth middleware.
    await Promise.resolve(); await Promise.resolve();
    return res;
  }
  return { rows, files, request };
}

test("authorization and write-origin checks block anonymous, ordinary members and cross-origin writes", async () => {
  const f = fixture();
  await assert.rejects(f.request("get", "/founder/media-center", { user: null }), (e) => e.status === 401);
  await assert.rejects(f.request("post", "/founder/media-center", { body: input(), user: { id: 2, founder: false } }), (e) => e.status === 403);
  await assert.rejects(f.request("post", "/founder/media-center", { body: input(), origin: "https://other.test" }), (e) => e.status === 403);
  assert.equal(f.rows.length, 0);
});

test("draft, publish, edit, reorder, unpublish and delete persist without altering other content types", async () => {
  const f = fixture();
  const draft = (await f.request("post", "/founder/media-center", { body: input({ status: "draft" }) })).body;
  assert.equal((await f.request("get", "/media-center", { user: null })).body.items.length, 0);
  const published = (await f.request("put", "/founder/media-center/:id", {
    params: { id: draft.id }, body: input({ expectedUpdatedAt: draft.updatedAt }),
  })).body;
  await f.request("post", "/founder/media-center", { body: input({ title: "Priority article", priority: 1 }) });
  let page = (await f.request("get", "/media-center", { user: null })).body;
  assert.equal(page.items[0].title, "Priority article");
  assert.equal(page.items[1].id, draft.id);
  const changed = (await f.request("put", "/founder/media-center/:id", {
    params: { id: draft.id }, body: input({ title: "Edited headline", status: "archived", expectedUpdatedAt: published.updatedAt }),
  })).body;
  assert.equal(changed.title, "Edited headline");
  assert.equal((await f.request("get", "/media-center", { user: null })).body.items.length, 1);
  f.rows.push({ id: 99, type: "press-coverage-v1", status: "published", title: "Unrelated press history", body: "{}" });
  await f.request("delete", "/founder/media-center/:id", { params: { id: draft.id }, body: { expectedUpdatedAt: changed.updatedAt } });
  assert.equal(f.rows.find((r) => r.id === draft.id).status, "deleted");
  assert.equal(f.rows.find((r) => r.id === 99).status, "published");
  assert.equal((await f.request("get", "/founder/media-center")).body.items.length, 1);
});

test("concurrent/stale edits or deletions fail safely instead of overwriting saved content", async () => {
  const f = fixture();
  const first = (await f.request("post", "/founder/media-center", { body: input() })).body;
  await f.request("put", "/founder/media-center/:id", { params: { id: first.id }, body: input({ title: "New saved title", expectedUpdatedAt: first.updatedAt }) });
  await assert.rejects(f.request("put", "/founder/media-center/:id", { params: { id: first.id }, body: input({ title: "Stale overwrite", expectedUpdatedAt: first.updatedAt }) }), (e) => e.status === 409);
  await assert.rejects(f.request("delete", "/founder/media-center/:id", { params: { id: first.id }, body: { expectedUpdatedAt: first.updatedAt } }), (e) => e.status === 409);
  assert.equal(f.rows[0].title, "New saved title");
});

test("owned ready image validation and publication-scoped image access protect private uploads", async () => {
  const f = fixture();
  f.files.push({ id: "own-image", ownerId: 1, ready: true, contentType: "image/png", size: 100, objectPath: "/private/image" });
  f.files.push({ id: "other-image", ownerId: 2, ready: true, contentType: "image/png", size: 100 });
  f.files.push({ id: "svg-image", ownerId: 1, ready: true, contentType: "image/svg+xml", size: 100 });
  for (const coverUploadId of ["other-image", "svg-image"]) {
    await assert.rejects(f.request("post", "/founder/media-center", { body: input({ coverUploadId }) }), (e) => e.status === 400, coverUploadId);
  }
  const draft = (await f.request("post", "/founder/media-center", { body: input({ status: "draft", coverUploadId: "own-image" }) })).body;
  assert.equal(draft.coverUploadId, "own-image");
  await assert.rejects(f.request("get", "/media-center/:id/assets/:slot", { params: { id: draft.id, slot: "cover" }, user: null }), (e) => e.status === 401);
  const published = (await f.request("put", "/founder/media-center/:id", { params: { id: draft.id }, body: input({ coverUploadId: "own-image", expectedUpdatedAt: draft.updatedAt }) })).body;
  const publicPage = (await f.request("get", "/media-center", { user: null })).body;
  assert.equal(publicPage.items[0].coverUploadId, null);
  const image = await f.request("get", "/media-center/:id/assets/:slot", { params: { id: draft.id, slot: "cover" }, user: null });
  assert.equal(image.headers["Cache-Control"], "private,no-store");
  await f.request("put", "/founder/media-center/:id", { params: { id: draft.id }, body: input({ status: "draft", coverUploadId: "own-image", expectedUpdatedAt: published.updatedAt }) });
  await assert.rejects(f.request("get", "/media-center/:id/assets/:slot", { params: { id: draft.id, slot: "cover" }, user: null }), (e) => e.status === 401);
  assert.equal(f.files.length, 3);
});
