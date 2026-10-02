import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/Reveal';
import { Download, Handshake } from 'lucide-react';

export default function Partners() {
  return (
    <div className="bg-ivory-50 min-h-screen">
      <Helmet>
        <title>OUR PARTNERS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Partnership pathways and verified relationship architecture for The One Movement International." />
        <link rel="canonical" href="/partners" />
      </Helmet>

      {/* HERO */}
      <HeroSurface glowOrigin="bottom-center" minHeight="60vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <Reveal>
            <p className="text-eyebrow text-gold-400 mb-6">OUR PARTNERS & ALLIES</p>
            <h1 className="text-display-xl text-ivory-100 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              BUILD WITH THE MOVEMENT.
            </h1>
            <GoldThread className="mt-8" length="200px" node />
            <p className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-2xl">
              A verification-first environment for organizations and individuals exploring meaningful collaboration.
            </p>
          </Reveal>
        </div>
      </HeroSurface>

      {/* STRUCTURAL CATEGORIES */}
      <section className="py-section-lg bg-ivory-100">
        <div className="mx-auto max-w-7xl px-6 space-y-12">

          <Reveal>
            <div className="tomi-empty-slot p-8 sm:p-12">
              <p className="text-eyebrow text-gold-400">PARTNER REGISTRY</p>
              <h2 className="mt-4 max-w-2xl text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
                NO PARTNERSHIPS PUBLISHED YET.
              </h2>
              <p className="mt-5 max-w-2xl leading-relaxed text-ivory-200">
                Institutions, sponsors, companies, NGOs, universities and ambassadors will appear
                here only once a relationship is verified and approved in writing. Until then,
                this page stays honest and shows none.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARTNERSHIP JOURNEY & PACKAGES */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading eyebrow="JOIN US" heading="PARTNERSHIP OPPORTUNITIES" surface="dark" thread />
                <p className="mt-6 text-ivory-200 leading-relaxed text-lg">
                  Every collaboration begins with a conversation. Explore our structured partnership tiers and begin the journey.
                </p>
                <div className="mt-10 space-y-4">
                  <Link href="/join#institutional-inquiry" className="inline-block" data-testid="link-partnership-inquiry">
                    <Button size="xl" className="bg-gold-500 text-ink-900 hover:bg-gold-400 w-full sm:w-auto">
                      <Handshake className="mr-2 h-4 w-4" /> BEGIN THE CONVERSATION
                    </Button>
                  </Link>
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-ivory-100/30 text-ivory-100 hover:bg-ivory-100/10" disabled>
                    <Download className="mr-2 h-4 w-4" /> DOWNLOAD PARTNERSHIP DECK
                  </Button>
                  <p className="text-xs text-ivory-400/60 text-center sm:text-left mt-2 italic">* Deck in preparation</p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={150}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Tiers placeholder architecture */}
                  <div className="bg-lagoon-800 border border-lagoon-700 p-6 rounded-sm">
                    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">Sponsorship Tiers</h4>
                    <ul className="space-y-3">
                      {['Platinum', 'Diamond', 'Gold', 'Silver'].map(tier => (
                        <li key={tier} className="flex justify-between items-center py-2 border-b border-lagoon-700 last:border-0">
                          <span className="font-display text-lg text-ivory-100">{tier}</span>
                          <span className="text-xs text-ivory-400 uppercase tracking-wider">Details via Inquiry</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-lagoon-800 border border-lagoon-700 p-6 rounded-sm">
                    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-4">Partnership Packages</h4>
                    <ul className="space-y-3">
                      {['Partner — Premium', 'Partner — Basic'].map(pkg => (
                        <li key={pkg} className="flex flex-col py-2 border-b border-lagoon-700 last:border-0">
                          <span className="font-display text-lg text-ivory-100">{pkg}</span>
                          <span className="text-xs text-ivory-400 uppercase tracking-wider mt-1">Structure pending</span>
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
              Every organization and individual listed on this page has provided written authorization to appear here. We do not display logos, names, or endorsements without documented consent.
            </p>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
