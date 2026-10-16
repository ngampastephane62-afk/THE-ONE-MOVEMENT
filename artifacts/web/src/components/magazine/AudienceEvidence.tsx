import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { OVERVIEW, INSTAGRAM_60, WEEK, REELS, REELS_NOTE, AUDIENCE_PROFILE, TOP_CITIES, SOURCE_ACCOUNT, type Snapshot } from './audience-data';
import { KIT_FIGURES, KIT_FIGURES_SOURCE } from './social-sources';

const fmt = (n: number) => n.toLocaleString('en-US');

/** Counts once to the exact source value when scrolled into view. Screen readers get the exact value only. */
function Count({ to, className = '' }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setV(to); return; }
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref} className={className} translate="no"><span aria-hidden="true" className="tabular-nums">{fmt(v)}</span><span className="sr-only">{fmt(to)}</span></span>;
}

function Facts({ items, dark }: { items: { term: string; value: string }[]; dark?: boolean }) {
  return (
    <dl className={`divide-y ${dark ? 'divide-ivory-50/12' : 'divide-ink-900/12'}`}>
      {items.map((f) => (
        <div key={f.term} className="flex items-baseline justify-between gap-6 py-2.5">
          <dt className={`text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{f.term}</dt>
          <dd className={`text-right font-display text-lg tabular-nums ${dark ? 'text-ivory-50' : 'text-ink-900'}`} translate="no">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Evidence({ s, dark }: { s: Snapshot; dark?: boolean }) {
  const [ok, setOk] = useState(true);
  if (!s.proof || !ok) return null;
  return (
    <details className={`group mt-5 text-xs ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>
      <summary className="cursor-pointer list-none uppercase tracking-[0.2em] underline-offset-4 hover:underline">View the source extract</summary>
      <img src={s.proof} alt={s.proofAlt} loading="lazy" onError={() => setOk(false)} className="mt-3 w-full max-w-sm rounded-sm opacity-90 ring-1 ring-black/10" />
    </details>
  );
}

function Lead({ s, n, dark }: { s: Snapshot; n: string; dark?: boolean }) {
  return (
    <article className={`flex flex-col p-7 md:p-10 ${dark ? 'bg-lagoon-900 text-ivory-50' : 'bg-ivory-50 text-ink-900'}`} data-testid={`audience-${s.id}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${dark ? 'text-gold-400' : 'text-gold-600'}`}>{s.platform}</p>
        <span className={`font-display text-2xl italic ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{n}</span>
      </div>
      <p className="mt-8 font-display text-[clamp(3rem,7.5vw,6.2rem)] leading-[0.85] tracking-tight"><Count to={s.total} /></p>
      <p className={`mt-3 text-sm uppercase tracking-[0.2em] ${dark ? 'text-ivory-200' : 'text-ink-800'}`}>{s.unit}</p>
      <p className={`mt-1 font-display text-lg italic ${dark ? 'text-gold-400' : 'text-lagoon-700'}`}>{s.period}</p>
      <div className="mt-8 flex-1"><Facts items={s.facts} dark={dark} /></div>
      <p className={`mt-4 text-xs leading-relaxed ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{s.note}</p>
      <Evidence s={s} dark={dark} />
    </article>
  );
}

function Reel({ r, i }: { r: (typeof REELS)[number]; i: number }) {
  const [ok, setOk] = useState(true);
  const reduce = useReducedMotion();
  return (
    <motion.li initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
      className={`group relative w-[44vw] shrink-0 snap-start sm:w-auto ${i < 3 ? '' : 'sm:mt-10'}`}>
      <figure className="relative aspect-[9/16] overflow-hidden bg-ink-800">
        {ok && <img src={r.src} alt={r.alt} loading="lazy" onError={() => setOk(false)} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/90 to-transparent" aria-hidden="true" />
        <figcaption className="absolute inset-x-0 bottom-0 p-4 text-ivory-50">
          <span className="block font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-none tabular-nums" translate="no">{fmt(r.views)}</span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.25em] text-ivory-200">views · Reel</span>
        </figcaption>
      </figure>
      <span className="absolute -left-1 -top-3 font-display text-sm italic text-gold-600" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
    </motion.li>
  );
}

export default function AudienceEvidence() {
  useEffect(() => {
    if (window.location.hash !== '#audience') return;
    const timer = window.setTimeout(() => {
      document.getElementById('audience')?.scrollIntoView({ block: 'start' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div id="audience" className="mt-24 scroll-mt-24" data-testid="section-audience">
      <header className="grid gap-6 border-t border-ink-900 pt-6 lg:grid-cols-12">
        <p className="text-eyebrow text-gold-600 lg:col-span-3">THE AUDIENCE</p>
        <div className="lg:col-span-9">
          <h3 className="font-display text-[clamp(2.3rem,5.5vw,4.6rem)] leading-[0.92] text-ink-900">Seen far beyond <span className="italic text-lagoon-700">its followers.</span></h3>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-800">Tropik’s stories travel mostly through discovery: in every capture below, the large majority of views came from people who did not yet follow the account. These are platform figures supplied by Tropik, each shown with its own period. They are views and accounts reached, not readers, and they are never added together.</p>
        </div>
      </header>

      <div className="mt-12 grid gap-px bg-ink-900/15 lg:grid-cols-2">
        <Lead s={OVERVIEW} n="i." dark />
        <Lead s={INSTAGRAM_60} n="ii." />
      </div>

      <section className="mt-20" aria-labelledby="reels-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h4 id="reels-heading" className="font-display text-3xl text-ink-900 md:text-4xl">Most-viewed Reels</h4>
          <p className="max-w-md text-xs leading-relaxed text-ink-700">{REELS_NOTE}</p>
        </div>
        <ol className="-mx-6 mt-8 flex snap-x gap-3 overflow-x-auto px-6 pb-4 pt-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {REELS.map((r, i) => <Reel key={r.src} r={r} i={i} />)}
        </ol>
      </section>

      <div className="mt-20 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-labelledby="week-heading">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">{WEEK.platform} · {WEEK.period}</p>
          <h4 id="week-heading" className="mt-4 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-none text-ink-900"><Count to={WEEK.total} /> <span className="text-xl italic text-ink-700">views in one week</span></h4>
          <div className="mt-6"><Facts items={WEEK.facts} /></div>
          <p className="mt-3 text-xs text-ink-700">{WEEK.note}</p>
          <Evidence s={WEEK} />
        </section>
        <section className="grid gap-10 sm:grid-cols-2 lg:col-span-7" aria-labelledby="who-heading">
          <div>
            <h4 id="who-heading" className="font-display text-2xl text-ink-900">Who watches</h4>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-700">{AUDIENCE_PROFILE.source}</p>
            <div className="mt-4"><Facts items={AUDIENCE_PROFILE.gender} /></div>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              {AUDIENCE_PROFILE.ages.map(([a, p]) => (<div key={a} className="contents"><dt className="text-ink-700 tabular-nums">{a}</dt><dd className={`text-right font-display tabular-nums ${a === '25–34' || a === '18–24' ? 'text-lg text-lagoon-700' : 'text-ink-900'}`} translate="no">{p}</dd></div>))}
            </dl>
            <p className="mt-3 text-xs text-ink-700">{AUDIENCE_PROFILE.agesNote}</p>
          </div>
          <div>
            <h4 className="font-display text-2xl text-ink-900">Where</h4>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-700">{TOP_CITIES.source}</p>
            <ol className="mt-4 space-y-3">
              {TOP_CITIES.cities.map(([c, p], i) => (
                <li key={c} className="flex items-baseline justify-between gap-4 border-b border-ink-900/12 pb-2">
                  <span className={`font-display ${i === 0 ? 'text-3xl' : 'text-lg'} text-ink-900`} translate="no">{c}</span>
                  <span className={`tabular-nums ${i === 0 ? 'font-display text-3xl text-lagoon-700' : 'text-sm text-ink-800'}`}>{p}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-ink-700">{TOP_CITIES.note}</p>
            <p className="mt-5 text-sm text-ink-800">Profile activity: <span className="font-display text-lg" translate="no">{TOP_CITIES.profileActivity.value}</span> ({TOP_CITIES.profileActivity.change} {TOP_CITIES.profileActivity.vs})</p>
          </div>
        </section>
      </div>

      <aside className="mt-20 grid gap-8 bg-ink-900 p-7 text-ivory-50 md:grid-cols-12 md:p-10" aria-labelledby="account-heading">
        <div className="md:col-span-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-400">Source account in these captures</p>
          <h4 id="account-heading" className="mt-3 font-display text-3xl" translate="no">{SOURCE_ACCOUNT.title}</h4>
          <a href={SOURCE_ACCOUNT.url} target="_blank" rel="noreferrer noopener" className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold-400 underline underline-offset-4" translate="no" data-testid="link-source-account">{SOURCE_ACCOUNT.handle}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
          <p className="mt-4 text-xs leading-relaxed text-ivory-300">{SOURCE_ACCOUNT.note}</p>
        </div>
        <dl className="grid grid-cols-3 gap-px self-end bg-ivory-50/12 md:col-span-7">
          {[['Followers', SOURCE_ACCOUNT.followers], ['Posts', SOURCE_ACCOUNT.posts], ['Views · last 30 days', SOURCE_ACCOUNT.views30]].map(([t, v]) => (
            <div key={t} className="bg-ink-900 p-4"><dd className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-none" translate="no">{v}</dd><dt className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory-300">{t}</dt></div>
          ))}
        </dl>
      </aside>

      <div className="mt-14 border-t border-ink-900/15 pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-700">Published in the Media Kit 2026 · a separate statement</p>
        <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
          {KIT_FIGURES.map((f) => <div key={f.label} className="flex items-baseline gap-2"><dd className="font-display text-2xl text-ink-900" translate="no">{f.value}</dd><dt className="text-xs text-ink-700">{f.label}</dt></div>)}
        </dl>
        <p className="mt-3 text-xs text-ink-700" data-testid="text-figures-source">{KIT_FIGURES_SOURCE}</p>
      </div>
    </div>
  );
}
