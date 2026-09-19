import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import PhotoSlot from '@/components/PhotoSlot';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import Reveal from '@/components/Reveal';
import { Download, Mail } from 'lucide-react';

export default function MediaHub() {
  return (
    <div className="bg-ivory-50 min-h-screen">
      <Helmet>
        <title>MEDIA — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Official media hub for The One Movement International — latest coverage, resources, and press pathways." />
        <link rel="canonical" href="/media" />
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
              The latest media, coverage, resources and pathways for journalists and production partners.
            </p>
          </Reveal>
        </div>
      </HeroSurface>

      {/* 2. LATEST / FEATURED MEDIA */}
      <section className="py-section-lg bg-ivory-100 border-b border-sand-200">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="FEATURED" heading="LATEST MEDIA" surface="light" thread />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Reveal delay={100} className="relative group">
              <PhotoSlot
                filename="media-featured-1.jpg"
                alt=""
                imageType="Founder media required"
                purpose="Major featured press image or video poster."
                className="w-full aspect-[16/10] rounded-sm overflow-hidden shadow-md"
              />
              <div className="mt-4">
                <span className="text-xs font-semibold text-gold-600 tracking-widest uppercase">Feature</span>
                <h3 className="mt-2 text-xl font-display text-ink-900">Founder-selected feature reserved</h3>
              </div>
            </Reveal>

            <Reveal delay={200} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-3">
                  <PhotoSlot
                    filename={`media-small-${i}.jpg`}
                    alt=""
                    imageType="Founder media"
                    purpose="Supporting media items."
                    className="w-full aspect-video rounded-sm overflow-hidden"
                  />
                  <div>
                    <span className="text-[10px] font-semibold text-sand-500 tracking-wider uppercase">Media slot {i}</span>
                    <h4 className="mt-1 text-sm font-semibold text-ink-800 leading-tight">Approved media pending</h4>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. VIDEO / REELS */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="WATCH" heading="VIDEO & REELS" surface="dark" thread />
          </Reveal>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Reveal key={i} delay={i * 100}>
                <ResponsiveMedia
                  kind="vertical-reel"
                  label={`Reel Slot ${i}`}
                  purpose="Vertical video coverage from events, programs, or interviews."
                  className="aspect-[9/16] w-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRESS & COVERAGE */}
      <section className="py-section-lg bg-ivory-50">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="COVERAGE" heading="IN THE PRESS" surface="light" thread />
          </Reveal>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Structural placeholders for verified media coverage */}
            {[1, 2, 3].map(i => (
              <Reveal key={i} delay={i * 100}>
                <article className="h-full bg-white border border-sand-200 p-6 rounded-sm shadow-sm flex flex-col">
                  <div className="h-8 w-24 bg-sand-200 rounded-sm mb-4 animate-pulse opacity-50" title="Verified logo placeholder" />
                  <h4 className="text-lg font-display text-ink-900 mb-3">Approved coverage position {i}</h4>
                  <p className="text-sm text-ink-700 leading-relaxed mb-6 flex-1">
                    Coverage excerpt will be placed here once verified and approved by the Founder.
                  </p>
                  <span className="text-xs font-semibold text-gold-600 uppercase tracking-widest mt-auto">Awaiting verified record</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEDIA KIT */}
      <section className="py-section-lg bg-ivory-100 border-t border-sand-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <SectionHeading eyebrow="RESOURCES" heading="MEDIA KIT" surface="light" thread />
              <p className="mt-6 text-ink-700 leading-relaxed">
                Downloadable assets, verified brand guidelines, and approved photography for editorial use.
                Resources will become available as they are authorized for public distribution.
              </p>
            </Reveal>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Brand Assets & Logos', status: 'In Preparation' },
                  { name: 'Movement Overview', status: 'In Preparation' },
                  { name: 'Founder Biographies', status: 'In Preparation' },
                  { name: 'Approved Photography', status: 'In Preparation' }
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="border border-sand-300 bg-white p-5 rounded-sm flex flex-col justify-between h-full shadow-sm hover:border-gold-500/50 transition-colors">
                      <h5 className="font-semibold text-ink-900 text-sm">{item.name}</h5>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-sand-500 font-semibold">{item.status}</span>
                        <Download className="w-4 h-4 text-sand-400" />
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
