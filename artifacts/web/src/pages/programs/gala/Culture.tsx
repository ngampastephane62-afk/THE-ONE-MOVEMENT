import SectionHeading from '@/components/SectionHeading';
import { CULTURAL_EXPERIENCE } from './data';
import { Eyebrow, GeoBand, display } from './Pattern';
import { KubaCluster } from '@/components/kuba/KubaPatterns';

export default function GalaCulture() {
  return (
    <section id="cultural-experience" className="scroll-mt-16 bg-ivory-50 py-24 md:py-32" aria-labelledby="culture-heading">
      <div className="relative mx-auto max-w-7xl px-6">
        <KubaCluster palette="emerald" height={200} className="pointer-events-none absolute right-6 top-0 hidden opacity-60 md:flex" />
        <Eyebrow>The cultural experience</Eyebrow>
        <SectionHeading id="culture-heading" heading={'WHAT THE ROOM\nCOULD HOLD.'} className="mt-6 max-w-4xl" headingClassName="text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95]" />
        <div className="mt-6 inline-flex items-center gap-2 border border-gold-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-700">
          <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold-600" /> Potential activities · none yet confirmed
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <ol className="lg:col-span-6">
            {CULTURAL_EXPERIENCE.map((c, i) => (
              <li key={c} className="flex items-baseline gap-5 border-b border-sand-200 py-4">
                <span className="w-6 text-xs tabular-nums text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xl text-ink-900 md:text-2xl" style={display}>{c}</span>
              </li>
            ))}
          </ol>
          <div className="relative flex flex-col justify-between overflow-hidden bg-lagoon-900 p-8 text-ivory-100 lg:col-span-6 md:p-10">
            <span aria-hidden="true" className="tomi-kuba-band absolute inset-0 opacity-60" />
            <GeoBand className="relative" />
            <p className="relative mt-10 font-display text-2xl leading-snug md:text-3xl" style={display}>Textiles, sculpture, music, architecture and craft from many continents, presented by the communities that carry them.</p>
            <p className="relative mt-6 text-sm leading-relaxed text-ivory-200">Performers, exhibitors and heritage collections for the Gala will be announced once confirmed.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
