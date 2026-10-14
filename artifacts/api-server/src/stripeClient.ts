import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./lib/logger";

// This connection uses the current connector proxy, not the legacy
// include_secrets/secret_key API. No Stripe credential is exposed or stored here.
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
let sync: StripeSync | undefined;
export async function getStripeSync() {
  if (!sync) {
    if (!process.env.DATABASE_URL) throw new Error("Database is unavailable");
    const client = await getUncachableStripeClient();
    const account = await client.accounts.retrieve(null);
    sync = new StripeSync({
      poolConfig: { connectionString: process.env.DATABASE_URL },
      stripeSecretKey: `replit_proxy_${account.id}`, stripeAccountId: account.id, logger,
    });
    // StripeSync exposes this client publicly; its sync and managed-webhook
    // operations use the same authenticated connector transport as checkout.
    sync.stripe = client as unknown as typeof sync.stripe;
  }
  return sync;
}
