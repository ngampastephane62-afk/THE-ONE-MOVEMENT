import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import {
  useGetHumanitarianOffers, useUpdateHumanitarianOffer, getGetHumanitarianOffersQueryKey,
  type GetHumanitarianOffers200Item, type HumanitarianOfferStatusInputStatus,
} from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, ago, btn, btnGhost, card, label } from '@/components/network/kit';

const NEXT: Record<string, { to: HumanitarianOfferStatusInputStatus; l: string }[]> = {
  new: [{ to: 'contacted', l: 'Mark contacted' }, { to: 'closed', l: 'Close' }],
  contacted: [{ to: 'arranged', l: 'Mark arranged' }, { to: 'closed', l: 'Close' }, { to: 'new', l: 'Back to new' }],
  arranged: [{ to: 'closed', l: 'Close' }, { to: 'contacted', l: 'Back to contacted' }],
  closed: [{ to: 'new', l: 'Reopen' }],
};
const FILTERS = ['all', 'new', 'contacted', 'arranged', 'closed'] as const;

function Row({ o }: { o: GetHumanitarianOffers200Item }) {
  const qc = useQueryClient();
  const m = useUpdateHumanitarianOffer({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetHumanitarianOffersQueryKey() }) } });
  const [err, setErr] = useState(false);
  const go = (to: HumanitarianOfferStatusInputStatus) => { setErr(false); m.mutateAsync({ id: o.id, data: { status: to } }).catch(() => setErr(true)); };
  return (
    <li className={`${card} p-4 ${o.status === 'closed' ? 'opacity-70' : ''}`} data-testid={`admin-offer-${o.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm"><span className="font-semibold text-ink-900" data-no-translate>{o.fullName}</span> <span className="text-sand-400">· <span data-no-translate>{o.country}</span> · {ago(o.createdAt)}</span></p>
        <span className="flex gap-1.5"><span className="rounded-full bg-gold-500/20 px-2.5 py-0.5 text-xs font-semibold">{label(o.kind)}</span><span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-xs font-semibold capitalize" data-testid={`status-offer-${o.id}`}>{o.status}</span></span>
      </div>
      <a href={`mailto:${o.email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-lagoon-700 underline" data-testid={`link-offer-email-${o.id}`}><Mail className="h-3.5 w-3.5" /><span data-no-translate>{o.email}</span></a>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ink-800" data-no-translate>{o.description}</p>
      <p className="mt-2 text-xs text-ink-700">Status changes are internal records only. Contact the person yourself by email; no message is sent automatically.</p>
      {err && <p className="mt-2 text-xs text-crimson-700" role="alert">Status not saved. Try again.</p>}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-sand-100 pt-3">
        {(NEXT[o.status] ?? NEXT.new).map((n, i) => (
          <button key={n.to} className={i === 0 ? btn : btnGhost} disabled={m.isPending} onClick={() => go(n.to)} data-testid={`button-offer-${n.to}-${o.id}`}>{n.l}</button>
        ))}
      </div>
    </li>
  );
}

export default function OffersAdmin() {
  const q = useGetHumanitarianOffers();
  const [f, setF] = useState<(typeof FILTERS)[number]>('all');
  if (q.isLoading) return <Skeleton />;
  if (q.isError) return <ErrorBox onRetry={() => q.refetch()} msg="Humanitarian offers could not be loaded." />;
  const all = q.data ?? [];
  const list = f === 'all' ? all : all.filter((o) => o.status === f);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-full px-3 py-1 text-xs capitalize ${f === x ? 'bg-lagoon-900 text-ivory-50' : 'border border-sand-300 text-ink-700'}`} data-testid={`filter-offers-${x}`}>
            {x} ({x === 'all' ? all.length : all.filter((o) => o.status === x).length})
          </button>
        ))}
      </div>
      {list.length === 0 ? <Empty title="No offers" body="In-kind offers of goods, equipment and logistics submitted on the Humanitarian page will appear here." /> :
        <ul className="flex flex-col gap-3">{list.map((o) => <Row key={o.id} o={o} />)}</ul>}
    </div>
  );
}
