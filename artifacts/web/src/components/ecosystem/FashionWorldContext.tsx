import { Link } from 'wouter';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import { inquiryHref } from '@/lib/programme-editorial';

/** Moved verbatim from the Fashion Week programme page: ongoing Fashion-world context, not event content. */
const PILLARS = [
  { n: 'I', h: 'Show', p: 'Collections that carry heritage and local craft onto an international runway.' },
  { n: 'II', h: 'Teach', p: 'Brands, experts and professors share technique, business and history with the next generation.' },
  { n: 'III', h: 'Connect', p: 'Designers, stylists and makers meet across continents to build working relationships.' },
  { n: 'IV', h: 'Cooperate', p: 'Fashion invites diplomatic and humanitarian partners into problems larger than one sector.' },
];

export default function FashionWorldContext() {
  return (
    <>
      <section className="bg-ivory-100 py-section-lg" aria-labelledby="eco-h" data-testid="section-fashion-world-ecosystem">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-600">An ecosystem, not a showcase</p>
              <h2 id="eco-h" className="mt-3 text-display-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>FASHION, HERITAGE, LEARNING AND COOPERATION.</h2>
              <p className="mt-5 leading-relaxed text-ink-800">
                The One Fashion Week International connects fashion, cultural heritage, learning and professional cooperation within the wider ecosystem of The One Movement International. Difference is the material we work with: people from many fields and regions, working together, not appearing as decoration.
              </p>
            </div>
            <ol className="grid gap-px self-start border border-sand-300 bg-sand-300 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {PILLARS.map((p) => (
                <li key={p.n} className="bg-ivory-50 p-6">
                  <span className="font-display text-sm text-gold-600">{p.n}</span>
                  <h3 className="mt-2 font-display text-2xl text-ink-900">{p.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-800">{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
          <Link href="/programs/fashion-week" data-testid="link-fashion-ecosystem" className="tomi-cta mt-12 inline-flex min-h-12 items-center gap-2 border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon-900">The One Fashion Week International</Link>
        </div>
      </section>

      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby="coop-h" data-testid="section-fashion-world-cooperation">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="text-eyebrow text-gold-400">Beyond one sector</p>
            <h2 id="coop-h" className="mt-3 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>FASHION AT THE TABLE WITH DIPLOMACY AND HUMANITARIAN WORK.</h2>
            <p className="mt-5 leading-relaxed text-ivory-200">
              Livelihoods, artisanal skills, cultural memory and peace are questions no runway solves alone. We invite institutions, diplomatic missions and humanitarian organisations to cooperate with the fashion community. These are invitations to work together, not claims of funded results.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={inquiryHref.partnership('fashion-week', 'collaborator')} data-testid="link-coop-partnership" className="inline-flex min-h-12 items-center bg-gold-500 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Propose a cooperation</Link>
              <Link href="/programs/diplomatic-gala" data-testid="link-coop-gala" className="inline-flex min-h-12 items-center border border-gold-500/70 px-6 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10">The Diplomatic Gala</Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ProgrammeFilm id="fashion-knight-2026" tone="dark" className="mx-auto w-full max-w-sm" />
          </div>
        </div>
      </section>


    </>
  );
}
