import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Static inspection only: no database client, connection, server or DDL execution.
const file = path => readFileSync(new URL(path, import.meta.url), "utf8");
const journal = JSON.parse(file("../drizzle/meta/_journal.json"));
const migration = journal.entries.find(entry => entry.tag === "0014_remarkable_vision");
const sql = file(`../drizzle/${migration.tag}.sql`);
const before = JSON.parse(file("../drizzle/meta/0013_snapshot.json"));
const after = JSON.parse(file("../drizzle/meta/0014_snapshot.json"));

test("migration is journaled once after the previous migration", () => {
  assert.equal(journal.entries.filter(entry => entry.tag === migration.tag).length, 1);
  assert.equal(migration.idx, 14);
  assert.ok(migration.when > journal.entries.find(entry => entry.idx === 13).when);
  assert.equal(after.prevId, before.id);
});

test("snapshot adds exactly two tables and preserves every existing table", () => {
  const added = Object.keys(after.tables).filter(key => !before.tables[key]).sort();
  assert.deepEqual(added, ["public.news_article_revisions", "public.news_articles"]);
  for (const [name, table] of Object.entries(before.tables)) {
    assert.deepEqual(after.tables[name], table, `Existing table changed: ${name}`);
  }
  for (const key of ["enums", "schemas", "sequences", "roles", "policies", "views"]) {
    assert.deepEqual(after[key], before[key], `Unexpected ${key} change`);
  }
});

test("SQL contains only additive operations on the approved tables", () => {
  assert.doesNotMatch(sql, /\b(DROP|TRUNCATE|RENAME|INSERT|UPDATE\s+"|DELETE\s+FROM)\b/i);
  assert.deepEqual(
    [...sql.matchAll(/CREATE TABLE "([^"]+)"/g)].map(match => match[1]).sort(),
    ["news_article_revisions", "news_articles"],
  );
  for (const [, name] of sql.matchAll(/ALTER TABLE "([^"]+)"/g)) {
    assert.ok(["news_articles", "news_article_revisions"].includes(name));
  }
  assert.equal([...sql.matchAll(/CREATE INDEX /g)].length, 1);
});

test("identities, slugs and per-article revision numbers are unique", () => {
  assert.equal([...sql.matchAll(/"id" serial PRIMARY KEY NOT NULL/g)].length, 2);
  assert.match(sql, /UNIQUE\("slug"\)/);
  assert.match(sql, /UNIQUE\("article_id","revision_no"\)/);
  assert.match(sql, /UNIQUE\("article_id","id"\)/);
  assert.match(sql, /CHECK \("news_article_revisions"\."revision_no" > 0\)/);
});

test("published and draft pointers refer to revisions of the same article", () => {
  for (const kind of ["draft", "published"]) {
    const constraint = sql.split("\n").find(line => line.includes(`ADD CONSTRAINT "news_articles_${kind}_revision_fk"`));
    assert.ok(constraint);
    assert.ok(constraint.includes(`FOREIGN KEY ("id","${kind}_revision_id")`));
    assert.ok(constraint.includes('REFERENCES "public"."news_article_revisions"("article_id","id")'));
    assert.ok(constraint.includes("DEFERRABLE INITIALLY DEFERRED"));
    assert.ok(constraint.includes("ON DELETE restrict"));
  }
  assert.equal([...sql.matchAll(/ADD CONSTRAINT .* FOREIGN KEY/g)].length, 4);
  assert.doesNotMatch(sql, /ON DELETE cascade/i);
  assert.match(sql, /REFERENCES "public"\."ecosystem_members"\("id"\) ON DELETE set null/);
});

test("publication and concurrency columns have the agreed SQL guards", () => {
  assert.match(sql, /"status" text DEFAULT 'draft' NOT NULL/);
  assert.match(sql, /IN \('draft', 'published', 'archived'\)/);
  assert.match(sql, /"version" integer DEFAULT 0 NOT NULL/);
  assert.match(sql, /CHECK \("news_articles"\."version" >= 0\)/);
  assert.match(sql, /"published_revision_id" IS NOT NULL AND "news_articles"\."published_at" IS NOT NULL/);
  assert.match(sql, /WHERE "news_articles"\."status" = 'published'/);
});

test("JSON snapshots must be objects with contract version 1", () => {
  assert.match(sql, /jsonb_typeof\("news_article_revisions"\."snapshot"\) = 'object'/);
  assert.match(sql, /IS NOT DISTINCT FROM '1'::jsonb/);
  assert.match(file("../src/schema/news.ts"), /\$type<NewsArticleSnapshotV1>/);
});
