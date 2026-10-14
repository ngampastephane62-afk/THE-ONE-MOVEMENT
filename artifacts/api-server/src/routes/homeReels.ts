import { Router } from "express";
import { Storage } from "@google-cloud/storage";

const router = Router();
const storage = new Storage({
  projectId: "",
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: "http://127.0.0.1:1106/token",
    type: "external_account",
    credential_source: {
      url: "http://127.0.0.1:1106/credential",
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
});

// This fixed set totals ~23 MB. Cache the completed downloads so seeking and
// aborted browser requests never cancel a shared cloud stream or re-fetch it.
const assets = new Map<string, Promise<Buffer>>();

function loadAsset(bucket: string, filename: string): Promise<Buffer> {
  let asset = assets.get(filename);
  if (!asset) {
    asset = storage.bucket(bucket).file(`public/home-reels/${filename}`).download()
      .then(([bytes]) => bytes)
      .catch((error: unknown) => {
        assets.delete(filename);
        throw error;
      });
    assets.set(filename, asset);
  }
  return asset;
}

// Only the six curated public homepage assets can be served here.
router.get("/home-reels/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!/^reel-[123]\.(mp4|webp)$/.test(filename)) {
    res.sendStatus(404);
    return;
  }
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) {
    res.sendStatus(503);
    return;
  }
  try {
    const bytes = await loadAsset(bucket, filename);
    if (res.destroyed) return;
    const size = bytes.length;
    res.set({
      "Content-Type": filename.endsWith(".mp4") ? "video/mp4" : "image/webp",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    });
    let start = 0;
    let end = size - 1;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) {
        res.status(416).set("Content-Range", `bytes */${size}`).end();
        return;
      }
      if (!match[1]) start = Math.max(0, size - Number(match[2]));
      else {
        start = Number(match[1]);
        if (match[2]) end = Math.min(end, Number(match[2]));
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
        res.status(416).set("Content-Range", `bytes */${size}`).end();
        return;
      }
      res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    res.set("Content-Length", String(end - start + 1));
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(bytes.subarray(start, end + 1));
  } catch (error) {
    req.log.error({ err: error }, "Homepage reel unavailable");
    res.sendStatus(502);
  }
});

export default router;
