import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({
  stdin: { contents: `
    export { parseMembershipDashboardQuery as parse } from "./src/lib/membershipDashboardQuery";
    export { getGetMembershipDashboardUrl as url } from "../../lib/api-client-react/src/generated/api";
  `, resolveDir: process.cwd() },
  platform: "node", format: "esm", bundle: true, write: false,
  plugins: [{
    name: "no-browser-or-network",
    setup(b) {
      b.onResolve({ filter: /^@tanstack\/react-query$/ }, () => ({ path: "query", namespace: "fixture" }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
        contents: "export function useQuery(){throw Error('Unexpected hook')} export function useMutation(){throw Error('Unexpected hook')}",
      }));
    },
  }],
});
const { parse, url } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

test("real generated URLs round-trip through HTTP query parsing for every duration and account filter", () => {
  for (const days of [7, 30, 90]) {
    for (const status of ["all", "no_profile", "incomplete", "complete", "active"]) {
      const params = { days, status, page: 2, search: "Fixture + é" };
      const serialized = new URL(url(params), "https://fixture.invalid");
      const parsed = parse(Object.fromEntries(serialized.searchParams));
      assert.equal(parsed.success, true);
      assert.deepEqual(parsed.data, params);
    }
  }
});

test("omitted values retain defaults; invalid or repeated durations remain rejected", () => {
  assert.deepEqual(parse({}).data, { days: 30, page: 1, status: "all" });
  for (const days of ["", "0", "8", "30.0", "NaN", "30abc", ["30"], ["7", "90"], null, {}])
    assert.equal(parse({ days }).success, false);
  assert.equal(parse({ days: "30", page: "0" }).success, false);
  assert.equal(parse({ days: "30", status: "unknown" }).success, false);
  assert.equal(parse({ days: "30", search: "x".repeat(121) }).success, false);
});
