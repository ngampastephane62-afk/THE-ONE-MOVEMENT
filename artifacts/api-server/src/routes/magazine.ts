import { Router, type Request } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, magazineOrders as orders } from "@workspace/db";
import { CheckoutMagazineOrderBody, QuoteMagazineShippingBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { objectFile } from "../services/networkFiles";
import { magazineConfiguration, magazineOrderView, magazineCheckout, ownMagazineOrder, refreshMagazineOrder } from "../services/magazinePayments";
import submissionRouter from "./magazineSubmissions";

const router = Router();
router.use(submissionRouter);
const writes = createRateLimiter({ maxRequests: 15, windowMs: 60_000 });
const downloads = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });
router.get("/magazine/kit.pdf", downloads, async (_req, res) => {
  const folder = process.env.PRIVATE_OBJECT_DIR;
  if (!folder) throw new NetworkError(503, "Magazine storage is unavailable.");
  const [bytes] = await objectFile(`${folder.replace(/\/$/, "")}/magazines/tropik-2026.pdf`).download();
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="Tropik-Magazine-Media-Kit-2026.pdf"',
    "Cache-Control": "public,max-age=3600", "X-Content-Type-Options": "nosniff",
    "Content-Length": String(bytes.length),
  }).send(bytes);
});
router.get("/magazine/assets/:filename", async (req, res) => {
  const name = String(req.params.filename);
  if (!/^(artwork-(0[1-9]|1[0-6])|kit-page-(0[1-9]|10)|heritage-0[1-4]|print-reader-01)\.webp$/.test(name)) return void res.sendStatus(404);
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) throw new NetworkError(503, "Magazine storage is unavailable.");
  const [bytes] = await objectFile(`/${bucket}/public/magazine/editorial/${name}`).download();
  res.set({ "Content-Type": "image/webp", "Cache-Control": "public,max-age=86400", "X-Content-Type-Options": "nosniff" }).send(bytes);
});
function orderId(req: Request) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new NetworkError(400, "Invalid magazine order.");
  return id;
}
router.get("/magazine/config", async (_req, res) => {
  res.set("Cache-Control", "no-store").json(await magazineConfiguration());
});
router.get("/magazine/cover", async (_req, res) => {
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) throw new NetworkError(503, "Magazine storage is unavailable.");
  const [bytes] = await objectFile(`/${bucket}/public/magazine/tropik-2026-cover.webp`).download();
  res.set({ "Content-Type": "image/webp", "Cache-Control": "public,max-age=86400", "X-Content-Type-Options": "nosniff" }).send(bytes);
});
router.get("/magazine/orders", networkAuth, async (_req, res) => {
  const who = actor(res, false);
  const rows = await db.select().from(orders).where(eq(orders.memberId, who.member.id)).orderBy(desc(orders.createdAt)).limit(100);
  res.json({ orders: rows.map(magazineOrderView), founder: who.founder });
});
router.post("/magazine/orders", networkAuth, networkWrite, writes, async (_req, _res) => {
  // Reader-edition sales must never charge for the now-free presentation kit.
  throw new NetworkError(409, "The presentation kit is free. Use the article proposal space for a USD200 printed page; separate reader editions are not yet on sale.");
});
router.get("/magazine/orders/:id", networkAuth, async (req, res) => {
  const row = await ownMagazineOrder(actor(res, false).member.id, orderId(req));
  res.json(magazineOrderView(await refreshMagazineOrder(row)));
});
router.post("/magazine/orders/:id/checkout", networkAuth, networkWrite, writes, async (req, res) => {
  const parsed = CheckoutMagazineOrderBody.strict().safeParse(req.body);
  if (!parsed.success || !parsed.data.accepted) throw new NetworkError(400, "Accept the displayed total and purchase terms.");
  res.json(await magazineCheckout(actor(res, false).member.id, orderId(req), new URL(req.get("origin")!).origin, parsed.data.expectedTotal));
});
router.get("/magazine/orders/:id/download", networkAuth, downloads, async (req, res) => {
  const row = await refreshMagazineOrder(await ownMagazineOrder(actor(res, false).member.id, orderId(req)));
  if (!magazineOrderView(row).canDownload) throw new NetworkError(403, "A confirmed real digital purchase is required to download this PDF.");
  const folder = process.env.PRIVATE_OBJECT_DIR;
  if (!folder) throw new NetworkError(503, "Magazine storage is unavailable.");
  const [bytes] = await objectFile(`${folder.replace(/\/$/, "")}/magazines/tropik-2026.pdf`).download();
  res.set({
    "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="Tropik-Magazine-2026.pdf"',
    "Cache-Control": "private,no-store", "X-Content-Type-Options": "nosniff", "Content-Length": String(bytes.length),
  }).send(bytes);
});
router.get("/magazine/admin/orders", networkAuth, async (_req, res) => {
  requireFounder(res);
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  res.json(rows.map(magazineOrderView));
});
router.patch("/magazine/admin/orders/:id/quote", networkAuth, networkWrite, writes, async (req, res) => {
  requireFounder(res);
  const parsed = QuoteMagazineShippingBody.strict().safeParse(req.body);
  if (!parsed.success) throw new NetworkError(400, "Shipping must be between US$10 and US$30.");
  const id = orderId(req);
  const row = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"magazine:" + id}))`);
    const [old] = await tx.select().from(orders).where(eq(orders.id, id));
    if (!old) throw new NetworkError(404, "Magazine order not found.");
    if (old.format !== "print" || !["quote_requested", "quoted"].includes(old.status) || old.stripeSessionId) {
      throw new NetworkError(409, "Shipping cannot be changed after checkout starts.");
    }
    const [changed] = await tx.update(orders).set({
      shippingAmount: parsed.data.shippingAmount, status: "quoted", quotedAt: new Date(), updatedAt: new Date(),
    }).where(eq(orders.id, id)).returning();
    return changed!;
  });
  res.json(magazineOrderView(row));
});
export default router;
