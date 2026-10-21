// Offline regression checks: never import the DB client or connect to PostgreSQL.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const sql = read("drizzle/0015_absurd_wallow.sql");
const before = JSON.parse(read("drizzle/meta/0014_snapshot.json"));
const after = JSON.parse(read("drizzle/meta/0015_snapshot.json"));
const journal = JSON.parse(read("drizzle/meta/_journal.json"));
const names = [
  "gratitude_campaigns", "gratitude_comments", "gratitude_contributions",
  "gratitude_engagement", "gratitude_media", "gratitude_rate_windows",
  "gratitude_reports",
];
const statements = sql.split("--> statement-breakpoint").map(x => x.trim()).filter(Boolean);
const table = name => after.tables[`public.${name}`];

test("exactly seven approved tables are added and all older tables are identical", () => {
  assert.equal(after.prevId, before.id);
  for (const [key, value] of Object.entries(before.tables)) {
    assert.deepEqual(after.tables[key], value, `Existing table changed: ${key}`);
  }
  const added = Object.keys(after.tables).filter(key => !before.tables[key]);
  assert.deepEqual(added.sort(), names.map(name => `public.${name}`).sort());
  assert.deepEqual(Object.keys(before.enums), Object.keys(after.enums));
});

test("SQL only creates approved tables, their indexes and their foreign keys", () => {
  const created = [];
  for (const statement of statements) {
    assert.doesNotMatch(statement, /\b(DROP|TRUNCATE|RENAME|INSERT|UPDATE|DELETE)\b(?!\s+(?:restrict|cascade|set null|no action))/i);
    const create = statement.match(/^CREATE TABLE "(gratitude_[a-z_]+)" /);
    const foreignKey = statement.match(/^ALTER TABLE "(gratitude_[a-z_]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY /);
    const index = statement.match(/^CREATE (?:UNIQUE )?INDEX "[^"]+" ON "(gratitude_[a-z_]+)" /);
    assert.ok(create || foreignKey || index, `Unexpected statement: ${statement.slice(0, 100)}`);
    assert.ok(names.includes((create || foreignKey || index)[1]));
    if (create) created.push(create[1]);
  }
  assert.deepEqual(created.sort(), [...names].sort());
});

test("journal records the prepared migration immediately after the previous one", () => {
  const entry = journal.entries.find(x => x.tag === "0015_absurd_wallow");
  assert.equal(entry.idx, 15);
  assert.equal(entry.breakpoints, true);
  assert.equal(journal.entries.find(x => x.idx === 14).tag, "0014_remarkable_vision");
  assert.ok(fileURLToPath(new URL("drizzle/0015_absurd_wallow.sql", root)).endsWith(".sql"));
});

test("publication cannot pass its CHECK through a NULL approved version", () => {
  const checks = table("gratitude_contributions").checkConstraints;
  const publication = checks.gratitude_contributions_publication.value;
  for (const required of [
    '"approved_version" IS NOT NULL', '"public_consent_at" IS NOT NULL',
    '"rights_confirmed_at" IS NOT NULL', '"reviewed_at" IS NOT NULL',
    '"country_code" IS NOT NULL', '"theme" IS NOT NULL',
  ]) assert.ok(publication.includes(required), required);
  assert.match(publication, /"approved_version" = .*"version"/);
  for (const status of ["draft", "pending_review", "published", "rejected", "hidden", "archived"]) {
    assert.ok(checks.gratitude_contributions_status.value.includes(`'${status}'`));
  }
  assert.equal(table("gratitude_contributions").columns.status.default, "'draft'");
});

test("video readiness requires validated duration and a playback reference", () => {
  const checks = table("gratitude_media").checkConstraints;
  assert.match(checks.gratitude_media_duration.value, /<= 180000/);
  assert.match(checks.gratitude_media_ready_video.value, /"duration_ms" IS NOT NULL/);
  assert.match(checks.gratitude_media_ready_video.value, /"playback_upload_id" IS NOT NULL/);
  const refs = Object.values(table("gratitude_media").foreignKeys);
  assert.equal(refs.filter(x => x.tableTo === "network_uploads" && x.onDelete === "restrict").length, 4);
});

test("engagement deduplication, open-report uniqueness and shared rate windows exist", () => {
  const engagement = table("gratitude_engagement");
  assert.deepEqual(engagement.uniqueConstraints.gratitude_engagement_member_kind.columns,
    ["contribution_id", "member_id", "kind"]);
  const reports = table("gratitude_reports").indexes;
  assert.equal(reports.gratitude_reports_open_story_unique.isUnique, true);
  assert.match(reports.gratitude_reports_open_story_unique.where, /"comment_id" IS NULL/);
  assert.equal(reports.gratitude_reports_open_comment_unique.isUnique, true);
  assert.match(reports.gratitude_reports_open_comment_unique.where, /"comment_id" IS NOT NULL/);
  const windows = table("gratitude_rate_windows");
  assert.deepEqual(Object.values(windows.compositePrimaryKeys)[0].columns,
    ["member_id", "action", "window_start"]);
  assert.match(windows.checkConstraints.gratitude_rate_windows_count.value, /> 0/);
});
