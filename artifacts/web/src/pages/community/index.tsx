import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import HeroSurface from '@/components/HeroSurface';
import Reveal from '@/components/Reveal';
import ArchivePhoto from '@/components/ArchivePhoto';
import { Button } from '@/components/ui/button';

const TITLE = 'COMMUNITY — THE ONE MOVEMENT INTERNATIONAL';
const DESC = 'Who belongs in The One Movement community across Africa, the UAE and international networks, and the practical ways to take part: a free member account, the opt-in directory and enquiries.';

const CIRCLES = [
  { k: 'Business & enterprise', d: 'Founders, executives, investors and SMEs building trade and partnerships between continents.' },
  { k: 'Institutions & diplomacy', d: 'Public bodies, missions, chambers and organisations working on cooperation and dialogue.' },
  { k: 'Culture & creative economy', d: 'Designers, artists, fashion houses and cultural producers carrying identity into new markets.' },
  { k: 'Media & storytelling', d: 'Journalists, filmmakers and communicators who document and amplify the work.' },
  { k: 'Innovation & knowledge', d: 'Technologists, researchers and educators exploring what comes next.' },
  { k: 'Community & diaspora', d: 'Volunteers, community leaders and diaspora networks who keep the Movement human.' },
];

const PATHS = [
  {
    n: '01', title: 'Create a free member account', href: '/sign-up', cta: 'Create account', testid: 'link-community-signup',
    body: 'Your private member space. Choose your sectors, save programmes and resources, and edit your profile at any time. A free account is separate from any paid professional service or event package.',
  },
  {
    n: '02', title: 'Explore the ecosystem directory', href: '/ecosystem#directory-title', cta: 'Open the directory', testid: 'link-community-ecosystem',
    body: 'Browse the sectors, the programmes connected to them and the opt-in directory of members who chose to make their profile public.',
  },
  {
    n: '03', title: 'Express your interest', href: '/join#interest-form', cta: 'Share your interest', testid: 'link-community-interest',
    body: 'Tell the team how you would like to contribute — as a volunteer, participant or collaborator. This is a message, not an account or a confirmed place.',
  },
  {
    n: '04', title: 'Bring an institution', href: '/join#institutional-inquiry', cta: 'Institutional enquiry', testid: 'link-community-institutional',
    body: 'Organisations, missions and companies can open a conversation about collaboration. Every enquiry is reviewed by the team before any next step.',
  },
];

export default function Community() {
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

      <HeroSurface minHeight="64vh">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-section-lg lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-400 animate-fade-up">THE COMMUNITY</p>
            <h1 className="mt-5 text-display-lg text-ivory-100 animate-cinematic-1" style={{ fontFamily: 'var(--font-display)' }}>
              MANY SECTORS.<br /><span className="text-gold-400">ONE TABLE.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200 animate-cinematic-2">
              The One Movement brings together people from business, institutions, diplomacy, culture, media, innovation and community — across Africa, the UAE and the wider world. Belonging starts with a simple step and grows through real collaboration.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-cinematic-3">
              <Link href="/sign-up" data-testid="link-hero-signup"><Button size="lg" className="w-full transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto">CREATE A FREE ACCOUNT</Button></Link>
              <Link href="/ecosystem" data-testid="link-hero-ecosystem"><Button size="lg" variant="gold-outline" className="w-full sm:w-auto">EXPLORE THE ECOSYSTEM</Button></Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <ArchivePhoto id="community-gathering" priority className="mx-auto w-full max-w-md" caption="People coming together · Founder archive" captionClassName="text-ivory-200" />
          </div>
        </div>
      </HeroSurface>

      <section className="bg-ivory-100 py-section-lg" aria-labelledby="who-belongs">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-700">WHO BELONGS</p>
              <h2 id="who-belongs" className="mt-3 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>IF YOU BUILD BRIDGES, YOU BELONG HERE.</h2>
            </div>
            <p className="text-ink-700 leading-relaxed lg:col-span-6">
              There is no single profile. The community is defined by intent: people and organisations who want to connect regions, sectors and generations with purpose.
            </p>
          </Reveal>
          <ul className="mt-12 grid border-t border-sand-200 sm:grid-cols-2 lg:grid-cols-3">
            {CIRCLES.map((c, i) => (
              <li key={c.k} className="group relative border-b border-sand-200 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0" data-testid={`card-circle-${i}`}>
                <Reveal delay={i * 70} className="h-full p-7">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-500 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" />
                  <p className="font-mono text-xs text-lagoon-600">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 text-lg font-semibold text-ink-900 transition-colors group-hover:text-lagoon-600">{c.k}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{c.d}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tomi-aurora-surface py-section-lg" aria-labelledby="ways-in">
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-400">WAYS TO TAKE PART</p>
            <h2 id="ways-in" className="mt-3 max-w-3xl text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>FOUR DOORS. EACH ONE DOES SOMETHING DIFFERENT.</h2>
            <p className="mt-4 max-w-2xl text-ivory-200">Choose the one that matches what you want right now. You can always come back for another.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {PATHS.map((p, i) => (
              <Reveal key={p.n} delay={i * 90}>
                <Link
                  href={p.href}
                  data-testid={p.testid}
                  className="group flex h-full flex-col border border-lagoon-600/70 bg-lagoon-900/60 p-7 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-lagoon-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-3xl text-gold-500/80 transition-colors group-hover:text-gold-400">{p.n}</span>
                    <ArrowUpRight aria-hidden className="h-5 w-5 text-ivory-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-400" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-ivory-100">{p.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory-200">{p.body}</p>
                  <span className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">{p.cta}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-section-lg" aria-labelledby="clarity">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-eyebrow text-gold-700">PLAIN LANGUAGE</p>
            <h2 id="clarity" className="mt-3 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>WHAT EACH STEP MEANS.</h2>
            <p className="mt-4 text-ink-700 leading-relaxed">We keep these separate on purpose, so you always know what you have and have not signed up for.</p>
          </Reveal>
          <dl className="space-y-0 lg:col-span-7">
            {[
              ['A free account', 'Creates your private member space. Free, and editable whenever you like.'],
              ['A public profile', 'Optional. Only members who choose to be listed appear in the ecosystem directory.'],
              ['An expression of interest', 'A message to the team. It does not create an account, a membership or an event place.'],
              ['Professional services & event packages', 'Offered separately from the free account and discussed directly with the team.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 60} className="border-l-2 border-sand-200 py-4 pl-6 transition-colors hover:border-gold-500">
                <dt className="font-semibold text-ink-900">{t}</dt>
                <dd className="mt-1 text-sm text-ink-700">{d}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="tomi-final-join py-section-lg text-center" aria-labelledby="community-final">
        <Reveal className="mx-auto max-w-3xl px-6">
          <h2 id="community-final" className="text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>TAKE YOUR SEAT.</h2>
          <p className="mt-4 text-ivory-200">Start with a free account, then see where the ecosystem leads.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" data-testid="link-final-signup"><Button size="lg" className="w-full sm:w-auto">CREATE A FREE ACCOUNT</Button></Link>
            <Link href="/opportunities" data-testid="link-final-opportunities" className="group inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-semibold tracking-wide text-gold-400 hover:text-gold-500">
              See opportunities <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
