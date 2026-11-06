import type { NewsBlock, NewsFounderArticle, NewsSnapshot, NewsSnapshotCategory } from '@workspace/api-client-react';
import type { QueryClient } from '@tanstack/react-query';
import { basePath } from '@/lib/clerk';
import { UPLOAD_LIMITS } from '@workspace/shared';

export const NEWS_CATEGORIES: { value: NewsSnapshotCategory; label: string }[] = [
  { value: 'news', label: 'News' },
  { value: 'video-news', label: 'Video news' },
  { value: 'partnership-announcement', label: 'Partnership announcement' },
  { value: 'official-announcement', label: 'Official announcement' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'press-release', label: 'Press release' },
  { value: 'event-announcement', label: 'Event announcement' },
  { value: 'humanitarian-update', label: 'Humanitarian update' },
  { value: 'ecosystem-update', label: 'Ecosystem update' },
  { value: 'tropik-article', label: 'Tropik article' },
];
export const categoryLabel = (c: string) => NEWS_CATEGORIES.find((x) => x.value === c)?.label ?? c;

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const IMAGE_MAX = UPLOAD_LIMITS.fileBytes;
export const VIDEO_MAX = UPLOAD_LIMITS.videoBytes;
export const TROPIK_CATEGORY = 'tropik-article' as const satisfies NewsSnapshotCategory;

export function emptySnapshot(category: NewsSnapshotCategory = 'news'): NewsSnapshot {
  return {
    schemaVersion: 1, title: '', subtitle: null, category, cover: null, video: null, body: [],
    additionalImages: [], author: null, publicationDate: null, relatedPartnerKey: null, relatedProgrammeSlug: null,
    seoTitle: null, seoDescription: null, mediaRightsConfirmed: false,
  };
}

export function emptyBlock(type: NewsBlock['type']): NewsBlock | null {
  switch (type) {
    case 'paragraph': return { type, text: '' };
    case 'heading': return { type, level: 2, text: '' };
    case 'quote': return { type, text: '', attribution: null };
    case 'list': return { type, ordered: false, items: [''] };
    default: return null; // image blocks require an uploaded id
  }
}

/** Null when blank, trimmed otherwise. */
export const nn = (v: string) => (v.trim() === '' ? null : v);

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160);
}
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const founderMediaUrl = (id: string) => `${basePath}/api/founder/news/media/${encodeURIComponent(id)}`;
export const publicMediaUrl = (slug: string) => (id: string) => `${basePath}/api/news/articles/${encodeURIComponent(slug)}/media/${encodeURIComponent(id)}`;

export const YT_RE = /^[A-Za-z0-9_-]{11}$/;
export const VIMEO_RE = /^[1-9]\d{5,11}$/;
export function embedSrc(provider: 'youtube' | 'vimeo', id: string): string | null {
  if (provider === 'youtube' && YT_RE.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (provider === 'vimeo' && VIMEO_RE.test(id)) return `https://player.vimeo.com/video/${id}`;
  return null;
}

export function errMsg(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const x = e as { status?: number; data?: { error?: unknown } | null; message?: string } | null;
  const d = x?.data?.error;
  if (typeof d === 'string' && d) return d;
  if (x?.status === 409) return 'This article changed elsewhere. Reload it before saving again.';
  if (x?.status === 403) return 'Founder access is required for this action.';
  return fallback;
}

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', withTime ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' } : { day: 'numeric', month: 'long', year: 'numeric' });
}

export function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function localInputToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function articleTitle(a: NewsFounderArticle) {
  return (a.draft ?? a.published)?.title || 'Untitled article';
}
export function hasUnpublishedDraft(a: NewsFounderArticle) {
  return a.draftRevisionId != null && a.draftRevisionId !== a.publishedRevisionId;
}

export function invalidateNews(qc: QueryClient) {
  return qc.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && ((q.queryKey[0] as string).startsWith('/api/founder/news') || (q.queryKey[0] as string).startsWith('/api/news/articles')),
  });
}

export function snapshotIssues(s: NewsSnapshot): string[] {
  const out: string[] = [];
  if (!s.title.trim()) out.push('Add a title.');
  if (!s.author?.trim()) out.push('Add an author.');
  if (!s.body.some((b) => (b.type === 'list' ? b.items.some((x) => x.trim()) : b.type === 'image' || b.text.trim()))) out.push('Add at least one body block with content.');
  if (s.body.length > 150) out.push('The body is limited to 150 blocks.');
  if (s.additionalImages.length > 12) out.push('Additional images are limited to 12.');
  if (s.publicationDate && new Date(s.publicationDate).getTime() > Date.now() + 60000) out.push('The publication date cannot be in the future.');
  if ((s.cover || s.video || s.additionalImages.length || s.body.some((b) => b.type === 'image')) && !s.mediaRightsConfirmed) out.push('Confirm media rights before publishing.');
  if (s.video?.kind === 'embed' && !embedSrc(s.video.provider, s.video.videoId)) out.push('The video ID is not a valid YouTube or Vimeo ID.');
  if (s.cover && !s.cover.alt.trim()) out.push('Describe the cover image (alt text).');
  if (s.additionalImages.some((i) => !i.alt.trim()) || s.body.some((b) => b.type === 'image' && !b.alt.trim())) out.push('Every image needs alt text.');
  return out;
}
