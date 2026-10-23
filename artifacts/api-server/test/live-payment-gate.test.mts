import assert from "node:assert/strict";
import { build } from "esbuild";
// This suite tests the public/live gate, not the separately authorized editor.
process.env.TOMI_HUMANITARIAN_TEST_AUTHORIZED = "false";

// No database, credentials or payment network. Each bundle has a fresh mode cache.
for (const live of [false, true]) {
  for (const authorised of [false, true]) {
    const output = await build({
      stdin: {
        contents: `export {monthlyMode, monthlyCheckout} from "./src/services/monthlyMembership"; export {humanitarianConfiguration} from "./src/services/humanitarianPayments";`,
        resolveDir: process.cwd(),
      },
      bundle: true, write: false, platform: "node", format: "esm",
      define: { "process.env.TOMI_HUMANITARIAN_LIVE_AUTHORIZED": JSON.stringify(String(authorised)), "process.env.TOMI_HUMANITARIAN_TEST_AUTHORIZED": '"false"' },
      plugins: [{
        name: "isolated-payment-mode",
        setup(b) {
          b.onResolve({ filter: /^@workspace\/db$|^drizzle-orm$|stripeClient$|networkPayments$|networkAuth$/ }, args => ({ path: args.path, namespace: "fixture" }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, args => {
            const content = args.path === "@workspace/db"
              ? `export const db = new Proxy({}, {get(){throw Error("Unexpected database access")}}), monthlyMemberships={}, networkProfiles={}, humanitarianPayments={};`
              : args.path === "drizzle-orm"
                ? `export const eq=()=>{}, and=()=>{}, sql=()=>{};`
                : args.path.endsWith("stripeClient")
                  ? `export async function getUncachableStripeClient(){return {balance:{retrieve:async()=>({livemode:${live}})},accounts:{retrieve:async()=>({charges_enabled:true,capabilities:{card_payments:'active'}})}}}`
                  : args.path.endsWith("networkPayments")
                    ? `export const stripeReady=true;`
                    : `export class NetworkError extends Error { constructor(status,message){super(message);this.status=status} }`;
            return { contents: content };
          });
        },
      }],
    });
    const module = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString("base64")}#${live}-${authorised}`);
    const monthly = await module.monthlyMode();
    assert.equal(monthly.available, live);
    assert.equal(monthly.testMode, !live);
    const donations = await module.humanitarianConfiguration();
    assert.equal(donations.available, live && authorised);
    assert.equal(donations.testMode, !live);
    if (!live) {
      await assert.rejects(module.monthlyCheckout({ member: { id: 1 } }, "professional", "https://fixture.invalid"),
        (error: any) => error.status === 503 && error.message.includes("Test checkout is closed"));
    }
  }
}
console.log("PASS: test checkout closed; live subscriptions available; real donations still require fundraising authorisation. No charges created.");
