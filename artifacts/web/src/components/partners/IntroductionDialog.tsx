import { useRef, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { HistoryPartner } from '@/lib/partner-history';
import { IntroError, isIntroTarget, leaderFor, useCreatePartnerIntroduction } from './introductions';

const field = 'mt-1 w-full rounded-md border border-sand-300 bg-ivory-50 px-3 py-2.5 text-sm text-ink-900 focus:border-lagoon-600 focus:outline-none focus:ring-2 focus:ring-lagoon-600/20 aria-[invalid=true]:border-crimson-700';
const lbl = 'block text-xs font-semibold uppercase tracking-[0.14em] text-ink-700';

type Form = { contactName: string; organizationName: string; country: string; email: string; message: string; consent: boolean; website: string };
const EMPTY: Form = { contactName: '', organizationName: '', country: '', email: '', message: '', consent: false, website: '' };

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.contactName.trim() || f.contactName.length > 120) e.contactName = 'Enter your name (up to 120 characters).';
  if (!f.organizationName.trim() || f.organizationName.length > 160) e.organizationName = 'Enter your organisation (up to 160 characters).';
  if (!f.country.trim() || f.country.length > 90) e.country = 'Enter your country.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.email.length > 254) e.email = 'Enter a valid email address.';
  const m = f.message.trim().length;
  if (m < 10 || m > 800) e.message = 'Describe your request in 10 to 800 characters.';
  if (!f.consent) e.consent = 'Please accept to continue.';
  return e;
}

export default function IntroductionDialog({ partner, open, onOpenChange }: { partner: HistoryPartner; open: boolean; onOpenChange: (v: boolean) => void }) {
  const leader = leaderFor(partner.id);
  const valid = isIntroTarget(partner.id);
  const create = useCreatePartnerIntroduction();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [serverError, setServerError] = useState('');
  const [receipt, setReceipt] = useState<number | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((o) => ({ ...o, [k]: v }));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (create.isPending || !valid) return;
    const e = validate(f);
    setErrors(e);
    setServerError('');
    if (Object.keys(e).length) {
      document.getElementById(`intro-${partner.id}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    create.mutate({
      partnerId: partner.id, contactName: f.contactName.trim(), organizationName: f.organizationName.trim(),
      country: f.country.trim(), email: f.email.trim(), message: f.message.trim(), consentAccepted: true, website: f.website,
    }, {
      onSuccess: (r) => { setReceipt(r.id); setF(EMPTY); },
      onError: (err) => {
        const s = err instanceof IntroError ? err.status : 0;
        setServerError(s === 429 ? 'Request limit reached. Please try again tomorrow.'
          : s === 400 || s === 422 ? 'Some details could not be accepted. Please check the form and try again.'
          : s === 404 ? 'This partner is not available for introduction requests.'
          : 'Your request could not be sent. Your details are kept; please try again.');
      },
    });
  };

  const close = (v: boolean) => { onOpenChange(v); if (!v && receipt) setReceipt(null); };
  const id = (k: string) => `intro-${partner.id}-${k}`;
  const err = (k: keyof Form) => errors[k] && <p id={`${id(k)}-err`} className="mt-1 text-xs text-crimson-700">{errors[k]}</p>;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-y-auto rounded-md border-sand-300 bg-ivory-50 p-0 sm:rounded-md" onOpenAutoFocus={(e) => { e.preventDefault(); firstRef.current?.focus(); }}>
        <div className="border-b border-sand-200 bg-lagoon-900 px-6 py-5 text-ivory-100">
          <DialogHeader className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">Request an introduction</p>
            <DialogTitle className="font-display text-2xl uppercase leading-tight text-ivory-100" translate="no">{partner.name}</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-ivory-200">
                {leader ? (
                  <p><span translate="no">{leader.name}</span> · <span>{leader.role}</span></p>
                ) : (
                  <p className="italic">Leadership details not yet confirmed</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        {receipt ? (
          <div className="px-6 py-8" role="status" data-testid="intro-receipt">
            <CheckCircle2 className="h-8 w-8 text-lagoon-700" aria-hidden />
            <h3 className="mt-3 font-display text-2xl uppercase text-ink-900">Request received</h3>
            <p className="mt-1 font-mono text-xs text-ink-600">PI-{receipt}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">The One Movement team will review your request and reply to the email you provided. This confirms receipt only; it does not guarantee an introduction or a meeting.</p>
            <button type="button" onClick={() => close(false)} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-lagoon-900 px-5 text-xs font-semibold uppercase tracking-widest text-ivory-50 hover:bg-lagoon-800">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 px-6 py-6" aria-busy={create.isPending} data-testid={`form-intro-${partner.id}`}>
            <p className="flex gap-2 rounded-md bg-ivory-100 p-3 text-xs leading-relaxed text-ink-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-700" aria-hidden />
              <span>Requests are handled by The One Movement, not forwarded directly to the partner or its leadership. The Movement decides whether and how to make an introduction.</span>
            </p>
            {!valid && <p className="text-sm text-crimson-700" role="alert">This partner is not available for introduction requests.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={id('contactName')} className={lbl}>Your name</label>
                <input ref={firstRef} id={id('contactName')} className={field} autoComplete="name" maxLength={120} value={f.contactName} onChange={(e) => set('contactName', e.target.value)} aria-invalid={!!errors.contactName} aria-describedby={errors.contactName ? `${id('contactName')}-err` : undefined} />
                {err('contactName')}
              </div>
              <div>
                <label htmlFor={id('organizationName')} className={lbl}>Your organisation</label>
                <input id={id('organizationName')} className={field} autoComplete="organization" maxLength={160} value={f.organizationName} onChange={(e) => set('organizationName', e.target.value)} aria-invalid={!!errors.organizationName} aria-describedby={errors.organizationName ? `${id('organizationName')}-err` : undefined} />
                {err('organizationName')}
              </div>
              <div>
                <label htmlFor={id('country')} className={lbl}>Country</label>
                <input id={id('country')} className={field} autoComplete="country-name" maxLength={90} value={f.country} onChange={(e) => set('country', e.target.value)} aria-invalid={!!errors.country} aria-describedby={errors.country ? `${id('country')}-err` : undefined} />
                {err('country')}
              </div>
              <div>
                <label htmlFor={id('email')} className={lbl}>Email for our reply</label>
                <input id={id('email')} type="email" className={field} autoComplete="email" maxLength={254} value={f.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id('email')}-err` : `${id('email')}-hint`} />
                {errors.email ? err('email') : <p id={`${id('email')}-hint`} className="mt-1 text-[11px] text-ink-600">Private. Used only by TOMI to reply.</p>}
              </div>
            </div>
            <div>
              <label htmlFor={id('message')} className={lbl}>Purpose of the introduction</label>
              <textarea id={id('message')} rows={5} maxLength={800} className={field} value={f.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={`${id('message')}-count${errors.message ? ` ${id('message')}-err` : ''}`} />
              <p id={`${id('message')}-count`} className="mt-1 text-right font-mono text-[11px] text-ink-600">{f.message.trim().length} / 800</p>
              {err('message')}
            </div>
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor={id('website')}>Website</label>
              <input id={id('website')} tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} />
            </div>
            <div>
              <label className="flex items-start gap-3 text-sm text-ink-800">
                <input id={id('consent')} type="checkbox" className="mt-1 h-4 w-4 accent-lagoon-700" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} />
                <span>I agree that The One Movement may store and review this request and contact me by email about it.</span>
              </label>
              {err('consent')}
            </div>
            {serverError && <p className="rounded-md border border-crimson-700/30 bg-crimson-700/5 p-3 text-sm text-crimson-700" role="alert">{serverError}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => close(false)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink-900/20 px-5 text-xs font-semibold uppercase tracking-widest text-ink-900 hover:border-gold-600">Cancel</button>
              <button type="submit" disabled={create.isPending || !valid} className="inline-flex min-h-11 items-center justify-center rounded-full bg-lagoon-900 px-6 text-xs font-semibold uppercase tracking-widest text-ivory-50 hover:bg-lagoon-800 disabled:opacity-50" data-testid={`button-intro-submit-${partner.id}`}>
                {create.isPending ? 'Sending' : 'Send request to TOMI'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
