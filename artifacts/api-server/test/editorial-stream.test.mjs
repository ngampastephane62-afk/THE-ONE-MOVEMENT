import test from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { once } from "node:events";
import { build } from "esbuild";
const bundled = await build({ stdin: { contents: 'export { streamEditorialUpload } from "./src/services/editorialStream"; export { reads } from "fixture";',
  resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false, packages: "external", plugins: [{
  name: "isolated-cloud", setup(b) {
    b.onResolve({ filter: /^fixture$|\/networkFiles$/ }, () => ({ path: "fixture", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: `
      import {Readable} from 'node:stream'; export const reads=[];
      export const objectFile=()=>({createReadStream:options=>{reads.push(options);
        const stream=Readable.from([Buffer.alloc(Math.min(10, options.end-options.start+1),65)]);
        process.nextTick(()=>stream.emit('response'));return stream;},
        download:()=>{throw Error('Full-buffer downloads are prohibited');}});
    ` }));
  },
}] });
const { streamEditorialUpload, reads } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
class Response extends Writable {
  headers = {}; statusCode = 200; chunks = [];
  set(key, value) { if (typeof key === "object") Object.assign(this.headers, key); else this.headers[key] = value; return this; }
  status(value) { this.statusCode = value; return this; }
  _write(chunk, _encoding, next) { this.chunks.push(chunk); next(); }
}
const upload = { size: 500 * 1024 * 1024, contentType: "video/mp4", objectPath: "/fixture/private-video" };
async function request(method, range) {
  const res = new Response(), completed = once(res, "finish");
  streamEditorialUpload({ method, headers: range ? { range } : {}, log: { warn() {} } }, res, upload);
  await completed; return res;
}
test("500 MiB HEAD requests use metadata only, without allocating or downloading the video", async () => {
  const initial = reads.length;
  const res = await request("HEAD");
  assert.equal(reads.length, initial);
  assert.equal(res.headers["Content-Length"], String(upload.size));
  assert.equal(res.headers["Accept-Ranges"], "bytes");
  assert.equal(res.headers["X-Content-Type-Options"], "nosniff");
});
test("bounded and suffix byte requests stream only their requested range", async () => {
  const first = await request("GET", "bytes=0-9");
  assert.equal(first.statusCode, 206);
  assert.equal(first.headers["Content-Length"], "10");
  assert.equal(Buffer.concat(first.chunks).length, 10);
  assert.deepEqual(reads.at(-1), { start: 0, end: 9 });
  const last = await request("GET", "bytes=-10");
  assert.equal(last.headers["Content-Range"], `bytes ${upload.size - 10}-${upload.size - 1}/${upload.size}`);
  assert.deepEqual(reads.at(-1), { start: upload.size - 10, end: upload.size - 1 });
});
test("malformed, multi-part, zero-length and unsatisfiable ranges never open cloud streams", async () => {
  const initial = reads.length;
  for (const range of ["bytes=-0", "bytes=9-1", `bytes=${upload.size}-`, "bytes=0-1,5-6", "invalid"]) {
    const res = await request("GET", range);
    assert.equal(res.statusCode, 416);
    assert.equal(res.headers["Content-Range"], `bytes */${upload.size}`);
  }
  assert.equal(reads.length, initial);
});
