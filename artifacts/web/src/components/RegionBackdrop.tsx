import { useEffect, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import emiratesArt from '@/assets/media/editorial/emirates-dunes.webp';
import africaArt from '@/assets/media/editorial/region-africa.webp';
import europeArt from '@/assets/media/editorial/region-europe.webp';

export type Region = 'africa' | 'europe' | 'emirates' | 'americas' | 'asia' | 'oceania';

const ART: Partial<Record<Region, { src: string; credit: string; position: string }>> = {
  emirates: { src: emiratesArt, credit: 'Dubai dunes artwork supplied by The One Movement', position: '60% 55%' },
  africa: { src: africaArt, credit: 'Illustrative artwork: monuments across Africa', position: '60% 50%' },
  europe: { src: europeArt, credit: 'Illustrative artwork: landmarks across Europe', position: '60% 50%' },
};

/** Original SVG horizons for continents without supplied art. */
const SVG_HORIZON: Partial<Record<Region, string>> = {
  americas: 'M0 120 L80 120 L90 60 L100 120 L220 120 L230 40 L238 40 L246 120 L400 120 Q460 70 520 120 L640 120 L650 30 L660 120 L800 120 V160 H0 Z',
  asia: 'M0 120 L120 120 L140 80 L160 120 L300 120 Q340 60 380 120 L420 120 L430 20 L440 120 L560 120 L580 90 L600 120 L800 120 V160 H0 Z',
  oceania: 'M0 120 L200 120 Q240 70 270 120 Q300 80 330 120 L500 120 L520 60 L540 120 L800 120 V160 H0 Z',
};

interface RegionBackdropProps {
  region: Region;
  children: ReactNode;
  className?: string;
  minHeight?: string;
  /** Show the pause/play control (default true) */
  controls?: boolean;
  /** Deprecated: background credits are listed in page sources */
  credit?: boolean;
}

export default function RegionBackdrop({ region, children, className, minHeight = '28rem', controls = true }: RegionBackdropProps) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const still = paused || reduced;
  const art = ART[region];
  const horizon = SVG_HORIZON[region];

  return (
    <section
      className={cn('region-backdrop relative isolate overflow-hidden bg-lagoon-900 text-ivory-100', className)}
      style={{ minHeight }}
      data-region={region}
      data-paused={still ? 'true' : 'false'}
      data-testid={`region-backdrop-${region}`}
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {art ? (
          <img src={art.src} alt="" loading="lazy" decoding="async" className="region-backdrop-art" style={{ objectPosition: art.position }} />
        ) : (
          <svg className="region-backdrop-art" viewBox="0 0 800 160" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id={`rb-sky-${region}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="hsl(187 67% 14%)" />
                <stop offset="0.75" stopColor="hsl(37 62% 40%)" />
                <stop offset="1" stopColor="hsl(39 52% 54%)" />
              </linearGradient>
            </defs>
            <rect width="800" height="160" fill={`url(#rb-sky-${region})`} />
            <circle cx="560" cy="96" r="22" fill="hsl(43 80% 73% / 0.7)" />
            {horizon && <path d={horizon} fill="hsl(187 67% 8%)" />}
          </svg>
        )}
        <span className="kuba-field" />
        <span className="region-backdrop-veil absolute inset-0" />
      </div>

      <div className="relative z-10">{children}</div>

      {controls && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          disabled={reduced}
          aria-pressed={still}
          aria-label={still ? 'Play background motion' : 'Pause background motion'}
          className="region-backdrop-toggle"
          data-testid={`button-region-motion-${region}`}
        >
          {still ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          <span>{reduced ? 'Motion reduced' : still ? 'Play' : 'Pause'}</span>
        </button>
      )}
    </section>
  );
}
