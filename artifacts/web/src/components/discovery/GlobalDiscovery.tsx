import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Compass, Search, Sparkles } from 'lucide-react';
import '@/styles/worlds.css';
import { DISCOVERY_EXAMPLES, GUIDE_STEPS, matchDiscovery } from './discovery-index';

const KIND_LABEL = { world: 'World', programme: 'Programme', page: 'Page' } as const;

function scrollExploreSoon(href: string) {
  if (!href.includes('#explore')) return;
  window.setTimeout(() => document.getElementById('explore')?.scrollIntoView({ block: 'start' }), 60);
}

export default function GlobalDiscovery() {
  const [query, setQuery] = useState('');
  const [guide, setGuide] = useState<string | null>(null);
  const results = useMemo(() => matchDiscovery(query), [query]);
  const step = GUIDE_STEPS.find((g) => g.id === guide);

  return (
    <section id="discover" className="gd-surface scroll-mt-20 py-16" aria-labelledby="discover-title" data-testid="section-global-discovery">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-eyebrow text-gold-400">One global discovery</p>
          <h2 id="discover-title" className="mt-2 text-display-md text-ivory-100">WHAT ARE YOU LOOKING FOR IN THE WORLD?</h2>
          <p className="mt-3 max-w-xl text-sm text-ivory-300">Search the seventeen worlds, programmes and pages that exist today. Results come only from the site itself.</p>
          <form role="search" className="relative mt-6" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="global-discovery" className="sr-only">Describe what you are looking for</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400" aria-hidden="true" />
            <input id="global-discovery" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="I am a fashion designer..." className="gd-input" data-testid="input-global-discovery" autoComplete="off" />
          </form>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Example searches">
            {DISCOVERY_EXAMPLES.map((ex, i) => (
              <button key={ex} type="button" className="gd-example" onClick={() => setQuery(ex)} data-testid={`button-discovery-example-${i}`}>{ex}</button>
            ))}
          </div>
          <div className="mt-6" aria-live="polite" data-testid="region-discovery-results">
            {query.trim() === '' ? null : results.length ? (
              <ul className="space-y-2">
                {results.map((r, i) => (
                  <li key={r.id} className="gd-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <Link href={r.href} onClick={() => scrollExploreSoon(r.href)} className="gd-result" data-testid={`link-discovery-result-${r.id}`}>
                      <span className="gd-tag mt-0.5 text-gold-400">{KIND_LABEL[r.kind]}</span>
                      <span className="flex-1">
                        <span className="block font-display text-sm tracking-[0.06em] text-ivory-100">{r.title}</span>
                        <span className="mt-0.5 block text-xs text-ivory-300">{r.summary}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border border-dashed border-gold-500/40 p-4 text-sm text-ivory-200" data-testid="text-discovery-empty">
                Nothing on TOMI matches that yet. Try a profession, a sector or a culture, or
                <button type="button" onClick={() => setQuery('')} className="ml-1 text-gold-400 underline" data-testid="button-discovery-clear">clear the search</button>.
              </p>
            )}
          </div>
        </div>

        <aside className="gd-guide p-6 lg:col-span-5" aria-labelledby="tomi-ai-title" data-testid="panel-tomi-ai">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-400" aria-hidden="true" />
            <h3 id="tomi-ai-title" className="font-display text-sm tracking-[0.16em] text-ivory-100">TOMI AI</h3>
            <span className="gd-tag text-coral-500">Preview · guided navigation</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ivory-300">This is not an AI assistant yet. It is a guided path with fixed answers that link to real pages. A future TOMI AI is planned to help with discovery, learning and collaboration enquiries.</p>
          <p className="mt-5 text-eyebrow text-gold-400">Choose a starting point</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GUIDE_STEPS.map((g) => (
              <button key={g.id} type="button" aria-pressed={guide === g.id} onClick={() => setGuide(g.id)} className={`gd-example ${guide === g.id ? 'border-gold-400 text-gold-400' : ''}`} data-testid={`button-guide-${g.id}`}>{g.q}</button>
            ))}
          </div>
          <div className="mt-5 min-h-[7rem]" aria-live="polite">
            {step ? (
              <div className="gd-in border-l-2 border-gold-500 pl-4" data-testid="text-guide-answer">
                <p className="text-sm leading-relaxed text-ivory-200">{step.a}</p>
                <Link href={step.href} onClick={() => scrollExploreSoon(step.href)} className="sw-link mt-2" data-testid="link-guide-go"><Compass className="h-4 w-4" aria-hidden="true" /> Take me there</Link>
              </div>
            ) : (
              <p className="text-xs text-ivory-300/80">Pick a starting point above.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
