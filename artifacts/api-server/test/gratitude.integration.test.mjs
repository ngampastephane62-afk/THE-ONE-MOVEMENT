import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Development-only, real PostgreSQL, all fixtures rolled back. No Clerk calls,
// Stripe imports, App Storage uploads, public fake stories or migration commands.
assert.notEqual(process.env.REPLIT_DEPLOYMENT, "1");
assert.ok(process.env.REPL_ID && process.env.REPLIT_DEV_DOMAIN);
assert.ok(/^\d+$/.test(process.argv[2] ?? ""), "Pass the independently verified development cluster identifier.");
const root = fileURLToPath(new URL("../../../", import.meta.url));
const requireApi = createRequire(import.meta.url);
const requireDb = createRequire(path.join(root, "lib/db/src/index.ts"));
const require = id => { try { return requireApi(id); } catch (error) { if (error.code !== "MODULE_NOT_FOUND") throw error; return requireDb(id); } };
const output = buildSync({
  stdin: { contents: `
    export * from "@workspace/db";
    export {eq,sql} from "drizzle-orm";
    export {gratitudeAction} from "./artifacts/api-server/src/services/gratitudeActions";
    export {readGratitude} from "./artifacts/api-server/src/services/gratitudeRead";
    export {ownedMedia,completeUpload} from "./artifacts/api-server/src/services/networkFiles";
  `, resolveDir: root },
  bundle: true, packages: "external", platform: "node", format: "cjs", write: false,
  alias: {
    "@workspace/db": path.join(root, "lib/db/src/index.ts"),
    "@workspace/shared": path.join(root, "lib/shared/src/index.ts"),
    "@workspace/api-zod": path.join(root, "lib/api-zod/src/index.ts"),
  },
}).outputFiles[0].text;
const module = { exports: {} };
runInNewContext(output, { module, exports: module.exports, require, process, Buffer, console,
  URL, setTimeout, clearTimeout, TextEncoder, TextDecoder, AbortSignal, fetch, structuredClone });
const api = module.exports;
const { db, pool, sql, eq } = api;
const original = Object.fromEntries(["transaction", "select", "insert", "update", "delete", "execute"].map(k => [k, db[k]]));
const rollback = new Error("intentional fixture rollback");
let assertions = 0;
const ok = (value, message) => { assert.ok(value, message); assertions++; };
const fail = async (fn, status) => {
  await assert.rejects(fn, e => e.status === status);
  assertions++;
};
try {
  const target = await db.execute(sql`SELECT system_identifier::text AS id FROM pg_control_system()`);
  assert.equal(target.rows[0].id, process.argv[2], "Wrong database target");
  await original.transaction.call(db, async tx => {
    for (const key of ["select", "insert", "update", "delete", "execute"]) db[key] = tx[key].bind(tx);
    db.transaction = callback => tx.transaction(callback);
    const stamp = `gratitude-qa-${Date.now()}`;
    const fixture = async suffix => {
      const [m] = await tx.insert(api.ecosystemMembersTable).values({ clerkId: `${stamp}-${suffix}`, fullName: `QA ${suffix}`, profession: "", sectors: [], isPublic: true, publicMedia: true }).returning();
      await tx.insert(api.networkProfiles).values({ memberId: m.id, enabled: false });
      return m;
    };
    const owner = await fixture("owner"), founder = await fixture("reviewer"), other = await fixture("reader");
    const response = (member, isFounder = false) => ({ locals: { actor: { member, founder: isFounder, clerkId: member.clerkId }, networkEnabled: false } });
    const own = response(owner), admin = response(founder, true), reader = response(other);
    const call = (res, action) => api.gratitudeAction(action, res);
    const current = async id => (await tx.select().from(api.gratitudeContributions).where(eq(api.gratitudeContributions.id, id)))[0];
    const list = async id => api.readGratitude(1, { scope: "public" }, { id });
    const campaign = await call(admin, { action: "campaign", slug: stamp, name: "QA private transaction", campaignStatus: "active", identity: "global" });
    const story = await call(own, { action: "save", campaignId: campaign.id, title: "QA gratitude", body: "A message used only inside a rollback transaction.", countryCode: "CD", theme: "community" });
    ok((await list(story.id)).items.length === 0, "draft must not be public");
    ok((await api.readGratitude(1, { scope: "founder", memberId: founder.id }, { id: story.id })).items.length === 0, "unsubmitted draft remains private to its owner");
    await fail(() => call(reader, { action: "save", id: story.id, version: 1, title: "Not mine" }), 404);
    await fail(() => call(own, { action: "save", id: story.id, version: 99, title: "Stale" }), 409);
    await fail(() => call(own, { action: "submit", id: story.id, version: 1, consent: false, rights: true }), 400);
    await call(own, { action: "submit", id: story.id, version: 1, consent: true, rights: true });
    ok((await list(story.id)).items.length === 0, "pending story must not be public");
    await fail(() => call(own, { action: "moderate", id: story.id, version: 1, decision: "publish", reason: "Not allowed" }), 403);
    await fail(() => call(response(owner, true), { action: "moderate", id: story.id, version: 1, decision: "publish", reason: "Own approval" }), 403);
    await tx.update(api.ecosystemMembersTable).set({ isPublic: false }).where(eq(api.ecosystemMembersTable.id, owner.id));
    await fail(() => call(admin, { action: "moderate", id: story.id, version: 1, decision: "publish", reason: "QA review" }), 409);
    await tx.update(api.ecosystemMembersTable).set({ isPublic: true }).where(eq(api.ecosystemMembersTable.id, owner.id));
    await call(admin, { action: "moderate", id: story.id, version: 1, decision: "publish", reason: "QA review approved" });
    ok((await list(story.id)).items.length === 1, "approved story is public");
    await call(reader, { action: "like", id: story.id, accepted: true });
    await call(reader, { action: "like", id: story.id, accepted: true });
    await call(reader, { action: "view", id: story.id });
    await call(reader, { action: "view", id: story.id });
    const counted = (await list(story.id)).items[0];
    ok(counted.likes === 1 && counted.views === 1, "repeated engagement is deduplicated");
    await fail(() => call(own, { action: "like", id: story.id, accepted: true }), 400);
    await call(reader, { action: "comment", id: story.id, body: "QA reply" });
    await fail(() => call(reader, { action: "comment", id: story.id, body: "QA reply" }), 429);
    const reply = (await api.readGratitude(1, { scope: "public", memberId: other.id }, { id: story.id })).items[0].comments[0];
    await call(reader, { action: "report", id: story.id, commentId: reply.id, reason: "QA report" });
    await call(reader, { action: "deleteComment", id: story.id, commentId: reply.id });
    ok((await list(story.id)).items[0].comments.length === 0, "deleted reply is hidden without orphaning reports");
    await tx.insert(api.networkBlocks).values({ blockerId: other.id, blockedId: owner.id });
    ok((await api.readGratitude(1, { scope: "public", memberId: other.id }, { id: story.id })).items.length === 0, "blocked member cannot discover story");
    await call(reader, { action: "report", id: story.id, reason: "QA after block" });
    await tx.update(api.ecosystemMembersTable).set({ isPublic: false }).where(eq(api.ecosystemMembersTable.id, owner.id));
    ok((await list(story.id)).items.length === 0, "privacy change revokes public story immediately");
    await tx.update(api.ecosystemMembersTable).set({ isPublic: true }).where(eq(api.ecosystemMembersTable.id, owner.id));
    await call(admin, { action: "moderate", id: story.id, version: 1, decision: "hide", reason: "QA suspension" });
    ok((await list(story.id)).items.length === 0, "moderation hide removes story");
    await call(admin, { action: "moderate", id: story.id, version: 1, decision: "restore", reason: "QA restore" });
    await call(own, { action: "save", id: story.id, version: 1, body: "Changed text" });
    const edited = await current(story.id);
    ok(edited.status === "draft" && edited.version === 2 && edited.approvedVersion === null, "editing invalidates approval");
    ok((await list(story.id)).items.length === 0, "edited version cannot inherit publication");
    await call(own, { action: "submit", id: story.id, version: 2, consent: true, rights: true });
    await call(admin, { action: "moderate", id: story.id, version: 2, decision: "reject", reason: "Please revise" });
    ok((await current(story.id)).status === "rejected", "rejection persisted");
    await call(own, { action: "archive", id: story.id, version: 2 });
    ok((await current(story.id)).status === "archived", "withdrawal persisted");
    await tx.insert(api.networkUploads).values({
      id: `${stamp}-media`, ownerId: owner.id, objectPath: "/private/gratitude-private/owner/reserved",
      filename: "qa.mp4", contentType: "video/mp4", size: 1, ready: true,
    });
    await fail(() => api.ownedMedia(owner.id, [`${stamp}-media`]), 400);
    await fail(() => api.completeUpload(owner.id, `${stamp}-media`), 400);
    const audit = await tx.select().from(api.networkAudit).where(eq(api.networkAudit.targetId, story.id));
    ok(audit.some(a => a.action === "gratitude.moderation.publish"), "moderation audit exists");
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  for (const [key, method] of Object.entries(original)) db[key] = method;
  await pool.end();
}
console.log(`PASS: ${assertions} integration assertions; all PostgreSQL fixtures rolled back.`);
