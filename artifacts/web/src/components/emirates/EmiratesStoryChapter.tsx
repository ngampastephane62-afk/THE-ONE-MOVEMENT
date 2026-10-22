import { useEmAmbient, useEmReveal } from './use-emirates-motion';
import { WORLD_GOLD, WORLD_HUBS, UAE_ON_WORLD, arc, MediaCredit } from './emirates-media';

export function EmiratesConnectionChapter() {
  return <section id="em-connections" aria-label="The Emirates connecting the world"><ConnectorFeature /></section>;
}

/** Full-bleed world artwork with routes drawn from the UAE to each continent. */
function ConnectorFeature() {
  const r = useEmReveal<HTMLDivElement>();
  const ambient = useEmAmbient<HTMLElement>();
  return (
    <div ref={r} className="relative overflow-hidden bg-[hsl(30_20%_4%)] text-ivory-100" data-testid="story-statement-cooperation">
      <figure ref={ambient} className="em-r-media relative mx-auto max-w-[1400px]">
        <div className="relative aspect-[1000/667]">
          <img src={WORLD_GOLD.src} alt={WORLD_GOLD.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
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
          <span className="em-mask"><span className="em-r-line block" style={{ ['--d' as string]: '120ms' }}>A NATION</span></span>
          <span className="em-mask"><span className="em-r-line block text-gold-400" style={{ ['--d' as string]: '240ms' }}>CONNECTING THE WORLD.</span></span>
        </h3>
        <p className="em-r-fade mt-4 max-w-md leading-relaxed text-ivory-200" style={{ ['--d' as string]: '380ms' }}>Ports, routes and partnerships linking continents, alongside humanitarian and cultural cooperation.</p>
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pb-8"><MediaCredit m={WORLD_GOLD} tone="dark" /></div>
    </div>
  );
}
