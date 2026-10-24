import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Shared reduced-motion detection, live-updating. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const q = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!q) return;
    const on = () => setReduced(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** One-shot in-view flag. Content is visible by default if IO is unavailable. */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const inViewport = () => { const r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    // Safety nets: first-viewport content reveals on the next frame, and anything on screen
    // (or a tall element the threshold can never satisfy) reveals after 1.6s if the observer never fires.
    const raf = requestAnimationFrame(() => { if (inViewport()) setShown(true); });
    const timer = window.setTimeout(() => { if (inViewport()) { setShown(true); io.disconnect(); } }, 1600);
    const onScroll = () => { if (inViewport()) { window.setTimeout(() => setShown(true), 900); window.removeEventListener('scroll', onScroll); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [threshold]);
  return [ref, shown] as const;
}

/** Scroll-synchronised offset (px) for subtle parallax; 0 under reduced motion. */
export function useParallax<T extends HTMLElement>(strength = 0.08) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [y, setY] = useState(0);
  useEffect(() => {
    if (reduced) { setY(0); return; }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      setY(Math.max(-60, Math.min(60, -mid * strength)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [reduced, strength]);
  return [ref, y] as const;
}

const EASE = 'ease-[cubic-bezier(0.19,1,0.22,1)]';

/** Masked line reveal: the line rises out of its own clipping box. */
export function MaskLine({ shown, delay = 0, children, className = '' }: { shown: boolean; delay?: number; children: ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <span
        className={`block transition-[transform,opacity] duration-[1100ms] ${EASE} motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-[108%] opacity-0'}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

/** Soft rise for supporting copy, staggered after mask lines. */
export function Rise({ shown, delay = 0, children, className = '', as: Tag = 'div' }: { shown: boolean; delay?: number; children: ReactNode; className?: string; as?: 'div' | 'p' }) {
  return (
    <Tag
      className={`transition-[transform,opacity] duration-[900ms] ${EASE} motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Curtain wipe over media: a tinted panel scales away, synced with the title. */
export function Curtain({ shown, delay = 0, color, origin = 'top' }: { shown: boolean; delay?: number; color: string; origin?: 'top' | 'bottom' | 'left' }) {
  const o = origin === 'left' ? 'origin-right' : origin === 'top' ? 'origin-bottom' : 'origin-top';
  const axis = origin === 'left' ? (shown ? 'scale-x-0' : 'scale-x-100') : shown ? 'scale-y-0' : 'scale-y-100';
  const style: CSSProperties = { backgroundColor: color, transitionDelay: `${delay}ms` };
  return <span aria-hidden="true" className={`pointer-events-none absolute inset-0 z-10 ${o} ${axis} transition-transform duration-[1300ms] ${EASE} motion-reduce:hidden`} style={style} />;
}
