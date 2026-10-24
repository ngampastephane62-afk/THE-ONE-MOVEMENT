import { ActionLink, Eyebrow, SectionTitle, StatusPill } from './SummitUI';
import { PILLARS } from './summit-data';

/** Six pillars in an asymmetric editorial grid — two wide, four compact. */
const ON_ECOSYSTEM: Record<string, string> = { '#network': '#directory', '#experience': '/programs/summit#experience', '#media': '/programs/summit#media', '#impact': '/programs/summit#impact' };
const fix = (h: string) => ON_ECOSYSTEM[h] ?? h;

export default function PillarGrid() {
  return (
    <section id="ways-in" aria-labelledby="ecosystem-title" className="scroll-mt-16 bg-ivory-100 py-section-lg">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>EXPLORE THE ECOSYSTEM</Eyebrow>
            <SectionTitle id="ecosystem-title">SIX WAYS IN.<br />ONE ECOSYSTEM.</SectionTitle>
          </div>
          <p className="text-ink-700 leading-relaxed lg:col-span-4 lg:col-start-9">
            Each pillar shows plainly what works today and what is still being built.
          </p>
        </div>
        <ul className="mt-12 grid gap-px bg-sand-300 sm:grid-cols-2 lg:grid-cols-6 border border-sand-300">
          {PILLARS.map((p, i) => {
            const wide = i === 0 || i === 3;
            const dark = i === 0 || i === 3;
            return (
              <li key={p.id} className={`${wide ? 'lg:col-span-3' : 'lg:col-span-3 xl:col-span-3'} ${dark ? 'bg-lagoon-900 text-ivory-100' : 'bg-ivory-50'} flex flex-col p-7 lg:p-9 transition-transform`} data-testid={`card-pillar-${p.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-sm ${dark ? 'text-gold-400' : 'text-gold-700'}`} aria-hidden="true">{p.index}</span>
                  <StatusPill status={p.status} dark={dark} />
                </div>
                <h3 className={`mt-8 text-xl lg:text-2xl ${dark ? 'text-ivory-100' : 'text-ink-900'}`} style={{ fontFamily: 'var(--font-display)' }}>{p.name}</h3>
                <p className={`mt-3 leading-relaxed ${dark ? 'text-ivory-200' : 'text-ink-800'}`}>{p.description}</p>
                <p className={`mt-3 text-xs leading-relaxed ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{p.statusNote}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
                  <ActionLink href={fix(p.action.href)} variant={dark ? 'solid' : 'outline'} testId={`link-pillar-${p.id}`}>{p.action.label}</ActionLink>
                  {fix(p.action.href) !== fix(p.anchor) && (
                    <a href={fix(p.anchor)} className={`text-xs underline underline-offset-4 ${dark ? 'text-ivory-300 hover:text-gold-300' : 'text-ink-700 hover:text-lagoon-700'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500`} data-testid={`link-pillar-more-${p.id}`}>More below</a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
