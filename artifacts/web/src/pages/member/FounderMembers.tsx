import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, RefreshCw, X } from 'lucide-react';
import {
  useGetMembershipDashboard, getGetMembershipDashboardQueryKey,
  usePreviewProfileReminder, getPreviewProfileReminderQueryKey, useSendProfileReminder,
  type GetMembershipDashboardParams, type GetMembershipDashboardStatus, type GetMembershipDashboardDays, type MembershipAccount,
} from '@workspace/api-client-react';
import { errStatus } from '@/components/network/kit';

const STATUS_FILTERS: { v: GetMembershipDashboardStatus; label: string }[] = [
  { v: 'all', label: 'All accounts' }, { v: 'no_profile', label: 'No profile' }, { v: 'incomplete', label: 'Incomplete' },
  { v: 'complete', label: 'Complete' }, { v: 'active', label: 'Active' },
];
const DAYS: GetMembershipDashboardDays[] = [7, 30, 90];
const PROFILE_LABEL = { no_profile: 'No profile', incomplete: 'Incomplete', complete: 'Complete' } as const;
const fmt = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const n = (x: number) => x.toLocaleString();

function Metric({ label, value, note, testid }: { label: string; value: string; note: string; testid: string }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-ivory-50 p-4" data-testid={`metric-${testid}`}>
      <dt className="text-eyebrow text-gold-700">{label}</dt>
      <dd className="mt-1 font-display text-2xl text-ink-900" data-testid={`text-metric-${testid}`}>{value}</dd>
      <dd className="mt-1 text-xs leading-snug text-ink-700">{note}</dd>
    </div>
  );
}

function ReminderPanel({ account, onClose }: { account: MembershipAccount; onClose: () => void }) {
  const qc = useQueryClient();
  const preview = usePreviewProfileReminder(account.clerkId, { query: { enabled: !!account.clerkId, queryKey: getPreviewProfileReminderQueryKey(account.clerkId), retry: false, staleTime: 0 } });
  const send = useSendProfileReminder({ mutation: { retry: false } });
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ ok: true; at: string } | { ok: false; msg: string } | null>(null);
  const p = preview.data;

  async function doSend() {
    if (!p || !p.canSend || send.isPending) return;
    setResult(null);
    try {
      const r = await send.mutateAsync({ clerkId: account.clerkId, data: { confirmed: true, previewToken: p.previewToken } });
      setResult({ ok: true, at: r.acceptedAt });
      setConfirming(false);
      qc.invalidateQueries({ queryKey: ['/api/founder/membership-dashboard'] });
      qc.invalidateQueries({ queryKey: getPreviewProfileReminderQueryKey(account.clerkId) });
    } catch (e) {
      const s = errStatus(e);
      setResult({ ok: false, msg: s === 409 ? 'This preview is out of date or a reminder was already sent recently. Nothing was sent. Refresh the preview to check again.' : 'The reminder could not be sent. Nothing was accepted by the provider.' });
    }
  }

  return (
    <section aria-labelledby="reminder-title" className="rounded-2xl border border-gold-500/50 bg-ivory-50 p-4 sm:p-5" data-testid="panel-reminder">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-eyebrow text-gold-700">PROFILE REMINDER · ONE RECIPIENT</p><h3 id="reminder-title" className="mt-1 font-display text-lg text-ink-900">Preview for {account.name || account.email}</h3></div>
        <button type="button" onClick={onClose} aria-label="Close reminder preview" className="rounded-full p-1.5 text-ink-700 hover:text-ink-900" data-testid="button-close-reminder"><X className="h-4 w-4" /></button>
      </div>
      {preview.isLoading ? <div className="mt-3 h-32 animate-pulse rounded-xl bg-sand-100" aria-hidden="true" data-testid="skeleton-reminder" />
        : preview.isError && !p ? (
          <div role="alert" className="mt-3 text-sm text-crimson-700" data-testid="error-reminder-preview">The preview could not be loaded{errStatus(preview.error) ? ` (HTTP ${errStatus(preview.error)})` : ''}. Nothing was sent. <button type="button" className="font-semibold underline" onClick={() => preview.refetch()} data-testid="button-retry-reminder-preview">Retry</button></div>
        ) : p ? (
          <>
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="text-xs text-ink-700">Recipient</dt><dd className="font-mono text-ink-900" data-testid="text-reminder-recipient">{p.recipient}</dd></div>
              <div><dt className="text-xs text-ink-700">Subject</dt><dd className="font-semibold text-ink-900" data-testid="text-reminder-subject">{p.subject}</dd></div>
              <div><dt className="text-xs text-ink-700">Message (exact text)</dt><dd><pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-sand-200 bg-ivory-100 p-3 font-sans text-xs leading-relaxed text-ink-800" data-testid="text-reminder-body">{p.text}</pre></dd></div>
            </dl>
            {!p.canSend && <p className="mt-3 rounded-xl border border-sand-300 bg-ivory-100 p-3 text-xs text-ink-800" data-testid="text-reminder-blocked"><span className="font-semibold">Sending unavailable.</span> {p.reason}</p>}
            {result?.ok === true && <p role="status" className="mt-3 rounded-xl bg-lagoon-900 p-3 text-xs text-ivory-100" data-testid="status-reminder-accepted">Accepted by the email provider at {fmt(result.at)}. Acceptance does not confirm delivery to the inbox.</p>}
            {result?.ok === false && <p role="alert" className="mt-3 text-xs text-crimson-700" data-testid="error-reminder-send">{result.msg}</p>}
            {result?.ok !== true && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!confirming ? (
                  <button type="button" disabled={!p.canSend} onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 rounded-full border border-lagoon-900 px-4 py-2 text-xs font-semibold text-lagoon-900 hover:bg-lagoon-900 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-prepare-reminder"><Mail className="h-3.5 w-3.5" />Prepare to send</button>
                ) : (
                  <>
                    <span className="text-xs text-ink-800">Send this one email to {p.recipient}?</span>
                    <button type="button" disabled={send.isPending} onClick={doSend} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" data-testid="button-confirm-send-reminder">{send.isPending ? 'Sending…' : 'Confirm and send'}</button>
                    <button type="button" disabled={send.isPending} onClick={() => setConfirming(false)} className="text-xs font-semibold text-ink-700 underline" data-testid="button-cancel-send-reminder">Cancel</button>
                  </>
                )}
                <button type="button" onClick={() => { setResult(null); preview.refetch(); }} className="text-xs font-semibold text-lagoon-700 underline" data-testid="button-refresh-reminder-preview">Refresh preview</button>
              </div>
            )}
          </>
        ) : null}
    </section>
  );
}

export default function FounderMembers() {
  const [status, setStatus] = useState<GetMembershipDashboardStatus>('all');
  const [days, setDays] = useState<GetMembershipDashboardDays>(30);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reminderFor, setReminderFor] = useState<MembershipAccount | null>(null);
  const params: GetMembershipDashboardParams = { page, status, days, ...(search ? { search } : {}) };
  const q = useGetMembershipDashboard(params, { query: { queryKey: getGetMembershipDashboardQueryKey(params), staleTime: 60_000, refetchOnMount: true, refetchOnWindowFocus: true, refetchInterval: 5 * 60_000, placeholderData: (prev) => prev } });
  const d = q.data;
  useEffect(() => { if (d && page > Math.max(1, d.pages)) setPage(Math.max(1, d.pages)); }, [d, page]);

  const onSearch = (e: FormEvent) => { e.preventDefault(); setSearch(draft.trim().slice(0, 120)); setPage(1); };
  const t = d?.traffic;

  return (
    <section className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" aria-labelledby="fm-title" data-testid="page-founder-members">
      <Helmet><title>Membership dashboard — Founder</title></Helmet>
      <Link href="/member/founder" className="inline-flex items-center gap-1 text-xs font-semibold text-lagoon-700" data-testid="link-back-founder"><ArrowLeft className="h-3.5 w-3.5" />Founder workspace</Link>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-sand-200 pb-4">
        <div>
          <p className="text-eyebrow text-gold-700">FOUNDER · MEMBERSHIP</p>
          <h1 id="fm-title" className="mt-1 font-display text-2xl text-ink-900 sm:text-3xl">Members and visits</h1>
          {d && <p className="mt-2 text-xs text-ink-700" data-testid="text-refreshed-at">Data as of <time dateTime={d.refreshedAt}>{fmt(d.refreshedAt)}</time> ({d.refreshedAt} UTC source)</p>}
        </div>
        <div className="flex items-center gap-2">
          {d && <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${d.environment === 'production' ? 'bg-lagoon-900 text-gold-400' : 'border border-coral-600 text-coral-600'}`} data-testid="badge-environment">{d.environment === 'production' ? 'Published workspace' : 'Development workspace'}</span>}
          <button type="button" onClick={() => q.refetch()} disabled={q.isFetching} className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:border-lagoon-600 disabled:opacity-50" data-testid="button-refresh-dashboard"><RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />Refresh</button>
        </div>
      </header>
      {d?.environment === 'development' && <p className="rounded-xl border border-coral-600/40 bg-ivory-50 p-3 text-xs text-ink-800" data-testid="text-environment-note">Profile completion and visit measurements come from the development database. Accounts come from the configured sign-in service, which may also serve the published site. Published profile and visit records are not merged into this view.</p>}

      {q.isLoading ? <div className="grid gap-3 sm:grid-cols-5" aria-hidden="true" data-testid="skeleton-dashboard">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-100" />)}</div>
        : q.isError && !d ? (
          <div role="alert" className="rounded-2xl border border-crimson-700/30 bg-ivory-50 p-5" data-testid="error-dashboard">
            <p className="font-semibold text-ink-900">The membership dashboard could not be loaded{errStatus(q.error) ? ` (HTTP ${errStatus(q.error)})` : ''}.</p>
            <p className="mt-1 text-sm text-ink-700">No figures are shown because none were received. {errStatus(q.error) === 404 ? 'The dashboard service may not be running yet.' : ''}</p>
            <button type="button" onClick={() => q.refetch()} className="mt-3 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900" data-testid="button-retry-dashboard">Retry</button>
          </div>
        ) : d && (
          <>
            {q.isError && <p role="alert" className="text-xs text-crimson-700" data-testid="error-dashboard-stale">Latest refresh failed; showing data as of {fmt(d.refreshedAt)}.</p>}
            <section aria-labelledby="fm-accounts">
              <h2 id="fm-accounts" className="sr-only">Account totals</h2>
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Metric testid="accounts" label="All accounts" value={n(d.totals.accounts)} note="Accounts in the configured sign-in service." />
                <Metric testid="no-profile" label="No profile" value={n(d.totals.noProfile)} note="Account exists, no member profile saved." />
                <Metric testid="incomplete" label="Incomplete" value={n(d.totals.incomplete)} note="Profile saved, essentials missing." />
                <Metric testid="complete" label="Complete" value={n(d.totals.complete)} note="All essentials saved, activated or not." />
                <Metric testid="active" label="Active" value={n(d.totals.active)} note="Complete, voluntarily activated, not suspended." />
              </dl>
            </section>

            <section aria-labelledby="fm-traffic" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4 sm:p-5" data-testid="panel-traffic">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="fm-traffic" className="font-display text-lg text-ink-900">Consented public visits</h2>
                <div role="group" aria-label="Period" className="flex gap-1">{DAYS.map((x) => <button key={x} type="button" aria-pressed={days === x} onClick={() => { setDays(x); setPage(1); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${days === x ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-700'}`} data-testid={`button-days-${x}`}>{x} days</button>)}</div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-700">Counts browser sessions observed per UTC day from visitors who accepted measurement on public pages. These are not unique people, exclude everyone who refused or ignored the choice, and cover nothing before the oldest retained day (records older than 90 days are deleted).</p>
              {t && !t.measurementStartedAt ? (
                <p className="mt-3 rounded-xl border border-dashed border-sand-300 p-4 text-sm text-ink-800" data-testid="text-traffic-not-started">No consented visit is currently retained. Either collection has not started or all records are older than 90 days and were deleted. This is not a count of historical visitors.</p>
              ) : t && (
                <>
                  <p className="mt-3 text-sm text-ink-900" data-testid="text-traffic-summary">Last {t.days} days: <strong>{n(t.sessions)}</strong> consented sessions, <strong>{n(t.pageViews)}</strong> page views. Data retained from <time dateTime={t.measurementStartedAt!}>{fmt(t.measurementStartedAt)}</time>.</p>
                  {t.daily.length === 0 ? <p className="mt-3 text-sm text-ink-700" data-testid="text-traffic-empty">No consented sessions in this period.</p> : (
                    <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-sand-200">
                      <table className="w-full text-left text-sm" data-testid="table-traffic-daily">
                        <caption className="sr-only">Consented sessions and page views per UTC day</caption>
                        <thead className="sticky top-0 bg-ivory-100 text-xs text-ink-700"><tr><th scope="col" className="px-3 py-2">Day (UTC)</th><th scope="col" className="px-3 py-2 text-right">Sessions</th><th scope="col" className="px-3 py-2 text-right">Page views</th></tr></thead>
                        <tbody>{t.daily.map((r) => <tr key={r.day} className="border-t border-sand-200" data-testid={`row-traffic-${r.day}`}><td className="px-3 py-1.5 font-mono text-xs">{r.day}</td><td className="px-3 py-1.5 text-right font-mono">{n(r.sessions)}</td><td className="px-3 py-1.5 text-right font-mono">{n(r.pageViews)}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>

            <section aria-labelledby="fm-list" className="flex flex-col gap-3">
              <h2 id="fm-list" className="font-display text-lg text-ink-900">Accounts</h2>
              <p className={`rounded-xl p-3 text-xs ${d.emailSetup.configured ? 'bg-ivory-50 text-ink-800 border border-sand-200' : 'border border-coral-600/40 bg-ivory-50 text-ink-800'}`} data-testid="text-email-setup"><span className="font-semibold">Email reminders: {d.emailSetup.configured ? 'configured' : 'not configured'}.</span> {d.emailSetup.message} Reminders are sent one at a time, only after you confirm.</p>
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Profile status" className="flex flex-wrap gap-1">{STATUS_FILTERS.map((f) => <button key={f.v} type="button" aria-pressed={status === f.v} onClick={() => { setStatus(f.v); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === f.v ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-700 hover:border-lagoon-600'}`} data-testid={`filter-status-${f.v}`}>{f.label}</button>)}</div>
                <form onSubmit={onSearch} role="search" className="flex min-w-0 flex-1 gap-2 sm:max-w-sm sm:ml-auto">
                  <label htmlFor="fm-search" className="sr-only">Search name or email</label>
                  <input id="fm-search" value={draft} maxLength={120} onChange={(e) => setDraft(e.target.value)} placeholder="Name or email" className="min-w-0 flex-1 border border-sand-300 bg-ivory-50 px-3 py-2 text-sm focus:border-lagoon-600 focus:outline-none" data-testid="input-search-members" />
                  <button type="submit" className="rounded-full bg-gold-500 px-4 text-xs font-semibold text-ink-900" data-testid="button-search-members">Search</button>
                  {search && <button type="button" onClick={() => { setDraft(''); setSearch(''); setPage(1); }} className="text-xs text-ink-700 underline" data-testid="button-clear-search">Clear</button>}
                </form>
              </div>
              <p className="text-xs text-ink-700" data-testid="text-filtered-count">{n(d.filteredCount)} matching account{d.filteredCount === 1 ? '' : 's'}{search ? ` for “${search}”` : ''}.</p>
              {reminderFor && <ReminderPanel key={reminderFor.clerkId} account={reminderFor} onClose={() => setReminderFor(null)} />}
              {d.accounts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-sand-300 p-6 text-center text-sm text-ink-700" data-testid="text-members-empty">{d.totals.accounts === 0 ? 'No accounts exist in the configured sign-in service yet.' : 'No accounts match these filters.'}</p>
              ) : (
                <ul className={`flex flex-col gap-2 transition-opacity motion-reduce:transition-none ${q.isFetching ? 'opacity-60' : ''}`} aria-busy={q.isFetching}>
                  {d.accounts.map((a) => (
                    <li key={a.clerkId} className="rounded-2xl border border-sand-200 bg-ivory-50 p-3 sm:p-4" data-testid={`row-account-${a.clerkId}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">{a.name || 'Unnamed account'}</p>
                          <p className="truncate font-mono text-xs text-ink-700">{a.email} · {a.emailVerified ? 'verified' : 'unverified'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[11px] font-semibold uppercase tracking-wider">
                          <span className={`rounded-full px-2 py-0.5 ${a.profileStatus === 'complete' ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-700'}`} data-testid={`status-profile-${a.clerkId}`}>{PROFILE_LABEL[a.profileStatus]}</span>
                          {a.networkEnabled && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-gold-700">Network on</span>}
                          {a.suspended && <span className="rounded-full bg-crimson-700 px-2 py-0.5 text-ivory-50">Suspended</span>}
                        </div>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-700 sm:grid-cols-4">
                        <div><dt className="inline">Joined </dt><dd className="inline text-ink-900">{fmt(a.createdAt)}</dd></div>
                        <div><dt className="inline">Last sign-in </dt><dd className="inline text-ink-900">{fmt(a.lastSignInAt)}</dd></div>
                        <div><dt className="inline">Sectors </dt><dd className="inline text-ink-900">{a.sectors.length ? a.sectors.join(', ') : '—'}</dd></div>
                        <div><dt className="inline">Last reminder </dt><dd className="inline text-ink-900">{a.lastReminderAt ? `${fmt(a.lastReminderAt)}${a.reminderStatus ? ` (${a.reminderStatus})` : ''}` : '—'}</dd></div>
                      </dl>
                      {a.missingFields.length > 0 && <p className="mt-1 text-xs text-ink-700">Missing: {a.missingFields.join(', ')}</p>}
                      {a.profileStatus !== 'complete' && (
                        a.remindersOptedOut ? <p className="mt-2 text-xs text-ink-700" data-testid={`text-optout-${a.clerkId}`}>Opted out of reminders.</p>
                          : <button type="button" onClick={() => setReminderFor(a)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-lagoon-700 underline underline-offset-4" data-testid={`button-preview-reminder-${a.clerkId}`}><Mail className="h-3.5 w-3.5" />Preview reminder</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {d.pages > 1 && (
                <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
                  <button type="button" disabled={page <= 1 || q.isFetching} onClick={() => setPage((p) => p - 1)} className="rounded-full border border-sand-300 px-4 py-2 text-xs font-semibold disabled:opacity-40" data-testid="button-page-prev">Previous</button>
                  <span className="text-xs text-ink-700" data-testid="text-page">Page {d.page} of {d.pages}</span>
                  <button type="button" disabled={page >= d.pages || q.isFetching} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-sand-300 px-4 py-2 text-xs font-semibold disabled:opacity-40" data-testid="button-page-next">Next</button>
                </nav>
              )}
            </section>
          </>
        )}
    </section>
  );
}
