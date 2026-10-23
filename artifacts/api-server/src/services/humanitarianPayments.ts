import { db, humanitarianPayments as payments } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getUncachableStripeClient } from "../stripeClient";
import { stripeReady } from "./networkPayments";
import { NetworkError } from "./networkAuth";
import { humanitarianTestAuthorized } from "../lib/humanitarianTestMode";

export const COLLECTION_CONSENT = "tomi-discretionary-humanitarian-one-time-v1";
let availability: { expires: number; available: boolean; testMode: boolean; reason: string } | undefined;
export async function humanitarianConfiguration() {
  if (!availability || availability.expires < Date.now()) {
    let available = false, testMode = false, reason = "Online contributions are not open yet. No payment will be taken here.";
    try {
      // Read-only capability check. This does not run StripeSync migrations,
      // create webhooks, seed products or change the connected account.
      const stripe = await getUncachableStripeClient();
      const balance = await stripe.balance.retrieve();
      testMode = !balance.livemode;
      if (testMode) {
        available = humanitarianTestAuthorized(process.env);
        reason = available ? "Test payments only. No real funds are collected and a test payment is not a donation."
          : "Real contributions are not enabled. Test checkout is closed outside the authorized development preview.";
      } else if (humanitarianTestAuthorized(process.env)) {
        // A preview identity can resolve the live connector. Never substitute a
        // real collection for the test environment the Founder authorized.
        reason = "The test payment environment could not be confirmed. Online payment remains unavailable; no checkout has been opened.";
      } else {
        const account = await stripe.accounts.retrieve(null);
        available = stripeReady && process.env.TOMI_HUMANITARIAN_LIVE_AUTHORIZED === "true"
          && account.charges_enabled === true && account.capabilities?.card_payments === "active";
        reason = available ? "Contributions are received by The One Movement International and allocated according to humanitarian urgency."
          : "Online contributions are not open yet. Payment activation and fundraising authorization must be confirmed before collection.";
      }
    } catch { reason = "Online payment availability could not be confirmed. Please retry later; no payment was started."; }
    availability = { expires: Date.now() + 15_000, available, testMode, reason };
  }
  const { expires: _, ...config } = availability;
  return { ...config, collector: "The One Movement International", minimumUsd: 100, minimumAed: 200, documentaryUsd: 0 };
}
export function validateSupportAmount(kind: string, amount: number, currency: string) {
  if (kind === "documentary") throw new NetworkError(410, "Humanitarian films are free. No documentary purchase is required.");
  if (!Number.isSafeInteger(amount) ||
    !["usd", "aed"].includes(currency) || amount < (currency === "aed" ? 200 : 100)) {
    throw new NetworkError(400, "Use at least US$1 or AED 2.");
  }
  if (amount > 99_999_999) throw new NetworkError(400, "This amount requires coordinated payment arrangements. Submit a financial contribution offer; TOMI does not impose a fundraising cap.");
}
export async function hasDocumentaryAccess(memberId: number) {
  const config = await humanitarianConfiguration();
  const [row] = await db.select({ id: payments.id }).from(payments).where(and(
    eq(payments.memberId, memberId), eq(payments.status, "paid"),
    eq(payments.grantsArchive, true), eq(payments.refundedAmount, 0),
    eq(payments.liveMode, !config.testMode),
  )).limit(1);
  return !!row;
}
export async function confirmHumanitarianSession(session: Stripe.Checkout.Session) {
  if (!session.metadata?.tomi_humanitarian) return;
  const id = Number(session.metadata.tomi_humanitarian);
  const [row] = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.stripeSessionId, session.id)));
  if (!row || session.payment_status !== "paid" || session.mode !== "payment" || session.livemode !== row.liveMode ||
    session.amount_total !== row.amount || session.currency !== row.currency ||
    session.metadata.tomi_kind !== row.kind || session.metadata.tomi_member !== String(row.memberId ?? "")) return;
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!intentId) return;
  const stripe = await getUncachableStripeClient();
  const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
  if (intent.id !== intentId || intent.status !== "succeeded" || intent.amount !== row.amount ||
    intent.amount_received !== row.amount || intent.currency !== row.currency || intent.livemode !== row.liveMode) return;
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const refundedAmount = Math.max(row.refundedAmount, charge?.amount_refunded ?? 0);
  await db.update(payments).set({
    status: sql`case when greatest(${payments.refundedAmount}, ${refundedAmount}) > 0 then 'refunded' else 'paid' end`,
    refundedAmount: sql`greatest(${payments.refundedAmount}, ${refundedAmount})`,
    paymentIntentId: intentId, updatedAt: new Date(),
  }).where(eq(payments.id, id));
}
export async function processHumanitarianEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await confirmHumanitarianSession(event.data.object as Stripe.Checkout.Session);
  }
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const id = Number(session.metadata?.tomi_humanitarian);
    if (Number.isSafeInteger(id) && id > 0) {
      await db.update(payments).set({ status: "failed", updatedAt: new Date() })
        .where(and(eq(payments.id, id), eq(payments.stripeSessionId, session.id),
          eq(payments.liveMode, session.livemode), eq(payments.status, "pending")));
    }
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (intent && charge.amount_refunded > 0) {
      await db.update(payments).set({ status: "refunded", refundedAmount: sql`greatest(${payments.refundedAmount}, ${charge.amount_refunded})`, updatedAt: new Date() })
        .where(eq(payments.paymentIntentId, intent));
    }
  }
}
