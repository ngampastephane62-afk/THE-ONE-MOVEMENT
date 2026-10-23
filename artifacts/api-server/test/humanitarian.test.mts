import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";
import * as tables from "@workspace/db";

// Real HTTP handlers + real PostgreSQL, with all fixture writes rolled back.
// The payment provider and transport identity are isolated fakes, never live charges.
const globals = globalThis as any;
const require = createRequire(import.meta.url);
// Local process only: the provider below is entirely fake.
process.env.TOMI_HUMANITARIAN_LIVE_AUTHORIZED = "true";
const stripe = {
  accounts: { retrieve: async () => ({ charges_enabled: true, capabilities: { card_payments: "active" } }) },
  balance: { retrieve: async () => ({ livemode: true }) },
  checkout: { sessions: {
    async create(params: any, options: any) {
      if (globals.sessions.has(options.idempotencyKey)) return globals.sessions.get(options.idempotencyKey);
      const id = `cs_test_fixture_${params.metadata.tomi_humanitarian}`;
      const session = {
        id, metadata: params.metadata, status: "open", payment_status: "unpaid",
        currency: params.line_items[0].price_data.currency, amount_total: params.line_items[0].price_data.unit_amount,
        mode: "payment", livemode: true, payment_intent: `pi_fixture_${params.metadata.tomi_humanitarian}`,
        url: `https://checkout.stripe.com/c/pay/${id}`,
      };
      globals.sessions.set(options.idempotencyKey, session);
      return session;
    },
    retrieve: async (id: string) => [...globals.sessions.values()].find((session: any) => session.id === id),
  } },
  paymentIntents: { retrieve: async (id: string) => ({ id, livemode: true, status: "succeeded", amount: 1000, amount_received: 1000, currency: "usd", latest_charge: { amount_refunded: globals.refunded } }) },
};
globals.stripe = stripe;
globals.sessions = new Map();
globals.refunded = 0;
const output = await build({
  entryPoints: [new URL("../src/routes/humanitarian.ts", import.meta.url).pathname],
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{
    name: "isolated-humanitarian-fixture",
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "db", namespace: "fixture" }));
      b.onResolve({ filter: /(^|\/)networkAuth$/ }, () => ({ path: "auth", namespace: "fixture" }));
      b.onResolve({ filter: /services\/networkFiles$/ }, () => ({ path: "files", namespace: "fixture" }));
      b.onResolve({ filter: /(^|\/)networkPayments$/ }, () => ({ path: "ready", namespace: "fixture" }));
      b.onResolve({ filter: /stripeClient$/ }, () => ({ path: "stripe", namespace: "fixture" }));
      b.onResolve({ filter: /middlewares\/clerkProxyMiddleware$/ }, () => ({ path: "host", namespace: "fixture" }));
      b.onResolve({ filter: /lib\/inMemoryRateLimiter$/ }, () => ({ path: "limiter", namespace: "fixture" }));
      b.onResolve({ filter: /^@clerk\/express$/ }, () => ({ path: "clerk", namespace: "fixture" }));
      b.onResolve({ filter: /^(express|drizzle-orm|@workspace\/api-zod)$/ }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, args => {
        const mocks: Record<string, string> = {
          db: `export const db=globalThis.tx;export const humanitarianPayments=globalThis.tables.humanitarianPayments;export const humanitarianOffers=globalThis.tables.humanitarianOffers;`,
          auth: `
            export class NetworkError extends Error{constructor(status,message){super(message);this.status=status;}}
            export function networkAuth(req,res,next){
              if(!req.headers['x-fixture-role'])return res.status(401).json({error:'Sign in'});
              res.locals.actor={founder:req.headers['x-fixture-role']==='founder',member:{id:globalThis.memberId+(req.headers['x-fixture-role']==='other'?1:0)},email:'fixture@example.invalid'};return next();
            }
            export function actor(res){return res.locals.actor;}
            export function networkWrite(req,res,next){next();}
            export function requireFounder(res){if(!res.locals.actor?.founder)throw new NetworkError(403,'Founder only');}
          `,
          files: `export function objectFile(){return {download:async()=>[Buffer.alloc(10000,42)]}};`,
          ready: `export const stripeReady=true;`,
          stripe: `export async function getUncachableStripeClient(){return globalThis.stripe;}`,
          host: `export function getClerkProxyHost(){return 'fixture.invalid';}`,
          limiter: `export function createRateLimiter(){return (req,res,next)=>next();}`,
          clerk: `export function getAuth(req){return {userId:req.headers['x-fixture-role']?'fixture':null};}`,
        };
        return { contents: mocks[args.path]!, loader: "js" };
      });
    },
  }],
});
try {
  await tables.db.transaction(async tx => {
    globals.tx = tx;
    globals.tables = tables;
    const [member] = await tx.insert(tables.ecosystemMembersTable).values({ clerkId: `fixture-${crypto.randomUUID()}`, fullName: "Isolated humanitarian fixture", profession: "Test fixture" }).returning();
    globals.memberId = member!.id;
    const mod = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0]!.text).toString("base64")}`);
    const app = express();
    app.use(express.json(), mod.default);
    app.use((err: any, _req: any, res: any, _next: any) => res.status(err.status ?? 500).json({ error: err.message }));
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    const port = (server.address() as { port: number }).port;
    const request = async (path: string, method = "GET", body?: unknown, role = "", range?: string) => {
      const r = await fetch(`http://127.0.0.1:${port}${path}`, {
        method, headers: { origin: "https://fixture.invalid", "content-type": "application/json", ...(role ? { "x-fixture-role": role } : {}), ...(range ? { range } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = r.headers.get("content-type")?.includes("application/json") ? await r.json() : await r.arrayBuffer();
      return { status: r.status, result, headers: r.headers };
    };
    try {
      const cfg = await request("/humanitarian/config");
      assert.equal(cfg.result.testMode, false);
      assert.equal(cfg.result.minimumAed, 200);
      const input = { kind: "donation", amount: 100, currency: "usd", accepted: true, requestId: crypto.randomUUID() };
      assert.equal((await request("/humanitarian/checkout", "POST", { ...input, amount: 99 })).status, 400);
      assert.equal((await request("/humanitarian/checkout", "POST", { ...input, currency: "aed" })).status, 400);
      assert.equal((await request("/humanitarian/checkout", "POST", { ...input, accepted: false })).status, 400);
      assert.equal((await request("/humanitarian/checkout", "POST", input)).status, 200);
      assert.equal((await request("/humanitarian/checkout", "POST", input)).status, 200);
      assert.equal(globals.sessions.size, 1, "retry must reuse a checkout");
      const doc = { ...input, kind: "documentary", amount: 1000, requestId: crypto.randomUUID() };
      assert.equal((await request("/humanitarian/checkout", "POST", doc)).status, 410, "retired film checkout must not charge");
      assert.equal((await request("/humanitarian/checkout", "POST", { ...doc, kind: "donation" }, "member")).status, 200);
      assert.equal((await request("/humanitarian/checkout", "POST", { ...input, amount: 5000000, requestId: crypto.randomUUID() })).status, 200, "US$50,000 must not hit an invented fundraising ceiling");
      assert.equal((await request("/humanitarian/checkout", "POST", { ...input, amount: 100000000, requestId: crypto.randomUUID() })).status, 400, "US$1m is coordinated, not forced through a card charge");
      const session = [...globals.sessions.values()].find((s: any) => s.metadata.tomi_member === String(globals.memberId));
      assert.equal((await request("/documentary/goma/stream")).status, 200);
      assert.equal((await request("/documentary/access")).result.hasAccess, true);
      const url = `/humanitarian/payment-status?session_id=${session.id}`;
      assert.equal((await request(url, "GET", undefined, "other")).status, 404);
      assert.equal((await request(url, "GET", undefined, "member")).result.archiveAccess, false);
      session.status = "complete"; session.payment_status = "paid";
      assert.equal((await request(url, "GET", undefined, "member")).result.archiveAccess, false, "a donation must not buy professional access");
      assert.equal((await request("/documentary/access", "GET", undefined, "member")).result.hasAccess, true);
      const streamed = await request("/documentary/goma/stream", "GET", undefined, "member", "bytes=0-15");
      assert.equal(streamed.status, 206);
      assert.equal(streamed.result.byteLength, 16);
      assert.ok(streamed.headers.get("cache-control")?.startsWith("public"));
      assert.equal((await request("/documentary/goma/stream", "GET", undefined, "member", "bytes=20000-")).status, 416);
      assert.equal((await request("/documentary/media/goma-full.mp4")).status, 404);
      globals.refunded = 100;
      assert.equal((await request(url, "GET", undefined, "member")).result.status, "refunded");
      assert.equal((await request("/documentary/access", "GET", undefined, "member")).result.hasAccess, true, "humanitarian films remain public after a donation refund");
      assert.equal((await request("/documentary/goma/stream")).status, 200);
      const offer = { kind: "logistics", fullName: "Fixture Helper", email: "helper@example.invalid", country: "Test country", description: "Disposable test offer for coordination of logistics.", accepted: true, website: "" };
      const offered = await request("/humanitarian/offers", "POST", offer);
      assert.equal(offered.status, 201);
      const majorGift = await request("/humanitarian/offers", "POST", { ...offer, kind: "financial", description: "Proposed financial contribution: USD 1,000,000. Please coordinate eligibility and payment arrangements." });
      assert.equal(majorGift.status, 201);
      assert.equal(majorGift.result.status, "new", "an offer is not a paid donation");
      assert.equal((await request("/humanitarian/offers/admin", "GET", undefined, "member")).status, 403);
      assert.ok((await request("/humanitarian/offers/admin", "GET", undefined, "founder")).result.some((r: any) => r.id === offered.result.id));
      assert.equal((await request(`/humanitarian/offers/admin/${offered.result.id}`, "PATCH", { status: "contacted" }, "founder")).result.status, "contacted");
      assert.equal((await request(`/humanitarian/offers/admin/${offered.result.id}`, "PATCH", { status: "invented" }, "founder")).status, 400);
      console.log("PASS: minimums, consent, idempotency, no invented donation ceiling, US$1m coordinated offer, free humanitarian film, retired paid film checkout, verified contribution receipts, ownership, range playback, refunds, persisted offers and founder guards.");
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
    throw new Error("ROLLBACK_HUMANITARIAN_FIXTURE");
  });
} catch (error) {
  if (!(error instanceof Error) || error.message !== "ROLLBACK_HUMANITARIAN_FIXTURE") throw error;
} finally { await tables.pool.end(); }
