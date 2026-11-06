import { and, eq, sql } from "drizzle-orm";
import { db, mediaItemsTable as documents, auditLogTable as audit } from "@workspace/db";
import { SITE_EDITABLE_PAGES } from "@workspace/shared";
import { SaveSitePageBody, type SitePageDocument } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";

const DRAFT = "site-copy-draft-v1", LIVE = "site-copy-published-v1";
export function editablePageKey(raw: unknown) {
  const key = String(raw);
  if (!SITE_EDITABLE_PAGES.some(p => p.key === key)) throw new NetworkError(404, "Page not found.");
  return key;
}
type Reader = Pick<typeof db, "select">;
async function find(key: string, type: string, conn: Reader = db) {
  const [row] = await conn.select().from(documents).where(and(eq(documents.type, type), eq(documents.category, key)));
  return row;
}
export async function sitePageDocument(key: string, founder = false, conn: Reader = db): Promise<SitePageDocument> {
  const row = (founder ? await find(key, DRAFT, conn) : null) ?? await find(key, LIVE, conn);
  if (!row) return { pageKey: key, updatedAt: null, status: "published", copies: [] };
  return { ...JSON.parse(row.body!), pageKey: key, updatedAt: row.updatedAt.toISOString() };
}
export function parseSiteCopy(raw: unknown, key: string) {
  const result = SaveSitePageBody.strict().safeParse(raw);
  if (!result.success || result.data.content.pageKey !== key) throw new NetworkError(400, "Invalid page copy.");
  const input = result.data;
  const languages = new Set<string>();
  let length = 0;
  for (const copy of input.content.copies) {
    if (languages.has(copy.language)) throw new NetworkError(400, "A language may appear only once.");
    languages.add(copy.language);
    const sources = new Set<string>();
    for (const entry of copy.entries) {
      entry.source = entry.source.replace(/\s+/g, " ").trim();
      if (!entry.source || sources.has(entry.source)) throw new NetworkError(400, "Empty or duplicate original text.");
      sources.add(entry.source);
      length += entry.source.length + entry.value.length;
    }
  }
  if (length > 1_000_000) throw new NetworkError(400, "This page contains too much editorial text.");
  return input;
}
export async function saveSiteCopy(key: string, raw: unknown, clerkId: string) {
  const input = parseSiteCopy(raw, key);
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"site-copy:" + key}))`);
    const current = await sitePageDocument(key, true, tx);
    if (current.updatedAt !== input.expectedUpdatedAt) throw new NetworkError(409, "This page changed in another session. Your local edits have not been overwritten.");
    const updatedAt = new Date(Math.max(Date.now(), Date.parse(current.updatedAt ?? "") + 1 || 0));
    const content: SitePageDocument = { ...input.content, updatedAt: updatedAt.toISOString() };
    const types = content.status === "published" ? [DRAFT, LIVE] : [DRAFT];
    for (const type of types) {
      const existing = await find(key, type, tx);
      const values = { title: `Page copy · ${key}`, category: key, type, body: JSON.stringify(content),
        status: content.status, updatedAt, ...(type === LIVE ? { publishedAt: updatedAt } : {}) };
      if (existing) await tx.update(documents).set(values).where(eq(documents.id, existing.id));
      else await tx.insert(documents).values(values);
    }
    await tx.insert(audit).values({ action: `site_copy.${content.status === "published" ? "publish" : "save_draft"}`,
      targetType: "site_page", details: { actorClerkId: clerkId, pageKey: key, updatedAt: content.updatedAt } });
    return content;
  });
}
