import { Router } from "express";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db, institutionalInquiriesTable as inquiries } from "@workspace/db";
import { MEDIA_OUTLETS } from "@workspace/shared";
import { CreateMediaRequestBody, UpdateMediaRequestBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { objectFile } from "../services/networkFiles";

const router = Router();
// A dedicated discriminator avoids mixing media enquiries with partnership requests.
const VERSION = "tropik-media-request-v1";
const MARKER = "TROPIK_MEDIA_REQUEST";
const limiter = createRateLimiter();
const assets = new Map<string, Promise<Buffer>>();
const allowedAssets = new Set([
  "tropik-media-coverage.pdf",
  ...MEDIA_OUTLETS.filter(o => o.logo).map(o => o.logo!.split("/").pop()!),
]);

router.get("/media-catalogue/assets/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!allowedAssets.has(filename)) return void res.sendStatus(404);
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) return void res.sendStatus(503);
  try {
    let download = assets.get(filename);
    if (!download) {
      download = objectFile(`/${bucket}/public/media-catalogue/${filename}`).download()
        .then(([bytes]) => bytes).catch(error => { assets.delete(filename); throw error; });
      assets.set(filename, download);
    }
    const bytes = await download;
    if (res.destroyed) return;
    res.set({
      "Content-Type": filename.endsWith(".pdf") ? "application/pdf" : "image/png",
      "Content-Length": String(bytes.length),
      "Cache-Control": "public,max-age=86400",
      "X-Content-Type-Options": "nosniff",
      ...(filename.endsWith(".pdf") ? { "Content-Disposition": 'inline; filename="Tropik-Agency-Media-Coverage.pdf"' } : {}),
    }).send(bytes);
  } catch (error) {
    req.log.error({ err: error }, "Media catalogue asset unavailable");
    if (!res.headersSent) res.sendStatus(502);
  }
});

function serialize(row: typeof inquiries.$inferSelect) {
  const stored = JSON.parse(row.message) as { type: string; outletId: string; format: string; brief: string };
  const outlet = MEDIA_OUTLETS.find(o => o.id === stored.outletId);
  return {
    id: row.id, outletId: stored.outletId, outletName: outlet?.name ?? stored.outletId,
    format: stored.format, message: stored.brief, contactName: row.contactName,
    email: row.emailNormalized, organizationName: row.organizationName, country: row.country,
    status: row.status, createdAt: row.createdAt.toISOString(),
  };
}
router.post("/media-requests", limiter, async (req, res) => {
  const parsed = CreateMediaRequestBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Check all required fields and keep your brief between 10 and 800 characters.");
  const input = parsed.data;
  if (input.website?.trim()) throw new NetworkError(400, "This request could not be submitted.");
  if (!input.consentAccepted) throw new NetworkError(400, "Consent is required to process your enquiry.");
  const outlet = MEDIA_OUTLETS.find(o => o.id === input.outletId);
  if (!outlet || !(outlet.formats.length ? outlet.formats : ["CONSULTATION"]).includes(input.format)) {
    throw new NetworkError(400, "Choose an available format for this outlet.");
  }
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !input.contactName.trim() ||
    !input.organizationName.trim() || !input.country.trim() || input.message.trim().length < 10) {
    throw new NetworkError(400, "Enter your name, organization, country, valid email and a brief of at least 10 characters.");
  }
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  // Serialize same-email submissions across processes, avoiding a daily-cap race.
  const row = await db.transaction(async tx => {
    const { sql } = await import("drizzle-orm");
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`media:${email}`}))`);
    const [total] = await tx.select({ value: count() }).from(inquiries)
      .where(and(eq(inquiries.emailNormalized, email), eq(inquiries.consentTextVersion, VERSION), gte(inquiries.createdAt, today)));
    if ((total?.value ?? 0) >= 3) throw new NetworkError(429, "Please wait before sending another media request.");
    const [created] = await tx.insert(inquiries).values({
      organizationName: input.organizationName.trim(), organizationType: "media-organization",
      country: input.country.trim(), contactName: input.contactName.trim(),
      contactRole: "Media placement enquiry", emailNormalized: email,
      message: JSON.stringify({ type: MARKER, outletId: outlet.id, format: input.format, brief: input.message.trim() }),
      consentAccepted: true, consentTextVersion: VERSION, status: "new",
    }).returning();
    return created!;
  });
  res.set("Cache-Control", "no-store").status(201).json({ id: row.id, status: "new" });
});
router.get("/media-requests", networkAuth, async (_req, res) => {
  requireFounder(res);
  const rows = await db.select().from(inquiries).where(eq(inquiries.consentTextVersion, VERSION)).orderBy(desc(inquiries.id));
  res.set("Cache-Control", "private,no-store").json(rows.map(serialize));
});
router.patch("/media-requests/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  actor(res, false);
  const id = Number(req.params.id);
  const parsed = UpdateMediaRequestBody.strict().safeParse(req.body);
  if (!Number.isSafeInteger(id) || id < 1 || !parsed.success) throw new NetworkError(400, "Choose a valid review status.");
  const [row] = await db.update(inquiries).set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(inquiries.id, id), eq(inquiries.consentTextVersion, VERSION))).returning();
  if (!row) throw new NetworkError(404, "Media request not found.");
  res.set("Cache-Control", "private,no-store").json(serialize(row));
});

export default router;
