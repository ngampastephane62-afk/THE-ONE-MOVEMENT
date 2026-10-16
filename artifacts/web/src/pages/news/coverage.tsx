import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowUpRight, RotateCw } from 'lucide-react';
import { useGetNewsArchive, getGetNewsArchiveQueryKey } from '@workspace/api-client-react';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import { cn } from '@/lib/utils';
import { PRESS_CATEGORY_LABELS, assetUrl, captureCount, hostOf, outboundLink } from '@/lib/press';
import { EvidenceViewer, PublisherMark } from '@/components/news/PressParts';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

export default function CoverageDetail() {
  const { id } = useParams<{ id: string }>();
  const q = useGetNewsArchive({ query: { queryKey: getGetNewsArchiveQueryKey(), staleTime: 30000, refetchOnMount: true } });
  const [idx, setIdx] = useState<number | null>(null);
  const e = q.data?.find((x) => String(x.id) === id);

  if (q.isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-section-lg" aria-busy="true"><div className="h-6 w-48 animate-pulse bg-sand-100" /><div className="mt-6 h-14 w-3/4 animate-pulse bg-sand-100" /><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse bg-sand-100" />)}</div></div>;
  }
  if (q.isError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-section-lg" role="alert">
        <p className="text-lagoon-900">This coverage record could not be loaded.</p>
        <button type="button" onClick={() => q.refetch()} className={cn('mt-4 inline-flex items-center gap-2 rounded-sm bg-lagoon-900 px-4 py-2 text-xs font-semibold uppercase text-ivory-100', focusRing)} data-testid="button-retry-coverage"><RotateCw className="h-3.5 w-3.5" />Try again</button>
      </div>
    );
  }
  if (!e) {
    return (
      <div className="mx-auto max-w-xl px-6 py-section-lg">
        <Helmet><title>Coverage not found | The One Movement International</title><meta name="robots" content="noindex" /></Helmet>
        <p className="font-display text-2xl uppercase text-lagoon-900">Not in the archive.</p>
        <p className="mt-3 text-lagoon-800">This record is not published or no longer exists.</p>
        <Link href="/news" className={cn('mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lagoon-700 underline', focusRing)}><ArrowLeft className="h-4 w-4" />Back to the press archive</Link>
      </div>
    );
  }

  const link = outboundLink(e);
  const title = `${e.title} — ${e.outlet} | TOMI Press Archive`;
  const desc = e.summary.length > 158 ? e.summary.slice(0, 155).trimEnd() + '...' : e.summary;

  return (
    <div>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
      </Helmet>

      <HeroSurface glowOrigin="bottom-center" minHeight="60vh">
        <div className="mx-auto w-full max-w-5xl px-6 py-section-lg">
          <Link href="/news" className={cn('inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ivory-300 hover:text-gold-400', focusRing)} data-testid="link-back-archive"><ArrowLeft className="h-3.5 w-3.5" />Press archive</Link>
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-center">
            <PublisherMark outlet={e.outlet} logoUrl={e.logoUrl} size="lg" />
            <div>
              <p className="text-eyebrow text-gold-400">{e.outlet} · {e.dateLabel}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-ivory-300">{PRESS_CATEGORY_LABELS[e.category]} · Historical press partner</p>
            </div>
          </div>
          <h1 className="mt-8 text-display-lg text-ivory-100 animate-fade-up" data-testid="text-coverage-title">{e.title}</h1>
          <GoldThread className="mt-8" length="180px" node />
        </div>
      </HeroSurface>

      <article className="w-full bg-ivory-50 py-section-md">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[1fr_16rem]">
          <div>
            <p className="text-xl leading-relaxed text-lagoon-900">{e.summary}</p>
            <p className="mt-4 text-sm text-lagoon-700">Summary by The One Movement International of coverage published by {e.outlet}.</p>
          </div>
          <aside className="h-fit border-l-2 border-gold-500 pl-5 text-sm text-lagoon-800">
            <p className="font-semibold text-lagoon-900">{e.outlet}</p>
            <p className="mt-1">{e.dateLabel}</p>
            <p className="mt-1">One publication, {captureCount(e.evidenceUrls.length)}</p>
            {link && (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn('mt-4 inline-flex items-center gap-1 rounded-sm bg-lagoon-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:bg-lagoon-800', focusRing)} data-testid="link-outbound">
                {link.label}<ArrowUpRight className="h-3.5 w-3.5" /><span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {link && !link.direct && <p className="mt-2 text-xs text-lagoon-700">Opens {hostOf(link.href)}, the publisher's site.</p>}
          </aside>
        </div>
      </article>

      <section className="w-full py-section-lg" style={{ backgroundColor: 'hsl(187 67% 8%)' }} aria-labelledby="captures-h">
        <div className="mx-auto max-w-6xl px-6">
          <p id="captures-h" className="text-eyebrow text-gold-400">The original captures · {e.evidenceUrls.length} screens of one publication</p>
          <p className="mt-2 max-w-2xl text-sm text-ivory-300">Shown uncropped. Select any screen to read it full size. Social counts visible in a capture are a dated snapshot, not overall reach.</p>
          {e.evidenceUrls.length === 0 ? (
            <p className="mt-8 text-ivory-300">Captures for this record have not been attached yet.</p>
          ) : (
            <ol className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {e.evidenceUrls.map((src, i) => (
                <li key={src + i}>
                  <button type="button" onClick={() => setIdx(i)} className={cn('group block w-full rounded-sharp border border-gold-500/25 bg-ivory-100 p-2 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none', focusRing, 'focus-visible:ring-offset-lagoon-900')} aria-label={`Open capture ${i + 1} of ${e.evidenceUrls.length}`} data-testid={`button-capture-${i}`}>
                    <span className="block aspect-[3/4] overflow-hidden"><img src={assetUrl(src)} alt={`${e.outlet} coverage, capture ${i + 1}`} loading="lazy" className="h-full w-full object-contain" /></span>
                    <span className="mt-2 block text-left text-[11px] uppercase tracking-wider text-lagoon-800">Screen {i + 1} of {e.evidenceUrls.length}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <EvidenceViewer images={e.evidenceUrls} outlet={e.outlet} title={e.title} index={idx} onIndex={setIdx} onClose={() => setIdx(null)} />
    </div>
  );
}
