import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import PartnerOrbitStage from '@/components/partners/PartnerOrbitStage';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/Reveal';
import ArchivePhoto from '@/components/ArchivePhoto';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import { archiveVideo } from '@/components/ArchivePhoto';
import { Handshake } from 'lucide-react';

export default function Partners() {
  return (
    <div className="bg-ivory-50 min-h-screen">
      <Helmet>
        <title>OUR PARTNERS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Partnership pathways and verified relationship architecture for The One Movement International." />
         <meta property="og:title" content="Our Partners — The One Movement International" />
         <meta property="og:description" content="Explore the Movement's partner network and begin a conversation about institutional, cultural or programme collaboration." />
        <link rel="canonical" href="/partners" />
      </Helmet>

      <PartnerOrbitStage />

      {/* CONFIRMED PARTNERSHIPS */}
      <section className="py-section-lg bg-ivory-50 border-t border-sand-200" aria-labelledby="engagement-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="PROOF OF NETWORK" heading="OUR PARTNERS IN DIALOGUE" surface="light" size="lg" thread />
            <p id="engagement-heading" className="mt-6 max-w-2xl leading-relaxed text-ink-800">
              Partners of The One Movement, shown through photographs and footage from the Founder archive.
              These relationships can open access to collaboration across business, diplomacy, culture and community; outcomes are discussed case by case. New enquiries are reviewed separately below.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-12 items-start gap-4 sm:gap-6">
            <Reveal className="col-span-12 sm:col-span-7"><ArchivePhoto id="institutional-dialogue" caption sizes="(min-width: 640px) 58vw, 92vw" /></Reveal>
            <Reveal delay={80} className="col-span-6 sm:col-span-5"><ArchivePhoto id="diplomatic-encounter" caption sizes="(min-width: 640px) 40vw, 46vw" /></Reveal>
            <Reveal delay={120} className="col-span-6 sm:col-span-4"><ArchivePhoto id="global-encounter" caption sizes="(min-width: 640px) 32vw, 46vw" /></Reveal>
            <Reveal delay={160} className="col-span-6 sm:col-span-4"><ArchivePhoto id="office-encounter" caption sizes="(min-width: 640px) 32vw, 46vw" /></Reveal>
            <Reveal delay={200} className="col-span-6 sm:col-span-4"><ArchivePhoto id="conversation" caption sizes="(min-width: 640px) 32vw, 46vw" /></Reveal>
          </div>
          <Reveal className="mt-12 flex flex-col items-center sm:flex-row sm:items-center sm:gap-10">
            <ResponsiveMedia
              kind="vertical-reel"
              label={archiveVideo('institutional-meeting').title}
              purpose={archiveVideo('institutional-meeting').purpose}
              videoSrc={archiveVideo('institutional-meeting').videoSrc}
              videoFallbackSrc={archiveVideo('institutional-meeting').videoFallbackSrc}
              posterSrc={archiveVideo('institutional-meeting').posterSrc}
              assetId="PARTNERS-MEETING"
              autoPlay={false}
              className="aspect-[9/16] w-full max-w-xs"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-700 sm:mt-0">
              Meeting with the Private Office of Sheikh Hamdan Al Nahyan · Founder archive footage.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PARTNERSHIP OPPORTUNITIES */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading eyebrow="JOIN US" heading="PARTNERSHIP OPPORTUNITIES" surface="dark" thread />
                <p className="mt-6 text-ivory-200 leading-relaxed text-lg">
                  Every collaboration begins with a conversation. Share your organization's interests and explore how to connect with the Movement.
                </p>
                <div className="mt-10 space-y-4">
                  <Link href="/join#institutional-inquiry" className="inline-block" data-testid="link-partnership-inquiry">
                    <Button size="xl" className="bg-gold-500 text-ink-900 hover:bg-gold-400 w-full sm:w-auto">
                      <Handshake className="mr-2 h-4 w-4" /> BEGIN THE CONVERSATION
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="bg-lagoon-800 border border-lagoon-700 p-6 rounded-sm">
                    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">Ways to collaborate</h4>
                    <ul className="space-y-3">
                      {['Connect institutions', 'Support a program', 'Develop cultural exchange'].map(path => (
                        <li key={path} className="py-2 border-b border-lagoon-700 last:border-0">
                          <span className="font-display text-lg text-ivory-100">{path}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-lagoon-800 border border-lagoon-700 p-6 rounded-sm">
                    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">From connection to opportunity</h4>
                    <ul className="space-y-3">
                      {['Share expertise', 'Explore collaborations', 'Create shared experiences'].map(path => (
                        <li key={path} className="flex flex-col py-2 border-b border-lagoon-700 last:border-0">
                          <span className="font-display text-lg text-ivory-100">{path}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* POLICY */}
      <section className="py-12 bg-ivory-50 border-t border-sand-200">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-[10px] font-semibold text-ink-500 tracking-[0.2em] uppercase">OUR DISPLAY POLICY</p>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed">
              Confirmed partners appear above. Organizations and individuals who enquire are reviewed before any public listing.
            </p>
            <Link href="/media" className="mt-4 inline-block text-sm font-semibold text-lagoon-700 underline underline-offset-4">Looking for press coverage? Visit Media.</Link>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
