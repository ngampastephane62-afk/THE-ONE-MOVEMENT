import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { useGetPublishedNewsArticles, getGetPublishedNewsArticlesQueryKey } from '@workspace/api-client-react';
import SectionHeading from '@/components/SectionHeading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublishedArticles } from '@/lib/news-data';
import { groupNews } from '@/lib/news-feed';
import { useNewsPlaybackScope } from '@/hooks/use-news-motion';
import LatestHero from '@/components/news-live/LatestHero';
import { DiscoveryFeed, FeaturedAnnouncements, ProgrammeUpdates } from '@/components/news-live/StorySections';
import StoriesInMotion from '@/components/news-live/StoriesInMotion';
import PressArchive from '@/components/news-live/PressArchive';
import '@/styles/news-motion.css';

const TITLE = 'News — The Movement in Motion | The One Movement International';
const DESC = 'The latest announcements, stories, programmes and opportunities from The One Movement International, followed by ten years of attributed press coverage.';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

export default function News() {
  const [page, setPage] = useState(1);
  const [paused, setPaused] = useState(false);
  // Page 1 always drives the hero: refreshed every 60s (not in hidden tabs) and on focus.
  const latest = useGetPublishedNewsArticles({ page: 1 }, { query: { queryKey: getGetPublishedNewsArticlesQueryKey({ page: 1 }), refetchOnMount: 'always', refetchOnWindowFocus: true, refetchInterval: 60000, refetchIntervalInBackground: false } });
  const older = useGetPublishedNewsArticles({ page }, { query: { queryKey: getGetPublishedNewsArticlesQueryKey({ page }), enabled: page > 1, staleTime: 30000 } });
  const current = page > 1 ? older : latest;
  const groups = useMemo(() => groupNews(latest.data?.items ?? [], current.data?.items ?? []), [latest.data, current.data]);
  const legacy = getPublishedArticles();
  const scope = useNewsPlaybackScope<HTMLDivElement>();
  useEffect(() => {
    if (latest.isLoading) return;
    const id = window.location.hash.slice(1);
    if (!['news-feed', 'press-archive', 'stories-in-motion'].includes(id)) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [latest.isLoading]);
  const ready = current.isSuccess;

  const goPage = (p: number) => {
    setPage(Math.max(1, p));
    document.getElementById('news-feed')?.scrollIntoView({ block: 'start' });
  };

  return (
    <div ref={scope} className="nm-scope" data-paused={paused ? 'true' : 'false'}>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
      </Helmet>

      {/* 1 */}
      <LatestHero hero={groups.hero} loading={latest.isLoading} error={latest.isError} onRetry={() => latest.refetch()} paused={paused} onTogglePause={() => setPaused((p) => !p)} />
      {/* 2 */}
      <FeaturedAnnouncements items={groups.featured} />
      {/* 3 */}
      <DiscoveryFeed items={groups.feed} page={page} hasMore={!!current.data?.hasMore} loading={current.isLoading} error={current.isError} onRetry={() => current.refetch()} onPage={goPage} />
      {/* 4 */}
      <StoriesInMotion items={groups.motion} ready={ready} />
      {/* 5 */}
      <ProgrammeUpdates items={groups.programmes} ready={ready} />

      {legacy.length > 0 && (
        <section className="w-full bg-ivory-50 py-section-lg" aria-label="Official articles from the Movement's site">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading eyebrow="Earlier official-site reads" heading="OFFICIAL ARTICLES." surface="light" thread />
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {legacy.map((a) => (
                <li key={a.slug}>
                  <Link href={`/news/${a.slug}`} className={cn('block rounded-sm border border-sand-200 bg-ivory-100 p-6 hover:border-gold-500', focusRing)}>
                    <p className="font-display text-base uppercase text-lagoon-900">{a.title}</p>
                    <p className="mt-3 line-clamp-3 text-sm text-lagoon-800">{a.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6 — history, last */}
      <PressArchive />

      <section id="editorial-policy" className="w-full bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <SectionHeading eyebrow="How this archive is kept" heading="AS PUBLISHED, CREDITED." surface="light" thread />
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-lagoon-800">
            <p>Every entry names its publisher and keeps the original screens uncropped. Summaries are ours and are attributed; the reporting belongs to the outlet.</p>
            <p>Where we hold the exact original link, we offer Read original. Otherwise we point to the publisher's own site rather than imply a direct article link. Likes, views or shares visible in a capture reflect the moment it was taken, not total reach.</p>
          </div>
        </div>
      </section>

      <section className="w-full py-section-md" style={{ backgroundColor: 'hsl(187 67% 8%)' }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg text-ivory-200">Covering the Movement or holding past coverage of it? Media partnerships begin with a conversation.</p>
          <Link href="/join#institutional-inquiry" className={cn(buttonVariants({ size: 'lg' }), 'max-w-full whitespace-normal', focusRing)} data-testid="link-media-inquiry">Begin the conversation</Link>
        </div>
      </section>
    </div>
  );
}
