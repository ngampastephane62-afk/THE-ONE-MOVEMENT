import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";
import ts from "typescript";

// Offline suite: never loads the real DB, auth, storage, Stripe or a server.
const require = createRequire(import.meta.url);
const src = path => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
const validationBundle = buildSync({
  entryPoints: [new URL("../src/services/newsValidation.ts", import.meta.url).pathname],
  bundle: true, platform: "node", format: "cjs", write: false,
}).outputFiles[0].text;
const validationModule = { exports: {} };
runInNewContext(validationBundle, { module: validationModule, exports: validationModule.exports, require, Buffer, URL });
const validation = validationModule.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const snapshot = (title = "First article") => ({
  schemaVersion: 1, title, subtitle: null, category: "news",
  cover: null, video: null, body: [{ type: "paragraph", text: "Editorial content." }],
  additionalImages: [], author: "TOMI Editorial", publicationDate: null,
  relatedPartnerKey: null, relatedProgrammeSlug: null,
  seoTitle: null, seoDescription: null, mediaRightsConfirmed: false,
});
const action = (kind, row, changes = {}) => ({
  action: kind, id: row?.id ?? null, version: row?.version ?? 0,
  slug: kind === "create" ? "editorial-fixture" : kind === "save" ? row.slug : null,
  snapshot: kind === "create" || kind === "save" ? snapshot() : null,
  revisionId: null, ...changes,
});
const table = (name, columns) => Object.fromEntries([
  ["name", name], ...columns.map(key => [key, { table: name, key }]),
]);
const articles = table("articles", ["id", "slug", "status", "version", "draftRevisionId", "publishedRevisionId", "publishedAt", "createdAt", "updatedAt"]);
const revisions = table("revisions", ["id", "articleId", "revisionNo", "snapshot", "createdByMemberId", "createdAt"]);
const audit = table("audit", ["id"]);
const uploads = table("uploads", ["id", "ready", "ownerId"]);
const orm = {
  eq: (a, b) => ({ op: "eq", a, b }),
  and: (...conditions) => ({ op: "and", conditions: conditions.filter(Boolean) }),
  inArray: (a, b) => ({ op: "in", a, b }),
  desc: column => column,
};

function fixture() {
  let state = { articles: [], revisions: [], audit: [], uploads: [] };
  let failAudit = false;
  let queue = Promise.resolve();
  const value = (expression, row) => expression?.key ? row[expression.key] : expression;
  const matches = (condition, row) => !condition ? true :
    condition.op === "and" ? condition.conditions.every(c => matches(c, row)) :
    condition.op === "in" ? condition.b.includes(value(condition.a, row)) :
    value(condition.a, row) === value(condition.b, row);
  const project = (row, projection) => projection ?
    Object.fromEntries(Object.entries(projection).map(([key, col]) => [key, row[col.key]])) : structuredClone(row);
  const lazy = execute => {
    let projection;
    let promise;
    const q = {
      returning(p) { projection = p; return q; },
      then(resolve, reject) {
        promise ??= Promise.resolve().then(() => execute().map(row => project(row, projection)));
        return promise.then(resolve, reject);
      },
    };
    return q;
  };
  const db = {
    select(projection) {
      let source, condition, ordering, maximum = Infinity, offset = 0;
      const q = {
        from(t) { source = t.name; return q; },
        where(c) { condition = c; return q; },
        orderBy(col) { ordering = col; return q; },
        limit(n) { maximum = n; return q; },
        offset(n) { offset = n; return q; },
        for() { return q; },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            let rows = state[source].filter(row => matches(condition, row));
            if (ordering) rows = rows.toSorted((a, b) => b[ordering.key] - a[ordering.key]);
            return rows.slice(offset, offset + maximum).map(row => project(row, projection));
          }).then(resolve, reject);
        },
      };
      return q;
    },
    insert(t) {
      return { values(data) {
        return lazy(() => {
          if (t.name === "audit" && failAudit) throw new Error("isolated audit failure");
          if (t.name === "articles" && state.articles.some(a => a.slug === data.slug)) throw Object.assign(new Error("duplicate"), { code: "23505" });
          const row = {
            ...(t.name === "articles" ? { status: "draft", version: 0, draftRevisionId: null, publishedRevisionId: null, publishedAt: null, updatedAt: new Date() } : {}),
            id: state[t.name].length + 1, createdAt: new Date(), ...structuredClone(data),
          };
          state[t.name].push(row);
          return [row];
        });
      } };
    },
    update(t) {
      return { set(changes) {
        return { where(condition) {
          return lazy(() => state[t.name].filter(row => matches(condition, row)).map(row => Object.assign(row, structuredClone(changes))));
        } };
      } };
    },
    transaction(fn) {
      const run = queue.then(async () => {
        const before = structuredClone(state);
        try { return await fn(db); } catch (error) { state = before; throw error; }
      });
      queue = run.catch(() => {});
      return run;
    },
  };
  const files = {
    async ownedMedia(owner, ids) {
      const found = state.uploads.filter(u => ids.includes(u.id) && u.ownerId === owner && u.ready);
      if (new Set(ids).size !== found.length) throw new validation.NewsError(400, "Attach only your own completed uploads.");
      return found;
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(src("services/newsPublishing.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(code, {
    module, exports: module.exports,
    require(name) {
      if (name === "drizzle-orm") return orm;
      if (name === "@workspace/db") return { db, newsArticles: articles, newsArticleRevisions: revisions, networkAudit: audit, networkUploads: uploads };
      if (name === "./networkFiles") return files;
      if (name === "./newsValidation") return validation;
      throw new Error(`Unexpected runtime dependency: ${name}`);
    },
  });
  return { service: module.exports, state: () => state, failAudit: () => { failAudit = true; } };
}

test("strict action input rejects unknown, spoofed actor and nested HTML fields", () => {
  assert.throws(() => validation.parseNewsAction({ ...action("create"), founder: true }), /Invalid editorial/);
  assert.throws(() => validation.parseNewsAction(action("create", null, { snapshot: { ...snapshot(), actorId: 9 } })), /Unknown content/);
  assert.throws(() => validation.parseNewsAction(action("create", null, { snapshot: { ...snapshot(), body: [{ type: "paragraph", text: "x", html: "<script>" }] } })), /Unknown content/);
  assert.throws(() => validation.parseNewsAction(action("publish", { id: 1, version: 1 }, { snapshot: snapshot() })), /saved version/);
});

test("drafts may be incomplete, publication cannot be incomplete, future-dated or unlicensed", () => {
  assert.doesNotThrow(() => validation.parseNewsAction(action("create", null, { snapshot: { ...snapshot(), title: "", author: null, body: [] } })));
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), title: " " }, true), /title and author/);
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), publicationDate: "2999-01-01T00:00:00Z" }, true), /Future/);
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), cover: { uploadId: "x", alt: "Image", credit: null } }, true), /permission/);
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), relatedPartnerKey: "invented" }), /existing partner/);
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), body: [{ type: "paragraph", text: "x".repeat(100001) }] }), /100,000/);
});

test("embeds use only approved providers and valid identifiers; static URLs are reserved", () => {
  assert.throws(() => validation.parseNewsAction(action("create", null, { slug: "pink-october-burj-khalifa" })), /reserved/);
  assert.throws(() => validation.parseNewsAction(action("create", null, { snapshot: { ...snapshot(), video: { kind: "embed", provider: "youtube", videoId: "<script>" } } })), /identifier/);
  assert.doesNotThrow(() => validation.parseNewsAction(action("create", null, { snapshot: { ...snapshot(), category: "video-news", video: { kind: "embed", provider: "youtube", videoId: "Abcdef_1234" }, mediaRightsConfirmed: true } })));
});

test("saving a published article preserves the public snapshot until explicit publish", async () => {
  const f = fixture();
  let row = await f.service.changeNewsArticle(validation.parseNewsAction(action("create")), 7);
  assert.equal(row.status, "draft");
  assert.equal(row.published, null);
  row = await f.service.changeNewsArticle(action("publish", row), 7);
  const publicId = row.publishedRevisionId;
  row = await f.service.changeNewsArticle(action("save", row, { snapshot: snapshot("Unpublished changes") }), 7);
  assert.equal(row.status, "published");
  assert.equal(row.publishedRevisionId, publicId);
  assert.equal(row.published.title, "First article");
  assert.equal(row.draft.title, "Unpublished changes");
  row = await f.service.changeNewsArticle(action("publish", row), 7);
  assert.equal(row.published.title, "Unpublished changes");
  assert.equal(f.state().revisions.length, 2);
  assert.equal(f.state().audit.length, 4);
});

test("stale concurrent writes conflict without creating a lost revision", async () => {
  const f = fixture();
  const row = await f.service.changeNewsArticle(action("create"), 7);
  const results = await Promise.allSettled([
    f.service.changeNewsArticle(action("save", row, { snapshot: snapshot("One") }), 7),
    f.service.changeNewsArticle(action("save", row, { snapshot: snapshot("Two") }), 7),
  ]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.find(r => r.status === "rejected").reason.status, 409);
  assert.equal(f.state().revisions.length, 2);
});

test("restoring is append-only and never replaces the published revision", async () => {
  const f = fixture();
  let row = await f.service.changeNewsArticle(action("create"), 7);
  const oldRevision = row.draftRevisionId;
  row = await f.service.changeNewsArticle(action("save", row, { snapshot: snapshot("Second") }), 7);
  row = await f.service.changeNewsArticle(action("publish", row), 7);
  row = await f.service.changeNewsArticle(action("restore", row, { revisionId: oldRevision }), 7);
  assert.equal(row.draft.title, "First article");
  assert.equal(row.published.title, "Second");
  assert.notEqual(row.draftRevisionId, oldRevision);
  assert.equal(f.state().revisions.length, 3);
  assert.equal(f.state().revisions[0].snapshot.title, "First article");
  await assert.rejects(f.service.changeNewsArticle(action("restore", row, { revisionId: 999 }), 7), /Revision not found/);
});

test("unpublish and archive retain history; restoring an archive returns a private draft", async () => {
  const f = fixture();
  let row = await f.service.changeNewsArticle(action("create"), 7);
  row = await f.service.changeNewsArticle(action("publish", row), 7);
  row = await f.service.changeNewsArticle(action("unpublish", row), 7);
  assert.equal(row.status, "draft");
  row = await f.service.changeNewsArticle(action("archive", row), 7);
  assert.equal(row.status, "archived");
  row = await f.service.changeNewsArticle(action("restore", row, { revisionId: row.draftRevisionId }), 7);
  assert.equal(row.status, "draft");
  assert.equal(f.state().revisions.length, 2);
});

test("audit failure rolls back article, revisions and version", async () => {
  const f = fixture();
  const row = await f.service.changeNewsArticle(action("create"), 7);
  f.failAudit();
  await assert.rejects(f.service.changeNewsArticle(action("save", row), 7), /audit failure/);
  assert.equal(f.state().articles[0].version, 1);
  assert.equal(f.state().revisions.length, 1);
  assert.equal(f.state().audit.length, 1);
});

test("media cannot promote private/paid uploads by identifier or use a wrong field type", async () => {
  const f = fixture();
  const s = { ...snapshot(), cover: { uploadId: "u", alt: "Credit", credit: null } };
  f.state().uploads.push({ id: "u", ownerId: 7, ready: true, contentType: "image/png", objectPath: "/private/network/7/u" });
  await assert.rejects(f.service.validateEditorialMedia(7, s), /Private or paid/);
  f.state().uploads[0].objectPath = "/private/news/7/u";
  await assert.doesNotReject(f.service.validateEditorialMedia(7, s));
  await assert.rejects(f.service.validateEditorialMedia(8, s), /your own/);
  f.state().uploads[0].contentType = "video/mp4";
  await assert.rejects(f.service.validateEditorialMedia(7, s), /editorial field/);
  f.state().uploads[0].objectPath = "/private/news-pending/7/u";
  assert.equal(validation.isEditorialUpload(f.state().uploads[0]), false);
});

test("public DTO is an explicit projection without draft, actor or revision history", () => {
  const f = fixture();
  const dto = f.service.publicNewsDto({ id: 1, slug: "x", publishedAt: new Date(), draftRevisionId: 99, version: 999, secret: "hidden" }, snapshot());
  assert.deepEqual(Object.keys(dto).sort(), ["id", "publishedAt", "slug", "snapshot"]);
  assert.equal(JSON.stringify(dto).includes("hidden"), false);
});

test("first publication locks slug and duplicate slugs surface as conflicts", async () => {
  const f = fixture();
  let row = await f.service.changeNewsArticle(action("create"), 7);
  await assert.rejects(f.service.changeNewsArticle(action("create"), 7), error => error.status === 409);
  row = await f.service.changeNewsArticle(action("publish", row), 7);
  await assert.rejects(f.service.changeNewsArticle(action("save", row, { slug: "changed" }), 7), /cannot change/);
  assert.equal(f.state().articles[0].slug, "editorial-fixture");
});

test("history is bounded and old snapshots are available on later pages", async () => {
  const f = fixture();
  let row = await f.service.changeNewsArticle(action("create"), 7);
  for (let n = 0; n < 21; n++) row = await f.service.changeNewsArticle(action("save", row, { snapshot: snapshot(`Revision ${n}`) }), 7);
  assert.equal(row.history.length, 20);
  assert.equal(row.historyHasMore, true);
  assert.equal(plain(row.history[0]).revisionNo, 22);
});

test("upload requests reject active SVG, arbitrary fields and oversized media", () => {
  const input = { filename: "image.png", contentType: "image/png", size: 1024 };
  assert.doesNotThrow(() => validation.parseNewsUpload(input));
  assert.throws(() => validation.parseNewsUpload({ ...input, objectPath: "/private/other" }), /allowed image/);
  assert.throws(() => validation.parseNewsUpload({ ...input, contentType: "image/svg+xml" }), /allowed image/);
  assert.throws(() => validation.parseNewsUpload({ ...input, size: 21 * 1024 * 1024 }), /20 MiB/);
  assert.throws(() => validation.parseNewsUpload({ ...input, contentType: "video/mp4", size: 101 * 1024 * 1024 }), /allowed image/);
  assert.throws(() => validation.validateNewsSnapshot({ ...snapshot(), publicationDate: "2026-02-30T12:00:00Z" }), /calendar/);
});

test("every Founder route is behind auth and every CMS write uses the origin guard", () => {
  const route = src("routes/newsPublishing.ts");
  assert.match(route, /router\.use\("\/founder\/news", networkAuth,[\s\S]*?requireFounder\(res\)/);
  for (const [, path, middleware] of route.matchAll(/router\.post\("([^"]+)", ([^,]+),/g)) {
    assert.ok(path.startsWith("/founder/news/"));
    assert.equal(middleware, "networkWrite");
  }
  assert.match(route, /eq\(articles\.status, "published"\)/);
  assert.match(route, /newsMediaReferences\(row\.snapshot\)\.some/);
});
