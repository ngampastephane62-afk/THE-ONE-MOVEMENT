import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import ArchivePhoto from '@/components/ArchivePhoto';
import catalog from '@/assets/media/founder/catalog.json';
import { usePrefersReducedMotion } from './util';

type PhotoId = keyof typeof catalog.photos;

const SLIDES: { id: PhotoId; word: string; region: string; people: string; position?: string }[] = [
  { id: 'office-encounter', word: 'TRUST', region: 'UAE', people: 'Yuston Nessy · Private Office of Sheikh Saeed bin Ahmed Al Maktoum' },
  { id: 'institutional-dialogue', word: 'DIALOGUE', region: 'Institutions', people: 'Yuston Nessy · Institutional meeting' },
  { id: 'diplomatic-encounter', word: 'DIPLOMACY', region: 'Abu Dhabi · UAE', people: 'Yuston Nessy · Ambassador of the DRC to the UAE', position: 'center 40%' },
  { id: 'global-encounter', word: 'ACCESS', region: 'International', people: 'Yuston Nessy · Ambassador of Tanzania' },
  { id: 'conversation', word: 'CONVERSATION', region: 'Culture & business', people: 'Yuston Nessy · Dr Denis Mukwege' },
];
const DURATION = 6500;

export default function PartnerOrbitStage() {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoverHold, setHoverHold] = useState(false);
  const running = !reduced && !paused && !hoverHold;
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => setI((n) => (n + 1) % SLIDES.length), DURATION);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [i, running]);

  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);
  const s = SLIDES[i];
  const p = catalog.photos[s.id];

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
        .tomi-rise { animation: tomi-rise .9s cubic-bezier(.2,.7,.1,1) both; }
        .tomi-in { animation: tomi-in 1.1s cubic-bezier(.2,.7,.1,1) both; }
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
          <h1 className="mt-6 text-2xl text-ivory-100 uppercase sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Build with the Movement.
          </h1>
          <p className="mt-4 max-w-lg text-ivory-200 leading-relaxed">
            Ambassadors, private offices and institutions connected to a global Africa–UAE–international network, opening routes to collaboration and access.
          </p>
          <div key={`c-${i}`} className="tomi-rise mt-8 border-l border-gold-500/60 pl-4" style={{ animationDelay: '180ms' }} aria-live={running ? 'off' : 'polite'}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              {String(i + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} · {s.region}
            </p>
            <p className="mt-2 text-lg text-ivory-100" data-testid="text-partner-caption">{p.caption}</p>
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
               <div key={`p-${i}`} className="tomi-in h-full w-full">
                 <ArchivePhoto id={s.id} priority={i === 0} frameClassName="aspect-square" objectPosition={s.position ?? 'center 30%'} sizes="(min-width: 1024px) 34vw, 72vw" alt={`${s.people} — ${p.caption}`} />
              </div>
            </div>
          </div>
           <div className="mt-4 max-w-md text-center" aria-live={running ? 'off' : 'polite'} data-testid="text-partner-people">
             <p className="text-sm font-semibold leading-relaxed text-gold-400">{s.people}</p>
             <p className="mt-1 text-xs leading-relaxed text-ivory-200">{p.caption}</p>
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
          <div className="mt-4 flex w-full max-w-xs gap-2" role="tablist" aria-label="Choose partner photograph">
            {SLIDES.map((sl, n) => (
              <button key={sl.id} role="tab" aria-selected={n === i} aria-label={catalog.photos[sl.id].caption} onClick={() => setI(n)} data-testid={`button-stage-dot-${n}`} className="relative h-6 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                <span className="absolute inset-x-0 top-1/2 h-px bg-ivory-100/25" />
                {n === i && <span key={`b-${i}-${running}`} className={`absolute inset-x-0 top-1/2 h-px bg-gold-400 ${running ? 'tomi-bar' : ''}`} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
