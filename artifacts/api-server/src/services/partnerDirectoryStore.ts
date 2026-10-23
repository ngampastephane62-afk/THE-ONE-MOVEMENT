import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, mediaItemsTable } from "@workspace/db";
import type { PartnerOrganization, PartnerOrganizationSave, PartnerPageContent, PartnerPageContentSave } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";
import { ownedMedia } from "./networkFiles";
import { MEDIA_IMAGE_MAX, MEDIA_IMAGE_TYPES } from "./mediaCenterValidation";
import { BASE_REVISION, PARTNER_TYPE, PARTNER_CONTENT_TYPE, partnerCatalog, partnerPageDefaults, sortPartners } from "./partnerDirectoryCatalog";
import { normalizedOrganization, partnerInput, partnerContentInput } from "./partnerDirectoryValidation";

type Row = typeof mediaItemsTable.$inferSelect;
type Conn = Pick<typeof db, "select">;
type Stored = Omit<PartnerOrganization, "logoUrl" | "updatedAt">;
const namespace = inArray(mediaItemsTable.type, [PARTNER_TYPE, PARTNER_CONTENT_TYPE]);

function organization(row: Row): PartnerOrganization {
  const stored = JSON.parse(row.body!) as Stored;
  return {
    ...stored, updatedAt: row.updatedAt.toISOString(),
    logoUrl: stored.logoUploadId ? `/api/partner-directory/${stored.id}/logo?v=${row.updatedAt.getTime()}`
      : stored.legacyLogoId ? `/api/documentary/media/archive-partner-${String(stored.legacyLogoId).padStart(2, "0")}.webp` : null,
  };
}
/** Baselines are read-only source records; edits persist as overrides, never destructive migrations. */
export async function partnerState(conn: Conn = db) {
  const rows = await conn.select().from(mediaItemsTable).where(namespace);
  const merged = new Map(partnerCatalog.map(p => [p.id, p]));
  let content: PartnerPageContent = { ...partnerPageDefaults };
  for (const row of rows) {
    if (row.type === PARTNER_CONTENT_TYPE) {
      content = { ...JSON.parse(row.body!), updatedAt: row.updatedAt.toISOString() };
    } else {
      const p = organization(row);
      if (row.status === "deleted") merged.delete(p.id);
      else merged.set(p.id, p);
    }
  }
  return { rows, items: [...merged.values()].sort(sortPartners), content };
}
export function partnerDTO(p: PartnerOrganization, admin = false): PartnerOrganization {
  return { ...p, logoUploadId: admin ? p.logoUploadId : null };
}
export function partnerKey(raw: unknown) {
  const id = String(raw);
  if (!/^[a-z][a-z0-9-]{1,99}$/.test(id)) throw new NetworkError(404, "Organization not found.");
  return id;
}
function revision(actual: string, expected: unknown) {
  if (actual !== expected) throw new NetworkError(409, "This entry changed elsewhere. Your edits were not overwritten; reload the list and reopen the entry.");
}
async function validateLogo(p: PartnerOrganizationSave, ownerId: number, old?: PartnerOrganization) {
  const original = old && partnerCatalog.find(x => x.id === old.id);
  if (p.legacyLogoId && p.legacyLogoId !== old?.legacyLogoId && p.legacyLogoId !== original?.legacyLogoId) {
    throw new NetworkError(400, "Upload this organization's own approved logo instead of another organization's archive image.");
  }
  if (p.logoUploadId && p.logoUploadId !== old?.logoUploadId) {
    const files = await ownedMedia(ownerId, [p.logoUploadId]);
    if (files.some(f => !MEDIA_IMAGE_TYPES.has(f.contentType) || f.size > MEDIA_IMAGE_MAX)) throw new NetworkError(400, "Use a JPEG, PNG or WebP logo up to 5 MB.");
  }
}
export async function savePartner(raw: unknown, ownerId: number, target?: string) {
  const p = partnerInput(raw);
  return db.transaction(async tx => {
    // A shared transaction lock protects name uniqueness AND first edits of virtual baselines.
    await tx.execute(sql`select pg_advisory_xact_lock(17420728)`);
    const state = await partnerState(tx);
    const old = target ? state.items.find(x => x.id === partnerKey(target)) : undefined;
    if (target && !old) throw new NetworkError(404, "Organization not found.");
    if (old) revision(old.updatedAt, p.expectedUpdatedAt);
    else if (p.expectedUpdatedAt !== null) throw new NetworkError(409, "Create a new organization without an existing revision.");
    const key = normalizedOrganization(p.name);
    if (state.items.some(x => x.id !== old?.id && normalizedOrganization(x.name) === key)) throw new NetworkError(409, "This organization already exists, possibly as a review draft. Edit the existing entry instead.");
    await validateLogo(p, ownerId, old);
    const { expectedUpdatedAt, ...fields } = p;
    const id = old?.id ?? `custom-${randomUUID()}`;
    const previous = state.rows.find(r => r.type === PARTNER_TYPE && (JSON.parse(r.body!) as Stored).id === id);
    const now = new Date(Math.max(Date.now(), (previous?.updatedAt.getTime() ?? 0) + 1));
    const data = { title: p.name, category: p.category, type: PARTNER_TYPE, body: JSON.stringify({ ...fields, id }), status: p.status, updatedAt: now };
    const [row] = previous
      ? await tx.update(mediaItemsTable).set(data).where(and(eq(mediaItemsTable.id, previous.id), eq(mediaItemsTable.type, PARTNER_TYPE))).returning()
      : await tx.insert(mediaItemsTable).values(data).returning();
    return organization(row!);
  });
}
export async function removePartner(target: string, expected: string) {
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(17420728)`);
    const state = await partnerState(tx);
    const old = state.items.find(x => x.id === partnerKey(target));
    if (!old) throw new NetworkError(404, "Organization not found.");
    revision(old.updatedAt, expected);
    const previous = state.rows.find(r => r.type === PARTNER_TYPE && (JSON.parse(r.body!) as Stored).id === old.id);
    const { logoUrl, updatedAt, ...stored } = old;
    const data = {
      title: old.name, category: old.category, type: PARTNER_TYPE, status: "deleted",
      body: JSON.stringify({ ...stored, status: "archived" }),
      updatedAt: new Date(Math.max(Date.now(), (previous?.updatedAt.getTime() ?? 0) + 1)),
    };
    if (previous) await tx.update(mediaItemsTable).set(data).where(and(eq(mediaItemsTable.id, previous.id), eq(mediaItemsTable.type, PARTNER_TYPE)));
    else await tx.insert(mediaItemsTable).values(data);
  });
}
export async function savePartnerContent(raw: unknown) {
  const p: PartnerPageContentSave = partnerContentInput(raw);
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(17420728)`);
    const state = await partnerState(tx);
    revision(state.content.updatedAt, p.expectedUpdatedAt);
    const previous = state.rows.find(r => r.type === PARTNER_CONTENT_TYPE);
    const { expectedUpdatedAt, ...content } = p;
    const updatedAt = new Date(Math.max(Date.now(), (previous?.updatedAt.getTime() ?? 0) + 1));
    const data = { title: "Partners page copy", type: PARTNER_CONTENT_TYPE, status: "published", body: JSON.stringify(content), updatedAt };
    if (previous) await tx.update(mediaItemsTable).set(data).where(and(eq(mediaItemsTable.id, previous.id), eq(mediaItemsTable.type, PARTNER_CONTENT_TYPE)));
    else await tx.insert(mediaItemsTable).values(data);
    return { ...content, updatedAt: updatedAt.toISOString() };
  });
}
