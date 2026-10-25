import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";

// Exercise the real router, authentication middleware and action handler.
// Identity and persistence are in-memory fixtures, never Clerk or PostgreSQL.
// Unrelated services fail closed: no storage, payments, migrations or startup.
const require = createRequire(import.meta.url);
const fixture = `
export const state = { members: [], profiles: [], posts: [], identities: new Map() };
export const ecosystemMembersTable = { table: "members", clerkId: "clerkId", id: "id" };
export const networkProfiles = { table: "profiles", memberId: "memberId" };
export const networkUploads = {}, networkPosts = { table: "posts", id: "id", authorId: "authorId" }, networkComments = {},
  networkLikes = {}, networkViews = {}, networkFollows = {}, networkBlocks = {},
  networkThreads = {}, networkMessages = {}, networkCertifications = {},
  networkReports = {}, networkAudit = {};
function rows(table) {
  if (!["members", "profiles", "posts"].includes(table.table)) throw Error("Unexpected table");
  return state[table.table];
}
export const db = {
  select: () => ({ from: table => ({ where: condition => {
    const matches = (row, c) => c.conditions ? c.conditions.every(child => matches(row, child)) : row[c.column] === c.value;
    const result = rows(table).filter(row => matches(row, condition));
    return Object.assign(Promise.resolve(result), { limit: n => Promise.resolve(result.slice(0, n)) });
  } }) }),
  insert: table => ({ values: values => {
    const execute = conflict => {
      const key = table.table === "members" ? "clerkId" : "memberId";
      const existing = rows(table).find(row => row[key] === values[key]);
      if (existing) { if (conflict) Object.assign(existing, conflict.set); return []; }
      const row = table.table === "members"
        ? { id: state.members.length + 1, isPublic: false, publicMedia: false, ...values }
        : { enabled: false, suspended: false, ...values };
      rows(table).push(row);
      return [row];
    };
    return {
      returning: async () => {
        if (table.table !== "posts") throw Error("Unexpected direct insert");
        const row = { id: state.posts.length + 1, ...values };
        state.posts.push(row);
        return [row];
      },
      onConflictDoNothing: () => ({ returning: async () => execute() }),
      onConflictDoUpdate: async conflict => execute(conflict),
    };
  } }),
  update: table => ({ set: values => ({ where: async condition => {
    const matches = (row, c) => c.conditions ? c.conditions.every(child => matches(row, child)) : row[c.column] === c.value;
    for (const row of rows(table)) if (matches(row, condition)) Object.assign(row, values);
  } }) }),
};
export const getAuth = req => ({ userId: req.headers["x-fixture-identity"] ?? null });
export const clerkClient = { users: { getUser: async id => {
  const identity = state.identities.get(id);
  if (!identity) throw Error("Unknown fixture identity");
  return {
    firstName: "Fixture", lastName: id, primaryEmailAddressId: "primary", createdAt: Date.now(),
    emailAddresses: [{ id: "primary", emailAddress: identity.email ?? id + "@fixture.invalid",
      verification: { status: identity.verified === false ? "unverified" : "verified" } }],
  };
} } };
`;
const failClosed = `
const forbidden = () => { throw Error("Unrelated service must not run in activation tests"); };
export async function ownedMedia(memberId, ids = []) {
  return ids.map(id => {
    if (id !== "fixture-video") throw Error("Unexpected fixture upload");
    return { id, ownerId: memberId, contentType: "video/mp4" };
  });
}
export const requestUpload = forbidden, objectFile = forbidden,
  completeUpload = forbidden, activeBadge = forbidden, visibleMember = forbidden,
  visiblePost = forbidden, ownThread = forbidden, isBlocked = forbidden,
  qualifiedInviteCount = forbidden, requireMonthly = forbidden, checkout = forbidden,
  paymentStatus = forbidden, customPackages = forbidden;
export const ROLES = new Set(), PROGRAMS = new Set(), DOCUMENTS = [], PACKAGE_DEFINITIONS = [];
export async function networkState(context) { return { me: context.member }; }
`;
const output = await build({
  stdin: {
    contents: `export { default as router, networkErrors } from "./src/routes/network";
      export { requireFounder } from "./src/services/networkAuth";
      export { state } from "@workspace/db";`,
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, platform: "node", format: "esm",
  define: { "process.env.TOMI_FOUNDER_EMAIL": JSON.stringify("founder@fixture.invalid") },
  plugins: [{
    name: "isolated-network-activation",
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$|^@clerk\/express$/ }, () => ({ path: "identity-and-db", namespace: "fixture" }));
      b.onResolve({ filter: /^drizzle-orm$/ }, () => ({ path: "conditions", namespace: "fixture" }));
      b.onResolve({ filter: /\/clerkProxyMiddleware$/ }, () => ({ path: "origin", namespace: "fixture" }));
      b.onResolve({ filter: /\/(networkFiles|networkState|networkPayments|monthlyMembership)$/ }, () => ({ path: "unrelated", namespace: "fixture" }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
        contents: path === "identity-and-db" ? fixture : path === "unrelated" ? failClosed
          : path === "origin" ? `export const getClerkProxyHost = req => req.get("host");`
            : `export const eq = (column, value) => ({ column, value });
               export const and = (...conditions) => ({ conditions }), inArray = () => {}, or = () => {}, ne = () => {}, isNull = () => {}, sql = () => {};`,
      }));
      b.onResolve({ filter: /^express$/ }, args => ({
        path: pathToFileURL(require.resolve(args.path)).href, external: true,
      }));
    },
  }],
});
const { router, networkErrors, requireFounder, state } = await import(
  `data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString("base64")}`
);

test("explicit network activation (isolated HTTP regression suite)", async t => {
  const app = express();
  app.use(express.json(), router, networkErrors);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const identity = (id, options = {}) => state.identities.set(id, options);
  const request = (id, body, headers = {}) => fetch(`${origin}/network/${body === undefined ? "state" : "action"}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", origin, ...(id ? { "x-fixture-identity": id } : {}), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const profile = id => state.profiles.find(p => p.memberId === state.members.find(m => m.clerkId === id)?.id);
  const complete = id => Object.assign(state.members.find(m => m.clerkId === id), {
    accountType: "individual", fullName: "Fixture Member", profession: "Designer",
    country: "United Arab Emirates", mainSector: "fashion", activeSectors: ["fashion"],
  });
  const join = { action: "join", accepted: true };

  await t.test("anonymous activation and browsing require authentication", async () => {
    assert.equal((await request(null, join)).status, 401);
    assert.equal((await request(null)).status, 401);
    assert.equal(state.members.length, 0);
  });
  await t.test("unverified accounts cannot activate", async () => {
    identity("unverified", { verified: false });
    assert.equal((await request("unverified", join)).status, 403);
    assert.equal(state.members.length, 0);
  });
  await t.test("new verified member can browse for free without activation, including refresh", async () => {
    identity("new");
    assert.equal((await request("new")).status, 200);
    assert.equal(profile("new").enabled, false);
    assert.equal((await request("new")).status, 200);
    assert.equal(profile("new").enabled, false);
    assert.equal(state.members.length, 1);
  });
  await t.test("participation is rejected server-side before activation", async () => {
    const response = await request("new", { action: "follow", targetId: 2, accepted: true });
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /Join the member network/);
  });
  await t.test("missing, malformed consent or unrecognised identity fields cannot activate", async () => {
    for (const body of [
      { action: "join" }, { action: "join", accepted: "true" },
      { ...join, memberId: 2 }, { ...join, founder: true },
    ]) assert.equal((await request("new", body)).status, 400);
    assert.equal(profile("new").enabled, false);
  });
  await t.test("cross-origin, missing-origin and cross-site activation are rejected", async () => {
    for (const headers of [
      { origin: "https://other.fixture.invalid" }, { origin: "" }, { "sec-fetch-site": "cross-site" },
    ]) assert.equal((await request("new", join, headers)).status, 403);
    assert.equal(profile("new").enabled, false);
  });
  await t.test("verified accounts must finish essential setup before activation", async () => {
    const response = await request("new", join);
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /Complete your profile/);
    assert.equal(profile("new").enabled, false);
    complete("new");
  });
  await t.test("activation affects only the authenticated member, not a supplied target", async () => {
    identity("other");
    await request("other");
    assert.equal((await request("new", { ...join, targetId: profile("other").memberId, id: profile("other").memberId })).status, 200);
    assert.equal(profile("new").enabled, true);
    assert.equal(profile("other").enabled, false);
    assert.equal((await request("other", { ...join, targetId: profile("new").memberId, accepted: false })).status, 200);
    assert.equal(profile("new").enabled, true);
  });
  await t.test("explicit activation is idempotent and survives later authenticated requests", async () => {
    const before = structuredClone(profile("new"));
    assert.equal((await request("new", join)).status, 200);
    assert.equal((await request("new")).status, 200);
    assert.deepEqual(profile("new"), before);
  });
  await t.test("trial members create and edit every post type without referrals or billing", async () => {
    for (const kind of ["post", "business", "reel"]) {
      const body = { action: "post.create", kind, text: "Trial fixture only",
        ...(kind === "reel" ? { mediaIds: ["fixture-video"] } : {}) };
      const response = await request("new", body);
      assert.equal(response.status, 200, await response.clone().text());
      const { id } = await response.json();
      const saved = state.posts.find(p => p.id === id);
      assert.equal(saved.authorId, profile("new").memberId);
      assert.equal(saved.kind, kind);
      assert.equal((await request("new", { ...body, action: "post.edit", id, text: "Edited fixture" })).status, 200);
      assert.equal(saved.text, "Edited fixture");
    }
    // Referral and billing mocks throw if called; success proves neither ran.
  });
  await t.test("posting preserves authentication, activation, origin, ownership and reel validation", async () => {
    const before = state.posts.length;
    const post = { action: "post.create", kind: "business", text: "Must not publish" };
    assert.equal((await request(null, post)).status, 401);
    assert.equal((await request("unverified", post)).status, 403);
    assert.equal((await request("other", post)).status, 409);
    assert.equal((await request("new", post, { origin: "https://other.fixture.invalid" })).status, 403);
    assert.equal((await request("new", { ...post, kind: "reel" })).status, 400);
    assert.equal((await request("new", { ...post, kind: "official" })).status, 400);
    assert.equal((await request("new", { ...post, text: "" })).status, 400);
    assert.equal(state.posts.length, before);
    identity("writer");
    await request("writer");
    complete("writer");
    await request("writer", join);
    assert.equal((await request("writer", { ...post, action: "post.edit", id: state.posts[0].id })).status, 404);
    assert.equal(state.posts[0].text, "Edited fixture");
    profile("writer").suspended = true;
    assert.equal((await request("writer", post)).status, 403);
    assert.equal(state.posts.length, before);
  });
  await t.test("activation preserves both public visibility choices and public media consent", async () => {
    complete("other");
    for (const isPublic of [false, true]) {
      const member = state.members.find(m => m.clerkId === "other");
      Object.assign(member, { isPublic, publicMedia: isPublic });
      const before = structuredClone(member);
      assert.equal((await request("other", join)).status, 200);
      assert.deepEqual(member, before);
      assert.equal((await request("other", { action: "join", accepted: false })).status, 200);
      assert.deepEqual(member, before);
    }
  });
  await t.test("already activated incomplete profiles cannot publish, follow or claim invitations, but may leave", async () => {
    const member = state.members.find(m => m.clerkId === "new");
    const before = member.mainSector;
    member.mainSector = null;
    for (const body of [
      { action: "post.create", kind: "post", text: "Must not publish" },
      { action: "follow", targetId: 2, accepted: true },
      { action: "referral.claim", accepted: true, kind: "11111111-1111-4111-8111-111111111111" },
    ]) {
      const response = await request("new", body);
      assert.equal(response.status, 409);
      assert.match((await response.json()).error, /Complete your profile/);
    }
    assert.equal((await request("new", { action: "join", accepted: false })).status, 200);
    member.mainSector = before;
    assert.equal((await request("new", join)).status, 200);
  });
  await t.test("pre-existing active and inactive profiles retain their state on authentication", async () => {
    for (const enabled of [false, true]) {
      const id = `existing-${enabled}`;
      identity(id);
      const memberId = state.members.length + 1;
      state.members.push({ id: memberId, clerkId: id, isPublic: true, publicMedia: false });
      state.profiles.push({ memberId, enabled, suspended: false, founder: false });
      const before = structuredClone(profile(id));
      assert.equal((await request(id)).status, 200);
      assert.deepEqual(profile(id), before);
    }
  });
  await t.test("suspended members cannot reactivate, and suspension is unchanged", async () => {
    Object.assign(profile("other"), { suspended: true, enabled: false });
    const before = structuredClone(profile("other"));
    assert.equal((await request("other", join)).status, 403);
    assert.equal((await request("other")).status, 403);
    assert.deepEqual(profile("other"), before);
  });
  await t.test("Founder identity and existing suspension exception stay intact without auto-activation", async () => {
    identity("founder", { email: "founder@fixture.invalid" });
    assert.equal((await request("founder")).status, 200);
    assert.equal(profile("founder").enabled, false);
    assert.equal(profile("founder").founder, true);
    complete("founder");
    assert.doesNotThrow(() => requireFounder({ locals: { actor: { founder: true } } }));
    assert.throws(() => requireFounder({ locals: { actor: { founder: false } } }), e => e.status === 403);
    profile("founder").suspended = true;
    assert.equal((await request("founder", join)).status, 200);
    assert.equal(profile("founder").enabled, true);
    assert.equal(profile("founder").suspended, true);
    assert.equal((await request("founder")).status, 200);
  });
});
