import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMagazineAdminOrders, useQuoteMagazineShipping, getGetMagazineAdminOrdersQueryKey, getGetMagazineOrdersQueryKey, type MagazineOrder } from '@workspace/api-client-react';
import { StatusPill, usd, useMagazineKeys, inputCls, primaryBtn, ghostBtn } from './shared';

function QuoteEditor({ o }: { o: MagazineOrder }) {
  const qc = useQueryClient();
  const keys = useMagazineKeys();
  const quote = useQuoteMagazineShipping();
  const [val, setVal] = useState(o.shippingAmount != null ? String(o.shippingAmount / 100) : '');
  const [msg, setMsg] = useState<string | null>(null);
  const n = Number(val);
  const ok = val.trim() !== '' && Number.isFinite(n) && n >= 10 && n <= 30;
  const save = () => {
    setMsg(null);
    quote.mutate({ id: o.id, data: { shippingAmount: Math.round(n * 100) } }, {
      onSuccess: (updated) => {
        qc.setQueryData<MagazineOrder[]>(keys.admin, (old) => old?.map((x) => (x.id === updated.id ? updated : x)));
        qc.invalidateQueries({ queryKey: getGetMagazineAdminOrdersQueryKey() });
        qc.invalidateQueries({ queryKey: getGetMagazineOrdersQueryKey() });
        setMsg('Quote saved.');
      },
      onError: () => setMsg('Quote not saved. The order may have an open checkout.'),
    });
  };
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-ink-800"><span>Shipping (USD, 10–30)</span>
        <input type="number" min={10} max={30} step="0.01" className={`${inputCls} w-32`} value={val} onChange={(e) => setVal(e.target.value)} data-testid={`input-quote-${o.id}`} /></label>
      <button className={primaryBtn} disabled={!ok || quote.isPending} onClick={save} data-testid={`button-save-quote-${o.id}`}>{quote.isPending ? 'Saving…' : 'Save quote'}</button>
      {msg && <p role="status" className="w-full text-xs text-ink-700">{msg}</p>}
    </div>
  );
}

export default function FounderOrders() {
  const keys = useMagazineKeys();
  const q = useGetMagazineAdminOrders({ query: { enabled: keys.signedIn, queryKey: keys.admin } });
  const orders = q.data ?? [];
  const toQuote = orders.filter((o) => o.status === 'quote_requested' || o.status === 'quoted');
  const toShip = orders.filter((o) => o.format === 'print' && o.status === 'paid');
  const rest = orders.filter((o) => !toQuote.includes(o) && !toShip.includes(o));

  const Card = ({ o, children }: { o: MagazineOrder; children?: React.ReactNode }) => (
    <li className="grid gap-4 border border-ink-900/15 bg-ivory-50 p-5 md:grid-cols-2" data-testid={`admin-order-${o.id}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2"><span className="font-display text-lg text-ink-900">{o.format === 'digital' ? 'Digital' : 'Print'}</span><span className="text-xs text-ink-700" translate="no">#{o.id}</span><StatusPill status={o.status} /></div>
        <p className="mt-2 text-sm text-ink-800" translate="no">{o.email}</p>
        {o.format === 'print' && (
          <address className="mt-2 not-italic text-sm leading-relaxed text-ink-800" translate="no">
            {o.fullName}<br /><span className="whitespace-pre-wrap">{o.address}</span><br />{o.country} · {o.phone}
          </address>
        )}
        <p className="mt-2 text-xs text-ink-700"><span>Total</span> <span translate="no">{usd(o.totalAmount) ?? '—'}</span></p>
      </div>
      <div className="md:justify-self-end">{children}</div>
    </li>
  );

  return (
    <section id="magazine-orders" aria-labelledby="founder-orders-heading" className="mt-20 border-t-4 border-ink-900 pt-8">
      <p className="text-eyebrow text-gold-600">FOUNDER ONLY</p>
      <h2 id="founder-orders-heading" className="mt-2 font-display text-3xl text-ink-900">Magazine orders</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-700">Recipient details are shown here only. Payment status is set by Stripe on the server; it cannot be marked paid from this page.</p>
      {q.isLoading ? <div className="mt-6 h-24 animate-pulse bg-ivory-200" aria-busy="true" /> :
        q.isError ? <div role="alert" className="mt-6 flex items-center justify-between border border-crimson-700/30 p-4 text-sm text-crimson-700"><span>Orders could not be loaded.</span><button className={ghostBtn} onClick={() => q.refetch()}>Retry</button></div> :
          orders.length === 0 ? <p className="mt-6 text-sm text-ink-700">No orders yet.</p> : (
            <div className="mt-8 flex flex-col gap-10">
              <div><h3 className="font-display text-xl text-ink-900">Shipping quotes</h3>
                {toQuote.length === 0 ? <p className="mt-2 text-sm text-ink-700">Nothing to quote.</p> :
                  <ul className="mt-4 flex flex-col gap-3">{toQuote.map((o) => <Card key={o.id} o={o}><QuoteEditor o={o} /></Card>)}</ul>}</div>
              <div><h3 className="font-display text-xl text-ink-900">Paid print orders · offline fulfilment</h3>
                {toShip.length === 0 ? <p className="mt-2 text-sm text-ink-700">No paid print orders.</p> :
                  <ul className="mt-4 flex flex-col gap-3">{toShip.map((o) => <Card key={o.id} o={o} />)}</ul>}</div>
              {rest.length > 0 && <div><h3 className="font-display text-xl text-ink-900">Other orders</h3>
                <ul className="mt-4 flex flex-col gap-3">{rest.map((o) => <Card key={o.id} o={o} />)}</ul></div>}
            </div>
          )}
    </section>
  );
}
