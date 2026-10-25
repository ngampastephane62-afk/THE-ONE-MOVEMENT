import { Link, useLocation } from 'wouter';
import { useAuth } from '@clerk/react';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { missingProfileEssentials } from '@workspace/shared';

const isAuthRoute = (loc: string) => loc.startsWith('/sign-in') || loc.startsWith('/sign-up');

/** Signed-in owner only: reads their own profile to suggest the next step. No profile details are rendered. */
function SignedInNext({ variant }: { variant: 'strip' | 'footer' }) {
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey(), staleTime: 60_000 } });
  if (q.isLoading || q.isError) return null;
  if (missingProfileEssentials(q.data?.profile ?? null).length === 0) return null;
  return <Invite variant={variant} title="Finish your essential profile" body="A few required details and your sectors, then you choose whether to activate the network." href="/member/onboarding" cta="Complete profile" testid="complete" />;
}

function Invite({ variant, title, body, href, cta, testid, secondary }: { variant: 'strip' | 'footer'; title: string; body: string; href: string; cta: string; testid: string; secondary?: { href: string; label: string } }) {
  if (variant === 'strip') return (
    <aside aria-label="Membership" className="border-b border-gold-500/25 bg-lagoon-900 text-ivory-100" data-testid={`strip-invitation-${testid}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <p className="min-w-0 flex-1 text-xs leading-snug text-ivory-200"><span className="font-semibold text-gold-400">{title}.</span> <span className="hidden sm:inline">{body}</span></p>
        <div className="flex shrink-0 items-center gap-3">
          {secondary && <Link href={secondary.href} className="text-xs font-semibold text-ivory-100 underline underline-offset-4 hover:text-gold-400" data-testid={`link-strip-${testid}-secondary`}>{secondary.label}</Link>}
          <Link href={href} className="rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid={`link-strip-${testid}`}>{cta}</Link>
        </div>
      </div>
    </aside>
  );
  return (
    <div className="mb-10 flex flex-col gap-4 rounded-sharp border border-gold-500/30 bg-lagoon-900/60 p-5 sm:flex-row sm:items-center sm:justify-between" data-testid={`footer-invitation-${testid}`}>
      <div className="min-w-0">
        <p className="text-eyebrow text-gold-400">MEMBERSHIP · FREE</p>
        <p className="mt-1 font-display text-lg text-ivory-100">{title}</p>
        <p className="mt-1 max-w-xl text-sm text-ivory-200/85">{body}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link href={href} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400" data-testid={`link-footer-${testid}`}>{cta}</Link>
        {secondary && <Link href={secondary.href} className="rounded-full border border-ivory-200/40 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400" data-testid={`link-footer-${testid}-secondary`}>{secondary.label}</Link>}
      </div>
    </div>
  );
}

/** Persistent, nonmodal invitation. Never opens dialogs or auth on a timer; absent on auth routes. */
export default function MembershipInvitation({ variant }: { variant: 'strip' | 'footer' }) {
  const [loc] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  if (isAuthRoute(loc) || !isLoaded) return null;
  if (isSignedIn) return <SignedInNext variant={variant} />;
  return <Invite variant={variant} title="Join TOMI as a member" body="Create a free account or sign in. Browsing stays open; membership lets you complete a profile, choose sectors and, if you wish, activate the network." href="/sign-up" cta="Create account" testid="visitor" secondary={{ href: '/sign-in', label: 'Sign in' }} />;
}
