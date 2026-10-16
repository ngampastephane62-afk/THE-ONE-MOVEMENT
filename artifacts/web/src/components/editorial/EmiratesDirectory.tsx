import { useState } from 'react';
import { UAE_RULERS, UAE_CABINET, UAE_BILLIONAIRES, type EmiratesPerson } from '@/lib/emirates-directory';
import PersonPortrait, { PortraitCredit } from './PersonPortrait';

function Official({ person, president = false }: { person: EmiratesPerson; president?: boolean }) {
  return <li className={`border border-gold-500/25 bg-ivory-100 p-5 ${president ? 'sm:col-span-2 lg:col-span-2' : ''}`} data-testid={`emirates-person-${person.slug}`}>
    <PersonPortrait slug={person.slug} name={person.name} className="aspect-[4/5] overflow-hidden bg-lagoon-900" />
    <div className="pt-5">
      {president && <p className="mb-3 text-eyebrow text-gold-600">PRESIDENT OF THE UNITED ARAB EMIRATES</p>}
      <h3 className={`font-display text-ink-900 ${president ? 'text-3xl' : 'text-2xl'}`}>{person.name}</h3>
      <p className="mt-2 text-sm text-ink-700">{person.role}</p>
      {person.wealth && <div className="mt-4 border-y border-gold-500/30 py-3"><p className="text-[10px] uppercase tracking-widest text-gold-600">Estimated net worth · 2026 list</p><p className="mt-1 font-display text-3xl text-lagoon-900" data-no-translate>US${person.wealth} billion</p><p className="mt-1 text-[11px] text-ink-700">{person.family ? 'Family estimate' : 'Estimate'} · unaudited</p></div>}
      <a href={person.source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs text-lagoon-700 underline">{person.wealth ? 'Forbes Middle East · 2026 edition' : 'UAE Government · official source'}</a>
      <PortraitCredit slug={person.slug} />
    </div>
  </li>;
}

export default function EmiratesDirectory() {
  const [showCabinet, setShowCabinet] = useState(false);
  return <section id="emirates-leadership" className="bg-ivory-50 py-section-lg">
    <div className="mx-auto max-w-6xl px-6">
      <p className="text-eyebrow text-gold-600">THE EMIRATES · LEADERSHIP & ENTERPRISE</p>
      <h2 className="mt-4 text-display-md text-ink-900">Seven emirates. One federation.</h2>
      <h3 className="mb-6 mt-12 font-display text-3xl text-lagoon-900">The President & the seven rulers</h3>
      <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">{UAE_RULERS.map((p, i) => <Official key={p.slug} person={p} president={i === 0} />)}</ul>
      <div className="mt-14 border-y border-sand-300 py-6">
        <button onClick={() => setShowCabinet(v => !v)} aria-expanded={showCabinet} aria-controls="uae-cabinet-list" className="flex w-full items-center justify-between gap-4 text-left" data-testid="button-toggle-cabinet">
          <span><span className="font-display text-3xl text-lagoon-900">The federal government</span><span className="mt-2 block text-xs text-ink-700">All {UAE_CABINET.length} members listed by the UAE Cabinet · roles and official portraits</span></span>
          <span className="text-3xl text-gold-600" aria-hidden="true">{showCabinet ? '−' : '+'}</span>
        </button>
        {showCabinet && <ul id="uae-cabinet-list" className="mt-8 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">{UAE_CABINET.map(p => <Official key={p.slug} person={p} />)}</ul>}
      </div>
      <h3 className="mt-14 font-display text-3xl text-lagoon-900">Emirati billionaires</h3>
      <p className="mb-6 mt-4 max-w-3xl text-sm text-ink-700">UAE entries in Forbes Middle East, The World's Richest Arabs 2026.</p>
      <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">{UAE_BILLIONAIRES.map(p => <Official key={p.slug} person={p} />)}</ul>
    </div>
  </section>;
}
