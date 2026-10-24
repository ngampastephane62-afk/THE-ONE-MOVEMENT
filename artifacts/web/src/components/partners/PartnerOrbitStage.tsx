import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import catalog from '@/assets/media/founder/catalog.json';
import { usePrefersReducedMotion } from './util';
import { DRC_AMBASSADOR_SOURCE, OFFICIAL_MEETINGS, meetingImageUrl } from './official-meetings';
import GalleryActions from '../editorial/GalleryActions';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type PhotoId = keyof typeof catalog.photos;

type Slide = { id?: PhotoId; filename?: string; word: string; region: string; people: string; caption?: string; position?: string; source?: string };
const SLIDES: Slide[] = [
  ...OFFICIAL_MEETINGS,
  { id: 'office-encounter', word: 'TRUST', region: 'UAE', people: 'Yuston Nessy · Private Office of Sheikh Saeed bin Ahmed Al Maktoum' },
  { id: 'institutional-dialogue', word: 'DIALOGUE', region: 'Institutions', people: 'Yuston Nessy · Institutional meeting' },
  { id: 'diplomatic-encounter', word: 'DIPLOMACY', region: 'Abu Dhabi · UAE', people: 'Yuston Nessy · Marie Ndjeka Opombo', position: 'center 40%', source: DRC_AMBASSADOR_SOURCE },
  { id: 'global-encounter', word: 'ACCESS', region: 'International', people: 'Yuston Nessy · Ambassador of Tanzania' },
  { id: 'conversation', word: 'CONVERSATION', region: 'Culture & business', people: 'Yuston Nessy · Dr Denis Mukwege' },
];
const DURATION = 3000;
const srcOf = (sl: Slide) => sl.filename ? meetingImageUrl(sl.filename)
  : `${import.meta.env.BASE_URL}brand-photos/${catalog.photos[sl.id!].filename}`;
const galleryItems = SLIDES.map(sl => ({
  source: sl.filename ? `/api/official-meetings/photos/${sl.filename}` : `/brand-photos/${catalog.photos[sl.id!].filename}`,
  title: `${sl.people} · ${sl.caption ?? (sl.id ? catalog.photos[sl.id].caption : 'Founder archive')}`,
}));

export default function PartnerOrbitStage() {
  const reduced = usePrefersReducedMotion();
  // `i` = photo actually on screen (only set once its image has loaded).
  const [i, setI] = useState(0);
  const [target, setTarget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasVisiblePhoto, setHasVisiblePhoto] = useState(false);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [paused, setPaused] = useState(false);
  const [hoverHold, setHoverHold] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewerTrigger = useRef<HTMLButtonElement | null>(null);
  const running = hasVisiblePhoto && !reduced && !paused && !hoverHold && !viewerOpen;
  const timer = useRef<number | null>(null);

  // Load the requested slide; the current photo stays visible until it is decoded.
  useEffect(() => {
    if (target === i && hasVisiblePhoto) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const img = new Image();
    img.src = srcOf(SLIDES[target]);
    img.decode().then(() => {
      if (!cancelled) { setI(target); setHasVisiblePhoto(true); setLoading(false); }
    }, () => {
      if (cancelled) return;
      setFailed((f) => new Set(f).add(target));
      setLoading(false);
      // Skip the unavailable photo; the last good one remains on screen.
      setTarget((t) => ((t + 1) % SLIDES.length === i ? i : (t + 1) % SLIDES.length));
    });
    return () => { cancelled = true; };
  }, [target, i, hasVisiblePhoto]);

  // Each loaded photo is held for exactly DURATION before the next is requested.
  useEffect(() => {
    if (!running || target !== i) return;
    timer.current = window.setTimeout(() => setTarget((n) => (n + 1) % SLIDES.length), DURATION);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [i, target, running]);

  const go = (d: number) => setTarget((n) => (n + d + SLIDES.length) % SLIDES.length);
  const s = SLIDES[i];
  const caption = s.id ? catalog.photos[s.id].caption : s.caption!;

  useEffect(() => {
    // Warm the following photo while the current one is held.
    const image = new Image();
    image.src = srcOf(SLIDES[(i + 1) % SLIDES.length]);
  }, [i]);


  return (
    <section
      className="tomi-stage relative isolate overflow-hidden bg-[hsl(187_45%_7%)] text-ivory-100"
      aria-roledescription="carousel"
      data-still={!running}
      aria-label="Partners of The One Movement"
      onMouseEnter={() => setHoverHold(true)}
      onMouseLeave={() => setHoverHold(false)}
      onFocusCapture={() => setHoverHold(true)}
      onBlurCapture={() => setHoverHold(false)}
    >
      <style>{`
        @keyframes tomi-spin { to { transform: rotate(360deg); } }
        @keyframes tomi-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
        @keyframes tomi-in { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
        @keyframes tomi-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .tomi-arc { animation: tomi-spin 38s linear infinite; }
        .tomi-arc-slow { animation: tomi-spin 70s linear infinite reverse; }
        .tomi-stage[data-still="true"] .tomi-arc, .tomi-stage[data-still="true"] .tomi-arc-slow { animation-play-state: paused; }
        .tomi-rise { animation: tomi-rise .5s ease-out both; }
        .tomi-in { animation: tomi-in .6s ease-out both; }
        .tomi-bar { transform-origin: left; animation: tomi-progress ${DURATION}ms linear both; }
        @media (prefers-reduced-motion: reduce) {
          .tomi-arc, .tomi-arc-slow, .tomi-rise, .tomi-in, .tomi-bar { animation: none !important; }
        }
      `}</style>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,hsl(38_60%_30%/0.28),transparent_60%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E&quot;)]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-12 lg:pt-24">
        {/* Text column */}
        <div className="relative z-10 lg:col-span-6 order-2 lg:order-1">
          <p className="text-eyebrow text-gold-400">OUR PARTNERS & ALLIES</p>
          <div className="mt-6 overflow-hidden" aria-hidden>
            <p key={`w-${i}`} className="tomi-rise text-[clamp(3rem,10vw,8.5rem)] leading-[0.85] tracking-tight text-ivory-100/95 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              {s.word}
            </p>
          </div>
          <h2 className="mt-6 text-2xl text-ivory-100 uppercase sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Build with the Movement.
          </h2>
          <p className="mt-4 max-w-lg text-ivory-200 leading-relaxed">
            Governments, UN entities, diplomatic missions, a leading Congolese bank and international brands have worked with the Movement across a decade of editions between Africa, the UAE and the world.
          </p>
          <div key={`c-${i}`} className="tomi-rise mt-8 border-l border-gold-500/60 pl-4" style={{ animationDelay: '180ms' }} aria-live={running ? 'off' : 'polite'}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              {String(i + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} · {s.region}
            </p>
            <p className="mt-2 text-lg text-ivory-100" data-testid="text-partner-caption">{caption}</p>
            <p className="mt-1 text-xs text-ivory-300">Founder archive photograph</p>
          </div>

        </div>

        {/* Subject + luminous arc */}
        <div className="relative order-1 flex flex-col items-center lg:order-2 lg:col-span-6">
          <div className="relative aspect-square w-[min(88vw,560px)]">
            <svg aria-hidden viewBox="0 0 200 200" className={`absolute inset-0 h-full w-full ${running ? 'tomi-arc' : ''}`}>
              <defs>
                <linearGradient id="tomiArc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="hsl(42 80% 72%)" stopOpacity="0" />
                  <stop offset=".55" stopColor="hsl(42 80% 66%)" stopOpacity=".95" />
                  <stop offset="1" stopColor="hsl(32 70% 55%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="92" fill="none" stroke="url(#tomiArc)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="380 200" />
            </svg>
            <svg aria-hidden viewBox="0 0 200 200" className={`absolute inset-[6%] h-[88%] w-[88%] ${running ? 'tomi-arc-slow' : ''}`}>
              <circle cx="100" cy="100" r="96" fill="none" stroke="hsl(42 60% 70% / .28)" strokeWidth=".5" strokeDasharray="2 6" />
            </svg>
            <div aria-hidden className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,hsl(40_70%_55%/0.22),transparent_70%)]" />
             <div className="absolute inset-[9%] overflow-hidden rounded-full shadow-[0_40px_80px_-30px_hsl(187_60%_2%/0.9)]">
                <button key={`p-${i}`} ref={viewerTrigger} type="button" className="tomi-in relative h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-gold-400" aria-label="Open partner photograph fullscreen" data-testid="button-partner-fullscreen" onClick={() => setViewerOpen(true)}>
                  <img src={srcOf(s)} width={1000} height={1000} alt={`${s.people} — ${caption}`} decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'} className="h-full w-full object-cover" style={{ objectPosition: s.position ?? 'center 30%' }} data-testid={`img-official-meeting-${s.filename ?? s.id}`} />
                   <span aria-hidden="true" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink-900/80 px-3 py-2 text-xs text-ivory-100"><Maximize2 size={14} />View photograph</span>
                 </button>
                {loading && <span className="absolute bottom-[12%] left-1/2 -translate-x-1/2 rounded-full bg-ink-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory-100" role="status">Loading next photograph</span>}
            </div>
          </div>
           <div className="mt-4 max-w-md text-center" aria-live={running ? 'off' : 'polite'} data-testid="text-partner-people">
             <p className="text-sm font-semibold leading-relaxed text-gold-400">{s.people}</p>
             <p className="mt-1 text-xs leading-relaxed text-ivory-200">{caption}</p>
             {s.source && <a href={s.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold-400 underline">Official source · Embassy of the DRC</a>}
           </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="Previous partner" data-testid="button-stage-prev" className="grid h-11 w-11 place-items-center rounded-full border border-ivory-100/25 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next partner" data-testid="button-stage-next" className="grid h-11 w-11 place-items-center rounded-full border border-ivory-100/25 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"><ChevronRight className="h-4 w-4" /></button>
            {!reduced && (
              <button type="button" onClick={() => setPaused((v) => !v)} aria-pressed={paused} data-testid="button-stage-pause" className="inline-flex h-11 items-center gap-2 rounded-full border border-ivory-100/25 px-4 text-xs font-semibold uppercase tracking-widest hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                {paused ? <><Play className="h-3.5 w-3.5" /> Play motion</> : <><Pause className="h-3.5 w-3.5" /> Pause motion</>}
              </button>
            )}
          </div>
          <div className="mt-4 flex w-full max-w-xs gap-1" role="tablist" aria-label="Choose partner photograph">
            {SLIDES.map((sl, n) => (
              <button key={sl.id ?? sl.filename} role="tab" aria-selected={n === i} aria-label={`${n + 1}. ${sl.people} — ${sl.id ? catalog.photos[sl.id].caption : sl.caption}`} onClick={() => setTarget(n)} data-testid={`button-stage-dot-${n}`} className="relative h-11 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                <span className="absolute inset-x-0 top-1/2 h-px bg-ivory-100/25" />
                {n === i && <span key={`b-${i}-${running}`} className={`absolute inset-x-0 top-1/2 h-px bg-gold-400 ${running && target === i ? 'tomi-bar' : ''}`} />}
                {failed.has(n) && <span className="sr-only">photograph unavailable</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      {hasVisiblePhoto && (
        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10"
          onPointerDownCapture={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
          <GalleryActions items={galleryItems} index={i} tone="dark"
            onSelect={n => { setTarget(n); setPaused(true); }} />
        </div>
      )}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[min(96vw,1200px)] border-none bg-ink-900 p-4 text-ivory-100 sm:p-6"
          onCloseAutoFocus={(e) => { e.preventDefault(); viewerTrigger.current?.focus({ preventScroll: true }); }}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); if (!loading) go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); if (!loading) go(-1); } }}>
          <DialogTitle className="sr-only">Historical collaboration — {s.people}</DialogTitle>
          <figure className="min-w-0">
            <img src={srcOf(s)} alt={`${s.people} — ${caption}`} className="mx-auto max-h-[65dvh] w-full object-contain" />
            <figcaption className="mt-3 text-center text-sm"><strong className="text-gold-400">{s.people}</strong><span className="mt-1 block">{caption}</span></figcaption>
          </figure>
          <div className="flex justify-center gap-3">
            <button type="button" disabled={loading} onClick={() => go(-1)} aria-label="Previous partner photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-gold-400/60 text-gold-400 disabled:opacity-40"><ChevronLeft aria-hidden="true" size={18} /></button>
            <span className="self-center text-xs" aria-live="polite">{loading ? 'Loading photograph' : `${i + 1} / ${SLIDES.length}`}</span>
            <button type="button" disabled={loading} onClick={() => go(1)} aria-label="Next partner photograph" className="tomi-cta grid h-11 w-11 place-items-center border border-gold-400/60 text-gold-400 disabled:opacity-40"><ChevronRight aria-hidden="true" size={18} /></button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
