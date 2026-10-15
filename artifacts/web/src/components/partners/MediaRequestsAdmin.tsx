import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, ShieldCheck } from 'lucide-react';
import { useGetMediaRequests, useUpdateMediaRequest, getGetMediaRequestsQueryKey, type MediaInquiry, type MediaInquiryReviewStatus } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card } from '@/components/network/kit';

const STATUSES = ['new', 'in_progress', 'approved', 'declined', 'closed'] as const;
const LABEL: Record<string, string> = { new: 'New', in_progress: 'In review', approved: 'Approved to discuss', declined: 'Declined', closed: 'Closed' };
const TONE: Record<string, string> = { new: 'bg-gold-500/20 text-ink-900', in_progress: 'bg-lagoon-700/15 text-lagoon-900', approved: 'bg-lagoon-900 text-ivory-50', declined: 'bg-crimson-700/10 text-crimson-700', closed: 'bg-ivory-200 text-ink-700' };

function Row({ r }: { r: MediaInquiry }) {
  const qc = useQueryClient();
  const update = useUpdateMediaRequest();
  const [open, setOpen] = useState(r.status === 'new');
  const [err, setErr] = useState(false);
  const setStatus = async (status: string) => {
    if (status === 'approved' && !confirm('Approval only authorises you to discuss terms with this requester. It does not confirm publication or payment. Continue?')) return;
    setErr(false);
    try {
      await update.mutateAsync({ id: r.id, data: { status: status as MediaInquiryReviewStatus } });
      await qc.invalidateQueries({ queryKey: getGetMediaRequestsQueryKey() });
    } catch { setErr(true); }
  };
  const subject = encodeURIComponent(`Your media enquiry MR-${r.id} · ${r.outletName}`);
  return (
    <li className={`${card} p-4`} data-testid={`admin-media-${r.id}`}>
      <button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>
          <span className="block font-semibold text-ink-900">{r.outletName} · <span className="font-normal">{r.format}</span></span>
          <span className="block text-xs text-ink-700">MR-{r.id} · {r.organizationName} · {r.country} · {new Date(r.createdAt).toLocaleString()}</span>
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[r.status] ?? TONE.closed}`} data-testid={`status-media-${r.id}`}>{LABEL[r.status] ?? r.status}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-sand-100 pt-3">
          <dl className="grid gap-1 text-sm text-ink-800 sm:grid-cols-2">
            <div><dt className="inline text-ink-600">Contact: </dt><dd className="inline">{r.contactName}</dd></div>
            <div><dt className="inline text-ink-600">Email: </dt><dd className="inline break-all">{r.email}</dd></div>
          </dl>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-ivory-100 p-3 text-sm text-ink-900">{r.message}</p>
          {err && <p className="mt-2 text-xs text-crimson-700" role="alert">Status not saved.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a className={btnGhost} href={`mailto:${r.email}?subject=${subject}`} data-testid={`link-mail-${r.id}`}><Mail className="h-3.5 w-3.5" />Contact</a>
            {r.status !== 'approved' && <button className={btn} disabled={update.isPending} onClick={() => setStatus('approved')} data-testid={`button-media-approve-${r.id}`}>Approve to discuss</button>}
            {r.status !== 'declined' && <button className={`${btnGhost} text-crimson-700`} disabled={update.isPending} onClick={() => setStatus('declined')} data-testid={`button-media-decline-${r.id}`}>Decline</button>}
            <label className="ml-auto text-xs text-ink-700">Review state{' '}
              <select className="rounded-full border border-sand-300 bg-ivory-50 px-3 py-1.5 text-xs" value={r.status} disabled={update.isPending} onChange={(e) => setStatus(e.target.value)} data-testid={`select-media-status-${r.id}`}>
                {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}
    </li>
  );
}

export default function MediaRequestsAdmin() {
  const q = useGetMediaRequests({ query: { queryKey: getGetMediaRequestsQueryKey(), refetchInterval: 30000 } });
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-1.5 text-xs text-ink-700"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-700" />Private to the founder. Approval is only internal authorisation to discuss terms with the requester — it is not a guaranteed article, a publication date or a payment confirmation. No checkout is ever triggered from here.</p>
      {q.isLoading ? <Skeleton /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} msg="Media enquiries could not be loaded." /> : (() => {
        const all = [...(q.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const list = filter === 'open' ? all.filter((r) => ['new', 'in_progress', 'approved'].includes(r.status)) : all;
        return (
          <>
            <div className="flex gap-2 text-xs">
              {(['open', 'all'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={filter === f ? btn : btnGhost} data-testid={`button-media-filter-${f}`}>{f === 'open' ? 'Active' : `All (${all.length})`}</button>)}
            </div>
            {list.length === 0 ? <Empty title="No media enquiries" body="Placement requests from the Partners page catalogue will appear here for your review." /> :
              <ul className="flex flex-col gap-3">{list.map((r) => <Row key={r.id} r={r} />)}</ul>}
          </>
        );
      })()}
    </div>
  );
}
