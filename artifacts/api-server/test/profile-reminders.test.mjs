import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const fixture = `
import {randomUUID} from "node:crypto";
export const state={members:[],networks:[],reminders:[],emails:[],provider:"ok",users:new Map()};
export const ecosystemMembersTable={table:"members",clerkId:"clerkId"};
export const networkProfiles={table:"networks",memberId:"memberId"};
export const memberProfileRemindersTable={table:"reminders",clerkId:"clerkId",attemptId:"attemptId",id:"id"};
export const siteVisitSessionsTable={};
let queue=Promise.resolve();
export const db={
 select:()=>({from:table=>({where:condition=>({limit:async()=>state[table.table].filter(r=>r[condition.column]===condition.value).slice(0,1)})})}),
 insert:table=>({values:values=>({onConflictDoUpdate:conflict=>({returning:async()=>{
  let row=state[table.table].find(r=>r.clerkId===values.clerkId);
  if(row)Object.assign(row,conflict.set);
  else{row={id:randomUUID(),optOutAt:null,acceptedAt:null,createdAt:new Date(),...values};state[table.table].push(row);}
  return [row];
 }})})}),
 update:table=>({set:values=>({where:async condition=>{
  for(const row of state[table.table])if(row[condition.column]===condition.value)Object.assign(row,values);
 }})}),
 execute:async()=>{},
 transaction:async(fn)=>{const before=queue;let release;queue=new Promise(r=>release=r);await before;try{return await fn(db);}finally{release();}},
};
export const clerkClient={users:{getUser:async id=>{const user=state.users.get(id);if(!user)throw Error("Unknown fixture");return user;}}};
export class ReplitConnectors{async proxy(connector,path,options){
 if(connector!=="resend")throw Error("Unexpected connector");
 if(path==="/domains")return state.provider==="invalid-key"?new Response("{}",{status:400}):Response.json({data:[{name:"fixture.invalid",status:"verified"}]});
 if(path!=="/emails"||options.method!=="POST")throw Error("Unexpected integration call");
 const data=JSON.parse(options.body);state.emails.push({data,key:options.headers["Idempotency-Key"]});
 if(state.provider==="timeout")throw Error("Ambiguous fixture send");
 if(state.provider==="http-timeout")return new Response("{}",{status:408});
 if(state.provider==="conflict")return new Response("{}",{status:409});
 if(state.provider==="reject")return new Response("{}",{status:400});
 return Response.json({id:randomUUID()});
}}
`;
const bundle = await build({
  stdin: { contents: `export {previewReminder,sendReminder} from "./src/services/profileReminders";export {state} from "@workspace/db";`, resolveDir: process.cwd() },
  platform: "node", format: "esm", bundle: true, write: false,
  define: {
    "process.env.SESSION_SECRET": JSON.stringify("fixture-secret-never-real"),
    "process.env.TOMI_PROFILE_REMINDER_FROM": JSON.stringify("members@fixture.invalid"),
    "process.env.TOMI_PUBLIC_SITE_URL": JSON.stringify("https://site.fixture.invalid"),
  },
  plugins: [{
    name: "fully-isolated-reminders",
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$|^@clerk\/express$|^@replit\/connectors-sdk$/ }, () => ({ path: "state", namespace: "fixture" }));
      b.onResolve({ filter: /^drizzle-orm$/ }, () => ({ path: "sql", namespace: "fixture" }));
      b.onResolve({ filter: /\/networkAuth$/ }, () => ({ path: "auth", namespace: "fixture" }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, ({path}) => ({ contents: path==="state"?fixture:path==="auth"?
        `export class NetworkError extends Error{constructor(status,message){super(message);this.status=status;}}`:
        `export const eq=(column,value)=>({column,value});export const sql=()=>({});export const asc=()=>({}),gte=()=>({}),inArray=()=>({});` }));
    },
  }],
});
const { previewReminder, sendReminder, state } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
function setup() {
  state.members.length=0;state.networks.length=0;state.reminders.length=0;state.emails.length=0;state.users.clear();state.provider="ok";
  state.users.set("user_fixture", { id:"user_fixture",firstName:"Fixture",lastName:"Member",primaryEmailAddressId:"primary",
    emailAddresses:[{id:"primary",emailAddress:"recipient@fixture.invalid",verification:{status:"verified"}}], banned:false,locked:false });
}
const send = token => sendReminder("user_fixture","user_founder",token);

test("preview is read-only and explicit sending uses the exact verified recipient and text once under concurrent confirmation", async()=>{
  setup();
  const preview=await previewReminder("user_fixture");
  assert.equal(preview.canSend,true);
  assert.equal(state.reminders.length,0);assert.equal(state.emails.length,0);
  const results=await Promise.allSettled([send(preview.previewToken),send(preview.previewToken)]);
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
  assert.equal(state.emails.length,1);
  assert.deepEqual(state.emails[0].data.to,["recipient@fixture.invalid"]);
  assert.equal(state.emails[0].data.text,preview.text);
  assert.match(state.emails[0].key,/^profile-reminder\/[a-f0-9-]{36}$/);
  assert.equal(state.reminders[0].status,"accepted");
  assert.equal((await previewReminder("user_fixture")).canSend,false);
});
test("profile or recipient changes after preview require a new confirmation and send nothing", async()=>{
  setup();const preview=await previewReminder("user_fixture");
  state.members.push({id:1,clerkId:"user_fixture",accountType:"individual",fullName:"Fixture",profession:"Artist",country:"AE",
    mainSector:"art",activeSectors:["art"],updatedAt:new Date()});
  await assert.rejects(()=>send(preview.previewToken),e=>e.status===409);
  assert.equal((await previewReminder("user_fixture")).canSend,false);
  assert.equal(state.emails.length,0);
  setup();const second=await previewReminder("user_fixture");
  state.users.get("user_fixture").emailAddresses[0].emailAddress="changed@fixture.invalid";
  await assert.rejects(()=>send(second.previewToken),e=>e.status===409);
  assert.equal(state.emails.length,0);
});
test("unverified, restricted, opted-out accounts and invalid provider configuration never send", async()=>{
  setup();state.users.get("user_fixture").emailAddresses[0].verification.status="unverified";
  assert.equal((await previewReminder("user_fixture")).canSend,false);
  setup();state.users.get("user_fixture").banned=true;
  assert.equal((await previewReminder("user_fixture")).canSend,false);
  setup();const original=await previewReminder("user_fixture");await send(original.previewToken);
  state.reminders[0].optOutAt=new Date();
  assert.equal((await previewReminder("user_fixture")).canSend,false);
  const alreadySent=state.emails.length;
  await assert.rejects(()=>send(original.previewToken),e=>e.status===409);
  assert.equal(state.emails.length,alreadySent);
  setup();state.provider="invalid-key";
  const disabled=await previewReminder("user_fixture");assert.equal(disabled.canSend,false);
  await assert.rejects(()=>send(disabled.previewToken),e=>e.status===409);
  assert.equal(state.emails.length,0);assert.equal(state.reminders.length,0);
});
test("ambiguous provider failures are retained and cannot cause immediate duplicate sends", async()=>{
  for(const failure of ["timeout","http-timeout","conflict"]){
    setup();state.provider=failure;const preview=await previewReminder("user_fixture");
    await assert.rejects(()=>send(preview.previewToken),e=>e.status===503);
    assert.equal(state.reminders[0].status,"unknown");
    assert.equal(state.emails.length,1);
    const next=await previewReminder("user_fixture");assert.equal(next.canSend,false);
    await assert.rejects(()=>send(next.previewToken),e=>e.status===409);
    assert.equal(state.emails.length,1);
  }
});
