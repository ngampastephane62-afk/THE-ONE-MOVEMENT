import SectionHeading from '@/components/SectionHeading';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { GALA_PARTICIPATION_CATEGORIES } from '@/pages/join/inquiry-intents';
import { Eyebrow, display } from './Pattern';

export default function GalaParticipants({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const list = open ? GALA_PARTICIPATION_CATEGORIES : GALA_PARTICIPATION_CATEGORIES.slice(0, 4);
  return (
    <section className="bg-ivory-100 py-16 md:py-24" aria-labelledby="participate-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>Who can participate?</Eyebrow>
            <SectionHeading id="participate-heading" heading="TAKE PART." className="mt-6" headingClassName="text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95]" />
          </div>
          <p className="text-ink-700 md:col-span-4 md:col-start-9">Choose how you would take part. Your choice carries into the expression-of-interest form below.</p>
        </div>
        <ol className="mt-14 grid gap-px bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c, i) => {
            const active = selected === c.value;
            return (
              <li key={c.value} className="bg-ivory-100">
                <button type="button" onClick={() => onSelect(c.value)} aria-pressed={active} data-testid={`button-category-${c.value}`}
                  className={`group flex h-full min-h-[150px] w-full flex-col p-6 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600 ${active ? 'bg-lagoon-900 text-ivory-100' : 'hover:bg-ivory-200'}`}>
                  <span className={`text-xs tabular-nums ${active ? 'text-gold-400' : 'text-gold-700'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-4 text-lg leading-tight" style={display}>{c.label}</span>
                  <span className={`mt-3 line-clamp-2 text-sm leading-snug ${active ? 'text-ivory-200' : 'text-ink-700'}`}>{c.description}</span>
                  <span className={`mt-auto inline-flex items-center gap-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${active ? 'text-gold-400' : 'text-lagoon-600'}`}>
                    {active ? 'Selected' : 'Express interest'} <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {GALA_PARTICIPATION_CATEGORIES.length > 4 && (
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} data-testid="button-gala-participation-toggle" className="tomi-cta mt-6 inline-flex min-h-12 items-center gap-2 border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon-900">
            {open ? 'Show fewer options' : `All ${GALA_PARTICIPATION_CATEGORIES.length} participation options`} <ChevronDown size={14} aria-hidden="true" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        )}
      </div>
    </section>
  );
}
