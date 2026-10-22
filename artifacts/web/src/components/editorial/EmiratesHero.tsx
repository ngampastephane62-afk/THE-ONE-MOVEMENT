import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import emiratesArt from '@/assets/media/editorial/emirates-dunes.webp';

/**
 * Classic moving background for Thanks Emirates: a slow panorama of stylised
 * silhouettes for all seven emirates, with a UAE flag band. Pausable and
 * static under prefers-reduced-motion. Silhouettes are generic, not photographs.
 */

const EMIRATES: { name: string; ar: string; shape: ReactNode }[] = [
  { name: 'Abu Dhabi', ar: 'أبوظبي', shape: (<g><path d="M20 120 Q60 70 100 120 Z" /><rect x="56" y="58" width="8" height="40" /><rect x="36" y="74" width="4" height="30" /><rect x="80" y="74" width="4" height="30" /><circle cx="60" cy="56" r="10" /></g>) },
  { name: 'Dubai', ar: 'دبي', shape: (<g><path d="M60 4 L64 120 L56 120 Z" /><rect x="30" y="70" width="14" height="50" /><rect x="80" y="60" width="12" height="60" /><path d="M100 120 Q108 50 120 40 L120 120 Z" /></g>) },
  { name: 'Sharjah', ar: 'الشارقة', shape: (<g><rect x="20" y="80" width="90" height="40" /><path d="M40 80 Q65 40 90 80 Z" /><rect x="22" y="44" width="6" height="40" /><rect x="102" y="44" width="6" height="40" /></g>) },
  { name: 'Ajman', ar: 'عجمان', shape: (<g><rect x="30" y="64" width="50" height="56" /><rect x="26" y="56" width="12" height="12" /><rect x="72" y="56" width="12" height="12" /><path d="M86 120 L100 96 L114 120 Z" /></g>) },
  { name: 'Umm Al Quwain', ar: 'أم القيوين', shape: (<g><rect x="34" y="70" width="40" height="50" /><path d="M34 70 L54 50 L74 70 Z" /><path d="M80 120 Q96 96 116 120 Z" /><path d="M88 112 L96 80 L98 112 Z" /></g>) },
  { name: 'Ras Al Khaimah', ar: 'رأس الخيمة', shape: (<g><path d="M0 120 L30 50 L52 84 L74 30 L110 120 Z" /><rect x="84" y="86" width="16" height="34" /></g>) },
  { name: 'Fujairah', ar: 'الفجيرة', shape: (<g><path d="M0 120 L24 70 L46 96 L64 60 L90 120 Z" /><rect x="70" y="84" width="34" height="36" /><circle cx="87" cy="80" r="8" /></g>) },
];

/**
 * Opt-in props (defaults keep the original behaviour): `externalPaused` merges a
 * page-level visitor pause; `pauseOffscreen` stops the panorama offscreen or in a hidden tab.
 */
export default function EmiratesHero({ children, externalPaused = false, pauseOffscreen = false }: { children: ReactNode; externalPaused?: boolean; pauseOffscreen?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [away, setAway] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!pauseOffscreen) return;
    const el = rootRef.current;
    let off = false;
    const sync = () => setAway(off || document.visibilityState === 'hidden');
    const io = el && typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([e]) => { off = !e.isIntersecting; sync(); }) : null;
    if (el) io?.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, [pauseOffscreen]);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const still = paused || reduced || externalPaused || away;
  const strip = [...EMIRATES, ...EMIRATES];

  return (
    <section ref={rootRef} className="relative isolate flex min-h-[92dvh] items-end overflow-hidden bg-lagoon-900 text-ivory-100">
      <style>{`
        @keyframes tomi-pan { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @keyframes tomi-drift { 0%,100% { transform: translate3d(0,0,0); opacity:.55; } 50% { transform: translate3d(0,-10px,0); opacity:.85; } }
        .tomi-pan { animation: tomi-pan 90s linear infinite; }
        .tomi-pan-slow { animation: tomi-pan 160s linear infinite; }
        .tomi-drift { animation: tomi-drift 12s ease-in-out infinite; }
        .tomi-still .tomi-pan, .tomi-still .tomi-pan-slow, .tomi-still .tomi-drift { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tomi-pan, .tomi-pan-slow, .tomi-drift { animation: none; } }
      `}</style>

      <div className={`pointer-events-none absolute inset-0 -z-10 ${still ? 'tomi-still' : ''}`} aria-hidden="true">
        <img src={emiratesArt} alt="" decoding="async" className="region-backdrop-art" style={{ objectPosition: '62% 50%', animationPlayState: still ? 'paused' : 'running' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(39_52%_54%/0.28),transparent_55%),radial-gradient(ellipse_at_10%_90%,hsl(187_60%_30%/0.6),transparent_60%)]" />
        <div className="tomi-drift absolute right-[12%] top-[14%] h-40 w-40 rounded-full bg-gold-400/20 blur-2xl" />

        {/* far dunes */}
        <div className="tomi-pan-slow absolute bottom-[18%] left-0 flex w-[200%] text-lagoon-800">
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-32 w-1/2 fill-current opacity-80"><path d="M0 120 Q150 30 300 80 T600 70 T900 90 T1200 60 V120 Z" /></svg>
          ))}
        </div>

        {/* seven emirates panorama */}
        <div className="tomi-pan absolute bottom-0 left-0 flex w-max">
          {strip.map((e, i) => (
            <figure key={`${e.name}-${i}`} className="flex w-[260px] flex-col items-center px-6 sm:w-[340px]">
              <svg viewBox="0 0 130 120" className="h-36 w-full fill-current text-lagoon-700/90 sm:h-48">{e.shape}</svg>
              <figcaption className="w-full border-t border-gold-500/30 bg-lagoon-900/70 py-3 text-center">
                <span className="block font-display text-sm uppercase tracking-[0.28em] text-gold-400">{e.name}</span>
                <span lang="ar" dir="rtl" className="mt-1 block text-xs text-ivory-300" style={{ fontFamily: 'var(--font-arabic)' }}>{e.ar}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-lagoon-900/55 via-lagoon-900/10 to-lagoon-900/95" />
      </div>

      {/* UAE flag band */}
      <div className="absolute left-0 top-0 flex h-full w-2 flex-col sm:w-3" aria-label="Flag of the United Arab Emirates" role="img">
        <span className="absolute inset-y-0 left-0 w-full" style={{ background: 'hsl(355 78% 45%)' }} />
        <span className="absolute left-full top-0 h-1/3 w-1" style={{ background: 'hsl(150 100% 25%)' }} />
        <span className="absolute left-full top-1/3 h-1/3 w-1" style={{ background: 'hsl(40 40% 96%)' }} />
        <span className="absolute left-full top-2/3 h-1/3 w-1" style={{ background: 'hsl(190 30% 8%)' }} />
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        disabled={reduced || externalPaused}
        className="absolute right-5 top-24 z-10 inline-flex items-center gap-2 border border-gold-500/40 bg-lagoon-900/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-gold-400 backdrop-blur disabled:opacity-50"
        aria-pressed={paused || externalPaused}
        data-testid="button-toggle-hero-motion"
      >
        {paused || externalPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        {reduced ? 'Motion reduced' : paused || externalPaused ? 'Play' : 'Pause'}
      </button>

      <p className="absolute bottom-2 right-4 z-10 text-[10px] tracking-wide text-ivory-300/70">Dubai dunes artwork supplied by The One Movement</p>
      <div className="relative w-full pb-[clamp(14rem,30vh,18rem)]">{children}</div>
    </section>
  );
}
