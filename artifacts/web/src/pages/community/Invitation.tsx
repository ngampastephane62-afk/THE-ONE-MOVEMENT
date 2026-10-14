import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { Show } from '@clerk/react';
import { UserPlus } from 'lucide-react';
import { isInviteCode, storePendingInvite } from '@/lib/network-invitations';

export default function InvitationPage() {
  const { code } = useParams<{ code: string }>();
  const valid = isInviteCode(code);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (valid) setSaved(storePendingInvite(code)); }, [code, valid]);

  return (
    <div className="min-h-[70dvh] bg-ivory-100 px-4 py-16">
      <Helmet><title>Invitation — TOMI NETWORK</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="mx-auto max-w-xl border border-sand-200 bg-ivory-50 p-6 sm:p-10" data-testid="panel-invitation">
        <p className="text-eyebrow text-gold-700">{valid ? 'YOU ARE INVITED' : 'INVITATION'}</p>
        {valid ? (<>
          <h1 className="mt-2 text-display-md text-ink-900">Join the TOMI member network</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">A member of The One Movement International invited you to the network where artists, business and humanitarian professionals meet across sectors.</p>
          <div className="mt-5 border-l-2 border-gold-500 bg-ivory-100 p-4 text-sm leading-relaxed text-ink-800">
            <p className="font-semibold">What accepting means</p>
            <p className="mt-1">After you create your account, verify your email, complete your profile and join the network, we will ask you to confirm. Accepting makes you follow the member who invited you and credits their invitation. Nothing happens without your confirmation, and you can unfollow at any time.</p>
            <p className="mt-2 text-xs text-ink-700">Only new accounts created within the last 24 hours can accept. {saved ? 'This invitation is saved in this browser for 7 days.' : ''}</p>
          </div>
          <Show when="signed-out">
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:bg-lagoon-800" data-testid="link-invite-signup"><UserPlus className="h-4 w-4" />Create my account</Link>
              <Link href="/sign-in" className="inline-flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-lagoon-700 hover:text-gold-700" data-testid="link-invite-signin">I already have an account</Link>
            </div>
          </Show>
          <Show when="signed-in">
            <Link href="/member" className="mt-6 inline-flex bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100" data-testid="link-invite-member">Continue to the network</Link>
          </Show>
        </>) : (<>
          <h1 className="mt-2 text-display-md text-ink-900">This invitation link is not valid</h1>
          <p className="mt-4 text-sm text-ink-700">Check that the full link was copied, or ask the member for a new one. You can still join the network directly.</p>
          <Link href="/sign-up" className="mt-6 inline-flex bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100" data-testid="link-invite-signup">Create an account</Link>
        </>)}
      </div>
    </div>
  );
}
