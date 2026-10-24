import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, RotateCw, X } from 'lucide-react';

const SRC = (n: number) => `${import.meta.env.BASE_URL}api/humanitarian-media/photo-${String(n).padStart(2, '0')}.webp`;
/** Founder-supplied archive, in supplied order (IMG 3447, 3444, 3456, 3449, 3460, 3461, 3459, 3429, 3438). No per-photo dates, places or names are asserted. */
const PHOTOS = Array.from({ length: 9 }, (_, i) => ({ n: i + 1, src: SRC(i + 1), alt: `Previous TOMI humanitarian donation activity, photograph ${i + 1} of 9. Founder-supplied archive.` }));

export default function HumanitarianGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [attempt, setAttempt] = useState<Record<number, number>>({});
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Slideshow engine mirrors PartnerOrbitStage: 3s hold per loaded photo, pause on hover/focus/user/reduced motion/fullscreen/offscreen/hidden tab.
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const upd = () => setReduced(mq.matches); upd(); mq.addEventListener?.('change', upd);
    const onVis = () => setTabVisible(document.visibilityState !== 'hidden'); onVis();
    document.addEventListener('visibilitychange', onVis);
    let io: IntersectionObserver | undefined;
    if (stage.current && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
      io.observe(stage.current);
    }
    return () => { mq.removeEventListener?.('change', upd); document.removeEventListener('visibilitychange', onVis); io?.disconnect(); };
  }, []);
  const running = !reduced && !paused && !hold && open === null && onScreen && tabVisible && !!loaded[PHOTOS[cur].n] && !broken[PHOTOS[cur].n];
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setCur((c) => (c + 1) % PHOTOS.length), 3000);
    return () => window.clearTimeout(t);
  }, [running, cur]);
  useEffect(() => { const im = new Image(); im.src = PHOTOS[(cur + 1) % PHOTOS.length].src; }, [cur]);
  const go = (d: number) => setCur((c) => (c + d + PHOTOS.length) % PHOTOS.length);

  const close = useCallback(() => { setOpen((o) => { if (o !== null) setCur(o); return null; }); requestAnimationFrame(() => opener.current?.focus()); }, []);
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
            <button type="button" onClick={() => setPaused((v) => !v)} aria-pressed={paused || reduced} disabled={reduced} title={reduced ? 'Motion is reduced by your system settings' : undefined} className="tomi-cta inline-flex h-11 items-center gap-2 border border-lagoon-900/30 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lagoon-900 hover:border-gold-500 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-gallery-pause">{paused || reduced ? <><Play className="h-3.5 w-3.5" aria-hidden="true" />Play</> : <><Pause className="h-3.5 w-3.5" aria-hidden="true" />Pause</>}</button>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-lagoon-900/30 text-lagoon-900 hover:border-gold-500 hover:bg-lagoon-900 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-gallery-prev"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-lagoon-900/30 text-lagoon-900 hover:border-gold-500 hover:bg-lagoon-900 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-gallery-next"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
      <div className="hum-thread mx-auto mt-8 max-w-6xl px-6" aria-hidden><span /></div>
      <div ref={stage} className="mx-auto mt-6 max-w-6xl px-6" role="group" aria-roledescription="carousel" aria-label="Humanitarian photographs" data-testid="list-gallery" data-running={running}
        onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocusCapture={() => setHold(true)} onBlurCapture={() => setHold(false)}>
        <div className="hum-photo relative h-[min(68vh,34rem)] overflow-hidden bg-lagoon-900" aria-live={running ? 'off' : 'polite'}>
          {broken[PHOTOS[cur].n] ? (
            <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-ivory-100" data-testid={`status-photo-unavailable-${PHOTOS[cur].n}`}>
              <p className="font-mono text-xs text-gold-400">{String(PHOTOS[cur].n).padStart(2, '0')} / 09</p>
              <p className="text-sm">This photograph is currently unavailable.</p>
              <button type="button" onClick={() => { const n = PHOTOS[cur].n; setBroken((b) => ({ ...b, [n]: false })); setAttempt((a) => ({ ...a, [n]: (a[n] ?? 0) + 1 })); }} className="inline-flex min-h-11 items-center gap-2 border border-gold-400 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400" data-testid={`button-photo-retry-${PHOTOS[cur].n}`}><RotateCw className="h-3.5 w-3.5" />Try again</button>
            </div>
          ) : (
            <button key={cur} type="button" onClick={(e) => { opener.current = e.currentTarget; setOpen(cur); }} className="hum-slide group absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-gold-400" aria-label={`Open photograph ${PHOTOS[cur].n} of 9 fullscreen`} data-testid={`button-photo-${PHOTOS[cur].n}`}>
              <img key={attempt[PHOTOS[cur].n] ?? 0} src={attempt[PHOTOS[cur].n] ? `${PHOTOS[cur].src}?r=${attempt[PHOTOS[cur].n]}` : PHOTOS[cur].src} alt={PHOTOS[cur].alt} decoding="async" onLoad={() => setLoaded((l) => ({ ...l, [PHOTOS[cur].n]: true }))} onError={() => { setLoaded((l) => ({ ...l, [PHOTOS[cur].n]: false })); setBroken((b) => ({ ...b, [PHOTOS[cur].n]: true })); }} className="h-full w-full object-contain" />
              <span className="absolute bottom-0 left-0 flex items-center gap-2 bg-lagoon-900/85 px-3 py-2 font-mono text-[11px] text-gold-400"><Maximize2 className="h-3 w-3" />{String(PHOTOS[cur].n).padStart(2, '0')} / 09</span>
            </button>
          )}
          <span key={`p-${cur}-${running}`} className="hum-progress absolute inset-x-0 top-0 h-[3px] origin-left bg-gold-500" data-on={running} aria-hidden="true" />
        </div>
        <p className="mt-3 text-xs text-ink-700">Previous TOMI humanitarian donation activity · Founder-supplied archive. Shown uncropped.</p>
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Choose a photograph">
          {PHOTOS.map((p, i) => (
            <li key={p.n} className="shrink-0">
              <button type="button" onClick={() => setCur(i)} aria-current={i === cur} aria-label={`Show photograph ${p.n} of 9`} className={`block h-14 w-20 overflow-hidden border-2 bg-lagoon-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${i === cur ? 'border-gold-500' : 'border-transparent opacity-70 hover:opacity-100'}`} data-testid={`button-thumb-${p.n}`}>
                <img src={p.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ol>
      </div>

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
