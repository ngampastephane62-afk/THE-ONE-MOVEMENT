import { useRef, useState, type KeyboardEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'wouter';
import { ArrowUpRight, Clock, Globe, LayoutDashboard } from 'lucide-react';
import { useMe } from './ctx';
import {
  FOUNDER_SECTIONS, FOUNDER_TOOLS, PHASE_LABEL, type FounderSection, type FounderSectionId,
} from '@/components/founder/founder-workspace-config';

const STATUS_TEXT = { available: 'Available', partial: 'Partly available', unavailable: 'Not yet available' } as const;
const STATUS_CLS = {
  available: 'bg-lagoon-900 text-gold-400',
  partial: 'bg-gold-500/15 text-gold-700 border border-gold-500/40',
  unavailable: 'bg-ivory-200 text-ink-700',
} as const;

function ToolLink({ id }: { id: string }) {
  const t = FOUNDER_TOOLS[id];
  if (!t) return null;
  return (
    <li>
      <Link href={t.href} className="group flex h-full flex-col gap-1 rounded-2xl border border-sand-200 bg-ivory-50 p-4 transition-colors duration-200 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-none" data-testid={`link-founder-tool-${t.id}`}>
        <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">{t.label}<ArrowUpRight className="h-4 w-4 text-gold-700 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span>
        <span className="text-xs leading-relaxed text-ink-700">{t.description}</span>
      </Link>
    </li>
  );
}

function Unavailable({ s }: { s: FounderSection }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-sand-200 bg-ivory-100 p-4" data-testid={`status-unavailable-${s.id}`}>
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
      <div><p className="text-sm font-semibold text-ink-900">Not yet available</p><p className="mt-1 text-xs leading-relaxed text-ink-700">{s.unavailableNote}</p></div>
    </div>
  );
}

function Panel({ s, name }: { s: FounderSection; name: string }) {
  const upcoming = FOUNDER_SECTIONS.filter((x) => x.status !== 'available' && x.id !== 'overview');
  return (
    <section role="tabpanel" id={`founder-panel-${s.id}`} aria-labelledby={`founder-tab-${s.id}`} tabIndex={0} className="founder-fade flex flex-col gap-5 rounded-3xl border border-sand-200 bg-ivory-50 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:p-7" data-testid={`panel-founder-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink-900">{s.id === 'overview' ? `Welcome, ${name}` : s.label}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLS[s.status]}`} data-testid={`status-section-${s.id}`}>{STATUS_TEXT[s.status]}</span>
      </div>
      <p className="-mt-2 text-sm leading-relaxed text-ink-700">{s.summary}</p>
      {s.id === 'overview' && <p className="text-xs leading-relaxed text-ink-700">This workspace gathers the founder tools that already exist. Each link opens the working tool; nothing here duplicates or changes them.</p>}
      {s.status !== 'available' && s.unavailableNote && <Unavailable s={s} />}
      {s.toolIds.length > 0 && (
        <div>
          <h3 className="text-eyebrow text-gold-700">{s.id === 'overview' ? 'AVAILABLE TOOLS' : s.id === 'media' ? 'SEPARATE EXISTING TOOL' : 'EXISTING TOOLS'}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{s.toolIds.map((id) => <ToolLink key={id} id={id} />)}</ul>
        </div>
      )}
      {s.id === 'overview' && (
        <div>
          <h3 className="text-eyebrow text-gold-700">UPCOMING</h3>
          <ul className="mt-3 divide-y divide-sand-100 rounded-2xl border border-sand-200" data-testid="list-founder-upcoming">
            {upcoming.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-ink-800"><span>{u.label}</span><span className="text-xs text-ink-700">{STATUS_TEXT[u.status]}</span></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function FounderWorkspace() {
  const { me } = useMe();
  const [active, setActive] = useState<FounderSectionId>('overview');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!me?.founder) return <Redirect to="/member" replace />;
  const current = FOUNDER_SECTIONS.find((s) => s.id === active) ?? FOUNDER_SECTIONS[0];

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = FOUNDER_SECTIONS.length;
    let j = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    if (j < 0) return;
    e.preventDefault();
    setActive(FOUNDER_SECTIONS[j].id);
    refs.current[j]?.focus();
  };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-workspace">
      <Helmet><title>Founder Workspace — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <style>{`.founder-fade{animation:founderIn .28s ease-out}@keyframes founderIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.founder-fade{animation:none}}`}</style>
      <header className="relative overflow-hidden rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <p className="text-eyebrow text-gold-400" data-testid="text-founder-phase">{PHASE_LABEL}</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Founder Workspace</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">A private place to steer The One Movement International. Signed in as <span className="font-semibold text-ivory-50" data-testid="text-founder-name">{me.fullName}</span>.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="~/" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-founder-public-site"><Globe className="h-3.5 w-3.5" />Public website</Link>
          <Link href="/member" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-founder-member-dashboard"><LayoutDashboard className="h-3.5 w-3.5" />Member dashboard</Link>
        </div>
      </header>
      <div className="flex flex-col gap-5 lg:flex-row">
        <nav aria-label="Founder workspace sections" className="lg:w-52 lg:shrink-0">
          <div role="tablist" aria-orientation="vertical" className="flex gap-1 overflow-x-auto rounded-2xl bg-ivory-200 p-1 lg:flex-col lg:overflow-visible">
            {FOUNDER_SECTIONS.map((s, i) => {
              const sel = s.id === active;
              return (
                <button key={s.id} ref={(el) => { refs.current[i] = el; }} id={`founder-tab-${s.id}`} type="button" role="tab" aria-selected={sel} aria-controls={`founder-panel-${s.id}`} tabIndex={sel ? 0 : -1}
                  onClick={() => setActive(s.id)} onKeyDown={(e) => onKey(e, i)}
                  className={`flex min-h-11 shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-left text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-none ${sel ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-50'}`}
                  data-testid={`nav-founder-${s.id}`}>
                  {s.label}
                  {s.status === 'unavailable' && <span className={`h-1.5 w-1.5 rounded-full ${sel ? 'bg-gold-400/50' : 'bg-sand-400'}`} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </nav>
        <div className="min-w-0 flex-1"><Panel key={current.id} s={current} name={me.fullName} /></div>
      </div>
    </div>
  );
}
