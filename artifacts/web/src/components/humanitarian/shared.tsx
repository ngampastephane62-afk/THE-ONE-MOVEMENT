import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FlaskConical, Loader2, RotateCw, XCircle } from 'lucide-react';
import {
  useGetHumanitarianConfig, useCreateHumanitarianCheckout, useGetHumanitarianPaymentStatus,
  useCreateHumanitarianOffer, getGetHumanitarianPaymentStatusQueryKey,
  type GetHumanitarianPaymentStatus200, type HumanitarianCheckoutInputCurrency, type HumanitarianOfferInputKind,
} from '@workspace/api-client-react';

export type Currency = HumanitarianCheckoutInputCurrency;
const PRESETS: Record<Currency, number[]> = { usd: [100, 1000, 2500, 5000, 10000], aed: [200, 3700, 10000, 20000, 50000] };

export const fmt = (cents: number, c: Currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c.toUpperCase(), maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

const REQ_KEY = 'tomi-donation-request';
/** Reuse the same requestId for the same amount+currency across a cancel/return, so a retry can never create a second charge. */
function stableRequestId(key: string): string {
  try {
    const saved = JSON.parse(sessionStorage.getItem(REQ_KEY) ?? 'null') as { key: string; id: string } | null;
    if (saved && saved.key === key) return saved.id;
    const id = newId();
    sessionStorage.setItem(REQ_KEY, JSON.stringify({ key, id }));
    return id;
  } catch { return newId(); }
}

/** Clear the stored request only after the server reports a terminal outcome for that exact amount+currency, so a new donation of the same amount gets a fresh request. */
export function clearRequestFor(key: string | null) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(REQ_KEY) ?? 'null') as { key: string } | null;
    if (saved && (key === null || saved.key === key)) sessionStorage.removeItem(REQ_KEY);
  } catch { /* storage unavailable */ }
}

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-req`);

export function useConfig() {
  return useGetHumanitarianConfig();
}

export function TestModeBanner() {
  const q = useConfig();
  if (!q.data) return null;
  if (!q.data.available) return (
    <p className="flex items-start gap-2 border-l-2 border-gold-500 bg-gold-500/10 px-4 py-3 text-sm text-ink-800" role="status" data-testid="status-checkout-unavailable">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />Online payment is currently unavailable. {q.data.reason}
    </p>
  );
  if (q.data.testMode) return (
    <p className="flex items-start gap-2 border-l-2 border-lagoon-600 bg-lagoon-600/10 px-4 py-3 text-sm text-ink-800" role="status" data-testid="status-test-mode">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-700" />Test mode. Checkout uses Stripe test cards only. No real money moves and no test payment is a real donation.
    </p>
  );
  return null;
}

/** One-time Stripe checkout. requestId is stable across retries of the same submission and renewed when kind, amount or currency change. */
export function CheckoutPanel({ kind }: { kind: 'donation' }) {
  const cfg = useConfig();
  const checkout = useCreateHumanitarianCheckout();
  const [currency, setCurrency] = useState<Currency>('usd');
  const [preset, setPreset] = useState<number | null>(100);
  const [custom, setCustom] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [arrange, setArrange] = useState(false);
  const [conflict, setConflict] = useState(false);
  const reqRef = useRef<{ key: string; id: string } | null>(null);
  const busy = useRef(false);

  const c = cfg.data;
  const minimum = currency === 'usd' ? (c?.minimumUsd ?? 100) : (c?.minimumAed ?? 200);
  const numericInput = custom.replace(/\s/g, '');
  const parsedAmount = /^\d+(?:[.,]\d{1,2})?$/.test(numericInput) ? Number(numericInput.replace(',', '.')) : NaN;
  const amount = preset ?? Math.round(parsedAmount * 100);
  const cur = currency;
  const valid = Number.isSafeInteger(amount) && amount >= minimum;
  const large = valid && amount > 99_999_999;
  const disabled = (!large && !c?.available) || !valid || !accepted || checkout.isPending;

  useEffect(() => { setError(''); setArrange(false); setConflict(false); }, [amount, cur]);

  async function submit() {
    if (disabled || busy.current) return;
    if (large) { setArrange(true); return; }
    busy.current = true;
    const key = `${kind}:${amount}:${cur}`;
    if (!reqRef.current || reqRef.current.key !== key) reqRef.current = { key, id: stableRequestId(key) };
    setError('');
    try {
      const r = await checkout.mutateAsync({ data: { kind, amount, currency: cur, accepted: true, requestId: reqRef.current.id } });
      window.location.assign(r.url);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 409) { setConflict(true); setError('This donation request has already finished (paid, expired or closed). To give again, start a new donation.'); }
      else setError(status === 401 ? 'Please sign in with a verified account first.' : 'Secure checkout did not open. You can try again; the same request is reused, so a retry cannot create a duplicate charge.');
      busy.current = false;
    }
  }

  if (cfg.isLoading) return <div className="h-80 animate-pulse bg-ivory-200" aria-busy="true" />;
  if (cfg.isError) return (
    <div className="flex items-center gap-3 border border-crimson-700/30 bg-crimson-700/5 p-5" role="alert">
      <p className="text-sm text-crimson-700">Payment settings could not be loaded.</p>
      <button onClick={() => cfg.refetch()} className="inline-flex min-h-11 items-center gap-1.5 bg-lagoon-900 px-4 py-2 text-xs uppercase tracking-wider text-ivory-100" data-testid="button-retry-config"><RotateCw className="h-3.5 w-3.5" />Retry</button>
    </div>
  );

  return (
    <div className="border border-gold-500/40 bg-ivory-50 p-6 sm:p-8" data-testid={`panel-checkout-${kind}`}>
      <TestModeBanner />
      <>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-eyebrow text-gold-700">CHOOSE YOUR DONATION AMOUNT</p>
            <div className="flex border border-sand-300" role="radiogroup" aria-label="Currency">
              {(['usd', 'aed'] as const).map((x) => (
                <button key={x} role="radio" aria-checked={currency === x} onClick={() => { setCurrency(x); setPreset(x === 'usd' ? 100 : 200); setCustom(''); }}
                  className={`min-h-11 min-w-14 px-4 text-xs font-semibold tracking-wider ${currency === x ? 'bg-lagoon-900 text-ivory-100' : 'text-ink-700'}`} data-testid={`button-currency-${x}`}>{x.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-800" data-testid="text-donation-separate">Each donation is a separate payment. No recurring charge will be made. You are charged exactly the amount shown, in {currency.toUpperCase()}; TOMI applies no currency conversion.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PRESETS[currency].map((p) => (
              <button key={p} onClick={() => { setPreset(p); setCustom(''); }} aria-pressed={preset === p}
                className={`min-h-11 border py-3 font-display text-base sm:text-lg transition-colors ${preset === p ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-900 hover:border-gold-500'}`} data-testid={`button-preset-${p}`}>{fmt(p, currency)}</button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-ink-800">Other amount ({currency.toUpperCase()})
            <input inputMode="decimal" value={custom} onChange={(e) => { setCustom(e.target.value); setPreset(null); }}
              placeholder={`Minimum ${fmt(minimum, currency)}`} className="mt-1 w-full border border-sand-300 bg-ivory-50 min-h-11 px-3 py-2.5 text-base text-ink-900 focus:border-lagoon-600 focus:outline-none" data-testid="input-custom-amount" />
          </label>
          {preset === null && custom && !valid && <p className="mt-1 text-xs text-crimson-700">Enter at least {fmt(minimum, currency)}.</p>}
          <p className="mt-3 text-xs leading-relaxed text-ink-700">Minimums: {fmt(c?.minimumUsd ?? 100, 'usd')} or {fmt(c?.minimumAed ?? 200, 'aed')}. Stripe requires at least AED 2 per card payment, so smaller AED amounts cannot be processed.</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-800">There is no TOMI fundraising cap. Major gifts, including US$1 million or more, can be proposed for coordinated payment arrangements. No money is collected by an offer form.</p>
          {large && <p className="mt-4 border-l-2 border-gold-500 bg-gold-500/10 p-4 text-sm text-ink-800" data-testid="status-major-contribution">This amount needs coordination rather than online card checkout. Submit your offer so TOMI can discuss eligibility, due diligence and payment arrangements with you. No bank details or transfer instructions are published here.</p>}
      </>

      <label className="mt-5 flex items-start gap-2.5 text-sm text-ink-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(187_67%_12%)]" data-testid="checkbox-accept-terms" />
        <span>I understand each donation is a separate payment collected by {c?.collector ?? 'The One Movement International'}. TOMI decides how the fund is allocated according to emergency; I am not choosing a specific project. No recurring charge and no tax-deduction receipt is offered.</span>
      </label>
      {error && <p className="mt-3 text-sm text-crimson-700" role="alert" data-testid="text-checkout-error">{error}</p>}
      {conflict && <button type="button" onClick={() => { clearRequestFor(`${kind}:${amount}:${cur}`); reqRef.current = null; setAccepted(false); setConflict(false); setError(''); }} className="mt-3 inline-flex min-h-11 items-center border border-lagoon-900 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100" data-testid="button-start-new-donation">Start a new donation</button>}
      <button onClick={submit} disabled={disabled}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-lagoon-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-ivory-100 transition-colors hover:bg-lagoon-800 disabled:cursor-not-allowed disabled:opacity-40" data-testid={`button-checkout-${kind}`}>
        {checkout.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {large ? 'Coordinate this contribution' : !c?.available ? 'Checkout unavailable' : checkout.isPending ? 'Opening secure checkout' : `${c?.testMode ? 'Test checkout' : 'Continue to Stripe'} · ${valid ? fmt(amount, cur) : '—'}`}
      </button>
      {arrange && <div className="mt-6" data-testid="panel-major-contribution"><OfferForm financialContribution={fmt(amount, cur)} /></div>}
    </div>
  );
}

const MAX_TRIES = 15;

function safeAmount(x: GetHumanitarianPaymentStatus200): string | null {
  const c = typeof x.currency === 'string' ? x.currency.toLowerCase() : '';
  if ((c !== 'usd' && c !== 'aed') || typeof x.amount !== 'number' || !Number.isSafeInteger(x.amount) || x.amount <= 0) return null;
  return fmt(x.amount, c);
}

export function PaymentReturn({ sessionId, cancelled }: { sessionId: string | null; cancelled: boolean }) {
  const [tries, setTries] = useState(0);
  const enabled = !!sessionId;
  const q = useGetHumanitarianPaymentStatus({ session_id: sessionId ?? '' }, {
    query: {
      enabled,
      queryKey: getGetHumanitarianPaymentStatusQueryKey({ session_id: sessionId ?? '' }),
      refetchInterval: (query) => (query.state.data?.status === 'pending' && tries < MAX_TRIES ? 3000 : false),
      retry: 1,
    },
  });
  const status = q.data?.status;
  useEffect(() => { if (q.dataUpdatedAt) setTries((t) => t + 1); }, [q.dataUpdatedAt]);
  const d = q.data;
  useEffect(() => {
    if (!d || d.status === 'pending') return;
    const c = d.currency?.toLowerCase();
    if (typeof d.amount === 'number' && (c === 'usd' || c === 'aed')) clearRequestFor(`donation:${d.amount}:${c}`);
  }, [d]);

  if (cancelled && !sessionId) return (
    <Notice icon={<XCircle className="h-5 w-5 text-gold-700" />} title="Checkout cancelled" testId="status-payment-cancelled">
      Payment not confirmed — no new payment was taken automatically. <a href="#give" className="font-semibold underline underline-offset-4" data-testid="link-retry-donation">Return to the donation form</a>; the same amount and currency reuse the same request, so trying again cannot create a duplicate charge.
    </Notice>
  );
  if (!sessionId) return null;
  if (q.isError) return (
    <Notice icon={<AlertTriangle className="h-5 w-5 text-crimson-700" />} title="We could not check this payment" testId="status-payment-error">
      We cannot verify the payment status right now, so we cannot say whether a charge was made. Please do not pay again yet. <button className="min-h-11 underline" onClick={() => { setTries(0); q.refetch(); }} data-testid="button-retry-status">Check again</button>
    </Notice>
  );
  if (!q.data || status === 'pending') return (
    <Notice icon={tries >= MAX_TRIES ? <Clock className="h-5 w-5 text-gold-700" /> : <Loader2 className="h-5 w-5 animate-spin text-lagoon-700" />} title={tries >= MAX_TRIES ? 'Still awaiting confirmation' : 'Confirming with Stripe'} testId="status-payment-pending">
      {tries >= MAX_TRIES
        ? <>Not confirmed yet — this is not a success. Please do not pay again. <button className="min-h-11 underline" onClick={() => { setTries(0); q.refetch(); }} data-testid="button-recheck-status">Check again</button></>
        : 'A donation is recorded as received only after Stripe confirms it on our server.'}
    </Notice>
  );
  const x = q.data;
  if (status === 'paid' && typeof x.testMode !== 'boolean') return (
    <Notice icon={<Clock className="h-5 w-5 text-gold-700" />} title="Verification incomplete" testId="status-payment-unverified">
      The payment mode could not be verified yet, so this is not shown as a confirmed donation. Please do not pay again. <button className="min-h-11 underline" onClick={() => { setTries(0); q.refetch(); }} data-testid="button-recheck-mode">Check again</button>
    </Notice>
  );
  if (status === 'paid') {
    const test = x.testMode === true;
    const amount = safeAmount(x);
    const ref = typeof x.reference === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(x.reference) ? x.reference : null;
    return (
      <div className="mx-auto max-w-5xl px-6 pt-8" role="status" data-testid="status-payment-paid">
        <div className="hum-confirm relative overflow-hidden border border-gold-500/50 bg-lagoon-900 p-7 text-ivory-100 sm:p-10">
          {test && <p className="mb-5 flex items-start gap-2 border-l-2 border-coral-500 bg-ink-900/40 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ivory-100" data-testid="text-test-payment"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" />TEST PAYMENT — NO REAL DONATION RECEIVED. No money was collected.</p>}
          <CheckCircle2 className="h-7 w-7 text-gold-400" />
          <p className="mt-4 font-display text-2xl tracking-wide sm:text-3xl">{test ? 'TEST CHECKOUT CONFIRMED.' : 'THANK YOU FOR YOUR GENEROSITY.'}</p>
          <p className="mt-2 text-eyebrow text-gold-400">{test ? 'STRIPE TEST MODE' : 'YOUR CONTRIBUTION HAS BEEN RECEIVED.'}</p>
          <dl className="mt-7 grid gap-px bg-gold-500/25 sm:grid-cols-3">
            <div className="bg-lagoon-900 py-3 sm:pr-4"><dt className="text-xs uppercase tracking-wider text-ivory-300">Status</dt><dd className="mt-1 font-display text-lg" data-testid="text-confirm-status">{test ? 'Test · confirmed' : 'Confirmed'}</dd></div>
            <div className="bg-lagoon-900 py-3 sm:px-4"><dt className="text-xs uppercase tracking-wider text-ivory-300">Amount</dt><dd className="mt-1 font-display text-lg" data-testid="text-confirm-amount">{amount ?? 'Shown on your Stripe receipt'}</dd></div>
            <div className="bg-lagoon-900 py-3 sm:pl-4"><dt className="text-xs uppercase tracking-wider text-ivory-300">Reference</dt><dd className="mt-1 break-all font-mono text-sm" data-testid="text-confirm-reference">{ref ?? '—'}</dd></div>
          </dl>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ivory-300">TOMI allocates the fund according to need; this gift is not earmarked to a specific project. No tax-deduction receipt is claimed. Each donation is separate — nothing recurs.</p>
          <a href="#top" className="mt-6 inline-flex min-h-11 items-center gap-2 border border-gold-500 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 hover:bg-gold-500 hover:text-ink-900" data-testid="link-confirm-return">Return to the page <ArrowRight className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    );
  }
  if (status === 'refunded') return (
    <Notice icon={<RotateCw className="h-5 w-5 text-lagoon-700" />} title="Payment refunded" testId="status-payment-refunded">
      {x.testMode === true ? 'This test payment was refunded. ' : 'This donation was refunded to the original payment method. '}{safeAmount(x) && <>Amount: {safeAmount(x)}. </>}Refund timing depends on your card issuer.
    </Notice>
  );
  if (status === 'failed') return (
    <Notice icon={<XCircle className="h-5 w-5 text-crimson-700" />} title="Payment failed" testId="status-payment-failed">
      Stripe reported that this payment did not succeed, so no donation was received. If your bank shows a pending hold, it is normally released by the issuer. <a href="#give" className="font-semibold underline underline-offset-4" data-testid="link-retry-donation">Start a new donation</a>
    </Notice>
  );
  return (
    <Notice icon={<XCircle className="h-5 w-5 text-gold-700" />} title="Checkout expired" testId="status-payment-expired">
      Stripe reports this checkout session expired before payment was completed; no donation was received. <a href="#give" className="font-semibold underline underline-offset-4" data-testid="link-retry-donation">Start a new donation</a>
    </Notice>
  );
}

function Notice({ icon, title, children, testId }: { icon: React.ReactNode; title: string; children: React.ReactNode; testId: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-8" role="status" data-testid={testId}>
      <div className="flex items-start gap-3 border border-gold-500/40 bg-ivory-50 p-5">
        {icon}<div><p className="font-display text-lg text-ink-900">{title}</p><p className="mt-1 text-sm text-ink-800">{children}</p></div>
      </div>
    </div>
  );
}

export function useReturnParams() {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  return { sessionId: p.get('session_id'), cancelled: p.get('cancelled') === '1' || p.get('payment') === 'cancelled' };
}

const KINDS: { v: HumanitarianOfferInputKind; l: string; d: string }[] = [
  { v: 'goods', l: 'Goods', d: 'School supplies, clothing, hygiene kits, food' },
  { v: 'equipment', l: 'Equipment', d: 'Furniture, computers, medical or building equipment' },
  { v: 'logistics', l: 'Logistics', d: 'Transport, storage, customs or field support' },
  { v: 'financial', l: 'Financial contribution', d: 'A major gift or coordinated payment arrangement' },
];

export function OfferForm({ financialContribution }: { financialContribution?: string } = {}) {
  const m = useCreateHumanitarianOffer();
  const [f, setF] = useState({ kind: (financialContribution ? 'financial' : 'goods') as HumanitarianOfferInputKind, fullName: '', email: '', country: '', description: financialContribution ? `Proposed financial contribution: ${financialContribution}. Please contact me to discuss coordinated payment arrangements. No funds have been transferred.` : '', website: '' });
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const ok = f.fullName.trim().length >= 2 && /.+@.+\..+/.test(f.email) && f.country.trim().length >= 2 && f.description.trim().length >= 20 && accepted;
  const inp = 'mt-1 w-full border border-sand-300 bg-ivory-50 px-3 py-2.5 text-ink-900 focus:border-lagoon-600 focus:outline-none';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || m.isPending) return;
    setErr('');
    try {
      const r = await m.mutateAsync({ data: { kind: f.kind, fullName: f.fullName.trim(), email: f.email.trim(), country: f.country.trim(), description: f.description.trim(), accepted: true, website: f.website } });
      setDone(r.id);
    } catch {
      setErr('Your offer could not be sent. Your text is kept below; please try again.');
    }
  }

  if (done !== null) return (
    <div className="border border-lagoon-600/40 bg-lagoon-600/5 p-8" role="status" data-testid="status-offer-sent">
      <CheckCircle2 className="h-6 w-6 text-lagoon-700" />
      <p className="mt-3 font-display text-xl text-ink-900">Offer received. Reference #{done}.</p>
      <p className="mt-2 text-sm text-ink-800">The TOMI team will review your offer and contact you by email. This is not a payment receipt. Do not transfer money or ship anything before arrangements are confirmed with you.</p>
      <button className="mt-4 text-sm font-semibold text-lagoon-700 underline" onClick={() => { setDone(null); setF({ ...f, description: '' }); setAccepted(false); }} data-testid="button-offer-another">Send another offer</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 border border-sand-200 bg-ivory-50 p-6 sm:p-8" data-testid="form-offer">
      <fieldset>
        <legend className="text-sm text-ink-800">What can you offer?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {KINDS.map((k) => (
            <label key={k.v} className={`cursor-pointer border p-3 text-sm ${f.kind === k.v ? 'border-lagoon-900 bg-lagoon-900 text-ivory-100' : 'border-sand-300 text-ink-800 hover:border-gold-500'}`}>
              <input type="radio" name="kind" value={k.v} checked={f.kind === k.v} onChange={() => setF({ ...f, kind: k.v })} className="sr-only" data-testid={`radio-offer-${k.v}`} />
              <span className="block font-semibold">{k.l}</span><span className="mt-1 block text-xs opacity-80">{k.d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink-800">Full name<input className={inp} maxLength={120} value={f.fullName} onChange={set('fullName')} data-testid="input-offer-name" /></label>
        <label className="text-sm text-ink-800">Email<input type="email" className={inp} maxLength={254} value={f.email} onChange={set('email')} data-testid="input-offer-email" /></label>
      </div>
      <label className="text-sm text-ink-800">Country<input className={inp} maxLength={90} value={f.country} onChange={set('country')} data-testid="input-offer-country" /></label>
      <label className="text-sm text-ink-800">Describe the offer (quantity, condition, location, timing)
        <textarea className={`${inp} min-h-32`} maxLength={3000} value={f.description} onChange={set('description')} data-testid="input-offer-description" />
        <span className="mt-1 block text-xs text-ink-700">{f.description.trim().length < 20 ? `At least 20 characters (${f.description.trim().length}/20)` : `${f.description.length}/3000`}</span>
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      <p className="flex items-start gap-2 border-l-2 border-coral-500 pl-3 text-sm text-ink-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" />Do not ship goods or equipment before TOMI has coordinated the delivery with you in writing.</p>
      <label className="flex items-start gap-2.5 text-sm text-ink-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 accent-[hsl(187_67%_12%)]" data-testid="checkbox-offer-consent" />
        <span>I agree that TOMI stores these personal details and uses them only to contact me about this offer.</span>
      </label>
      {err && <p className="text-sm text-crimson-700" role="alert" data-testid="text-offer-error">{err}</p>}
      <button type="submit" disabled={!ok || m.isPending} className="inline-flex items-center justify-center gap-2 bg-lagoon-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-ivory-100 hover:bg-lagoon-800 disabled:opacity-40" data-testid="button-submit-offer">
        {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Send offer
      </button>
    </form>
  );
}
