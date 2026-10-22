import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import type { NewsPublicArticle } from '@workspace/api-client-react';
import { PARTNER_INTRODUCTION_TARGETS } from '@workspace/shared';
import { useNewsReveal } from '@/hooks/use-news-motion';
import { storyIntro } from '@/lib/news-feed';
import { DiscoverLink, Lines, Meta, SectionTitle, ShareStory, StoryMedia, ring } from './parts';
import { cn } from '@/lib/utils';

const partnerName = (k: string | null) => (k ? PARTNER_INTRODUCTION_TARGETS.find((p) => String(p.id) === k)?.name ?? null : null);

function Reveal({ children, className, as: Tag = 'div', testId }: { children: React.ReactNode; className?: string; as?: 'div' | 'article' | 'li'; testId?: string }) {
  const ref = useNewsReveal<HTMLDivElement>();
  return <Tag ref={ref as never} className={className} data-testid={testId}>{children}</Tag>;
}

/* ── 2. Featured announcements: lateral split, alternating sides ─────────── */
export function FeaturedAnnouncements({ items }: { items: NewsPublicArticle[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-ivory-50 py-section-lg" aria-labelledby="featured-heading" data-testid="section-featured">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Reveal><SectionTitle id="featured-heading" eyebrow="Official · Partnerships · Press" title="Featured announcements." tone="light" /></Reveal>
        <div className="mt-14 space-y-20">
          {items.map((a, i) => {
            const flip = i % 2 === 1;
            const partner = partnerName(a.snapshot.relatedPartnerKey);
            const intro = storyIntro(a);
            return (
              <Reveal as="article" key={a.id} testId={`card-featured-${a.slug}`} className="grid gap-8 md:grid-cols-2 md:items-center lg:gap-16">
                <StoryMedia a={a} from={flip ? '' : 'nm-from-left'} className={flip ? 'md:order-2' : ''} />
                <div className="nm-side min-w-0" style={{ ['--x' as string]: flip ? '-28px' : '28px', ['--d' as string]: '260ms' }}>
                  <Meta a={a} tone="light" d={380} />
                  <h3 className="nm-headline mt-4 font-display text-[clamp(1.5rem,4vw,2.6rem)] uppercase leading-[1.04] text-lagoon-900"><Lines text={a.snapshot.title} base={300} /></h3>
                  {partner && <p className="nm-up mt-4 inline-block rounded-sharp border border-lagoon-700/30 px-3 py-1 text-xs uppercase tracking-wider text-lagoon-700" style={{ ['--d' as string]: '520ms' }}>Partner · {partner}</p>}
                  {intro && <p className="nm-up mt-4 text-base leading-relaxed text-lagoon-800" style={{ ['--d' as string]: '600ms' }}>{intro}</p>}
                  <div className="mt-7 flex flex-wrap items-center gap-4"><DiscoverLink a={a} tone="light" label="Read announcement" d={720} /><ShareStory a={a} tone="light" /></div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 3. Discovery feed: varied compositions + pagination ─────────────────── */
export function DiscoveryFeed({ items, page, hasMore, loading, error, onRetry, onPage }: { items: NewsPublicArticle[]; page: number; hasMore: boolean; loading: boolean; error: boolean; onRetry: () => void; onPage: (p: number) => void }) {
  const showPager = page > 1 || hasMore;
  return (
    <section id="news-feed" className="scroll-mt-24 bg-ivory-100 py-section-lg" aria-labelledby="feed-heading" data-testid="section-discovery-feed">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Reveal><SectionTitle id="feed-heading" eyebrow={page > 1 ? `Older stories · page ${page}` : 'The news feed'} title="Discover the stories." sub="Every published update, newest first by publication time." tone="light" /></Reveal>
        {loading ? (
          <ul className="mt-12 grid gap-8 md:grid-cols-2" aria-busy="true" aria-label="Loading stories">{[0, 1].map((i) => <li key={i} className="h-80 animate-pulse rounded-sharp bg-ivory-200" />)}</ul>
        ) : error ? (
          <div role="alert" className="mt-12 max-w-xl border-l-2 border-coral-500 pl-6 text-lagoon-800">These stories could not be loaded.
            <button type="button" onClick={onRetry} className={cn('ml-3 text-sm font-semibold text-gold-700 underline', ring)} data-testid="button-retry-feed">Try again</button>
          </div>
        ) : items.length === 0 ? (
          <p className="mt-12 max-w-xl border-l-2 border-gold-500 pl-6 text-lagoon-800" data-testid="empty-feed">
            {page > 1 ? 'No further stories on this page.' : 'Every current story is presented in the sections above and below. New publications will extend this feed.'}
          </p>
        ) : (
          <ol className="mt-14 space-y-16">
            {items.map((a, i) => {
              const v = i % 3;
              const intro = storyIntro(a);
              if (v === 2) return (
                <Reveal as="li" key={a.id} testId={`card-feed-${a.slug}`} className="border-t border-lagoon-900/15 pt-10">
                  <Meta a={a} tone="light" />
                  <h3 className="nm-headline mt-4 max-w-4xl font-display text-[clamp(1.6rem,5vw,3.25rem)] uppercase leading-[1] text-lagoon-900"><Link href={`/news/${a.slug}`} className={cn('hover:text-gold-700', ring)} tabIndex={-1}><Lines text={a.snapshot.title} base={120} /></Link></h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem] md:items-end">
                    {intro ? <p className="nm-up max-w-2xl text-base leading-relaxed text-lagoon-800" style={{ ['--d' as string]: '360ms' }}>{intro}</p> : <span />}
                    <StoryMedia a={a} ratio="aspect-[4/3]" from="nm-from-bottom" d={200} />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4"><DiscoverLink a={a} tone="light" label="Read story" d={460} /><ShareStory a={a} tone="light" /></div>
                </Reveal>
              );
              return (
                <Reveal as="li" key={a.id} testId={`card-feed-${a.slug}`} className={cn('grid gap-6 border-t border-lagoon-900/15 pt-10 md:items-center md:gap-12', v === 0 ? 'md:grid-cols-[1.2fr_1fr]' : 'md:grid-cols-[1fr_1.2fr]')}>
                  <StoryMedia a={a} ratio={v === 0 ? 'aspect-[16/10]' : 'aspect-square'} from={v === 0 ? 'nm-from-left' : ''} className={v === 1 ? 'md:order-2' : ''} />
                  <div className="nm-side min-w-0" style={{ ['--x' as string]: v === 0 ? '24px' : '-24px', ['--d' as string]: '220ms' }}>
                    <Meta a={a} tone="light" d={300} />
                    <h3 className="nm-headline mt-3 font-display text-2xl uppercase leading-tight text-lagoon-900 sm:text-3xl"><Lines text={a.snapshot.title} base={260} /></h3>
                    {intro && <p className="nm-up mt-4 text-base leading-relaxed text-lagoon-800" style={{ ['--d' as string]: '480ms' }}>{intro}</p>}
                    <div className="mt-6 flex flex-wrap items-center gap-4"><DiscoverLink a={a} tone="light" label="Read more" d={600} /><ShareStory a={a} tone="light" /></div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        )}
        {showPager && (
          <nav className="mt-16 flex flex-wrap items-center gap-3 border-t border-lagoon-900/15 pt-8" aria-label="News pages">
            <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={cn('min-h-11 rounded-sharp border border-lagoon-900/30 px-5 text-xs font-semibold uppercase tracking-wider text-lagoon-900 disabled:opacity-30', ring)} data-testid="button-cms-news-prev">Newer</button>
            <span className="px-2 text-sm text-lagoon-700" data-testid="text-news-page">Page {page}</span>
            <button type="button" disabled={!hasMore} onClick={() => onPage(page + 1)} className={cn('min-h-11 rounded-sharp border border-lagoon-900/30 px-5 text-xs font-semibold uppercase tracking-wider text-lagoon-900 disabled:opacity-30', ring)} data-testid="button-cms-news-next">Older stories</button>
            {page > 1 && <span className="w-full text-xs text-lagoon-700">The latest story stays at the top of the page; all groups below show this page of the archive of publications.</span>}
          </nav>
        )}
      </div>
    </section>
  );
}

/* ── 5. Programmes, events & opportunities ───────────────────────────────── */
export function ProgrammeUpdates({ items, ready = true }: { items: NewsPublicArticle[]; ready?: boolean }) {
  return (
    <section className="relative bg-[hsl(166_48%_12%)] py-section-lg text-ivory-100" aria-labelledby="programmes-heading" data-testid="section-programmes">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Reveal><SectionTitle id="programmes-heading" eyebrow="Programmes · Events · Opportunities" title="Where to take part." sub="Published updates linked to the Movement's programmes, events, humanitarian work and opportunities." /></Reveal>
        {!ready && items.length === 0 ? null : items.length === 0 ? (
          <Reveal className="mt-10 flex flex-col gap-4 border-l-2 border-gold-500 pl-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="nm-up max-w-xl text-ivory-200" data-testid="empty-programmes">No programme, event or opportunity update is published on this page. Explore the programmes directly in the meantime.</p>
            <div className="nm-up flex flex-wrap gap-3" style={{ ['--d' as string]: '160ms' }}>
              <Link href="/programs" className={cn('inline-flex min-h-11 items-center rounded-sharp border border-gold-400/60 px-4 text-xs font-semibold uppercase tracking-wider hover:bg-gold-400 hover:text-ink-900', ring)} data-testid="link-programs">Programmes</Link>
              <Link href="/opportunities" className={cn('inline-flex min-h-11 items-center rounded-sharp border border-gold-400/60 px-4 text-xs font-semibold uppercase tracking-wider hover:bg-gold-400 hover:text-ink-900', ring)} data-testid="link-opportunities">Opportunities</Link>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-14 divide-y divide-gold-500/20 border-y border-gold-500/20">
            {items.map((a) => {
              const s = a.snapshot;
              const discover = s.category === 'event-announcement' ? 'Discover event' : s.category === 'opportunity' ? 'Discover opportunity' : 'Discover update';
              return (
                <Reveal as="li" key={a.id} testId={`card-programme-${a.slug}`} className="grid gap-6 py-10 md:grid-cols-[1fr_16rem] md:items-center md:gap-12">
                  <div className="min-w-0">
                    <Meta a={a} />
                    <h3 className="nm-headline mt-3 font-display text-[clamp(1.6rem,5vw,3.4rem)] uppercase leading-[0.98] text-ivory-50"><Lines text={s.title} base={120} /></h3>
                    {storyIntro(a) && <p className="nm-up mt-4 max-w-2xl text-ivory-200" style={{ ['--d' as string]: '380ms' }}>{storyIntro(a)}</p>}
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <DiscoverLink a={a} label={discover} d={480} />
                      {s.relatedProgrammeSlug && (
                        <Link href={`/programs/${s.relatedProgrammeSlug}`} className={cn('nm-up inline-flex min-h-11 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold-400 underline underline-offset-4', ring)} style={{ ['--d' as string]: '560ms' }} data-testid={`link-programme-${a.slug}`}>
                          Programme · {s.relatedProgrammeSlug.replace(/-/g, ' ')}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      )}
                    </div>
                  </div>
                  <StoryMedia a={a} ratio="aspect-[4/5]" from="nm-from-bottom" />
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
