import { useState, type ReactNode } from 'react';
import InvitationProgress from '@/components/network/InvitationProgress';
import PendingInvitation from '@/components/network/PendingInvitation';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect, Route, Switch, useLocation } from 'wouter';
import { Show, useAuth, useUser, useClerk } from '@clerk/react';
import { Award, Bell, UserPlus, Briefcase, HandHeart, Home, LogOut, MessageSquare, Settings, Shield, Users } from 'lucide-react';
import {
  useGetMemberProfile, getGetMemberProfileQueryKey, useGetNetworkState, getGetNetworkStateQueryKey,
} from '@workspace/api-client-react';
import { basePath } from '@/lib/clerk';
import universe from '@/assets/media/ecosystem/community-universe.webp';
import { Avatar, ErrorBox, Skeleton, btn, errStatus, useAct } from '@/components/network/kit';
import { MeCtx, type Ctx } from './ctx';
import ProfileForm from './ProfileForm';
import Feed from './Feed';
import People from './People';
import ProfilePage from './Profile';
import Messages from './Messages';
import Packages from './Packages';
import Certifications from './Certifications';
import Admin from './Admin';
import SettingsPage from './Settings';


function Frame({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-ivory-100">{children}</div>;
}

function Onboard({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <Frame>
      <div className="relative h-44 overflow-hidden bg-lagoon-900 sm:h-56">
        <img src={universe} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-lagoon-900 to-transparent" />
        <img src={`${basePath}/logo.svg`} alt="TOMI" className="absolute left-5 top-5 h-9" />
      </div>
      <div className="mx-auto -mt-16 max-w-2xl px-4 pb-16">
        <div className="relative rounded-3xl border border-sand-200 bg-ivory-50 p-6 shadow-xl sm:p-8">
          <p className="text-eyebrow text-gold-700">{eyebrow}</p>
          <h1 className="mt-1 text-display-md text-ink-900">{title}</h1>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </Frame>
  );
}

function JoinConsent({ onJoined }: { onJoined: () => void }) {
  const { run, pending } = useAct();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <Onboard eyebrow="ONE LAST STEP" title="Join the member network">
      <p className="text-sm leading-relaxed text-ink-700">The network is where designers, NGO workers, investors and institutions present their work, follow each other and open private conversations.</p>
      <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-800">
        <li>• Signed-in, verified members will see your network profile: name, role, organization, country, bio, sectors, photo and posts.</li>
        <li>• Your visibility on the public website does not change. If your profile is private on the public directory, it stays private.</li>
        <li>• Messages only open after the other member accepts your request. You can block or report anyone.</li>
        <li>• Membership is free. Free members can follow, like, comment and message right away; publishing posts unlocks once 11 people you invited follow you. Packages and events do not replace this step.</li>
        <li>• Official badges come only from a reviewed certification — never from sign-up.</li>
      </ul>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-gold-500/40 bg-ivory-100 p-4">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-join-consent" />
        <span className="text-sm text-ink-900">I agree that other signed-in members can see my network profile and activity.</span>
      </label>
      {err && <p className="mt-3 text-sm text-crimson-700" role="alert">Joining failed. Please try again.</p>}
      <button className={`${btn} mt-5 px-6 py-3 text-sm`} disabled={!ok || pending} onClick={() => { setErr(false); run({ action: 'join', accepted: true }).then(onJoined).catch(() => setErr(true)); }} data-testid="button-join-network">Enter the network</button>
    </Onboard>
  );
}

const NAV = [
  { href: '/member', label: 'Feed', icon: Home, exact: true },
  { href: '/member/people', label: 'People', icon: Users },
  { href: '/member/messages', label: 'Messages', icon: MessageSquare },
  { href: '/member/certifications', label: 'Official', icon: Award },
  { href: '/member/packages', label: 'Packages', icon: Briefcase },
];

function AppShell({ me, base, children }: Ctx & { children: ReactNode }) {
  const [loc] = useLocation();
  const { signOut } = useClerk();
  const unread = base.threads.reduce((n, t) => n + t.unread, 0) + base.threads.filter((t) => !t.accepted && !t.requestedByMe).length;
  const active = (h: string, exact?: boolean) => (exact ? loc === h || loc === '/member/' : loc.startsWith(h));
  const nav = [...NAV, ...(me.founder ? [{ href: '/member/admin', label: 'Admin', icon: Shield }] : [])];
  return (
    <Frame>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gold-500/25 bg-lagoon-900/95 backdrop-blur" data-testid="network-header">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link href="/member" className="flex min-w-0 items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" aria-label="The One Movement International — Network home" data-testid="link-network-home">
            <img src={`${basePath}/logo.svg`} alt="" className="h-8 w-8 shrink-0" />
            <span className="min-w-0 font-display text-[10px] tracking-[0.08em] text-ivory-100 sm:text-xs">
              <span className="block">THE ONE MOVEMENT</span>
              <span className="mt-0.5 block text-[9px] tracking-[0.16em] text-gold-400 sm:text-[10px]">INTERNATIONAL</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/member/messages" className="relative rounded-full p-2 text-ivory-200 hover:text-gold-400 md:hidden" aria-label={`Messages${unread ? `, ${unread} need attention` : ''}`}>
              <Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-ink-900">{unread}</span>}
            </Link>
            <Link href="/" className="hidden rounded-full px-3 py-1.5 text-xs text-ivory-300 hover:text-gold-400 sm:inline-flex" data-testid="link-public-site">Public site</Link>
            <Link href="/member/settings" aria-label="Settings" className="rounded-full p-1" data-testid="link-settings"><Avatar m={me} size={32} /></Link>
            <button type="button" onClick={() => signOut({ redirectUrl: basePath || '/' })} aria-label="Sign out" className="rounded-full p-2 text-ivory-300 hover:text-gold-400" data-testid="button-signout"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-0 pb-24 pt-16 sm:px-4 md:pb-10 md:pt-24">
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 md:flex">
          <Link href={`/member/profile/${me.id}`} className="mb-3 flex items-center gap-3 rounded-2xl border border-sand-200 bg-ivory-50 p-3" data-testid="link-my-profile">
            <Avatar m={me} size={40} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-900">{me.fullName}</span><span className="block text-xs text-sand-400">{me.followers} followers · {me.following} following</span></span>
          </Link>
          {nav.map(({ href, label, icon: I, exact }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active(href, exact) ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid={`nav-${label.toLowerCase()}`}>
              <I className="h-4 w-4" />{label}{label === 'Messages' && unread > 0 && <span className="ml-auto rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-ink-900">{unread}</span>}
            </Link>
          ))}
          <Link href="/member/invite" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/invite') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid="nav-invite"><UserPlus className="h-4 w-4" />Invite{base.growth && !me.founder && <span className="ml-auto text-[10px] text-sand-400">{Math.min(base.growth.qualifiedInvites, base.growth.requiredInvites)}/{base.growth.requiredInvites}</span>}</Link>
          <Link href="/member/settings" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/settings') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`}><Settings className="h-4 w-4" />Settings & workspace</Link>
          <Link href="/donate" className="mt-4 flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-ink-800 hover:border-gold-500" data-testid="link-humanitarian"><HandHeart className="h-4 w-4 text-gold-700" />Humanitarian action</Link>
        </aside>
        <main className="min-w-0 flex-1"><PendingInvitation />{children}</main>
      </div>
      <nav aria-label="Network" className="fixed inset-x-0 bottom-0 z-40 grid border-t border-sand-200 bg-ivory-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
        {nav.map(({ href, label, icon: I, exact }) => (
          <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] ${active(href, exact) ? 'text-lagoon-700 font-semibold' : 'text-sand-400'}`}>
            <I className="h-5 w-5" />{label}
            {label === 'Messages' && unread > 0 && <span className="absolute right-[22%] top-1 h-2 w-2 rounded-full bg-coral-500" />}
          </Link>
        ))}
      </nav>
    </Frame>
  );
}

function NetworkGate() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const profileQ = useGetMemberProfile({ query: { enabled: !!isSignedIn, queryKey: getGetMemberProfileQueryKey() } });
  const stateQ = useGetNetworkState(undefined, { query: { enabled: !!isSignedIn, queryKey: getGetNetworkStateQueryKey(), refetchInterval: 25000 } });

  if (profileQ.isLoading || stateQ.isLoading) return <Frame><div className="mx-auto max-w-2xl px-4 py-10"><Skeleton rows={4} /></div></Frame>;
  if (stateQ.isError) {
    const s = errStatus(stateQ.error);
    return (
      <Onboard eyebrow={s === 403 ? 'ACCESS PAUSED' : 'CONNECTION'} title={s === 403 ? 'Verified email required' : 'The network did not load'}>
        <p className="mb-4 text-sm text-ink-700">{s === 403 ? 'Only members with a verified email address can enter the network. If your account was suspended after moderation, contact the TOMI team.' : 'Check your connection and try again.'}</p>
        <ErrorBox onRetry={() => stateQ.refetch()} msg="Unable to open your member network." />
      </Onboard>
    );
  }
  const state = stateQ.data!;
  if (!state.me) {
    return (
      <Onboard eyebrow="WELCOME" title="Create your member profile">
        <p className="mb-6 text-sm text-ink-700">Name, role and at least one sector are enough to begin. You decide separately whether you appear in the public web directory.</p>
        <ProfileForm initial={profileQ.data?.profile ?? null} defaultName={user?.fullName ?? ''} onDone={() => stateQ.refetch()} />
      </Onboard>
    );
  }
  if (!state.me.enabled) return <JoinConsent onJoined={() => stateQ.refetch()} />;
  const me = state.me;
  return (
    <MeCtx.Provider value={{ me, base: state }}>
      <AppShell me={me} base={state}>
        <Switch>
          <Route path="/member" component={Feed} />
          <Route path="/user-portal"><Redirect to="/member" replace /></Route>
          <Route path="/member/people" component={People} />
          <Route path="/member/profile/:id" component={ProfilePage} />
          <Route path="/member/messages/:id?" component={Messages} />
          <Route path="/member/packages" component={Packages} />
          <Route path="/member/certifications" component={Certifications} />
          <Route path="/member/admin">{me.founder ? <Admin /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/invite"><div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0"><h1 className="font-display text-2xl text-ink-900">Invite and unlock publishing</h1><InvitationProgress growth={state.growth} founder={me.founder} /></div></Route>
          <Route path="/member/settings" component={SettingsPage} />
          <Route><Redirect to="/member" replace /></Route>
        </Switch>
      </AppShell>
    </MeCtx.Provider>
  );
}

export default function MemberPage() {
  return (
    <>
      <Helmet><title>TOMI NETWORK — THE ONE MOVEMENT INTERNATIONAL</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Show when="signed-in"><NetworkGate /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}
