import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import OneKey from './OneKey';
import { usePageHidden, useReducedMotion } from './useStage';

const BASE = import.meta.env.BASE_URL;

const CAPTIONS = [
  { k: 'A point of light', t: 'Somewhere in the dark, a small light waits.' },
  { k: 'The key takes form', t: 'One key. A symbol of discovery, not a product.' },
  { k: 'It finds the gate', t: 'A path appears between you and the seventeen worlds.' },
  { k: 'It turns', t: 'The lock answers in gold.' },
  { k: 'The gateway opens', t: 'Beyond it: one connected universe. Free to explore.' },
];

/**
 * Scroll-staged ONE KEY passage. Progress is computed from the section's position only while
 * it is on screen (passive listener, rAF, DOM attribute; no React re-render). Sticky on desktop
 * only; scrolling is never intercepted. Reduced motion shows the opened gateway immediately.
 */
export default function KeyPassage({ paused = false }: { paused?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  const still = paused || reduced;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const apply = (s: number) => {
      if (el.dataset.stage === String(s)) return;
      el.dataset.stage = String(s);
      el.querySelectorAll<HTMLElement>('[data-cap]').forEach((c) => { c.dataset.on = String(Number(c.dataset.cap) <= s); });
    };
    // Paused, reduced or unsupported: static, fully open composition. No listeners.
    if (still || typeof IntersectionObserver === 'undefined') { apply(4); return; }
    if (hidden) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      let p: number;
      if (desktop.matches) {
        const r = el.getBoundingClientRect();
        p = (vh * 0.75 - r.top) / Math.max(1, r.height - vh * 0.35);
      } else {
        // Mobile: artwork comes first; stages play across its own short pass through the viewport.
        const r = (artRef.current ?? el).getBoundingClientRect();
        p = (vh * 0.95 - r.top) / Math.max(1, vh * 0.6);
      }
      p = Math.min(1, Math.max(0, p));
      apply(p < 0.12 ? 0 : p < 0.3 ? 1 : p < 0.5 ? 2 : p < 0.68 ? 3 : 4);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    let on = false;
    const start = () => { if (on) return; on = true; window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); measure(); };
    const stop = () => { if (!on) return; on = false; window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    const io = new IntersectionObserver(([e]) => { el.dataset.live = String(e.isIntersecting); if (e.isIntersecting) start(); else stop(); }, { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); stop(); if (raf) cancelAnimationFrame(raf); el.dataset.live = 'false'; };
  }, [still, hidden]);

  return (
    <section id="one-key-passage" ref={root} data-stage="0" data-live="false" className="x-passage scroll-mt-20 text-ivory-100" aria-labelledby="key-passage-title" data-testid="section-key-passage">
      <div className="x-passage-stage x-content mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-12 lg:py-0">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <p className="text-eyebrow text-gold-400">Chapter two · The One Key, in full</p>
          <h2 id="key-passage-title" className="mt-4 text-display-lg">ONE KEY.<br /><span className="text-gold-400">SEVENTEEN WORLDS.</span><br /><span className="text-display-md text-ivory-200">INFINITE POSSIBILITIES.</span></h2>
          <ol className="mt-8 space-y-3">
            {CAPTIONS.map((c, i) => (
              <li key={c.k} data-cap={i} data-on={i === 0 ? 'true' : 'false'} className="x-cap pl-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold-400">{String(i + 1).padStart(2, '0')} · {c.k}</span>
                <span className="mt-0.5 block text-sm text-ivory-200">{c.t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-ivory-300">The One Key is the on-page navigation button for your selected sector. Choose a sector, then click its key to open that world. It is not a paid product or membership requirement.</p>
          <a href="#explore" className="x-btn x-btn-gold mt-6" data-testid="link-key-open-gateways">Choose your sector <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
        </div>
        <div ref={artRef} className="x-noclick relative order-1 lg:order-2 lg:col-span-7" aria-hidden="true">
          <div className="x-gate">
            <div className="x-gate-beyond"><img src={`${BASE}images/vision/founder-world-gold.webp`} alt="" loading="lazy" decoding="async" /></div>
            <div className="x-leaves"><div className="x-leaf l" /><div className="x-leaf r" /></div>
            <div className="x-gate-frame" />
            <div className="x-path" />
            <div className="x-lock" />
            <div className="x-spark" />
            <div className="x-keyrig"><div className="x-keyturn"><div className="x-keyspin"><OneKey className="w-full text-gold-400" /></div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
