import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const sql = read("../drizzle/0021_connect_phase1.sql");
const baseline = JSON.parse(read("../drizzle/meta/0020_snapshot.json"));
const draft = JSON.parse(read("../drizzle/meta/0021_snapshot.json"));
const expected = [
  "connect_attachments", "connect_conversations", "connect_events",
  "connect_messages", "connect_participants", "connect_pins",
  "connect_preferences", "connect_reactions", "connect_signals",
].sort();

test("review SQL creates exactly the nine Connect tables", () => {
  assert.deepEqual([...sql.matchAll(/CREATE TABLE "([^"]+)"/g)].map(x => x[1]).sort(), expected);
  // ON UPDATE in a foreign key is not a data-changing UPDATE statement.
  assert.doesNotMatch(sql, /(?:^|;)\s*(?:--[^\n]*\n\s*)*(?:DROP|TRUNCATE|RENAME|INSERT|UPDATE|DELETE)\b/im);
  for (const match of sql.matchAll(/ALTER TABLE "([^"]+)"/g)) {
    assert.ok(expected.includes(match[1]), `Existing table altered: ${match[1]}`);
  }
  assert.doesNotMatch(sql, /community_(email|communication|activity)/);
});

test("existing table definitions and conversation IDs are unchanged", () => {
  for (const [name, table] of Object.entries(baseline.tables)) {
    assert.deepEqual(draft.tables[name], table, `Changed existing table: ${name}`);
  }
  const added = Object.keys(draft.tables).filter(name => !baseline.tables[name])
    .map(name => name.replace(/^public\./, "")).sort();
  assert.deepEqual(added, expected);
});

test("only Connect is integrated; the held newsletter stays outside the active schema and journal", () => {
  const barrel = read("../src/schema/index.ts");
  assert.match(barrel, /["']\.\/connect["']/);
  assert.doesNotMatch(barrel, /export \* from ["']\.\/community/);
  const journal = JSON.parse(read("../drizzle/meta/_journal.json"));
  assert.equal(journal.entries.at(-1).tag, "0021_connect_phase1");
  assert.ok(journal.entries.every(entry => entry.tag !== "0021_community_communications"));
  assert.match(read("../drizzle/0021_community_communications.sql"), /CREATE TABLE "community_email_settings"/);
});

test("legacy references are unique and preserve old records", () => {
  assert.match(sql, /CREATE UNIQUE INDEX "connect_conversations_legacy_thread"/);
  assert.match(sql, /CREATE UNIQUE INDEX "connect_messages_legacy"/);
  assert.match(sql, /REFERENCES "public"\."network_threads"\("id"\) ON DELETE restrict/);
  assert.match(sql, /REFERENCES "public"\."network_messages"\("id"\) ON DELETE restrict/);
});

test("read cursors, events and attachments cannot bind to another conversation", () => {
  const uniqueness = sql.indexOf('CONSTRAINT "connect_messages_identity_scope" UNIQUE');
  assert.ok(uniqueness > 0);
  for (const name of ["connect_participants_read_message_scope", "connect_attachments_message_scope", "connect_events_message_scope"]) {
    assert.match(sql, new RegExp(`CONSTRAINT "${name}" FOREIGN KEY \\("[^"]+","conversation_id"\\) REFERENCES "public"\\."connect_messages"\\("id","conversation_id"\\)`));
    assert.ok(uniqueness < sql.indexOf(`ADD CONSTRAINT "${name}"`), "Referenced uniqueness must exist before the foreign key");
  }
});

test("private defaults and invitation acceptance have database constraints", () => {
  assert.match(sql, /"show_presence" boolean DEFAULT false NOT NULL/);
  assert.match(sql, /"notification_previews" boolean DEFAULT false NOT NULL/);
  assert.match(sql, /"status" text DEFAULT 'invited' NOT NULL/);
  assert.match(sql, /CONSTRAINT "connect_participants_active" CHECK/);
  assert.match(sql, /CONSTRAINT "connect_preferences_theme" CHECK/);
});

test("uploads preserve the video cap and quarantine states", () => {
  assert.match(sql, /THEN 524288000 ELSE 20971520 END/);
  assert.match(sql, /"status" text DEFAULT 'pending' NOT NULL/);
  assert.match(sql, /CONSTRAINT "connect_attachments_bound" CHECK/);
  assert.match(sql, /CONSTRAINT "connect_attachments_scan_ready" CHECK/);
});

test("send deduplication and bounded history indexes are prepared", () => {
  assert.match(sql, /CREATE UNIQUE INDEX "connect_messages_nonce".*"conversation_id","sender_id","client_nonce"/);
  assert.match(sql, /CREATE INDEX "connect_messages_page".*"conversation_id","created_at","id"/);
  assert.match(sql, /CREATE INDEX "connect_events_cursor"/);
});
