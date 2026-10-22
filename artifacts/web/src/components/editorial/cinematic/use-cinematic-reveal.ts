import { useEffect, useRef } from 'react';

/** One-shot reveal. Arms only when IntersectionObserver exists and motion is allowed; otherwise content stays in its final visible state. */
export function useCinematicReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0 && new URLSearchParams(window.location.search).get('video')) return;
    el.dataset.armed = 'true';
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { el.dataset.in = 'true'; io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    const show = () => { el.dataset.in = 'true'; io.disconnect(); };
    el.addEventListener('focusin', show);
    const failsafe = window.setTimeout(() => { if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.in = 'true'; }, 2500);
    return () => { io.disconnect(); window.clearTimeout(failsafe); el.removeEventListener('focusin', show); };
  }, []);
  return ref;
}
