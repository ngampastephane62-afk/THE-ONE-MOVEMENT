import type { QueryClient } from '@tanstack/react-query';
import {
  MediaPublicationCategory, getGetMediaPublicationsQueryKey, getGetAdminMediaPublicationsQueryKey,
  type MediaPublication, type MediaPublicationSave, type MediaPublicationEmbed,
} from '@workspace/api-client-react';
import { YT_RE, VIMEO_RE, embedSrc } from '@/lib/news-cms';

export const CATEGORY_LABEL: Record<MediaPublicationCategory, string> = {
  'international-press': 'International press',
  television: 'Television',
  magazine: 'Magazine',
  newspaper: 'Newspaper',
  interview: 'Interview',
  'press-release': 'Press release',
  'official-announcement': 'Official announcement',
  'media-partnership': 'Media partnership',
};
export const CATEGORIES = Object.values(MediaPublicationCategory) as MediaPublicationCategory[];

export const MEDIA_IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MEDIA_IMG_MAX = 5 * 1024 * 1024;
export function checkMediaImage(f: File): string | null {
  if (!MEDIA_IMG_TYPES.includes(f.type)) return 'Use a PNG, JPEG or WEBP image.';
  if (f.size > MEDIA_IMG_MAX) return 'Images must be 5 MB or less.';
  return null;
}

/** Accepts a YouTube/Vimeo URL or bare ID. Returns null if not a valid embed. */
export function parseEmbed(input: string): MediaPublicationEmbed | null {
  const s = input.trim();
  if (!s) return null;
  if (YT_RE.test(s)) return { provider: 'youtube', videoId: s };
  if (VIMEO_RE.test(s)) return { provider: 'vimeo', videoId: s };
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const h = u.hostname.replace(/^www\.|^m\./, '');
  let id = '';
  if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
    id = u.searchParams.get('v') ?? '';
    const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
    if (!id && m) id = m[2];
  } else if (h === 'vimeo.com' || h === 'player.vimeo.com') {
    const m = u.pathname.match(/(\d{6,12})(?:\/|$)/);
    if (m && VIMEO_RE.test(m[1])) return { provider: 'vimeo', videoId: m[1] };
    return null;
  }
  return YT_RE.test(id) ? { provider: 'youtube', videoId: id } : null;
}
export const embedToInput = (e: MediaPublicationEmbed | null) =>
  !e ? '' : e.provider === 'youtube' ? `https://www.youtube.com/watch?v=${e.videoId}` : `https://vimeo.com/${e.videoId}`;
export const safeEmbedSrc = (e: MediaPublicationEmbed | null) => (e ? embedSrc(e.provider, e.videoId) : null);

export function safeHttpUrl(v: string): string | null {
  try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch { return null; }
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function validDate(v: string) {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
export function formatPubDate(v: string) {
  if (!validDate(v)) return '';
  return new Date(`${v}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export interface MediaForm {
  title: string; publisher: string; description: string; category: MediaPublicationCategory;
  publicationDate: string; externalUrl: string; embedInput: string; priority: string;
  coverUploadId: string | null; logoUploadId: string | null; rightsConfirmed: boolean;
}
export function emptyForm(): MediaForm {
  return { title: '', publisher: '', description: '', category: 'international-press', publicationDate: '', externalUrl: '', embedInput: '', priority: '100', coverUploadId: null, logoUploadId: null, rightsConfirmed: false };
}
export function formFrom(p: MediaPublication): MediaForm {
  return { title: p.title, publisher: p.publisher, description: p.description, category: p.category, publicationDate: p.publicationDate, externalUrl: p.externalUrl, embedInput: embedToInput(p.embed), priority: String(p.priority), coverUploadId: p.coverUploadId, logoUploadId: p.logoUploadId, rightsConfirmed: p.rightsConfirmed };
}

export function formIssues(f: MediaForm, status: MediaPublicationSave['status']): string[] {
  const out: string[] = [];
  const t = f.title.trim();
  if (t.length < 2 || t.length > 240) out.push('Title must be 2 to 240 characters.');
  if (f.publisher.length > 140) out.push('Publisher must be 140 characters or fewer.');
  if (f.description.length > 6000) out.push('Description must be 6,000 characters or fewer.');
  if (f.externalUrl.trim() && !safeHttpUrl(f.externalUrl.trim())) out.push('Publication link must start with http:// or https://.');
  if (f.embedInput.trim() && !parseEmbed(f.embedInput)) out.push('Video must be a valid YouTube or Vimeo link.');
  const pr = Number(f.priority);
  if (!Number.isInteger(pr) || pr < 0 || pr > 100000) out.push('Order must be a whole number from 0 to 100000.');
  if (f.publicationDate && !validDate(f.publicationDate)) out.push('Publication date is not valid.');
  if (status === 'published') {
    if (f.description.trim().length < 10) out.push('Publishing needs a description of at least 10 characters.');
    if (!validDate(f.publicationDate)) out.push('Publishing needs a publication date.');
    if (!f.rightsConfirmed) out.push('Publishing needs the image and content rights confirmation.');
  }
  return out;
}

export function toSave(f: MediaForm, status: MediaPublicationSave['status'], expectedUpdatedAt: string | null): MediaPublicationSave {
  return {
    title: f.title.trim(), publisher: f.publisher.trim(), description: f.description.trim(), category: f.category,
    publicationDate: f.publicationDate, externalUrl: f.externalUrl.trim(), embed: parseEmbed(f.embedInput),
    priority: Number(f.priority), status, coverUploadId: f.coverUploadId, logoUploadId: f.logoUploadId,
    rightsConfirmed: f.rightsConfirmed, expectedUpdatedAt,
  };
}

/** Invalidates every page of both public and founder lists (prefix match). */
export function invalidateMediaCenter(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: getGetMediaPublicationsQueryKey() });
  qc.invalidateQueries({ queryKey: getGetAdminMediaPublicationsQueryKey() });
}

export function mediaErr(e: unknown, fallback = 'Not saved. Your edits are kept; please try again.') {
  const x = e as { status?: number; data?: { error?: unknown } | null } | null;
  if (x?.status === 409) return 'This publication changed elsewhere. Your edits are kept here; reload the list to get the latest version before saving again.';
  if (x?.status === 403 || x?.status === 401) return 'Founder access is required for this action.';
  const d = x?.data?.error;
  return typeof d === 'string' && d ? d : fallback;
}
