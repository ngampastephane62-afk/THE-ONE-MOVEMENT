import { Router, type Request } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, magazineOrders as orders } from "@workspace/db";
import { CreateMagazineOrderBody, CheckoutMagazineOrderBody, QuoteMagazineShippingBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { objectFile } from "../services/networkFiles";
import { magazineConfiguration, magazineOrderView, magazineCheckout, ownMagazineOrder, refreshMagazineOrder, MAGAZINE_CONSENT } from "../services/magazinePayments";

const router = Router();
const writes = createRateLimiter({ maxRequests: 15, windowMs: 60_000 });
const downloads = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });
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
router.post("/magazine/orders", networkAuth, networkWrite, writes, async (req, res) => {
  const parsed = CreateMagazineOrderBody.strict().safeParse(req.body);
  if (!parsed.success || !parsed.data.accepted) throw new NetworkError(400, "Check the order details and accept the purchase terms.");
  const input = parsed.data;
  if (input.format === "print" && !input.shipping || input.format === "digital" && input.shipping) {
    throw new NetworkError(400, "A delivery address is required for print only.");
  }
  const who = actor(res, false);
  if (input.format === "digital") {
    const [owned] = await db.select().from(orders).where(and(
      eq(orders.memberId, who.member.id), eq(orders.format, "digital"), eq(orders.status, "paid"),
      eq(orders.liveMode, true), eq(orders.refundedAmount, 0),
    )).limit(1);
    if (owned) {
      const checked = await refreshMagazineOrder(owned);
      if (magazineOrderView(checked).canDownload) return void res.status(201).json(magazineOrderView(checked));
    }
  }
  const shipping = input.shipping;
  if (shipping && [shipping.fullName, shipping.address, shipping.country, shipping.phone].some(s => !s.trim())) {
    throw new NetworkError(400, "Complete the delivery details.");
  }
  const requestId = `${who.member.id}:${input.requestId}`;
  const values = {
    memberId: who.member.id, format: input.format, status: input.format === "print" ? "quote_requested" : "pending",
    itemAmount: input.format === "print" ? 2500 : 1000, shippingAmount: input.format === "print" ? null : 0,
    currency: "usd", email: who.email, requestId, consentVersion: MAGAZINE_CONSENT,
    fullName: shipping?.fullName.trim() ?? null, address: shipping?.address.trim() ?? null,
    country: shipping?.country.trim() ?? null, phone: shipping?.phone.trim() ?? null,
  };
  const row = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${requestId}))`);
    const [old] = await tx.select().from(orders).where(eq(orders.requestId, requestId));
    if (old) {
      if (old.format !== values.format || old.fullName !== values.fullName || old.address !== values.address || old.country !== values.country || old.phone !== values.phone) {
        throw new NetworkError(409, "This request changed. Start a new magazine order.");
      }
      return old;
    }
    const [created] = await tx.insert(orders).values(values).returning();
    return created!;
  });
  res.status(201).json(magazineOrderView(row));
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
