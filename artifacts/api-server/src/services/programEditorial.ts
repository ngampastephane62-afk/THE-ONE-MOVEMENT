import { and, eq, sql } from "drizzle-orm";
import { db, mediaItemsTable } from "@workspace/db";
import { AMBASSADOR_NOMINEES } from "@workspace/shared";
import { SaveProgramEditorialBody, type ProgramEditorial, type ProgramPerson, type ProgramVideo } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";
import { ownedMedia } from "./networkFiles";
import { MEDIA_IMAGE_TYPES, MEDIA_IMAGE_MAX } from "./mediaCenterValidation";

export const PROGRAM_NAMES: Record<string, string> = {
  "diplomatic-gala": "THE ONE DIPLOMATIC GALA", summit: "THE ONE SUMMIT",
  "fashion-week": "THE ONE FASHION WEEK INTERNATIONAL", awards: "THE ONE AWARDS",
  "fashion-night": "THE ONE FASHION NIGHT", "investment-forum": "THE ONE INVESTMENT FORUM",
};
const DRAFT = "program-editorial-draft-v1", LIVE = "program-editorial-published-v1";
const archiveVideos: Record<string, string> = {
  "ciara-announcement": "/api/nominee-media/ciara-announcement.mp4",
  "mohombi-announcement": "/api/nominee-media/mohombi-announcement.mp4",
  "nancy-original": "/api/program-media/awards-nominees.mp4",
  "ciara-original": "/api/program-media/awards-ciara.mp4",
  "nancy-isime-supplied": "/api/program-media/nancy-isime-supplied.mp4",
  "ciara-supplied": "/api/program-media/ciara-supplied.mp4",
  "rosina-peace-supplied": "/api/program-media/rosina-peace-supplied.mp4",
  "awards-rosina-2027": "/api/program-media/awards-rosina-2027.mp4",
};
const video = (id: string, title: string, order = 0): ProgramVideo => ({
  id, title, description: "", credit: "Approved TOMI-supplied media",
  uploadId: null, assetKey: id, url: archiveVideos[id], published: true, rightsConfirmed: true, order,
});
export function programSlug(raw: unknown) {
  const slug = String(raw);
  if (!Object.hasOwn(PROGRAM_NAMES, slug)) throw new NetworkError(404, "Programme not found.");
  return slug;
}
export function defaultProgram(slug: string): ProgramEditorial {
  const people: ProgramPerson[] = slug === "awards" ? AMBASSADOR_NOMINEES.map((p, order) => ({
    id: p.slug, name: p.name, designation: p.role, biography: p.bio, kind: "nominee",
    confirmed: true, published: true, portraitKey: p.poster, portraitUploadId: null, portraitUrl: null,
    profileUrl: `/ambassadors/${p.slug}`, order,
    videos: p.slug === "ciara" ? [video("ciara-announcement", "Ciara · original announcement"), video("ciara-original", "Ciara · archive announcement", 1), video("ciara-supplied", "Ciara · Ambassador of Peace", 2)]
      : p.slug === "nancy-isime" ? [video("nancy-original", "Nancy Isime · original announcement"), video("nancy-isime-supplied", "Nancy Isime · Ambassador of Peace", 1)]
      : p.slug === "mohombi" ? [video("mohombi-announcement", "Mohombi · original announcement")] : [],
  })) : [];
  if (slug === "awards") people.push({
    id: "rosina", name: "Rosina", designation: "Producer, partner and speaker", biography: "",
    kind: "speaker", confirmed: true, published: true, portraitKey: null, portraitUploadId: null,
    portraitUrl: "/api/program-media/awards-rosina-2027.webp", profileUrl: null, order: 100,
    videos: [video("awards-rosina-2027", "Rosina · producer, partner and speaker"), video("rosina-peace-supplied", "Rosina · supplied peace and unity clip", 1)],
  });
  return {
    slug, updatedAt: null, status: "published", introduction: "", description: "", purpose: "", criteria: "",
    heroVideoUploadId: null, heroImageUploadId: null, heroVideoUrl: null, heroImageUrl: null,
    // The Fashion Week date was explicitly approved separately; the new Awards
    // brief requests coming-soon information instead of the former date.
    eventDate: slug === "fashion-week" ? "22 December 2026" : null, venue: "",
    eventDetailsConfirmed: slug === "fashion-week", announcement: "", photoCaptions: {},
    participationRoles: ["speaker", "exhibitor", "media", "partner", "sponsor", "collaborator"], people, media: [],
  };
}
type Conn = Pick<typeof db, "select">;
async function find(slug: string, type: string, conn: Conn = db) {
  const [row] = await conn.select().from(mediaItemsTable)
    .where(and(eq(mediaItemsTable.type, type), eq(mediaItemsTable.category, slug)));
  return row;
}
export async function programDocument(slug: string, admin = false, conn: Conn = db): Promise<ProgramEditorial> {
  const row = await find(slug, admin ? DRAFT : LIVE, conn);
  if (!row) return defaultProgram(slug);
  return { ...JSON.parse(row.body!), updatedAt: row.updatedAt.toISOString() };
}
export function referencedUploads(doc: ProgramEditorial, published = false) {
  const result = new Map<string, "image" | "video">();
  if (doc.heroImageUploadId) result.set(doc.heroImageUploadId, "image");
  if (doc.heroVideoUploadId) result.set(doc.heroVideoUploadId, "video");
  for (const p of doc.people.filter(p => !published || p.published)) {
    if (p.portraitUploadId) result.set(p.portraitUploadId, "image");
    for (const v of p.videos.filter(v => !published || v.published)) if (v.uploadId) result.set(v.uploadId, "video");
  }
  for (const v of doc.media.filter(v => !published || v.published)) if (v.uploadId) result.set(v.uploadId, "video");
  return result;
}
export function programDTO(doc: ProgramEditorial, admin = false): ProgramEditorial {
  const asset = (id: string) => `/api/program-editorial/${doc.slug}/assets/${id}?v=${encodeURIComponent(doc.updatedAt ?? "baseline")}`;
  const clip = (v: ProgramVideo): ProgramVideo => ({
    ...v, uploadId: admin ? v.uploadId : null,
    url: v.uploadId ? asset(v.uploadId) : v.assetKey ? archiveVideos[v.assetKey] ?? null : null,
  });
  return {
    ...doc, photoCaptions: doc.photoCaptions ?? {},
    heroImageUploadId: admin ? doc.heroImageUploadId : null, heroVideoUploadId: admin ? doc.heroVideoUploadId : null,
    heroImageUrl: doc.heroImageUploadId ? asset(doc.heroImageUploadId) : null,
    heroVideoUrl: doc.heroVideoUploadId ? asset(doc.heroVideoUploadId) : null,
    eventDate: admin || doc.eventDetailsConfirmed ? doc.eventDate : null,
    venue: admin || doc.eventDetailsConfirmed ? doc.venue : "",
    people: doc.people.filter(p => admin || (p.published && p.confirmed)).sort((a, b) => a.order - b.order).map(p => ({
      ...p, portraitUploadId: admin ? p.portraitUploadId : null,
      portraitUrl: p.portraitUploadId ? asset(p.portraitUploadId)
        : p.id === "rosina" ? "/api/program-media/awards-rosina-2027.webp" : null,
      videos: p.videos.filter(v => admin || (v.published && v.rightsConfirmed)).sort((a, b) => a.order - b.order).map(clip),
    })),
    media: doc.media.filter(v => admin || (v.published && v.rightsConfirmed)).sort((a, b) => a.order - b.order).map(clip),
  };
}
function unique(ids: string[]) {
  if (ids.length !== new Set(ids).size || ids.some(id => !/^[a-z0-9][a-z0-9-]{0,99}$/.test(id))) {
    throw new NetworkError(400, "Use distinct letters, numbers and hyphens for entry IDs.");
  }
}
export function editorialInput(raw: unknown, slug: string): { content: ProgramEditorial; expectedUpdatedAt: string | null } {
  const captions = (raw as { content?: { photoCaptions?: unknown } } | null)?.content?.photoCaptions;
  // Validate original keys before Zod can discard reserved object properties.
  if (captions && typeof captions === "object") {
    const allowed = slug === "fashion-night" ? /^fashion-night-archive-0[1-7]$/
      : slug === "summit" ? /^summit-encounters-0[1-8]$/ : null;
    const ids = Object.getOwnPropertyNames(captions);
    if (ids.length > 8 || ids.some(id => !allowed?.test(id))) {
      throw new NetworkError(400, "Choose a photograph belonging to this programme.");
    }
  }
  const parsed = SaveProgramEditorialBody.strict().safeParse(raw);
  if (!parsed.success) throw new NetworkError(400, "Check the programme fields and upload limits.");
  const { content: c, expectedUpdatedAt } = parsed.data;
  if (c.slug !== slug) throw new NetworkError(400, "The programme does not match this page.");
  if (c.photoCaptions !== undefined) {
    c.photoCaptions = Object.fromEntries(Object.entries(c.photoCaptions).map(([id, text]) => [id, text.trim()]));
  }
  unique(c.people.map(p => p.id));
  unique(c.media.map(v => v.id));
  c.participationRoles = [...new Set(c.participationRoles)];
  for (const p of c.people) {
    p.name = p.name.trim();
    if (!p.name) throw new NetworkError(400, "Enter the person's approved name.");
    if (p.kind === "nominee" && slug !== "awards") throw new NetworkError(400, "Awards nominees are separate from other programme participants.");
    if (p.published && !p.confirmed) throw new NetworkError(400, "Verify each person or appearance before publishing their profile.");
    if (p.published && !p.portraitUploadId && !p.portraitKey && p.id !== "rosina") throw new NetworkError(400, "Add the approved portrait before publishing a profile.");
    if (p.portraitKey && !AMBASSADOR_NOMINEES.some(a => a.poster === p.portraitKey && a.slug === p.id)) throw new NetworkError(400, "Upload this person's own approved portrait.");
    if (p.profileUrl) {
      if (!/^\/ambassadors\/[a-z0-9-]+$/.test(p.profileUrl)) {
        try { const url = new URL(p.profileUrl); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); }
        catch { throw new NetworkError(400, "Use an HTTPS or existing nominee profile link."); }
      }
    }
    unique(p.videos.map(v => v.id));
  }
  const clips = [...c.media, ...c.people.flatMap(p => p.videos)];
  for (const v of clips) {
    v.title = v.title.trim();
    if (!v.title || (!v.uploadId && !v.assetKey) || (v.uploadId && v.assetKey)) throw new NetworkError(400, "Attach one approved video source and enter its title.");
    if (v.assetKey && (slug !== "awards" || !Object.hasOwn(archiveVideos, v.assetKey))) throw new NetworkError(400, "This archive video does not belong to this programme.");
    if (v.published && (!v.rightsConfirmed || !v.credit.trim())) throw new NetworkError(400, "Confirm rights and credit before publishing a video.");
    v.url = null;
  }
  c.heroImageUrl = c.heroVideoUrl = null;
  for (const p of c.people) p.portraitUrl = null;
  return { content: c, expectedUpdatedAt };
}
export async function saveProgram(raw: unknown, slug: string, ownerId: number) {
  const { content, expectedUpdatedAt } = editorialInput(raw, slug);
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(17420730)`);
    const previous = await programDocument(slug, true, tx);
    if (previous.updatedAt !== expectedUpdatedAt) throw new NetworkError(409, "This programme changed elsewhere. Reload before saving; your changes were not overwritten.");
    // Older clients must not silently remove captions they do not yet edit.
    if (content.photoCaptions === undefined) content.photoCaptions = previous.photoCaptions ?? {};
    const oldUploads = referencedUploads(previous), next = referencedUploads(content);
    const changed = [...next.keys()].filter(id => !oldUploads.has(id));
    const files = changed.length ? await ownedMedia(ownerId, changed) : [];
    for (const f of files) {
      if (next.get(f.id) === "image" ? (!MEDIA_IMAGE_TYPES.has(f.contentType) || f.size > MEDIA_IMAGE_MAX)
        : (!["video/mp4", "video/webm", "video/quicktime"].includes(f.contentType) || f.size > 100 * 1024 * 1024)) {
        throw new NetworkError(400, "Use approved images up to 5 MB and videos up to 100 MB.");
      }
    }
    // A retained upload cannot change from an image into a video or vice versa.
    for (const [id, type] of next) if (oldUploads.has(id) && oldUploads.get(id) !== type) throw new NetworkError(400, "The upload type does not match this field.");
    const now = new Date(Math.max(Date.now(), previous.updatedAt ? Date.parse(previous.updatedAt) + 1 : 0));
    for (const type of content.status === "published" ? [DRAFT, LIVE] : [DRAFT]) {
      const row = await find(slug, type, tx);
      const fields = { type, category: slug, title: PROGRAM_NAMES[slug], body: JSON.stringify(content), status: content.status, updatedAt: now };
      if (row) await tx.update(mediaItemsTable).set(fields).where(eq(mediaItemsTable.id, row.id));
      else await tx.insert(mediaItemsTable).values(fields);
    }
    return { ...content, updatedAt: now.toISOString() };
  });
}
