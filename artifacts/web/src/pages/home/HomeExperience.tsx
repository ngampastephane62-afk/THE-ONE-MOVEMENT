import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import GeometricAccent from '@/components/GeometricAccent';
import GoldThread from '@/components/GoldThread';
import ArchivePhoto, { archiveVideo } from '@/components/ArchivePhoto';
import ProgramVision from '@/components/ProgramVision';
import { AwardsPreview } from '@/components/AwardsMedia';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import HomeReelStrip from '@/components/HomeReelStrip';
import Reveal from '@/components/Reveal';
import TomiConstellation from '@/components/TomiConstellation';
import FashionEditionNote from '@/components/FashionEditionNote';
import SectionHeading from '@/components/SectionHeading';
import homeHeroBackground from '@/assets/media/home/TOMI_HOME_HERO_BG_01.webp';
import movementReel from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.mp4';
import movementReelFallback from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.webm';
import movementReelPoster from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01-poster.webp';

const PROGRAMS = [
  { slug: 'summit', name: 'The One Summit', description: 'Leadership, ideas and business across continents.' },
  { slug: 'diplomatic-gala', name: 'The One Diplomatic Gala', description: 'Culture and dialogue in service of peace.' },
  { slug: 'awards', name: 'The One Awards', description: 'Recognition for courage and positive impact.' },
];

export default function HomeExperience() {
  return (
    <div className="tomi-editorial-page tomi-home-editorial">
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

      {/* 01 — Introduction: headline first, explanation and actions revealed after it. */}
      <section className="tomi-home-hero relative overflow-hidden bg-lagoon-900">
        <img
          src={homeHeroBackground}
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          fetchPriority="high"
          loading="eager"
          className="tomi-home-hero-image pointer-events-none absolute inset-0 h-full w-full"
          data-asset-id="H01"
        />
        <div className="tomi-home-hero-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="tomi-hero-edition relative z-10 mx-auto max-w-7xl px-6 pt-6" aria-hidden="true">
          <span>01 / THE INTRODUCTION</span>
          <span>DR CONGO → THE WORLD</span>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-6 py-section-lg">
          <div className="max-w-4xl">
            <p className="text-eyebrow text-gold-400 animate-fade-in">GLOBAL CONNECTION ECOSYSTEM</p>
            <h1 className="mt-5 text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="block animate-cinematic-1">ONE HUMANITY.</span>
              <span className="block animate-cinematic-2">ONE MOVEMENT.</span>
              <span className="block animate-cinematic-3 text-gold-400">ONE FUTURE.</span>
            </h1>
            <GoldThread className="mt-8" length="280px" node />
            <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ivory-300/60 animate-cinematic-3">
              Scroll to discover
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-section-lg">
          <Reveal className="max-w-2xl">
            <p className="text-xl leading-relaxed text-ivory-100 sm:text-2xl">
              A global movement bringing creatives, entrepreneurs, institutions and
              changemakers together through programs, dialogue and development collaboration.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/join">
              <Button size="lg">JOIN THE MOVEMENT</Button>
            </Link>
            <Link href="/ecosystem">
              <Button size="lg" variant="gold-outline">EXPLORE THE ECOSYSTEM</Button>
            </Link>
          </Reveal>
        </div>
      </section>

      <GeometricAccent variant="lagoon-on-ivory" height={18} />

      {/* 02 — Understanding: one concise explanation plus future movement video. */}
      <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="02 / THE MOVEMENT" aria-labelledby="what-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
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
          </Reveal>
          <Reveal delay={100} direction="right" className="lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-end">
            <ResponsiveMedia
              kind="vertical-reel"
              label="TOMI Movement Reel"
              purpose="Explain The One Movement through people, culture, meetings and international collaboration."
              videoSrc={movementReel}
              videoFallbackSrc={movementReelFallback}
              posterSrc={movementReelPoster}
              assetId="H02"
              className="aspect-[9/16] w-full max-w-sm shadow-2xl"
            />
          </Reveal>
        </div>
      </section>

      {/* 03 — Ecosystem preview: breadth without full explanation. */}
      <section className="tomi-aurora-surface py-section-lg tomi-editorial-chapter" data-chapter="03 / ALL IN ONE MOVEMENT" aria-labelledby="ecosystem-preview-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading
              eyebrow="ONE MOVEMENT. MANY WORLDS."
              heading="A CONNECTED ECOSYSTEM"
              surface="dark"
              size="lg"
              thread
            />
          </Reveal>

          <Reveal delay={90} className="mt-12">
            <TomiConstellation />
          </Reveal>

          <Reveal delay={140} className="mt-10">
            <Link href="/ecosystem">
              <Button variant="gold-outline" size="lg">EXPLORE THE ECOSYSTEM</Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 04 — Visual proof: Fashion Week receives flagship treatment. */}
      <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="04 / THE ORIGIN" aria-labelledby="fashion-proof-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading
              eyebrow="THE MOVEMENT IN ACTION"
              heading="WHERE THE STORY BEGAN"
              surface="light"
              size="lg"
              thread
            />
          </Reveal>

          <div className="tomi-fashion-editorial mt-12 grid overflow-hidden rounded-sharp border border-sand-200 bg-ivory-50 lg:grid-cols-12">
            <Reveal direction="left" className="tomi-fashion-media lg:col-span-6 flex flex-col items-center justify-center">
              <HomeReelStrip />
            </Reveal>
            <Reveal delay={100} direction="right" className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-6">
              <p className="text-eyebrow text-gold-600">FIVE EDITIONS COMPLETED · SIXTH POSTPONED</p>
              <h2 id="fashion-proof-heading" className="mt-4 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
                THE ONE FASHION WEEK INTERNATIONAL
              </h2>
              <p className="mt-6 leading-relaxed text-ink-800">
                Fashion carried a message of peace from Bukavu to Goma and Kinshasa.
                Five editions are complete. The sixth is planned for November and currently postponed.
              </p>
              <FashionEditionNote />
              <Link href="/programs/fashion-week" className="mt-8">
                <Button variant="gold-outline">DISCOVER THE STORY</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 05 — Concise program previews. */}
      <section className="bg-ivory-50 py-section-lg tomi-editorial-chapter" data-chapter="05 / THE PROGRAMS" aria-labelledby="program-preview-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="PROGRAM PREVIEW"
                heading="WAYS THE MOVEMENT COMES TO LIFE"
                surface="light"
                size="lg"
                thread
              />
              <Link href="/programs">
                <Button variant="gold-outline">VIEW ALL PROGRAMS</Button>
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PROGRAMS.map((program, index) => (
              <Reveal key={program.slug} delay={index * 90}>
                <article className="tomi-editorial-card group overflow-hidden rounded-sharp border border-sand-200 bg-ivory-100">
                  {program.slug === 'summit' ? (
                    <ArchivePhoto id="summit-goma" frameClassName="aspect-[4/3] w-full" objectPosition="center 30%" sizes="(min-width: 768px) 30vw, 92vw" />
                  ) : program.slug === 'awards' ? (
                    <AwardsPreview className="aspect-[4/3] w-full" />
                  ) : (
                    <ProgramVision name={program.name} className="aspect-[4/3] w-full" />
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-lg text-ink-900">{program.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">{program.description}</p>
                    <Link href={`/programs/${program.slug}`} className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                      Discover
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Founder archive composition, deliberately not a standard gallery. */}
      <section className="bg-lagoon-900 py-section-lg tomi-editorial-chapter tomi-archive-editorial" data-chapter="06 / MOVEMENT IN ACTION" aria-labelledby="archive-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading
              eyebrow="MOVEMENT IN ACTION"
              heading="CONNECTIONS ACROSS WORLDS."
              surface="dark"
              size="lg"
              thread
            />
          </Reveal>
          <Reveal delay={80} className="mt-6 flex flex-col gap-4 border-b border-gold-500/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-lg text-sm leading-relaxed text-ivory-200">
              Communities, institutions and culture connected through one network, shown through the Founder archive.
            </p>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Founder archive / partner network</span>
          </Reveal>
          <div className="mt-12 grid grid-cols-12 items-start gap-3 sm:gap-5">
            <Reveal direction="left" className="col-span-12 sm:col-span-7">
              <ArchivePhoto id="office-encounter" caption sizes="(min-width: 640px) 58vw, 92vw" captionClassName="text-ivory-300" />
            </Reveal>
            <Reveal delay={80} direction="right" className="col-span-7 sm:col-span-5">
              <ArchivePhoto id="community-outreach" caption="Community & impact" sizes="(min-width: 640px) 40vw, 58vw" captionClassName="text-ivory-300" />
            </Reveal>
            <Reveal delay={140} className="col-span-12 sm:col-span-7">
              <ArchivePhoto id="institutional-dialogue" caption="Institutional partner · Founder archive" sizes="(min-width: 640px) 58vw, 92vw" captionClassName="text-ivory-300" />
            </Reveal>
            <Reveal delay={180} className="col-span-12 sm:col-span-5">
              <ArchivePhoto id="cultural-performance" caption sizes="(min-width: 640px) 40vw, 92vw" captionClassName="text-ivory-300" />
            </Reveal>
          </div>
          <p id="archive-heading" className="sr-only">Founder archive media structure</p>
        </div>
      </section>

      {/* 07 — Single-purpose conversion ending. */}
      <section className="tomi-final-join relative overflow-hidden py-section-xl text-center">
        <div className="tomi-surface-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <Reveal className="relative z-10 mx-auto max-w-4xl px-6">
          <p className="text-eyebrow text-gold-400">THE NEXT CONNECTION</p>
          <h2 className="mt-5 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            YOUR PLACE IN THE MOVEMENT STARTS HERE.
          </h2>
          <GoldThread className="mx-auto mt-8" length="240px" node />
          <p className="mx-auto mt-7 max-w-xl leading-relaxed text-ivory-200">
            The public website introduces TOMI. Participation begins with an expression of interest and a real conversation.
          </p>
          <Link href="/join" className="mt-9 inline-block">
            <Button size="xl">JOIN THE MOVEMENT</Button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}