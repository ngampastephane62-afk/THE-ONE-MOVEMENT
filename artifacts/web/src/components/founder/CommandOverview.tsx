import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, RefreshCw } from 'lucide-react';
import {
  useGetFounderCommandCenter, getGetFounderCommandCenterQueryKey, saveFounderControlPreferences,
  FounderPreferenceInputEnabledKindsItem, type FounderPreferenceInputEnabledKindsItem as Kind,
} from '@workspace/api-client-react';
import { errStatus } from '@/components/network/kit';
import { KIND_LABELS, alertHref, fmt, num, overviewOpts, sectorName, totalLabel } from './command-helpers';

const ALL_KINDS = Object.values(FounderPreferenceInputEnabledKindsItem) as Kind[];

function Preferences({ enabled }: { enabled: string[] }) {
  const qc = useQueryClient();
  const [sel, setSel] = useState<Kind[] | null>(null);
  const [state, setState] = useState<{ busy: boolean; msg: string; ok: boolean }>({ busy: false, msg: '', ok: true });
  const current = sel ?? (enabled.filter((k) => ALL_KINDS.includes(k as Kind)) as Kind[]);
  const dirty = sel !== null;
  async function save() {
    setState({ busy: true, msg: '', ok: true });
    try {
      await saveFounderControlPreferences({ enabledKinds: current });
      setSel(null);
      setState({ busy: false, msg: 'Preferences saved.', ok: true });
      qc.invalidateQueries({ queryKey: getGetFounderCommandCenterQueryKey() });
    } catch (e) {
      setState({ busy: false, msg: `Preferences were not saved${errStatus(e) ? ` (HTTP ${errStatus(e)})` : ''}. Your choices are kept.`, ok: false });
    }
  }
  return (
    <fieldset className="rounded-2xl border border-sand-200 bg-ivory-100 p-4" data-testid="panel-founder-preferences">
      <legend className="px-1 text-eyebrow text-gold-700">IN-APP ALERT TYPES</legend>
      <p className="text-xs text-ink-700">Alerts appear only inside this workspace. No email is sent for them.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ALL_KINDS.map((k) => (
          <label key={k} className="flex min-h-11 items-center gap-2 rounded-xl border border-sand-200 bg-ivory-50 px-3 text-sm text-ink-800">
            <input type="checkbox" className="accent-[#0d5f6e]" checked={current.includes(k)} onChange={(e) => setSel(e.target.checked ? [...current, k] : current.filter((x) => x !== k))} data-testid={`checkbox-kind-${k}`} />
            {KIND_LABELS[k] ?? k}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!dirty || state.busy} onClick={save} className="rounded-full bg-lagoon-900 px-4 py-2 text-xs font-semibold text-gold-400 disabled:opacity-40" data-testid="button-save-preferences">{state.busy ? 'Saving…' : 'Save alert types'}</button>
        {dirty && <button type="button" onClick={() => setSel(null)} className="text-xs text-ink-700 underline" data-testid="button-reset-preferences">Discard changes</button>}
        {state.msg && <p role={state.ok ? 'status' : 'alert'} className={`text-xs ${state.ok ? 'text-lagoon-700' : 'text-crimson-700'}`}>{state.msg}</p>}
      </div>
    </fieldset>
  );
}

export default function CommandOverview() {
  const qc = useQueryClient();
  const q = useGetFounderCommandCenter(overviewOpts());
  const d = q.data;
  const [readMsg, setReadMsg] = useState('');
  const marking = useRef(false);
  useEffect(() => { setReadMsg(''); }, [d?.unread]);

  async function markRead() {
    const top = d?.notifications.reduce((m, n) => Math.max(m, n.id), 0) ?? 0;
    if (!top || marking.current) return;
    marking.current = true;
    try {
      await saveFounderControlPreferences({ readThrough: top });
      qc.invalidateQueries({ queryKey: getGetFounderCommandCenterQueryKey() });
      setReadMsg('Marked as read.');
    } catch { setReadMsg('Could not mark as read. Try again.'); } finally { marking.current = false; }
  }

  if (q.isLoading) return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true" data-testid="skeleton-command-overview">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-100" />)}</div>;
  if (!d) return (
    <div role="alert" className="rounded-2xl border border-crimson-700/30 bg-ivory-50 p-5" data-testid="error-command-overview">
      <p className="font-semibold text-ink-900">The command overview could not be loaded{errStatus(q.error) ? ` (HTTP ${errStatus(q.error)})` : ''}.</p>
      <p className="mt-1 text-sm text-ink-700">No figures are shown because none were received. The service may still be awaiting its database migration.</p>
      <button type="button" onClick={() => q.refetch()} className="mt-3 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900" data-testid="button-retry-command-overview">Retry</button>
    </div>
  );
  const totals = Object.entries(d.totals);
  return (
    <div className="flex flex-col gap-5" data-testid="panel-command-overview">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-700">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wider ${d.environment === 'production' ? 'bg-lagoon-900 text-gold-400' : 'border border-coral-600 text-coral-600'}`} data-testid="badge-command-environment">{d.environment === 'production' ? 'Published data' : 'Development preview data'}</span>
          <span data-testid="text-command-refreshed">As of <time dateTime={d.refreshedAt}>{fmt(d.refreshedAt)}</time> · refreshes every 30 s</span>
        </span>
        <button type="button" onClick={() => q.refetch()} disabled={q.isFetching} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sand-300 px-3 font-semibold text-ink-800 disabled:opacity-50" data-testid="button-refresh-command"><RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />Refresh</button>
      </div>
      {q.isError && <p role="alert" className="text-xs text-crimson-700">Latest refresh failed; showing data as of {fmt(d.refreshedAt)}.</p>}
      {d.environment !== 'production' && <p className="rounded-xl border border-coral-600/40 bg-ivory-100 p-3 text-xs text-ink-800" data-testid="text-command-env-note">These totals come from this preview environment only. They are not the published site's figures.</p>}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="list-command-totals">
        {totals.length === 0 ? <p className="col-span-full text-sm text-ink-700">No totals were reported.</p> : totals.map(([k, v]) => {
          const t = totalLabel(k);
          return (
            <div key={k} className="rounded-2xl border border-sand-200 bg-ivory-50 p-4" data-testid={`metric-command-${k}`}>
              <dt className="text-eyebrow text-gold-700">{t.label}</dt>
              <dd className="mt-1 font-display text-2xl text-ink-900">{num(v)}</dd>
              <dd className="mt-1 text-[11px] leading-snug text-ink-700">{t.note}</dd>
            </div>
          );
        })}
      </dl>

      <section aria-labelledby="cmd-sectors">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="cmd-sectors" className="text-eyebrow text-gold-700">ALL {d.sectors.length} SECTORS</h3>
          <Link href="/member/founder/sectors" className="text-xs font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-all-sectors">Open sectors</Link>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {d.sectors.map((s) => (
            <li key={s.slug}>
              <Link href={`/member/founder/sectors/${s.slug}`} className="flex flex-col gap-1 rounded-xl border border-sand-200 bg-ivory-50 px-3 py-2.5 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-sector-${s.slug}`}>
                <span className="text-sm font-semibold text-ink-900">{sectorName(s.slug)}</span>
                <span className="text-[11px] text-ink-700">{num(s.participants)} participants · {num(s.newMembers)} new (7 d) · {num(s.posts)} posts{s.pendingCertifications ? ` · ${s.pendingCertifications} cert.` : ''}{s.pendingReports ? ` · ${s.pendingReports} reports` : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cmd-alerts" className="rounded-2xl border border-gold-500/40 bg-ivory-50 p-4" id="founder-alerts">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="cmd-alerts" className="flex items-center gap-2 font-display text-lg text-ink-900"><Bell className="h-4 w-4 text-gold-700" />Private alerts {d.unread > 0 && <span className="rounded-full bg-coral-500 px-2 text-[11px] font-bold text-ink-900" data-testid="badge-alerts-unread">{d.unread} unread</span>}</h3>
          {d.notifications.length > 0 && d.unread > 0 && <button type="button" onClick={markRead} className="text-xs font-semibold text-lagoon-700 underline" data-testid="button-mark-alerts-read">Mark displayed as read</button>}
        </div>
        <p className="mt-1 text-xs text-ink-700">In-app sync every 30 seconds — not instant push. Tracking began <time dateTime={d.initializedAt}>{fmt(d.initializedAt)}</time>; earlier history is not replayed as alerts. Nothing here is announced publicly.</p>
        {readMsg && <p role="status" className="mt-1 text-xs text-lagoon-700">{readMsg}</p>}
        {d.notifications.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-sand-300 p-4 text-center text-sm text-ink-700" data-testid="text-alerts-empty">No alerts since tracking began.</p> : (
          <ul className="mt-3 max-h-96 divide-y divide-sand-100 overflow-auto rounded-xl border border-sand-200" data-testid="list-alerts">
            {d.notifications.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm" data-testid={`alert-${n.id}`}>
                <span className="min-w-0"><span className="block font-semibold text-ink-900">{n.title}</span><span className="text-[11px] text-ink-700">{KIND_LABELS[n.kind] ?? n.kind} · {fmt(n.occurredAt)}</span></span>
                {!n.targetClerkId && alertHref(n.kind, n.detail) && <Link href={alertHref(n.kind, n.detail)!} className="text-xs font-semibold text-lagoon-700 underline" data-testid={`link-alert-review-${n.id}`}>Open review tool</Link>}
                {n.targetClerkId && <Link href={`/member/founder/members/${encodeURIComponent(n.targetClerkId)}`} className="text-xs font-semibold text-lagoon-700 underline" data-testid={`link-alert-member-${n.id}`}>Open member</Link>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4"><Preferences enabled={d.enabledKinds} /></div>
      </section>
    </div>
  );
}

/** Header badge: shares the cached overview query. Only mount for founders. */
export function FounderAlertBadge() {
  const q = useGetFounderCommandCenter(overviewOpts());
  const u = q.data?.unread ?? 0;
  return (
    <Link href="/member/founder" className="relative rounded-full p-2 text-gold-400 hover:text-gold-400/80" aria-label={`Founder alerts${u ? `, ${u} unread` : ''}`} data-testid="link-founder-alerts">
      <Bell className="h-4 w-4" />{u > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink-900">{u > 99 ? '99+' : u}</span>}
    </Link>
  );
}
