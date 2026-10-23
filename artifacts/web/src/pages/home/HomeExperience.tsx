import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import MovementLink from '@/components/MovementLink';
import { Button } from '@/components/ui/button';
import GoldThread from '@/components/GoldThread';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import HomeReelStrip from '@/components/HomeReelStrip';
import Reveal from '@/components/Reveal';
import MovementPaths from '@/components/home/MovementPaths';
import OneUniverse from '@/components/home/OneUniverse';
import OfficialProgrammes from '@/components/home/OfficialProgrammes';
import HomeReveal from '@/components/home/HomeReveal';
import { useAmbientPatternPause } from '@/components/home/useAmbientPatternPause';
import '@/components/home/home-patterns.css';
import FashionEditionNote from '@/components/FashionEditionNote';
import SectionHeading from '@/components/SectionHeading';
// Legacy hero retained for rollback: '@/components/home/HomeBrandHero'
import CinematicHero from '@/components/home/CinematicHero';
import HomeArchiveCarousel from '@/components/home/HomeArchiveCarousel';
import movementReel from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.mp4';
import movementReelFallback from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.webm';
import movementReelPoster from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01-poster.webp';

export default function HomeExperience() {
  const rootRef = useAmbientPatternPause<HTMLDivElement>();
  return (
    <div ref={rootRef} className="tomi-editorial-page tomi-home-editorial">
      <Helmet>
        <title>THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE.</title>
        <meta
          name="description"
          content="A global movement bringing creatives, entrepreneurs, institutions and changemakers together through programs, dialogue and development collaboration."
        />
        <meta property="og:title" content="THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE." />
        <meta
          property="og:description"
          content="Discover a global movement connecting people, culture, business, institutions and opportunity."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* 01 — Phase-one cinematic hero (legacy HomeBrandHero kept in repo). */}
      <CinematicHero />


      {/* 03 — Ecosystem preview: breadth without full explanation. */}
      <section id="ecosystem-preview-heading" className="tomi-aurora-surface py-section-lg tomi-editorial-chapter" data-chapter="THE ONE UNIVERSE" aria-label="The One Universe — 17 connected sectors">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading
              eyebrow="17 SECTORS. ONE ECOSYSTEM."
              heading="THE ONE UNIVERSE"
              surface="dark"
              size="lg"
              thread
            />
          </Reveal>

          <Reveal delay={90} className="mt-12">
            {/* THE ONE UNIVERSE: canonical 17 sectors (replaces the synthetic constellation on Home only). */}
            <OneUniverse />
          </Reveal>
          <Reveal delay={140} className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/ecosystem">
              <Button variant="gold-outline" size="lg">EXPLORE THE ECOSYSTEM</Button>
            </Link>
            <Link href="/ecosystem#discover" className="min-h-[44px] inline-flex items-center text-xs uppercase tracking-[0.18em] text-ivory-200 underline-offset-4 hover:text-gold-400 hover:underline" data-testid="link-home-discovery">
              What are you looking for in the world?
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Official programmes — follows the universe directly; curated three only. */}
      <OfficialProgrammes />

      {/* 02 — Understanding: one concise explanation plus future movement video. */}
      <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="THE MOVEMENT" aria-labelledby="what-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
          <HomeReveal variant="curtain" className="lg:col-span-5">
            <SectionHeading
              eyebrow="WHAT IS THE ONE MOVEMENT?"
              heading="A MOVEMENT TO JOIN. A VISION TO BUILD."
              surface="light"
              size="lg"
              thread
            />
            <p className="mt-7 text-lg leading-relaxed text-ink-800">
              Born from a fashion initiative for peace in the Democratic Republic of Congo,
              TOMI connects people and institutions through real programs today while building
              toward a wider global collaboration ecosystem.
            </p>
          </HomeReveal>
          <HomeReveal variant="mask" delay={120} className="lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-end">
            <ResponsiveMedia
              kind="vertical-reel"
              label="TOMI Movement Reel"
              purpose="Explain The One Movement through people, culture, meetings and international collaboration."
              videoSrc={movementReel}
              videoFallbackSrc={movementReelFallback}
              posterSrc={movementReelPoster}
              assetId="H02"
              actionsLayout="row"
              className="aspect-[9/16] w-full max-w-sm shadow-2xl"
            />
          </HomeReveal>
        </div>
      </section>

      {/* 04 — Visual proof: Fashion Week receives flagship treatment. */}
      <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="THE ORIGIN" aria-labelledby="fashion-proof-heading">
        <div className="mx-auto max-w-7xl px-6">
          <HomeReveal variant="sweep">
            <SectionHeading
              eyebrow="THE MOVEMENT IN ACTION"
              heading="WHERE THE STORY BEGAN"
              surface="light"
              size="lg"
              thread
            />
          </HomeReveal>

          <div className="tomi-fashion-editorial mt-12 grid overflow-hidden rounded-sharp border border-sand-200 bg-ivory-50 lg:grid-cols-12">
            <Reveal direction="left" className="tomi-fashion-media lg:col-span-6 flex flex-col items-center justify-center">
              <HomeReelStrip actionsLayout="row" />
            </Reveal>
            <Reveal delay={100} direction="right" className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-6">
              <p className="text-eyebrow text-gold-600">FIVE EDITIONS COMPLETED · SIXTH IN DUBAI</p>
              <h2 id="fashion-proof-heading" className="mt-4 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
                THE ONE FASHION WEEK INTERNATIONAL
              </h2>
              <p className="mt-6 leading-relaxed text-ink-800">
                Fashion carried a message of peace from Bukavu to Goma and Kinshasa.
                Five editions are complete. The sixth, the first in Dubai, takes place on <time dateTime="2026-12-22">22 December 2026</time>.
              </p>
              <FashionEditionNote />
              <Link href="/programs/fashion-week" className="mt-8">
                <Button variant="gold-outline">DISCOVER THE STORY</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 06 — Founder archive composition, deliberately not a standard gallery. */}
      <section className="bg-lagoon-900 py-section-lg tomi-editorial-chapter tomi-archive-editorial" data-chapter="MOVEMENT IN ACTION" aria-labelledby="archive-heading">
        <div className="mx-auto max-w-7xl px-6">
          <HomeReveal variant="curtain">
            <SectionHeading
              eyebrow="MOVEMENT IN ACTION"
              heading="CONNECTIONS ACROSS WORLDS."
              surface="dark"
              size="lg"
              thread
            />
          </HomeReveal>
          <Reveal delay={80} className="mt-6 flex flex-col gap-4 border-b border-gold-500/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-lg text-sm leading-relaxed text-ivory-200">
              Communities, institutions and culture connected through one network, shown through the Founder archive.
            </p>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Founder archive / partner network</span>
          </Reveal>
          <HomeReveal variant="mask" className="mt-12">
            <HomeArchiveCarousel />
          </HomeReveal>
          <p id="archive-heading" className="sr-only">Founder archive media structure</p>
        </div>
      </section>

      <MovementPaths />

      {/* Single-purpose conversion ending. */}
      <section className="tomi-final-join relative overflow-hidden py-section-xl text-center">
        <div className="tomi-surface-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="thp-pattern thp-pattern--dark" aria-hidden="true" />
        <Reveal className="relative z-10 mx-auto max-w-4xl px-6">
          <p className="text-eyebrow text-gold-400">THE NEXT CONNECTION</p>
          <h2 className="mt-5 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            YOUR PLACE IN THE MOVEMENT STARTS HERE.
          </h2>
          <GoldThread className="mx-auto mt-8" length="240px" node />
          <p className="mx-auto mt-7 max-w-xl leading-relaxed text-ivory-200">
            You don&apos;t just join a platform. You become part of a global mission.
            The public website introduces TOMI. Participation begins with an expression of interest and a real conversation.
          </p>
          <MovementLink buttonSize="xl" className="mt-9 inline-block" />
        </Reveal>
      </section>
    </div>
  );
}