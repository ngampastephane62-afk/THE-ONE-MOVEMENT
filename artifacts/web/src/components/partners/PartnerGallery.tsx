import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { PartnerOrganization } from '@workspace/api-client-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CATEGORIES, CATEGORY_LABEL, RELATIONSHIP_LABEL, safeHttpUrl, type PartnerCategory, type PartnerRelationship } from '@/lib/partner-directory';

type CatF = 'all' | PartnerCategory;
type RelF = 'all' | PartnerRelationship;

function Chip({ on, children, onClick, id }: { on: boolean; children: React.ReactNode; onClick: () => void; id: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} data-testid={`filter-${id}`}
      className={`min-h-10 rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ${on ? 'border-lagoon-900 bg-lagoon-900 text-ivory-50' : 'border-sand-300 bg-ivory-50 text-ink-800 hover:border-lagoon-600'}`}>{children}</button>
  );
}

export function PartnerGallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px bg-sand-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-busy="true" data-testid="status-partners-loading">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 bg-ivory-50 p-6"><div className="h-20 w-full animate-pulse rounded-lg bg-ivory-200 motion-reduce:animate-none" /><div className="h-3 w-2/3 animate-pulse rounded bg-ivory-200 motion-reduce:animate-none" /></div>
      ))}
    </div>
  );
}

export default function PartnerGallery({ items }: { items: PartnerOrganization[] }) {
  const [cat, setCat] = useState<CatF>('all');
  const [rel, setRel] = useState<RelF>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  // Always derive the drawer record from fresh data; closes if it disappears (unpublished/removed).
  const open = openId ? items.find((i) => i.id === openId) ?? null : null;
  useEffect(() => { if (openId && !items.some((i) => i.id === openId)) setOpenId(null); }, [items, openId]);
  const gridRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.pn-card:not(.pn-in)'));
    const io = new IntersectionObserver((entries) => {
      let n = 0;
      for (const e of entries) if (e.isIntersecting) {
        const t = e.target as HTMLElement;
        t.style.transitionDelay = `${Math.min(n++, 10) * 60}ms`;
        t.classList.add('pn-in'); io.unobserve(t);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    cards.forEach((c) => { if (c.getBoundingClientRect().top > window.innerHeight) { c.classList.add('pn-wait'); io.observe(c); } });
    return () => io.disconnect();
  }, [items, cat, rel]);
  const rels = useMemo(() => Array.from(new Set(items.map((i) => i.relationship))), [items]);
  const cats = useMemo(() => CATEGORIES.filter((c) => items.some((i) => i.category === c)), [items]);
  const shown = items.filter((i) => (cat === 'all' || i.category === cat) && (rel === 'all' || i.relationship === rel));

  return (
    <div>
      <div className="flex flex-col gap-3" role="group" aria-label="Filter partners">
        <div className="flex flex-wrap gap-2">
          <Chip on={cat === 'all'} onClick={() => setCat('all')} id="category-all">All · {items.length}</Chip>
          {cats.map((c) => <Chip key={c} on={cat === c} onClick={() => setCat(c)} id={`category-${c}`}>{CATEGORY_LABEL[c]}</Chip>)}
        </div>
        {rels.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-ink-700">Relationship
            <select value={rel} onChange={(e) => setRel(e.target.value as RelF)} className="min-h-10 rounded-full border border-sand-300 bg-ivory-50 px-3 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-500" data-testid="select-filter-relationship">
              <option value="all">All relationships</option>
              {rels.map((r) => <option key={r} value={r}>{RELATIONSHIP_LABEL[r]}</option>)}
            </select>
          </label>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} organizations shown</p>
      {shown.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-sand-300 p-10 text-center" data-testid="status-partners-empty">
          <p className="font-display text-xl text-ink-900">No organizations match this view.</p>
          <button type="button" className="mt-4 text-sm font-semibold text-lagoon-700 underline underline-offset-4" onClick={() => { setCat('all'); setRel('all'); }} data-testid="button-filter-reset">Show the full network</button>
        </div>
      ) : (
        <ul ref={gridRef} className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" data-testid="grid-partners">
          {shown.map((p) => (
            <li key={p.id} className="pn-card bg-ivory-50">
              <button type="button" onClick={() => setOpenId(p.id)} aria-label={`${p.name} — ${CATEGORY_LABEL[p.category]}, ${RELATIONSHIP_LABEL[p.relationship]}. Open details`}
                className="group flex h-full w-full flex-col items-center gap-3 p-5 text-center transition-colors hover:bg-ivory-100 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 sm:p-6" data-testid={`card-partner-${p.id}`}>
                <span className="flex h-20 w-full items-center justify-center sm:h-24">
                  {p.logoUrl ? <img src={p.logoUrl} alt={`${p.name} logo`} loading="lazy" className="max-h-full max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                    : <span className="font-display text-2xl text-lagoon-700" aria-hidden="true">{p.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('')}</span>}
                </span>
                <span className="text-[13px] font-semibold leading-snug text-ink-900 [overflow-wrap:anywhere]" data-testid={`text-partner-name-${p.id}`}>{p.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lagoon-600">{CATEGORY_LABEL[p.category]}</span>
                <span className="text-[11px] text-ink-700">{RELATIONSHIP_LABEL[p.relationship]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!open} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <SheetContent className="w-full overflow-y-auto bg-ivory-50 sm:max-w-md" data-testid="drawer-partner">
          {open && (
            <>
              <SheetHeader className="text-left">
                <div className="mb-4 flex h-32 items-center justify-center rounded-2xl border border-sand-200 bg-ivory-100 p-5">
                  {open.logoUrl ? <img src={open.logoUrl} alt={`${open.name} logo`} className="max-h-full max-w-full object-contain" /> : <span className="font-display text-3xl text-lagoon-700">{open.name}</span>}
                </div>
                <SheetTitle className="font-display text-2xl text-ink-900" data-testid="text-drawer-name">{open.name}</SheetTitle>
                <SheetDescription className="text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-600">{CATEGORY_LABEL[open.category]} · {RELATIONSHIP_LABEL[open.relationship]}</SheetDescription>
              </SheetHeader>
              {open.description && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink-800" data-testid="text-drawer-description">{open.description}</p>}
              {safeHttpUrl(open.website) && (
                <a href={safeHttpUrl(open.website)!} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-lagoon-900 px-5 text-xs font-semibold text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-drawer-website">
                  Official website <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
