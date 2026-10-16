import { WEALTH_ESTIMATES } from '@/lib/wealth-data';

export default function WealthLabel({ slug, historical = false }: { slug: string; historical?: boolean }) {
  const estimate = WEALTH_ESTIMATES[slug];
  if (!estimate || historical) return null;
  return (
    <div className="my-4 border-y border-gold-500/30 py-3" data-testid={`wealth-${slug}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-gold-600">Estimated net worth</p>
      <>
        <p className="mt-1 font-display text-2xl text-lagoon-900" data-no-translate>{estimate.display}</p>
        <p className="mt-1 text-[11px] text-ink-700"><a href={estimate.source} target="_blank" rel="noopener noreferrer" className="underline">{estimate.publisher}</a> · {estimate.date}{estimate.scope ? ` · ${estimate.scope}` : ''}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-ink-700">{estimate.note || 'Public estimate · unaudited'}</p>
      </>
    </div>
  );
}
