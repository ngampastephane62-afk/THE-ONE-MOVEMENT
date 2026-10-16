import { runMigrations } from "stripe-replit-sync";
import { db, networkCertifications as certificates, networkProfiles as profiles } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { getStripeSync, getUncachableStripeClient } from "../stripeClient";
import { NetworkError, type NetworkActor } from "./networkAuth";
import type Stripe from "stripe";

export let stripeReady = false;
import { DOCUMENTS, PACKAGE_DEFINITIONS, customPackages } from "@workspace/shared";
export { DOCUMENTS, PACKAGE_DEFINITIONS, customPackages };
export async function initializeStripe() {
  if (!process.env.DATABASE_URL) throw new Error("Database is required");
  await runMigrations({ databaseUrl: process.env.DATABASE_URL });
  const sync = await getStripeSync();
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) await sync.findOrCreateManagedWebhook(`https://${domain}/api/stripe/webhook`);
  // Seed the connected environment, not only the development Stripe account.
  // Existing lookup keys are retained, and no payment is created by this step.
  await seedNetworkPackages();
  await sync.syncBackfill({ object: "all" });
  stripeReady = true;
}
export async function seedNetworkPackages() {
  const stripe = await getUncachableStripeClient();
  for (const item of PACKAGE_DEFINITIONS) {
    const lookup = `tomi-annual-v1-${item.slug}`;
    const existing = await stripe.prices.list({ lookup_keys: [lookup], limit: 1 });
    if (existing.data.length) continue;
    const product = await stripe.products.create({
      name: item.name,
      description: "Twelve-month package, subject to application review, a written agreement and confirmed programme availability. No financial return or guaranteed event participation.",
      metadata: { tomi_package: item.slug, audience: item.audience, document: item.documentSlug, duration_months: "12" },
    }, { idempotencyKey: `tomi-product-v1-${item.slug}` });
    await stripe.prices.create({
      product: product.id, unit_amount: item.amount, currency: "usd", lookup_key: lookup,
      metadata: { tomi_package: item.slug, duration_months: "12" },
    }, { idempotencyKey: `tomi-price-v1-${item.slug}` });
  }
}
export async function catalog() {
  let available = new Set<string>();
  if (stripeReady) {
    const rows = await db.execute(sql`SELECT pr.lookup_key FROM stripe.prices pr JOIN stripe.products p ON pr.product = p.id WHERE pr.active = true AND p.active = true AND p.metadata->>'tomi_package' IS NOT NULL`);
    available = new Set(rows.rows.map(row => String(row.lookup_key)));
  }
  return [...PACKAGE_DEFINITIONS, ...customPackages].map(p => ({
    ...p, currency: "usd", durationMonths: 12,
    payable: stripeReady && available.has(`tomi-annual-v1-${p.slug}`),
  }));
}
export async function checkout(actor: NetworkActor & { member: NonNullable<NetworkActor["member"]> }, id: number, origin: string, accepted: boolean) {
  if (!stripeReady) throw new NetworkError(503, "Payments are not ready. Your application remains saved.");
  const [application] = await db.select().from(certificates).where(and(eq(certificates.id, id), eq(certificates.memberId, actor.member.id)));
  if (!application || application.status !== "approved" || !application.agreementConfirmed ||
    (application.expiresAt && application.expiresAt.getTime() <= Date.now())) {
    throw new NetworkError(403, "A current reviewed application and confirmed written agreement are required before payment.");
  }
  if (!accepted) throw new NetworkError(400, "Acknowledge the agreed package and written terms before continuing.");
  if (application.paymentConfirmed) throw new NetworkError(409, "Payment has already been confirmed for this package.");
  const definition = PACKAGE_DEFINITIONS.find(p => p.slug === application.packageSlug);
  if (!definition) throw new NetworkError(400, "This participation needs a tailored agreement, not an online fixed-price checkout.");
  const stripe = await getUncachableStripeClient();
  if (application.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(application.stripeSessionId);
    if (existing.status === "open" && existing.url) return existing.url;
    if (existing.payment_status === "paid") {
      await confirmPayment(existing);
      throw new NetworkError(409, "Payment has already completed. Refresh your application.");
    }
  }
  const prices = await stripe.prices.list({ lookup_keys: [`tomi-annual-v1-${definition.slug}`], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price || price.unit_amount !== definition.amount || price.currency !== "usd" || price.recurring) throw new NetworkError(503, "The agreed package price is unavailable.");
  const [profile] = await db.select().from(profiles).where(eq(profiles.memberId, actor.member.id));
  let customerId = profile?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: actor.email, metadata: { tomi_member: String(actor.member.id) } }, { idempotencyKey: `tomi-customer-${actor.clerkId}` });
    customerId = customer.id;
    await db.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.memberId, actor.member.id));
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId, mode: "payment", line_items: [{ price: price.id, quantity: 1 }],
    client_reference_id: String(application.id),
    metadata: { tomi_application: String(application.id), tomi_member: String(actor.member.id), tomi_package: definition.slug },
    success_url: `${origin}/member/certifications?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/member/packages?payment=cancelled`,
  }, { idempotencyKey: `tomi-checkout-${application.id}-${application.updatedAt.getTime()}-${application.stripeSessionId ?? "initial"}` });
  await db.update(certificates).set({ stripeSessionId: session.id }).where(eq(certificates.id, application.id));
  if (!session.url) throw new NetworkError(503, "Checkout did not return a payment URL.");
  return session.url;
}
export async function confirmPayment(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" || !session.metadata?.tomi_application) return;
  const id = Number(session.metadata.tomi_application);
  if (!Number.isSafeInteger(id)) return;
  const [row] = await db.select().from(certificates).where(and(eq(certificates.id, id), eq(certificates.stripeSessionId, session.id)));
  if (!row || row.status !== "approved" || !row.agreementConfirmed) return;
  const definition = PACKAGE_DEFINITIONS.find(p => p.slug === row.packageSlug);
  const [profile] = await db.select().from(profiles).where(eq(profiles.memberId, row.memberId));
  if (!definition || session.amount_total !== definition.amount || session.currency !== "usd" ||
    session.metadata.tomi_member !== String(row.memberId) || session.metadata.tomi_package !== row.packageSlug ||
    session.customer !== profile?.stripeCustomerId) return;
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  await db.update(certificates).set({
    paymentConfirmed: true, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    expiresAt: expires, updatedAt: new Date(),
  }).where(and(eq(certificates.id, id), eq(certificates.paymentConfirmed, false)));
}
export async function paymentStatus(memberId: number, sessionId: string) {
  const [row] = await db.select().from(certificates).where(and(eq(certificates.memberId, memberId), eq(certificates.stripeSessionId, sessionId)));
  if (!row) throw new NetworkError(404, "Payment session not found for this account.");
  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await confirmPayment(session);
  return { status: session.payment_status, certificationId: row.id };
}
export async function processStripeWebhook(payload: Buffer, signature: string) {
  await (await getStripeSync()).processWebhook(payload, signature);
  // processWebhook verifies the Stripe signature before any app-specific side effects.
  const event = JSON.parse(payload.toString()) as Stripe.Event;
  const { processHumanitarianEvent } = await import("./humanitarianPayments");
  await processHumanitarianEvent(event);
  const { processMagazineEvent } = await import("./magazinePayments");
  await processMagazineEvent(event);
  const { monthlyWebhook } = await import("./monthlyMembership");
  await monthlyWebhook(event);
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await confirmPayment(event.data.object as Stripe.Checkout.Session);
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (charge.refunded && paymentIntent) {
      await db.update(certificates).set({ paymentConfirmed: false, status: "revoked", decisionNote: "Payment refunded; official status withdrawn.", updatedAt: new Date() })
        .where(eq(certificates.stripePaymentIntentId, paymentIntent));
    }
  }
}
