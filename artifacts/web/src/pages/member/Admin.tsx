import { useState } from 'react';
import { Link } from 'wouter';
import { AlertTriangle } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey, type NetworkCertification, type NetworkReport } from '@workspace/api-client-react';
import MediaRequestsAdmin from '@/components/partners/MediaRequestsAdmin';
import { Empty, ErrorBox, MediaView, PersonLine, Skeleton, btn, btnGhost, card, field, label, useAct } from '@/components/network/kit';

const COMMERCIAL = ['partner', 'sponsor', 'designer', 'exhibitor'];

function CertReview({ c }: { c: NetworkCertification }) {
  const { run, pending } = useAct();
  const [reason, setReason] = useState('');
  const [agree, setAgree] = useState(c.agreementConfirmed);
  const [paid, setPaid] = useState(c.paymentConfirmed);
  const [err, setErr] = useState(false);
  const commercial = !!c.packageSlug || COMMERCIAL.includes(c.role);
  const decide = (decision: string) => {
    if (decision === 'approved' && !confirm(commercial
      ? `Approving this commercial ${label(c.role)} request records the written terms and prepares checkout. The official badge activates only once payment is confirmed${paid ? ' — you have marked payment as confirmed, so it will activate now' : ''}. Continue?`
      : `Approving activates official ${label(c.role)} status for ${label(c.program)} on ${c.member.fullName}'s profile. Continue?`)) return;
    if (decision === 'approved' && commercial && !agree) { alert('Confirm the signed written agreement before approving a commercial request.'); return; }
    setErr(false);
    run({ action: 'certification.decide', id: c.id, decision, text: reason.trim(), agreementConfirmed: agree, paymentConfirmed: paid }).then(() => setReason('')).catch(() => setErr(true));
  };
  return (
    <li className={`${card} p-4`} data-testid={`admin-cert-${c.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><PersonLine m={c.member} /><span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-xs font-semibold capitalize">{c.status}</span></div>
      <p className="mt-2 font-semibold text-ink-900">{label(c.role)} · {label(c.program)}{c.packageSlug ? ` · ${c.packageSlug}` : ''}</p>
      {c.note && <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{c.note}</p>}
      {c.evidence.length > 0 ? <div className="mt-2"><MediaView media={c.evidence} grid={false} /></div> : <p className="mt-1 text-xs text-sand-400">No evidence attached.</p>}
      {c.decisionNote && <p className="mt-2 text-xs text-ink-700">Previous decision: {c.decisionNote}</p>}
      <div className="mt-3 flex flex-col gap-2 border-t border-sand-100 pt-3">
        <label className="text-xs text-ink-800">Decision reason (shown to member)
          <textarea className={`${field} mt-1 min-h-16`} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} data-testid={`input-reason-${c.id}`} />
        </label>
        {commercial && (
          <div className="flex flex-col gap-1 text-xs text-ink-800">
            <label className="flex items-center gap-2"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[hsl(187_67%_12%)]" />Written agreement signed and confirmed</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="accent-[hsl(187_67%_12%)]" />External payment received and confirmed</label>
          </div>
        )}
        {err && <p className="text-xs text-crimson-700" role="alert">Decision not saved.</p>}
        <div className="flex flex-wrap gap-2">
          {c.status !== 'approved' && <button className={btn} disabled={pending} onClick={() => decide('approved')} data-testid={`button-approve-${c.id}`}>{c.status === 'pending' ? 'Approve' : 'Re-approve'}</button>}
          {c.status === 'approved' && <button className={btn} disabled={pending} onClick={() => decide('approved')}>Update terms</button>}
          {c.status === 'pending' && <button className={btnGhost} disabled={pending || !reason.trim()} onClick={() => decide('rejected')} data-testid={`button-reject-${c.id}`}>Reject</button>}
          {c.status === 'approved' && <button className={`${btnGhost} text-crimson-700`} disabled={pending || !reason.trim()} onClick={() => decide('revoked')} data-testid={`button-revoke-${c.id}`}>Revoke</button>}
        </div>
      </div>
    </li>
  );
}

function ReportRow({ r }: { r: NetworkReport }) {
  const { run, pending } = useAct();
  const [err, setErr] = useState(false);
  const [reason, setReason] = useState('');
  const ok = reason.trim().length >= 3;
  const go = (p: Promise<unknown>) => { setErr(false); p.catch(() => setErr(true)); };
  return (
    <li className={`${card} p-4 ${r.resolved ? 'opacity-60' : ''}`} data-testid={`admin-report-${r.id}`}>
      <p className="text-xs text-sand-400">From {r.reporter}{r.postId ? ` · post #${r.postId}` : ''}{r.memberId ? ' · ' : ''}{r.memberId && <Link href={`/member/profile/${r.memberId}`} className="underline">member #{r.memberId}</Link>}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-900">{r.reason}</p>
      {err && <p className="text-xs text-crimson-700" role="alert">Action failed.</p>}
      {!r.resolved ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="w-full text-xs text-ink-800">Moderation reason (required)
            <textarea className={`${field} mt-1 min-h-14`} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} data-testid={`input-mod-reason-${r.id}`} />
          </label>
          {r.postId && <button className={btnGhost} disabled={pending || !ok} onClick={() => confirm('Hide this post from the network?') && go(run({ action: 'moderate.post', id: r.postId!, accepted: true, text: reason.trim() }))} data-testid={`button-hide-${r.id}`}>Hide post</button>}
          {r.postId && <button className={btnGhost} disabled={pending || !ok} onClick={() => go(run({ action: 'moderate.post', id: r.postId!, accepted: false, text: reason.trim() }))} data-testid={`button-restore-${r.id}`}>Restore post</button>}
          {r.memberId && <button className={`${btnGhost} text-crimson-700`} disabled={pending || !ok} onClick={() => confirm('Suspend this member from the network?') && go(run({ action: 'moderate.member', targetId: r.memberId!, accepted: true, text: reason.trim() }))} data-testid={`button-suspend-${r.id}`}>Suspend member</button>}
          <button className={btn} disabled={pending} onClick={() => go(run({ action: 'report.resolve', id: r.id }))} data-testid={`button-resolve-${r.id}`}>Mark resolved</button>
        </div>
      ) : <p className="mt-2 text-xs text-lagoon-700">Resolved</p>}
    </li>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<'certs' | 'reports' | 'members' | 'media'>('certs');
  const q = useGetNetworkState({}, { query: { queryKey: getGetNetworkStateQueryKey({}) } });
  const { run, pending } = useAct();
  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const { certifications, reports, members } = q.data!;
  const pendingCerts = certifications.filter((c) => c.status === 'pending');
  const open = reports.filter((r) => !r.resolved);
  const suspended = members.filter((m) => m.suspended);

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <header>
        <h1 className="font-display text-2xl text-ink-900">Founder administration</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />Approval applies to one role and programme. Non-commercial roles activate on approval; commercial roles (partner, sponsor, designer, exhibitor or any package) need a signed agreement, and the badge activates only once payment is confirmed. Payment alone never grants a badge.</p>
      </header>
      <div className="flex gap-1 rounded-full bg-ivory-200 p-1" role="tablist">
        {([['certs', `Certifications (${pendingCerts.length})`], ['reports', `Reports (${open.length})`], ['members', `Suspended (${suspended.length})`], ['media', 'Media requests']] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 rounded-full px-3 py-1.5 text-xs ${tab === id ? 'bg-ivory-50 font-semibold text-lagoon-900 shadow-sm' : 'text-ink-700'}`}>{l}</button>
        ))}
      </div>
      {tab === 'certs' && (certifications.length === 0 ? <Empty title="No applications" body="Certification requests will appear here for review." /> :
        <ul className="flex flex-col gap-3">{[...pendingCerts, ...certifications.filter((c) => c.status !== 'pending')].map((c) => <CertReview key={c.id} c={c} />)}</ul>)}
      {tab === 'reports' && (reports.length === 0 ? <Empty title="No reports" body="Member reports will appear here." /> :
        <ul className="flex flex-col gap-3">{[...open, ...reports.filter((r) => r.resolved)].map((r) => <ReportRow key={r.id} r={r} />)}</ul>)}
      {tab === 'media' && <MediaRequestsAdmin />}
      {tab === 'members' && (suspended.length === 0 ? <Empty title="No suspended members" body="Members suspended through moderation are listed here." /> :
        <ul className="flex flex-col gap-3">{suspended.map((m) => (
          <li key={m.id} className={`${card} flex items-center justify-between gap-3 p-4`}><PersonLine m={m} />
            <button className={btnGhost} disabled={pending} onClick={() => { const why = prompt('Reason for lifting the suspension'); if (why && why.trim().length >= 3) run({ action: 'moderate.member', targetId: m.id, accepted: false, text: why.trim().slice(0, 1000) }).catch(() => alert('Could not lift the suspension.')); }}>Lift suspension</button></li>
        ))}</ul>)}
    </div>
  );
}
