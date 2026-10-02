import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import Reveal from '@/components/Reveal';

export default function OurVision() {
  return (
    <div className="tomi-vision-editorial">
      <Helmet>
        <title>OUR VISION — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Our vision, purpose, and global ambition. Connecting humanity, creating opportunity, and building peace." />
        <meta property="og:title" content="OUR VISION — THE ONE MOVEMENT INTERNATIONAL" />
        <link rel="canonical" href="/our-vision" />
      </Helmet>

      {/* 1. VISION HERO */}
      <HeroSurface glowOrigin="behind" minHeight="85vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-5">OUR VISION</p>
              <h1 className="text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}>
                <Reveal direction="up">CONNECTING <span style={{ color: 'hsl(43 80% 73%)' }}>HUMANITY.</span></Reveal>
                <Reveal direction="up" delay={100}>CREATING OPPORTUNITY.</Reveal>
                <Reveal direction="up" delay={200}>BUILDING PEACE.</Reveal>
              </h1>
              <Reveal delay={300}>
                <GoldThread className="mt-8" length="240px" node />
                <p className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-lg">
                  The One Movement International brings people, cultures, businesses and
                  institutions together. Our vision is a trusted global collaboration ecosystem
                  that expands opportunity and dialogue without borders.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <Reveal direction="left" delay={200}>
                <ArchivePhoto id="human-connection" priority className="tomi-vision-frame mx-auto max-w-sm lg:max-w-none" sizes="(min-width: 1024px) 40vw, 92vw" captionClassName="text-ivory-300" caption />
              </Reveal>
            </div>
          </div>
        </div>
      </HeroSurface>

      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* 2. PURPOSE */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <SectionHeading
                eyebrow="OUR PURPOSE"
                heading="A STAGE FOR EVERY STORY"
                thread
                size="lg"
                surface="light"
              />
            </Reveal>
            <Reveal delay={100} direction="right" className="lg:col-span-6 lg:col-start-7 flex items-center">
              <div className="space-y-6 text-ink-800 leading-relaxed text-lg">
                <p>
                  We believe that every human being — of every origin, body, ability and story — deserves a place on the world's stage.
                </p>
                <p>
                  Through culture, business, diplomacy, and innovation, we build platforms where those stories can be heard. By connecting leaders, creators, and institutions, we foster collaboration that translates into tangible opportunity and a lasting peace.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. HUMAN CONNECTION */}
      <section className="py-section-lg border-t border-sand-200" style={{ backgroundColor: 'hsl(40 71% 98%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal direction="right" className="lg:col-span-5 order-2 lg:order-1">
              <ArchivePhoto id="community-outreach" caption sizes="(min-width: 1024px) 40vw, 92vw" className="tomi-vision-frame mx-auto max-w-md shadow-xl" />
            </Reveal>
            <Reveal direction="left" className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
              <p className="text-eyebrow text-gold-600 mb-4">HUMAN CONNECTION</p>
              <h2 className="text-display-lg text-ink-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                THE POWER OF <br/>MEETING.
              </h2>
              <div className="space-y-5 text-ink-800 leading-relaxed">
                <p>
                  True understanding requires contact. Whether on a runway, in a boardroom, or at a diplomatic summit, the most profound changes occur when different worlds intersect.
                </p>
                <p>
                  We engineer these intersections intentionally, ensuring that dialogue leads to action, and action leads to progress.
                </p>
              </div>
              <GoldThread className="mt-10" length="200px" node />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ONE HUMANITY — people, community, dialogue */}
      <section className="bg-ivory-50 py-section-lg border-t border-sand-200" aria-labelledby="vision-people-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="ONE HUMANITY" heading="PEOPLE BEFORE PLATFORMS." surface="light" size="lg" thread />
            <p id="vision-people-heading" className="sr-only">People, community and dialogue</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-12 items-start gap-4 sm:gap-6">
            <Reveal className="col-span-12 sm:col-span-7"><ArchivePhoto id="community-gathering" caption sizes="(min-width: 640px) 58vw, 92vw" /></Reveal>
            <Reveal delay={80} className="col-span-12 sm:col-span-5"><ArchivePhoto id="institutional-dialogue" caption sizes="(min-width: 640px) 40vw, 92vw" /></Reveal>
            <Reveal delay={120} className="col-span-12 sm:col-span-5 sm:col-start-2"><ArchivePhoto id="casting-group" caption sizes="(min-width: 640px) 40vw, 92vw" /></Reveal>
            <Reveal delay={160} className="col-span-8 col-start-3 sm:col-span-4 sm:col-start-8"><ArchivePhoto id="conversation" caption sizes="(min-width: 640px) 32vw, 70vw" /></Reveal>
          </div>
        </div>
      </section>

      {/* FOUNDER INTRODUCTION */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="text-eyebrow text-gold-400">FOUNDER INTRODUCTION · ARABIC</p>
            <p className="mt-5 text-lg leading-relaxed text-ivory-200">
              The Founder introduces The One Movement in Arabic. The wider AI-supported collaboration platform described
              is a future direction. It is not a live member or AI service today.
            </p>
          </Reveal>
          <Reveal delay={100} direction="right" className="flex justify-center lg:col-span-5 lg:col-start-8">
            <figure className="w-full max-w-xs">
              <ResponsiveMedia
                kind="vertical-reel"
                label={archiveVideo('founder-arabic').title}
                purpose={archiveVideo('founder-arabic').purpose}
                videoSrc={archiveVideo('founder-arabic').videoSrc}
                videoFallbackSrc={archiveVideo('founder-arabic').videoFallbackSrc}
                posterSrc={archiveVideo('founder-arabic').posterSrc}
                assetId="VISION-FOUNDER-ARABIC"
                autoPlay={false}
                className="aspect-[9/16] w-full"
              />
              <figcaption className="mt-3 text-xs text-ivory-300">Founder vision · Arabic introduction</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* 4. GLOBAL AMBITION & FUTURE DIRECTION */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-6">
              <SectionHeading
                eyebrow="GLOBAL AMBITION"
                heading="BUILDING A CONNECTED ECOSYSTEM."
                surface="dark"
                size="lg"
                thread
              />
              <div className="mt-8 space-y-6 text-ivory-200 leading-relaxed text-lg">
                <p>
                  What starts as physical programs and events is evolving into a comprehensive digital and physical network. Our ambition is to unite fifteen sectors into a single, navigable ecosystem.
                </p>
                <p>
                  Future vision: an AI-powered, trusted, all-in-one global collaboration ecosystem. It is a direction we are working toward, not a service available today.
                </p>
              </div>
              <Link href="/ecosystem" className="mt-10 inline-block">
                <Button variant="gold-outline">EXPLORE THE ECOSYSTEM</Button>
              </Link>
            </Reveal>

            <Reveal delay={150} direction="left" className="lg:col-span-5 lg:col-start-8">
              <ArchivePhoto
                id="global-encounter"
                caption="Global encounter · Founder archive · no partnership implied"
                captionClassName="text-ivory-300"
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="tomi-vision-frame mx-auto max-w-md shadow-2xl"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* 5. CLOSING */}
      <HeroSurface minHeight="50vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <Reveal>
            <h2 className="text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              THE MOVEMENT IS OPEN.<br />
              <span style={{ color: 'hsl(43 80% 73%)' }}>THE WORLD IS INVITED.</span>
            </h2>
            <GoldThread className="mt-8 mx-auto" length="240px" node />
          </Reveal>
          <Reveal delay={100} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join">
              <Button size="xl" variant="default">JOIN THE MOVEMENT</Button>
            </Link>
          </Reveal>
        </div>
      </HeroSurface>
    </div>
  );
}
