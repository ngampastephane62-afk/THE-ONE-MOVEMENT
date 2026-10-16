import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMagazineOrder, useCheckoutMagazineOrder, getGetMagazineOrdersQueryKey, type MagazineConfig } from '@workspace/api-client-react';
import { FileText, Package, Lock, AlertTriangle, Check } from 'lucide-react';
import { useMagazineKeys, newRequestId, inputCls, labelCls, primaryBtn } from './shared';

type Format = 'digital' | 'print';

export default function OrderForm({ config, initialFormat }: { config: MagazineConfig; initialFormat: Format }) {
  const keys = useMagazineKeys();
  const qc = useQueryClient();
  const [format, setFormat] = useState<Format>(initialFormat);
  const [accepted, setAccepted] = useState(false);
  const [ship, setShip] = useState({ fullName: '', address: '', country: '', phone: '' });
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [owned, setOwned] = useState(false);
  const reqRef = useRef<{ sig: string; id: string } | null>(null);
  const create = useCreateMagazineOrder();
  const checkout = useCheckoutMagazineOrder();
  const busy = create.isPending || checkout.isPending;
  const paymentsOff = !config.available;

  const shipValid = ship.fullName.trim().length >= 2 && ship.address.trim().length >= 10 && ship.country.trim().length >= 2 && ship.phone.trim().length >= 5;
  const canSubmit = keys.signedIn && accepted && !busy && (format === 'print' ? shipValid : !paymentsOff);

  const requestIdFor = (sig: string) => {
    if (!reqRef.current || reqRef.current.sig !== sig) reqRef.current = { sig, id: newRequestId() };
    return reqRef.current.id;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null); setDone(false);
    const shipping = format === 'print' ? { fullName: ship.fullName.trim(), address: ship.address.trim(), country: ship.country.trim(), phone: ship.phone.trim() } : undefined;
    const sig = JSON.stringify({ format, shipping });
    const requestId = requestIdFor(sig);
    create.mutate({ data: { format, requestId, accepted: true, shipping } }, {
      onSuccess: (order) => {
        qc.invalidateQueries({ queryKey: getGetMagazineOrdersQueryKey() });
        if (format === 'print') { setDone(true); reqRef.current = null; setShip({ fullName: '', address: '', country: '', phone: '' }); setAccepted(false); return; }
        if (order.canDownload || order.status === 'paid') { reqRef.current = null; setErr(null); setDone(false); setOwned(true); return; }
        if (paymentsOff) { setErr('Payments are closed. Your order is kept; no money was collected.'); return; }
        checkout.mutate({ id: order.id, data: { accepted: true, expectedTotal: order.totalAmount! } }, {
          onSuccess: (r) => { reqRef.current = null; window.location.assign(r.url); },
          onError: () => setErr('Your order was saved, but checkout could not open. You can resume it from your orders below.'),
        });
      },
      onError: () => setErr('The order could not be saved. Please try again — retrying will not create a duplicate.'),
    });
  };

  const opt = (f: Format, title: string, price: string, note: string, Icon: typeof FileText) => (
    <button type="button" role="radio" aria-checked={format === f} onClick={() => { setFormat(f); setDone(false); setErr(null); }} data-testid={`button-format-${f}`}
      className={`group relative flex flex-1 flex-col items-start gap-2 border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${format === f ? 'border-ink-900 bg-ivory-50' : 'border-ink-900/15 hover:border-ink-900/40'}`}>
      <span className="flex w-full items-center justify-between"><Icon className="h-5 w-5 text-lagoon-600" aria-hidden="true" />
        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${format === f ? 'border-ink-900 bg-ink-900' : 'border-ink-900/30'}`}>{format === f && <Check className="h-3 w-3 text-ivory-50" />}</span></span>
      <span className="font-display text-xl text-ink-900">{title}</span>
      <span className="font-display text-3xl text-ink-900">{price}</span>
      <span className="text-xs leading-relaxed text-ink-700">{note}</span>
    </button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" aria-labelledby="order-heading" noValidate>
      <div>
        <p className="text-eyebrow text-gold-600">ORDER</p>
        <h2 id="order-heading" className="mt-2 font-display text-3xl text-ink-900">Choose your edition.</h2>
      </div>
      <div role="radiogroup" aria-label="Format" className="flex flex-col gap-3 sm:flex-row">
        {opt('digital', 'Digital PDF', `${config.digitalUsd} USD`, 'One-time purchase. Private download after verified payment.', FileText)}
        {opt('print', 'Printed copy', `${config.printUsd} USD`, `+ shipping, ${config.shippingMinUsd}–${config.shippingMaxUsd} USD. Exact quote confirmed before payment.`, Package)}
      </div>

      {paymentsOff && (
        <div role="status" className="flex gap-3 border-l-2 border-gold-500 bg-gold-50 px-4 py-3 text-sm text-ink-800" data-testid="notice-payments-unavailable">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
          <span><strong className="font-semibold">Live payments are not open yet.</strong> {format === 'digital' ? 'Digital checkout is disabled. No money will be collected and no test download is offered.' : 'You can still request a shipping quote; payment opens later.'}{config.reason ? <span className="mt-1 block text-xs text-ink-700">{config.reason}</span> : null}</span>
        </div>
      )}

      {format === 'print' && (
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-display text-lg text-ink-900">Delivery details</legend>
          <label className="flex flex-col gap-1"><span className={labelCls}>Full name</span>
            <input className={inputCls} value={ship.fullName} maxLength={120} autoComplete="name" onChange={(e) => setShip({ ...ship, fullName: e.target.value })} data-testid="input-ship-name" /></label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Phone</span>
            <input className={inputCls} type="tel" value={ship.phone} maxLength={40} autoComplete="tel" onChange={(e) => setShip({ ...ship, phone: e.target.value })} data-testid="input-ship-phone" /></label>
          <label className="flex flex-col gap-1 sm:col-span-2"><span className={labelCls}>Full postal address</span>
            <textarea className={`${inputCls} min-h-20 resize-y`} value={ship.address} maxLength={1000} autoComplete="street-address" onChange={(e) => setShip({ ...ship, address: e.target.value })} data-testid="input-ship-address" /></label>
          <label className="flex flex-col gap-1"><span className={labelCls}>Country</span>
            <input className={inputCls} value={ship.country} maxLength={80} autoComplete="country-name" onChange={(e) => setShip({ ...ship, country: e.target.value })} data-testid="input-ship-country" /></label>
          <p className="self-end text-xs leading-relaxed text-ink-700">We confirm whether and how we can ship to your address with the quote. Nothing is charged now.</p>
        </fieldset>
      )}

      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-accept" />
        <span>
          {format === 'digital'
            ? <span>I understand this is a one-time purchase of the 10-page Tropik Magazine 2026 presentation PDF, not a subscription or a full reader issue.</span>
            : <span>I understand this is a request: nothing is charged until I see and accept the total including the exact shipping quote.</span>}{' '}
          <span>I have read the</span> <Link href="/terms" className="underline underline-offset-4 text-lagoon-700">Terms</Link> <span>and</span> <Link href="/privacy-policy" className="underline underline-offset-4 text-lagoon-700">Privacy Policy</Link>.
        </span>
      </label>

      {err && <p role="alert" className="text-sm text-crimson-700" data-testid="text-order-error">{err}</p>}
      {owned && <p role="status" className="border-l-2 border-lagoon-600 bg-lagoon-50 px-4 py-3 text-sm text-lagoon-900" data-testid="text-already-owned">You already own this PDF. Download it from your orders below.</p>}
      {done && <p role="status" className="border-l-2 border-lagoon-600 bg-lagoon-50 px-4 py-3 text-sm text-lagoon-900" data-testid="text-quote-requested">Quote requested. We will set the exact shipping cost; you will see the total in your orders before any payment.</p>}

      {!keys.signedIn ? (
        <div className="flex flex-col gap-3 border border-ink-900/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-ink-800"><Lock className="h-4 w-4 text-lagoon-600" aria-hidden="true" />Sign in with a verified account to order.</p>
          <Link href="/sign-in" className={primaryBtn} data-testid="link-sign-in-order">Sign in</Link>
        </div>
      ) : (
        <button type="submit" className={primaryBtn} disabled={!canSubmit} data-testid="button-submit-order">
          {busy ? 'Please wait…' : format === 'digital' ? (paymentsOff ? 'Checkout unavailable' : `Pay ${config.digitalUsd} USD securely`) : 'Request shipping quote'}
        </button>
      )}
      <p className="text-xs text-ink-700">Receipts and updates go to the primary email on your account. Payments are processed by Stripe.</p>
    </form>
  );
}
