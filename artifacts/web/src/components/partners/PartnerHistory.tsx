import { useEffect } from 'react';
import { partnerHistory, type HistoryCategory } from '@/lib/partner-history';
import LogoCarousel, { LogoTile } from './LogoCarousel';

type Sec = { key: HistoryCategory; label: string; note: string };

export const PRIMARY: Sec[] = [
  { key: 'government', label: 'Governments & development cooperation', note: 'National government and international development agency.' },
  { key: 'culture', label: 'Ministries & cultural institutions', note: 'Public cultural bodies in the DRC and the French cultural network.' },
  { key: 'multilateral', label: 'United Nations & humanitarian', note: 'UN entities and the humanitarian foundation behind our Goma work. Each emblem refers to the named entity only.' },
  { key: 'diplomatic', label: 'Diplomatic missions & private offices', note: 'Embassy, consulate and a ruling-family private office. A private office is listed as such, not as a government.' },
];
export const COMMERCIAL: Sec[] = [
  { key: 'banking', label: 'Banking', note: '' },
  { key: 'private', label: 'Private companies', note: 'Groups, studios and enterprises from the UAE, the DRC and Tanzania.' },
  { key: 'brands', label: 'International brands', note: 'Consumer and hospitality brands that joined Movement events and editions.' },
];
export const MEDIA: Sec[] = [
  { key: 'broadcast', label: 'Television & radio', note: 'International and regional broadcasters.' },
  { key: 'press', label: 'Press & digital media', note: 'Newspapers, magazines and online publications.' },
];

const of = (k: HistoryCategory) => partnerHistory.filter((p) => p.category === k);

function useHashScroll(ids: string[]) {
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      if (ids.includes(id)) document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function Row({ s, n, tone = 'light' }: { s: Sec; n: string; tone?: 'light' | 'dark' }) {
  const items = of(s.key);
  const dark = tone === 'dark';
  return (
    <section id={`history-${s.key}`} className={`grid scroll-mt-28 gap-8 border-t py-12 lg:grid-cols-12 ${dark ? 'border-ivory-100/15' : 'border-sand-300'}`} aria-labelledby={`history-${s.key}-heading`}>
      <div className="lg:col-span-3">
        {s.key === 'private' && <span id="history-business" className="block scroll-mt-28" aria-hidden="true" />}
        <p className={`font-mono text-xs ${dark ? 'text-gold-400' : 'text-gold-700'}`}>{n}</p>
        <h3 id={`history-${s.key}-heading`} className={`mt-2 font-display text-2xl uppercase leading-tight ${dark ? 'text-ivory-100' : 'text-ink-900'}`}>{s.label}</h3>
        <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{s.note}</p>
      </div>
      <div className="lg:col-span-9">
        <LogoCarousel items={items} label={s.label} tone={tone} />
      </div>
    </section>
  );
}

/** Institutions, governments, banking, private companies and brands. Shown first. */
export function PartnerInstitutions() {
  useHashScroll(['partner-history', 'history-reloved-luxury', 'history-banking', 'history-business']);
  const rawbank = of('banking')[0];
  return (
    <section id="partner-history" className="scroll-mt-28 bg-ivory-50 py-section-lg" aria-labelledby="partner-history-heading" data-testid="section-partner-history">
      <div className="mx-auto max-w-7xl px-6">
        <header className="grid gap-8 pb-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">A decade of relationships</p>
            <h2 id="partner-history-heading" className="mt-3 font-display text-[clamp(2.6rem,7vw,5.5rem)] uppercase leading-[0.88] text-ink-900">Institutions that have worked with us</h2>
          </div>
          <div className="flex flex-col justify-end gap-3 lg:col-span-5">
            <p className="text-[15px] leading-relaxed text-ink-800">
              Since its earliest editions, The One Movement has built relationships with governments, UN entities, diplomatic missions, a leading Congolese bank, private groups and international brands.
            </p>
            <p className="text-xs leading-relaxed text-ink-600">
              Relationships confirmed by the Founder and developed over ten years; each covered specific programmes and periods rather than one continuous contract. No endorsement by the United Nations or any government is implied beyond the named entity.
            </p>
          </div>
        </header>

        <nav aria-label="Partner categories" className="flex flex-wrap gap-x-5 gap-y-1 border-y border-sand-300 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          {[...PRIMARY, ...COMMERCIAL, ...MEDIA].map((s) => (
            <a key={s.key} href={`#history-${s.key}`} className="inline-flex min-h-11 items-center text-lagoon-700 underline-offset-4 hover:underline" data-testid={`link-history-${s.key}`}>{s.label}</a>
          ))}
        </nav>

        {PRIMARY.map((s, i) => <Row key={s.key} s={s} n={`I.${i + 1}`} />)}
      </div>

      {/* Banking feature */}
      <div className="mt-8 bg-lagoon-900 py-16 text-ivory-100">
        <div className="mx-auto max-w-7xl px-6">
          <section id="history-banking" className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-12" aria-labelledby="history-banking-heading">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-gold-400">II.1 · Banking</p>
              <h3 id="history-banking-heading" className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.9]">Financial partner</h3>
              <p className="mt-4 max-w-md text-ivory-200 leading-relaxed">Rawbank, one of the leading banks in the Democratic Republic of the Congo, is among the Movement's partners.</p>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">{rawbank && <LogoTile p={rawbank} tone="dark" large />}</div>
          </section>
          {COMMERCIAL.slice(1).map((s, i) => <Row key={s.key} s={s} n={`II.${i + 2}`} tone="dark" />)}
        </div>
      </div>
    </section>
  );
}

/** Broadcast and press: shown after institutional and commercial partners. */
export function PartnerMedia() {
  useHashScroll(['history-madi-tv', 'partner-media']);
  return (
    <section id="partner-media" className="scroll-mt-28 border-t border-sand-300 bg-ivory-100 py-section-lg" aria-labelledby="partner-media-heading" data-testid="section-partner-media">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">III · Broadcast & media</p>
        <h2 id="partner-media-heading" className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-[0.9] text-ink-900">On air and in print</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-800">Broadcasters and publications that carried the Movement's films, editions and stories.</p>
        <div className="mt-6">{MEDIA.map((s, i) => <Row key={s.key} s={s} n={`III.${i + 1}`} />)}</div>
      </div>
    </section>
  );
}

export default PartnerInstitutions;
