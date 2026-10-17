import { CULTURAL_EXPERIENCE } from './data';
import { Eyebrow, GeoBand, display } from './Pattern';

const src = (n: string) => ({ src: `/brand-photos/founder/${n}-800.webp`, srcSet: `/brand-photos/founder/${n}-800.webp 800w, /brand-photos/founder/${n}.webp 2000w` });

export default function GalaCulture() {
  return (
    <section id="cultural-experience" className="scroll-mt-16 bg-ivory-50 py-24 md:py-32" aria-labelledby="culture-heading">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>The cultural experience</Eyebrow>
        <h2 id="culture-heading" className="mt-6 max-w-4xl text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95] text-ink-900" style={display}>WHAT THE ROOM COULD HOLD.</h2>
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
          <div className="grid grid-cols-2 gap-3 lg:col-span-6">
            <figure className="col-span-2">
              <img {...src('audience')} sizes="(min-width:1024px) 45vw, 92vw" alt="Audience and event atmosphere" loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <figcaption className="mt-2 text-[11px] text-ink-700">Audience atmosphere · Founder archive, previous TOMI event</figcaption>
            </figure>
            <figure>
              <img {...src('cultural-performance')} sizes="(min-width:1024px) 22vw, 45vw" alt="Cultural performance" loading="lazy" className="aspect-square w-full object-cover" />
              <figcaption className="mt-2 text-[11px] text-ink-700">Cultural performance · Founder archive</figcaption>
            </figure>
            <div className="flex flex-col justify-between bg-lagoon-900 p-5 text-ivory-100">
              <GeoBand />
              <p className="text-sm leading-relaxed text-ivory-200">Archive images show the spirit of past TOMI gatherings. Performers and exhibitors for the Gala will be announced once confirmed.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
