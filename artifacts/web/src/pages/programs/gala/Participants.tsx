import { ArrowUpRight } from 'lucide-react';
import { GALA_PARTICIPATION_CATEGORIES } from '@/pages/join/inquiry-intents';
import { Eyebrow, display } from './Pattern';

export default function GalaParticipants({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <section className="bg-ivory-100 py-24 md:py-32" aria-labelledby="participate-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>Who can participate?</Eyebrow>
            <h2 id="participate-heading" className="mt-6 text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95] text-ink-900" style={display}>TEN WAYS IN. ONE SHARED STAGE.</h2>
          </div>
          <p className="text-ink-700 md:col-span-4 md:col-start-9">Choose how you would take part. Your choice carries into the expression-of-interest form below.</p>
        </div>
        <ol className="mt-14 grid gap-px bg-sand-200 sm:grid-cols-2 lg:grid-cols-5">
          {GALA_PARTICIPATION_CATEGORIES.map((c, i) => {
            const active = selected === c.value;
            return (
              <li key={c.value} className="bg-ivory-100">
                <button type="button" onClick={() => onSelect(c.value)} aria-pressed={active} data-testid={`button-category-${c.value}`}
                  className={`group flex h-full min-h-[220px] w-full flex-col p-6 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 ${active ? 'bg-lagoon-900 text-ivory-100' : 'hover:bg-ivory-200'}`}>
                  <span className={`text-xs tabular-nums ${active ? 'text-gold-400' : 'text-gold-700'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-4 text-lg leading-tight" style={display}>{c.label}</span>
                  <span className={`mt-3 text-sm leading-snug ${active ? 'text-ivory-200' : 'text-ink-700'}`}>{c.description}</span>
                  <span className={`mt-auto inline-flex items-center gap-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${active ? 'text-gold-400' : 'text-lagoon-600'}`}>
                    {active ? 'Selected' : 'Express interest'} <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
