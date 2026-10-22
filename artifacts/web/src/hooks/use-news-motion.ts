import { useEffect, useRef } from 'react';

/**
 * One-shot News reveal. Content is visible by default; the element is only
 * "armed" (hidden pre-state) after an IntersectionObserver is attached, so a
 * failure leaves everything readable. threshold 0 so very tall sections fire.
 */
export function useNewsReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (typeof IntersectionObserver === 'undefined' || reduce?.matches) { el.dataset.nm = 'in'; return; }
    const show = () => { el.dataset.nm = 'in'; io.disconnect(); };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) show(); }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    // Arm only if not already in view at setup; elements already on screen still play.
    el.dataset.nm = 'armed';
    const onFocus = () => show();
    const onReduce = () => { if (reduce?.matches) show(); };
    el.addEventListener('focusin', onFocus);
    reduce?.addEventListener?.('change', onReduce);
    const fallback = window.setTimeout(() => { if (el.dataset.nm === 'armed' && el.getBoundingClientRect().top < window.innerHeight) show(); }, 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
      el.removeEventListener('focusin', onFocus);
      reduce?.removeEventListener?.('change', onReduce);
    };
  }, []);
  return ref;
}

/** Ambient light runs only on screen, while the tab is visible. */
export function useNewsAmbient<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let onScreen = false;
    const sync = () => { el.dataset.ambient = onScreen && document.visibilityState === 'visible' ? 'run' : 'stop'; };
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((es) => { onScreen = es[0]?.isIntersecting ?? false; sync(); }, { threshold: 0 }) : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return ref;
}

export const MEDIA_START = 'nm:media-start';
export type MediaStartDetail = { owner: string; el?: Element | null };

/** Announce that a News media surface (e.g. an embed we just mounted) started. */
export function announceMediaStart(owner: string, el?: Element | null) {
  document.dispatchEvent(new CustomEvent<MediaStartDetail>(MEDIA_START, { detail: { owner, el } }));
}

/**
 * Scoped to the News root only: a capture-phase 'play' listener pauses every
 * other native <video>/<audio> inside the page (curated NewsVideo and CMS
 * uploads alike) and announces the start so mounted embeds can unmount.
 * Playback inside cross-origin iframes cannot be observed; embeds are only
 * mounted after an explicit Watch click, which is what we announce.
 */
export function useNewsPlaybackScope<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pauseOthers = (keep: Element | null | undefined) => {
      root.querySelectorAll('video, audio').forEach((m) => { const v = m as HTMLMediaElement; if (v !== keep && !v.paused) v.pause(); });
    };
    const onPlay = (e: Event) => {
      const t = e.target as Element | null;
      if (!t || !(t instanceof HTMLMediaElement)) return;
      pauseOthers(t);
      announceMediaStart('native', t);
    };
    const onStart = (e: Event) => {
      const d = (e as CustomEvent<MediaStartDetail>).detail;
      if (d?.owner !== 'native') pauseOthers(null);
    };
    root.addEventListener('play', onPlay, true);
    document.addEventListener(MEDIA_START, onStart);
    return () => { root.removeEventListener('play', onPlay, true); document.removeEventListener(MEDIA_START, onStart); };
  }, []);
  return ref;
}
