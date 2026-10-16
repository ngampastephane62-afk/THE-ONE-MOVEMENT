import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCheckoutMagazineOrder, getGetMagazineOrdersQueryKey, getGetMagazineOrderQueryKey, type MagazineOrder, type MagazineConfig } from '@workspace/api-client-react';
import { Download, RotateCw } from 'lucide-react';
import { StatusPill, usd, downloadUrl, primaryBtn, ghostBtn } from './shared';

function OrderRow({ o, config }: { o: MagazineOrder; config: MagazineConfig }) {
  const qc = useQueryClient();
  const checkout = useCheckoutMagazineOrder();
  const [accepted, setAccepted] = useState(false);
  const [err, setErr] = useState(false);
  const awaitingCheckout = (o.format === 'print' && ['quoted', 'checkout_pending'].includes(o.status)) || (o.format === 'digital' && ['pending', 'checkout_pending'].includes(o.status));
  const payable = config.available && awaitingCheckout && o.totalAmount !== null;
  const pay = () => {
    setErr(false);
    checkout.mutate({ id: o.id, data: { accepted: true, expectedTotal: o.totalAmount! } }, {
      onSuccess: (r) => { qc.invalidateQueries({ queryKey: getGetMagazineOrdersQueryKey() }); qc.invalidateQueries({ queryKey: getGetMagazineOrderQueryKey(o.id) }); window.location.assign(r.url); },
      onError: () => setErr(true),
    });
  };
  return (
    <li className="grid gap-4 border-t border-ink-900/15 py-6 md:grid-cols-12" data-testid={`row-order-${o.id}`}>
      <div className="md:col-span-4">
        <p className="font-display text-lg text-ink-900">{o.format === 'digital' ? 'Digital PDF' : 'Printed copy'}</p>
        <p className="mt-1 text-xs text-ink-700"><span>Order</span> <span translate="no">#{o.id} · {new Date(o.createdAt).toLocaleDateString()}</span></p>
        <div className="mt-2"><StatusPill status={o.status} testId={`status-order-${o.id}`} /></div>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-sm md:col-span-4">
        <div><dt className="text-[11px] uppercase tracking-[0.15em] text-ink-700">Item</dt><dd className="mt-1 text-ink-900" translate="no">{usd(o.itemAmount)}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-[0.15em] text-ink-700">Shipping</dt><dd className="mt-1 text-ink-900">{o.format === 'digital' ? '—' : o.shippingAmount == null ? <span>Pending quote</span> : <span translate="no">{usd(o.shippingAmount)}</span>}</dd></div>
        <div><dt className="text-[11px] uppercase tracking-[0.15em] text-ink-700">Total</dt><dd className="mt-1 font-semibold text-ink-900" data-testid={`text-total-${o.id}`}>{o.totalAmount == null ? <span>Pending</span> : <span translate="no">{usd(o.totalAmount)}</span>}</dd></div>
      </dl>
      <div className="flex flex-col gap-2 md:col-span-4 md:items-end">
        {o.format === 'digital' && o.status === 'paid' && o.canDownload && (
          <a href={downloadUrl(o.id)} className={primaryBtn} data-testid={`link-download-${o.id}`}><Download className="h-4 w-4" aria-hidden="true" />Download PDF</a>
        )}
        {o.format === 'print' && o.status === 'paid' && <p className="text-sm text-lagoon-900">Paid · awaiting fulfilment. We will contact you about dispatch.</p>}
        {o.status === 'quote_requested' && <p className="text-sm text-ink-700 md:text-right">No charge yet. Waiting for the exact shipping quote.</p>}
        {awaitingCheckout && (
          config.available ? (
            <>
              <label className="flex items-start gap-2 text-xs text-ink-800 md:max-w-xs">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-[hsl(187_67%_12%)]" data-testid={`checkbox-accept-pay-${o.id}`} />
                <span>I accept this total and the Terms for a one-time purchase.</span>
              </label>
              <button className={primaryBtn} disabled={!payable || !accepted || checkout.isPending} onClick={pay} data-testid={`button-pay-${o.id}`}>
                {checkout.isPending ? 'Opening checkout…' : o.status === 'quoted' ? <span>Pay <span translate="no">{usd(o.totalAmount)}</span></span> : 'Resume checkout'}
              </button>
            </>
          ) : <p className="text-xs text-ink-700 md:text-right">Payment is not open yet. Your order is kept.</p>
        )}
        {err && <p role="alert" className="text-xs text-crimson-700">Checkout could not open. Please try again.</p>}
      </div>
    </li>
  );
}

export default function MyOrders({ orders, config, isLoading, isError, onRetry }: { orders: MagazineOrder[]; config: MagazineConfig; isLoading: boolean; isError: boolean; onRetry: () => void }) {
  return (
    <section aria-labelledby="my-orders-heading" className="mt-20">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-eyebrow text-gold-600">YOUR ACCOUNT</p><h2 id="my-orders-heading" className="mt-2 font-display text-3xl text-ink-900">Your orders</h2></div>
        <button className={ghostBtn} onClick={onRetry} aria-label="Refresh orders" data-testid="button-refresh-orders"><RotateCw className="h-3.5 w-3.5" aria-hidden="true" /><span className="hidden sm:inline">Refresh</span></button>
      </div>
      {isLoading ? (
        <div className="mt-6 flex flex-col gap-3" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-20 animate-pulse bg-ivory-200" />)}</div>
      ) : isError ? (
        <div role="alert" className="mt-6 flex items-center justify-between border border-crimson-700/30 p-4 text-sm text-crimson-700"><span>Your orders could not be loaded.</span><button className={ghostBtn} onClick={onRetry} data-testid="button-retry-orders">Retry</button></div>
      ) : orders.length === 0 ? (
        <p className="mt-6 border-t border-ink-900/15 pt-6 text-sm text-ink-700" data-testid="text-no-orders">No orders yet. Your purchases and quote requests will appear here.</p>
      ) : (
        <ul className="mt-6">{orders.map((o) => <OrderRow key={o.id} o={o} config={config} />)}</ul>
      )}
    </section>
  );
}
