import { Router, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, networkUploads } from "@workspace/db";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { streamEditorialUpload } from "../services/editorialStream";
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
  streamEditorialUpload(req, res, upload);
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
