import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { mkdtemp, rm, copyFile, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ts from "typescript";

// Native processing tests, local temporary files only. No auth, DB, storage or server.
const exec = promisify(execFile);
const require = createRequire(import.meta.url);
class NetworkError extends Error { constructor(status, message) { super(message); this.status = status; } }
const module = { exports: {} };
runInNewContext(ts.transpileModule(readFileSync(new URL("../src/services/gratitudeVideo.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, { module, exports: module.exports, require: id => id === "./networkAuth" ? { NetworkError } : require(id),
  process, Buffer, console });
const { processGratitudeFile } = module.exports;
const root = await mkdtemp(path.join(tmpdir(), "tomi-gratitude-native-test-"));
try {
  for (const ext of ["mp4", "mov", "webm"]) {
    await test(`processes an actual ${ext} video and generates a private derivative and thumbnail`, async () => {
      const source = path.join(root, `input.${ext}`);
      await exec("ffmpeg", ["-nostdin", "-v", "error", "-threads", "1", "-filter_threads", "1",
        "-f", "lavfi", "-i", "testsrc=size=160x120:rate=10", "-t", "0.5",
        "-c:v", ext === "webm" ? "libvpx" : "libx264", "-threads", "1", "-pix_fmt", "yuv420p", "-y", source]);
      let processed = false;
      await processGratitudeFile(destination => copyFile(source, destination), "video", async result => {
        assert.ok(result.durationMs > 0 && result.durationMs <= 1000);
        assert.equal(result.type, "video/mp4");
        assert.ok((await stat(result.playback)).size > 0);
        assert.ok((await stat(result.thumbnail)).size > 0);
        assert.equal(result.width, 160);
        processed = true;
      });
      assert.ok(processed);
    });
  }
  await test("re-encodes an image and strips it into a bounded JPEG", async () => {
    const source = path.join(root, "image.png");
    await exec("ffmpeg", ["-nostdin", "-v", "error", "-threads", "1", "-filter_threads", "1", "-f", "lavfi",
      "-i", "color=c=green:size=160x120", "-frames:v", "1", "-y", source]);
    await processGratitudeFile(destination => copyFile(source, destination), "image", async result => {
      assert.equal(result.durationMs, null);
      assert.equal(result.thumbnail, null);
      assert.equal(result.type, "image/jpeg");
      assert.ok((await stat(result.playback)).size > 0);
    });
  });
  await test("rejects malformed media instead of declaring it playable", async () => {
    await assert.rejects(() => processGratitudeFile(
      destination => writeFile(destination, "not a valid media file"), "video",
      async () => { assert.fail("Malformed media must not become ready"); },
    ));
  });
  await test("rejects a real video above the three-minute duration limit", async () => {
    const source = path.join(root, "too-long.mp4");
    await exec("ffmpeg", ["-nostdin", "-v", "error", "-threads", "1", "-filter_threads", "1",
      "-f", "lavfi", "-i", "color=c=green:size=32x32:rate=1", "-t", "181",
      "-c:v", "libx264", "-threads", "1", "-pix_fmt", "yuv420p", "-y", source]);
    await assert.rejects(() => processGratitudeFile(destination => copyFile(source, destination), "video", async () => {
      assert.fail("Oversized duration must not become ready");
    }), e => e.status === 400 && /three minutes/.test(e.message));
  });
} finally { await rm(root, { recursive: true, force: true }); }
