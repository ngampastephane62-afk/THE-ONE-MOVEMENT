import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import EditorialFilm from '@/components/EditorialFilm';
import MediaCatalogue from '@/components/partners/MediaCatalogue';
import Reveal from '@/components/Reveal';
import { Mail } from 'lucide-react';

export default function MediaHub() {
  return (
    <div className="bg-ivory-50 min-h-screen">
      <Helmet>
        <title>Media — Coverage, films and press | TOMI</title>
        <meta name="description" content="Media hub for The One Movement International: coverage catalogue, editorial films from previous editions, broadcast context and press pathways." />
        <meta property="og:title" content="Media — The One Movement International" />
        <meta property="og:description" content="Coverage catalogue, editorial films and press pathways." />
      </Helmet>

      {/* 1. MEDIA HERO */}
      <HeroSurface glowOrigin="bottom-center" minHeight="60vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <Reveal>
            <p className="text-eyebrow text-gold-400 mb-6">MEDIA & PRESS</p>
            <h1 className="text-display-xl text-ivory-100 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              THE ONE MOVEMENT<br/>
              <span className="text-gold-400">MEDIA</span>
            </h1>
            <GoldThread className="mt-8" length="200px" node />
            <p className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-2xl">
              Institutions, programs, culture and video from the connected network, with pathways for journalists and production partners.
            </p>
          </Reveal>
        </div>
      </HeroSurface>

      {/* INTERNATIONAL MEDIA REACH */}
      <section className="tomi-aurora-surface py-section-lg" aria-labelledby="media-reach-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-400">INTERNATIONAL MEDIA REACH</p>
            <h2 id="media-reach-heading" className="mt-4 max-w-3xl text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              DISTRIBUTION CAPABILITY THROUGH TROPIK AGENCY.
            </h2>
            <GoldThread className="mt-8" length="220px" node />
          </Reveal>
          <div className="mt-12 grid gap-px bg-lagoon-600/50 sm:grid-cols-3">
            {[
              { v: '353+', l: 'Media outlets in the Tropik Agency network' },
              { v: '18', l: 'Categories of outlets available for distribution' },
              { v: '3', l: 'Formats: Article, Press Release, Campaign' },
            ].map((x, i) => (
              <Reveal key={x.v} delay={i * 90} className="bg-lagoon-900 p-8">
                <p className="text-display-lg text-gold-400" style={{ fontFamily: 'var(--font-display)' }}>{x.v}</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-200">{x.l}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ivory-300">
            These figures describe the distribution capabilities of Tropik Agency. They do not
            represent TOMI partners, guaranteed coverage or endorsement, and are not verified
            published TOMI coverage.
          </p>
          <Link href="/join#institutional-inquiry" className="mt-8 inline-block" data-testid="link-media-reach-inquiry">
            <Button size="lg" variant="gold-outline">ENQUIRE ABOUT MEDIA REACH</Button>
          </Link>
        </div>
      </section>

      {/* MEDIA COVERAGE CATALOGUE — every request reviewed by the CEO */}
      <div className="bg-ivory-100 border-t border-sand-200">
        <div className="mx-auto max-w-7xl px-6 pt-10">
          <div className="border-l-2 border-gold-500 bg-ivory-50 px-5 py-4 text-sm leading-relaxed text-ink-800" data-testid="text-catalogue-review-notice">
            <strong className="font-semibold text-ink-900">How requests work.</strong>{' '}
            Every coverage request is reviewed personally by the CEO before any next step. Sending a request takes no
            payment and creates no commitment. Publication is never automatic or
            guaranteed: each outlet makes its own editorial decision.
          </div>
        </div>
        <MediaCatalogue />
      </div>

      {/* 3. EDITORIAL FILM — previous editions */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100" aria-labelledby="previous-editions-heading">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-400">WATCH · EDITORIAL FILM</p>
            <h2 id="previous-editions-heading" className="mt-4 text-display-md text-ivory-100">PREVIOUS EDITIONS, IN MOTION.</h2>
          </Reveal>
          <Reveal delay={120} className="mt-10 text-ivory-200">
            <EditorialFilm
              name="previous-editions"
              testId="film-previous-editions"
              label="Runway, artists and audience at previous The One Fashion Week editions"
              caption="Runway, artists and audience from previous editions of The One Fashion Week."
              credit="Film credit: Ngonga Inbox"
            />
          </Reveal>
        </div>
      </section>

      {/* BROADCAST & INSTITUTIONAL CONTEXT */}
      <section className="py-section-lg bg-ivory-50 border-b border-sand-200" aria-labelledby="broadcast-heading">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading eyebrow="BROADCAST & INSTITUTIONAL CONTEXT" heading="ON SCREEN, BEYOND THE ROOM" surface="light" thread />
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <article className="border border-sand-200 bg-ivory-100 p-8" data-testid="card-tv5monde">
                <p className="text-eyebrow text-gold-600">TV5MONDE</p>
                <h3 id="broadcast-heading" className="mt-2 font-display text-2xl text-ink-900">An international French-language broadcaster</h3>
                <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-sand-200 py-6">
                  {[['60 million', 'weekly viewers'], ['432 million', 'households'], ['200', 'countries & territories']].map(([v, l]) => (
                    <div key={l}>
                      <dt className="sr-only">{l}</dt>
                      <dd className="font-display text-xl text-lagoon-600 sm:text-3xl">{v}</dd>
                      <dd className="mt-1 text-xs text-ink-700">{l}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-ink-700" data-testid="text-tv5-disclaimer">
                  Channel-wide figures officially published by TV5MONDE on 12 March 2024. They describe the broadcaster's overall reach and are <strong>not</strong> viewing figures for any TOMI interview.
                </p>
                <div className="mt-6 border-l-2 border-gold-500 pl-4">
                  <p className="text-sm font-semibold text-ink-900">Interview archive — video pending</p>
                  <p className="mt-1 text-sm text-ink-700">According to the Founder, TOMI was presented in a TV5MONDE interview. The exact clip has not yet been identified, so no video is shown here.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
                  <a href="https://www.tv5monde.com/" target="_blank" rel="noreferrer" className="text-lagoon-600 underline underline-offset-4" data-testid="link-tv5monde">tv5monde.com</a>
                  <a href="https://presse.tv5monde.com/nos-chiffres-cles" target="_blank" rel="noreferrer" className="text-lagoon-600 underline underline-offset-4" data-testid="link-tv5-figures">Official key figures</a>
                  <a href="https://www.youtube.com/@TV5MONDE" target="_blank" rel="noreferrer" className="text-lagoon-600 underline underline-offset-4" data-testid="link-tv5-youtube">YouTube channel</a>
                </div>
              </article>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-5">
              <article className="h-full border border-sand-200 bg-ivory-100 p-8" data-testid="card-monusco">
                <p className="text-eyebrow text-gold-600">MONUSCO</p>
                <h3 className="mt-2 font-display text-2xl text-ink-900">Anti-disinformation campaign</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">According to the Founder, TOMI took part in a campaign against disinformation associated with MONUSCO, the United Nations mission in the Democratic Republic of the Congo. This description does not imply endorsement.</p>
                <div className="mt-6 border-l-2 border-gold-500 pl-4">
                  <p className="text-sm font-semibold text-ink-900">Film awaiting archive validation</p>
                </div>
                <a href="https://monusco.unmissions.org/" target="_blank" rel="noreferrer" className="mt-6 inline-block text-xs font-semibold text-lagoon-600 underline underline-offset-4" data-testid="link-monusco">monusco.unmissions.org</a>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. PRESS & COVERAGE */}
      <section className="py-section-lg bg-ivory-50">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="COVERAGE" heading="PRESS / COVERAGE" surface="light" thread />
            <div className="mt-10 max-w-2xl border border-sand-200 bg-white p-8 shadow-sm">
              <div className="mb-4 h-px w-12 bg-gold-500" aria-hidden="true" />
              <h4 className="text-lg font-display text-ink-900">Editorial enquiries</h4>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Contact the team for interviews, program context and information about the Movement's partner network. Published articles and press mentions are listed only when confirmed.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. MEDIA KIT */}
      <section className="py-section-lg bg-ivory-100 border-t border-sand-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <SectionHeading eyebrow="RESOURCES" heading="MEDIA KIT" surface="light" thread />
              <p className="mt-6 text-ink-700 leading-relaxed">
                For editorial photography, brand materials or interview requests, contact the Movement through the media inquiry pathway.
              </p>
            </Reveal>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Photography & permissions', 'Interviews & editorial context'].map((name, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="border border-sand-300 bg-white p-5 rounded-sm flex flex-col justify-between h-full shadow-sm hover:border-gold-500/50 transition-colors">
                      <h5 className="font-semibold text-ink-900 text-sm">{name}</h5>
                      <div className="mt-4 flex items-center justify-between">
                        <Link href="/join#institutional-inquiry" className="text-xs font-semibold text-gold-600 underline underline-offset-4">SEND AN ENQUIRY</Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEDIA INQUIRY */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Reveal>
            <SectionHeading eyebrow="GET IN TOUCH" heading="MEDIA INQUIRY" surface="dark" align="center" thread />
            <p className="mt-6 text-ivory-200 max-w-2xl mx-auto leading-relaxed">
              Journalists, media organizations, and production partners seeking interviews, coverage access, or detailed information are invited to submit an inquiry.
            </p>
            <Link href="/join#institutional-inquiry" className="mt-10 inline-block" data-testid="link-media-inquiry">
              <Button size="xl" className="bg-gold-500 text-ink-900 hover:bg-gold-400">
                <Mail className="mr-2 h-4 w-4" /> SUBMIT MEDIA INQUIRY
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 7. TROPIK AGENCE CONNECTION */}
      <section className="py-12 bg-ivory-50 border-t border-sand-200">
        <div className="mx-auto max-w-7xl px-6 flex justify-center text-center">
          <Reveal>
            <p className="text-[10px] font-semibold text-ink-500 tracking-[0.25em] uppercase flex flex-col items-center gap-2">
              <span className="text-sand-400">POWERED BY</span>
              <span className="text-ink-800 text-xs">TROPIK AGENCE</span>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
