import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import './programs-motion.css';

/**
 * Programs page motion engine (page-scoped, progressive enhancement).
 * - Content is visible by default. Only after JS runs, IntersectionObserver exists and motion is allowed
 *   does the root get `data-armed`, which lets `[data-pgm-reveal]` elements wait for viewport entry.
 * - Continuous motion pauses when: user pauses, tab hidden, or the owning `[data-pgm-loop]` is offscreen.
 * - Tiny image parallax only for fine pointers on wide screens with motion allowed (rAF-throttled scroll).
 */
export function useProgramsMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const stillRef = useRef(still);
  stillRef.current = still;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Preserve normal deep-link behaviour after this client-rendered page mounts.
    if (window.location?.hash === '#official-programs') {
      root.querySelector<HTMLElement>('#official-programs')?.scrollIntoView({ block: 'start' });
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const onVis = () => root.setAttribute('data-hidden', String(document.visibilityState === 'hidden'));
    onVis();
    document.addEventListener('visibilitychange', onVis);
    if (reduced || typeof IntersectionObserver === 'undefined') {
      return () => document.removeEventListener('visibilitychange', onVis);
    }

    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-pgm-reveal]'));
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', 'true'); revealIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    // Anything already in view at arm time reveals immediately (no flash of hidden above-the-fold content).
    const vh = window.innerHeight;
    reveals.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.setAttribute('data-in', 'true'); else revealIO.observe(el);
    });
    root.setAttribute('data-armed', 'true');
    // Keyboard users never land on a not-yet-revealed element.
    const onFocus = (ev: FocusEvent) => { (ev.target as HTMLElement).closest?.('[data-pgm-reveal]')?.setAttribute('data-in', 'true'); };
    root.addEventListener('focusin', onFocus);

    const loops = Array.from(root.querySelectorAll<HTMLElement>('[data-pgm-loop]'));
    const loopIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.setAttribute('data-off', String(!e.isIntersecting))));
    loops.forEach((l) => loopIO.observe(l));

    const fine = window.matchMedia?.('(pointer: fine) and (min-width: 1024px)').matches;
    const visible = new Set<HTMLElement>();
    let parallaxIO: IntersectionObserver | undefined;
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (stillRef.current || document.visibilityState === 'hidden') return;
      visible.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = ((r.top + r.height / 2) / window.innerHeight - 0.5) * -14; // ±7px
        el.style.setProperty('--pgm-py', `${p.toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    if (fine) {
      parallaxIO = new IntersectionObserver((entries) => entries.forEach((e) => {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) visible.add(el); else visible.delete(el);
      }));
      root.querySelectorAll<HTMLElement>('[data-pgm-parallax]').forEach((el) => parallaxIO!.observe(el));
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      root.removeEventListener('focusin', onFocus);
      revealIO.disconnect(); loopIO.disconnect(); parallaxIO?.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { rootRef, still, setStill };
}

/** Word-by-word masked line. The full sentence stays in the DOM as real text. */
export function WordLine({ text, start = 0, className = '', style }: { text: string; start?: number; className?: string; style?: CSSProperties }) {
  return (
    <span className={`pgm-line ${className}`} style={style}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="pgm-word-mask"><span className="pgm-word" style={{ ['--w' as string]: start + i }}>{w}</span>{' '}</span>
      ))}
    </span>
  );
}

export function MotionToggle({ still, onToggle }: { still: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="pgm-toggle" onClick={onToggle} aria-pressed={still} data-testid="button-programs-motion">
      {still ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
      <span>{still ? 'Play motion' : 'Pause motion'}</span>
    </button>
  );
}

/**
 * Hero entrance that is actually seen: content is held (data-hero="wait") only from layout until the
 * hero is visible and the route transition has settled, then plays once (data-hero="go").
 * Reduced motion or no JS: attribute never set, content is static and readable. A 1.2s failsafe always releases.
 */
export function useHeroEntrance<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    el.setAttribute('data-hero', 'wait');
    let done = false;
    const go = () => { if (done) return; done = true; requestAnimationFrame(() => el.setAttribute('data-hero', 'go')); };
    const settle = window.setTimeout(() => { if (document.visibilityState !== 'hidden') go(); }, 280);
    const failsafe = window.setTimeout(go, 1200);
    const onVis = () => { if (document.visibilityState === 'visible') go(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { done = true; el.removeAttribute('data-hero'); window.clearTimeout(settle); window.clearTimeout(failsafe); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return ref;
}
