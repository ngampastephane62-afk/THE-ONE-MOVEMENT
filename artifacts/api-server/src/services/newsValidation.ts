import { RunFounderNewsActionBody, RequestFounderNewsUploadBody, type NewsActionInput, type NewsSnapshot } from "@workspace/api-zod";
import { PARTNER_INTRODUCTION_TARGETS, PROGRAM_SLUGS } from "@workspace/shared";

export class NewsError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function fail(message: string): never { throw new NewsError(400, message); }
const keys = (value: object, allowed: string[]) => {
  if (Object.keys(value).some(key => !allowed.includes(key))) fail("Unknown content fields are not allowed.");
};
export const reservedNewsSlugs = new Set(["pink-october-burj-khalifa", "coverage", "articles", "admin"]);
const partnerKeys = new Set(PARTNER_INTRODUCTION_TARGETS.map(p => String(p.id)));
const programmeKeys = new Set<string>(PROGRAM_SLUGS);

export function parseNewsAction(raw: unknown): NewsActionInput {
  // Explicitly inspect nested objects before Zod can strip unknown keys.
  if (typeof raw === "object" && raw && "snapshot" in raw) {
    const s = raw.snapshot;
    if (typeof s === "object" && s) {
      keys(s, ["schemaVersion", "title", "subtitle", "category", "cover", "video", "body", "additionalImages", "author", "publicationDate", "relatedPartnerKey", "relatedProgrammeSlug", "seoTitle", "seoDescription", "mediaRightsConfirmed"]);
      const v = s as Record<string, unknown>;
      const images = [v.cover, ...(Array.isArray(v.additionalImages) ? v.additionalImages : [])];
      for (const img of images) if (img && typeof img === "object") keys(img, ["uploadId", "alt", "credit"]);
      if (v.video && typeof v.video === "object") {
        keys(v.video, "kind" in v.video && v.video.kind === "upload" ? ["kind", "uploadId"] : ["kind", "provider", "videoId"]);
      }
      const blockKeys: Record<string, string[]> = {
        paragraph: ["type", "text"], heading: ["type", "level", "text"],
        quote: ["type", "text", "attribution"], list: ["type", "ordered", "items"],
        image: ["type", "uploadId", "alt", "credit", "caption"],
      };
      for (const block of Array.isArray(v.body) ? v.body : []) {
        if (block && typeof block === "object") keys(block, blockKeys[String(block.type)] ?? []);
      }
    }
  }
  const parsed = RunFounderNewsActionBody.strict().safeParse(raw);
  if (!parsed.success) fail("Invalid editorial content. Check required fields and field length limits.");
  const data = parsed.data;
  if (data.action === "create") {
    if (data.id !== null || data.version !== 0 || !data.slug || !data.snapshot || data.revisionId !== null) fail("Invalid new draft request.");
  } else {
    if (!data.id) fail("Select an article first.");
    if (data.action === "save") {
      if (!data.snapshot || !data.slug || data.revisionId !== null) fail("A saved draft requires content and a slug.");
    } else if (data.snapshot !== null || data.slug !== null || (data.action === "restore" ? !data.revisionId : data.revisionId !== null)) {
      fail("Lifecycle actions must reference a saved version, not unsaved content.");
    }
  }
  if (data.slug && reservedNewsSlugs.has(data.slug)) fail("This slug is reserved for existing News content.");
  if (data.snapshot) {
    data.snapshot.title = data.snapshot.title.trim();
    data.snapshot.author = data.snapshot.author?.trim() || null;
    validateNewsSnapshot(data.snapshot);
  }
  return data;
}

export function validateNewsSnapshot(s: NewsSnapshot, publish = false, now = Date.now()) {
  const textLength = s.body.reduce((n, b) => n + (
    b.type === "list" ? b.items.join("").length :
    b.type === "image" ? (b.caption?.length ?? 0) + b.alt.length + (b.credit?.length ?? 0) :
    b.text.length + (b.type === "quote" ? b.attribution?.length ?? 0 : 0)
  ), 0);
  if (textLength > 100_000) fail("Article text is limited to 100,000 characters.");
  if (s.relatedPartnerKey && !partnerKeys.has(s.relatedPartnerKey)) fail("Choose an existing partner.");
  if (s.relatedProgrammeSlug && !programmeKeys.has(s.relatedProgrammeSlug)) fail("Choose an existing programme.");
  if (s.publicationDate && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s.publicationDate) || !Number.isFinite(Date.parse(s.publicationDate)))) {
    fail("Use a valid publication date with a timezone.");
  }
  if (s.publicationDate) {
    const [year, month, day] = s.publicationDate.slice(0, 10).split("-").map(Number);
    if (year < 1000 || day < 1 || month < 1 || month > 12 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || Number(s.publicationDate.slice(11, 13)) > 23) {
      fail("Use a real calendar date and time.");
    }
  }
  if (s.video?.kind === "embed") {
    const valid = s.video.provider === "youtube" ? /^[A-Za-z0-9_-]{11}$/.test(s.video.videoId) : /^[1-9]\d{5,11}$/.test(s.video.videoId);
    if (!valid) fail("Use a valid YouTube or Vimeo video identifier, not HTML or an arbitrary URL.");
  }
  if (!publish) return;
  if (!s.title.trim() || !s.author?.trim()) fail("A title and author are required to publish.");
  const hasBody = s.body.some(b => b.type === "list" ? b.items.some(item => item.trim()) : b.type !== "image" && b.text.trim());
  if (!hasBody && !(s.category === "video-news" && s.video)) fail("Write article content, or attach a video for video news.");
  if (s.category === "video-news" && !s.video) fail("Video news requires a video.");
  if (s.publicationDate && Date.parse(s.publicationDate) > now) fail("Future publication dates are not supported. Save a draft instead.");
  const images = [...(s.cover ? [s.cover] : []), ...s.additionalImages, ...s.body.filter(b => b.type === "image")];
  if (images.some(image => !image.alt.trim())) fail("Add alternative text to every image before publishing.");
  if ((images.length || s.video) && !s.mediaRightsConfirmed) fail("Confirm permission to publish these images and videos.");
}

export function newsMediaReferences(s: NewsSnapshot) {
  return [
    ...(s.cover ? [{ id: s.cover.uploadId, kind: "image" }] : []),
    ...s.additionalImages.map(i => ({ id: i.uploadId, kind: "image" })),
    ...s.body.flatMap(b => b.type === "image" ? [{ id: b.uploadId, kind: "image" }] : []),
    ...(s.video?.kind === "upload" ? [{ id: s.video.uploadId, kind: "video" }] : []),
  ];
}

export function isEditorialUpload(row: { objectPath: string; ownerId: number; id: string }) {
  return row.objectPath.endsWith(`/news/${row.ownerId}/${row.id}`);
}

export function parseNewsUpload(raw: unknown) {
  const result = RequestFounderNewsUploadBody.strict().safeParse(raw);
  if (!result.success) fail("Choose an allowed image or video.");
  if (result.data.contentType.startsWith("image/") && result.data.size > 20 * 1024 * 1024) fail("Images are limited to 20 MiB.");
  return result.data;
}
