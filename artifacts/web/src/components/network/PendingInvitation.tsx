import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { UserPlus, X } from 'lucide-react';
import { useMe } from '@/pages/member/ctx';
import {
  clearPendingFollow, clearPendingInvite, getPendingFollow, getPendingInvite,
  type PendingFollow, type PendingInvite,
} from '@/lib/network-invitations';
import { btn, btnGhost, errStatus, useAct } from './kit';

function claimError(e: unknown) {
  const s = errStatus(e);
  if (s === 404 || s === 410) return { msg: 'This invitation is invalid or has expired.', fatal: true };
  if (s === 409) return { msg: 'This invitation cannot be accepted: your account was already credited to an invitation, or it was created more than 24 hours ago.', fatal: true };
  if (s === 400 || s === 422) return { msg: 'This invitation cannot be accepted from your account (for example, it is your own link).', fatal: true };
  if (s === 403) return { msg: 'Only verified, active members created within the last 24 hours can accept an invitation.', fatal: true };
  return { msg: 'Accepting failed. Check your connection and try again.', fatal: false };
}

/** Shown inside the member shell only, i.e. after profile + JoinConsent. Never auto-follows. */
export default function PendingInvitation() {
  const { user } = useUser();
  const { me, base } = useMe();
  const { run, pending } = useAct();
  const [invite, setInvite] = useState<PendingInvite | null>(null);
  const [follow, setFollow] = useState<PendingFollow | null>(null);
  const [err, setErr] = useState<{ msg: string; fatal: boolean } | null>(null);
  const [done, setDone] = useState('');

  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) return;
    const inv = getPendingInvite(uid);
    if (inv && base.growth && inv.code === base.growth.inviteCode.toLowerCase()) { clearPendingInvite(); setInvite(null); }
    else setInvite(inv);
    const f = getPendingFollow(uid);
    if (f && (f.memberId === me.id || base.members.find((m) => m.id === f.memberId)?.followed)) { clearPendingFollow(); setFollow(null); }
    else setFollow(f);
  }, [user?.id, me.id, base.growth, base.members]);

  if (done) {
    return <div className="mx-3 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-lagoon-600/30 bg-lagoon-600/10 p-3 text-sm text-lagoon-800 md:mx-0" role="status" data-testid="text-invite-done">{done}<button onClick={() => setDone('')} aria-label="Close" className="text-sand-400"><X className="h-4 w-4" /></button></div>;
  }

  if (invite) {
    return (
      <div className="mx-3 mb-4 mt-4 rounded-2xl border border-gold-500/50 bg-ivory-50 p-4 md:mx-0 md:mt-0" data-testid="panel-pending-invite">
        <div className="flex items-start gap-3">
          <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">You opened a member invitation</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-700">Accepting makes you follow the member who invited you and credits their invitation. It only works for new accounts created within the last 24 hours, and each account can be credited once. You can unfollow later.</p>
            {err && <p className="mt-2 text-xs text-crimson-700" role="alert" data-testid="text-invite-error">{err.msg}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {!err?.fatal && (
                <button className={btn} disabled={pending} data-testid="button-accept-invite" onClick={() => {
                  setErr(null);
                  run({ action: 'referral.claim', kind: invite.code, accepted: true })
                    .then(() => { clearPendingInvite(); setInvite(null); setDone('Invitation accepted. You now follow the member who invited you.'); })
                    .catch((e) => { const c = claimError(e); setErr(c); if (c.fatal) clearPendingInvite(); });
                }}>Accept and follow</button>
              )}
              <button className={btnGhost} data-testid="button-dismiss-invite" onClick={() => { clearPendingInvite(); setInvite(null); setErr(null); }}>{err?.fatal ? 'Close' : 'Dismiss'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (follow) {
    return (
      <div className="mx-3 mb-4 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sand-200 bg-ivory-50 p-4 md:mx-0 md:mt-0" data-testid="panel-pending-follow">
        <p className="min-w-0 flex-1 text-sm text-ink-800">Follow <b>{follow.name}</b>, whose public profile you visited?</p>
        {err && <p className="w-full text-xs text-crimson-700" role="alert">{err.msg}</p>}
        <button className={btn} disabled={pending} data-testid="button-accept-follow" onClick={() => {
          setErr(null);
          run({ action: 'follow', targetId: follow.memberId, accepted: true })
            .then(() => { clearPendingFollow(); setFollow(null); setDone(`You now follow ${follow.name}.`); })
            .catch(() => setErr({ msg: 'Follow failed. The profile may no longer be available.', fatal: false }));
        }}>Follow</button>
        <button className={btnGhost} data-testid="button-dismiss-follow" onClick={() => { clearPendingFollow(); setFollow(null); setErr(null); }}>Not now</button>
      </div>
    );
  }
  return null;
}
