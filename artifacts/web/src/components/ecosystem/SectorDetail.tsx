import type { Sector } from '@/lib/sectors-data';
import { programsForSector, resourcesForSector } from '@/lib/ecosystem-match';
import ProgrammeLink from './ProgrammeLink';
import ResourceCard from './ResourceCard';
import SectorShare from './SectorShare';
import '@/styles/sector-world.css';

export default function SectorDetail({ sector }: { sector: Sector }) {
  const programs = programsForSector(sector);
  const resources = resourcesForSector(sector.slug);
  return (
    <div key={sector.slug} className="eco-detail-in flex flex-col gap-7" data-testid={`panel-sector-${sector.slug}`}>
      <div>
        <p className="text-eyebrow text-gold-400">SELECTED SECTOR</p>
        <h3 className="mt-2 text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>{sector.name.toUpperCase()}</h3>
        <p className="mt-2 italic text-ivory-300">{sector.descriptor}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold-500 mb-2">What it contributes</p>
          <p className="text-sm leading-relaxed text-ivory-200">{sector.contributes}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold-500 mb-2">Who belongs here</p>
          <ul className="flex flex-wrap gap-1.5">
            {sector.whoBelongs.map((w) => (
              <li key={w} className="border border-lagoon-600/70 px-2.5 py-1 text-xs text-ivory-200">{w}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold-500 mb-3">Connected TOMI programmes</p>
        <div className="grid gap-2">
          {programs.map((p) => <ProgrammeLink key={p.slug} program={p} tone="dark" />)}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold-500 mb-3">Official public knowledge</p>
        {resources.length ? (
          <div className="grid gap-3">
            {resources.map((r) => <ResourceCard key={r.id} resource={r} tone="dark" />)}
          </div>
        ) : (
          <p className="text-sm text-ivory-300">No curated official resources for this sector yet. The programme pages above are the best next step.</p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-ivory-300/70">
          Curated links to official public pages, reviewed by hand rather than a live feed. Listing a resource does not mean the publishing organization partners with TOMI.
        </p>
      </div>
      <SectorShare sector={sector} />
    </div>
  );
}
