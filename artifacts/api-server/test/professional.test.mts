import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";
import { eq } from "drizzle-orm";
import * as tables from "@workspace/db";

// Real HTTP + PostgreSQL transactions. Identity and Stripe are isolated fixtures.
// No real user, charge, subscription or lasting database record is created.
const g = globalThis as any;
const require = createRequire(import.meta.url);
const prices = new Map<string, any>(), sessions = new Map<string, any>(), subscriptions = new Map<string, any>();
g.stripe = {
  // Simulated live provider; no network calls or real charges.
  balance: { retrieve: async () => ({ livemode: true }) },
  customers: { create: async (p: any) => ({ id: `cus_${p.metadata.tomi_member}` }) },
  products: { create: async (p: any) => ({ id: `prod_${p.metadata.tomi_monthly_tier}` }) },
  prices: {
    list: async (p: any) => ({ data: [...prices.values()].filter(x => p.lookup_keys.includes(x.lookup_key)) }),
    create: async (p: any) => {
      const price = { ...p, id: `price_${p.product}`, active: true, recurring: { ...p.recurring, interval_count: 1 } };
      prices.set(price.id, price); return price;
    },
  },
  checkout: { sessions: {
    create: async (p: any) => {
      const id = `cs_test_${sessions.size}`;
      const session = { ...p, id, url: `https://checkout.stripe.com/c/pay/${id}`, status: "open", payment_status: "unpaid", subscription: null, livemode: true };
      sessions.set(id, session); return session;
    },
    retrieve: async (id: string) => sessions.get(id),
    expire: async (id: string) => Object.assign(sessions.get(id), { status: "expired" }),
  } },
  subscriptions: {
    retrieve: async (id: string) => { const sub = subscriptions.get(id); if (!sub) throw Error("Missing fixture subscription"); return sub; },
    update: async (id: string, p: any) => Object.assign(subscriptions.get(id), p),
  },
  billingPortal: { sessions: { create: async () => { throw Error("Portal not configured"); } } },
};
const bundled = await build({
  stdin: {
    contents: `export {default as professional} from "./src/routes/professional"; export {default as editorial} from "./src/routes/editorialEngagement"; export {networkAction} from "./src/services/networkActions"; export {monthlyWebhook,synchronizeMonthly} from "./src/services/monthlyMembership";`,
    resolveDir: new URL("..", import.meta.url).pathname,
  }, bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{
    name: "isolated-professional-fixture",
    setup(b) {
      for (const [filter, path] of [
        [/^@workspace\/db$/, "db"], [/(^|\/)networkAuth$/, "auth"],
        [/(^|\/)networkPayments$/, "payments"], [/(^|\/)networkFiles$/, "files"],
        [/stripeClient$/, "stripe"], [/middlewares\/clerkProxyMiddleware$/, "host"],
        [/^@clerk\/express$/, "clerk"],
      ] as const) b.onResolve({ filter }, () => ({ path, namespace: "fixture" }));
      b.onResolve({ filter: /^(express|drizzle-orm|@workspace\/api-zod|@workspace\/shared)$/ }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, a => {
        const mocks: Record<string, string> = {
          db: `export const db=globalThis.tx;${Object.keys(tables).filter(k => k !== "db").map(k => `export const ${k}=globalThis.tables.${k};`).join("")}`,
          auth: `
            export class NetworkError extends Error{constructor(status,message){super(message);this.status=status;}}
            export function networkAuth(req,res,next){
              const id=Number(req.headers['x-fixture-member']);
              if(!id)return res.status(401).json({error:'Sign in'});
              const member=globalThis.fixtureMembers.find(m=>m.id===id);
              if(!member)return res.status(401).json({error:'No fixture member'});
              res.locals.actor={member,founder:req.headers['x-fixture-founder']==='yes',clerkId:member.clerkId,email:'fixture@example.invalid',accountCreatedAt:Date.now()};
              res.locals.networkEnabled=true;next();
            }
            export function actor(res){return res.locals.actor;}
            export function networkWrite(req,res,next){next();}
            export function requireFounder(res){if(!res.locals.actor?.founder)throw new NetworkError(403,'Founder only');}
          `,
          payments: `export const stripeReady=true,DOCUMENTS=[],PACKAGE_DEFINITIONS=[],customPackages=[];export async function catalog(){return []}export async function checkout(){throw Error('Not a monthly checkout')}`,
          files: `export async function ownedMedia(){return []}export async function completeUpload(){}export function mediaDto(x){return x}`,
          stripe: `export async function getUncachableStripeClient(){return globalThis.stripe}`,
          host: `export function getClerkProxyHost(){return 'fixture.invalid'}`,
          clerk: `export function getAuth(req){return {userId:req.headers['x-fixture-member']?'fixture':null}}`,
        };
        return { contents: mocks[a.path]!, loader: "js" };
      });
    },
  }],
});
const rollback = new Error("ROLLBACK_ONLY");
try {
  await tables.db.transaction(async tx => {
    g.tx = tx; g.tables = tables;
    g.fixtureMembers = await tx.insert(tables.ecosystemMembersTable).values(
      Array.from({ length: 14 }, (_, i) => ({ clerkId: `professional-fixture-${crypto.randomUUID()}`, fullName: `Isolated professional fixture ${i}`, profession: "Test fixture" })),
    ).returning();
    const ids = g.fixtureMembers.map((m: any) => m.id) as number[];
    await tx.insert(tables.networkProfiles).values(ids.map(id => ({ memberId: id, enabled: true })));
    const mod = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0]!.text).toString("base64")}`);
    const app = express();
    app.use(express.json(), mod.professional, mod.editorial);
    const auth = (req: any, res: any, next: any) => {
      const member = g.fixtureMembers.find((m: any) => m.id === Number(req.headers["x-fixture-member"]));
      res.locals.actor = { member, founder: false }; res.locals.networkEnabled = true; next();
    };
    app.post("/network/actions", auth, async (req, res) => res.json(await mod.networkAction(req, res)));
    app.use((err: any, _req: any, res: any, _next: any) => res.status(err.status ?? 500).json({ error: err.message }));
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const request = async (path: string, body?: unknown, id = ids[0]!, founder = false) => {
      const r = await fetch(base + path, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", Origin: "https://fixture.invalid", ...(id ? { "x-fixture-member": String(id) } : {}), ...(founder ? { "x-fixture-founder": "yes" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, body: await r.json() as any };
    };
    const action = (data: unknown, id = ids[0]!, founder = false) => request("/professional/actions", data, id, founder);
    const pay = async (memberId: number) => {
      const session = [...sessions.values()].find(s => s.customer === `cus_${memberId}` && s.status === "open");
      const price = prices.get(session.line_items[0].price);
      session.status = "complete"; session.payment_status = "paid"; session.subscription = `sub_fixture_${memberId}`;
      subscriptions.set(session.subscription, {
        id: session.subscription, customer: session.customer, metadata: session.subscription_data.metadata,
        livemode: true, status: "active", cancel_at_period_end: false,
        items: { data: [{ price, quantity: 1, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
        latest_invoice: { status: "paid", amount_paid: price.unit_amount },
      });
      await mod.monthlyWebhook({ type: "checkout.session.completed", data: { object: session } });
    };
    try {
      assert.equal((await request("/professional/state", undefined, 0)).status, 401);
      assert.equal((await request("/professional/resources/networking-guide")).status, 402);
      assert.equal((await action({ action: "checkout", tier: "professional" })).status, 400);
      assert.equal((await action({ action: "checkout", tier: "professional", accepted: true, amount: 1 })).status, 400);
      assert.equal((await action({ action: "checkout", tier: "professional", accepted: true })).status, 200);
      assert.equal((await action({ action: "checkout", tier: "professional", accepted: true })).status, 200);
      assert.equal(sessions.size, 1, "Open checkout is reused");
      assert.equal((await request("/professional/state")).body.membership.active, false, "Open checkout grants nothing");
      await pay(ids[0]!);
      assert.equal((await request("/professional/state")).body.membership.active, true);
      assert.equal([...prices.values()][0].unit_amount, 2900);
      assert.equal((await action({ action: "checkout", tier: "professional", accepted: true })).status, 409);
      assert.equal((await request("/professional/resources/networking-guide")).status, 200);
      assert.equal((await action({ action: "portal" })).status, 503);
      assert.equal((await action({ action: "cancel", accepted: true })).status, 200);
      assert.equal((await request("/professional/state")).body.membership.cancelAtPeriodEnd, true);
      assert.equal((await request("/professional/state")).body.membership.active, true, "Cancellation preserves the paid period");
      await tx.update(tables.networkProfiles).set({ referredBy: ids[0] }).where(eq(tables.networkProfiles.memberId, ids[2]!));
      for (const id of ids.slice(3, 12)) await tx.update(tables.networkProfiles).set({ referredBy: ids[0] }).where(eq(tables.networkProfiles.memberId, id));
      await tx.insert(tables.networkFollows).values(ids.slice(2, 11).map(id => ({ followerId: id, followingId: ids[0]! })));
      assert.equal((await request("/network/actions", { action: "post.create", text: "Nine followers cannot publish." })).status, 403);
      await tx.insert(tables.networkFollows).values({ followerId: ids[11]!, followingId: ids[0]! });
      assert.equal((await request("/network/actions", { action: "post.create", text: "Ten actual invitation followers can publish." })).status, 200);
      assert.equal((await request("/network/actions", { action: "thread.start", targetId: ids[0], text: "A professional connection." }, ids[1])).status, 402);
      assert.equal((await action({ action: "checkout", tier: "business", accepted: true }, ids[1])).status, 200);
      await pay(ids[1]!);
      assert.equal([...prices.values()].find(p => p.unit_amount === 9900).recurring.interval, "month");
      assert.equal((await action({ action: "business.submit", name: "Fixture Business", website: "https://example.invalid", registrationReference: "PUBLIC-FIXTURE", accepted: true }, ids[1])).status, 200);
      assert.equal((await action({ action: "business.attest", memberId: ids[1], text: "I genuinely know this test business.", accepted: true }, ids[1])).status, 400);
      for (const id of ids.slice(2, 11)) assert.equal((await action({ action: "business.attest", memberId: ids[1], text: "I genuinely know this isolated test business.", accepted: true }, id)).status, 200);
      assert.equal((await action({ action: "business.review", memberId: ids[1], status: "approved", text: "Reviewed official reference." }, ids[13], true)).status, 409);
      await action({ action: "business.attest", memberId: ids[1], text: "I genuinely know this isolated test business.", accepted: true }, ids[11]);
      await action({ action: "business.attest", memberId: ids[1], text: "I genuinely know this isolated test business.", accepted: true }, ids[11]);
      const business = await request(`/professional/business/${ids[1]}`);
      assert.equal(business.body.attestationCount, 10, "Duplicate attestation does not count twice");
      assert.equal(business.body.registrationReference, undefined, "Private dossier reference is not exposed");
      assert.equal((await action({ action: "business.review", memberId: ids[1], status: "approved", text: "Reviewed official reference." }, ids[13], true)).status, 200);
      await action({ action: "business.withdraw", memberId: ids[1] }, ids[11]);
      assert.equal((await request(`/professional/business/${ids[1]}`)).body.status, "review_required");
      assert.equal((await request("/professional/introductions", { targetSlug: "made-up-celebrity", message: "An actual detailed collaboration request." })).status, 400);
      assert.equal((await request("/professional/introductions", { targetSlug: "ciara", message: "An actual detailed collaboration request." })).status, 201);
      assert.equal((await request("/professional/introductions", { targetSlug: "ciara", message: "An actual detailed collaboration request." })).status, 409);
      const video = "/editorial/videos/goma/engagement";
      assert.equal((await request(video, undefined, 0)).status, 200);
      const beforeEngagement = (await request(video)).body;
      await request(video, { action: "like", accepted: true });
      await request(video, { action: "like", accepted: true });
      assert.equal((await request(video)).body.likes, beforeEngagement.likes + 1);
      const commentText = `Isolated fixture comment ${crypto.randomUUID()}`;
      await request(video, { action: "comment", text: commentText });
      const commentId = (await request(video)).body.comments.find((comment: any) => comment.text === commentText).id;
      assert.equal((await request(video, { action: "delete", id: commentId }, ids[1])).status, 404);
      await request(video, { action: "delete", id: commentId });
      assert.equal((await request(video)).body.comments.length, beforeEngagement.comments.length);
      console.log("PASS: monthly prices, consent, idempotency, verified paid access, cancellation, ten-follower gate, ten-attester review, introductions and video persistence.");
    } finally {
      server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
    }
    throw rollback;
  });
} catch (error) { if (error !== rollback) throw error; }
await tables.pool.end();
