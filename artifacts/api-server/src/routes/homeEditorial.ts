import { Router, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, networkUploads } from "@workspace/db";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { objectFile } from "../services/networkFiles";
import { homeDocument, homeDTO, homeUploads, saveHome } from "../services/homeEditorial";

const router = Router();
router.get("/home-editorial", async (_req, res) => {
  res.set("Cache-Control", "no-store").json(homeDTO(await homeDocument()));
});
router.get("/founder/home-editorial", networkAuth, async (_req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private,no-store").json(homeDTO(await homeDocument(true), true));
});
router.put("/founder/home-editorial", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const saved = await saveHome(req.body, actor(res, false).member.id);
  res.set("Cache-Control", "private,no-store").json(homeDTO(saved, true));
});
async function serve(req: Request, res: Response, id: string) {
  const [upload] = await db.select().from(networkUploads).where(and(eq(networkUploads.id, id), eq(networkUploads.ready, true)));
  if (!upload) throw new NetworkError(404, "Media not found.");
  let start = 0, end = upload.size - 1;
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match || (!match[1] && !match[2])) return void res.status(416).set("Content-Range", `bytes */${upload.size}`).end();
    if (!match[1]) start = Math.max(0, upload.size - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= upload.size) return void res.status(416).set("Content-Range", `bytes */${upload.size}`).end();
  }
  const [bytes] = await objectFile(upload.objectPath).download({ start, end });
  if (res.destroyed) return;
  res.set({ "Content-Type": upload.contentType, "Content-Length": String(bytes.length), "Accept-Ranges": "bytes",
    "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" });
  if (req.headers.range) res.status(206).set("Content-Range", `bytes ${start}-${end}/${upload.size}`);
  res.send(bytes);
}
router.get("/home-editorial/assets/:id", async (req, res, next) => {
  const id = String(req.params.id);
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new NetworkError(404, "Media not found.");
  if (homeUploads(await homeDocument(), true).has(id)) return serve(req, res, id);
  return networkAuth(req, res, () => {
    try {
      requireFounder(res);
      void homeDocument(true).then(doc => {
        if (!homeUploads(doc).has(id)) throw new NetworkError(404, "Media not found.");
        return serve(req, res, id);
      }).catch(next);
    } catch (error) { next(error); }
  });
});
export default router;
