import { Router, type Request, type Response, type NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db, networkUploads } from "@workspace/db";
import { DeletePartnerOrganizationBody } from "@workspace/api-zod";
import { networkAuth, networkWrite, requireFounder, actor, NetworkError } from "../services/networkAuth";
import { objectFile } from "../services/networkFiles";
import { partnerState, partnerDTO, partnerKey, savePartner, removePartner, savePartnerContent } from "../services/partnerDirectoryStore";
import { MEDIA_IMAGE_TYPES, MEDIA_IMAGE_MAX } from "../services/mediaCenterValidation";

const router = Router();
async function directory(res: Response, admin: boolean) {
  const state = await partnerState();
  res.set("Cache-Control", "private,no-store").json({
    items: state.items.filter(p => admin || (p.status === "published" && p.relationshipVerified && p.rightsConfirmed && !!p.logoUrl)).map(p => partnerDTO(p, admin)),
    content: state.content,
  });
}
router.get("/partner-directory", (_req, res) => directory(res, false));
router.get("/founder/partner-directory", networkAuth, (_req, res) => { requireFounder(res); return directory(res, true); });
router.post("/founder/partner-directory", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const saved = await savePartner(req.body, actor(res, false).member.id);
  res.set("Cache-Control", "private,no-store").status(201).json(partnerDTO(saved, true));
});
router.put("/founder/partner-directory/content", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private,no-store").json(await savePartnerContent(req.body));
});
router.put("/founder/partner-directory/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private,no-store").json(partnerDTO(await savePartner(req.body, actor(res, false).member.id, partnerKey(req.params.id)), true));
});
router.delete("/founder/partner-directory/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const body = DeletePartnerOrganizationBody.strict().safeParse(req.body);
  if (!body.success) throw new NetworkError(409, "Reload the entry before deleting it.");
  await removePartner(partnerKey(req.params.id), body.data.expectedUpdatedAt);
  res.status(204).send();
});

async function image(req: Request, res: Response, uploadId: string) {
  const [upload] = await db.select().from(networkUploads).where(and(eq(networkUploads.id, uploadId), eq(networkUploads.ready, true)));
  if (!upload || !MEDIA_IMAGE_TYPES.has(upload.contentType) || upload.size > MEDIA_IMAGE_MAX) throw new NetworkError(404, "Logo not found.");
  const [bytes] = await objectFile(upload.objectPath).download();
  if (res.destroyed) return;
  res.set({ "Content-Type": upload.contentType, "Content-Length": String(bytes.length), "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" }).send(bytes);
}
router.get("/partner-directory/:id/logo", async (req, res, next: NextFunction) => {
  const state = await partnerState();
  const p = state.items.find(x => x.id === partnerKey(req.params.id));
  if (!p?.logoUploadId) throw new NetworkError(404, "Logo not found.");
  if (p.status === "published" && p.relationshipVerified && p.rightsConfirmed) return image(req, res, p.logoUploadId);
  return networkAuth(req, res, () => {
    try { requireFounder(res); void image(req, res, p.logoUploadId!).catch(next); }
    catch (error) { next(error); }
  });
});
export default router;
