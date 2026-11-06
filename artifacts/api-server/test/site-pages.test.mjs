import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const fixture = `
export const state={rows:[],audits:[],failAudit:false}; let queue=Promise.resolve();
export const mediaItemsTable={type:'type',category:'category',id:'id'},auditLogTable={audit:true};
export const eq=(c,v)=>r=>r[c]===v,and=(...cs)=>r=>cs.every(c=>c(r)),sql=()=>({});
export class NetworkError extends Error{constructor(status,message){super(message);this.status=status;}}
export const db={
 select:()=>({from:()=>({where:async c=>state.rows.filter(c)})}),
 update:()=>({set:v=>({where:async c=>{for(const r of state.rows.filter(c))Object.assign(r,v);}})}),
 insert:t=>({values:async v=>{if(t.audit){if(state.failAudit)throw Error('fixture audit unavailable');state.audits.push(v);}
 else state.rows.push({id:state.rows.length+1,...v});}}),
 execute:async()=>{},
 transaction:async f=>{const previous=queue;let release;queue=new Promise(r=>release=r);await previous;
 const before=structuredClone({rows:state.rows,audits:state.audits});try{return await f(db);}catch(e){state.rows=before.rows;state.audits=before.audits;throw e;}finally{release();}}
};
`;
const bundle = await build({ stdin: { contents: `
 export {sitePageDocument,saveSiteCopy,editablePageKey,parseSiteCopy} from "./src/services/sitePages";
 export {SITE_EDITABLE_PAGES,sitePageForPath,maxUploadBytes,UPLOAD_LIMITS} from "@workspace/shared";
 export {state} from "fixture";
`, resolveDir: process.cwd() }, bundle: true, format: "esm", platform: "node", write: false, plugins: [{
  name: "isolated-page-copy", setup(b) {
    b.onResolve({ filter: /^(fixture|@workspace\/db|drizzle-orm)$|\/networkAuth$/ }, () => ({ path: "fixture", namespace: "isolated" }));
    b.onLoad({ filter: /.*/, namespace: "isolated" }, () => ({ contents: fixture }));
  },
}] });
const { sitePageDocument, saveSiteCopy, editablePageKey, parseSiteCopy, state, SITE_EDITABLE_PAGES, sitePageForPath,
  maxUploadBytes, UPLOAD_LIMITS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const input = (pageKey, expectedUpdatedAt = null, status = "draft", value = "Une vision accessible") => ({
  expectedUpdatedAt, content: { pageKey, updatedAt: null, status, copies: [{ language: "fr", entries: [{ source: "Our vision", value }] }] },
});
test("public page registry covers all seventeen sectors and excludes account, member and invitation surfaces", () => {
  assert.equal(new Set(SITE_EDITABLE_PAGES.map(p => p.key)).size, SITE_EDITABLE_PAGES.length);
  assert.equal(SITE_EDITABLE_PAGES.filter(p => p.key.startsWith("sector-")).length, 17);
  for (const path of ["/member", "/member/messages", "/sign-in", "/sign-up", "/community/members/1", "/invite/test"]) assert.equal(sitePageForPath(path), null);
  assert.equal(sitePageForPath("/news/some-article").key, "news");
  assert.throws(() => editablePageKey("member"), e => e.status === 404);
});
test("page copy draft is private, publication survives reload, subsequent drafts never replace live copy", async () => {
  const before = await sitePageDocument("vision");
  assert.equal(before.copies.length, 0);
  const draft = await saveSiteCopy("vision", input("vision"), "fixture_founder");
  assert.equal((await sitePageDocument("vision")).copies.length, 0);
  assert.equal((await sitePageDocument("vision", true)).copies[0].entries[0].value, "Une vision accessible");
  const live = await saveSiteCopy("vision", input("vision", draft.updatedAt, "published"), "fixture_founder");
  assert.equal((await sitePageDocument("vision")).updatedAt, live.updatedAt);
  await saveSiteCopy("vision", input("vision", live.updatedAt, "draft", "Nouveau brouillon"), "fixture_founder");
  assert.equal((await sitePageDocument("vision")).copies[0].entries[0].value, "Une vision accessible");
  assert.equal(state.audits.at(-1).details.actorClerkId, "fixture_founder");
});
test("simultaneous and stale page saves conflict without losing the saved version", async () => {
  const payload = input("impact");
  const results = await Promise.allSettled([saveSiteCopy("impact", payload, "fixture_founder"), saveSiteCopy("impact", payload, "fixture_founder")]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.find(r => r.status === "rejected").reason.status, 409);
  assert.equal((await sitePageDocument("impact", true)).copies.length, 1);
});
test("failed audit rolls back publication; duplicate languages, wrong page and malformed copy are rejected", async () => {
  const current = await sitePageDocument("impact", true);
  state.failAudit = true;
  await assert.rejects(() => saveSiteCopy("impact", input("impact", current.updatedAt, "published"), "fixture_founder"), /audit unavailable/);
  state.failAudit = false;
  assert.equal((await sitePageDocument("impact")).copies.length, 0);
  const duplicate = input("vision"); duplicate.content.copies.push(duplicate.content.copies[0]);
  assert.throws(() => parseSiteCopy(duplicate, "vision"), e => e.status === 400);
  assert.throws(() => parseSiteCopy(input("impact"), "vision"), e => e.status === 400);
  assert.throws(() => parseSiteCopy({ ...input("vision"), actorClerkId: "spoofed" }, "vision"), e => e.status === 400);
});
test("accepted video maximum is 500 MiB with bounded files and daily allowance, not unlimited storage", () => {
  assert.equal(maxUploadBytes("video/mp4"), 500 * 1024 * 1024);
  assert.equal(maxUploadBytes("video/quicktime"), 500 * 1024 * 1024);
  assert.equal(maxUploadBytes("image/jpeg"), 20 * 1024 * 1024);
  assert.equal(UPLOAD_LIMITS.dailyBytes, 3 * 1024 * 1024 * 1024);
});
