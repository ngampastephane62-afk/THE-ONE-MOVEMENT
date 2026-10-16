import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Building2, ExternalLink, ShieldCheck } from 'lucide-react';
import { useGetProfessionalState, getGetProfessionalStateQueryKey, useGetProfessionalBusiness, getGetProfessionalBusinessQueryKey, type ProfessionalBusiness } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, errStatus, field } from '@/components/network/kit';
import { useMe } from './ctx';
import { errMsg, useProAct } from './proHooks';

const REQUIRED = 10;
const STATUS_TEXT: Record<string, string> = { pending: 'Collecting attestations / awaiting founder review', approved: 'Reviewed by the TOMI founder', rejected: 'Not approved' };

function Status({ b }: { b: ProfessionalBusiness }) {
  return (
    <div className="mt-3 rounded-xl bg-ivory-100 p-3 text-sm" data-testid="panel-business-status">
      <p><b className="text-ink-900" data-testid="text-business-status">{STATUS_TEXT[b.status] ?? b.status}</b></p>
      <p className="mt-1 text-ink-700" data-testid="text-attestations">{b.attestationCount} of {REQUIRED} member attestations</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200"><div className="h-full origin-left bg-gold-500" style={{ transform: `scaleX(${Math.min(1, b.attestationCount / REQUIRED)})` }} /></div>
      {b.decisionNote && <p className="mt-2 text-xs text-ink-700">Founder note: {b.decisionNote}</p>}
      <p className="mt-2 text-xs text-sand-400">Attestations and the review badge reflect member statements and a founder check. They do not prove legal status or registration.</p>
    </div>
  );
}

export default function Business() {
  const { me } = useMe();
  const q = useGetProfessionalState({ query: { queryKey: getGetProfessionalStateQueryKey(), refetchInterval: 45000 } });
  const { run, pending } = useProAct();
  const [f, setF] = useState({ name: '', website: '', registrationReference: '' });
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState('');
  const [notes, setNotes] = useState<Record<number, string>>({});
  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton rows={3} /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const s = q.data!;
  const bizActive = me.founder || s.membership?.active && s.membership.tier === 'business';
  const b = s.business;
  const valid = consent && f.name.trim().length > 1 && /^https:\/\/[^\s.]+\.[^\s]+$/.test(f.website.trim()) && f.registrationReference.trim().length >= 5;

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-business">
      <header><p className="text-eyebrow text-gold-700">COMPANY PAGE</p><h1 className="font-display text-2xl text-ink-900">Your company, vouched for by members</h1></header>
      {err && <p className="text-sm text-crimson-700" role="alert">{err}</p>}
      <section className={`${card} p-5`}>
        {b ? <>
          <div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-lagoon-700" /><div className="flex-1"><p className="font-display text-lg text-ink-900" data-testid="text-business-name">{b.name}</p><a href={b.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-xs text-lagoon-700 underline">{b.website}<ExternalLink className="h-3 w-3" /></a></div>
            <Link href={`/member/business/${me.id}`} className={btnGhost} data-testid="link-business-public">Member view</Link></div>
          {b.registrationReference && <p className="mt-2 text-xs text-ink-700">Public registration reference: <span className="font-mono">{b.registrationReference}</span></p>}
          <Status b={b} />
          <p className="mt-3 text-xs text-ink-700">Ask members who know your company to open the member view and attest. You cannot attest your own company.</p>
        </> : !bizActive ? (
          <Empty title="Business Sponsor membership required" body="Company pages are available on the Business Sponsor plan.">
            <Link href="/member/membership" className={btn} data-testid="link-upgrade">See membership</Link>
          </Empty>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (!valid) return; setErr(''); run({ action: 'business.submit', name: f.name.trim(), website: f.website.trim(), registrationReference: f.registrationReference.trim(), accepted: true }).catch((x) => setErr(errMsg(x, 'Submission failed.'))); }} className="flex flex-col gap-3">
            <p className="text-sm text-ink-700">Use the official, public registration reference from a company register. Never enter identity documents, tax secrets or bank details.</p>
            <label className="text-xs font-semibold text-ink-900">Company name<input className={`${field} mt-1`} maxLength={160} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="input-business-name" /></label>
            <label className="text-xs font-semibold text-ink-900">Website (https)<input className={`${field} mt-1`} maxLength={300} placeholder="https://" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} data-testid="input-business-website" /></label>
            <label className="text-xs font-semibold text-ink-900">Public registration reference<input className={`${field} mt-1`} maxLength={300} value={f.registrationReference} onChange={(e) => setF({ ...f, registrationReference: e.target.value })} data-testid="input-business-reference" /></label>
            <label className="flex items-start gap-2 text-xs text-ink-700"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} data-testid="checkbox-business-consent" />I confirm these business details are truthful and authorise TOMI to review the public registration reference.</label>
            <button className={btn} disabled={!valid || pending} data-testid="button-business-submit">Submit for attestations</button>
          </form>
        )}
      </section>

      {me.founder && (
        <section className={`${card} p-5`} data-testid="panel-business-reviews">
          <p className="text-eyebrow text-gold-700">FOUNDER REVIEW</p>
          {s.reviews.length === 0 ? <p className="mt-2 text-sm text-sand-400">No companies to review.</p> : <ul className="mt-2 divide-y divide-sand-100">{s.reviews.map((r) => (
            <li key={r.memberId} className="py-3" data-testid={`row-review-${r.memberId}`}>
              <p className="text-sm font-semibold text-ink-900"><Link href={`/member/business/${r.memberId}`} className="hover:underline">{r.name}</Link> <span className="font-normal text-sand-400">· {r.attestationCount}/{REQUIRED} · {r.status}</span></p>
              <p className="text-xs text-ink-700">{r.website}{r.registrationReference ? ` · ${r.registrationReference}` : ''}</p>
              <CommunityStatements business={r} />
              <div className="mt-2 flex flex-wrap gap-2">
                <input className={`${field} min-w-0 flex-1 py-1.5 text-xs`} placeholder="Decision note" maxLength={2000} value={notes[r.memberId] ?? r.decisionNote} onChange={(e) => setNotes({ ...notes, [r.memberId]: e.target.value })} data-testid={`input-review-note-${r.memberId}`} />
                {(['approved', 'rejected', 'pending'] as const).map((st) => <button key={st} className={st === 'approved' ? btn : btnGhost} disabled={pending || (st === 'approved' && r.attestationCount < REQUIRED)} onClick={() => { setErr(''); run({ action: 'business.review', memberId: r.memberId, status: st, text: notes[r.memberId] ?? r.decisionNote }).catch((x) => setErr(errMsg(x, 'Review failed.'))); }} data-testid={`button-review-${st}-${r.memberId}`}>{st}</button>)}
              </div>
            </li>))}</ul>}
        </section>
      )}
    </div>
  );
}

export function BusinessDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const id = Number(memberId);
  const { me } = useMe();
  const q = useGetProfessionalBusiness(id, { query: { queryKey: getGetProfessionalBusinessQueryKey(id), enabled: Number.isFinite(id), retry: false, refetchInterval: 60000 } });
  const { run, pending } = useProAct();
  const [text, setText] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton rows={3} /></div>;
  if (q.isError) return <div className="p-3 md:p-0">{errStatus(q.error) === 404 ? <Empty title="No company page" body="This member has not submitted a company page."><Link href={`/member/profile/${id}`} className={btnGhost}>Back to profile</Link></Empty> : <ErrorBox onRetry={() => q.refetch()} />}</div>;
  const b = q.data!;
  const self = id === me.id;
  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-business-detail">
      <section className={`${card} p-5`}>
        <p className="text-eyebrow text-gold-700">COMPANY</p>
        <h1 className="font-display text-2xl text-ink-900" data-testid="text-business-name">{b.name}</h1>
        <a href={b.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sm text-lagoon-700 underline">{b.website}<ExternalLink className="h-3 w-3" /></a>
        {b.status === 'approved' && <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-lagoon-900 px-3 py-1 text-xs text-gold-400"><ShieldCheck className="h-3.5 w-3.5" />Founder-reviewed</p>}
        <Status b={b} />
        <CommunityStatements business={b} />
        <Link href={`/member/profile/${id}`} className="mt-3 inline-flex text-xs font-semibold text-lagoon-700 hover:underline">View member profile</Link>
      </section>
      {!self && (
        <section className={`${card} p-5`}>
          {err && <p className="mb-2 text-sm text-crimson-700" role="alert">{err}</p>}
          {b.hasAttested ? <div className="flex flex-wrap items-center gap-3"><p className="flex-1 text-sm text-ink-700">You attested for this company.</p><button className={btnGhost} disabled={pending} onClick={() => { setErr(''); run({ action: 'business.withdraw', memberId: id }).catch((x) => setErr(errMsg(x, 'Withdrawal failed.'))); }} data-testid="button-withdraw-attestation">Withdraw attestation</button></div> : (
            <form onSubmit={(e) => { e.preventDefault(); setErr(''); run({ action: 'business.attest', memberId: id, text: text.trim(), accepted: true }).then(() => { setText(''); setOk(false); }).catch((x) => setErr(errMsg(x, 'Attestation failed.'))); }} className="flex flex-col gap-3">
              <label htmlFor="att" className="text-sm font-semibold text-ink-900">Attest from your own experience</label>
              <textarea id="att" className={`${field} min-h-24`} minLength={20} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="How you know this company and what you have seen first-hand (at least 20 characters)" data-testid="input-attestation" />
              <label className="flex items-start gap-2 text-xs text-ink-700"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5" data-testid="checkbox-attest-consent" />My statement is truthful and based on my own experience. It is shown under my name and does not certify legality.</label>
              <button className={btn} disabled={!ok || text.trim().length < 20 || pending} data-testid="button-attest">Submit attestation</button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

function CommunityStatements({ business }: { business: ProfessionalBusiness }) {
  if (!business.attestations?.length) return null;
  return <details className="mt-3 text-sm text-ink-800">
    <summary className="cursor-pointer font-semibold">Community statements</summary>
    <ul className="mt-2 space-y-3">{business.attestations.map(a => <li key={a.id} className="border-l-2 border-gold-500 pl-3">
      <Link href={`/member/profile/${a.memberId}`} className="font-semibold underline">{a.name}</Link>
      <p className="mt-1 whitespace-pre-wrap break-words text-xs">{a.statement}</p>
    </li>)}</ul>
  </details>;
}
