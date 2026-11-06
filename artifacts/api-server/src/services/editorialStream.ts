import type { Request, Response } from "express";
import { objectFile } from "./networkFiles";

/** Authorization is checked by the caller before invoking this byte-range stream. */
export function streamEditorialUpload(req: Request, res: Response, upload: { size: number; contentType: string; objectPath: string }) {
  if (res.destroyed) return;
  let start = 0, end = upload.size - 1;
  if (req.headers.range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!m || (!m[1] && !m[2])) return void res.status(416).set("Content-Range", `bytes */${upload.size}`).end();
    if (!m[1]) start = Math.max(0, upload.size - Number(m[2]));
    else { start = Number(m[1]); if (m[2]) end = Math.min(end, Number(m[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= upload.size) {
      return void res.status(416).set("Content-Range", `bytes */${upload.size}`).end();
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${upload.size}`);
  }
  res.set({ "Content-Type": upload.contentType, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes",
    "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" });
  if (req.method === "HEAD") return void res.end();
  const stream = objectFile(upload.objectPath).createReadStream({ start, end });
  // The GCS sidecar must have an HTTP response before cancellation is safe.
  let responseStarted = false;
  stream.once("response", () => { responseStarted = true; if (res.destroyed) stream.destroy(); });
  res.once("close", () => { if (responseStarted) stream.destroy(); });
  stream.on("error", (error: unknown) => {
    if (res.destroyed) return;
    req.log.warn({ err: error }, "Editorial media stream unavailable");
    if (!res.headersSent) res.status(502).end();
    else res.destroy();
  }).pipe(res);
}
