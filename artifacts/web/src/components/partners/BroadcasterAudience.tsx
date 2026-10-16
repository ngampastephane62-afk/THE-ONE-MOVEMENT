import { ArrowUpRight } from 'lucide-react';

import { BROADCASTER_AUDIENCE } from '@/lib/partner-audience';

const DATA = BROADCASTER_AUDIENCE;

/** Public, per-outlet scale figures. Never summed; not TOMI campaign impressions. */
export default function BroadcasterAudience() {
  if (!DATA.length) return null;
  return (
    <section className="border-t border-sand-300 bg-ivory-50 py-section" aria-labelledby="audience-heading" data-testid="section-broadcaster-audience">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">Reach of our broadcast partners</p>
        <h2 id="audience-heading" className="mt-3 font-display text-[clamp(2rem,4.5vw,3.5rem)] uppercase leading-[0.9] text-ink-900">Public scale, outlet by outlet</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-700">Each figure is the outlet's own publicly reported reach, with its metric, period and source. These are not audiences of TOMI programmes, and figures are not added together.</p>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {DATA.map((d) => (
            <li key={d.id} className="border-t border-sand-300 py-6" data-testid={`audience-${d.id}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">{d.name}</p>
              {d.value ? (
                <p className="mt-2 font-display text-5xl leading-none text-ink-900">{d.value}</p>
              ) : (
                <p className="mt-2 font-display text-xl leading-tight text-ink-500">Public metric unavailable</p>
              )}
              <p className="mt-2 text-sm text-ink-800">{d.metric}</p>
              <p className="mt-1 text-xs text-ink-600">{d.scope}</p>
              <p className="text-xs text-ink-600">{d.period}</p>
              {d.note && <p className="mt-2 text-xs italic text-ink-600">{d.note}</p>}
              {d.sourceUrl ? (
                <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-lagoon-700 underline underline-offset-4">{d.sourceLabel}<ArrowUpRight className="h-3 w-3" /></a>
              ) : (
                <p className="mt-3 text-xs text-ink-600">{d.sourceLabel}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
