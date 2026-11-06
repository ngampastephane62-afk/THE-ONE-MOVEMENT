import { Router, type NextFunction, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, networkUploads, institutionalInquiriesTable as inquiries } from "@workspace/db";
import { networkAuth, networkWrite, requireFounder, actor, NetworkError } from "../services/networkAuth";
import { streamEditorialUpload } from "../services/editorialStream";
import { PROGRAM_NAMES, programSlug, programDocument, programDTO, saveProgram, referencedUploads } from "../services/programEditorial";

const router = Router();
router.get("/program-editorial/:slug", async (req, res) => {
  res.set("Cache-Control", "no-store").json(programDTO(await programDocument(programSlug(req.params.slug))));
});
router.get("/founder/program-editorial/:slug", networkAuth, async (req, res) => {
  requireFounder(res);
  res.set("Cache-Control", "private,no-store").json(programDTO(await programDocument(programSlug(req.params.slug), true), true));
});
router.put("/founder/program-editorial/:slug", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const saved = await saveProgram(req.body, programSlug(req.params.slug), actor(res, false).member.id);
  res.set("Cache-Control", "private,no-store").json(programDTO(saved, true));
});
router.get("/founder/program-editorial/:slug/inquiries", networkAuth, async (req, res) => {
  requireFounder(res);
  const slug = programSlug(req.params.slug), marker = `Programme: ${PROGRAM_NAMES[slug]}\n`;
  const rows = await db.select().from(inquiries).where(sql`position(lower(${marker}) in lower(${inquiries.message})) > 0`)
    .orderBy(desc(inquiries.id)).limit(100);
  res.set("Cache-Control", "private,no-store").json(rows.map(r => ({
    id: r.id, organization: r.organizationName, name: r.contactName, title: r.contactRole,
    email: r.emailNormalized, country: r.country, message: r.message, status: r.status, createdAt: r.createdAt.toISOString(),
  })));
});
async function asset(req: Request, res: Response, id: string) {
  const [upload] = await db.select().from(networkUploads).where(and(eq(networkUploads.id, id), eq(networkUploads.ready, true)));
  if (!upload) throw new NetworkError(404, "Media not found.");
  streamEditorialUpload(req, res, upload);
}
router.get("/program-editorial/:slug/assets/:id", async (req, res, next: NextFunction) => {
  const slug = programSlug(req.params.slug), id = String(req.params.id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new NetworkError(404, "Media not found.");
  if (referencedUploads(await programDocument(slug), true).has(id)) return asset(req, res, id);
  return networkAuth(req, res, () => {
    try {
      requireFounder(res);
      void programDocument(slug, true).then(d => {
        if (!referencedUploads(d).has(id)) throw new NetworkError(404, "Media not found.");
        return asset(req, res, id);
      }).catch(next);
    } catch (error) { next(error); }
  });
});
export default router;
