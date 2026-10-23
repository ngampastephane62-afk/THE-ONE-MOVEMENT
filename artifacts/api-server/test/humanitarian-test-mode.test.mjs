import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const exports = {};
runInNewContext(ts.transpileModule(
  readFileSync(new URL("../src/lib/humanitarianTestMode.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, { exports });
const authorized = exports.humanitarianTestAuthorized;
const editor = { NODE_ENV: "development", REPL_ID: "fixture", REPLIT_DEV_DOMAIN: "fixture.replit.dev", TOMI_HUMANITARIAN_TEST_AUTHORIZED: "true" };
test("test donations require explicit development-editor opt-in; no flag enables them on a deployment", () => {
  assert.equal(authorized(editor), true);
  for (const override of [
    { NODE_ENV: "production" }, { NODE_ENV: undefined }, { REPL_ID: undefined },
    { REPLIT_DEV_DOMAIN: undefined }, { REPLIT_DEPLOYMENT: "1" }, { REPLIT_DEPLOYMENT: "0" },
    { TOMI_HUMANITARIAN_TEST_AUTHORIZED: "false" }, { TOMI_HUMANITARIAN_TEST_AUTHORIZED: undefined },
  ]) assert.equal(authorized({ ...editor, ...override }), false);
  assert.equal(authorized({ ...editor, REPLIT_ENVIRONMENT: "production" }), true, "undocumented environment label is not a deployment selector");
});
