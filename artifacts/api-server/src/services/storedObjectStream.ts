import type { Request, Response } from "express";
import { objectFile } from "./networkFiles";

/**
 * Byte-range delivery of a fixed, allowlisted storage object without holding
 * the file in process memory. Only its size is cached, so serving a large
 * video costs one small metadata entry, not the whole file.
 *
 * Cancellation follows editorialStream.ts: the Cloud Storage read is destroyed
 * on client abort only after its HTTP response has started, because cancelling
 * earlier raises an uncaught error inside the SDK (see the curated-reel note).
 */
const sizes = new Map<string, Promise<number>>();
function objectSize(path: string) {
  let pending = sizes.get(path);
  if (!pending) {
    pending = objectFile(path).getMetadata()
      .then(([metadata]) => {
        const size = Number(metadata.size);
        if (!Number.isSafeInteger(size) || size < 1) throw new Error("Stored object has no usable size");
        return size;
      })
      .catch((error: unknown) => { sizes.delete(path); throw error; });
    sizes.set(path, pending);
  }
  return pending;
}

export async function streamStoredObject(req: Request, res: Response, path: string, contentType: string, options: { privateAsset?: boolean; maxAge?: number } = {}) {
  const size = await objectSize(path);
  if (res.destroyed) return;
  let start = 0, end = size - 1;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    if (!range[1]) start = Math.max(0, size - Number(range[2]));
    else { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size || (!range[1] && Number(range[2]) === 0)) {
      return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set({
    "Content-Type": contentType, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": options.privateAsset ? "private,no-store" : `public,max-age=${options.maxAge ?? 3600}`,
  });
  if (req.method === "HEAD") return void res.end();
  const stream = objectFile(path).createReadStream({ start, end });
  let responseStarted = false;
  stream.once("response", () => { responseStarted = true; if (res.destroyed) stream.destroy(); });
  res.once("close", () => { if (responseStarted) stream.destroy(); });
  stream.on("error", (error: unknown) => {
    if (res.destroyed) return;
    req.log?.warn({ err: error }, "Stored media stream unavailable");
    if (!res.headersSent) res.status(502).end();
    else res.destroy();
  }).pipe(res);
}
