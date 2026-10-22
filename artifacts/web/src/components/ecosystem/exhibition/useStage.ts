import { useEffect, useRef, useState } from 'react';

const RM = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.(RM).matches;
}

/** Live reduced-motion preference (reacts to OS changes). */
export function useReducedMotion() {
  const [r, setR] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.(RM);
    if (!mq) return;
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

/** True while the tab is hidden. */
export function usePageHidden() {
  const [h, setH] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const on = () => setH(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return h;
}

/**
 * Visible-first staging. Content is visible until the observer is armed; `data-seen` is only
 * emitted after setup, so no JS / no IntersectionObserver means no hidden content.
 * Threshold 0 so very tall sections still reveal. Focus inside reveals immediately.
 * `live` (ambient loops) is false offscreen, in hidden tabs and under reduced motion.
 */
export function useStage<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => {
      setOnScreen(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    const reveal = () => setSeen(true);
    el.addEventListener('focusin', reveal);
    setArmed(true);
    return () => { io.disconnect(); el.removeEventListener('focusin', reveal); };
  }, []);
  const isSeen = seen || reduced;
  const live = onScreen && !hidden && !reduced;
  const attrs: Record<string, string> = armed ? { 'data-seen': String(isSeen), 'data-live': String(live) } : {};
  return { ref, seen: isSeen, live, attrs };
}
