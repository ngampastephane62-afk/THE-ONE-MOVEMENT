import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { buildPages, CHAPTER_TITLES, type MagPage } from './pages';

const EASE = [0.65, 0.02, 0.25, 1] as const;

function useWide() {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const h = () => setWide(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  return wide;
}

const Paper = ({ children, side }: { children?: ReactNode; side: 'l' | 'r' | 'single' }) => (
  <div className="relative h-full w-full overflow-hidden bg-[hsl(40_38%_95%)]">
    {children}
    {/* spine shading */}
    {side !== 'single' && <div className={`pointer-events-none absolute inset-y-0 ${side === 'l' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} w-[12%] from-ink-900/25 via-ink-900/5 to-transparent`} />}
  </div>
);

type Turn = { dir: 1 | -1; front: ReactNode; back: ReactNode; target: number };

export default function Flipbook({ onRead }: { onRead: (chapterId: string) => void }) {
  const wide = useWide();
  const reduce = useReducedMotion();
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const go = useCallback((p: number) => setPage(p), []);
  const pages = useMemo<MagPage[]>(() => buildPages(go), [go]);
  const N = pages.length;
  const rot = useMotionValue(0);
  const shade = useTransform(rot, [-180, -90, 0], [0, 0.35, 0]);
  const gloss = useTransform(rot, [-180, -90, 0], [0, 0.18, 0]);
  const live = useRef<HTMLParagraphElement>(null);

  // Desktop works in spreads: spread s shows pages 2s-1 (left) and 2s (right). Spread 0 = cover alone.
  const s = Math.floor((page + 1) / 2);
  const maxS = Math.floor(N / 2);
  const pageOfSpread = (x: number) => (x <= 0 ? 0 : 2 * x - 1);
  const at = (i: number) => (i >= 0 && i < N ? pages[i] : null);
  const L = (x: number) => at(2 * x - 1);
  const R = (x: number) => at(2 * x);

  const canPrev = wide ? s > 0 : page > 0;
  const canNext = wide ? s < maxS : page < N - 1;

  const finish = useCallback((target: number) => { setPage(target); setTurn(null); rot.set(0); }, [rot]);

  const flip = useCallback((dir: 1 | -1) => {
    if (turn) return;
    if (dir === 1 && !canNext) return;
    if (dir === -1 && !canPrev) return;
    let t: Turn;
    if (wide) {
      t = dir === 1
        ? { dir, front: R(s)?.node, back: L(s + 1)?.node, target: pageOfSpread(s + 1) }
        : { dir, front: R(s - 1)?.node, back: L(s)?.node, target: pageOfSpread(s - 1) };
    } else {
      t = dir === 1 ? { dir, front: pages[page].node, back: null, target: page + 1 } : { dir, front: pages[page - 1].node, back: null, target: page - 1 };
    }
    if (reduce) { finish(t.target); return; }
    rot.set(dir === 1 ? 0 : -180);
    setTurn(t);
    animate(rot, dir === 1 ? -180 : 0, { duration: wide ? 1.05 : 0.8, ease: EASE, onComplete: () => finish(t.target) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, canNext, canPrev, wide, s, page, pages, reduce, finish, rot]);

  // Visible pages for labels and text links
  const visible: MagPage[] = (wide ? [L(s), R(s)] : [at(page)]).filter(Boolean) as MagPage[];
  const chapters = [...new Set(visible.map((v) => v.chapter).filter(Boolean) as string[])];
  const label = wide ? (s === 0 ? `Cover, page 1 of ${N}` : `Pages ${2 * s}${R(s) ? `–${2 * s + 1}` : ''} of ${N}`) : `Page ${page + 1} of ${N}`;
  useEffect(() => { if (live.current) live.current.textContent = `${label}. ${visible.map((v) => v.label).join('. ')}`; }, [label]); // eslint-disable-line react-hooks/exhaustive-deps

  // Swipe
  const startX = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onUp = (e: React.PointerEvent) => {
    if (startX.current == null) return; const dx = e.clientX - startX.current; startX.current = null;
    if (Math.abs(dx) > 45) flip(dx < 0 ? 1 : -1);
  };

  const sections = useMemo(() => {
    const seen = new Map<string, number>(); pages.forEach((p, i) => { if (!seen.has(p.section)) seen.set(p.section, i); }); return [...seen.entries()];
  }, [pages]);
  const curSection = (visible[visible.length - 1] ?? pages[0]).section;

  // Book offset: centre closed covers on wide screens
  const offset = wide ? (s === 0 ? '-25%' : !R(s) ? '25%' : '0%') : '0%';
  const underRight = wide ? (turn?.dir === 1 ? R(s + 1) : R(s)) : null;
  const underLeft = wide ? (turn?.dir === -1 ? L(s - 1) : L(s)) : null;
  const mobileUnder = !wide ? (turn ? (turn.dir === 1 ? at(page + 1) : at(page)) : at(page)) : null;

  return (
    <div className="w-full" data-testid="flipbook">
      <div
        role="region" aria-roledescription="magazine" aria-label="Tropik Magazine editorial selection. Use the left and right arrow keys to turn pages." tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); flip(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); flip(-1); } }}
        onPointerDown={onDown} onPointerUp={onUp}
        className="relative mx-auto touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-8 focus-visible:ring-offset-lagoon-900"
        style={{ perspective: wide ? 2600 : 1800, width: wide ? 'min(100%, calc(min(64dvh, 760px) * 1.6))' : 'min(100%, calc(60dvh * 0.8))' }}
      >
        <motion.div className="relative" animate={{ x: offset }} transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE }} style={{ aspectRatio: wide ? '1.6' : '0.8' }}>
          {/* drop shadow under the book */}
          <div className="pointer-events-none absolute -bottom-6 left-[4%] right-[4%] h-10 rounded-[50%] bg-black/50 blur-2xl" aria-hidden="true" />
          {wide ? (
            <div className="absolute inset-0 flex">
              <div className="h-full w-1/2">{underLeft && <Paper side="l">{underLeft.node}</Paper>}</div>
              <div className="h-full w-1/2">{underRight && <Paper side="r">{underRight.node}</Paper>}</div>
            </div>
          ) : (
            <div className="absolute inset-0">{mobileUnder && <Paper side="single">{mobileUnder.node}</Paper>}</div>
          )}
          {turn && (
            <motion.div className={`absolute inset-y-0 ${wide ? 'left-1/2 w-1/2' : 'left-0 w-full'}`} style={{ rotateY: rot, transformOrigin: 'left center', transformStyle: 'preserve-3d', zIndex: 5 }} aria-hidden="true">
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                <Paper side={wide ? 'r' : 'single'}>{turn.front}</Paper>
                <motion.div className="absolute inset-0 bg-gradient-to-l from-black to-transparent" style={{ opacity: shade }} />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <Paper side={wide ? 'l' : 'single'}>{turn.back ?? <div className="h-full w-full bg-[hsl(40_30%_90%)]" />}</Paper>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" style={{ opacity: gloss }} />
              </div>
            </motion.div>
          )}
          {/* tap zones */}
          <button type="button" aria-label="Previous page" disabled={!canPrev || !!turn} onClick={() => flip(-1)} className="absolute inset-y-0 left-0 z-10 w-[18%] cursor-w-resize opacity-0 disabled:cursor-default" tabIndex={-1} data-testid="zone-prev" />
          <button type="button" aria-label="Next page" disabled={!canNext || !!turn} onClick={() => flip(1)} className="absolute inset-y-0 right-0 z-10 w-[18%] cursor-e-resize opacity-0 disabled:cursor-default" tabIndex={-1} data-testid="zone-next" />
        </motion.div>
      </div>
      <p ref={live} className="sr-only" aria-live="polite" />

      {/* Controls */}
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => flip(-1)} disabled={!canPrev || !!turn} className="grid h-12 w-12 place-items-center rounded-full border border-ivory-50/30 text-ivory-50 transition hover:border-gold-400 hover:text-gold-400 disabled:opacity-30" aria-label="Previous page" data-testid="button-page-prev"><ChevronLeft className="h-5 w-5" /></button>
          <p className="min-w-[10rem] text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-ivory-200" data-testid="text-page-indicator">{label}</p>
          <button type="button" onClick={() => flip(1)} disabled={!canNext || !!turn} className="grid h-12 w-12 place-items-center rounded-full border border-gold-400 bg-gold-500 text-ink-900 transition hover:bg-gold-400 disabled:opacity-30" aria-label="Next page" data-testid="button-page-next"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <nav aria-label="Magazine sections" className="flex max-w-full gap-1 overflow-x-auto px-2">
          {sections.map(([name, i]) => (
            <button key={name} type="button" onClick={() => !turn && setPage(i)} aria-current={curSection === name ? 'true' : undefined}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${curSection === name ? 'bg-ivory-50 text-ink-900' : 'text-ivory-300 hover:text-gold-400'}`} data-testid={`button-section-${name.toLowerCase()}`}>{name}</button>
          ))}
        </nav>
        <div className="flex min-h-[2.5rem] flex-wrap justify-center gap-2">
          {chapters.map((c) => (
            <button key={c} type="button" onClick={() => onRead(c)} className="inline-flex items-center gap-2 border border-ivory-50/25 px-4 py-2 text-xs text-ivory-100 transition hover:border-gold-400 hover:text-gold-400" data-testid={`button-read-${c}`}>
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />Read as text: <span translate="no">{CHAPTER_TITLES[c]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
