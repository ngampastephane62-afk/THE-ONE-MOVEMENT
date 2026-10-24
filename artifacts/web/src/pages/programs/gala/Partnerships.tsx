import SectionHeading from '@/components/SectionHeading';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { PARTNERSHIP_AREAS } from './data';
import { Eyebrow, display } from './Pattern';

export default function GalaPartnerships({ onSelect }: { onSelect: (c: string) => void }) {
  const cls = 'group flex min-h-[88px] w-full items-center justify-between gap-4 bg-ivory-100 px-6 py-5 text-left text-ink-900 transition-colors hover:bg-lagoon-900 hover:text-ivory-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-600';
  return (
    <section className="bg-ivory-200 py-24 md:py-32" aria-labelledby="partners-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>Partnerships</Eyebrow>
            <SectionHeading id="partners-heading" heading={'BUILD BRIDGES\nWITH US.'} className="mt-6" headingClassName="text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.92]" />
          </div>
          <p className="text-ink-700 md:col-span-4 md:col-start-9">Areas open for conversation. Terms, partners and outcomes are agreed individually and announced only once confirmed.</p>
        </div>
        <ul className="mt-14 grid gap-px bg-sand-300 sm:grid-cols-2">
          {PARTNERSHIP_AREAS.map((p) => {
            const inner = (<><span className="text-lg md:text-xl" style={display}>{p.title}</span><ArrowRight size={18} aria-hidden="true" className="shrink-0 text-gold-600 transition-transform group-hover:translate-x-1" /></>);
            const id = p.title.toLowerCase().replace(/[^a-z]+/g, '-');
            return (
              <li key={p.title}>
                {p.category
                  ? <button type="button" className={cls} onClick={() => onSelect(p.category!)} data-testid={`button-partner-${id}`}>{inner}</button>
                  : <Link href={p.href!} className={cls} data-testid={`link-partner-${id}`}>{inner}</Link>}
              </li>
            );
          })}
        </ul>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
          <span>Learn more:</span>
          <Link href="/partners" className="underline underline-offset-4 hover:text-lagoon-600">Partners</Link>
          <Link href="/impact" className="underline underline-offset-4 hover:text-lagoon-600">Impact</Link>
          <Link href="/community" className="underline underline-offset-4 hover:text-lagoon-600">Community</Link>
          <Link href="/media" className="underline underline-offset-4 hover:text-lagoon-600">Media</Link>
        </p>
      </div>
    </section>
  );
}
