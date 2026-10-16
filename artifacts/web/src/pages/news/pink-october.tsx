import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import GoldThread from '@/components/GoldThread';
import NewsVideo from '@/components/editorial/NewsVideo';
import { formatNewsDate, PINK_OCTOBER as item } from '@/lib/editorial-news';
import { cn } from '@/lib/utils';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

export default function PinkOctoberNews() {
  const title = `${item.title} | News`;
  return (
    <article className="bg-[hsl(30_40%_97%)]" data-testid={`page-news-${item.slug}`}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={item.standfirst} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={item.standfirst} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={item.publishedAt} />
      </Helmet>

      <header className="relative overflow-hidden" style={{ backgroundColor: 'hsl(187 67% 8%)' }}>
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[hsl(338_70%_72%/.18)] blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-10 sm:pt-14">
          <Link href="/news" className={cn('inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory-200 hover:text-gold-400', focusRing)} data-testid="link-back-news"><ArrowLeft className="h-4 w-4" aria-hidden />All news</Link>
          <p className="mt-8 text-eyebrow text-[hsl(338_70%_80%)]">{item.kicker}</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] text-ivory-100 sm:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200 sm:text-xl">{item.standfirst}</p>
          <GoldThread className="mt-8" length="160px" node />
          <p className="mt-5 text-sm text-ivory-300">
            <span>Source:</span> <span data-no-translate>{item.source.name}</span> · <span>Shared on</span> <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:py-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <NewsVideo item={item} />
        </div>

        <div className="min-w-0 max-w-2xl">
          {item.body.map((sec, i) => (
            <section key={i} className={i ? 'mt-10' : ''}>
              {sec.heading && <h2 className="mb-4 text-2xl uppercase tracking-wide text-lagoon-900" style={{ fontFamily: 'var(--font-display)' }}>{sec.heading}</h2>}
              <div className="space-y-5 text-lg leading-relaxed text-lagoon-800">
                {sec.paragraphs.map((p, j) => <p key={j} className={i === 0 && j === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-[hsl(338_55%_42%)]' : ''}>{p}</p>)}
              </div>
            </section>
          ))}

          <footer className="mt-10 border-t border-sand-300 pt-6 text-sm leading-relaxed text-ink-700">
            <a href={item.source.url} target="_blank" rel="noopener noreferrer"
              className={cn('inline-flex min-h-12 items-center gap-2 rounded-sharp bg-lagoon-900 px-5 py-3 font-semibold text-ivory-100 hover:bg-lagoon-800', focusRing)}
              data-testid="link-emaar-official-page">
              <span>View EMAAR’s official page</span><ArrowUpRight className="h-4 w-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <p className="mt-3 text-xs" data-no-translate>{item.source.handle}</p>
          </footer>
        </div>
      </div>
    </article>
  );
}
