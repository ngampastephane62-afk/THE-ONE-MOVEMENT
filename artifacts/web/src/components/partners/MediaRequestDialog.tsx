import { useState } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useCreateMediaRequest, type MediaOutletRef } from './types';
import { outletFormats } from './util';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Errors = Partial<Record<'format' | 'contactName' | 'email' | 'organizationName' | 'country' | 'message' | 'consent' | 'form', string>>;

export default function MediaRequestDialog({ outlet, onClose }: { outlet: MediaOutletRef; onClose: () => void }) {
  const create = useCreateMediaRequest();
  const formats = outletFormats(outlet.formats);
  const [v, setV] = useState({ format: formats[0], contactName: '', email: '', organizationName: '', country: '', message: '', website: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [receipt, setReceipt] = useState<{ id: number; status: string } | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!formats.includes(v.format)) er.format = 'Choose a listed format.';
    if (v.contactName.trim().length < 2) er.contactName = 'Enter your full name.';
    if (!EMAIL.test(v.email.trim())) er.email = 'Enter a valid email address.';
    if (v.organizationName.trim().length < 2) er.organizationName = 'Enter your organization or brand name.';
    if (v.country.trim().length < 2) er.country = 'Enter your country.';
    const len = v.message.trim().length;
    if (len < 10 || len > 800) er.message = 'Your brief must be between 10 and 800 characters.';
    if (!consent) er.consent = 'Please confirm consent before sending.';
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      const r = await create.mutateAsync({ data: {
        outletId: outlet.id, format: v.format, contactName: v.contactName.trim(), email: v.email.trim(),
        organizationName: v.organizationName.trim(), country: v.country.trim(), message: v.message.trim(),
        consentAccepted: true, website: v.website,
      } });
      setReceipt(r);
    } catch {
      setErrors({ form: 'Your enquiry could not be sent. Please check your details and try again.' });
    }
  };

  const fieldCls = 'mt-1 w-full rounded-sm border border-sand-300 bg-ivory-50 px-3 py-2.5 text-sm text-ink-900 focus:border-lagoon-700 focus:outline-none focus:ring-2 focus:ring-lagoon-700/20';
  const Err = ({ k }: { k: keyof Errors }) => errors[k] ? <p id={`err-${k}`} className="mt-1 text-xs text-crimson-700" role="alert">{errors[k]}</p> : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[hsl(187_45%_5%/0.7)] p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="mr-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-ivory-50 shadow-2xl sm:rounded-sm">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-sand-200 bg-ivory-50 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">Placement enquiry · reviewed by the CEO</p>
            <h2 id="mr-title" className="mt-1 text-2xl text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>{outlet.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" data-testid="button-close-request" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand-300 hover:border-lagoon-700" autoFocus><X className="h-4 w-4" /></button>
        </div>

        {receipt ? (
          <div className="px-6 py-8" data-testid="status-request-received">
            <CheckCircle2 className="h-8 w-8 text-lagoon-700" />
            <h3 className="mt-4 text-xl text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>Enquiry received</h3>
            <p className="mt-2 text-sm text-ink-800">Reference <span className="font-mono font-semibold" data-testid="text-receipt-id">MR-{receipt.id}</span> · status: {receipt.status.replace('_', ' ')}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              The CEO will review your request personally and may contact you by email. Nothing has been purchased or charged, and receiving this reference does not confirm availability, price, timing or publication. Editorial decisions remain with each outlet.
            </p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-lagoon-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-ivory-50" data-testid="button-done-request">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4 px-6 py-6">
            <p className="text-sm leading-relaxed text-ink-700">No checkout and no payment here. Your brief goes to the CEO, who reviews every enquiry and discusses terms directly. Publication is never guaranteed.</p>
            <div className="absolute -left-[9999px]" aria-hidden>
              <label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} /></label>
            </div>
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-widest text-ink-800">Format listed in the catalogue</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {formats.map((f) => (
                  <label key={f} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wider ${v.format === f ? 'border-lagoon-900 bg-lagoon-900 text-ivory-50' : 'border-sand-300 text-ink-800'}`}>
                    <input type="radio" name="format" value={f} checked={v.format === f} onChange={set('format')} className="sr-only" data-testid={`radio-format-${f}`} />{f}
                  </label>
                ))}
              </div>
              <Err k="format" />
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-ink-800">Full name<input className={fieldCls} value={v.contactName} onChange={set('contactName')} autoComplete="name" aria-invalid={!!errors.contactName} aria-describedby="err-contactName" data-testid="input-contact-name" /><Err k="contactName" /></label>
              <label className="text-xs font-semibold text-ink-800">Email<input type="email" className={fieldCls} value={v.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} aria-describedby="err-email" data-testid="input-email" /><Err k="email" /></label>
              <label className="text-xs font-semibold text-ink-800">Organization or brand<input className={fieldCls} value={v.organizationName} onChange={set('organizationName')} autoComplete="organization" aria-invalid={!!errors.organizationName} aria-describedby="err-organizationName" data-testid="input-organization" /><Err k="organizationName" /></label>
              <label className="text-xs font-semibold text-ink-800">Country<input className={fieldCls} value={v.country} onChange={set('country')} autoComplete="country-name" aria-invalid={!!errors.country} aria-describedby="err-country" data-testid="input-country" /><Err k="country" /></label>
            </div>
            <label className="text-xs font-semibold text-ink-800">Your brief
              <textarea className={`${fieldCls} min-h-32`} maxLength={800} value={v.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby="err-message brief-count" data-testid="input-message" placeholder="What would you like to communicate, and when?" />
              <span id="brief-count" className="mt-1 block text-right font-normal text-ink-500">{v.message.trim().length} / 800</span>
              <Err k="message" />
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-800">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-consent" />
              <span>I agree that The One Movement International and Tropik Agency may store these details and contact me about this enquiry. I understand this is not a purchase and publication is not guaranteed.</span>
            </label>
            <Err k="consent" />
            {errors.form && <p className="rounded-sm border border-crimson-700/30 bg-crimson-700/5 p-3 text-sm text-crimson-700" role="alert">{errors.form}</p>}
            <button type="submit" disabled={create.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ivory-50 hover:bg-lagoon-800 disabled:opacity-60" data-testid="button-submit-request">
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Send for review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
