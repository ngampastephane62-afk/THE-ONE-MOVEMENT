import type { Request, Response } from "express";

export function sendBufferedVideo(req: Request, res: Response, bytes: Buffer, type = "video/mp4", privateAsset = false) {
  if (res.destroyed) return;
  const size = bytes.length;
  res.set({
    "Content-Type": type, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff",
    "Cache-Control": privateAsset ? "private,no-store" : "public,max-age=3600",
  });
  let start = 0, end = size - 1;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    if (!range[1]) start = Math.max(0, size - Number(range[2]));
    else {
      start = Number(range[1]);
      if (range[2]) end = Math.min(size - 1, Number(range[2]));
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size || Number(range[2]) === 0 && !range[1]) {
      return void res.status(416).set("Content-Range", `bytes */${size}`).end();
    }
    res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  res.set("Content-Length", String(end - start + 1)).end(bytes.subarray(start, end + 1));
}
