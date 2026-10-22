import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import type { NewsPublicArticle } from '@workspace/api-client-react';
import { useNewsReveal } from '@/hooks/use-news-motion';
import { storyIntro } from '@/lib/news-feed';
import { EDITORIAL_VIDEO_NEWS, formatNewsDate } from '@/lib/editorial-news';
import NewsVideo from '@/components/editorial/NewsVideo';
import { DiscoverLink, Lines, Meta, SectionTitle, StoryMedia, ring } from './parts';
import { cn } from '@/lib/utils';

function CmsMotion({ a, i }: { a: NewsPublicArticle; i: number }) {
  const ref = useNewsReveal<HTMLLIElement>();
  return (
    <li ref={ref} className="grid gap-6 border-t border-gold-500/20 pt-10 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-12" data-testid={`card-motion-${a.slug}`}>
      <StoryMedia a={a} ratio="aspect-video" preferVideo from={i % 2 ? '' : 'nm-from-left'} />
      <div className="nm-side min-w-0" style={{ ['--x' as string]: '32px', ['--d' as string]: '300ms' }}>
        <Meta a={a} d={360} />
        <h3 className="nm-headline mt-3 font-display text-2xl uppercase leading-tight text-ivory-50 sm:text-3xl"><Lines text={a.snapshot.title} base={320} /></h3>
        {storyIntro(a) && <p className="nm-up mt-4 text-ivory-200" style={{ ['--d' as string]: '520ms' }}>{storyIntro(a)}</p>}
        <div className="mt-6"><DiscoverLink a={a} label="Watch the story" d={620} /></div>
      </div>
    </li>
  );
}

function Curated() {
  const ref = useNewsReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="mt-16 border-t border-gold-500/20 pt-10">
      <p className="nm-up text-eyebrow text-gold-400">Curated video · shared from its official source</p>
      {EDITORIAL_VIDEO_NEWS.map((n) => (
        <article key={n.slug} className="mt-8 grid gap-10 md:grid-cols-[18rem_1fr] md:items-center lg:gap-16" data-testid={`card-news-${n.slug}`}>
          <div className="nm-media nm-from-bottom rounded-sharp bg-ivory-50 p-3"><NewsVideo item={n} compact actionsLayout="row" /></div>
          <div className="nm-side min-w-0" style={{ ['--x' as string]: '28px', ['--d' as string]: '260ms' }}>
            <p className="text-eyebrow text-gold-400">{n.kicker} · Shared on <time dateTime={n.publishedAt}>{formatNewsDate(n.publishedAt)}</time></p>
            <h3 className="nm-headline mt-4 font-display text-3xl uppercase leading-tight text-ivory-50 sm:text-4xl">
              <Link href={`/news/${n.slug}`} className={cn('hover:text-gold-400', ring)} data-testid={`link-news-${n.slug}`}>{n.title}</Link>
            </h3>
            <p className="mt-4 max-w-xl text-ivory-200">{n.standfirst}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-ivory-300">Source: {n.source.name} — not a TOMI production.</p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <a href={n.source.url} target="_blank" rel="noopener noreferrer" className={cn('inline-flex min-h-11 max-w-full items-center gap-2 rounded-sharp bg-gold-500 px-5 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400', ring)} data-testid={`link-source-${n.slug}`}>
                View {n.source.name}’s official page<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /><span className="sr-only">(opens in a new tab)</span>
              </a>
              <Link href={`/news/${n.slug}`} className={cn('text-sm font-semibold text-ivory-100 underline underline-offset-4', ring)} data-testid={`link-read-${n.slug}`}>View announcement</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function StoriesInMotion({ items, ready = true }: { items: NewsPublicArticle[]; ready?: boolean }) {
  const head = useNewsReveal<HTMLDivElement>();
  return (
    <section id="stories-in-motion" className="relative isolate scroll-mt-24 overflow-hidden bg-[hsl(187_67%_7%)] py-section-lg text-ivory-100" aria-labelledby="motion-heading" data-testid="section-stories-in-motion">
      <div className="nm-light" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <div ref={head}><SectionTitle id="motion-heading" eyebrow="Videos · Reels · Interviews" title="Stories in motion." sub="Watch the people, ideas and moments shaping our global movement." /></div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ivory-300">Published stories with a video, or filed as video news, appear here. Playback always starts with you, one video at a time.</p>
        {items.length > 0 ? (
          <ul className="mt-12 space-y-14">{items.map((a, i) => <CmsMotion key={a.id} a={a} i={i} />)}</ul>
        ) : !ready ? null : (
          <p className="mt-10 max-w-xl border-l-2 border-gold-500 pl-6 text-ivory-200" data-testid="empty-motion">No further published video story on this page{EDITORIAL_VIDEO_NEWS.length ? ' — a curated video from an official source follows.' : '.'}</p>
        )}
        {EDITORIAL_VIDEO_NEWS.length > 0 && <Curated />}
      </div>
    </section>
  );
}
