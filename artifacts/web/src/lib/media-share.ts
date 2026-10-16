import { useEffect, useRef } from 'react';

/** Stable, URL-safe anchor id derived from a media identity (djb2 hash). */
export function mediaAnchorId(source: string) {
  let h = 5381;
  for (let i = 0; i < source.length; i++) h = ((h << 5) + h + source.charCodeAt(i)) >>> 0;
  return `media-${h.toString(36)}`;
}

/** Canonical photo source: base-path-free, leading slash, no query/hash. */
export function canonicalMediaSource(src: string) {
  const base = import.meta.env.BASE_URL || '/';
  let s = src;
  try { const u = new URL(src, window.location.origin); if (u.origin === window.location.origin) s = u.pathname; } catch { /* keep */ }
  if (base !== '/' && s.startsWith(base)) s = `/${s.slice(base.length)}`;
  return s.split(/[?#]/, 1)[0];
}

function pageUrl() {
  const u = new URL(window.location.href);
  u.search = ''; u.hash = '';
  return u;
}

export function videoShareUrl(videoId: string) {
  const u = pageUrl();
  u.searchParams.set('video', videoId); u.hash = `video-${videoId}`;
  return u.toString();
}

export function mediaShareUrl(source: string) {
  const u = pageUrl();
  u.searchParams.set('media', source); u.hash = mediaAnchorId(source);
  return u.toString();
}

/** True when the current URL targets this media (query param or hash). */
export function isDeepLinked(target: { videoId?: string; source?: string }) {
  if (typeof window === 'undefined') return false;
  const p = new URLSearchParams(window.location.search);
  if (target.videoId) return p.get('video') === target.videoId || window.location.hash === `#video-${target.videoId}`;
  if (target.source) return p.get('media') === target.source || window.location.hash === `#${mediaAnchorId(target.source)}`;
  return false;
}

/**
 * Scrolls the referenced element into view and moves focus to it once when the
 * page is opened from a share link. Retries briefly while lazy layout settles.
 */
export function useDeepLinkFocus<T extends HTMLElement>(target: { videoId?: string; source?: string }) {
  const ref = useRef<T>(null);
  const key = target.videoId ?? target.source ?? '';
  useEffect(() => {
    if (!key || !isDeepLinked(target)) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = [80, 600, 1500].map((ms) => window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      if (ms === 80) { el.setAttribute('data-deeplinked', 'true'); el.focus({ preventScroll: true }); }
    }, ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return ref;
}

/** Stable source for bundled programme photos (bundler URLs are hashed). */
export const programAssetSource = (file: string) => `/assets/media/programs/${file}`;

/** Index of the deep-linked source among a gallery's items, or -1. */
export function deepLinkedIndex(sources: string[]) {
  if (typeof window === 'undefined') return -1;
  const p = new URLSearchParams(window.location.search).get('media');
  const h = window.location.hash.slice(1);
  return sources.findIndex((s) => s === p || mediaAnchorId(s) === h);
}
