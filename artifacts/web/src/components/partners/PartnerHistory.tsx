import { useEffect, useState } from 'react';
import { partnerHistory, historyLogo, type HistoryCategory } from '@/lib/partner-history';

const SECTIONS: { key: HistoryCategory; label: string; note: string }[] = [
  { key: 'broadcast', label: 'Television & radio', note: 'Broadcasters and channels.' },
  { key: 'press', label: 'Press & magazines', note: 'Newspapers, magazines and online media.' },
  { key: 'business', label: 'Brands & enterprise', note: 'Companies, brands, hospitality and studios.' },
  { key: 'culture', label: 'Culture', note: 'Cultural institutions and ministries.' },
  { key: 'humanitarian', label: 'Humanitarian', note: 'Humanitarian organisations and missions.' },
  { key: 'diplomatic', label: 'Diplomatic', note: 'Embassies, consulates and private offices.' },
  { key: 'institutional', label: 'Government & cooperation', note: 'Governments and development agencies.' },
];

function Mark({ id, name, description, sourceUrl, linkLabel, slug }: {
  id: number; name: string; description?: string; sourceUrl?: string; linkLabel?: string; slug?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <li id={slug} className="group flex scroll-mt-28 flex-col border-b border-r border-sand-300" data-testid={`history-partner-${id}`}>
      <div className="flex aspect-[3/2] items-center justify-center bg-ivory-50 p-5 transition-colors group-hover:bg-ivory-100">
        {failed ? (
          <span className="text-center font-display text-lg leading-tight text-ink-700" aria-hidden="true">{name}</span>
        ) : (
          <img src={historyLogo(id)} alt={`${name} logo`} loading="lazy" decoding="async" onError={() => setFailed(true)}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" data-testid={`img-history-logo-${id}`} />
        )}
      </div>
      <p className="flex flex-1 items-start gap-2 border-t border-sand-200 px-3 py-2.5 text-xs leading-snug text-ink-800">
        <span className="font-mono text-[10px] text-gold-700">{String(id).padStart(2, '0')}</span>
        <span>{name}</span>
      </p>
      {description && <p className="px-3 pb-3 text-xs leading-relaxed text-ink-700">{description}</p>}
      {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" className="mx-3 mb-3 inline-flex min-h-11 items-center text-xs font-semibold text-lagoon-700 underline underline-offset-4">{linkLabel}</a>}
    </li>
  );
}

export default function PartnerHistory() {
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      if (['partner-history', 'history-reloved-luxury', 'history-madi-tv'].includes(id)) {
        document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  return (
    <section id="partner-history" className="scroll-mt-28 border-t border-sand-300 bg-ivory-50 py-section-lg" aria-labelledby="partner-history-heading" data-testid="section-partner-history">
      <div className="mx-auto max-w-7xl px-6">
        <header className="grid gap-8 border-b-2 border-ink-900 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">The archive · Tropik & The One Movement International</p>
            <h2 id="partner-history-heading" className="mt-3 font-display text-[clamp(2.6rem,7vw,5.75rem)] uppercase leading-[0.88] text-ink-900">Ten years of partnerships</h2>
          </div>
          <div className="flex flex-col justify-end gap-4 lg:col-span-5">
            <p className="text-[15px] leading-relaxed text-ink-800 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-gold-700">
              Over the past decade, the Movement signed partnerships with broadcasters, publications, brands, cultural bodies, humanitarian organisations and diplomatic offices. The marks below come from the Founder’s own archive.
            </p>
            <p className="text-sm leading-relaxed text-ink-700">
              These are past partnerships, not necessarily current contracts. Dates and the shared work behind each one are being completed. An institutional emblem refers to the named entity only, not to a wider endorsement by the United Nations or any government.
            </p>
          </div>
        </header>

        <dl className="grid grid-cols-2 border-b border-sand-300 sm:grid-cols-4" data-testid="stats-partner-history">
          <div className="border-r border-sand-300 py-5 pr-4">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-700">Named marks recovered</dt>
            <dd className="font-display text-4xl text-ink-900" data-testid="text-history-count">{partnerHistory.length}</dd>
          </div>
          <div className="py-5 pl-4 sm:border-r sm:border-sand-300 sm:pr-4">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-700">Sectors</dt>
            <dd className="font-display text-4xl text-ink-900">{SECTIONS.length}</dd>
          </div>
          <div className="col-span-2 border-t border-sand-300 py-5 text-xs leading-relaxed text-ink-700 sm:border-t-0 sm:pl-4">
            Historical logos identified in the Founder’s archive. Duplicate files are not repeated; related brands such as Africa24 and Africa24 Infinity are listed separately.
          </div>
        </dl>

        <nav aria-label="Archive sectors" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em]">
          {SECTIONS.map((s) => (
            <a key={s.key} href={`#history-${s.key}`} className="min-h-11 inline-flex items-center text-lagoon-700 underline-offset-4 hover:underline" data-testid={`link-history-${s.key}`}>{s.label}</a>
          ))}
        </nav>

        <div className="mt-6 space-y-14">
          {SECTIONS.map((s, i) => {
            const items = partnerHistory.filter((p) => p.category === s.key);
            return (
              <section key={s.key} id={`history-${s.key}`} className="scroll-mt-28 grid gap-6 lg:grid-cols-12" aria-labelledby={`history-${s.key}-heading`}>
                <div className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
                  <p className="font-display text-3xl text-gold-600">{String(i + 1).padStart(2, '0')}</p>
                  <h3 id={`history-${s.key}-heading`} className="mt-1 font-display text-2xl uppercase leading-tight text-ink-900">{s.label}</h3>
                  <p className="mt-2 text-sm text-ink-700">{s.note}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">{items.length} {items.length === 1 ? 'mark' : 'marks'}</p>
                </div>
                <ul className="grid grid-cols-2 border-l border-t border-sand-300 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-4">
                  {items.map((p) => <Mark key={p.id} {...p} />)}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
