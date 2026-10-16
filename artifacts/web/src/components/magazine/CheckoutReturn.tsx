import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMagazineOrder, getGetMagazineOrdersQueryKey } from '@workspace/api-client-react';
import { useMagazineKeys, StatusPill, downloadUrl, primaryBtn, ghostBtn } from './shared';

export default function CheckoutReturn({ orderId, kind }: { orderId: number; kind: 'complete' | 'cancelled' }) {
  const keys = useMagazineKeys();
  const qc = useQueryClient();
  const q = useGetMagazineOrder(orderId, {
    query: {
      enabled: keys.signedIn && orderId > 0,
      queryKey: keys.detail(orderId),
      refetchInterval: (query) => (kind === 'complete' && query.state.data?.status === 'checkout_pending' && query.state.dataUpdateCount < 6 ? 2500 : false),
    },
  });
  const status = q.data?.status;
  const last = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status && last.current !== status) qc.invalidateQueries({ queryKey: getGetMagazineOrdersQueryKey() });
    if (status) last.current = status;
  }, [status, qc]);

  if (!keys.signedIn) return null;
  const o = q.data;
  return (
    <div role="status" aria-live="polite" className="border border-ink-900 bg-ivory-50 p-6" data-testid="panel-checkout-return">
      {q.isLoading ? <p className="text-sm text-ink-700">Verifying your order with the payment provider…</p> :
        q.isError || !o ? <div className="flex items-center justify-between gap-3 text-sm text-crimson-700"><span>We could not verify this order.</span><button className={ghostBtn} onClick={() => q.refetch()}>Retry</button></div> : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3"><span className="font-display text-xl text-ink-900">{kind === 'cancelled' ? 'Checkout cancelled' : 'Checkout returned'}</span><StatusPill status={o.status} /></div>
            {o.status === 'paid' && o.format === 'digital' && o.canDownload && <><p className="text-sm text-ink-800">Payment verified. Your PDF is ready.</p><a href={downloadUrl(o.id)} className={`${primaryBtn} self-start`} data-testid="link-return-download">Download PDF</a></>}
            {o.status === 'paid' && o.format === 'print' && <p className="text-sm text-ink-800">Payment verified. Your printed copy is awaiting fulfilment.</p>}
            {o.status !== 'paid' && kind === 'cancelled' && <p className="text-sm text-ink-800">No payment was taken. You can resume from your orders when ready.</p>}
            {o.status !== 'paid' && kind === 'complete' && <><p className="text-sm text-ink-800">Payment is not confirmed yet. Confirmation can take a moment.</p><button className={`${ghostBtn} self-start`} onClick={() => q.refetch()} disabled={q.isFetching} data-testid="button-recheck">{q.isFetching ? 'Checking…' : 'Check again'}</button></>}
          </div>
        )}
    </div>
  );
}
