import { db, humanitarianPayments as payments } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getUncachableStripeClient } from "../stripeClient";
import { stripeReady } from "./networkPayments";
import { NetworkError } from "./networkAuth";

export const COLLECTION_CONSENT = "tomi-discretionary-humanitarian-one-time-v1";
let availability: { expires: number; available: boolean; testMode: boolean; reason: string } | undefined;
export async function humanitarianConfiguration() {
  if (!availability || availability.expires < Date.now()) {
    let available = false, testMode = false, reason = "The payment service is not ready. No money has been collected.";
    if (stripeReady) {
      try {
        const stripe = await getUncachableStripeClient();
        const balance = await stripe.balance.retrieve();
        testMode = !balance.livemode;
        available = !testMode && process.env.TOMI_HUMANITARIAN_LIVE_AUTHORIZED === "true";
        reason = testMode ? "Real contributions are not enabled yet. Test checkout is closed. No money has been collected."
          : available ? "One-time contributions are received by The One Movement International, which allocates funds according to humanitarian urgency."
          : "Real collection awaits confirmation of fundraising authorization and payment-provider eligibility. No live payments are enabled.";
      } catch { reason = "Payment-provider availability could not be checked. Please retry later."; }
    }
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
  if (intent.status !== "succeeded" || intent.amount_received < row.amount || intent.currency !== row.currency) return;
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const refundedAmount = Math.max(row.refundedAmount, charge?.amount_refunded ?? 0);
  await db.update(payments).set({
    status: refundedAmount > 0 ? "refunded" : "paid", refundedAmount,
    paymentIntentId: intentId, updatedAt: new Date(),
  }).where(eq(payments.id, id));
}
export async function processHumanitarianEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await confirmHumanitarianSession(event.data.object as Stripe.Checkout.Session);
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (intent && charge.amount_refunded > 0) {
      await db.update(payments).set({ status: "refunded", refundedAmount: charge.amount_refunded, updatedAt: new Date() })
        .where(eq(payments.paymentIntentId, intent));
    }
  }
}
