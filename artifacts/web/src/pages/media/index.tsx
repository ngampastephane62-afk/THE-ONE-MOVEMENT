import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
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

      {/* 2. LATEST / FEATURED MEDIA */}
      <section className="py-section-lg bg-ivory-100 border-b border-sand-200">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="FEATURED MEDIA" heading="FROM THE ARCHIVE" surface="light" thread />
          </Reveal>

          <div className="mt-12 grid grid-cols-12 items-start gap-5 sm:gap-6">
            <Reveal delay={100} className="col-span-12 lg:col-span-7">
              <ArchivePhoto id="runway-wide" caption="Runway atmosphere · Founder archive" sizes="(min-width: 1024px) 58vw, 92vw" />
            </Reveal>
            <Reveal delay={160} className="col-span-6 lg:col-span-5">
              <ArchivePhoto id="runway-white" caption sizes="(min-width: 1024px) 40vw, 46vw" />
            </Reveal>
            <Reveal delay={200} className="col-span-6 lg:col-span-4">
              <ArchivePhoto id="community-outreach" caption sizes="(min-width: 1024px) 32vw, 46vw" />
            </Reveal>
            <Reveal delay={240} className="col-span-12 sm:col-span-6 lg:col-span-4">
              <ArchivePhoto id="cultural-performance" caption sizes="(min-width: 1024px) 32vw, 92vw" />
            </Reveal>
            <Reveal delay={280} className="col-span-12 sm:col-span-6 lg:col-span-4">
              <ArchivePhoto id="audience" caption sizes="(min-width: 1024px) 32vw, 92vw" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. VIDEO / REELS */}
      <section className="py-section-lg bg-lagoon-900 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="WATCH" heading="VIDEOS & REELS" surface="dark" thread />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['fashion-archive', 'community-outreach', 'founder-arabic', 'institutional-meeting'] as const).map((id, i) => {
              const v = archiveVideo(id);
              return (
                <Reveal key={id} delay={i * 100}>
                  <figure className="mx-auto max-w-[17rem]">
                    <ResponsiveMedia
                      kind="vertical-reel"
                      label={v.title}
                      purpose={v.purpose}
                      videoSrc={v.videoSrc}
                      videoFallbackSrc={v.videoFallbackSrc}
                      posterSrc={v.posterSrc}
                      assetId={`MEDIA-REEL-${i + 1}`}
                      autoPlay={false}
                      className="aspect-[9/16] w-full"
                    />
                    <figcaption className="mt-3 text-xs leading-relaxed text-ivory-300">
                      <span className="block font-semibold text-gold-400">{v.title}</span>
                      {v.purpose}
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
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
              <h4 className="text-lg font-display text-ink-900">Awaiting verified records</h4>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                No published coverage is listed yet. Articles and press mentions will appear here only after they are verified and approved by the Founder.
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
