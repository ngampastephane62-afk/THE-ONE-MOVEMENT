import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import '@/styles/universe.css';
import { ArrowRight, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { ECOSYSTEM_PERSONAS } from '@/lib/ecosystem-resources';
import PersonaPicker from './PersonaPicker';
import SectorDetail from './SectorDetail';
import SectorEmblem from './SectorEmblem';
import RealEstateWorld from './RealEstateWorld';
import SectorWorld from './worlds/SectorWorld';
import WorldMotif from './worlds/WorldMotif';
import { getWorldConfig } from './worlds/world-config';
import OneKey from './exhibition/OneKey';
import { prefersReducedMotion, useStage } from './exhibition/useStage';

interface Props {
  selected?: string;
  onSelect?: (slug: string) => void;
}

export default function SectorExplorer({ selected: controlled, onSelect }: Props = {}) {
  const [persona, setPersona] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState<string>(SECTORS[0].slug);
  const selected = controlled ?? local;
  const setSelected = (slug: string) => { setLocal(slug); onSelect?.(slug); };
  const { ref, attrs } = useStage<HTMLDivElement>();

  const visible = useMemo(() => {
    const p = ECOSYSTEM_PERSONAS.find((x) => x.id === persona);
    const q = query.trim().toLowerCase();
    return SECTORS.filter((s) => {
      if (p && !(p.sectors as readonly string[]).includes(s.slug)) return false;
      if (!q) return true;
      return [s.name, s.descriptor, s.contributes, ...s.whoBelongs].join(' ').toLowerCase().includes(q);
    });
  }, [persona, query]);

  // A sector chosen on the hero orbit always shows, even if filters would hide it.
  const active = visible.find((s) => s.slug === selected) ?? (controlled ? SECTORS.find((s) => s.slug === controlled) : undefined) ?? visible[0];
  const art = (slug: string) => { const c = getWorldConfig(slug); return { motif: c?.motif ?? ('skyline' as const), accent: c?.accent ?? '39 52% 54%' }; };
  const activeCfg = active ? art(active.slug) : undefined;
  const personaLabel = ECOSYSTEM_PERSONAS.find((x) => x.id === persona)?.label;

  const enterWorld = () => {
    if (!active) return;
    const el = document.querySelector<HTMLElement>(`[data-testid="world-${active.slug}"]`) ?? document.getElementById('sector-world-anchor');
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section id="explore" className="scroll-mt-20" aria-labelledby="explore-title">
      <div ref={ref} {...attrs} className="tomi-weave-dark relative isolate overflow-hidden bg-lagoon-900 py-20" style={activeCfg ? ({ '--w': activeCfg.accent } as CSSProperties) : undefined}>
        {activeCfg && (
          <div className="x-decor x-gates-ambient" aria-hidden="true">
            <div key={active?.slug}><WorldMotif motif={activeCfg.motif} /></div>
          </div>
        )}
        <div className="x-content mx-auto max-w-7xl px-6">
          <p className="x-track text-eyebrow text-gold-400">Chapter five · The gateways</p>
          <h2 id="explore-title" className="mt-3 text-display-lg text-ivory-100">
            <span className="x-line"><span style={{ '--d': '100ms' } as CSSProperties}>SEVENTEEN SECTORS.</span></span>
            <span className="x-line"><span style={{ '--d': '260ms' } as CSSProperties} className="text-gold-400">SEVENTEEN GATEWAYS.</span></span>
            <span className="x-line"><span style={{ '--d': '420ms' } as CSSProperties} className="text-display-md text-ivory-200">ONE CONNECTED UNIVERSE.</span></span>
          </h2>
          <p className="x-fade mt-5 max-w-2xl text-ivory-300" style={{ '--d': '560ms' } as CSSProperties}>Every gateway is open. Choose any world directly, search, or narrow the list by interest if you like. Nothing here asks who you are first.</p>
        </div>

        <div className="x-content mx-auto mt-12 grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label htmlFor="sector-search" className="text-eyebrow text-gold-400">Find a world</label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-300" aria-hidden="true" />
              <input
                id="sector-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: architects, film, care, investors..."
                data-testid="input-sector-search"
                className="w-full border border-lagoon-600 bg-lagoon-800 py-3 pl-9 pr-3 text-sm text-ivory-100 placeholder:text-ivory-300/60 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <details className="x-optional mt-4 border border-ivory-100/10 bg-lagoon-800/40" data-testid="panel-personalize">
              <summary className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-xs uppercase tracking-[0.16em] text-ivory-200 hover:text-gold-400" data-testid="button-personalize-toggle">
                <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-gold-400" aria-hidden="true" /> Personalize your discovery <span className="normal-case tracking-normal text-ivory-300">· optional{personaLabel ? ` · ${personaLabel}` : ''}</span></span>
                <ChevronDown className="x-chev h-4 w-4" aria-hidden="true" />
              </summary>
              <div className="px-4 pb-4">
                <p className="mb-3 text-xs text-ivory-300">Pick a profile for more relevant suggestions, or leave it on everyone. Every sector stays open either way.</p>
                <PersonaPicker value={persona} onChange={setPersona} />
              </div>
            </details>

            <p className="mt-4 text-xs text-ivory-300" aria-live="polite">{visible.length} of {SECTORS.length} gateways</p>
            {visible.length ? (
              <ul className="x-stagger mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2" aria-label="Sectors">
                {visible.map((s, i) => {
                  const on = active?.slug === s.slug;
                  const n = SECTORS.findIndex((x) => x.slug === s.slug) + 1;
                  const cfg = art(s.slug);
                  return (
                    <li key={s.slug} style={{ '--d': `${Math.min(i, 10) * 60}ms` } as CSSProperties}>
                      <button
                        type="button"
                        onClick={() => setSelected(s.slug)}
                        aria-pressed={on}
                        data-testid={`button-sector-${s.slug}`}
                        className="tomi-gateway"
                        style={{ '--gw-turn': `${n * 21}deg`, '--w': cfg.accent } as CSSProperties}
                      >
                        <span className="x-gw-art" aria-hidden="true"><WorldMotif motif={cfg.motif} /></span>
                        <SectorEmblem slug={s.slug} />
                        <span className="tomi-gateway-num" aria-hidden="true">{String(n).padStart(2, '0')} / {SECTORS.length}</span>
                        <span className={`mt-2 block font-display text-xs tracking-[0.12em] ${on ? 'text-gold-400' : 'text-ivory-100'}`}>{s.name.toUpperCase()}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-ivory-300 line-clamp-2">{s.descriptor}</span>
                        <span className="x-gw-enter" aria-hidden="true">{on ? 'Gateway open' : 'Open gateway'} <ArrowRight className="h-3 w-3" /></span>
                        {on && <span key={s.slug} className="x-gw-unlock" aria-hidden="true"><OneKey className="w-full" /></span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-6 border border-dashed border-gold-500/40 p-6 text-sm text-ivory-200">
                No sector matches that search for this profile.
                <button type="button" onClick={() => { setQuery(''); setPersona(null); }} className="ml-1 text-gold-400 underline" data-testid="button-clear-filters">Clear filters</button>
              </div>
            )}
          </div>
          <div className="lg:col-span-7 lg:border-l lg:border-lagoon-600/50 lg:pl-10" aria-live="polite">
            {active && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-400" data-testid="text-sector-gateway-index">Gateway {String(SECTORS.findIndex((x) => x.slug === active.slug) + 1).padStart(2, '0')} of {SECTORS.length}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={enterWorld} className="x-btn x-btn-ghost !min-h-[40px] !px-4 !py-2" data-testid="button-enter-world">
                    Enter the {active.name} world <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <Link href={`/ecosystem/${active.slug}`} className="x-btn !min-h-[40px] !px-4 !py-2" data-testid="link-open-sector-hub">
                    Open the {active.name} hub <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
            {active ? <SectorDetail sector={active} /> : <p className="text-ivory-300">Choose a sector to see its programmes and resources.</p>}
          </div>
        </div>
        {active && <div id="sector-world-anchor" className="x-content mx-auto mt-12 max-w-7xl scroll-mt-20 px-6">{active.slug === 'real-estate' ? <RealEstateWorld /> : <SectorWorld key={active.slug} slug={active.slug} />}<p className="mt-6 text-center"><Link href={`/ecosystem/${active.slug}`} className="inline-flex min-h-[44px] items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold-400 hover:text-ivory-100" data-testid="link-sector-hub-footer">Community, learning, posts and your activity in {active.name} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></p></div>}
      </div>
    </section>
  );
}
