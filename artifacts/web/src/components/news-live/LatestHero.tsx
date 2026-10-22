import { RotateCw } from 'lucide-react';
import type { NewsPublicArticle } from '@workspace/api-client-react';
import { useNewsAmbient, useNewsReveal } from '@/hooks/use-news-motion';
import { storyIntro } from '@/lib/news-feed';
import { DiscoverLink, Lines, Meta, ShareStory, StoryMedia, ring } from './parts';
import { cn } from '@/lib/utils';

interface Props { hero: NewsPublicArticle | null; loading: boolean; error: boolean; onRetry: () => void; paused: boolean; onTogglePause: () => void }

/** Keyed by id + publishedAt: choreography plays when the real story mounts, not on each poll. */
function HeroStory({ hero }: { hero: NewsPublicArticle }) {
  const ref = useNewsReveal<HTMLElement>();
  const intro = storyIntro(hero);
  return (
    <article ref={ref} className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-14" data-testid={`card-hero-${hero.slug}`}>
      <StoryMedia a={hero} ratio="aspect-[4/3] lg:aspect-[5/4]" preferVideo priority d={0} />
      <div className="min-w-0">
        <Meta a={hero} d={700} extra={<span className="ml-2 rounded-full border border-gold-400/50 px-2 py-0.5 text-[10px] text-gold-400">Latest</span>} />
        <h2 className="nm-headline mt-4 font-display text-[clamp(1.6rem,4.6vw,3rem)] uppercase leading-[1.02] text-ivory-50">
          <Lines text={hero.snapshot.title} base={420} />
        </h2>
        {intro && <p className="nm-up mt-5 text-base leading-relaxed text-ivory-200 sm:text-lg" style={{ ['--d' as string]: '860ms' }}>{intro}</p>}
        {hero.snapshot.author && <p className="nm-up mt-3 text-xs uppercase tracking-wider text-ivory-300" style={{ ['--d' as string]: '920ms' }}>By {hero.snapshot.author}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <DiscoverLink a={hero} d={1000} />
          <ShareStory a={hero} />
        </div>
      </div>
    </article>
  );
}

export default function LatestHero({ hero, loading, error, onRetry, paused, onTogglePause }: Props) {
  const ambient = useNewsAmbient<HTMLElement>();
  const reveal = useNewsReveal<HTMLDivElement>();
  return (
    <section ref={ambient} className="relative isolate overflow-hidden bg-[hsl(170_52%_8%)] text-ivory-100" aria-labelledby="news-hero-title" data-testid="section-latest-hero">
      <div className="nm-light" aria-hidden />
      <div ref={reveal} className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="nm-up text-eyebrow text-gold-400">News · Latest from the Movement</p>
          <button type="button" onClick={onTogglePause} aria-pressed={paused} className={cn('relative z-20 rounded-full border border-ivory-100/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ivory-300 hover:text-gold-400', ring)} data-testid="button-toggle-motion">
            {paused ? 'Motion off' : 'Pause motion'}
          </button>
        </div>
        <h1 id="news-hero-title" className="nm-headline mt-6 font-display text-[clamp(2.1rem,8.5vw,6rem)] uppercase leading-[0.92] tracking-[0.02em] text-ivory-50">
          <span className="nm-line"><span style={{ ['--d' as string]: '120ms' }}>The movement</span></span>
          <span className="nm-line"><span className="text-gold-400" style={{ ['--d' as string]: '260ms' }}>in motion.</span></span>
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[auto_1fr] md:items-baseline md:gap-10">
          <p className="nm-up text-xs font-semibold uppercase tracking-[0.3em] text-ivory-200" style={{ ['--d' as string]: '420ms' }}>News. Stories. People. Possibilities.</p>
          <p className="nm-up max-w-xl text-base leading-relaxed text-ivory-300" style={{ ['--d' as string]: '520ms' }}>Discover the latest announcements, stories, opportunities and initiatives shaping The One Movement International.</p>
        </div>

        <div className="mt-12 border-t border-gold-500/25 pt-10" aria-live="polite">
          {loading ? (
            <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]" aria-busy="true" aria-label="Loading the latest story">
              <div className="aspect-[4/3] animate-pulse rounded-sharp bg-ivory-100/10" />
              <div className="space-y-4"><div className="h-3 w-40 animate-pulse bg-ivory-100/10" /><div className="h-10 w-full animate-pulse bg-ivory-100/10" /><div className="h-10 w-2/3 animate-pulse bg-ivory-100/10" /><div className="h-20 w-full animate-pulse bg-ivory-100/5" /></div>
            </div>
          ) : error ? (
            <div role="alert" className="max-w-xl border-l-2 border-coral-500 pl-6">
              <p className="font-display text-xl uppercase">The latest news could not be loaded.</p>
              <p className="mt-2 text-sm text-ivory-300">Nothing is wrong with the stories themselves — the connection did not complete.</p>
              <button type="button" onClick={onRetry} className={cn('mt-4 inline-flex min-h-11 items-center gap-2 rounded-sharp bg-gold-500 px-4 text-xs font-semibold uppercase tracking-wider text-ink-900', ring)} data-testid="button-retry-latest"><RotateCw className="h-3.5 w-3.5" />Try again</button>
            </div>
          ) : !hero ? (
            <div className="max-w-xl border-l-2 border-gold-500 pl-6" data-testid="empty-latest">
              <p className="font-display text-xl uppercase">No story has been published yet.</p>
              <p className="mt-2 text-sm leading-relaxed text-ivory-300">When the Movement publishes its next announcement it will appear here first. The historical record further down remains available.</p>
            </div>
          ) : (
            <HeroStory key={`${hero.id}:${hero.publishedAt}`} hero={hero} />
          )}
        </div>
      </div>
      <div className="nm-band" aria-hidden />
    </section>
  );
}
