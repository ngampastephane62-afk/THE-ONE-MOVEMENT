import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import HeroSurface from '@/components/HeroSurface';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { PROGRAMS } from '@/lib/programs-data';

const TITLE = 'OPPORTUNITIES — THE ONE MOVEMENT INTERNATIONAL';
const DESC = 'Honest pathways into The One Movement: confirmed programmes, professional services, media collaboration and institutional partnership across Africa, the UAE and beyond.';

const PATHWAYS = [
  {
    tag: 'Programmes', title: 'Take part in a programme',
    body: 'Galas, summits, fashion, awards and investment forums. Each programme page shows its current status and the right way to get involved.',
    href: '/programs', cta: 'View programmes', testid: 'link-opp-programs',
  },
  {
    tag: 'Professional services', title: 'Explore member services',
    body: 'Sign in to review optional monthly professional services and their terms. Annual event packages are separate, with review and a written agreement before payment.',
    href: '/member/membership', cta: 'View member services', testid: 'link-opp-services',
  },
  {
    tag: 'Media', title: 'Media & storytelling',
    body: 'Explore previous editions, international media distribution capabilities and how placement enquiries are reviewed by an administrator.',
    href: '/media', cta: 'Explore media', testid: 'link-opp-media',
  },
  {
    tag: 'Institutions', title: 'Institutional collaboration',
    body: 'Missions, public bodies, chambers and companies can propose cooperation. Every enquiry is reviewed before any commitment is discussed.',
    href: '/join#institutional-inquiry', cta: 'Institutional enquiry', testid: 'link-opp-institutional',
  },
  {
    tag: 'Partners', title: 'See who is already involved',
    body: 'Partners and supporters as confirmed by the Movement, with the context of each relationship.',
    href: '/partners', cta: 'View partners', testid: 'link-opp-partners',
  },
  {
    tag: 'Volunteering', title: 'Contribute your time',
    body: 'Volunteers and contributors can share their interest. Participation is discussed around confirmed activities; an enquiry is not a placement.',
    href: '/join#interest-form', cta: 'Express interest', testid: 'link-opp-volunteer',
  },
];

const STATUS_LABEL: Record<string, string> = { announced: 'Announced', planned: 'Planned', postponed: 'Postponed' };

export default function Opportunities() {
  return (
    <div>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
      </Helmet>

      <HeroSurface minHeight="58vh">
        <div className="mx-auto max-w-7xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-fade-up">OPPORTUNITIES</p>
          <h1 className="mt-5 max-w-4xl text-display-lg text-ivory-100 animate-cinematic-1" style={{ fontFamily: 'var(--font-display)' }}>
            REAL DOORS, <span className="text-gold-400">CLEARLY LABELLED.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200 animate-cinematic-2">
            No job board and no promises we cannot keep. These are the pathways that exist today into the Movement's programmes, services, media and institutional work — and exactly where each one leads.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-cinematic-3">
            <a href="#pathways" data-testid="link-hero-pathways"><Button size="lg" className="w-full sm:w-auto">SEE THE PATHWAYS</Button></a>
            <Link href="/sign-up" data-testid="link-hero-signup"><Button size="lg" variant="gold-outline" className="w-full sm:w-auto">CREATE A FREE ACCOUNT</Button></Link>
          </div>
        </div>
      </HeroSurface>

      <section id="pathways" className="scroll-mt-24 bg-ivory-100 py-section-lg" aria-labelledby="pathways-title">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="max-w-3xl">
            <p className="text-eyebrow text-gold-700">PATHWAYS</p>
            <h2 id="pathways-title" className="mt-3 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>WHERE DO YOU WANT TO START?</h2>
          </Reveal>
          <div className="mt-12 divide-y divide-sand-200 border-y border-sand-200">
            {PATHWAYS.map((p, i) => (
              <Reveal key={p.testid} delay={i * 50}>
                <Link
                  href={p.href}
                  data-testid={p.testid}
                  className="group relative grid gap-3 py-7 transition-colors duration-300 hover:bg-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 md:grid-cols-12 md:items-center md:gap-6 md:px-4"
                >
                  <span aria-hidden className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-lagoon-500 transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-600 md:col-span-2">{p.tag}</span>
                  <h3 className="font-display text-xl text-ink-900 md:col-span-3">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-700 md:col-span-5">{p.body}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 md:col-span-2 md:justify-end">
                    {p.cta}
                    <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="tomi-aurora-surface py-section-lg" aria-labelledby="programmes-title">
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-gold-400">THE PROGRAMMES</p>
              <h2 id="programmes-title" className="mt-3 text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>EACH ONE, ITS OWN WAY IN.</h2>
            </div>
            <p className="text-ivory-200 lg:col-span-5">Status shown here mirrors each programme page. Open a programme for its details and the appropriate next step.</p>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={i * 70} className="h-full">
                  <Link
                    href={`/programs/${p.slug}`}
                    data-testid={`link-opp-program-${p.slug}`}
                    className="group flex h-full flex-col justify-between gap-8 border border-lagoon-600/70 bg-lagoon-900/60 p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="self-start border border-gold-500/40 px-2 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-gold-400">{STATUS_LABEL[p.status as string] ?? 'Programme'}</span>
                    <div className="flex items-end justify-between gap-4">
                      <h3 className="font-display text-lg leading-tight text-ivory-100 transition-colors group-hover:text-gold-400">{p.name}</h3>
                      <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-ivory-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gold-400 motion-reduce:transition-none" />
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ivory-50 py-section-lg" aria-labelledby="honest-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-eyebrow text-gold-700">HOW WE WORK</p>
            <h2 id="honest-title" className="mt-3 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>AN ENQUIRY OPENS A CONVERSATION.</h2>
          </Reveal>
          <div className="space-y-5 text-ink-700 leading-relaxed lg:col-span-7">
            <Reveal><p>Every enquiry is read and reviewed by the team. Outcomes depend on fit, timing and confirmed activity — so we never guarantee a placement, a feature, a partnership or a result.</p></Reveal>
            <Reveal delay={80}><p>A free account is the simplest way to stay close: choose your sectors, save programmes and resources, and update your profile whenever things change. Optional monthly professional services are described in your member space. Annual event packages require a separate written agreement.</p></Reveal>
            <Reveal delay={160} className="border-l-2 border-gold-500 bg-ivory-100 px-5 py-4 text-sm">
              Planned platform features are part of our longer-term direction and will only be described as available once they genuinely work.
            </Reveal>
          </div>
        </div>
      </section>

      <section className="tomi-final-join py-section-lg text-center" aria-labelledby="opp-final">
        <Reveal className="mx-auto max-w-3xl px-6">
          <h2 id="opp-final" className="text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>CHOOSE YOUR FIRST STEP.</h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" data-testid="link-final-signup"><Button size="lg" className="w-full sm:w-auto">CREATE A FREE ACCOUNT</Button></Link>
            <Link href="/join#interest-form" data-testid="link-final-interest"><Button size="lg" variant="gold-outline" className="w-full sm:w-auto">EXPRESS INTEREST</Button></Link>
            <Link href="/join#institutional-inquiry" data-testid="link-final-institutional"><Button size="lg" variant="gold-outline" className="w-full sm:w-auto">INSTITUTIONAL ENQUIRY</Button></Link>
          </div>
          <Link href="/community" data-testid="link-final-community" className="mt-6 inline-block text-sm text-gold-400 underline underline-offset-4 hover:text-gold-500">Who belongs in the community</Link>
        </Reveal>
      </section>
    </div>
  );
}
