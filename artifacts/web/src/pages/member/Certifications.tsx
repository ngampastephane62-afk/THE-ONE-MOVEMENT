import { useEffect, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import {
  useGetNetworkState, getGetNetworkStateQueryKey, useGetNetworkPaymentStatus, getGetNetworkPaymentStatusQueryKey,
  type NetworkCertification, type NetworkPackage,
} from '@workspace/api-client-react';
import { Empty, ErrorBox, MediaView, PROGRAMS, ROLES, STATE_PREFIX, Skeleton, UploadTray, ACCEPT_EVIDENCE, btn, card, field, label, money, useAct, useUploads } from '@/components/network/kit';
import { useMe } from './ctx';

const STATUS: Record<string, string> = {
  pending: 'bg-gold-500/15 text-gold-700', approved: 'bg-lagoon-600/15 text-lagoon-700', rejected: 'bg-crimson-700/10 text-crimson-700', revoked: 'bg-crimson-700/10 text-crimson-700',
};

function PaymentReturn({ sessionId }: { sessionId: string }) {
  const qc = useQueryClient();
  const q = useGetNetworkPaymentStatus({ sessionId }, { query: {
    queryKey: getGetNetworkPaymentStatusQueryKey({ sessionId }),
    retry: false,
    refetchInterval: (s) => (s.state.status === 'error' || s.state.data?.status === 'paid' || s.state.data?.status === 'complete' ? false : 5000),
  } });
  const st = q.data?.status;
  const ok = st === 'paid' || st === 'complete';
  useEffect(() => { if (ok) qc.invalidateQueries({ queryKey: STATE_PREFIX }); }, [ok, qc]);
  return (
    <div className={`${card} flex items-start gap-3 p-4`} role="status" data-testid="status-payment">
      {q.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-lagoon-600" /> : <CreditCard className={`h-5 w-5 ${ok ? 'text-lagoon-600' : 'text-gold-600'}`} />}
      <div className="text-sm">
        <p className="font-semibold text-ink-900">{q.isLoading ? 'Verifying payment with the server…' : q.isError ? 'Payment status could not be verified' : ok ? 'Payment verified by the server' : `Payment status: ${st}`}</p>
        <p className="text-ink-700">{ok ? 'Thank you. Payment alone does not grant a badge: official status follows the approved certification and written agreement.' : q.isError ? 'Nothing is assumed from the return link. Refresh later or contact the team.' : 'We only rely on the verified server status, not on the return link.'}</p>
      </div>
    </div>
  );
}

function CheckoutBox({ c, pkg }: { c: NetworkCertification; pkg: NetworkPackage }) {
  const { run, pending } = useAct();
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-gold-500/50 bg-gold-500/5 p-3">
      <p className="text-sm text-ink-900"><b>{pkg.name}</b> · {money(pkg.amount, pkg.currency)} · one payment for {pkg.durationMonths} months. No automatic renewal.</p>
      <label className="mt-2 flex items-start gap-2 text-xs text-ink-800">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 accent-[hsl(187_67%_12%)]" data-testid={`checkbox-ack-${c.id}`} />
        I have read and accept the written agreement for this package, and understand renewal requires a new signed agreement.
      </label>
      {err && <p className="mt-1 text-xs text-crimson-700" role="alert">Checkout is not available right now.</p>}
      <button className={`${btn} mt-2`} disabled={!ack || pending} onClick={() => { setErr(false); run({ action: 'checkout', id: c.id, accepted: true }).then((r) => { if (r.url) window.location.assign(r.url); else setErr(true); }).catch(() => setErr(true)); }} data-testid={`button-checkout-${c.id}`}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Continue to secure payment</button>
    </div>
  );
}

export default function Certifications() {
  const { me } = useMe();
  const search = new URLSearchParams(useSearch());
  const sessionId = search.get('session_id');
  const q = useGetNetworkState({}, { query: { queryKey: getGetNetworkStateQueryKey({}) } });
  const { run, pending } = useAct();
  const u = useUploads(6);
  const [role, setRole] = useState(search.get('role') && (ROLES as readonly string[]).includes(search.get('role')!) ? search.get('role')! : 'business');
  const [program, setProgram] = useState(search.get('program') ?? 'ecosystem');
  const [pkg, setPkg] = useState(search.get('package') ?? '');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<'' | 'ok' | 'err'>('');

  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const { certifications, packages, stripeReady } = q.data!;
  const mine = certifications.filter((c) => c.member.id === me.id);

  return (
    <div className="flex flex-col gap-6 px-3 pt-4 md:px-0 md:pt-0">
      {sessionId && <PaymentReturn sessionId={sessionId} />}
      <header>
        <h1 className="font-display text-2xl text-ink-900">Official roles & certification</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-700">Email verification lets you join the network. Official badges — business, partner, designer, investor and others — are separate: each is reviewed by TOMI for a specific role and programme, and only appears after approval.</p>
      </header>

      <form className={`${card} flex flex-col gap-4 p-5`} onSubmit={(e) => {
        e.preventDefault(); setMsg('');
        run({ action: 'certification.request', role, program, packageSlug: pkg || undefined, text: note.trim(), mediaIds: u.ids })
          .then(() => { setMsg('ok'); setNote(''); u.clear(); }).catch(() => setMsg('err'));
      }}>
        <p className="text-eyebrow text-gold-700">NEW APPLICATION</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-ink-900">Role
            <select className={`${field} mt-1`} value={role} onChange={(e) => setRole(e.target.value)} data-testid="select-role">{ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
          </label>
          <label className="text-sm text-ink-900">Programme
            <select className={`${field} mt-1`} value={program} onChange={(e) => setProgram(e.target.value)} data-testid="select-program">{PROGRAMS.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
          </label>
          <label className="text-sm text-ink-900">Package (optional)
            <select className={`${field} mt-1`} value={pkg} onChange={(e) => setPkg(e.target.value)} data-testid="select-package">
              <option value="">No package</option>
              {packages.map((p) => <option key={p.slug} value={p.slug}>{p.name} — {money(p.amount, p.currency)}</option>)}
            </select>
          </label>
        </div>
        <label className="text-sm text-ink-900">Note to the review team
          <textarea className={`${field} mt-1 min-h-24`} required minLength={10} maxLength={5000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Your organization, registration, portfolio or the scope you propose" data-testid="input-cert-note" />
        </label>
        <div><p className="text-sm text-ink-900">Evidence <span className="text-xs text-sand-400">(registration, portfolio, letters — images or PDF, private)</span></p><UploadTray u={u} accept={ACCEPT_EVIDENCE} label="Add evidence" testId="evidence-upload" /></div>
        {msg === 'ok' && <p className="flex items-center gap-1.5 text-sm text-lagoon-700" role="status"><CheckCircle2 className="h-4 w-4" />Application submitted. Status: pending review.</p>}
        {msg === 'err' && <p className="text-sm text-crimson-700" role="alert">Submission failed. Your note and files are kept — try again.</p>}
        <button className={`${btn} self-start`} disabled={pending || u.busy || note.trim().length < 10} data-testid="button-submit-cert">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Submit for review</button>
      </form>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink-900">Your applications</h2>
        {mine.length === 0 ? <Empty title="No applications yet" body="When you apply for an official role, its review status and decision will be tracked here." /> : (
          <ul className="flex flex-col gap-3">
            {mine.map((c) => {
              const p = packages.find((x) => x.slug === c.packageSlug);
              const canPay = c.status === 'approved' && c.agreementConfirmed && !c.paymentConfirmed && !!p?.payable && p.amount != null && stripeReady;
              return (
                <li key={c.id} className={`${card} p-4`} data-testid={`card-cert-${c.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 font-semibold text-ink-900"><ShieldCheck className="h-4 w-4 text-lagoon-600" />{label(c.role)} · {label(c.program)}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS[c.status] ?? 'bg-ivory-200'}`} data-testid={`status-cert-${c.id}`}>{c.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-sand-400">Submitted {new Date(c.createdAt).toLocaleDateString()}{p ? ` · ${p.name}` : ''}{c.expiresAt ? ` · valid until ${new Date(c.expiresAt).toLocaleDateString()}` : ''}</p>
                  {c.note && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-800">{c.note}</p>}
                  {c.evidence.length > 0 && <div className="mt-2"><MediaView media={c.evidence} grid={false} /></div>}
                  {c.decisionNote && <p className="mt-2 rounded-lg bg-ivory-100 p-2 text-sm text-ink-800"><b>Decision:</b> {c.decisionNote}</p>}
                  {c.packageSlug && <p className="mt-2 text-xs text-ink-700">Written agreement: {c.agreementConfirmed ? 'confirmed' : 'not yet confirmed'} · Payment: {c.paymentConfirmed ? 'confirmed' : 'not yet confirmed'}</p>}
                  {canPay && p && <CheckoutBox c={c} pkg={p} />}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-sand-400">Looking for fees? <Link href="/member/packages" className="underline">See packages</Link>.</p>
      </section>
    </div>
  );
}
