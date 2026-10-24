import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, RotateCw, X } from 'lucide-react';

const SRC = (n: number) => `${import.meta.env.BASE_URL}api/humanitarian-media/photo-${String(n).padStart(2, '0')}.webp`;
/** Founder-supplied archive, in supplied order (IMG 3447, 3444, 3456, 3449, 3460, 3461, 3459, 3429, 3438). No per-photo dates, places or names are asserted. */
const PHOTOS = Array.from({ length: 9 }, (_, i) => ({ n: i + 1, src: SRC(i + 1), alt: `Previous TOMI humanitarian donation activity, photograph ${i + 1} of 9. Founder-supplied archive.` }));

export default function HumanitarianGallery() {
  const track = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [attempt, setAttempt] = useState<Record<number, number>>({});
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current; if (!el) return;
    const item = el.querySelector('li'); const w = item ? item.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const close = useCallback(() => { setOpen(null); requestAnimationFrame(() => opener.current?.focus()); }, []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + PHOTOS.length) % PHOTOS.length)), []);

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = Array.from(document.querySelectorAll<HTMLElement>('[data-hum-lightbox] button'));
        if (!f.length) return; const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, close, step]);


  return (
    <section className="hum-gallery overflow-hidden bg-ivory-100 py-section-lg" aria-labelledby="gallery-title" data-testid="section-gallery">
      <div className="mx-auto max-w-6xl px-6">
        <p className="hum-chapter text-eyebrow text-gold-600"><span className="font-mono">06</span> · PREVIOUS DONATION PHOTO GALLERY</p>
        <h2 id="gallery-title" className="mt-4 text-display-lg text-ink-900"><span className="hum-mask"><span>OUR HUMANITARIAN</span></span><span className="hum-mask" style={{ ['--d' as string]: '120ms' }}><span>JOURNEY.</span></span></h2>
        <p className="hum-chapter mt-4 font-display text-lg tracking-wide text-lagoon-700" style={{ ['--d' as string]: '200ms' }}>MOMENTS OF SOLIDARITY.<span className="block">STORIES OF IMPACT.</span></p>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <p className="hum-chapter max-w-xl text-sm text-ink-800" style={{ ['--d' as string]: '320ms' }}>Founder-supplied archive of previous TOMI donation activities. Photographs are shown uncropped; individual dates and places are not stated here.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous photographs" className="tomi-cta grid h-11 w-11 place-items-center border border-lagoon-900/30 text-lagoon-900 hover:border-gold-500 hover:bg-lagoon-900 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-gallery-prev"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Next photographs" className="tomi-cta grid h-11 w-11 place-items-center border border-lagoon-900/30 text-lagoon-900 hover:border-gold-500 hover:bg-lagoon-900 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-gallery-next"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
      <div className="hum-thread mx-auto mt-8 max-w-6xl px-6" aria-hidden><span /></div>
      <ul ref={track} className="hum-track mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]" aria-label="Humanitarian photographs, scroll horizontally" data-testid="list-gallery">
        {PHOTOS.map((p, i) => (
          <li key={p.n} className="hum-photo shrink-0 snap-start" style={{ ['--d' as string]: `${Math.min(i, 4) * 110}ms` }}>
            {broken[p.n] ? (
              <div role="alert" className="flex h-[min(62vh,26rem)] w-[min(78vw,22rem)] flex-col items-center justify-center gap-3 border border-dashed border-sand-300 bg-ivory-50 p-6 text-center sm:w-[24rem]" data-testid={`status-photo-unavailable-${p.n}`}>
                <p className="font-mono text-xs text-gold-600">{String(p.n).padStart(2, '0')} / 09</p>
                <p className="text-sm text-ink-800">This photograph is currently unavailable.</p>
                <button type="button" onClick={() => { setBroken((b) => ({ ...b, [p.n]: false })); setAttempt((a) => ({ ...a, [p.n]: (a[p.n] ?? 0) + 1 })); }} className="inline-flex min-h-11 items-center gap-2 border border-lagoon-900 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100" data-testid={`button-photo-retry-${p.n}`}><RotateCw className="h-3.5 w-3.5" />Try again</button>
              </div>
            ) : (
            <button type="button" onClick={(e) => { opener.current = e.currentTarget; setOpen(PHOTOS.indexOf(p)); }} className="group relative block h-[min(62vh,26rem)] w-[min(78vw,22rem)] overflow-hidden bg-lagoon-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:w-[24rem]" aria-label={`Open photograph ${p.n} of 9`} data-testid={`button-photo-${p.n}`}>
              <img key={attempt[p.n] ?? 0} src={attempt[p.n] ? `${p.src}?r=${attempt[p.n]}` : p.src} alt={p.alt} loading="lazy" decoding="async" onError={() => setBroken((b) => ({ ...b, [p.n]: true }))} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              <span className="absolute bottom-0 left-0 flex items-center gap-2 bg-lagoon-900/85 px-3 py-2 font-mono text-[11px] text-gold-400"><Maximize2 className="h-3 w-3" />{String(p.n).padStart(2, '0')} / 09</span>
            </button>
            )}
          </li>
        ))}
      </ul>

      {open !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-ink-950/95 p-4 text-ivory-100 sm:p-8" role="dialog" aria-modal="true" aria-label={`Photograph ${open + 1} of 9`} data-hum-lightbox data-testid="dialog-lightbox" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-gold-400">{String(open + 1).padStart(2, '0')} / 09</p>
            <button ref={closeBtn} type="button" onClick={close} aria-label="Close photograph" className="grid h-11 w-11 place-items-center border border-ivory-100/30 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-lightbox-close"><X className="h-5 w-5" /></button>
          </div>
          <figure className="flex min-h-0 flex-1 flex-col items-center justify-center py-4">
            <img src={PHOTOS[open].src} alt={PHOTOS[open].alt} className="min-h-0 max-h-full max-w-full object-contain" data-testid="img-lightbox" />
            <figcaption className="mt-3 text-center text-sm text-ivory-300">Previous TOMI humanitarian donation activity · Founder-supplied archive.</figcaption>
          </figure>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => step(-1)} aria-label="Previous photograph" className="grid h-11 w-11 place-items-center border border-ivory-100/30 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-lightbox-prev"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => step(1)} aria-label="Next photograph" className="grid h-11 w-11 place-items-center border border-ivory-100/30 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-lightbox-next"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
