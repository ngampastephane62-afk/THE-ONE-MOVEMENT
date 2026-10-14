import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SECTORS } from '@/lib/sectors-data';
import { ECOSYSTEM_PERSONAS } from '@/lib/ecosystem-resources';
import PersonaPicker from './PersonaPicker';
import SectorDetail from './SectorDetail';

export default function SectorExplorer() {
  const [persona, setPersona] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>(SECTORS[0].slug);

  const visible = useMemo(() => {
    const p = ECOSYSTEM_PERSONAS.find((x) => x.id === persona);
    const q = query.trim().toLowerCase();
    return SECTORS.filter((s) => {
      if (p && !(p.sectors as readonly string[]).includes(s.slug)) return false;
      if (!q) return true;
      return [s.name, s.descriptor, s.contributes, ...s.whoBelongs].join(' ').toLowerCase().includes(q);
    });
  }, [persona, query]);

  const active = visible.find((s) => s.slug === selected) ?? visible[0];

  return (
    <section id="explore" className="scroll-mt-20" aria-labelledby="explore-title">
      <div className="bg-ivory-100 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-eyebrow text-gold-700">STEP ONE</p>
          <h2 id="explore-title" className="mt-2 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>WHO ARE YOU HERE AS?</h2>
          <p className="mt-3 max-w-2xl text-ink-700">Pick the closest description. It narrows the seventeen sectors to the ones most likely to be useful. You can always switch back to everyone.</p>
          <div className="mt-7"><PersonaPicker value={persona} onChange={setPersona} /></div>
        </div>
      </div>
      <div className="bg-lagoon-900 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label htmlFor="sector-search" className="text-eyebrow text-gold-400">STEP TWO · FIND YOUR SECTOR</label>
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
            <p className="mt-3 text-xs text-ivory-300" aria-live="polite">{visible.length} of {SECTORS.length} sectors</p>
            {visible.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-2" aria-label="Sectors">
                {visible.map((s) => {
                  const on = active?.slug === s.slug;
                  return (
                    <li key={s.slug}>
                      <button
                        type="button"
                        onClick={() => setSelected(s.slug)}
                        aria-pressed={on}
                        data-testid={`button-sector-${s.slug}`}
                        className={`w-full border px-3 py-3 text-left transition-colors ${on ? 'border-gold-400 bg-gold-500/15' : 'border-lagoon-600/60 hover:border-gold-500/60'}`}
                      >
                        <span className={`block font-display text-xs tracking-[0.12em] ${on ? 'text-gold-400' : 'text-ivory-100'}`}>{s.name.toUpperCase()}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-ivory-300 line-clamp-2">{s.descriptor}</span>
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
            {active ? <SectorDetail sector={active} /> : <p className="text-ivory-300">Choose a sector to see its programmes and resources.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
