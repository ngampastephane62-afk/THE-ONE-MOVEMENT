import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Compass, Search, Sparkles } from 'lucide-react';
import '@/styles/worlds.css';
import { DISCOVERY_EXAMPLES, GUIDE_STEPS, matchDiscovery } from './discovery-index';
import { prefersReducedMotion, useStage } from '@/components/ecosystem/exhibition/useStage';

/** Gently rotating example phrases shown as a typing cue (visual only; the real placeholder stays for assistive tech). */
const ROTATING = [
  'I am a fashion designer...',
  'I want to learn artificial intelligence...',
  'I want to discover African culture...',
  'I am looking for business opportunities...',
  'I want to explore humanitarian projects...',
];

const KIND_LABEL = { world: 'World', programme: 'Programme', page: 'Page' } as const;

function scrollExploreSoon(href: string) {
  if (!href.includes('#explore')) return;
  window.setTimeout(() => document.getElementById('explore')?.scrollIntoView({ block: 'start' }), 60);
}

export default function GlobalDiscovery({ paused = false }: { paused?: boolean } = {}) {
  const [query, setQuery] = useState('');
  const [guide, setGuide] = useState<string | null>(null);
  const results = useMemo(() => matchDiscovery(query), [query]);
  const step = GUIDE_STEPS.find((g) => g.id === guide);
  const { ref, attrs, live } = useStage<HTMLElement>();
  const [focused, setFocused] = useState(false);
  const [phrase, setPhrase] = useState(0);
  const cue = query === '' && !focused;
  useEffect(() => {
    if (!cue || !live || paused || prefersReducedMotion()) return;
    const t = window.setInterval(() => setPhrase((n) => (n + 1) % ROTATING.length), 3200);
    return () => window.clearInterval(t);
  }, [cue, live, paused]);

  return (
    <section ref={ref} {...attrs} id="discover" className="gd-surface scroll-mt-20 py-16" aria-labelledby="discover-title" data-testid="section-global-discovery">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="x-track text-eyebrow text-gold-400">Chapter three · Find your direction</p>
          <h2 id="discover-title" className="mt-3 text-display-md text-ivory-100">
            <span className="x-line"><span style={{ '--d': '120ms' } as CSSProperties}>WHAT ARE YOU LOOKING FOR</span></span>
            <span className="x-line"><span style={{ '--d': '300ms' } as CSSProperties}>IN THE <em className="not-italic text-gold-400">WORLD?</em></span></span>
          </h2>
          <p className="x-fade mt-3 max-w-xl text-sm text-ivory-300" style={{ '--d': '480ms' } as CSSProperties}>Search the seventeen worlds, programmes and pages that exist today. Results come only from the site itself.</p>
          <form role="search" className="x-fade relative mt-6" style={{ '--d': '620ms' } as CSSProperties} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="global-discovery" className="sr-only">Describe what you are looking for</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400" aria-hidden="true" />
            <input id="global-discovery" type="search" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={cue ? '' : 'I am a fashion designer...'} className="gd-input" data-testid="input-global-discovery" autoComplete="off" />
            {cue && <span className="x-typing" aria-hidden="true"><span key={phrase} className="x-typing-text">{ROTATING[phrase]}</span></span>}
          </form>
          <div className="x-stagger mt-4 flex flex-wrap gap-2" aria-label="Example searches">
            {DISCOVERY_EXAMPLES.map((ex, i) => (
              <button key={ex} type="button" style={{ '--d': `${800 + i * 140}ms` } as CSSProperties} className="gd-example" onClick={() => setQuery(ex)} data-testid={`button-discovery-example-${i}`}>{ex}</button>
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

        <aside className="x-fade gd-guide p-6 lg:col-span-5" style={{ '--d': '400ms' } as CSSProperties}  aria-labelledby="tomi-ai-title" data-testid="panel-tomi-ai">
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
