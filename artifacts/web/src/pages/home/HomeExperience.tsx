import { Fragment, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { defaultHomeEditorial, type HomeEditorial, type HomeSection } from '@workspace/shared';
import { useGetHomeEditorial, getGetHomeEditorialQueryKey } from '@workspace/api-client-react';
import EditorialCta from '@/components/home/EditorialCta';
import { Button } from '@/components/ui/button';
import GoldThread from '@/components/GoldThread';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import HomeReelStrip from '@/components/HomeReelStrip';
import Reveal from '@/components/Reveal';
import MovementPaths from '@/components/home/MovementPaths';
import OneUniverse from '@/components/home/OneUniverse';
import OfficialProgrammes from '@/components/home/OfficialProgrammes';
import HomeReveal from '@/components/home/HomeReveal';
import EditorialFigure from '@/components/home/EditorialFigure';
import { useAmbientPatternPause } from '@/components/home/useAmbientPatternPause';
import '@/components/home/home-patterns.css';
import '@/components/home/home-editorial.css';
import FashionEditionNote from '@/components/FashionEditionNote';
import SectionHeading from '@/components/SectionHeading';
// Legacy hero retained for rollback: '@/components/home/HomeBrandHero'
import CinematicHero from '@/components/home/CinematicHero';
import HomeArchiveCarousel from '@/components/home/HomeArchiveCarousel';
import { isOriginalPresentation, normalizeDoc, savedResolver, viewOf, type MediaResolver, type SectionView } from '@/lib/home-editorial';
import movementReel from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.mp4';
import movementReelFallback from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01.webm';
import movementReelPoster from '@/assets/media/home/TOMI_HOME_MOVEMENT_REEL_01-poster.webp';

const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function Universe({ ed, g }: { ed: SectionView; g: boolean }) {
  const feature = ed.m('feature');
  return (
    <section id="ecosystem-preview-heading" className="tomi-aurora-surface py-section-lg tomi-editorial-chapter" data-chapter="THE ONE UNIVERSE" aria-label="The One Universe — 17 connected sectors">
      <div className="mx-auto max-w-7xl px-6">
        <div className={g || feature ? 'he-grid' : undefined}>
          <Reveal>
            <SectionHeading eyebrow={ed.t('eyebrow')} heading={ed.t('heading')} surface="dark" size="lg" thread />
          </Reveal>
          {feature && <EditorialFigure media={feature} className={g ? '' : 'he-media'} />}
          {g && (
            <Reveal delay={90} className="he-media">
              <OneUniverse />
            </Reveal>
          )}
        </div>
        {!g && (
          <Reveal delay={90} className="mt-12">
            {/* THE ONE UNIVERSE: canonical 17 sectors (replaces the synthetic constellation on Home only). */}
            <OneUniverse />
          </Reveal>
        )}
        <Reveal delay={140} className="he-actions mt-10 flex flex-wrap items-center gap-6">
          {ed.t('ctaLabel').trim() && <Link href={ed.href('ctaHref')}>
            <Button variant="gold-outline" size="lg">{ed.t('ctaLabel')}</Button>
          </Link>}
          {ed.t('linkLabel').trim() && <Link href={ed.href('linkHref')} className="min-h-[44px] inline-flex items-center text-xs uppercase tracking-[0.18em] text-ivory-200 underline-offset-4 hover:text-gold-400 hover:underline" data-testid="link-home-discovery">
            {ed.t('linkLabel')}
          </Link>}
        </Reveal>
      </div>
    </section>
  );
}

function Movement({ ed, g }: { ed: SectionView; g: boolean }) {
  const reel = ed.m('reel');
  const body = ed.ov('body');
  return (
    <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="THE MOVEMENT" aria-labelledby="what-heading">
      <div className={`mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center${g ? ' he-grid' : ''}`}>
        <HomeReveal variant="curtain" className="lg:col-span-5">
          <SectionHeading eyebrow={ed.t('eyebrow')} heading={ed.t('heading')} surface="light" size="lg" thread />
          {body !== null ? paras(body).map((p, i) => <p key={i} className="mt-7 text-lg leading-relaxed text-ink-800">{p}</p>) : (
            <p className="mt-7 text-lg leading-relaxed text-ink-800">
              Born from a fashion initiative for peace in the Democratic Republic of Congo,
              TOMI connects people and institutions through real programs today while building
              toward a wider global collaboration ecosystem.
            </p>
          )}
        </HomeReveal>
        <HomeReveal variant="mask" delay={120} className="he-media lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-end">
          {reel ? (
            <EditorialFigure media={reel} className="aspect-[9/16] w-full max-w-sm overflow-hidden shadow-2xl" />
          ) : (
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
          )}
        </HomeReveal>
      </div>
    </section>
  );
}

function Origin({ ed, g }: { ed: SectionView; g: boolean }) {
  const feature = ed.m('feature');
  const body = ed.ov('body');
  return (
    <section className="bg-ivory-100 py-section-lg tomi-editorial-chapter" data-chapter="THE ORIGIN" aria-labelledby="fashion-proof-heading">
      <div className="mx-auto max-w-7xl px-6">
        <HomeReveal variant="sweep">
          <SectionHeading eyebrow={ed.t('eyebrow')} heading={ed.t('heading')} surface="light" size="lg" thread />
        </HomeReveal>

        <div className={`tomi-fashion-editorial mt-12 grid overflow-hidden rounded-sharp border border-sand-200 bg-ivory-50 lg:grid-cols-12${g ? ' he-grid' : ''}`}>
          <Reveal direction="left" className="he-media tomi-fashion-media lg:col-span-6 flex flex-col items-center justify-center">
            {feature ? <EditorialFigure media={feature} className="w-full p-4" /> : <HomeReelStrip actionsLayout="row" />}
          </Reveal>
          <Reveal delay={100} direction="right" className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-6">
            <p className="text-eyebrow text-gold-600">{ed.t('kicker')}</p>
            <h2 id="fashion-proof-heading" className="mt-4 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>
              {ed.t('title')}
            </h2>
            {body !== null ? paras(body).map((p, i) => <p key={i} className="mt-6 leading-relaxed text-ink-800">{p}</p>) : (
              <p className="mt-6 leading-relaxed text-ink-800">
                Fashion carried a message of peace from Bukavu to Goma and Kinshasa.
                Five editions are complete. The sixth, the first in Dubai, takes place on <time dateTime="2026-12-22">22 December 2026</time>.
              </p>
            )}
            <FashionEditionNote />
            {ed.t('ctaLabel').trim() && <Link href={ed.href('ctaHref')} className="mt-8">
              <Button variant="gold-outline">{ed.t('ctaLabel')}</Button>
            </Link>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Archive({ ed, g }: { ed: SectionView; g: boolean }) {
  const feature = ed.m('feature');
  const media = <HomeReveal variant="mask" className="he-media mt-12">{feature ? <EditorialFigure media={feature} /> : <HomeArchiveCarousel />}</HomeReveal>;
  return (
    <section className="bg-lagoon-900 py-section-lg tomi-editorial-chapter tomi-archive-editorial" data-chapter="MOVEMENT IN ACTION" aria-labelledby="archive-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className={g ? 'he-grid' : undefined}>
          <div>
            <HomeReveal variant="curtain">
              <SectionHeading eyebrow={ed.t('eyebrow')} heading={ed.t('heading')} surface="dark" size="lg" thread />
            </HomeReveal>
            <Reveal delay={80} className="mt-6 flex flex-col gap-4 border-b border-gold-500/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-lg text-sm leading-relaxed text-ivory-200">{ed.t('body')}</p>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400">{ed.t('tag')}</span>
            </Reveal>
          </div>
          {g && media}
        </div>
        {!g && media}
        <p id="archive-heading" className="sr-only">Founder archive media structure</p>
      </div>
    </section>
  );
}

function Join({ ed, g }: { ed: SectionView; g: boolean }) {
  const bg = ed.m('background');
  const body = ed.ov('body');
  return (
    <section className="tomi-final-join relative overflow-hidden py-section-xl text-center">
      {bg && <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true"><EditorialFigure media={bg} fill className="h-full w-full" /></div>}
      <div className="tomi-surface-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="thp-pattern thp-pattern--dark" aria-hidden="true" />
      <Reveal className={`relative z-10 mx-auto px-6 ${g ? 'max-w-6xl' : 'max-w-4xl'}`}>
        <div className={g ? 'he-grid text-left' : undefined}>
          <div>
            <p className="text-eyebrow text-gold-400">{ed.t('eyebrow')}</p>
            <h2 className="mt-5 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              {ed.t('heading')}
            </h2>
            <GoldThread className={g ? 'mt-8' : 'mx-auto mt-8'} length="240px" node />
          </div>
          <div className={g ? 'he-media' : undefined}>
            {body !== null ? paras(body).map((p, i) => <p key={i} className="mx-auto mt-7 max-w-xl leading-relaxed text-ivory-200">{p}</p>) : (
              <p className="mx-auto mt-7 max-w-xl leading-relaxed text-ivory-200">
                You don&apos;t just join a platform. You become part of a global mission.
                The public website introduces TOMI. Participation begins with an expression of interest and a real conversation.
              </p>
            )}
            <EditorialCta ed={ed} buttonSize="xl" className="mt-9 inline-block" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Custom({ ed }: { ed: SectionView }) {
  const feature = ed.m('feature');
  const body = ed.section.fields.body ?? '';
  const linkLabel = (ed.section.fields.linkLabel ?? '').trim();
  const dark = ed.section.theme === 'lagoon';
  return (
    <section className={`py-section-lg ${dark ? 'bg-lagoon-900' : 'bg-ivory-50'}`} aria-labelledby={`h-${ed.section.id}`} data-testid={`section-home-custom-${ed.section.id}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="he-grid">
          <HomeReveal variant="rise">
            <SectionHeading eyebrow={ed.t('eyebrow')} heading={ed.t('heading')} surface={dark ? 'dark' : 'light'} size="lg" thread />
            <span id={`h-${ed.section.id}`} className="sr-only">{ed.t('heading')}</span>
            {paras(body).map((p, i) => <p key={i} className={`mt-6 max-w-xl leading-relaxed ${dark ? 'text-ivory-200' : 'text-ink-800'}`}>{p}</p>)}
            {linkLabel && (
              <Link href={ed.href('linkHref')} className="mt-8 inline-block">
                <Button variant="gold-outline">{linkLabel}</Button>
              </Link>
            )}
          </HomeReveal>
          {feature && <HomeReveal variant="mask" delay={120} className="he-media"><EditorialFigure media={feature} /></HomeReveal>}
        </div>
      </div>
    </section>
  );
}

function renderSection(s: HomeSection, resolve: MediaResolver): ReactNode {
  const ed = viewOf(s, resolve);
  const g = s.layout !== 'original';
  switch (s.type) {
    case 'hero': return <CinematicHero ed={ed} />;
    case 'universe': return <Universe ed={ed} g={g} />;
    case 'programmes': return <OfficialProgrammes ed={ed} />;
    case 'movement': return <Movement ed={ed} g={g} />;
    case 'origin': return <Origin ed={ed} g={g} />;
    case 'archive': return <Archive ed={ed} g={g} />;
    case 'paths': return <MovementPaths ed={ed} />;
    case 'join': return <Join ed={ed} g={g} />;
    case 'custom': return <Custom ed={ed} />;
    default: return null;
  }
}

/** Renders the homepage from an editorial document. Used by the public page and the Founder live preview. */
export function HomeExperienceView({ doc, preview = false, resolveMedia = savedResolver }: { doc: HomeEditorial; preview?: boolean; /** Editor only: local previews for unsaved uploads. */ resolveMedia?: MediaResolver }) {
  const rootRef = useAmbientPatternPause<HTMLDivElement>();
  const sections = normalizeDoc(doc).sections.filter((s) => s.enabled);
  return (
    <div ref={rootRef} className="tomi-editorial-page tomi-home-editorial">
      {!preview && (
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
      )}
      {sections.map((s) => {
        const node = renderSection(s, resolveMedia);
        if (isOriginalPresentation(s) && s.type !== 'custom') return <Fragment key={s.id}>{node}</Fragment>;
        return (
          <div key={s.id} className="he-section" data-type={s.type} data-layout={s.layout} data-theme={s.theme === 'original' || s.type === 'custom' ? undefined : s.theme} data-align={s.alignment} data-spacing={s.spacing}>
            {node}
          </div>
        );
      })}
    </div>
  );
}

const FALLBACK = defaultHomeEditorial();

/** Public homepage: published editorial with finite freshness. Keeps last valid data on transient errors. */
export default function HomeExperience() {
  const q = useGetHomeEditorial({
    query: { queryKey: getGetHomeEditorialQueryKey(), staleTime: 60_000, refetchInterval: 5 * 60_000, refetchOnWindowFocus: true, retry: 2 },
  });
  return <HomeExperienceView doc={q.data ?? FALLBACK} />;
}
