import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';
import {
  IMPACT_LEADERS,
  IMPACT_REGIONS,
  IMPACT_SECTORS,
  type ImpactLeader,
  type ImpactRegion,
  type ImpactSector,
} from '@workspace/shared';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import PersonPortrait, { PortraitActions, PortraitCredit } from '@/components/editorial/PersonPortrait';
import WealthLabel from '@/components/editorial/WealthLabel';
import RegionBackdrop from '@/components/RegionBackdrop';

const SECTOR_LABEL = Object.fromEntries(IMPACT_SECTORS.map((s) => [s.key, s.label])) as Record<ImpactSector, string>;

export default function ThanksWorld() {
  const [sector, setSector] = useState<ImpactSector | 'all'>('all');

  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>Thanks World — Regional Impact Directory | TOMI</title>
        <meta name="description" content="Thanks Emirates, Thanks Africa and Thanks USA: a curated directory of public figures whose documented work shaped business, culture, education, humanitarian action, science and civic life." />
      </Helmet>

      <HeroSurface glowOrigin="behind" minHeight="70vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">A TOMI EDITORIAL DIRECTORY</p>
          <h1 className="mt-6 font-display text-[clamp(3rem,10vw,7.5rem)] leading-[0.9] tracking-[-0.02em] text-ivory-100 animate-cinematic-2">THANKS,<br /><span className="text-gold-400">WORLD.</span></h1>
          <GoldThread className="mt-8" length="220px" node />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200 animate-cinematic-3">Gratitude, region by region. Each directory recognises people whose public, documented work changed what was possible for others.</p>
          <nav className="mt-10 grid max-w-4xl gap-px bg-gold-500/25 sm:grid-cols-3" aria-label="Regions">
            <Link href="/thanks-emirates" className="block bg-lagoon-900/80 p-5 hover:bg-lagoon-800" data-testid="link-region-emirates"><p className="font-display text-xl text-ivory-100">Thanks Emirates</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">Story initiative</p></Link>
            {IMPACT_REGIONS.map((r) => (
              <a key={r.key} href={`#${r.key}`} className="block bg-lagoon-900/80 p-5 hover:bg-lagoon-800" data-testid={`link-region-${r.key}`}><p className="font-display text-xl text-ivory-100">{r.campaign}</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">Impact directory</p></a>
            ))}
          </nav>
        </div>
      </HeroSurface>

      <div className="sticky top-16 z-20 border-b border-sand-300 bg-ivory-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3" role="tablist" aria-label="Filter by sector">
          {[{ key: 'all' as const, label: 'All sectors' }, ...IMPACT_SECTORS].map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={sector === s.key}
              onClick={() => setSector(s.key)}
              className={`shrink-0 border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${sector === s.key ? 'border-lagoon-900 bg-lagoon-900 text-ivory-100' : 'border-sand-300 text-ink-800 hover:border-gold-500'}`}
              data-testid={`button-sector-${s.key}`}
            >{s.label}</button>
          ))}
        </div>
      </div>


      {IMPACT_REGIONS.map((r, ri) => (
        <RegionSection key={r.key} region={r.key} label={r.campaign} country={r.label} sector={sector} alt={ri % 2 === 1} />
      ))}

      <section className="bg-lagoon-900 py-section-lg text-center text-ivory-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className=" text-xs text-ivory-300">Historical figures are presented as memorial references and are not available for any programme.</p>
        </div>
      </section>
    </div>
  );
}

function RegionSection({ region, label, country, sector, alt }: { region: ImpactRegion; label: string; country: string; sector: ImpactSector | 'all'; alt: boolean }) {
  const groups = useMemo(() => {
    const list = IMPACT_SECTORS.filter((s) => sector === 'all' || s.key === sector);
    return list.map((s) => ({ ...s, people: IMPACT_LEADERS.filter((l) => l.region === region && l.sectors[0] === s.key) }));
  }, [region, sector]);
  const overlaps = sector === 'all' ? [] : IMPACT_LEADERS.filter((l) => l.region === region && l.sectors[0] !== sector && l.sectors.includes(sector));

  return (
    <div id={region} className={`scroll-mt-32 py-section-lg ${alt ? 'bg-ivory-50' : ''}`}>
      <RegionBackdrop region={region === 'usa' || region === 'south-america' ? 'americas' : region} minHeight="25rem" className="mb-12">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-eyebrow text-gold-400">{country} · PEOPLE & PUBLIC IMPACT</p>
          <h2 className="mt-5 font-display text-5xl text-ivory-100 sm:text-7xl">{label}</h2>
        </div>
      </RegionBackdrop>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-900/80 pb-5">
          <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-none text-ink-900">{label}</h2>
          <p className="text-eyebrow text-gold-600">{country} · Curated selection</p>
        </div>
        {groups.map((g) => g.people.length > 0 && (
          <div key={g.key} className="mt-12">
            <p className="flex items-baseline gap-3"><span className="font-display text-2xl text-lagoon-600">{g.label}</span><span className="font-mono text-xs text-ink-700">{String(g.people.length).padStart(2, '0')}</span></p>
            <ul className="mt-5 grid gap-px bg-sand-300 sm:grid-cols-2 lg:grid-cols-3">
              {g.people.map((p) => <LeaderCard key={p.slug} person={p} />)}
            </ul>
          </div>
        ))}
        {overlaps.length > 0 && (
          <div className="mt-10">
            <p className="text-eyebrow text-ink-700">ALSO ACTIVE IN THIS SECTOR</p>
            <ul className="mt-4 grid gap-px bg-sand-300 sm:grid-cols-2 lg:grid-cols-3">{overlaps.map((p) => <LeaderCard key={p.slug} person={p} />)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderCard({ person }: { person: ImpactLeader }) {
  return (
    <li className="flex flex-col bg-ivory-100 p-6" data-testid={`card-leader-${person.slug}`}>
      <PersonPortrait slug={person.slug} name={person.name} className="aspect-[4/5] overflow-hidden bg-lagoon-900" />
      <div className="mb-5"><PortraitActions slug={person.slug} name={person.name} /></div>
      <div className="flex items-start gap-4">
        <div>
          <p className="font-display text-xl leading-tight text-ink-900">{person.name}</p>
          <p className="mt-1 text-xs text-ink-700">{person.role} · {person.country}</p>
        </div>
      </div>
      {person.slug === 'denis-mukwege' && <div className="mt-4 border border-gold-500 bg-gold-500/10 p-3" data-testid="badge-mukwege-partner"><p className="text-xs font-semibold text-lagoon-900">TOMI certified partner</p><a className="mt-2 inline-block text-[11px] underline" href="https://www.nobelprize.org/prizes/peace/2018/mukwege/facts/" target="_blank" rel="noopener noreferrer">Nobel Peace Prize laureate 2018</a></div>}
      {person.historical && <p className="mt-4 self-start border border-sand-400 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-700">In memoriam {person.lifespan} · not available</p>}
      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-800">{person.summary}</p>
      <WealthLabel slug={person.slug} historical={person.historical} />
      <PortraitCredit slug={person.slug} />
      <div className="mt-4 flex flex-wrap gap-1.5">{person.sectors.map((s) => <span key={s} className="text-[10px] uppercase tracking-[0.12em] text-gold-600">{SECTOR_LABEL[s]}</span>).reduce<React.ReactNode[]>((a, el, i) => (i ? [...a, <span key={`d${i}`} className="text-sand-400">/</span>, el] : [el]), [])}</div>
      <details className="mt-4 border-t border-sand-300 pt-3"><summary className="cursor-pointer text-[10px] uppercase tracking-widest text-ink-700">Sources</summary><ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {person.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-lagoon-600 hover:underline">{s.label.replace('Wikipedia — ', 'Wikipedia')}<ExternalLink className="h-2.5 w-2.5" /></a></li>)}
        {person.website && <li><a href={person.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-lagoon-600 hover:underline">Official site<ExternalLink className="h-2.5 w-2.5" /></a></li>}
      </ul></details>
    </li>
  );
}
