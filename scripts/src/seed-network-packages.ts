import { PACKAGE_DEFINITIONS } from "@workspace/shared";
import { getUncachableStripeClient } from "./stripeClient";
import { Storage } from "@google-cloud/storage";
import { readFile } from "node:fs/promises";

const stripe = await getUncachableStripeClient();
for (const item of PACKAGE_DEFINITIONS) {
  const lookup = `tomi-annual-v1-${item.slug}`;
  if ((await stripe.prices.list({ lookup_keys: [lookup], limit: 1 })).data.length) continue;
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
const storage = new Storage({
  projectId: "", credentials: {
    audience: "replit", subject_token_type: "access_token", token_url: "http://127.0.0.1:1106/token", type: "external_account",
    credential_source: { url: "http://127.0.0.1:1106/credential", format: { type: "json", subject_token_field_name: "access_token" } },
    universe_domain: "googleapis.com",
  },
});
const dir = process.env.PRIVATE_OBJECT_DIR;
if (!dir) throw new Error("Private App Storage is required");
for (const [slug, path] of [
  ["membership-kit", "attached_assets/0_The_One_Movement_Membership_Kit_1791996544373.pdf"],
  ["partnership-package", "attached_assets/1_INVESTMENT_PACKAGE_TOMI_FINAL_1791996544374.pdf"],
  ["investor-deck", "attached_assets/2_TOMI_GLOBAL_INVESTOR_DECK_1791996544374.pdf"],
]) {
  const bytes = await readFile(new URL(`../../${path}`, import.meta.url));
  const [bucket, ...segments] = `${dir.replace(/\/$/, "")}/network-documents/${slug}.pdf`.replace(/^\/+/, "").split("/");
  await storage.bucket(bucket!).file(segments.join("/")).save(bytes, { contentType: "application/pdf", resumable: false });
}
console.log("TOMI package prices seeded idempotently; three original documents stored privately.");
process.exit(0);
