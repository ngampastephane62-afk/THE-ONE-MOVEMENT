import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, humanitarianPayments as payments, humanitarianOffers as offers } from "@workspace/db";
import { CreateHumanitarianCheckoutBody, CreateHumanitarianOfferBody, UpdateHumanitarianOfferBody } from "@workspace/api-zod";
import { actor, networkAuth, networkWrite, requireFounder, NetworkError } from "../services/networkAuth";
import { humanitarianConfiguration, validateSupportAmount, COLLECTION_CONSENT, confirmHumanitarianSession } from "../services/humanitarianPayments";
import { getUncachableStripeClient } from "../stripeClient";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";
import { createRateLimiter } from "../lib/inMemoryRateLimiter";
import { objectFile } from "../services/networkFiles";
import { sendBufferedVideo } from "../services/bufferedVideo";

const router = Router();
const limiter = createRateLimiter();
const statusLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });
function optionalMember(req: Request, res: Response, next: NextFunction) {
  if (getAuth(req).userId) return networkAuth(req, res, next);
  return next();
}
function origin(req: Request) {
  const value = req.get("origin");
  try {
    if (!value || new URL(value).host !== getClerkProxyHost(req) || req.get("sec-fetch-site") === "cross-site") throw new Error();
    return new URL(value).origin;
  } catch { throw new NetworkError(403, "Use this website to submit support."); }
}
router.get("/humanitarian/config", async (_req, res) => {
  res.set("Cache-Control", "no-store").json(await humanitarianConfiguration());
});
router.post("/humanitarian/checkout", limiter, optionalMember, async (req, res) => {
  const returnOrigin = origin(req);
  const parsed = CreateHumanitarianCheckoutBody.strict().safeParse(req.body);
  if (!parsed.success || !parsed.data.accepted) throw new NetworkError(400, "Confirm the contribution terms and check the amount.");
  const input = parsed.data;
  validateSupportAmount(input.kind, input.amount, input.currency);
  const who = res.locals.actor ? actor(res, false) : null;
  const config = await humanitarianConfiguration();
  if (!config.available) throw new NetworkError(503, config.reason);
  const memberId = who?.member.id ?? null;
  const requestId = `${memberId ?? "guest"}:${input.requestId}`;
  const grantsArchive = false;
  const base = {
    memberId, kind: input.kind, amount: input.amount, currency: input.currency,
    grantsArchive, liveMode: !config.testMode, consentVersion: COLLECTION_CONSENT, requestId,
  };
  const row = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${requestId}))`);
    const [old] = await tx.select().from(payments).where(eq(payments.requestId, requestId));
    if (old) {
      if (old.kind !== base.kind || old.amount !== base.amount || old.currency !== base.currency) throw new NetworkError(409, "This checkout request has changed. Start a new contribution.");
      return old;
    }
    const [created] = await tx.insert(payments).values(base).returning();
    return created!;
  });
  const stripe = await getUncachableStripeClient();
  if (row.stripeSessionId) {
    const session = await stripe.checkout.sessions.retrieve(row.stripeSessionId);
    if (session.status === "open" && session.url) return void res.json({ url: session.url });
    throw new NetworkError(409, session.payment_status === "paid" ? "This payment is already complete. Refresh your access." : "This checkout has expired. Start a new contribution.");
  }
  const path = input.kind === "documentary" ? "/the-one-documentary" : "/donate";
  const session = await stripe.checkout.sessions.create({
    mode: "payment", submit_type: "donate",
    ...(who ? { customer_email: who.email } : {}),
    line_items: [{
      quantity: 1,
      price_data: {
        currency: input.currency, unit_amount: input.amount,
        product_data: {
          name: input.kind === "documentary" ? "TOMI humanitarian support — one-time documentary archive access" : "The One Movement International — humanitarian contribution",
          description: "Received by TOMI and allocated according to humanitarian urgency. One-time payment, not a subscription. No governmental endorsement or tax-deductibility is claimed.",
        },
      },
    }],
    metadata: { tomi_humanitarian: String(row.id), tomi_kind: row.kind, tomi_member: String(memberId ?? "") },
    success_url: `${returnOrigin}${path}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnOrigin}${path}?payment=cancelled`,
  }, { idempotencyKey: `tomi-humanitarian-${row.id}` });
  await db.update(payments).set({ stripeSessionId: session.id, updatedAt: new Date() }).where(eq(payments.id, row.id));
  if (!session.url) throw new NetworkError(503, "Checkout did not provide a payment window.");
  res.set("Cache-Control", "no-store").json({ url: session.url });
});
router.get("/humanitarian/payment-status", statusLimiter, optionalMember, async (req, res) => {
  const sessionId = String(req.query.session_id ?? "");
  if (!/^cs_[\w]+$/.test(sessionId)) throw new NetworkError(400, "Invalid checkout session.");
  const [row] = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId));
  if (!row || row.memberId && res.locals.actor?.member?.id !== row.memberId) throw new NetworkError(404, "Payment not found.");
  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await confirmHumanitarianSession(session);
  const [current] = await db.select().from(payments).where(eq(payments.id, row.id));
  res.set("Cache-Control", "no-store").json({
    status: current!.status === "pending" && session.status === "expired" ? "expired" : current!.status,
    archiveAccess: false,
  });
});
router.post("/humanitarian/offers", limiter, async (req, res) => {
  origin(req);
  const parsed = CreateHumanitarianOfferBody.strict().safeParse(req.body);
  if (!parsed.success || !parsed.data.accepted || parsed.data.website) throw new NetworkError(400, "Check the contribution details and contact consent.");
  const data = parsed.data;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.description.trim().length < 20 || data.fullName.trim().length < 2 || data.country.trim().length < 2) throw new NetworkError(400, "Enter a valid email, name, country and useful description.");
  const [row] = await db.insert(offers).values({
    kind: data.kind, fullName: data.fullName.trim(), email: data.email.trim().toLowerCase(),
    country: data.country.trim(), description: data.description.trim(), consentVersion: "humanitarian-offer-contact-v1",
  }).returning({ id: offers.id, status: offers.status });
  res.status(201).json(row);
});
router.get("/humanitarian/offers/admin", networkAuth, async (_req, res) => {
  requireFounder(res);
  const rows = await db.select().from(offers).orderBy(desc(offers.id));
  res.set("Cache-Control", "private,no-store").json(rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })));
});
router.patch("/humanitarian/offers/admin/:id", networkAuth, networkWrite, async (req, res) => {
  requireFounder(res);
  const data = UpdateHumanitarianOfferBody.strict().safeParse(req.body);
  const id = Number(req.params.id);
  if (!data.success || !Number.isSafeInteger(id) || id < 1) throw new NetworkError(400, "Invalid contribution status.");
  const [row] = await db.update(offers).set({ status: data.data.status }).where(eq(offers.id, id)).returning({ id: offers.id, status: offers.status });
  if (!row) throw new NetworkError(404, "Contribution not found.");
  res.json(row);
});
router.get("/documentary/access", async (_req, res) => {
  res.set("Cache-Control", "no-store").json({ hasAccess: true, streamUrl: "/api/documentary/goma/stream" });
});
const buffers = new Map<string, Promise<Buffer>>();
async function video(path: string) {
  let pending = buffers.get(path);
  if (!pending) {
    pending = objectFile(path).download().then(([bytes]) => bytes).catch(error => { buffers.delete(path); throw error; });
    buffers.set(path, pending);
  }
  return pending;
}
router.get("/documentary/goma/stream", async (req, res) => {
  const folder = process.env.PRIVATE_OBJECT_DIR;
  if (!folder) throw new NetworkError(503, "Archive storage is unavailable.");
  sendBufferedVideo(req, res, await video(`${folder.replace(/\/$/, "")}/documentary/goma-full.mp4`), "video/mp4");
});
router.get("/documentary/media/:filename", async (req, res) => {
  const name = String(req.params.filename);
  const portraits = Array.from({ length: 26 }, (_, index) => `tfm-portrait-${String(index + 1).padStart(2, "0")}.webp`);
  if (!["goma-preview.mp4", "radio-okapi-trailer.mp4", "goma.webp", "radio-okapi.webp", ...portraits].includes(name)) return void res.sendStatus(404);
  const bucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucket) throw new NetworkError(503, "Media storage is unavailable.");
  sendBufferedVideo(req, res, await video(`/${bucket}/public/documentary/${name}`), name.endsWith(".webp") ? "image/webp" : "video/mp4");
});
export default router;
