import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";

// Explicit, one-off workspace maintenance, NOT an HTTP identity or startup seed.
// Run only after Founder approval and an independent development DB fingerprint.
// Reuses the existing campaign action, validation, authorization and audit.
assert.equal(process.argv[2], "--founder-approved-development-only");
assert.notEqual(process.env.REPLIT_DEPLOYMENT, "1");
assert.ok(process.env.REPL_ID && process.env.REPLIT_DEV_DOMAIN);
const expectedCluster = process.argv[3];
const founderId = Number(process.argv[4]);
assert.match(expectedCluster ?? "", /^\d+$/);
assert.ok(Number.isSafeInteger(founderId) && founderId > 0);
const root = fileURLToPath(new URL("../../../", import.meta.url));
const apiRequire = createRequire(new URL("../package.json", import.meta.url));
const dbRequire = createRequire(path.join(root, "lib/db/src/index.ts"));
const require = id => {
  try { return apiRequire(id); }
  catch (error) { if (error.code !== "MODULE_NOT_FOUND") throw error; return dbRequire(id); }
};
const compiled = buildSync({
  stdin: { contents: `
    export * from "@workspace/db";
    export {eq, sql} from "drizzle-orm";
    export {gratitudeAction} from "./artifacts/api-server/src/services/gratitudeActions";
  `, resolveDir: root },
  bundle: true, packages: "external", platform: "node", format: "cjs", write: false,
  alias: Object.fromEntries(["db", "shared", "api-zod"].map(name => [
    `@workspace/${name}`, path.join(root, `lib/${name}/src/index.ts`),
  ])),
}).outputFiles[0].text;
const module = { exports: {} };
runInNewContext(compiled, { module, exports: module.exports, require, process,
  Buffer, console, URL, setTimeout, clearTimeout, TextEncoder, TextDecoder, AbortSignal, fetch });
const { db, pool, sql, eq, ecosystemMembersTable: members, networkProfiles: profiles,
  gratitudeCampaigns: campaigns, gratitudeAction } = module.exports;
const transaction = db.transaction;
try {
  const target = await db.execute(sql`SELECT system_identifier::text AS id FROM pg_control_system()`);
  assert.equal(target.rows[0].id, expectedCluster, "The database is not the independently verified development target.");
  await transaction.call(db, async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(73521901)`);
    const [verified] = await tx.select({ member: members, profile: profiles }).from(members)
      .innerJoin(profiles, eq(profiles.memberId, members.id)).where(eq(members.id, founderId)).for("share");
    assert.ok(verified?.profile.founder && !verified.profile.suspended, "An existing eligible Founder record is required; no privileges are invented.");
    const all = await tx.select().from(campaigns);
    const canonical = all.filter(c =>
      c.slug === "thanks-the-world" ||
      c.name.trim().replace(/\s+/g, " ").toUpperCase() === "THANKS THE WORLD");
    assert.ok(canonical.length <= 1, "Duplicate official campaigns require manual review.");
    const existing = canonical[0];
    assert.ok(!existing || existing.identity?.style === "global", "Do not overwrite another regional identity.");
    const description = "Share your gratitude with the world. Celebrate your country, community, culture and the people who inspire you.";
    if (existing?.status === "active" && existing.slug === "thanks-the-world" &&
        existing.name === "THANKS THE WORLD" && existing.description === description && existing.parentId === null) {
      console.log(JSON.stringify({ id: existing.id, status: existing.status, result: "already active; unchanged" }));
      return;
    }
    // Run the existing Founder workflow inside this same locked transaction.
    // This is a maintenance context backed by the persisted Founder record and
    // explicit owner authorization, not a forged Clerk login or permission edit.
    db.transaction = callback => tx.transaction(callback);
    try {
      const saved = await gratitudeAction({
        action: "campaign", id: existing?.id, slug: "thanks-the-world",
        name: "THANKS THE WORLD", description, campaignStatus: "active",
        identity: "global", parentId: null,
      }, { locals: { actor: { member: verified.member, clerkId: verified.member.clerkId,
        founder: verified.profile.founder, email: "", accountCreatedAt: 0 } } });
      console.log(JSON.stringify({ id: saved.id, name: "THANKS THE WORLD", status: "active", result: existing ? "updated" : "created" }));
    } finally { db.transaction = transaction; }
  });
} finally {
  db.transaction = transaction;
  await pool.end();
}
