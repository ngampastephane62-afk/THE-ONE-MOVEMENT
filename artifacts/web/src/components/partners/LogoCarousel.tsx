import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { historyLogo, type HistoryPartner } from '@/lib/partner-history';

function usePerPage() {
  const get = () => (typeof window === 'undefined' ? 4 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2);
  const [n, setN] = useState(get);
  useEffect(() => {
    const on = () => setN(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return n;
}

export function LogoTile({ p, tone = 'light', large = false }: { p: HistoryPartner; tone?: 'light' | 'dark'; large?: boolean }) {
  const [failed, setFailed] = useState(p.logo === false);
  return (
    <figure id={p.slug} className="flex h-full scroll-mt-28 flex-col" data-testid={`history-partner-${p.id}`}>
      <div className={`relative flex w-full shrink-0 ${large ? 'aspect-[16/9]' : 'aspect-[4/3]'} items-center justify-center overflow-hidden rounded-md ${tone === 'dark' ? 'bg-ivory-50' : 'bg-white/70 ring-1 ring-sand-200'} shadow-[0_18px_40px_-28px_hsl(187_40%_12%/0.45)]`}>
        {failed ? (
          <span className="absolute inset-0 flex items-center justify-center p-[10%] text-center font-display text-xl uppercase leading-tight tracking-wide text-ink-900 sm:text-2xl" data-testid={`text-history-name-${p.id}`}>{p.name}</span>
        ) : (
          <img src={historyLogo(p.id)} alt={`${p.name} logo`} loading="lazy" decoding="async" onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-contain p-[12%]" data-testid={`img-history-logo-${p.id}`} />
        )}
      </div>
      <figcaption className={`mt-3 text-xs font-medium leading-snug ${tone === 'dark' ? 'text-ivory-200' : 'text-ink-800'}`}>
        {p.name}
        {p.description && <span className="mt-1 block font-normal opacity-80">{p.description}</span>}
        {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{p.linkLabel}</a>}
      </figcaption>
    </figure>
  );
}

/** Paged, user-driven logo slides. No autoplay, no marquee. */
export default function LogoCarousel({ items, label, tone = 'light' }: { items: HistoryPartner[]; label: string; tone?: 'light' | 'dark' }) {
  const per = usePerPage();
  const pages = Math.max(1, Math.ceil(items.length / per));
  const [page, setPage] = useState(0);
  useEffect(() => { if (page >= pages) setPage(pages - 1); }, [page, pages]);
  // Deep links to a slugged partner open its page.
  useEffect(() => {
    const h = window.location.hash.slice(1);
    const idx = items.findIndex((p) => p.slug === h);
    if (idx >= 0) setPage(Math.floor(idx / per));
  }, [items, per]);
  const go = (d: number) => setPage((n) => (n + d + pages) % pages);
  const btn = `grid h-11 w-11 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-30 ${tone === 'dark' ? 'border-ivory-100/30 text-ivory-100 hover:border-gold-400' : 'border-ink-900/20 text-ink-900 hover:border-gold-600'}`;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}>
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${page * 100}%)` }}>
          {Array.from({ length: pages }, (_, pi) => (
            <ul key={pi} aria-hidden={pi !== page} inert={pi !== page ? true : undefined}
              aria-label={label}
              className="grid w-full shrink-0 gap-4 sm:gap-6" style={{ gridTemplateColumns: `repeat(${per}, minmax(0,1fr))` }}>
              {items.slice(pi * per, pi * per + per).map((p) => <li key={p.id}><LogoTile p={p} tone={tone} /></li>)}
            </ul>
          ))}
        </div>
      </div>
      {pages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <button type="button" className={btn} onClick={() => go(-1)} aria-label="Previous logos" data-testid={`button-logos-prev-${label}`}><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" className={btn} onClick={() => go(1)} aria-label="Next logos" data-testid={`button-logos-next-${label}`}><ChevronRight className="h-4 w-4" /></button>
          <div className="ml-2 flex gap-1" role="group" aria-label="Logo pages">
            {Array.from({ length: pages }, (_, n) => (
              <button key={n} type="button" onClick={() => setPage(n)} aria-label={String(n + 1)} aria-current={n === page}
                className="relative h-11 w-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                <span className={`absolute inset-x-1 top-1/2 h-[3px] rounded-full ${n === page ? 'bg-gold-500' : tone === 'dark' ? 'bg-ivory-100/25' : 'bg-ink-900/15'}`} />
              </button>
            ))}
          </div>
          <span className={`ml-auto font-mono text-xs ${tone === 'dark' ? 'text-ivory-300' : 'text-ink-600'}`} aria-live="polite">{page + 1} / {pages}</span>
        </div>
      )}
    </div>
  );
}
