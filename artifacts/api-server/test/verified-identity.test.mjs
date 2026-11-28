import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

// Profile edits can publish to the public directory: they require a verified,
// unrestricted Clerk identity, checked without creating any member rows.
const bundled = await build({ stdin: { contents: 'export { requireVerifiedIdentity } from "./src/services/networkAuth"; export { users } from "clerk";',
  resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false, packages: "external", plugins: [{
  name: "isolated-identity", setup(b) {
    b.onResolve({ filter: /^@clerk\/express$|^clerk$/ }, () => ({ path: "clerk", namespace: "fixture" }));
    b.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "db", namespace: "fixture" }));
    b.onResolve({ filter: /^drizzle-orm$/ }, () => ({ path: "orm", namespace: "fixture" }));
    b.onResolve({ filter: /clerkProxyMiddleware$/ }, () => ({ path: "host", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, a => ({ contents: {
      clerk: `export const users = {};
        export const getAuth = req => ({ userId: req.identity ?? null });
        export const clerkClient = { users: { getUser: async id => { if (!users[id]) throw Error('down'); return users[id]; } } };`,
      db: `export const db = new Proxy({}, { get() { throw Error('No database access expected'); } });
        export const ecosystemMembersTable = {}; export const networkProfiles = {};`,
      orm: `export const eq = () => null;`,
      host: `export const getClerkProxyHost = () => 'fixture.invalid';`,
    }[a.path] }));
  },
}] });
const { requireVerifiedIdentity, users } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
const user = (status, extra = {}) => ({ primaryEmailAddressId: "e1", emailAddresses: [{ id: "e1", emailAddress: "m@example.invalid", verification: { status } }],
  firstName: "M", lastName: "", banned: false, locked: false, createdAt: 0, ...extra });
async function check(identity) {
  const res = { statusCode: 200, payload: null, status(c) { this.statusCode = c; return this; }, json(p) { this.payload = p; return this; } };
  let passed = false;
  await requireVerifiedIdentity({ identity }, res, () => { passed = true; });
  return { passed, status: res.statusCode };
}

test("verified, unrestricted identities may edit", async () => {
  users.ok = user("verified");
  assert.deepEqual(await check("ok"), { passed: true, status: 200 });
});
test("unverified primary email is refused", async () => {
  users.unverified = user("unverified");
  assert.deepEqual(await check("unverified"), { passed: false, status: 403 });
});
test("banned or locked accounts are refused", async () => {
  users.banned = user("verified", { banned: true });
  users.locked = user("verified", { locked: true });
  assert.equal((await check("banned")).status, 403);
  assert.equal((await check("locked")).status, 403);
});
test("signed-out and unreachable identity checks fail closed", async () => {
  assert.equal((await check(undefined)).status, 401);
  assert.equal((await check("missing")).status, 503);
});
