import emiratesArt from '@/assets/media/editorial/emirates-dunes.webp';
import { SEVEN_EMIRATES } from '@/lib/emirates-experience';
import { useEmAmbient, useEmReveal } from './use-emirates-motion';

function SevenDots() {
  return <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
    {SEVEN_EMIRATES.map((s, i) => { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; return <g key={s.id}><line x1="200" y1="150" x2={200 + Math.cos(a) * 110} y2={150 + Math.sin(a) * 110} className="stroke-gold-500/40" pathLength={1} /><circle cx={200 + Math.cos(a) * 110} cy={150 + Math.sin(a) * 110} r="9" className="fill-gold-400" /></g>; })}
    <circle cx="200" cy="150" r="22" className="fill-none stroke-gold-400" strokeWidth="2" />
  </svg>;
}
function Meridians() {
  return <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
    {[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx="200" cy="150" rx={30 + k * 34} ry="120" className="fill-none stroke-gold-400/50" />)}
    {[-80, -40, 0, 40, 80].map((y) => <line key={y} x1="40" x2="360" y1={150 + y} y2={150 + y} className="stroke-gold-400/30" />)}
    <path d="M70 200 Q200 40 330 120" className="fill-none stroke-coral-500" strokeWidth="2" />
  </svg>;
}
function Arches() {
  return <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M${60 + k * 75} 260 V150 a35 35 0 0 1 70 0 V260`} className="fill-none stroke-gold-400/70" strokeWidth="2" />)}
    <line x1="40" x2="360" y1="260" y2="260" className="stroke-gold-400" />
  </svg>;
}

const STATEMENTS = [
  { k: 'unity', a: 'SEVEN EMIRATES.', b: 'ONE SHARED VISION.', d: 'Seven emirates joined as one federation, each keeping its own character.', v: <SevenDots /> },
  { k: 'culture', a: 'MANY CULTURES.', b: 'ONE DAILY LIFE.', d: 'Communities from many nationalities living and working side by side.', v: <Arches /> },
  { k: 'opportunity', a: 'ROOM TO BUILD.', b: 'ROOM TO BELONG.', d: 'Entrepreneurs, creators and professionals describe the Emirates as a place where ideas could be tried.', img: true },
  { k: 'cooperation', a: 'A NATION', b: 'CONNECTING THE WORLD.', d: 'Ports, routes and partnerships linking continents, alongside humanitarian and cultural cooperation.', v: <Meridians /> },
];

/** Chapter 04 — short statements with opposing media/text masks and a media push. No metrics. */
export default function EmiratesStoryChapter() {
  const ambient = useEmAmbient<HTMLElement>();
  return (
    <section ref={ambient} aria-labelledby="em-story-h" className="bg-ivory-100 py-section-lg">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-eyebrow text-gold-600">04 · THE EMIRATES STORY</p>
        <h2 id="em-story-h" className="sr-only">The Emirates story: vision and achievements</h2>
        <div className="mt-8 space-y-16 sm:space-y-24">
          {STATEMENTS.map((s, i) => <Statement key={s.k} s={s} flip={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  );
}

function Statement({ s, flip }: { s: (typeof STATEMENTS)[number]; flip: boolean }) {
  const r = useEmReveal<HTMLDivElement>();
  return (
    <div ref={r} className="grid gap-8 md:grid-cols-12 md:items-center" data-testid={`story-statement-${s.k}`}>
      <div className={`em-r-media relative aspect-[4/3] overflow-hidden bg-lagoon-900 md:col-span-6 ${flip ? 'md:order-2' : ''}`}>
        {s.img ? <img src={emiratesArt} alt="" loading="lazy" decoding="async" className="em-drift absolute inset-0 h-full w-full scale-110 object-cover" /> : <div className="em-lattice absolute inset-0 p-8">{s.v}</div>}
      </div>
      <div className={`md:col-span-5 ${flip ? 'md:col-start-1 md:order-1' : 'md:col-start-8'}`}>
        <h3 className="font-display text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1] text-ink-900">
          <span className="em-mask"><span className={`${flip ? 'em-r-xr' : 'em-r-x'} block`} style={{ ['--d' as string]: '150ms' }}>{s.a}</span></span>
          <span className="em-mask"><span className={`${flip ? 'em-r-xr' : 'em-r-x'} block text-lagoon-600`} style={{ ['--d' as string]: '270ms' }}>{s.b}</span></span>
        </h3>
        <p className="em-r-fade mt-5 max-w-md leading-relaxed text-ink-800" style={{ ['--d' as string]: '420ms' }}>{s.d}</p>
      </div>
    </div>
  );
}
