import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import PersonPortrait, { PortraitCredit } from '@/components/editorial/PersonPortrait';
import { SEVEN_EMIRATES, emirateRuler, stepIndex, COUNCIL_SOURCE, INTRO_SOURCE } from '@/lib/emirates-experience';
import { useEmAmbient, useEmReveal, useSwipe } from './use-emirates-motion';

/** Chapter 02 — schematic federation composition + direct selector; one emirate at a time. */
export default function FederationChapter({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const reveal = useEmReveal<HTMLElement>();
  const ambient = useEmAmbient<HTMLDivElement>();
  const e = SEVEN_EMIRATES[index]!;
  const ruler = emirateRuler(e);
  const prev = useCallback(() => onSelect(stepIndex(index, -1)), [index, onSelect]);
  const next = useCallback(() => onSelect(stepIndex(index, 1)), [index, onSelect]);
  const swipe = useSwipe(prev, next);
  const pts = SEVEN_EMIRATES.map((s) => `${s.x * 10},${s.y * 5}`).join(' ');

  return (
    <section ref={reveal} id="em-federation" aria-labelledby="em-fed-h" className="relative overflow-hidden bg-ivory-50 py-section-lg" style={{ scrollMarginTop: 80 }}>
      <div className="mx-auto max-w-6xl px-6">
        <p className="em-r-fade text-eyebrow text-gold-600">02 · THE UAE</p>
        <h2 id="em-fed-h" className="mt-4 font-display text-[clamp(2.4rem,6.5vw,5rem)] leading-[0.95] text-ink-900">
          <span className="em-mask"><span className="em-r-line block">SEVEN EMIRATES.</span></span>
          <span className="em-mask"><span className="em-r-line block text-lagoon-600" style={{ ['--d' as string]: '120ms' }}>ONE FEDERATION.</span></span>
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div ref={ambient} className="em-r-wide relative lg:col-span-7" {...swipe} style={{ ...swipe.style, ['--d' as string]: '200ms' }}>
            <figure className="em-lattice relative overflow-hidden border border-gold-500/30 bg-lagoon-900 transition-colors duration-500" style={{ backgroundColor: `hsl(${e.hue} 45% 13%)` }}>
              <svg viewBox="0 0 1000 500" className="block h-auto w-full" role="img" aria-label={`Schematic of the seven emirates, ${e.name} selected`}>
                <text x="60" y="80" className="fill-ivory-300/50 font-display" fontSize="22" letterSpacing="6">ARABIAN GULF</text>
                <text x="920" y="300" className="fill-ivory-300/50 font-display" fontSize="18" letterSpacing="5" transform="rotate(90 920 300)">GULF OF OMAN</text>
                <polyline points={pts} pathLength={1} fill="none" className="em-draw stroke-gold-500/50" strokeWidth="1.5" strokeDasharray="1" />
                {SEVEN_EMIRATES.map((s, i) => {
                  const on = i === index;
                  return (
                    <g key={s.id} transform={`translate(${s.x * 10} ${s.y * 5})`}>
                      {on && <circle r="14" className="em-pulse fill-none stroke-gold-400" strokeWidth="2" />}
                      <circle r={on ? 13 : 9} className="em-node" data-on={on} fill={on ? 'hsl(39 52% 54%)' : 'hsl(40 40% 96% / .55)'} />
                      <text y={-24} textAnchor="middle" fontSize={on ? 22 : 16} className={on ? 'fill-gold-400 font-display' : 'fill-ivory-200/70 font-display'} style={{ transition: 'fill 450ms' }}>{s.name}</text>
                    </g>
                  );
                })}
              </svg>
              <figcaption className="border-t border-gold-500/25 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ivory-300/80">Schematic composition · relative positions only · not an official or to-scale map</figcaption>
            </figure>
          </div>

          <div className="lg:col-span-5" aria-live="polite">
            <div key={e.id} className="flex gap-5">
              {ruler && <PersonPortrait slug={ruler.slug} name={ruler.name} contain className="em-portrait-in h-32 w-24 shrink-0 overflow-hidden bg-lagoon-900 sm:h-40 sm:w-32" />}
              <div className="min-w-0">
                <p className="em-mask"><span className="em-swap-mask block font-display text-3xl text-ink-900 sm:text-4xl" data-testid="text-emirate-name">{e.name}</span></p>
                <p lang="ar" dir="rtl" className="em-ar em-mask mt-1 text-xl text-gold-600"><span className="em-swap-mask block" style={{ ['--d' as string]: '90ms' }}>{e.ar}</span></p>
                {ruler && <p className="em-mask mt-3"><span className="em-swap-mask block text-sm font-semibold text-ink-900" style={{ ['--d' as string]: '180ms' }} data-testid="text-emirate-ruler">{ruler.name}</span></p>}
                {ruler && <p className="em-mask"><span className="em-swap-mask block text-xs text-ink-700" style={{ ['--d' as string]: '240ms' }}>{ruler.role}</span></p>}
              </div>
            </div>
            <p key={`${e.id}-i`} className="em-swap-mask mt-5 leading-relaxed text-ink-800" style={{ ['--d' as string]: '300ms' }} data-testid="text-emirate-intro">{e.intro}</p>
            <a href={INTRO_SOURCE.href} target="_blank" rel="noopener noreferrer" className="em-focus mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs text-lagoon-700 underline" data-testid="link-emirate-intro-source">Intro: {INTRO_SOURCE.label} <ExternalLink className="h-3 w-3" aria-hidden /></a>
            <br />
            <a href={ruler?.source ?? COUNCIL_SOURCE} target="_blank" rel="noopener noreferrer" className="em-focus mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs text-lagoon-700 underline" data-testid="link-emirate-source">Ruler and title: UAE Cabinet · Federal Supreme Council <ExternalLink className="h-3 w-3" aria-hidden /></a>
            {ruler && <PortraitCredit slug={ruler.slug} />}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <button type="button" onClick={prev} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-sand-300 text-ink-900 hover:border-gold-500" aria-label="Previous emirate" data-testid="button-emirate-prev"><ChevronLeft className="h-5 w-5" /></button>
          <div role="group" aria-label="Choose an emirate" className="em-noscroll flex flex-1 gap-1 overflow-x-auto">
            {SEVEN_EMIRATES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => onSelect(i)} aria-pressed={i === index}
                className={`em-focus em-r-fade min-h-11 shrink-0 border-b-2 px-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${i === index ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-700 hover:text-ink-900'}`}
                style={{ ['--d' as string]: `${300 + i * 120}ms` }} data-testid={`button-emirate-${s.id}`}>{s.name}</button>
            ))}
          </div>
          <button type="button" onClick={next} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-sand-300 text-ink-900 hover:border-gold-500" aria-label="Next emirate" data-testid="button-emirate-next"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-xs text-ink-700">Swipe the composition on touch screens. Names and titles from the UAE Cabinet's Federal Supreme Council page. Portraits come from mixed sources (government, court and press archives); each photo credit names its own. Presented for information; no endorsement of TOMI is implied.</p>
      </div>
    </section>
  );
}
