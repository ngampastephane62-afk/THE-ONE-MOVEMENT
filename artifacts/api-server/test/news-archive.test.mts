import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";
import { db, mediaItemsTable, networkUploads, pool } from "@workspace/db";
import { eq } from "drizzle-orm";

// Exercise the real route and database inside a rolled-back transaction.
// Only transport auth and file storage are mocked; no production auth is changed.
const require = createRequire(import.meta.url);
const globals = globalThis as any;
const output = await build({
  entryPoints: [new URL("../src/routes/newsArchive.ts", import.meta.url).pathname],
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{
    name: "isolated-news-fixture",
    setup(b) {
      b.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "db", namespace: "fixture" }));
      b.onResolve({ filter: /services\/networkAuth$/ }, () => ({ path: "auth", namespace: "fixture" }));
      b.onResolve({ filter: /services\/networkFiles$/ }, () => ({ path: "files", namespace: "fixture" }));
      b.onResolve({ filter: /^(express|drizzle-orm|@workspace\/api-zod)$/ }, args => ({ path: pathToFileURL(require.resolve(args.path)).href, external: true }));
      b.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({
        contents: args.path === "db" ? `
          export const db=globalThis.__pressTx;
          export const mediaItemsTable=globalThis.__pressTable;
          export const networkUploads=globalThis.__pressUploads;
        ` : args.path === "auth" ? `
          export class NetworkError extends Error { constructor(status,message){super(message);this.status=status;} }
          export function networkAuth(req,res,next){
            if(!req.headers['x-fixture-role']) return res.status(401).json({error:'Sign in'});
            res.locals.actor={founder:req.headers['x-fixture-role']==='founder',member:{id:0}};
            next();
          }
          export function requireFounder(res){if(!res.locals.actor?.founder) throw new NetworkError(403,'Founder only');}
          export function actor(res){return res.locals.actor;}
          export function networkWrite(req,res,next){next();}
        ` : `
          export async function ownedMedia(owner,ids=[]){
            if(ids.some(id=>id==='other-owner')) throw Object.assign(new Error('Not yours'),{status:400});
            return ids.map(id=>({id,contentType:id==='bad-type'?'application/pdf':'image/png'}));
          }
          export function objectFile(){return {download:async()=>[Buffer.from([137,80,78,71,13,10,26,10])]}};
        `,
        loader: "js",
      }));
    },
  }],
});
try {
  await db.transaction(async tx => {
    globals.__pressTx = tx;
    globals.__pressTable = mediaItemsTable;
    globals.__pressUploads = networkUploads;
    const { default: router } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0]!.text).toString("base64")}`);
    const app = express();
    app.use(express.json(), router);
    app.use((err: any, _req: any, res: any, _next: any) => res.status(err.status ?? 500).json({ error: err.message }));
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.once("listening", resolve));
    const addr = server.address() as { port: number };
    const base = `http://127.0.0.1:${addr.port}`;
    const request = async (path: string, method = "GET", body?: unknown, role = "founder") => {
      const r = await fetch(base + path, {
        method, headers: { "content-type": "application/json", ...(role ? { "x-fixture-role": role } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = r.headers.get("content-type")?.includes("application/json") ? await r.json() : await r.arrayBuffer();
      return { status: r.status, result, headers: r.headers };
    };
    const input = {
      title: "Isolated coverage fixture", outlet: "Test Publisher", summary: "A source-attributed summary for isolated testing.",
      category: "founder", dateLabel: "Historical archive", sourceUrl: "https://example.com/article",
      websiteUrl: "https://example.com", status: "draft", evidenceUploadIds: ["screenshot"],
      removeEvidenceIndexes: [], logoUploadId: "logo", removeLogo: false, publicAssetsConsent: true,
    };
    let id = 0;
    try {
      assert.equal((await request("/news/admin", "GET", undefined, "")).status, 401);
      assert.equal((await request("/news/admin", "POST", input, "member")).status, 403);
      assert.equal((await request("/news/admin", "POST", { ...input, websiteUrl: "javascript:alert(1)" })).status, 400);
      assert.equal((await request("/news/admin", "POST", { ...input, evidenceUploadIds: ["other-owner"] })).status, 400);
      assert.equal((await request("/news/admin", "POST", { ...input, evidenceUploadIds: ["bad-type"] })).status, 400);
      const created = await request("/news/admin", "POST", input);
      assert.equal(created.status, 201);
      id = created.result.id;
      assert.equal(created.result.status, "draft");
      assert.equal(created.result.evidenceUrls.length, 1);
      assert.ok(!(await request("/news")).result.some((r: any) => r.id === id));
      assert.equal((await request(`/news/${id}/assets/0`, "GET", undefined, "")).status, 401);
      const edit = { ...input, evidenceUploadIds: [], logoUploadId: undefined, status: "published" };
      assert.equal((await request(`/news/admin/${id}`, "PUT", { ...edit, publicAssetsConsent: false })).status, 400);
      assert.equal((await request(`/news/admin/${id}`, "PUT", { ...edit, removeLogo: true })).status, 400);
      const published = await request(`/news/admin/${id}`, "PUT", edit);
      assert.equal(published.status, 200);
      assert.equal(published.result.evidenceUrls.length, 1);
      assert.ok((await request("/news")).result.some((r: any) => r.id === id));
      const [stored] = await tx.select().from(mediaItemsTable).where(eq(mediaItemsTable.id, id));
      const meta = JSON.parse(stored!.body!);
      meta.evidence = [{ archive: "licence-01.webp" }];
      meta.logo = { archive: "licence-logo.png" };
      await tx.update(mediaItemsTable).set({ body: JSON.stringify(meta) }).where(eq(mediaItemsTable.id, id));
      assert.equal((await request(`/news/${id}/assets/0`, "GET", undefined, "")).status, 200);
      assert.equal((await request(`/news/${id}/assets/../secret`, "GET", undefined, "")).status, 404);
      const changed = await request(`/news/admin/${id}`, "PUT", { ...edit, title: "Edited record", evidenceUploadIds: ["replacement"], removeEvidenceIndexes: [0] });
      assert.equal(changed.status, 200);
      assert.equal(changed.result.title, "Edited record");
      assert.equal(changed.result.evidenceUrls.length, 1);
      assert.equal((await request(`/news/admin/${id}`, "PUT", { ...edit, removeEvidenceIndexes: [11] })).status, 400);
      assert.equal((await request(`/news/admin/${id}`, "PUT", { ...edit, status: "draft" })).status, 200);
      assert.ok(!(await request("/news")).result.some((r: any) => r.id === id));
      assert.equal((await request(`/news/${id}/assets/logo`, "GET", undefined, "")).status, 401);
      assert.equal((await request(`/news/admin/${id}`, "PUT", { ...edit, status: "archived" })).status, 200);
      assert.ok((await request("/news/admin")).result.some((r: any) => r.id === id && r.status === "archived"));
      assert.equal((await request("/news")).headers.get("cache-control"), "no-store");
      console.log("PASS: create/edit/publish/unpublish/archive, image privacy, permission guards, image validation, safe URLs and retained evidence.");
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
    throw new Error("ROLLBACK_NEWS_FIXTURE");
  });
} catch (error) {
  if (!(error instanceof Error) || error.message !== "ROLLBACK_NEWS_FIXTURE") throw error;
} finally {
  await pool.end();
}
