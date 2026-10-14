import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
import { ReplitConnectors } from "@replit/connectors-sdk";

export async function getUncachableStripeClient() {
  const proxy = new ReplitConnectors().createProxyFetch("stripe");
  const transport: typeof fetch = (url, options) => {
    const headers = new Headers(options?.headers);
    headers.delete("authorization");
    return proxy(url, { ...options, headers });
  };
  return new Stripe("sk_replit_connector_proxy", {
    httpClient: Stripe.createFetchHttpClient(transport), maxNetworkRetries: 2,
  });
}
export async function getStripeSync() {
  if (!process.env.DATABASE_URL) throw new Error("Database is required");
  const client = await getUncachableStripeClient();
  const account = await client.accounts.retrieve(null);
  const sync = new StripeSync({
    poolConfig: { connectionString: process.env.DATABASE_URL },
    stripeSecretKey: `replit_proxy_${account.id}`, stripeAccountId: account.id,
  });
  sync.stripe = client as unknown as typeof sync.stripe;
  return sync;
}
