import emiratesArt from '@/assets/media/editorial/emirates-dunes.webp';
import { useEmAmbient, useEmReveal } from './use-emirates-motion';
import { SHARED_VISION, AL_FAHIDI, WORLD_GOLD, WORLD_HUBS, UAE_ON_WORLD, arc, MediaCredit, type EmMedia } from './emirates-media';

const DUNES: EmMedia = { src: emiratesArt, alt: '', credit: '' };

type Statement = { k: string; a: string; b: string; d: string; m: EmMedia; world?: boolean };
const STATEMENTS: Statement[] = [
  { k: 'unity', a: 'SEVEN EMIRATES.', b: 'ONE SHARED VISION.', d: 'Seven emirates joined as one federation, each keeping its own character.', m: SHARED_VISION },
  { k: 'culture', a: 'MANY CULTURES.', b: 'ONE DAILY LIFE.', d: 'Communities from many nationalities living and working side by side.', m: AL_FAHIDI },
  { k: 'opportunity', a: 'ROOM TO BUILD.', b: 'ROOM TO BELONG.', d: 'Entrepreneurs, creators and professionals describe the Emirates as a place where ideas could be tried.', m: DUNES },
  { k: 'cooperation', a: 'A NATION', b: 'CONNECTING THE WORLD.', d: 'Ports, routes and partnerships linking continents, alongside humanitarian and cultural cooperation.', m: WORLD_GOLD, world: true },
];

/** Chapter 04 — statements paired with real photography and the Founder world artwork. No metrics. */
export default function EmiratesStoryChapter() {
  const ambient = useEmAmbient<HTMLElement>();
  return (
    <section ref={ambient} aria-labelledby="em-story-h" className="bg-ivory-100 py-section-lg">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-eyebrow text-gold-600">04 · THE EMIRATES STORY</p>
        <h2 id="em-story-h" className="sr-only">The Emirates story: vision and achievements</h2>
        <div className="mt-8 space-y-20 sm:space-y-28">
          {STATEMENTS.filter((s) => !s.world).map((s, i) => <StatementRow key={s.k} s={s} flip={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  );
}

export function EmiratesConnectionChapter() {
  return <section id="em-connections" aria-label="The Emirates connecting the world"><ConnectorFeature s={STATEMENTS[3]!} /></section>;
}

function StatementRow({ s, flip }: { s: Statement; flip: boolean }) {
  const r = useEmReveal<HTMLDivElement>();
  const ambient = useEmAmbient<HTMLElement>();
  return (
    <div ref={r} className="grid gap-8 md:grid-cols-12 md:items-center" data-testid={`story-statement-${s.k}`}>
      <figure ref={ambient} className={`md:col-span-7 ${flip ? 'md:order-2 md:col-start-6' : ''}`}>
        <div className="em-r-media relative aspect-[4/3] overflow-hidden bg-lagoon-900 md:aspect-[16/11]">
          <img src={s.m.src} alt={s.m.alt} loading="lazy" decoding="async" className="em-kb absolute inset-0 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_hsl(39_52%_54%/.35)]" aria-hidden />
        </div>
        {s.m.credit && <figcaption><MediaCredit m={s.m} /></figcaption>}
      </figure>
      <div className={`md:col-span-4 ${flip ? 'md:order-1 md:col-start-1' : 'md:col-start-9'}`}>
        <h3 className="font-display text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1] text-ink-900">
          <span className="em-mask"><span className={`${flip ? 'em-r-xr' : 'em-r-x'} block`} style={{ ['--d' as string]: '150ms' }}>{s.a}</span></span>
          <span className="em-mask"><span className={`${flip ? 'em-r-xr' : 'em-r-x'} block text-lagoon-600`} style={{ ['--d' as string]: '270ms' }}>{s.b}</span></span>
        </h3>
        <span className="em-r-conn em-hair mt-6 block w-24" style={{ ['--d' as string]: '380ms' }} aria-hidden />
        <p className="em-r-fade mt-5 max-w-md leading-relaxed text-ink-800" style={{ ['--d' as string]: '420ms' }}>{s.d}</p>
      </div>
    </div>
  );
}

/** Full-bleed world artwork with routes drawn from the UAE to each continent. */
function ConnectorFeature({ s }: { s: Statement }) {
  const r = useEmReveal<HTMLDivElement>();
  const ambient = useEmAmbient<HTMLElement>();
  return (
    <div ref={r} className="relative overflow-hidden bg-[hsl(30_20%_4%)] text-ivory-100" data-testid={`story-statement-${s.k}`}>
      <figure ref={ambient} className="em-r-media relative mx-auto max-w-[1400px]">
        <div className="relative aspect-[1000/667]">
          <img src={s.m.src} alt={s.m.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
          <svg viewBox="0 0 1000 667" className="absolute inset-0 h-full w-full" aria-hidden>
            {WORLD_HUBS.map((h, i) => (
              <g key={h.k}>
                <path d={arc(h)} pathLength={1} fill="none" stroke="hsl(39 70% 66% / .75)" strokeWidth="1.1" className="em-route" style={{ ['--d' as string]: `${300 + i * 140}ms` }} />
                <path d={arc(h)} pathLength={1} fill="none" stroke="hsl(40 90% 85%)" strokeWidth="2" strokeLinecap="round" className="em-route-pulse" style={{ animationDelay: `${i * 0.6}s` }} />
                <circle cx={h.x} cy={h.y} r="3" fill="hsl(40 90% 85%)" />
              </g>
            ))}
            <circle cx={UAE_ON_WORLD.x} cy={UAE_ON_WORLD.y} r="9" className="em-pulse" fill="none" stroke="hsl(19 72% 62%)" strokeWidth="1.5" />
            <circle cx={UAE_ON_WORLD.x} cy={UAE_ON_WORLD.y} r="5" fill="hsl(19 72% 62%)" stroke="hsl(40 40% 97%)" strokeWidth="1.2" />
            <text x={UAE_ON_WORLD.x + 12} y={UAE_ON_WORLD.y + 22} fontSize="12" letterSpacing="3" fill="hsl(40 40% 96%)">UAE</text>
          </svg>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(30_20%_4%/.85)_0%,transparent_28%,transparent_70%,hsl(30_20%_4%)_100%)]" aria-hidden />
        </div>
      </figure>
      <div className="relative mx-auto -mt-20 max-w-6xl px-6 pb-16 sm:-mt-28 md:absolute md:inset-x-0 md:top-0 md:mt-0 md:pt-16">
        <p className="em-r-fade mb-4 text-eyebrow text-gold-400">05 · A GLOBAL BRIDGE</p>
        <h3 className="font-display text-[clamp(2.2rem,5.4vw,4.25rem)] leading-[0.98]">
          <span className="em-mask"><span className="em-r-line block" style={{ ['--d' as string]: '120ms' }}>{s.a}</span></span>
          <span className="em-mask"><span className="em-r-line block text-gold-400" style={{ ['--d' as string]: '240ms' }}>{s.b}</span></span>
        </h3>
        <p className="em-r-fade mt-4 max-w-md leading-relaxed text-ivory-200" style={{ ['--d' as string]: '380ms' }}>{s.d}</p>
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pb-8"><MediaCredit m={s.m} tone="dark" /></div>
    </div>
  );
}
