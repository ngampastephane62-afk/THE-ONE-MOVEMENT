import { db, magazineOrders as orders, type MagazineOrderRow } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getUncachableStripeClient } from "../stripeClient";
import { stripeReady } from "./networkPayments";
import { NetworkError } from "./networkAuth";
import { readMagazineAvailability } from "./magazineAvailability";

export const MAGAZINE_CONSENT = "tropik-magazine-retail-2026-v1";
export const FEATURE_PRICE = 20000;
let cached: { expires: number; available: boolean; testMode: boolean; reason: string } | undefined;

export async function magazineConfiguration() {
  if (!cached || cached.expires < Date.now()) {
    const settings = await readMagazineAvailability(stripeReady, getUncachableStripeClient);
    cached = { expires: Date.now() + 15_000, ...settings };
  }
  const { expires: _, ...settings } = cached;
  return { ...settings, digitalUsd: 10, printUsd: 25, shippingMinUsd: 10, shippingMaxUsd: 30, pageCount: 10 };
}

export function magazineOrderView(row: MagazineOrderRow) {
  return {
    id: row.id, format: row.format, status: row.status, itemAmount: row.itemAmount,
    shippingAmount: row.shippingAmount,
    totalAmount: row.shippingAmount === null ? null : row.itemAmount + row.shippingAmount,
    currency: row.currency, fullName: row.fullName, address: row.address,
    country: row.country, phone: row.phone, email: row.email,
    canDownload: row.format === "digital" && row.status === "paid" && row.liveMode && row.refundedAmount === 0,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function ownMagazineOrder(memberId: number, id: number) {
  const [row] = await db.select().from(orders).where(and(eq(orders.id, id), eq(orders.memberId, memberId))).limit(1);
  if (!row) throw new NetworkError(404, "Magazine order not found.");
  return row;
}

export async function confirmMagazineSession(session: Stripe.Checkout.Session) {
  const id = Number(session.metadata?.tomi_magazine_order);
  if (!Number.isSafeInteger(id) || id < 1) return;
  const [row] = await db.select().from(orders).where(and(eq(orders.id, id), eq(orders.stripeSessionId, session.id))).limit(1);
  if (!row || row.status === "disputed" || row.status === "refunded" || session.payment_status !== "paid" ||
      session.mode !== "payment" || !session.livemode || !row.liveMode ||
      session.currency !== "usd" || session.metadata?.tomi_member !== String(row.memberId) ||
      row.shippingAmount === null || session.amount_total !== row.itemAmount + row.shippingAmount) return;
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!intentId) return;
  const stripe = await getUncachableStripeClient();
  const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
  if (intent.status !== "succeeded" || !intent.livemode || intent.currency !== row.currency ||
      intent.amount_received !== row.itemAmount + row.shippingAmount) return;
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const refundedAmount = Math.max(row.refundedAmount, charge?.amount_refunded ?? 0);
  const disputed = charge?.disputed === true;
  await db.update(orders).set({
    status: disputed ? "disputed" : refundedAmount > 0 ? "refunded" : "paid",
    refundedAmount, paymentIntentId: intentId, paidAt: row.paidAt ?? new Date(), updatedAt: new Date(),
  }).where(and(eq(orders.id, row.id), eq(orders.stripeSessionId, session.id), eq(orders.refundedAmount, row.refundedAmount),
    // A concurrent refund/dispute must never be reversed by a delayed confirmation.
    sql`${orders.status} NOT IN ('refunded', 'disputed')`));
}

export async function refreshMagazineOrder(row: MagazineOrderRow) {
  if (row.stripeSessionId && ["checkout_pending", "paid"].includes(row.status)) {
    const stripe = await getUncachableStripeClient();
    await confirmMagazineSession(await stripe.checkout.sessions.retrieve(row.stripeSessionId));
    return ownMagazineOrder(row.memberId, row.id);
  }
  return row;
}

export function validateFeatureCheckout(row: MagazineOrderRow, expectedTotal: number) {
  if (row.format !== "feature") throw new NetworkError(409, "The presentation kit is free. A separate reader edition is not available for checkout.");
  if (["paid", "refunded", "disputed"].includes(row.status)) throw new NetworkError(409, "This order cannot be paid again.");
  if (row.shippingAmount === null || !["approved", "checkout_pending"].includes(row.status)) {
    throw new NetworkError(409, "The Founder must approve this article and confirm publication conditions before payment.");
  }
  if (expectedTotal !== row.itemAmount + row.shippingAmount) throw new NetworkError(409, "The order total has changed. Refresh the proposal and accept the updated total.");
  if (row.itemAmount !== FEATURE_PRICE || row.shippingAmount !== 0) throw new NetworkError(409, "The saved order price is not valid.");
}

export async function magazineCheckout(memberId: number, id: number, origin: string, expectedTotal: number) {
  const config = await magazineConfiguration();
  if (!config.available) throw new NetworkError(503, config.reason);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"magazine:" + id}))`);
    const [row] = await tx.select().from(orders).where(and(eq(orders.id, id), eq(orders.memberId, memberId))).limit(1);
    if (!row) throw new NetworkError(404, "Magazine order not found.");
    validateFeatureCheckout(row, expectedTotal);
    const stripe = await getUncachableStripeClient();
    if (row.stripeSessionId) {
      const old = await stripe.checkout.sessions.retrieve(row.stripeSessionId);
      if (old.payment_status === "paid") throw new NetworkError(409, "Payment is being confirmed. Refresh your order.");
      if (old.status === "open" && old.url) return { url: old.url };
    }
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: "usd", unit_amount: row.itemAmount,
        product_data: { name: "Tropik Magazine — one inside printed page, editorial reservation" },
      }, quantity: 1,
    }];
    const session = await stripe.checkout.sessions.create({
      mode: "payment", customer_email: row.email, line_items: lineItems,
      metadata: { tomi_magazine_order: String(row.id), tomi_member: String(row.memberId) },
      success_url: `${origin}/tropik-magazine/contribute?order=${row.id}&checkout=complete`,
      cancel_url: `${origin}/tropik-magazine/contribute?order=${row.id}&checkout=cancelled`,
    }, { idempotencyKey: `magazine-${row.id}-${row.stripeSessionId ?? "initial"}` });
    if (!session.livemode || !session.url) throw new NetworkError(503, "Real magazine checkout is not available.");
    await tx.update(orders).set({ stripeSessionId: session.id, liveMode: true, status: "checkout_pending", updatedAt: new Date() }).where(eq(orders.id, row.id));
    return { url: session.url };
  });
}

export async function processMagazineEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await confirmMagazineSession(event.data.object as Stripe.Checkout.Session);
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (intent && charge.amount_refunded > 0) {
      await db.update(orders).set({ status: "refunded", refundedAmount: charge.amount_refunded, updatedAt: new Date() })
        .where(eq(orders.paymentIntentId, intent));
    }
  }
  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    const intent = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
    if (intent) await db.update(orders).set({ status: "disputed", updatedAt: new Date() }).where(eq(orders.paymentIntentId, intent));
  }
}
