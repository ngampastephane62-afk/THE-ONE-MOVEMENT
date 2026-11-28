import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";
import { eq } from "drizzle-orm";
import { db, ecosystemMembersTable as members, pool } from "@workspace/db";
import { SOCIAL_PROFILES, normalizeSocialProfile } from "@workspace/shared";

// Real HTTP + database persistence; only identity is a test fixture.
// No existing member is modified, and this private fixture is deleted afterward.
const require = createRequire(import.meta.url);
const bundled = await build({
  entryPoints: ["src/routes/member.ts"], bundle: true, write: false, platform: "node", format: "esm",
  plugins: [{
    name: "member-test-fixtures",
    setup(b) {
      b.onResolve({ filter: /^@clerk\/express$/ }, () => ({ path: "identity", namespace: "fixture" }));
      b.onResolve({ filter: /clerkProxyMiddleware$/ }, () => ({ path: "origin", namespace: "fixture" }));
      b.onResolve({ filter: /services\/networkAuth$/ }, () => ({ path: "verified", namespace: "fixture" }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, a => ({
        contents: a.path === "identity"
          ? "export const getAuth = req => ({userId:req.headers['x-fixture-identity'] ?? null});"
          : a.path === "verified"
            ? "export const requireVerifiedIdentity = (_req, _res, next) => next();"
            : "export const getClerkProxyHost = req => req.get('host');",
      }));
      b.onResolve({ filter: /^(express|drizzle-orm|@workspace\/db|@workspace\/api-zod|@workspace\/shared)$/ }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true }));
    },
  }],
});
const { default: router } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
const app = express();
app.use(express.json(), router);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>(r => server.once("listening", r));
const address = server.address();
assert(address && typeof address !== "string");
const origin = `http://127.0.0.1:${address.port}`;
const identity = `social-link-fixture-${crypto.randomUUID()}`;
const headers = { "content-type": "application/json", origin, "x-fixture-identity": identity };
const profile = {
  fullName: "Social Link Fixture", profession: "", organization: "", country: "", bio: "",
  offering: "", lookingFor: "", website: "", sectors: [], isPublic: false,
};
const links = {
  instagramUrl: "https://www.instagram.com/tomi_fixture/?utm_source=test",
  facebookUrl: "https://www.facebook.com/profile.php?id=123456789&tracking=discard",
  tiktokUrl: "https://www.tiktok.com/@tomi_fixture",
  linkedinUrl: "https://www.linkedin.com/in/tomi-fixture/",
};
const put = (data: object) => fetch(`${origin}/member/profile`, { method: "PUT", headers, body: JSON.stringify(data) });
try {
  assert.equal((await fetch(`${origin}/member/profile`)).status, 401);
  let response = await put({ ...profile, ...links });
  assert.equal(response.status, 200);
  const saved = (await response.json()).profile;
  for (const { field } of SOCIAL_PROFILES) assert.equal(saved[field], normalizeSocialProfile(field, links[field]));
  const loaded = (await (await fetch(`${origin}/member/profile`, { headers })).json()).profile;
  for (const { field } of SOCIAL_PROFILES) assert.equal(loaded[field], saved[field]);

  response = await put({ ...profile, instagramUrl: "https://instagram.com.evil.invalid/user" });
  assert.equal(response.status, 400);
  const unchanged = (await (await fetch(`${origin}/member/profile`, { headers })).json()).profile;
  assert.equal(unchanged.instagramUrl, saved.instagramUrl);

  response = await put({ ...profile, bio: "Older clients preserve social links." });
  assert.equal(response.status, 200);
  const preserved = (await response.json()).profile;
  for (const { field } of SOCIAL_PROFILES) assert.equal(preserved[field], saved[field]);

  // Wrong networks, credentials, unsafe schemes, redirects and non-profile URLs fail.
  for (const [field, value] of [
    ["instagramUrl", "javascript:alert(1)"], ["instagramUrl", "https://u:p@instagram.com/user"],
    ["instagramUrl", "https://www.instagram.com/p/post123/"], ["instagramUrl", "https://instagram.com/"],
    ["facebookUrl", "https://www.facebook.com/l.php?u=https://evil.invalid"],
    ["tiktokUrl", "https://www.tiktok.com/@user/video/123"],
    ["linkedinUrl", "https://linkedin.com.evil.invalid/in/user"],
  ] as const) assert.throws(() => normalizeSocialProfile(field, value), undefined, value);

  await put({ ...profile, isPublic: true });
  let directory = (await (await fetch(`${origin}/ecosystem/members`)).json()).members;
  assert.equal(directory.find((m: any) => m.id === saved.id)?.instagramUrl, saved.instagramUrl);
  await put(profile);
  directory = (await (await fetch(`${origin}/ecosystem/members`)).json()).members;
  assert.equal(directory.some((m: any) => m.id === saved.id), false);

  const blank = Object.fromEntries(SOCIAL_PROFILES.map(({ field }) => [field, ""]));
  response = await put({ ...profile, ...blank });
  assert.equal(response.status, 200);
  const cleared = (await response.json()).profile;
  for (const { field } of SOCIAL_PROFILES) assert.equal(cleared[field], "");
  assert.equal(cleared.fullName, profile.fullName);
  console.log("PASS: profile link create/read/preserve/remove, validation, authentication and public visibility.");
} finally {
  await db.delete(members).where(eq(members.clerkId, identity));
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await pool.end();
}
