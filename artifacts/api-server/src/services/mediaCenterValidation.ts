import { CreateMediaPublicationBody, type MediaPublicationSave } from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";

export const MEDIA_CENTER_TYPE = "media-center-publication-v1";
export const MEDIA_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MEDIA_IMAGE_MAX = 5 * 1024 * 1024;

export function validPublicationDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function mediaPublicationInput(raw: unknown): MediaPublicationSave {
  const embed = raw && typeof raw === "object" && "embed" in raw ? raw.embed : null;
  if (embed && typeof embed === "object" && Object.keys(embed).some((k) => !["provider", "videoId"].includes(k))) {
    throw new NetworkError(400, "Unsupported video embed fields.");
  }
  const parsed = CreateMediaPublicationBody.strict().safeParse(raw);
  if (!parsed.success) throw new NetworkError(400, "Check the publication fields and try again.");
  const p = parsed.data;
  p.title = p.title.trim();
  p.publisher = p.publisher.trim();
  p.description = p.description.trim();
  p.externalUrl = p.externalUrl.trim();
  p.instagramUrl = p.instagramUrl.trim();
  if (p.title.length < 2) throw new NetworkError(400, "Enter a title with at least two characters.");
  if (p.externalUrl) {
    let url: URL;
    try { url = new URL(p.externalUrl); } catch { throw new NetworkError(400, "Enter a full public http:// or https:// publication link."); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) {
      throw new NetworkError(400, "Use a public http:// or https:// link without credentials.");
    }
    p.externalUrl = url.toString();
  }
  if (p.instagramUrl) {
    let url: URL;
    try { url = new URL(p.instagramUrl); } catch { throw new NetworkError(400, "Enter a full Instagram post or reel link."); }
    if (url.protocol !== "https:" || !["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase()) || url.username || url.password) {
      throw new NetworkError(400, "Use a public https://www.instagram.com link without credentials.");
    }
    p.instagramUrl = url.toString();
  }
  if (p.embed) {
    if (Object.keys(p.embed).some((k) => !["provider", "videoId"].includes(k))) throw new NetworkError(400, "Unsupported video embed fields.");
    const pattern = p.embed.provider === "youtube" ? /^[A-Za-z0-9_-]{11}$/ : /^[1-9]\d{5,11}$/;
    if (!pattern.test(p.embed.videoId)) throw new NetworkError(400, "Enter a valid YouTube or Vimeo video ID.");
  }
  if (p.publicationDate && !validPublicationDate(p.publicationDate)) throw new NetworkError(400, "Enter a real publication date.");
  if (p.status === "published" && (p.description.length < 10 || !validPublicationDate(p.publicationDate) || !p.rightsConfirmed)) {
    throw new NetworkError(400, "Publishing requires a description, a publication date and confirmed media rights.");
  }
  if ((p.coverUploadId || p.logoUploadId) && !p.rightsConfirmed) {
    throw new NetworkError(400, "Confirm your permission to use the cover and publisher logo.");
  }
  return p;
}

export function mediaRevision(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) throw new NetworkError(409, "Reload the saved publication before changing it.");
  return new Date(value);
}
