import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { assetUrl } from '@/lib/press';
import { ring } from './parts';
import { cn } from '@/lib/utils';

/**
 * Horizontal, swipeable gallery of a publication's original screens.
 * Native scroll-snap (touch swipe), labelled prev/next, uncropped object-contain.
 * Each slide opens the full EvidenceViewer at that capture. No autoplay.
 */
export default function CaptureGallery({ images, outlet, onOpen, testId, selectedIndex, onIndexChange }: { images: string[]; outlet: string; onOpen: (i: number) => void; testId?: string; selectedIndex?: number; onIndexChange?: (index: number) => void }) {
  const track = useRef<HTMLUListElement>(null);
  const [cur, setCur] = useState(selectedIndex ?? 0);
  const n = images.length;
  const onIndexRef = useRef(onIndexChange);
  onIndexRef.current = onIndexChange;

  useEffect(() => {
    const el = track.current;
    if (!el || selectedIndex === undefined || !el.clientWidth) return;
    if (Math.round(el.scrollLeft / el.clientWidth) !== selectedIndex) {
      el.scrollTo({ left: selectedIndex * el.clientWidth, behavior: 'auto' });
    }
    setCur(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    const el = track.current;
    if (!el || n < 2) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1;
        const next = Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w)));
        setCur(next);
        onIndexRef.current?.(next);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [n]);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(n - 1, i));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: k * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    setCur(k);
  }, [n]);

  if (!n) return <p className="text-xs text-ivory-300">Captures not yet attached.</p>;

  return (
    <div className="w-full max-w-[17rem]" role="region" aria-roledescription="carousel" aria-label={`${outlet} captures`}>
      <ul ref={track} className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-sharp [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" tabIndex={-1}>
        {images.map((src, i) => (
          <li key={src + i} className="w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={`Capture ${i + 1} of ${n}`}>
            <button type="button" onClick={() => onOpen(i)} tabIndex={i === cur ? 0 : -1}
              className={cn('group relative block h-72 w-full overflow-hidden rounded-sharp border border-gold-500/30 bg-ivory-100', ring)}
              aria-label={`Open capture ${i + 1} of ${n} from ${outlet} in full view`} data-testid={i === 0 ? testId : `${testId}-slide-${i}`}>
              <img src={assetUrl(src)} alt="" loading="lazy" className="h-full w-full object-contain" />
              <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-lagoon-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/40"><Maximize2 className="h-3 w-3" aria-hidden />Full view</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-ivory-300" aria-live="polite">{n === 1 ? '1 screen' : `Screen ${cur + 1} of ${n}`}</span>
        {n > 1 && (
          <span className="flex gap-2">
            <button type="button" onClick={() => go(cur - 1)} disabled={cur === 0} className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 text-gold-400 disabled:opacity-30', ring)} aria-label="Previous capture">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => go(cur + 1)} disabled={cur === n - 1} className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 text-gold-400 disabled:opacity-30', ring)} aria-label="Next capture">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
