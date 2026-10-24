import SectionHeading from '@/components/SectionHeading';
import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import pavilionImg from '@/assets/media/programs/gala-concept-pavilion.jpg';
import { PAVILION_THEMES } from './data';
import { Eyebrow, GeoField, display } from './Pattern';

export default function GalaPavilions({ onPropose }: { onPropose: (category: string) => void }) {
  const [open, setOpen] = useState<string | null>(PAVILION_THEMES[0].id);
  return (
    <section id="world-pavilions" className="relative isolate overflow-hidden bg-lagoon-900 py-24 text-ivory-100 md:py-32" aria-labelledby="pavilions-heading">
      <GeoField className="absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow dark>The heart of the Gala</Eyebrow>
            <SectionHeading id="pavilions-heading" heading={'THE WORLD\nPAVILIONS'} surface="dark" className="mt-6" headingClassName="text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.92]" />
            <p className="mt-5 text-2xl text-gold-400" style={display}>Your country. Your culture. Your story.</p>
          </div>
          <p className="leading-relaxed text-ivory-200 md:col-span-4 md:col-start-9">Participating countries may have the opportunity to present a national pavilion: culture, creative industries, businesses, technology, traditions and community initiatives.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <figure className="lg:col-span-5">
            <div className="relative overflow-hidden">
              <img src={pavilionImg} alt="Concept still life of textiles, ceramics and instruments arranged as a pavilion display" loading="lazy" className="aspect-[4/5] w-full object-cover" />
              <span className="absolute left-4 top-4 bg-ivory-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-900">Concept visual</span>
            </div>
            <figcaption className="mt-3 text-sm text-ivory-300">Country pavilions are not yet announced. Themes below are concepts, not confirmed participants or embassy delegations.</figcaption>
          </figure>

          <ul className="lg:col-span-7" aria-label="Pavilion concept themes">
            {PAVILION_THEMES.map((t) => {
              const isOpen = open === t.id;
              return (
                <li key={t.id} className="border-t border-gold-500/30 last:border-b">
                  <button type="button" aria-expanded={isOpen} aria-controls={`pv-${t.id}`} onClick={() => setOpen(isOpen ? null : t.id)} data-testid={`button-explore-pavilion-${t.id}`}
                    className="group flex w-full items-center gap-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400">
                    <span className="w-8 text-xs text-gold-500 tabular-nums">{t.index}</span>
                    <span className="flex-1">
                      <span className="block text-xl transition-colors group-hover:text-gold-400 md:text-2xl" style={display}>{t.title}</span>
                      <span className="mt-1 block text-sm text-ivory-300">{t.line}</span>
                    </span>
                    <span className="hidden text-[10px] uppercase tracking-[0.2em] text-ivory-300 sm:inline">Explore pavilion</span>
                    <ChevronDown aria-hidden="true" size={18} className={`text-gold-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div id={`pv-${t.id}`} hidden={!isOpen} className="pb-6 pl-[3.25rem]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">Concept theme · Participation open to enquiry</p>
                    <ul className="mt-3 space-y-1 text-ivory-200">
                      {t.detail.map((d) => <li key={d} className="flex gap-2"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rotate-45 bg-gold-500" />{d}</li>)}
                    </ul>
                    <button type="button" onClick={() => onPropose(t.category)} data-testid={`button-propose-pavilion-${t.id}`}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 border border-gold-400 px-4 text-xs font-semibold tracking-[0.16em] text-gold-400 hover:bg-gold-400 hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400">
                      PROPOSE THIS PAVILION <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
