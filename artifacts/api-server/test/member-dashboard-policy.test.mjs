import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({
  stdin: { contents: `
    export { missingProfileEssentials } from "@workspace/shared";
    export { accountDataset, accountTotals } from "./src/services/membershipDashboard";
    export { reminderBlock, REMINDER_INTERVAL, safeEqual } from "./src/services/profileReminders";
    export { visitSessionHash, visitRetentionDay, visitDay } from "./src/services/siteVisits";
  `, resolveDir: process.cwd() },
  platform: "node", format: "esm", bundle: true, write: false,
  define: { "process.env.SESSION_SECRET": JSON.stringify("isolated-fixture-only") },
  plugins: [{
    name: "no-real-database-or-email",
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "db", namespace: "fixture" }));
      b.onResolve({ filter: /^@clerk\/express$/ }, () => ({ path: "clerk", namespace: "fixture" }));
      b.onResolve({ filter: /^@replit\/connectors-sdk$/ }, () => ({ path: "connectors", namespace: "fixture" }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({ contents: path === "db" ? `
        export const db = new Proxy({}, {get(){throw Error("Unexpected database access")}});
        export const ecosystemMembersTable={},networkProfiles={},networkPosts={},memberProfileRemindersTable={},siteVisitSessionsTable={};
      ` : path === "clerk" ? `
        export const clerkClient = {users:new Proxy({}, {get(){throw Error("Unexpected identity API access")}})};
        export const getAuth = () => {throw Error("Unexpected auth access")};
      ` : `
        export class ReplitConnectors {proxy(){throw Error("Unexpected email request")}}
      ` }));
    },
  }],
});
const policy = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const essentials = { accountType: "individual", fullName: "Fixture Member", profession: "Designer", sectors: [],
  country: "AE", mainSector: "fashion", activeSectors: ["fashion"] };

test("essential profile completion agrees across individual, organization and all seventeen sectors", () => {
  assert.ok(policy.missingProfileEssentials(null).length > 0);
  assert.deepEqual(policy.missingProfileEssentials(essentials), []);
  assert.deepEqual(policy.missingProfileEssentials({ ...essentials, bio: "", photo: null, isPublic: false }), []);
  for (const sector of ["real-estate", "health-care", "humanitarian-action"]) {
    assert.deepEqual(policy.missingProfileEssentials({ ...essentials, mainSector: sector, activeSectors: [sector] }), []);
  }
  const organization = { ...essentials, accountType: "organization" };
  assert.deepEqual(policy.missingProfileEssentials(organization), []);
  assert.deepEqual(policy.missingProfileEssentials({ ...organization, organizationType: "Association", contactName: "Fixture Contact" }), []);
  for (const activeSectors of [[], ["fashion", "fashion"], ["fashion", "music", "dance", "art"], ["unknown"]])
    assert.deepEqual(policy.missingProfileEssentials({ ...essentials, activeSectors }), []);
  assert.deepEqual(policy.missingProfileEssentials({ fullName: "Legacy Member", profession: "Designer", country: "UAE", sectors: ["fashion"] }), []);
  assert.deepEqual(policy.missingProfileEssentials({ fullName: "New Member", profession: "Designer", country: "UAE", mainSector: "fashion" }), []);
  assert.ok(policy.missingProfileEssentials({ ...essentials, mainSector: "unknown" }).includes("mainSector"));
});

test("account totals use current identities, not orphan profiles, and separate completion from activation", () => {
  const users = ["new", "partial", "complete", "active", "suspended"].map(id => ({
    id, firstName: "Fixture", lastName: id, createdAt: 1, lastSignInAt: null,
    primaryEmailAddressId: id, emailAddresses: [{ id, emailAddress: `${id}@fixture.invalid`, verification: { status: "verified" } }],
    banned: false, locked: false, passwordSecret: "must never be projected",
  }));
  const profiles = [
    { ...essentials, id: 2, clerkId: "partial", profession: "" },
    { ...essentials, id: 3, clerkId: "complete" },
    { ...essentials, id: 4, clerkId: "active" },
    { ...essentials, id: 5, clerkId: "suspended" },
    { ...essentials, id: 6, clerkId: "deleted-clerk-account" },
  ];
  const accounts = policy.accountDataset(users, profiles, [
    { memberId: 2, enabled: true, suspended: false },
    { memberId: 3, enabled: false, suspended: false },
    { memberId: 4, enabled: true, suspended: false },
    { memberId: 5, enabled: true, suspended: true },
  ], []);
  assert.deepEqual(policy.accountTotals(accounts), { accounts: 5, noProfile: 1, incomplete: 1, complete: 3, active: 2, emailVerified: 5, discoverable: 1, publicProfiles: 0, posted: 0, recentlySignedIn: 0 });
  assert.equal(accounts.length, 5);
  assert.equal(accounts.some(a => "passwordSecret" in a || "bio" in a), false);
  assert.equal(accounts.find(a => a.clerkId === "new").profileStatus, "no_profile");
});

test("reminders reject complete, unverified, opted-out and recent/ambiguous attempts", () => {
  const now = Date.parse("2026-10-26T10:00:00Z");
  const state = { lastAttemptAt: new Date(now - 1000), status: "accepted", optOutAt: null };
  assert.ok(policy.reminderBlock(undefined, [], true, now));
  assert.ok(policy.reminderBlock(undefined, ["country"], false, now));
  assert.ok(policy.reminderBlock({ ...state, optOutAt: new Date(now) }, ["country"], true, now));
  for (const status of ["sending", "accepted", "unknown"]) assert.ok(policy.reminderBlock({ ...state, status }, ["country"], true, now));
  assert.ok(policy.reminderBlock({ ...state, status: "failed" }, ["country"], true, now));
  assert.equal(policy.reminderBlock({ ...state, status: "failed", lastAttemptAt: new Date(now - 60_001) }, ["country"], true, now), "");
  assert.equal(policy.reminderBlock({ ...state, lastAttemptAt: new Date(now - policy.REMINDER_INTERVAL) }, ["country"], true, now), "");
  assert.equal(policy.safeEqual("abc", "abc"), true);
  assert.equal(policy.safeEqual("abc", "abé"), false);
});

test("visit identifiers are server-hashed per UTC day and retention covers ninety calendar days", () => {
  const now = new Date("2026-10-26T23:59:59Z");
  const next = new Date("2026-10-27T00:00:00Z");
  const id = "11111111-1111-4111-8111-111111111111";
  const hash = policy.visitSessionHash(id, now);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash, policy.visitSessionHash(id, now));
  assert.notEqual(hash, policy.visitSessionHash(id, next));
  assert.notEqual(hash, policy.visitSessionHash("22222222-2222-4222-8222-222222222222", now));
  const cutoff = Date.parse(policy.visitRetentionDay(now));
  assert.equal((Date.parse(policy.visitDay(now)) - cutoff) / 86400000, 89);
});
