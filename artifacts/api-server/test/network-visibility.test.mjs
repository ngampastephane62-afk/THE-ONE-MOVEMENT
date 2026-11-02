import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({
  stdin: { contents: `
    export { canViewPost, projectPostAuthor } from "./src/services/networkVisibility";
  `, resolveDir: process.cwd() },
  platform: "node", format: "esm", bundle: true, write: false,
});
const { canViewPost, projectPostAuthor } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`,
);

const base = {
  authorId: 1, viewerId: 2, visibilitySector: null, followsAuthor: false,
  activeSectors: [], founder: false,
};

test("community posts are visible to other verified members", () => {
  assert.equal(canViewPost({ ...base, visibility: "community" }), true);
});

test("followers-only posts require a real follow, except for the author", () => {
  assert.equal(canViewPost({ ...base, visibility: "followers" }), false);
  assert.equal(canViewPost({ ...base, visibility: "followers", followsAuthor: true }), true);
  assert.equal(canViewPost({ ...base, viewerId: 1, visibility: "followers" }), true);
});

test("sector posts require the selected sector; Founder access does not bypass follower privacy", () => {
  assert.equal(canViewPost({ ...base, visibility: "sector", visibilitySector: "fashion" }), false);
  assert.equal(canViewPost({ ...base, visibility: "sector", visibilitySector: "fashion", activeSectors: ["fashion"] }), true);
  assert.equal(canViewPost({ ...base, visibility: "sector", visibilitySector: "fashion", founder: true }), true);
  assert.equal(canViewPost({ ...base, visibility: "followers", founder: true }), false);
});

test("drafts remain private even from Founder", () => {
  assert.equal(canViewPost({ ...base, visibility: "draft" }), false);
  assert.equal(canViewPost({ ...base, visibility: "draft", founder: true }), false);
  assert.equal(canViewPost({ ...base, viewerId: 1, visibility: "draft" }), true);
});

test("a hidden author's post exposes only their name; hidden comment authors remain generic", () => {
  const source = {
    id: 9, fullName: "Member Name", profileVisible: false,
    profession: "Private profession", avatarUrl: "/private/avatar", founder: true,
  };
  assert.deepEqual(projectPostAuthor(source), { id: 9, fullName: "Member Name", profileVisible: false });
  assert.deepEqual(projectPostAuthor(source, true), { id: 9, fullName: "Community member", profileVisible: false });
});
