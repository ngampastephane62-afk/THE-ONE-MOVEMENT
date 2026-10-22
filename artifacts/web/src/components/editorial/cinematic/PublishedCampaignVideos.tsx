import { useEffect, useId, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getPublishedNewsArticles, type NewsPublicArticle } from '@workspace/api-client-react';
import { announceMediaStart, MEDIA_START, type MediaStartDetail } from '@/hooks/use-news-motion';
import { categoryLabel, embedSrc, publicMediaUrl } from '@/lib/news-cms';
import { storyIntro } from '@/lib/news-feed';
import { ShareStory } from '@/components/news-live/parts';
import NativeVideo from '../NativeVideo';
import CinematicVideoStory from './CinematicVideoStory';

/** Reuses the existing Founder News publisher; drafts/schedules never enter this public feed. */
function PublishedFilm({ article: a }: { article: NewsPublicArticle }) {
  const [size, setSize] = useState({ width: 1280, height: 720 });
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const owner = useId();
  const v = a.snapshot.video;
  const url = publicMediaUrl(a.slug);
  const embed = v?.kind === 'embed' ? embedSrc(v.provider, v.videoId) : null;
  useEffect(() => {
    const stop = (event: Event) => {
      if ((event as CustomEvent<MediaStartDetail>).detail?.owner !== owner) setPlaying(false);
    };
    document.addEventListener(MEDIA_START, stop);
    return () => document.removeEventListener(MEDIA_START, stop);
  }, [owner]);
  if (!v) return null;

  const media = failed ? (
    <div role="alert" className="grid h-full place-content-center p-5 text-center text-ivory-100">
      <p>This published video could not be loaded.</p>
      <button type="button" className="mt-3 min-h-11 underline" onClick={() => setFailed(false)}>Retry video</button>
    </div>
  ) : v.kind === 'upload' ? (
    <NativeVideo src={url(v.uploadId)} poster={a.snapshot.cover ? url(a.snapshot.cover.uploadId) : undefined}
      preload="none" className="!h-full !max-h-none" aria-label={a.snapshot.title}
      onError={() => setFailed(true)}
      onLoadedMetadata={(e) => {
        const { videoWidth, videoHeight } = e.currentTarget;
        if (videoWidth && videoHeight) setSize({ width: videoWidth, height: videoHeight });
      }} />
  ) : playing && embed ? (
    <iframe src={embed} title={a.snapshot.title} className="h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" />
  ) : (
    <div className="relative grid h-full place-items-center">
      {a.snapshot.cover && <img src={url(a.snapshot.cover.uploadId)} alt={a.snapshot.cover.alt} loading="lazy" className="absolute inset-0 h-full w-full object-contain opacity-60" />}
      {embed ? <button type="button" className="relative min-h-12 border border-gold-400 bg-lagoon-900 px-6 text-ivory-100" onClick={() => {
        announceMediaStart(owner);
        setPlaying(true);
      }}>Open video player</button> : <p className="relative p-5 text-ivory-100">This video reference is not available.</p>}
    </div>
  );
  return <CinematicVideoStory
    film={{
      id: `news-${a.id}`, name: categoryLabel(a.snapshot.category), title: a.snapshot.title,
      description: storyIntro(a) ?? '', file: '', poster: '', duration: '',
      ...size, credit: a.snapshot.author ? `By ${a.snapshot.author}` : '', status: 'published',
    }}
    articleId={`published-film-${a.slug}`} focusId={null} media={media}
    actions={<div className="mt-4 flex flex-wrap items-center gap-5">
      <Link href={`/news/${a.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-lagoon-800 underline">Read the published story</Link>
      <ShareStory a={a} tone="light" />
    </div>} />;
}

export default function PublishedCampaignVideos() {
  const q = useInfiniteQuery({
    queryKey: ['/api/news/articles', 'cinematic-videos'],
    queryFn: ({ pageParam, signal }) => getPublishedNewsArticles({ page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasMore ? last.page + 1 : undefined,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
  const films = q.data?.pages.flatMap((p) => p.items).filter((a) => !!a.snapshot.video) ?? [];
  if (!films.length && !q.isLoading && !q.isError && !q.hasNextPage) return null;
  return <div className="mt-12" data-testid="published-campaign-videos">
    {q.isLoading && <p role="status" className="text-sm text-ink-700">Loading published video stories…</p>}
    <div className="space-y-20 sm:space-y-28">{films.map((a) => <PublishedFilm key={a.id} article={a} />)}</div>
    {q.isError && <div role="alert" className="mt-5 text-sm text-ink-700">
      Published video stories could not be refreshed. The film archive remains available.
      <button type="button" onClick={() => void q.refetch()} className="ml-3 min-h-11 underline">Try again</button>
    </div>}
    {q.hasNextPage && <button type="button" disabled={q.isFetching} onClick={() => void q.fetchNextPage()}
      className="mt-8 min-h-11 border border-gold-600 px-5 text-sm text-lagoon-900 disabled:opacity-60">
      {q.isFetching ? 'Loading…' : 'Explore more published video stories'}
    </button>}
  </div>;
}
