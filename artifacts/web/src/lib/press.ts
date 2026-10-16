import { basePath } from '@/lib/clerk';
import type { PressEntry } from '@workspace/api-client-react';

/** Prefix root-relative asset URLs with the app base path. Absolute URLs pass through. */
export function assetUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (basePath && url.startsWith(basePath + '/')) return url;
  return `${basePath}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export const PRESS_CATEGORY_LABELS: Record<PressEntry['category'], string> = {
  movement: 'The Movement',
  founder: 'Founder & CEO',
  editions: 'Editions & Programmes',
  humanitarian: 'Humanitarian',
};

/** The single outbound link an entry may offer, honestly labelled. */
export function outboundLink(e: Pick<PressEntry, 'sourceUrl' | 'websiteUrl'>): { href: string; label: string; direct: boolean } | null {
  const src = safeHttpUrl(e.sourceUrl);
  if (src) return { href: src, label: 'Read original', direct: true };
  const site = safeHttpUrl(e.websiteUrl);
  if (site) return { href: site, label: 'Visit publisher', direct: false };
  return null;
}

export function captureCount(n: number): string {
  return `${n} ${n === 1 ? 'capture' : 'captures'}`;
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 3).join('').toUpperCase();
}
