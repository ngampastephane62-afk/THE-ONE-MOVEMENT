import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { getGetPartnerDirectoryQueryKey, useGetPartnerDirectory } from '@workspace/api-client-react';
import PartnerNetworkHero from '@/components/partners/PartnerNetworkHero';
import PartnerGallery, { PartnerGallerySkeleton } from '@/components/partners/PartnerGallery';
import PartnerOpportunities from '@/components/partners/PartnerOpportunities';
import PartnerOrbitStage from '@/components/partners/PartnerOrbitStage';
import BroadcasterAudience from '@/components/partners/BroadcasterAudience';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import { AWARENESS_FILM, engagementId } from '@/lib/editorial-films';
import NetworkMotif from '@/components/partners/NetworkMotif';
import { mergeContent } from '@/lib/partner-directory';

export default function Partners() {
  const q = useGetPartnerDirectory({ query: { queryKey: getGetPartnerDirectoryQueryKey(), refetchOnMount: 'always', refetchOnWindowFocus: true, refetchInterval: 120_000, staleTime: 30_000 } });
  const c = mergeContent(q.data?.content);
  const items = (q.data?.items ?? []).filter((i) => i.status === 'published');

  return (
    <div className="min-h-[100dvh] bg-ivory-50">
      <Helmet>
        <title>PARTNERS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Institutions, corporate brands, cultural organizations and media that form The One Movement International's global network." />
        <meta property="og:title" content="Our Global Network — The One Movement International" />
        <meta property="og:description" content={c.heroDescription} />
        <link rel="canonical" href="/partners" />
      </Helmet>

      <PartnerNetworkHero c={c} count={items.length} />
      <PartnerOrbitStage />

      <section id="partner-gallery" className="scroll-mt-20 py-section-lg" aria-labelledby="partner-gallery-heading" data-testid="section-partner-gallery">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lagoon-600">Partners · Collaborators · Media</p>
            <h2 id="partner-gallery-heading" className="mt-3 font-display text-3xl tracking-[0.02em] text-ink-900 sm:text-5xl" data-testid="text-directory-title">{c.directoryTitle}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-800" data-testid="text-directory-description">{c.directoryDescription}</p>
          </Reveal>
          <div className="mt-10">
            {q.isLoading ? <PartnerGallerySkeleton />
              : q.isError && !q.data ? (
                <div className="rounded-3xl border border-sand-300 p-8 text-center" role="alert" data-testid="status-partners-error">
                  <p className="text-ink-800">The partner network could not be loaded.</p>
                  <button type="button" onClick={() => q.refetch()} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-lagoon-900 px-5 text-xs font-semibold text-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-partners-retry">Try again</button>
                </div>
              ) : items.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-sand-300 p-10 text-center text-ink-700" data-testid="status-partners-none">The network is being updated. Please check back shortly.</p>
              ) : <PartnerGallery items={items} />}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-700" data-testid="text-display-note">{c.displayNote}</p>
        </div>
      </section>

      <PartnerOpportunities />
      <BroadcasterAudience />

      <section className="border-t border-sand-200 py-section-lg" aria-labelledby="archive-heading">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SectionHeading eyebrow="SINCE THE FIRST EDITION" heading="OUR DOCUMENTARY ARCHIVE" surface="light" size="lg" thread />
            <p id="archive-heading" className="mt-6 max-w-2xl leading-relaxed text-ink-800">Since its first edition, The One Movement has produced documentaries and magazines. Institutional history and press coverage remain available in <Link href="/media" className="font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-history-media">Media</Link> and <Link href="/news" className="font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-history-news">News</Link>.</p>
          </Reveal>
          {/* Task 33: the full awareness film lives in /the-one-documentary (#broadcast-films). Partners links to it instead of embedding a duplicate. */}
          <div id="documentary-teasers" className="mt-10 scroll-mt-24 border-l-2 border-gold-500 pl-5" data-testid="section-documentary-teasers">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">{AWARENESS_FILM.name}</p>
            <p className="mt-2 font-display text-xl text-ink-900">{AWARENESS_FILM.title}</p>
            <Link href={`/the-one-documentary?video=${engagementId(AWARENESS_FILM)}#broadcast-films`} className="tomi-cta mt-4 inline-flex min-h-12 items-center border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon-900" data-testid="link-awareness-film">Watch in the documentary collection</Link>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-lagoon-900 py-28 text-center text-ivory-50" aria-labelledby="collab-heading" data-testid="section-partners-cta">
        <NetworkMotif className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[140%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 id="collab-heading" className="font-display text-[clamp(2rem,6vw,4.2rem)] leading-[1] tracking-[0.02em]" data-testid="text-collab-title">{c.collaborationTitle}</h2>
            <p className="mt-5 text-sm uppercase tracking-[0.24em] text-gold-400 sm:text-base" data-testid="text-collab-subtitle">{c.collaborationSubtitle}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/join?intent=partnership" className="inline-flex min-h-12 items-center rounded-full bg-gold-500 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-50 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900" data-testid="link-cta-partnership">{c.partnershipButton}</Link>
              <Link href="/join" className="inline-flex min-h-12 items-center rounded-full border border-ivory-100/40 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-50 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-cta-conversation">{c.conversationButton}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
