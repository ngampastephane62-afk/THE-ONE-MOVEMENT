import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { programsForSectors, resourcesForSectors, sectorName } from '@/lib/ecosystem-match';
import { ActionLink, Eyebrow, SectionTitle } from './SummitUI';
import { ROUTES, SUMMIT_SECTORS } from './summit-data';

export default function SectorDirectory() {
  const [active, setActive] = useState(SUMMIT_SECTORS[0].id);
  const sector = SUMMIT_SECTORS.find((s) => s.id === active) ?? SUMMIT_SECTORS[0];
  const resources = useMemo(() => resourcesForSectors(sector.keys), [sector]);
  const programmes = useMemo(() => programsForSectors(sector.keys).filter((p) => p.slug !== 'summit'), [sector]);
  const mapped = sector.keys.length > 0;

  return (
    <section id="sectors" aria-labelledby="sectors-title" className="scroll-mt-16 bg-ivory-50 py-section-lg border-t border-sand-200">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>EXPLORE THE SECTORS</Eyebrow>
        <SectionTitle id="sectors-title">TEN SECTORS. CHOOSE YOURS.</SectionTitle>
        <p className="mt-4 max-w-2xl text-ink-700">Select a sector to see real resources, related programmes and where to find members in it. Nothing here is padded with sample listings.</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div role="group" aria-label="Choose a sector" className="grid grid-cols-1 gap-px bg-sand-300 border border-sand-300 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {SUMMIT_SECTORS.map((s, i) => {
              const on = s.id === active;
              return (
                <button key={s.id} type="button" aria-pressed={on} onClick={() => setActive(s.id)} data-testid={`button-sector-${s.id}`}
                  className={`flex items-baseline gap-4 px-5 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 ${on ? 'bg-lagoon-900 text-ivory-100' : 'bg-ivory-50 text-ink-900 hover:bg-ivory-100'}`}>
                  <span className={`font-mono text-xs ${on ? 'text-gold-400' : 'text-gold-700'}`} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block text-sm font-semibold uppercase tracking-[0.08em]">{s.name}</span>
                    <span className={`mt-0.5 block text-xs ${on ? 'text-ivory-300' : 'text-ink-700'}`}>{s.line}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7" aria-live="polite" data-testid={`panel-sector-${sector.id}`}>
            <div key={sector.id} className="border border-sand-300 bg-ivory-100 p-7 lg:p-9 animate-fade-in">
              <h3 className="text-2xl text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>{sector.name}</h3>
              <p className="mt-2 text-ink-700">{sector.line}</p>
              {mapped && <p className="mt-3 text-xs text-ink-700">Matched to platform sectors: {sector.keys.map(sectorName).join(', ')}</p>}

              <h4 className="mt-8 text-eyebrow text-gold-700">KNOWLEDGE RESOURCES</h4>
              {resources.length ? (
                <ul className="mt-3 divide-y divide-sand-300 border-y border-sand-300">
                  {resources.map((r) => (
                    <li key={r.id}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-sector-resource-${r.id}`}>
                        <span>
                          <span className="block text-sm font-semibold text-ink-900 group-hover:text-lagoon-700">{r.title}</span>
                          <span className="block text-xs text-ink-700">{r.organization} · {r.kind} · external official source</span>
                        </span>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 border border-dashed border-gold-600/50 p-4 text-sm text-ink-700" data-testid="text-sector-empty">
                  No curated resources for this sector yet. We would rather show nothing than filler. Experts in this field can help shape the library.
                  <span className="mt-3 block"><ActionLink href={ROUTES.knowledgeEnquiry} variant="text" testId="link-sector-contribute">Suggest or contribute resources</ActionLink></span>
                </p>
              )}

              {programmes.length > 0 && (
                <>
                  <h4 className="mt-8 text-eyebrow text-gold-700">RELATED PROGRAMMES</h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {programmes.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/programs/${p.slug}`} className="inline-block border border-lagoon-700/30 px-3 py-1.5 text-xs uppercase tracking-wider text-lagoon-700 hover:bg-lagoon-900 hover:text-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-sector-programme-${p.slug}`}>{p.name}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className="mt-8 text-eyebrow text-gold-700">PEOPLE IN THIS SECTOR</h4>
              <div className="mt-3 flex flex-wrap gap-3">
                {mapped ? (
                  <ActionLink href={`${ROUTES.people}?sector=${encodeURIComponent(sector.keys[0])}`} variant="outline" testId="link-sector-people">Find members (sign in)</ActionLink>
                ) : null}
                <ActionLink href={ROUTES.ecosystem} variant="text" testId="link-sector-directory">Public opt-in directory</ActionLink>
              </div>
              {!mapped && <p className="mt-3 text-xs text-ink-700">This sector is new to the platform; member filtering for it will follow once profiles can select it.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
