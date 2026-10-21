import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { runInNewContext } from "node:vm";
import { setImmediate as flushMicrotasks } from "node:timers/promises";
import test from "node:test";
import ts from "typescript";

// Only pure policy and mocked entrypoint execution. Never load the app, DB,
// Stripe integration, real application timers or real listening sockets.
const root = resolve(import.meta.dirname, "../src");
const compile = path => ts.transpileModule(readFileSync(path, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadPolicy() {
  const module = { exports: {} };
  runInNewContext(compile(resolve(root, "lib/previewStartup.ts")), { module, exports: module.exports });
  return module.exports.stripeStartupMode;
}
const mode = loadPolicy();
const preview = {
  NODE_ENV: "development", REPL_ID: "isolated-editor",
  REPLIT_DEV_DOMAIN: "isolated.invalid", TOMI_PREVIEW_SKIP_STRIPE_INIT: "1",
};

test("only an explicitly configured Replit development editor skips bootstrap", () => {
  assert.equal(mode(preview), "preview-skip");
  for (const patch of [
    { TOMI_PREVIEW_SKIP_STRIPE_INIT: undefined },
    { TOMI_PREVIEW_SKIP_STRIPE_INIT: "true" },
    { TOMI_PREVIEW_SKIP_STRIPE_INIT: "0" },
    { NODE_ENV: undefined }, { NODE_ENV: "test" },
    { REPL_ID: undefined }, { REPLIT_DEV_DOMAIN: undefined },
    { REPLIT_DEPLOYMENT: "unexpected" },
  ]) assert.throws(() => mode({ ...preview, ...patch }), /refusing startup/);
});

test("every production marker retains initialization even if the preview flag leaks", () => {
  for (const patch of [
    { NODE_ENV: "production" },
    { REPLIT_DEPLOYMENT: "1" },
  ]) {
    assert.equal(mode({ ...preview, ...patch }), "initialize");
    assert.equal(mode({ ...preview, ...patch, TOMI_PREVIEW_SKIP_STRIPE_INIT: undefined }), "initialize");
  }
  assert.equal(mode({}), "initialize");
  assert.equal(mode({ NODE_ENV: "development" }), "initialize");
  assert.equal(mode({ REPLIT_ENVIRONMENT: "production" }), "initialize");
});

test("undocumented environment labels do not override explicit editor and deployment checks", () => {
  for (const label of ["production", "development", "unknown", undefined]) {
    assert.equal(mode({ ...preview, REPLIT_ENVIRONMENT: label }), "preview-skip");
    assert.throws(() => mode({
      ...preview, TOMI_PREVIEW_SKIP_STRIPE_INIT: undefined,
      REPLIT_ENVIRONMENT: label,
    }), /refusing startup/);
  }
  // Real deployment markers still take precedence and retain production behavior.
  assert.equal(mode({ ...preview, NODE_ENV: "production", REPLIT_ENVIRONMENT: "production" }), "initialize");
  assert.equal(mode({ ...preview, REPLIT_DEPLOYMENT: "1", REPLIT_ENVIRONMENT: "production" }), "initialize");
});

function runEntry(env, { failPayments = false } = {}) {
  const calls = { initialize: 0, listen: 0, timers: 0, warnings: [], infos: [], errors: [] };
  const module = { exports: {} };
  runInNewContext(compile(resolve(root, "index.ts")), {
    module, exports: module.exports, process: { env: { PORT: "8080", ...env } },
    setTimeout(fn, delay) {
      calls.timers++;
      assert.equal(delay, 60000);
      return { unref() {} };
    },
    require(id) {
      if (id === "./lib/previewStartup") return { stripeStartupMode: mode };
      if (id === "./app") return { default: { listen(port, callback) { calls.listen++; assert.equal(port, 8080); callback(); } } };
      if (id === "./lib/logger") return { logger: {
        info: (...args) => calls.infos.push(args), warn: message => calls.warnings.push(message),
        error: message => calls.errors.push(message),
      } };
      if (id === "./services/networkPayments") return { initializeStripe: async () => {
        calls.initialize++;
        if (failPayments) throw new Error("Isolated bootstrap failure");
      } };
      assert.fail(`Forbidden real startup import: ${id}`);
    },
  });
  return calls;
}

test("preview entrypoint opens the API but never initializes payments or schedules retries", async () => {
  const calls = runEntry(preview, { failPayments: true });
  await Promise.resolve();
  assert.equal(calls.listen, 1);
  assert.equal(calls.initialize, 0);
  assert.equal(calls.timers, 0);
  assert.match(calls.warnings[0], /disabled explicitly/);
});

test("misconfigured preview refuses startup before opening a socket", () => {
  assert.throws(() => runEntry({ ...preview, TOMI_PREVIEW_SKIP_STRIPE_INIT: undefined }), /refusing startup/);
  assert.throws(() => runEntry({ ...preview, REPLIT_DEPLOYMENT: "unexpected" }), /refusing startup/);
});

test("production retains the existing payment initialization and failure retry", async () => {
  const calls = runEntry({ ...preview, NODE_ENV: "production" }, { failPayments: true });
  await flushMicrotasks(); // Allow the VM's rejected promise to reach its catch.
  assert.equal(calls.listen, 1);
  assert.equal(calls.initialize, 1);
  assert.equal(calls.timers, 1);
  assert.match(calls.warnings[0], /normal payment initialization retained/);
  const normal = runEntry({ NODE_ENV: "production" });
  await Promise.resolve();
  assert.equal(normal.initialize, 1);
  assert.equal(normal.warnings.length, 0);
});

test("application import graph has no eager project data writes or startup tasks", () => {
  // Traverse only modules actually imported by the app: standalone scripts/tests
  // are deliberately excluded. Review unknown eager operations, don't execute them.
  const seen = new Set(), eager = [];
  function visitFile(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const src = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isFunctionLike(node)) return; // Registered route/middleware callbacks aren't startup operations.
      if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        const name = node.expression.getText(src);
        if (/\b(db|pool)\.(execute|query|insert|update|delete)\b|migrat|syncBackfill|seed|setInterval|setTimeout|initializeStripe|startPayments|\.save$|writeFile/i.test(name)) {
          eager.push(`${file}: ${name}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(src);
    for (const statement of src.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      if (statement.importClause?.isTypeOnly) continue;
      const id = statement.moduleSpecifier.text;
      const base = id === "@workspace/db" ? resolve(root, "../../../lib/db/src/index")
        : id.startsWith(".") ? resolve(dirname(file), id) : null;
      if (!base) continue;
      const next = [base + ".ts", resolve(base, "index.ts")].find(existsSync);
      assert.ok(next, `Resolve startup dependency ${id}`);
      visitFile(next);
    }
  }
  visitFile(resolve(root, "app.ts"));
  assert.ok(seen.size > 30);
  assert.deepEqual(eager, [], "Potentially persistent eager operation requires review before starting the API");
});
