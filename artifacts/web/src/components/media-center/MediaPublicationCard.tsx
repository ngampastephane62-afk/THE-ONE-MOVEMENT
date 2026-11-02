import { ArrowUpRight } from 'lucide-react';
import type { MediaPublication } from '@workspace/api-client-react';
import { CATEGORY_LABEL, formatPubDate, safeHttpUrl, safeInstagramUrl } from '@/lib/media-center';
import MediaEmbed from './MediaEmbed';

export default function MediaPublicationCard({ p, lead = false }: { p: MediaPublication; lead?: boolean }) {
  const external = p.externalUrl ? safeHttpUrl(p.externalUrl) : null;
  const externalIsInstagram = !!external && ['instagram.com', 'www.instagram.com'].includes(new URL(external).hostname.toLowerCase());
  // Legacy account-profile URLs must not masquerade as a specific publication.
  const href = externalIsInstagram ? null : external;
  const instagram = p.instagramUrl ? safeInstagramUrl(p.instagramUrl) : externalIsInstagram && external ? safeInstagramUrl(external) : null;
  const date = formatPubDate(p.publicationDate);
  return (
    <article className={`group flex h-full flex-col border border-sand-200 bg-ivory-50 shadow-sm transition-colors duration-200 hover:border-gold-500/60 ${lead ? 'lg:grid lg:grid-cols-12' : ''}`} data-testid={`card-media-publication-${p.id}`}>
      <div className={`relative overflow-hidden bg-lagoon-900 ${lead ? 'lg:col-span-7' : ''}`}>
        {p.embed ? <MediaEmbed embed={p.embed} title={p.title} poster={p.coverUrl} />
          : p.coverUrl ? <img src={p.coverUrl} alt={p.category === 'magazine' ? `${p.title} — complete magazine cover` : ''} loading="lazy" className={`w-full ${p.category === 'magazine' ? 'aspect-[3/4] bg-ivory-100 object-contain' : `object-cover ${lead ? 'aspect-[16/10] lg:h-full' : 'aspect-[16/10]'}`}`} />
          : <div className="flex aspect-[16/10] items-center justify-center tomi-aurora-surface"><span className="text-eyebrow text-gold-400">{CATEGORY_LABEL[p.category]}</span></div>}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${lead ? 'lg:col-span-5 lg:p-10' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-eyebrow text-gold-600">{CATEGORY_LABEL[p.category]}</p>
          {p.logoUrl && <img src={p.logoUrl} alt={p.publisher ? `${p.publisher} logo` : 'Publisher logo'} loading="lazy" className="h-7 max-w-[110px] object-contain" />}
        </div>
        <div className="mt-4 h-px w-10 bg-gold-500" aria-hidden="true" />
        <h3 className={`mt-4 text-ink-900 ${lead ? 'text-display-md' : 'text-xl'}`} style={{ fontFamily: 'var(--font-display)' }}>{p.title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-500">{[p.publisher, date].filter(Boolean).join(' · ')}</p>
        {(() => {
          // Task 33: only the lead paragraph is shown; any further source notes (e.g. third-party name lists) stay in optional archive details.
          const [first, ...rest] = p.description.split(/\n\s*\n/);
          return (
            <>
              <p className={`mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700 ${lead ? '' : 'line-clamp-4'}`}>{first}</p>
              {rest.length > 0 && (
                <details className="mt-3 text-sm text-ink-700">
                  <summary className="min-h-10 cursor-pointer py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lagoon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`button-source-details-${p.id}`}>Source record details</summary>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{rest.join('\n\n')}</p>
                  <p className="mt-2 text-xs text-ink-500">Names in source material are not TOMI ambassadors, partners or nominees unless stated elsewhere.</p>
                </details>
              )}
            </>
          );
        })()}
        {(href || instagram) && <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6">
          {href && <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-gold-600 underline underline-offset-4 hover:text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-read-publication-${p.id}`}>
            READ FULL ARTICLE<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>}
          {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-lagoon-700 underline underline-offset-4 hover:text-lagoon-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-instagram-publication-${p.id}`}>
            VIEW ORIGINAL INSTAGRAM POST<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>}
        </div>}
      </div>
    </article>
  );
}
