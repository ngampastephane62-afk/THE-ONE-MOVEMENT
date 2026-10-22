import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { PortraitCredit } from '@/components/editorial/PersonPortrait';
import { SEVEN_EMIRATES, emirateRuler, stepIndex, COUNCIL_SOURCE, INTRO_SOURCE } from '@/lib/emirates-experience';
import { useEmAmbient, useEmReveal, useSwipe } from './use-emirates-motion';
import UaeLocator from './UaeLocator';
import RulerPortrait from './RulerPortrait';

/** Chapter 02 — authentic UAE outline locator + one emirate profile at a time. */
export default function FederationChapter({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const reveal = useEmReveal<HTMLElement>();
  const ambient = useEmAmbient<HTMLDivElement>();
  const e = SEVEN_EMIRATES[index]!;
  const ruler = emirateRuler(e);
  const prev = useCallback(() => onSelect(stepIndex(index, -1)), [index, onSelect]);
  const next = useCallback(() => onSelect(stepIndex(index, 1)), [index, onSelect]);
  const swipe = useSwipe(prev, next);

  return (
    <section ref={reveal} id="em-federation" aria-labelledby="em-fed-h" className="relative overflow-hidden bg-ivory-50 py-section-lg" style={{ scrollMarginTop: 80 }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="em-r-fade text-eyebrow text-gold-600">02 · THE UAE</p>
            <h2 id="em-fed-h" className="mt-4 font-display text-[clamp(2.4rem,6.5vw,5rem)] leading-[0.95] text-ink-900">
              <span className="em-mask"><span className="em-r-line block">SEVEN EMIRATES.</span></span>
              <span className="em-mask"><span className="em-r-line block text-lagoon-600" style={{ ['--d' as string]: '120ms' }}>ONE FEDERATION.</span></span>
            </h2>
          </div>
          <p className="em-r-fade font-mono text-sm tracking-[0.2em] text-ink-700" style={{ ['--d' as string]: '240ms' }} aria-hidden>
            <span className="text-ink-900">{String(index + 1).padStart(2, '0')}</span> / 07
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div ref={ambient} className="em-r-wide relative lg:col-span-7" {...swipe} style={{ ...swipe.style, ['--d' as string]: '200ms' }}>
            <figure className="relative">
              <div className="pointer-events-none absolute inset-x-[8%] bottom-[6%] top-[14%] rounded-[50%] bg-[radial-gradient(closest-side,hsl(189_40%_80%/.35),transparent)]" aria-hidden />
              <UaeLocator index={index} onSelect={onSelect} />
              <figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-700/80">Map outline: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer" className="em-focus underline" data-testid="link-map-source">Natural Earth</a> · public domain · marker: capital city</figcaption>
            </figure>
          </div>

          <div className="lg:col-span-5" aria-live="polite">
            <div key={e.id} className="flex gap-6">
              {ruler && <RulerPortrait slug={ruler.slug} name={ruler.name} light box="h-44 w-32 shrink-0 sm:h-52 sm:w-40" />}
              <div className="min-w-0 self-center">
                <p className="em-mask"><span className="em-swap-mask block font-display text-3xl text-ink-900 sm:text-4xl" data-testid="text-emirate-name">{e.name}</span></p>
                <p lang="ar" dir="rtl" className="em-ar em-mask mt-1 text-xl text-gold-600"><span className="em-swap-mask block" style={{ ['--d' as string]: '90ms' }}>{e.ar}</span></p>
                <div className="em-hair em-swap-mask my-3 w-16" style={{ ['--d' as string]: '150ms' }} aria-hidden />
                {ruler && <p className="em-mask"><span className="em-swap-mask block text-sm font-semibold text-ink-900" style={{ ['--d' as string]: '180ms' }} data-testid="text-emirate-ruler">{ruler.name}</span></p>}
                {ruler && <p className="em-mask"><span className="em-swap-mask block text-xs text-ink-700" style={{ ['--d' as string]: '240ms' }}>{ruler.role}</span></p>}
              </div>
            </div>
            <p key={`${e.id}-i`} className="em-swap-mask mt-6 text-lg leading-relaxed text-ink-800" style={{ ['--d' as string]: '300ms' }} data-testid="text-emirate-intro">{e.intro}</p>
            <div className="mt-3 flex flex-col items-start">
              <a href={INTRO_SOURCE.href} target="_blank" rel="noopener noreferrer" className="em-focus inline-flex min-h-11 items-center gap-1.5 text-xs text-lagoon-700 underline" data-testid="link-emirate-intro-source">Intro: {INTRO_SOURCE.label} <ExternalLink className="h-3 w-3" aria-hidden /></a>
              <a href={ruler?.source ?? COUNCIL_SOURCE} target="_blank" rel="noopener noreferrer" className="em-focus inline-flex min-h-11 items-center gap-1.5 text-xs text-lagoon-700 underline" data-testid="link-emirate-source">Ruler and title: UAE Cabinet · Federal Supreme Council <ExternalLink className="h-3 w-3" aria-hidden /></a>
            </div>
            {ruler && <PortraitCredit slug={ruler.slug} />}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2 border-t border-sand-300 pt-4">
          <button type="button" onClick={prev} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-sand-300 text-ink-900 transition-colors hover:border-gold-500" aria-label="Previous emirate" data-testid="button-emirate-prev"><ChevronLeft className="h-5 w-5" /></button>
          <div role="group" aria-label="Choose an emirate" className="em-noscroll flex flex-1 gap-1 overflow-x-auto">
            {SEVEN_EMIRATES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => onSelect(i)} aria-pressed={i === index}
                className={`em-focus em-r-fade relative min-h-11 shrink-0 px-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${i === index ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'}`}
                style={{ ['--d' as string]: `${300 + i * 80}ms` }} data-testid={`button-emirate-${s.id}`}>
                <span className="mr-2 font-mono text-[10px] text-gold-600">{String(i + 1).padStart(2, '0')}</span>{s.name}
                <span className={`absolute inset-x-3 -top-[17px] h-0.5 origin-left bg-gold-500 transition-transform duration-500 ${i === index ? 'scale-x-100' : 'scale-x-0'}`} aria-hidden />
              </button>
            ))}
          </div>
          <button type="button" onClick={next} className="em-focus grid h-11 w-11 shrink-0 place-items-center border border-sand-300 text-ink-900 transition-colors hover:border-gold-500" aria-label="Next emirate" data-testid="button-emirate-next"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-xs text-ink-700">Swipe the map on touch screens. Names and titles from the UAE Cabinet's Federal Supreme Council page. Portraits come from mixed sources (government, court and press archives); each photo credit names its own. Presented for information; no endorsement of TOMI is implied.</p>
      </div>
    </section>
  );
}
