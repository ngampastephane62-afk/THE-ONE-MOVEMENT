import { db, monthlyMemberships as memberships, networkProfiles as profiles } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getUncachableStripeClient } from "../stripeClient";
import { stripeReady } from "./networkPayments";
import { NetworkError, type NetworkActor } from "./networkAuth";

export const MONTHLY_PLANS = [
  { slug: "professional", name: "Professional", amount: 2900, currency: "usd", interval: "month" },
  { slug: "business", name: "Business / Sponsor", amount: 9900, currency: "usd", interval: "month" },
] as const;
let modeCache: { until: number; available: boolean; testMode: boolean } | undefined;
const refreshed = new Map<number, number>();
export async function monthlyMode() {
  if (modeCache && modeCache.until > Date.now()) return modeCache;
  let available = false, testMode = false;
  if (stripeReady) {
    try {
      const balance = await (await getUncachableStripeClient()).balance.retrieve();
      available = true; testMode = !balance.livemode;
    } catch { /* Payment-dependent actions fail closed; free services remain usable. */ }
  }
  return modeCache = { until: Date.now() + 30_000, available, testMode };
}
export async function synchronizeMonthly(subscriptionId: string) {
  const stripe = await getUncachableStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
  const memberId = Number(subscription.metadata.tomi_monthly_member);
  const plan = MONTHLY_PLANS.find(p => p.slug === subscription.metadata.tomi_monthly_tier);
  if (!Number.isSafeInteger(memberId) || !plan) return;
  const [profile] = await db.select().from(profiles).where(eq(profiles.memberId, memberId));
  const [row] = await db.select().from(memberships).where(eq(memberships.memberId, memberId));
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  if (!row || profile?.stripeCustomerId !== customerId || row.liveMode !== subscription.livemode) return;
  // A different subscription must not overwrite the one belonging to this member.
  if (row.subscriptionId && row.subscriptionId !== subscription.id) return;
  if (!row.subscriptionId) {
    if (!row.checkoutSessionId) return;
    const checkout = await stripe.checkout.sessions.retrieve(row.checkoutSessionId);
    const linkedId = typeof checkout.subscription === "string" ? checkout.subscription : checkout.subscription?.id;
    if (linkedId !== subscription.id) return;
  }
  const item = subscription.items.data[0];
  const invoice = typeof subscription.latest_invoice === "object" ? subscription.latest_invoice : null;
  const validPrice = subscription.items.data.length === 1 && item?.quantity === 1 &&
    item.price.unit_amount === plan.amount && item.price.currency === plan.currency &&
    item.price.recurring?.interval === "month" && item.price.recurring.interval_count === 1;
  const paid = invoice?.status === "paid" && invoice.amount_paid >= plan.amount;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;
  const active = validPrice && paid && subscription.status === "active" && !!periodEnd && periodEnd.getTime() > Date.now();
  await db.update(memberships).set({
    tier: plan.slug, subscriptionId: subscription.id,
    status: active ? "active" : subscription.status === "active" ? "payment_unconfirmed" : subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end, currentPeriodEnd: periodEnd, updatedAt: new Date(),
  }).where(eq(memberships.memberId, memberId));
  refreshed.set(memberId, Date.now());
}
export async function refreshMonthly(memberId: number, force = false) {
  const [row] = await db.select().from(memberships).where(eq(memberships.memberId, memberId));
  if (!row || !force && Date.now() - (refreshed.get(memberId) ?? 0) < 30_000) return;
  if (row.subscriptionId) {
    await synchronizeMonthly(row.subscriptionId);
  } else if (row.checkoutSessionId) {
    const session = await (await getUncachableStripeClient()).checkout.sessions.retrieve(row.checkoutSessionId);
    if (session.mode === "subscription" && session.payment_status === "paid" &&
      session.metadata?.tomi_monthly_member === String(memberId)) {
      const id = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (id) await synchronizeMonthly(id);
    }
  }
  if (refreshed.size > 4000) refreshed.clear();
  refreshed.set(memberId, Date.now());
}
export async function monthlyMembership(memberId: number) {
  const [row] = await db.select().from(memberships).where(eq(memberships.memberId, memberId));
  if (!row) return null;
  const mode = await monthlyMode();
  return {
    tier: row.tier, status: row.status,
    active: mode.available && row.liveMode === !mode.testMode && row.status === "active" &&
      !!row.currentPeriodEnd && row.currentPeriodEnd.getTime() > Date.now(),
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null, testMode: !row.liveMode,
  };
}
export async function requireMonthly(memberId: number, business = false) {
  await refreshMonthly(memberId);
  const membership = await monthlyMembership(memberId);
  if (!membership?.active || business && membership.tier !== "business") {
    throw new NetworkError(402, business ? "An active Business / Sponsor monthly membership is required." : "An active professional monthly membership is required for this service.");
  }
  return membership;
}
export async function monthlyCheckout(who: NetworkActor & { member: NonNullable<NetworkActor["member"]> }, tier: string, origin: string) {
  const plan = MONTHLY_PLANS.find(p => p.slug === tier);
  const mode = await monthlyMode();
  if (!plan || !mode.available) throw new NetworkError(503, "Monthly checkout is unavailable.");
  await refreshMonthly(who.member.id, true);
  if ((await monthlyMembership(who.member.id))?.active) throw new NetworkError(409, "You already have an active membership. Cancel renewal before choosing another plan after the current period.");
  const stripe = await getUncachableStripeClient();
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"monthly:" + who.member.id}))`);
    const [old] = await tx.select().from(memberships).where(eq(memberships.memberId, who.member.id));
    if (old?.subscriptionId && !["canceled", "incomplete_expired"].includes(old.status)) {
      throw new NetworkError(409, "A subscription already exists. Resolve or cancel it before creating another.");
    }
    if (old?.checkoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(old.checkoutSessionId);
      if (session.status === "open") {
        if (old.tier !== tier) await stripe.checkout.sessions.expire(session.id);
        else if (session.url) return session.url;
      }
      if (session.status === "complete") throw new NetworkError(409, "Payment is being confirmed. Refresh your membership.");
    }
    const [profile] = await tx.select().from(profiles).where(eq(profiles.memberId, who.member.id));
    let customerId = profile?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: who.email, metadata: { tomi_member: String(who.member.id) } }, { idempotencyKey: `tomi-customer-${who.clerkId}` });
      customerId = customer.id;
      await tx.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.memberId, who.member.id));
    }
    const lookup = `tomi-monthly-v1-${tier}`;
    let price = (await stripe.prices.list({ lookup_keys: [lookup], limit: 1 })).data[0];
    if (!price) {
      const product = await stripe.products.create({
        name: `TOMI ${plan.name} — monthly ecosystem services`,
        description: "Professional services only. Does not purchase humanitarian access, legal certification, a guaranteed introduction or an event place.",
        metadata: { tomi_monthly_tier: tier },
      }, { idempotencyKey: `tomi-monthly-product-v1-${tier}` });
      price = await stripe.prices.create({
        product: product.id, currency: plan.currency, unit_amount: plan.amount,
        recurring: { interval: "month" }, lookup_key: lookup,
      }, { idempotencyKey: `tomi-monthly-price-v1-${tier}` });
    }
    if (!price.active || price.unit_amount !== plan.amount || price.currency !== "usd" ||
      price.recurring?.interval !== "month" || price.recurring.interval_count !== 1) {
      throw new NetworkError(503, "The approved monthly price could not be verified.");
    }
    const metadata = { tomi_monthly_member: String(who.member.id), tomi_monthly_tier: tier };
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", customer: customerId, line_items: [{ price: price.id, quantity: 1 }],
      metadata, subscription_data: { metadata },
      success_url: `${origin}/member/membership?monthly_checkout=1`,
      cancel_url: `${origin}/member/membership?monthly_cancelled=1`,
    }, { idempotencyKey: `tomi-monthly-${who.member.id}-${tier}-${old?.updatedAt.getTime() ?? "initial"}` });
    if (!session.url) throw new NetworkError(503, "Stripe did not provide a monthly checkout window.");
    await tx.insert(memberships).values({
      memberId: who.member.id, tier, checkoutSessionId: session.id, liveMode: !mode.testMode,
    }).onConflictDoUpdate({ target: memberships.memberId, set: {
      tier, status: "pending", subscriptionId: null, checkoutSessionId: session.id,
      liveMode: !mode.testMode, currentPeriodEnd: null, cancelAtPeriodEnd: false, updatedAt: new Date(),
    } });
    refreshed.delete(who.member.id);
    return session.url;
  });
}
export async function cancelMonthly(memberId: number) {
  const [row] = await db.select().from(memberships).where(eq(memberships.memberId, memberId));
  if (!row?.subscriptionId) throw new NetworkError(404, "No subscription was found.");
  const stripe = await getUncachableStripeClient();
  const subscription = await stripe.subscriptions.retrieve(row.subscriptionId);
  if (subscription.metadata.tomi_monthly_member !== String(memberId)) throw new NetworkError(403, "Subscription ownership could not be verified.");
  if (subscription.status !== "canceled") await stripe.subscriptions.update(row.subscriptionId, { cancel_at_period_end: true });
  await synchronizeMonthly(row.subscriptionId);
}
export async function monthlyWebhook(event: Stripe.Event) {
  if (event.type.startsWith("customer.subscription.")) {
    await synchronizeMonthly((event.data.object as Stripe.Subscription).id);
  } else if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.tomi_monthly_member || session.mode !== "subscription") return;
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (id) await synchronizeMonthly(id);
  } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscription = invoice.parent?.subscription_details?.subscription;
    const id = typeof subscription === "string" ? subscription : subscription?.id;
    if (id) await synchronizeMonthly(id);
  }
}
