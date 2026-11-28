import test from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { once } from "node:events";
import { build } from "esbuild";

// Allowlisted public videos must stream by range, never buffer the whole file.
const bundled = await build({ stdin: { contents: 'export { streamStoredObject } from "./src/services/storedObjectStream"; export { reads, metadataCalls } from "fixture";',
  resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false, packages: "external", plugins: [{
  name: "isolated-cloud", setup(b) {
    b.onResolve({ filter: /^fixture$|\/networkFiles$/ }, () => ({ path: "fixture", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: `
      import {Readable} from 'node:stream'; export const reads=[]; export const metadataCalls=[];
      export const objectFile=path=>({
        getMetadata:async()=>{metadataCalls.push(path);return [{size:String(400*1024*1024)}];},
        createReadStream:options=>{reads.push(options);
          const stream=Readable.from([Buffer.alloc(Math.min(10, options.end-options.start+1),65)]);
          process.nextTick(()=>stream.emit('response'));return stream;},
        download:()=>{throw Error('Full-buffer downloads are prohibited');}});
    ` }));
  },
}] });
const { streamStoredObject, reads, metadataCalls } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
class Response extends Writable {
  headers = {}; statusCode = 200; headersSent = false;
  set(key, value) { if (typeof key === "object") Object.assign(this.headers, key); else this.headers[key] = value; return this; }
  status(value) { this.statusCode = value; return this; }
  _write(_chunk, _encoding, next) { next(); }
}
const size = 400 * 1024 * 1024;
async function request(path, method, range) {
  const res = new Response(), completed = once(res, "finish");
  await streamStoredObject({ method, headers: range ? { range } : {}, log: { warn() {} } }, res, path, "video/mp4");
  await completed; return res;
}

test("HEAD returns the full length without reading object bytes", async () => {
  const before = reads.length;
  const res = await request("/bucket/public/a.mp4", "HEAD");
  assert.equal(reads.length, before);
  assert.equal(res.headers["Content-Length"], String(size));
  assert.equal(res.headers["Accept-Ranges"], "bytes");
});

test("bounded and suffix ranges read only the requested bytes", async () => {
  let res = await request("/bucket/public/a.mp4", "GET", "bytes=100-199");
  assert.equal(res.statusCode, 206);
  assert.equal(res.headers["Content-Range"], `bytes 100-199/${size}`);
  assert.deepEqual(reads.at(-1), { start: 100, end: 199 });
  res = await request("/bucket/public/a.mp4", "GET", "bytes=-50");
  assert.deepEqual(reads.at(-1), { start: size - 50, end: size - 1 });
});

test("invalid ranges are rejected with 416", async () => {
  for (const range of ["bytes=-0", `bytes=${size}-`, "bytes=9-1", "items=0-1"]) {
    assert.equal((await request("/bucket/public/a.mp4", "GET", range)).statusCode, 416, range);
  }
});

test("object size is looked up once per path", async () => {
  const path = "/bucket/public/cached.mp4";
  await request(path, "HEAD"); await request(path, "GET", "bytes=0-9");
  assert.equal(metadataCalls.filter(p => p === path).length, 1);
});
