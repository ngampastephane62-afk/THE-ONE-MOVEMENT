import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const module = { exports: {} };
runInNewContext(
  ts.transpileModule(readFileSync(new URL("../src/services/networkMediaStream.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  { module, exports: module.exports },
);
const { handleNetworkMediaStreamError } = module.exports;

function fixture({ headersSent = false, destroyed = false, writableEnded = false, range = "bytes=0-99" } = {}) {
  const calls = { logs: [], status: null, ended: false, destroyed: false };
  const req = { headers: { range }, log: { error: (fields, message) => calls.logs.push({ fields, message }) } };
  const res = {
    headersSent, destroyed, writableEnded,
    status(code) { calls.status = code; return this; },
    end() { calls.ended = true; this.writableEnded = true; },
    destroy() { calls.destroyed = true; this.destroyed = true; },
  };
  return { req, res, calls };
}

test("a storage error before response headers becomes an HTTP 502", () => {
  const { req, res, calls } = fixture();
  handleNetworkMediaStreamError(req, res, Object.assign(new Error("private storage path"), { code: "ECONNRESET" }));
  assert.equal(calls.status, 502);
  assert.equal(calls.ended, true);
  assert.equal(calls.destroyed, false);
  assert.equal(calls.logs.length, 1);
  assert.equal(calls.logs[0].fields.storageErrorCode, "ECONNRESET");
  assert.equal(calls.logs[0].fields.rangeRequested, true);
  assert.deepEqual(Object.keys(calls.logs[0].fields).sort(), ["rangeRequested", "storageErrorCode"]);
  assert.equal(calls.logs[0].message, "Network media storage stream failed");
  assert.doesNotMatch(JSON.stringify(calls.logs), /private storage path/);
});

test("a storage error after headers destroys the response instead of ending a truncated 206 cleanly", () => {
  const { req, res, calls } = fixture({ headersSent: true });
  handleNetworkMediaStreamError(req, res, new Error("stream interrupted"));
  assert.equal(calls.status, null);
  assert.equal(calls.ended, false);
  assert.equal(calls.destroyed, true);
  assert.equal(calls.logs.length, 1);
  assert.equal(calls.logs[0].fields.storageErrorCode, "UNKNOWN");
});

test("a client-closed response is not logged or written again", () => {
  const { req, res, calls } = fixture({ destroyed: true });
  handleNetworkMediaStreamError(req, res, new Error("client closed"));
  assert.equal(calls.logs.length, 0);
  assert.equal(calls.status, null);
  assert.equal(calls.ended, false);
});
