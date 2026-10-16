import { useState } from 'react';
import { Empty, ErrorBox, Skeleton, card } from '@/components/network/kit';
import { useGetPartnerIntroductions, useUpdatePartnerIntroduction, type IntroStatus, type PartnerIntroduction } from './introductions';

const STATUSES: IntroStatus[] = ['new', 'reviewing', 'replied', 'closed'];
const LABEL: Record<IntroStatus, string> = { new: 'New', reviewing: 'Reviewing', replied: 'Replied', closed: 'Closed' };
const TONE: Record<IntroStatus, string> = { new: 'bg-gold-500/20 text-ink-900', reviewing: 'bg-lagoon-700/15 text-lagoon-900', replied: 'bg-lagoon-900 text-ivory-50', closed: 'bg-ivory-200 text-ink-700' };

function Row({ r }: { r: PartnerIntroduction }) {
  const update = useUpdatePartnerIntroduction();
  const [open, setOpen] = useState(r.status === 'new');
  const [err, setErr] = useState(false);
  const setStatus = (status: IntroStatus) => {
    setErr(false);
    update.mutate({ id: r.id, status }, { onError: () => setErr(true) });
  };
  return (
    <li className={`${card} p-4`} data-testid={`admin-intro-${r.id}`}>
      <button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>
          <span className="block font-semibold text-ink-900">{r.partnerName}{r.leaderName && <span className="font-normal"> · {r.leaderName}{r.leaderRole ? `, ${r.leaderRole}` : ''}</span>}</span>
          <span className="block text-xs text-ink-700">PI-{r.id} · {r.contactName} · {r.organizationName} · {r.country} · {new Date(r.createdAt).toLocaleString()}</span>
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[r.status] ?? TONE.closed}`} data-testid={`status-intro-${r.id}`}>{LABEL[r.status] ?? r.status}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-sand-100 pt-3">
          <dl className="grid gap-1 text-sm text-ink-800 sm:grid-cols-2">
            <div><dt className="inline text-ink-600">Requester: </dt><dd className="inline">{r.contactName}</dd></div>
            <div><dt className="inline text-ink-600">Reply email (private): </dt><dd className="inline break-all">{r.email}</dd></div>
          </dl>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-ivory-100 p-3 text-sm text-ink-900">{r.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Set status">
            {STATUSES.map((s) => (
              <button key={s} type="button" disabled={update.isPending || r.status === s} onClick={() => setStatus(s)} aria-pressed={r.status === s}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold disabled:opacity-60 ${r.status === s ? 'border-lagoon-900 bg-lagoon-900 text-ivory-50' : 'border-sand-300 text-ink-800 hover:border-lagoon-700'}`} data-testid={`button-intro-${r.id}-${s}`}>
                {LABEL[s]}
              </button>
            ))}
            {update.isPending && <span className="text-xs text-ink-600" role="status">Saving</span>}
          </div>
          {err && <p className="mt-2 text-xs text-crimson-700" role="alert">The status could not be saved. Please try again.</p>}
        </div>
      )}
    </li>
  );
}

export default function PartnerIntroductionsAdmin() {
  const q = useGetPartnerIntroductions();
  const [filter, setFilter] = useState<IntroStatus | 'all'>('all');
  if (q.isLoading) return <Skeleton rows={4} />;
  if (q.isError) return <ErrorBox onRetry={() => q.refetch()} msg="Introduction requests could not be loaded." />;
  const rows = (q.data ?? []).filter((r) => filter === 'all' || r.status === filter);
  return (
    <div>
      <p className="mb-3 text-xs text-ink-700">Requests submitted from the Partners page. They are handled by the Movement and never forwarded automatically to partners.</p>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(['all', ...STATUSES] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`min-h-9 rounded-full px-3 text-xs ${filter === s ? 'bg-lagoon-900 font-semibold text-ivory-50' : 'bg-ivory-100 text-ink-700'}`}>
            {s === 'all' ? 'All' : LABEL[s]}
          </button>
        ))}
      </div>
      {rows.length === 0 ? <Empty title="No introduction requests" body="Requests for partner introductions will appear here." />
        : <ul className="space-y-3">{rows.map((r) => <Row key={r.id} r={r} />)}</ul>}
    </div>
  );
}
