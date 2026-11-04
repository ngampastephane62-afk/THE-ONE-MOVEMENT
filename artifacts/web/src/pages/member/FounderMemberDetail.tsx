import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, MessageSquare, ShieldOff, ShieldCheck, UserPlus } from 'lucide-react';
import {
  useGetFounderRegisteredMember, getGetFounderRegisteredMemberQueryKey, getGetFounderCommandCenterQueryKey, actOnFounderMember,
  type FounderMemberAction, type FounderCertification,
} from '@workspace/api-client-react';
import { STATE_PREFIX, errStatus, useAct } from '@/components/network/kit';
import ConfirmActionDialog, { clearDraft, type ConfirmSpec } from '@/components/founder/ConfirmActionDialog';
import { POLL, fmt, humanize, rid, sectorName } from '@/components/founder/command-helpers';
import { ReminderPanel } from './FounderMembers';
import { errMsg } from './proHooks';

type Pending = { spec: ConfirmSpec; body: Omit<FounderMemberAction, 'reason' | 'requestId' | 'confirmed'> };
const PRIVATE_KEYS = /location|address|city|country|region|phone|birth/i;
const HIDDEN_KEYS = /password|secret|token/i;

export default function FounderMemberDetail() {
  const { clerkId: raw } = useParams<{ clerkId: string }>();
  const clerkId = decodeURIComponent(raw ?? '');
  const qc = useQueryClient();
  const q = useGetFounderRegisteredMember(clerkId, { query: { queryKey: getGetFounderRegisteredMemberQueryKey(clerkId), refetchInterval: POLL, enabled: !!clerkId } });
  const { run, pending: followPending } = useAct();
  const [act, setAct] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const attempt = useRef<{ key: string; id: string } | null>(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [reminder, setReminder] = useState(false);
  const [followMsg, setFollowMsg] = useState('');
  const d = q.data;

  if (q.isLoading) return <div className="mx-3 h-80 animate-pulse rounded-3xl bg-sand-100 md:mx-0" aria-hidden="true" data-testid="skeleton-member-detail" />;
  if (!d) return (
    <div role="alert" className="mx-3 rounded-2xl border border-crimson-700/30 bg-ivory-50 p-5 md:mx-0" data-testid="error-member-detail">
      <p className="font-semibold text-ink-900">{errStatus(q.error) === 404 ? 'No registered account with this ID.' : `This account could not be loaded${errStatus(q.error) ? ` (HTTP ${errStatus(q.error)})` : ''}.`}</p>
      <div className="mt-3 flex gap-3"><button type="button" onClick={() => q.refetch()} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900" data-testid="button-retry-member">Retry</button><Link href="/member/founder/members" className="text-xs font-semibold text-lagoon-700 underline self-center">All Registered Members</Link></div>
    </div>
  );
  const a = d.account;
  const name = a.name || a.email || 'Unnamed account';
  const open = (verb: string, title: string, body: Pending['body'], opts: Partial<ConfirmSpec> = {}) => {
    setErr(''); setOk('');
    setAct({ body, spec: { title, verb, targetName: name, targetId: clerkId, reasonLabel: 'Reason (recorded in the audit log)', draftKey: `${clerkId}:${body.action}:${body.certificationId ?? ''}:${body.decision ?? ''}`, ...opts } });
  };
  async function confirm(reason: string) {
    if (!act) return;
    setBusy(true); setErr('');
    try {
      const key = JSON.stringify([clerkId, act.body, reason]);
      if (attempt.current?.key !== key) attempt.current = { key, id: rid() };
      await actOnFounderMember(clerkId, { ...act.body, confirmed: true, reason, requestId: attempt.current.id });
      attempt.current = null;
      clearDraft(act.spec.draftKey);
      setOk(`Done: ${act.spec.verb}.`);
      setAct(null);
      qc.invalidateQueries({ queryKey: getGetFounderRegisteredMemberQueryKey(clerkId) });
      qc.invalidateQueries({ queryKey: getGetFounderCommandCenterQueryKey() });
      qc.invalidateQueries({ queryKey: ['/api/founder/membership-dashboard'] });
      qc.invalidateQueries({ queryKey: STATE_PREFIX });
    } catch (e) {
      const s = errStatus(e);
      setErr(errMsg(e, s === 409 ? 'Review the current account and application status before trying again.' : s === 403 ? 'This action is not permitted.' : `The action could not be confirmed${s ? ` (HTTP ${s})` : ''}.`));
    } finally { setBusy(false); }
  }
  const certActions = (c: FounderCertification) => {
    const st = c.status.toLowerCase();
    const label = `${humanize(c.role)} · ${humanize(c.program)}`;
    if (st === 'pending' || st === 'submitted' || st === 'review') return (<>
      <button type="button" onClick={() => open(`approve and assign the official role ${label}`, 'Approve certification', { action: 'certification_decide', certificationId: c.id, decision: 'approved' })} className="rounded-full bg-lagoon-900 px-3 py-1.5 text-xs font-semibold text-gold-400" data-testid={`button-cert-approve-${c.id}`}>Approve & assign role</button>
      <button type="button" onClick={() => open(`reject the application ${label}`, 'Reject certification', { action: 'certification_decide', certificationId: c.id, decision: 'rejected' }, { danger: true })} className="rounded-full border border-crimson-700 px-3 py-1.5 text-xs font-semibold text-crimson-700" data-testid={`button-cert-reject-${c.id}`}>Reject</button>
    </>);
    if (st === 'approved' || st === 'active') return <button type="button" onClick={() => open(`revoke the official role ${label}`, 'Revoke official role', { action: 'certification_decide', certificationId: c.id, decision: 'revoked' }, { danger: true })} className="rounded-full border border-crimson-700 px-3 py-1.5 text-xs font-semibold text-crimson-700" data-testid={`button-cert-revoke-${c.id}`}>Revoke official role</button>;
    return null;
  };
  const profile = Object.entries(d.profile).filter(([k, v]) => v && !HIDDEN_KEYS.test(k));
  const completion = a.profileStatus === 'complete' ? 'Complete' : a.profileStatus === 'incomplete' ? 'Incomplete' : 'No profile';

  return (
    <section className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-member-detail">
      <Helmet><title>{name} — Registered member</title></Helmet>
      <Link href="/member/founder/members" className="inline-flex items-center gap-1 text-xs font-semibold text-lagoon-700" data-testid="link-back-members"><ArrowLeft className="h-3.5 w-3.5" />All Registered Members</Link>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <p className="text-eyebrow text-gold-400">REGISTERED ACCOUNT</p>
        <h1 className="mt-1 font-display text-2xl text-ivory-50" data-testid="text-member-name">{name}</h1>
        <p className="mt-1 break-all font-mono text-xs text-ivory-300" data-testid="text-member-clerk-id">{clerkId}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <span className={`rounded-full px-2 py-0.5 ${a.suspended || d.banned || d.locked ? 'bg-crimson-700 text-ivory-50' : 'bg-gold-500 text-ink-900'}`} data-testid="status-account">{d.banned ? 'Banned' : d.locked ? 'Locked' : a.suspended ? 'Suspended' : 'Unrestricted account'}</span>
          <span className="rounded-full border border-ivory-100/30 px-2 py-0.5">{a.emailVerified ? 'Email verified' : 'Email unverified'}</span>
          <span className="rounded-full border border-ivory-100/30 px-2 py-0.5">Profile: {completion}</span>
          {d.discoverable && <span className="rounded-full border border-gold-400 px-2 py-0.5 text-gold-400">Listed in People</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {d.memberId && (d.discoverable || d.publicProfile) && <Link href={d.discoverable ? `/member/profile/${d.memberId}` : `~/community/members/${d.memberId}`} className="inline-flex min-h-11 items-center rounded-full border border-ivory-100/30 px-4 text-xs font-semibold hover:border-gold-400" data-testid="link-member-profile">{d.discoverable ? 'View profile in People' : 'View public profile'}</Link>}
          {d.followAllowed && d.memberId && <button type="button" disabled={followPending} onClick={() => { setFollowMsg(''); run({ action: 'follow', targetId: d.memberId!, accepted: true }).then(() => setFollowMsg('Following.')).catch(() => setFollowMsg('Follow failed.')); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 text-xs font-semibold hover:border-gold-400 disabled:opacity-50" data-testid="button-follow-member"><UserPlus className="h-3.5 w-3.5" />Follow</button>}
          {a.profileStatus !== 'complete' && !a.remindersOptedOut && <button type="button" onClick={() => setReminder(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory-100/30 px-4 text-xs font-semibold hover:border-gold-400" data-testid="button-member-reminder"><Mail className="h-3.5 w-3.5" />Profile reminder email</button>}
        </div>
        {followMsg && <p role="status" className="mt-2 text-xs text-gold-400">{followMsg}</p>}
      </header>
      {ok && <p role="status" className="rounded-xl bg-lagoon-900 p-3 text-xs text-gold-400" data-testid="status-action-ok">{ok}</p>}
      {q.isError && <p role="alert" className="text-xs text-crimson-700">Latest refresh failed; showing earlier data.</p>}
      {reminder && <ReminderPanel account={a} onClose={() => setReminder(false)} />}

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="md-account" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4">
          <h2 id="md-account" className="text-eyebrow text-gold-700">ACCOUNT</h2>
          <dl className="mt-2 grid gap-2 text-sm">
            <div><dt className="text-xs text-ink-700">Email</dt><dd className="font-mono text-ink-900">{a.email || '—'}</dd></div>
            <div><dt className="text-xs text-ink-700">Created</dt><dd>{fmt(a.createdAt)}</dd></div>
            <div><dt className="text-xs text-ink-700">Last sign-in</dt><dd>{fmt(a.lastSignInAt)}</dd></div>
            <div><dt className="text-xs text-ink-700">Last activity (sign-in service)</dt><dd data-testid="text-last-activity">{fmt(d.lastActivityAt)}</dd></div>
            <div><dt className="text-xs text-ink-700">Selected sectors</dt><dd>{a.sectors.length ? a.sectors.map(sectorName).join(', ') : '—'}</dd></div>
            {a.missingFields.length > 0 && <div><dt className="text-xs text-ink-700">Missing</dt><dd>{a.missingFields.join(', ')}</dd></div>}
          </dl>
        </section>
        <section aria-labelledby="md-profile" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4">
          <h2 id="md-profile" className="text-eyebrow text-gold-700">PROFILE FIELDS</h2>
          {profile.length === 0 ? <p className="mt-2 text-sm text-ink-700">No profile saved.</p> : (
            <dl className="mt-2 grid gap-2 text-sm">{profile.map(([k, v]) => (
              <div key={k}><dt className="flex items-center gap-1.5 text-xs text-ink-700">{humanize(k)}{PRIVATE_KEYS.test(k) && <span className="rounded bg-crimson-700 px-1 text-[9px] font-bold text-ivory-50">ADMIN ONLY · PRIVATE</span>}</dt><dd className="whitespace-pre-wrap text-ink-900">{v}</dd></div>
            ))}</dl>
          )}
        </section>
      </div>

      <section aria-labelledby="md-actions" className="rounded-2xl border border-gold-500/40 bg-ivory-50 p-4">
        <h2 id="md-actions" className="text-eyebrow text-gold-700">ADMINISTRATIVE ACTIONS</h2>
        <p className="mt-1 text-xs text-ink-700">Every action requires a written reason and explicit confirmation, and is recorded below.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {a.suspended
            ? <button type="button" onClick={() => open('restore this account', 'Restore account', { action: 'restore' })} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-gold-400" data-testid="button-restore-member"><ShieldCheck className="h-3.5 w-3.5" />Restore account</button>
            : <button type="button" onClick={() => open('suspend this account', 'Suspend account', { action: 'suspend' }, { danger: true })} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-crimson-700 px-4 text-xs font-semibold text-crimson-700" data-testid="button-suspend-member"><ShieldOff className="h-3.5 w-3.5" />Suspend account</button>}
          <button type="button" onClick={() => open('send this administrative message', 'Send administrative message', { action: 'send_message' }, { reasonLabel: 'Message to the member (they will see this text)' })} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-lagoon-900 px-4 text-xs font-semibold text-lagoon-900" data-testid="button-message-member"><MessageSquare className="h-3.5 w-3.5" />Administrative message</button>
        </div>
      </section>

      <section aria-labelledby="md-certs" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4">
        <h2 id="md-certs" className="text-eyebrow text-gold-700">OFFICIAL ROLES · CERTIFICATION APPLICATIONS</h2>
        <p className="mt-1 text-xs text-ink-700">Official roles are assigned or removed only through the member's own applications.</p>
        {d.certifications.length === 0 ? <p className="mt-2 text-sm text-ink-700">No certification applications.</p> : (
          <ul className="mt-2 flex flex-col gap-2">{d.certifications.map((c) => (
            <li key={c.id} className="rounded-xl border border-sand-200 p-3" data-testid={`row-cert-${c.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-ink-900">{humanize(c.role)} · {humanize(c.program)}</span><span className="text-[11px] font-semibold uppercase text-gold-700">{c.status}</span></div>
              {c.note && <p className="mt-1 text-xs text-ink-700">{c.note}</p>}
              {c.expiresAt && <p className="text-[11px] text-ink-700">Expires {fmt(c.expiresAt)}</p>}
              <div className="mt-2 flex flex-wrap gap-2">{certActions(c)}</div>
            </li>
          ))}</ul>
        )}
      </section>

      <section aria-labelledby="md-svc" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4">
        <h2 id="md-svc" className="text-eyebrow text-gold-700">SERVICE CONVERSATION · ADMINISTRATION TOMI</h2>
        <p className="mt-1 text-xs text-ink-700">Only the administrative channel is shown. Private member conversations are never visible here.</p>
        {d.serviceMessages.length === 0 ? <p className="mt-2 text-sm text-ink-700">No service messages yet.</p> : (
          <ol className="mt-2 flex flex-col gap-2">{d.serviceMessages.map((m) => (
            <li key={m.id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.fromAdministration ? 'self-end bg-lagoon-900 text-ivory-50' : 'self-start border border-sand-200 bg-ivory-100 text-ink-900'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p><p className="mt-0.5 text-right text-[10px] opacity-70">{m.fromAdministration ? 'Administration' : 'Member'} · {fmt(m.createdAt)}{m.fromAdministration ? (m.readAt ? ' · read' : ' · unread') : ''}</p>
            </li>
          ))}</ol>
        )}
      </section>

      <section aria-labelledby="md-audit" className="rounded-2xl border border-sand-200 bg-ivory-50 p-4">
        <h2 id="md-audit" className="text-eyebrow text-gold-700">AUDIT LOG</h2>
        {d.audit.length === 0 ? <p className="mt-2 text-sm text-ink-700">No administrative actions recorded.</p> : (
          <ul className="mt-2 divide-y divide-sand-100">{d.audit.map((x) => (
            <li key={x.id} className="py-2 text-sm" data-testid={`row-audit-${x.id}`}><p className="font-semibold text-ink-900">{humanize(x.action)} <span className="text-[11px] font-normal uppercase text-gold-700">{x.status}</span></p><p className="text-xs text-ink-700">{x.actor} · {fmt(x.createdAt)}</p>{x.reason && <p className="mt-0.5 whitespace-pre-wrap text-xs text-ink-800">{x.reason}</p>}</li>
          ))}</ul>
        )}
      </section>

      <ConfirmActionDialog spec={act?.spec ?? null} pending={busy} error={err} onCancel={() => { setAct(null); setErr(''); }} onConfirm={confirm} />
    </section>
  );
}
