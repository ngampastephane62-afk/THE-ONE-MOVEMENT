import { createContext, useContext, useEffect, useRef, type PointerEvent } from 'react';

/** Page-level visitor pause for the Emirates experience. */
export const EmiratesMotionContext = createContext<{ paused: boolean; toggle: () => void }>({ paused: false, toggle: () => {} });
export const useEmiratesMotion = () => useContext(EmiratesMotionContext);

/**
 * One-shot reveal, local to the Emirates page. Visible by default; armed only
 * once an IntersectionObserver exists and reduced motion is off.
 */
export function useEmReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (typeof IntersectionObserver === 'undefined' || reduce?.matches) { el.dataset.em = 'in'; return; }
    const show = () => { el.dataset.em = 'in'; io.disconnect(); };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) show(); }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    el.dataset.em = 'armed';
    io.observe(el);
    const onFocus = () => show();
    const onReduce = () => { if (reduce?.matches) show(); };
    el.addEventListener('focusin', onFocus);
    reduce?.addEventListener?.('change', onReduce);
    return () => { io.disconnect(); el.removeEventListener('focusin', onFocus); reduce?.removeEventListener?.('change', onReduce); };
  }, []);
  return ref;
}

/** Continuous decoration runs only while on screen and the tab is visible. */
export function useEmAmbient<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let on = false;
    const sync = () => { el.dataset.ambient = on && document.visibilityState === 'visible' ? 'run' : 'stop'; };
    sync();
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((es) => { on = es[0]?.isIntersecting ?? false; sync(); }, { threshold: 0 }) : null;
    if (!io) { on = true; sync(); } else io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return ref;
}

/** Horizontal swipe on touch/pen only; ignores mostly-vertical gestures so page scroll is never hijacked. */
export function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const cb = useRef({ onPrev, onNext });
  cb.current = { onPrev, onNext };
  return {
    style: { touchAction: 'pan-y' as const },
    onPointerDown: (e: PointerEvent) => {
      start.current = null;
      const target = e.target as HTMLElement;
      if (target?.closest?.('a, button, input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
      if (e.pointerType === 'touch' || e.pointerType === 'pen') start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const s = start.current; start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? cb.current.onNext : cb.current.onPrev)();
    },
    onPointerCancel: () => { start.current = null; },
  };
}
