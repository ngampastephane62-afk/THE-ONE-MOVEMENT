import { and, eq, sql } from "drizzle-orm";
import { db, mediaItemsTable } from "@workspace/db";
import { defaultHomeEditorial, type HomeEditorial, type HomeMedia } from "@workspace/shared";
import { SaveHomeEditorialBody } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";
import { ownedMedia } from "./networkFiles";
import { MEDIA_IMAGE_TYPES, MEDIA_IMAGE_MAX } from "./mediaCenterValidation";

const DRAFT = "home-editorial-draft-v1", LIVE = "home-editorial-published-v1";
type Conn = Pick<typeof db, "select">;
async function find(type: string, conn: Conn = db) {
  const [row] = await conn.select().from(mediaItemsTable)
    .where(and(eq(mediaItemsTable.type, type), eq(mediaItemsTable.category, "home")));
  return row;
}
export async function homeDocument(admin = false, conn: Conn = db): Promise<HomeEditorial> {
  const row = await find(admin ? DRAFT : LIVE, conn);
  if (!row) return defaultHomeEditorial();
  return { ...JSON.parse(row.body!), updatedAt: row.updatedAt.toISOString() };
}
export function homeUploads(doc: HomeEditorial, publicOnly = false) {
  const result = new Map<string, HomeMedia["kind"]>();
  for (const section of doc.sections) {
    if (publicOnly && !section.enabled) continue;
    for (const media of section.media) {
      const existing = result.get(media.uploadId);
      if (existing && existing !== media.kind) throw new NetworkError(400, "A file cannot be both image and video.");
      result.set(media.uploadId, media.kind);
    }
  }
  return result;
}
export function homeDTO(doc: HomeEditorial, admin = false): HomeEditorial {
  return {
    ...doc,
    sections: doc.sections.filter(s => admin || s.enabled).map(s => ({
      ...s,
      media: s.media.map(m => ({
        ...m,
        url: `/api/home-editorial/assets/${m.uploadId}?v=${encodeURIComponent(doc.updatedAt ?? "baseline")}`,
      })),
    })),
  };
}
export function safeHomeLink(raw: string) {
  if (!raw) return true;
  if (/[\u0000-\u0020\\]/.test(raw)) return false;
  if (raw.startsWith("#")) return true;
  if (raw.startsWith("/") && !raw.startsWith("//")) return true;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}
export function homeInput(raw: unknown) {
  // Zod record parsing may omit reserved keys, so inspect the original map first.
  const original = raw as { content?: { sections?: Array<{ fields?: unknown }> } } | null;
  if (Array.isArray(original?.content?.sections)) {
    for (const section of original.content.sections) {
      if (!section || !section.fields || typeof section.fields !== "object" || Array.isArray(section.fields)) continue;
      const keys = Object.keys(section.fields);
      if (keys.length > 100 || keys.some(k => !/^[a-zA-Z][a-zA-Z0-9_.-]{0,99}$/.test(k) || ["__proto__", "constructor", "prototype"].includes(k))) {
        throw new NetworkError(400, "Invalid homepage field name.");
      }
    }
  }
  const parsed = SaveHomeEditorialBody.safeParse(raw);
  if (!parsed.success) throw new NetworkError(400, "Invalid homepage document.");
  const { content, expectedUpdatedAt } = parsed.data;
  const ids = new Set<string>(), builtins = new Set<string>();
  for (const section of content.sections) {
    if (ids.has(section.id) || (section.type !== "custom" && builtins.has(section.type))) throw new NetworkError(400, "Each section must be unique.");
    ids.add(section.id);
    if (section.type !== "custom") builtins.add(section.type);
    const mediaKeys = new Set<string>();
    for (const [key, value] of Object.entries(section.fields)) {
      if (key === "primaryHref" && value === "auto" && ["hero", "join"].includes(section.type)) continue;
      if (/(href|url|link|target)$/i.test(key) && !safeHomeLink(value)) throw new NetworkError(400, "Use a local page link or a secure https link.");
    }
    for (const media of section.media) {
      if (mediaKeys.has(media.key)) throw new NetworkError(400, "Each media position must be unique.");
      mediaKeys.add(media.key);
      if (content.status === "published" && section.enabled &&
        (!media.rightsConfirmed || !media.credit.trim() || (media.kind === "image" && !media.alt.trim()))) {
        throw new NetworkError(400, "Confirm media rights, credits and image descriptions before publishing.");
      }
      // Client URLs are never trusted or persisted as file sources.
      media.url = null;
    }
  }
  if (content.status === "published" && !content.sections.some(s => s.enabled)) throw new NetworkError(400, "Keep at least one visible homepage section.");
  homeUploads(content);
  return { content, expectedUpdatedAt };
}
export async function saveHome(raw: unknown, ownerId: number) {
  const { content, expectedUpdatedAt } = homeInput(raw);
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(17420731)`);
    const previous = await homeDocument(true, tx);
    if (previous.updatedAt !== expectedUpdatedAt) throw new NetworkError(409, "The homepage changed elsewhere. Reload before saving; your draft was not overwritten.");
    const old = homeUploads(previous), next = homeUploads(content);
    for (const [id, kind] of next) {
      if (old.has(id) && old.get(id) !== kind) throw new NetworkError(400, "The file type cannot change.");
    }
    const added = [...next.keys()].filter(id => !old.has(id));
    const files = added.length ? await ownedMedia(ownerId, added) : [];
    for (const f of files) {
      if (next.get(f.id) === "image" ? (!MEDIA_IMAGE_TYPES.has(f.contentType) || f.size > MEDIA_IMAGE_MAX)
        : (!["video/mp4", "video/webm", "video/quicktime"].includes(f.contentType) || f.size > 100 * 1024 * 1024)) {
        throw new NetworkError(400, "Use approved images up to 5 MB or videos up to 100 MB.");
      }
    }
    // Never trust a client-supplied revision embedded in the content.
    const now = new Date(Math.max(Date.now(), previous.updatedAt ? Date.parse(previous.updatedAt) + 1 : 0));
    const document: HomeEditorial = { ...content, updatedAt: now.toISOString() };
    for (const type of content.status === "published" ? [DRAFT, LIVE] : [DRAFT]) {
      const row = await find(type, tx);
      const fields = { type, category: "home", title: "Homepage", body: JSON.stringify(document), status: content.status, updatedAt: now };
      if (row) await tx.update(mediaItemsTable).set(fields).where(eq(mediaItemsTable.id, row.id));
      else await tx.insert(mediaItemsTable).values(fields);
    }
    return document;
  });
}
