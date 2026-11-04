import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { build } from "esbuild";
import express from "express";

// Real routes, identity/Founder middleware, actions and event reconciler.
// All identities, provider operations and persistence below are isolated fixtures.
const require = createRequire(import.meta.url);
const fixture = `
export const state={rows:{},users:new Map(),calls:[],accounts:[],failBan:false};
const table=name=>new Proxy({name},{get:(t,k)=>k in t?t[k]:{table:name,key:k}});
export const ecosystemMembersTable=table("members"),networkProfiles=table("profiles"),
networkCertifications=table("certs"),auditLogTable=table("audit"),
founderServiceMessages=table("messages"),founderNotifications=table("notifications"),
founderControlSettings=table("settings"),founderAccountObservations=table("observations"),
networkReports=table("reports"),joinInterestsTable=table("joins"),
institutionalInquiriesTable=table("inquiries"),professionalBusinesses=table("businesses");
const rows=t=>state.rows[t.name]??=[];
export const eq=(col,val)=>r=>r[col.key]===val, and=(...cs)=>r=>cs.every(c=>c(r)),
gte=(col,val)=>r=>r[col.key]>=val,lte=(col,val)=>r=>r[col.key]<=val,
isNull=col=>r=>r[col.key]==null,desc=col=>({desc:col.key});
export const sql=(parts,...values)=>({sql:parts.join("?"),values});
function query(selection){
 let t,condition=()=>true,limit=Infinity,order;
 const result=()=>{
  let rs=rows(t).filter(condition);
  if(order)rs=[...rs].sort((a,b)=>b[order.desc]-a[order.desc]);
  if(selection?.n?.sql?.includes("count("))return [{n:rs.length}];
  if(selection?.id?.sql?.includes("max("))return [{id:Math.max(0,...rs.map(r=>r.id))}];
  rs=rs.slice(0,limit);
  return selection?rs.map(r=>Object.fromEntries(Object.entries(selection).map(([k,v])=>[k,r[v.key]]))):rs;
 };
 const q={from:x=>(t=x,q),where:x=>(condition=x,q),limit:x=>(limit=x,q),
 orderBy:x=>(order=x,q),for:()=>q,then:(a,b)=>Promise.resolve().then(result).then(a,b)};
 return q;
}
export const db={
 select:query,
 insert:t=>({values:v=>{
  let conflict;
  const execute=()=>{
   const key=t.name==="members"?"clerkId":t.name==="profiles"?"memberId":
    t.name==="messages"?"requestId":t.name==="notifications"?"eventKey":
    t.name==="settings"?"key":t.name==="observations"?"clerkId":"id";
   const existing=rows(t).find(r=>v[key]!==undefined&&r[key]===v[key]);
   if(existing&&conflict){if(conflict.set)Object.assign(existing,conflict.set);return [];}
   const r={id:rows(t).length+1,createdAt:new Date(),enabled:false,suspended:false,readThrough:0,enabledKinds:[],...v};
   rows(t).push(r);return [r];
  };
  const op={onConflictDoNothing:()=>(conflict={},op),onConflictDoUpdate:c=>(conflict=c,op),
   returning:()=>Promise.resolve().then(execute),then:(a,b)=>Promise.resolve().then(execute).then(a,b)};
  return op;
 }}),
 update:t=>({set:v=>({where:c=>{for(const r of rows(t).filter(c))Object.assign(r,v);return Promise.resolve();}})}),
 execute:async()=>({rows:[{locked:true}]}),
 transaction:async fn=>{const before=structuredClone(state.rows);try{return await fn(db);}catch(e){state.rows=before;throw e;}}
};
export const getAuth=req=>({userId:req.get("x-fixture-identity")??null});
export const clerkClient={users:{
 getUser:async id=>{const u=state.users.get(id);if(!u)throw {status:404};return structuredClone(u);},
 banUser:async id=>{state.calls.push(["ban",id]);if(state.failBan)throw Error("fixture provider failure");state.users.get(id).banned=true;},
 unbanUser:async id=>{state.calls.push(["unban",id]);state.users.get(id).banned=false;}
}};
export const memberAccountSnapshot=async()=>({accounts:state.accounts,refreshedAt:new Date().toISOString()});
export const invalidateMemberDashboard=()=>{};
`;
const built = await build({
  stdin: { contents: `
    export { default as router } from "./src/routes/founderControl.ts";
    export { NetworkError } from "./src/services/networkAuth.ts";
    export { reconcileFounderEvents } from "./src/services/founderReconciliation.ts";
    export { state } from "fixture";
  `, resolveDir: process.cwd() },
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{ name: "isolated-founder", setup(b) {
    b.onResolve({ filter: /^(fixture|@workspace\/db|@clerk\/express|drizzle-orm)$/ }, () => ({ path: "fixture", namespace: "fake" }));
    b.onResolve({ filter: /\/membershipDashboard$/ }, () => ({ path: "fixture", namespace: "fake" }));
    b.onResolve({ filter: /\/founderCommand$/ }, () => ({ path: "command", namespace: "fake" }));
    b.onResolve({ filter: /\/clerkProxyMiddleware$/ }, () => ({ path: "origin", namespace: "fake" }));
    b.onResolve({ filter: /\/lib\/logger$/ }, () => ({ path: "logger", namespace: "fake" }));
    b.onLoad({ filter: /.*/, namespace: "fake" }, ({ path }) => ({ contents:
      path === "fixture" ? fixture : path === "origin" ? "export const getClerkProxyHost=req=>req.get('host');"
      : path === "logger" ? "export const logger={warn:()=>{}};"
      : `export const founderOverview=async()=>({ok:true}),founderAccount=async()=>({ok:true}),founderSector=async()=>({ok:true});
         export const founderPreferences=async()=>({key:"fixture",enabledKinds:[],readThrough:0});
         export const serviceMessageDto=r=>({id:r.id,text:r.text,fromAdministration:r.fromAdministration,createdAt:r.createdAt.toISOString(),readAt:r.readAt??null});`
    }));
    b.onResolve({ filter: /^express$/ }, a => ({ path: pathToFileURL(require.resolve(a.path)).href, external: true }));
  } }],
});
const { router, NetworkError, reconcileFounderEvents, state } = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`
);
test("Founder administrative HTTP, audit and notification regressions without real writes", async t => {
  process.env.TOMI_FOUNDER_EMAIL = "founder@fixture.invalid";
  const user = (id, verified = true) => ({
    id, firstName: "Founder", lastName: "Display Name Is Not Authorization",
    primaryEmailAddressId: "primary", emailAddresses: [{ id: "primary", emailAddress: `${id}@fixture.invalid`, verification: { status: verified ? "verified" : "unverified" } }],
    banned: false, locked: false, createdAt: Date.now() - 86400000,
  });
  for (const id of ["founder", "member", "stranger", "no_profile", "unverified"]) state.users.set(id, user(id, id !== "unverified"));
  const app = express(); app.use(express.json(), router);
  app.use((e, _req, res, _next) => res.status(e instanceof NetworkError ? e.status : 500).json({ error: e.message }));
  const server = app.listen(0, "127.0.0.1"); await new Promise(r => server.once("listening", r));
  t.after(() => new Promise(r => server.close(r)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (identity, path, body, extra = {}) => fetch(origin + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", ...(identity ? { "x-fixture-identity": identity } : {}), ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const action = (target, data, identity = "founder") => request(identity, `/founder/registered-members/${target}/actions`,
    { confirmed: true, reason: "Fixture administrative justification", requestId: "29fbaab9-260a-4e08-b924-4304f686d888", ...data });

  await t.test("all new Founder endpoints deny anonymous, ordinary and unverified identities", async () => {
    for (const path of ["/founder/command-center", "/founder/registered-members/no_profile", "/founder/sectors/fashion"]) {
      assert.equal((await request(null, path)).status, 401);
      assert.equal((await request("member", path)).status, 403);
      assert.equal((await request("unverified", path)).status, 403);
    }
    assert.equal((await request("founder", "/founder/command-center")).status, 200);
  });
  await t.test("missing confirmation, injected roles/actor and cross-origin actions fail closed", async () => {
    assert.equal((await action("no_profile", { action: "send_message", confirmed: false })).status, 400);
    assert.equal((await action("no_profile", { action: "send_message", role: "founder" })).status, 400);
    assert.equal((await action("no_profile", { action: "send_message", actorClerkId: "founder" })).status, 400);
    assert.equal((await request("founder", "/founder/registered-members/no_profile/actions",
      { action: "suspend" }, { origin: "https://other.invalid" })).status, 403);
    assert.equal(state.rows.audit?.length ?? 0, 0);
    assert.equal(state.calls.length, 0);
  });
  await t.test("administrative contact addresses an account without creating a profile and is idempotent", async () => {
    const before = state.rows.members.length;
    const body = { action: "send_message" };
    assert.equal((await action("no_profile", body)).status, 200);
    assert.equal((await action("no_profile", body)).status, 200);
    assert.equal(state.rows.members.length, before);
    assert.equal(state.rows.messages.length, 1);
    assert.equal(state.rows.audit.length, 1);
    assert.equal(state.rows.audit[0].details.actorClerkId, "founder");
    assert.equal(state.rows.audit[0].details.targetClerkId, "no_profile");
    assert.equal(state.rows.messages[0].fromAdministration, true);
  });
  await t.test("service channel recipient isolation and replies preserve personal message boundaries", async () => {
    const other = await (await request("stranger", "/network/service-messages?recipientClerkId=no_profile")).json();
    assert.deepEqual(other.messages, []);
    const own = await (await request("no_profile", "/network/service-messages")).json();
    assert.equal(own.messages.length, 1);
    assert.equal(own.unread, 1);
    const body = { text: "Fixture service reply", requestId: "2b9f3c6a-3ab2-4c7e-a00b-84d3565193b7" };
    assert.equal((await request("stranger", "/network/service-messages", body)).status, 403);
    assert.equal((await request("no_profile", "/network/service-messages", { ...body, recipientClerkId: "member" })).status, 400);
    assert.equal((await request("no_profile", "/network/service-messages", { readThrough: 1 })).status, 200);
    assert.ok(state.rows.messages[0].readAt);
    assert.equal((await request("no_profile", "/network/service-messages", body)).status, 200);
    assert.equal((await request("no_profile", "/network/service-messages", body)).status, 200);
    assert.equal(state.rows.messages.length, 2);
    assert.equal(state.rows.notifications.filter(n => n.kind === "service_reply").length, 1);
    assert.equal(state.rows.threads, undefined);
  });
  await t.test("certification approval and revocation require the target application and preserve accounts", async () => {
    const memberId = state.rows.members.find(m => m.clerkId === "member").id;
    state.rows.certs = [{ id: 41, memberId, role: "speaker", program: "summit", status: "pending", agreementConfirmed: false, paymentConfirmed: false, expiresAt: null }];
    assert.equal((await action("stranger", { action: "certification_decide", certificationId: 41, decision: "approved" })).status, 404);
    assert.equal((await action("member", { action: "certification_decide", certificationId: 41, decision: "approved" })).status, 200);
    assert.equal(state.rows.certs[0].status, "approved");
    assert.equal((await action("member", { action: "certification_decide", certificationId: 41, decision: "revoked" })).status, 200);
    assert.equal(state.rows.certs[0].status, "revoked");
    assert.ok(state.users.has("member"));
    assert.equal(state.rows.audit.filter(r => r.action.startsWith("founder.certification.")).length, 2);
  });
  await t.test("suspend/restore are audited, preserve listing consent and cannot target Founder", async () => {
    assert.equal((await action("founder", { action: "suspend" })).status, 400);
    const memberId = state.rows.members.find(m => m.clerkId === "member").id;
    assert.equal((await action("member", { action: "suspend" })).status, 200);
    assert.equal(state.users.get("member").banned, true);
    const profile = state.rows.profiles.find(p => p.memberId === memberId);
    assert.equal(profile.suspended, true);
    assert.equal(profile.enabled, false);
    assert.equal((await request("member", "/network/service-messages")).status, 403);
    assert.equal((await action("member", { action: "restore" })).status, 200);
    assert.equal(state.users.get("member").banned, false);
    assert.equal(profile.suspended, false);
    assert.ok(state.rows.audit.some(r => r.action === "founder.account.restore" && r.details.status === "completed"));
    state.failBan = true;
    assert.equal((await action("stranger", { action: "suspend" })).status, 503);
    assert.equal(state.users.get("stranger").banned, false);
    assert.ok(state.rows.audit.some(r => r.action === "founder.account.suspend" && r.details.status === "failed"));
    state.failBan = false;
  });
  await t.test("reconciliation persists one private registration and each verification/completion transition", async () => {
    state.accounts = [];
    await reconcileFounderEvents();
    const account = { clerkId: "new_fixture", name: "Fixture account", createdAt: new Date(Date.now() + 2000).toISOString(),
      emailVerified: false, profileStatus: "no_profile", sectors: [] };
    state.accounts.push(account);
    await reconcileFounderEvents(); await reconcileFounderEvents();
    assert.equal(state.rows.notifications.filter(n => n.kind === "registration").length, 1);
    account.emailVerified = true;
    await reconcileFounderEvents();
    account.profileStatus = "complete";
    await reconcileFounderEvents(); await reconcileFounderEvents();
    assert.equal(state.rows.notifications.filter(n => n.kind === "email_verified").length, 1);
    assert.equal(state.rows.notifications.filter(n => n.kind === "profile_complete").length, 1);
    assert.equal(state.rows.profiles.some(p => p.clerkId === "new_fixture"), false);
  });
});
