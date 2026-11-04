import { useState, type ReactNode } from 'react';
import InvitationProgress from '@/components/network/InvitationProgress';
import PendingInvitation from '@/components/network/PendingInvitation';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect, Route, Switch, useLocation, useSearch } from 'wouter';
import { Show, useAuth, useUser, useClerk } from '@clerk/react';
import { Award, BadgeCheck, Bell, Building2, Sparkles, UserPlus, Briefcase, Compass, Globe2, HandHeart, Home, Newspaper, LogOut, MessageSquare, Settings, Shield, Users } from 'lucide-react';
import {
  useGetMemberProfile, getGetMemberProfileQueryKey, useGetNetworkState, getGetNetworkStateQueryKey,
} from '@workspace/api-client-react';
import { basePath } from '@/lib/clerk';
import { gratitudeIntent } from '@/lib/gratitude-intent';
import universe from '@/assets/media/ecosystem/community-universe.webp';
import tomiLogo from '@/assets/media/home/tomi-official-logo.png';
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
import FounderWorkspace from './FounderWorkspace';
import FounderNews from './FounderNews';
import FounderMedia from './FounderMedia';
import FounderMembers from './FounderMembers';
import FounderMemberDetail from './FounderMemberDetail';
import FounderSectors from './FounderSectors';
import { FounderAlertBadge } from '@/components/founder/CommandOverview';
import FounderPartners from './FounderPartners';
import FounderPrograms from './FounderPrograms';
import FounderPages from './FounderPages';
import SettingsPage from './Settings';
import JourneyProgress, { useJourney } from './JourneyProgress';
import MemberWelcome from './MemberWelcome';
import MemberOnboarding from './Onboarding';
import Connections from './Connections';
import ThanksEmiratesForm from './ThanksEmirates';
import ThanksTheWorldMember from './ThanksTheWorld';
import Membership from './Membership';
import MemberEcosystem from './Ecosystem';
import Business, { BusinessDetail } from './Business';
import { LanguageSwitcher } from '@/lib/locale';
import { getPendingSector, clearPendingSector } from '@/lib/network-invitations';
import { SECTORS } from '@/lib/sectors-data';

function PendingSector() {
  const { userId } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const sector = SECTORS.find(s => s.slug === getPendingSector(userId));
  if (!sector || dismissed) return null;
  return <div className="mx-3 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-500/40 bg-ivory-50 p-4 md:mx-0" data-testid="pending-sector">
    <p className="flex-1 text-sm text-ink-800">You explored {sector.name}. Adding it to your profile is optional. Nothing is saved until you confirm; you can still explore every sector.</p>
    <Link href="/member/settings" className={btn}>Review my profile</Link>
    <button type="button" className="text-xs text-ink-700 underline" onClick={() => { clearPendingSector(); setDismissed(true); }}>Dismiss</button>
  </div>;
}


function Frame({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-ivory-100">{children}</div>;
}

function Onboard({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <Frame>
      <div className="relative h-44 overflow-hidden bg-lagoon-900 sm:h-56">
        <img src={universe} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-lagoon-900 to-transparent" />
        <Link href="/" aria-label="The One Movement International — Home" className="absolute left-5 top-5 rounded focus-visible:ring-2 focus-visible:ring-gold-500">
          <img src={tomiLogo} alt="The One Movement International" width={640} height={336} className="h-14 w-auto" />
        </Link>
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

function ActivationPrompt() {
  const { run, pending } = useAct();
  const [err, setErr] = useState(false);
  const journey = useJourney();
  if (journey.profileQ.isLoading) return null;
  return (
    <section id="panel-activate" className="mx-3 mb-4 rounded-2xl border border-gold-500/40 bg-lagoon-900 p-4 text-ivory-100 md:mx-0" data-testid="panel-activate">
      <p className="text-eyebrow text-gold-400">YOUR PROFILE LISTING IS OPTIONAL</p>
      <p className="mt-1 text-sm leading-relaxed text-ivory-200">All verified members can post, follow and explore the community. Choose whether your profile appears in the member directory below. This does not change your separate public-directory or media privacy settings; an incomplete profile is never a barrier to participating.</p>
      {err && <p className="mt-2 text-xs text-coral-500" role="alert">The profile visibility setting could not be saved. Try again.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="inline-flex items-center rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" disabled={pending} onClick={() => { setErr(false); run({ action: 'join', accepted: !journey.activated }).catch(() => setErr(true)); }} data-testid="button-activate">{journey.activated ? 'Remove my profile from People' : 'Show my profile in People'}</button>
        <Link href="/member/settings" className="inline-flex items-center rounded-full border border-ivory-200/40 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400" data-testid="link-edit-before-activate">Manage profile and privacy</Link>
      </div>
    </section>
  );
}

function CompleteProfile({ me }: { me: Ctx['me'] }) {
  const key = `tomi-complete-dismissed-${me.id}`;
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(key) === '1'; } catch { return false; } });
  const journey = useJourney();
  if (hidden || !me.enabled || journey.profileQ.isLoading || journey.complete) return null;
  return (
    <div className="mx-3 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sand-200 bg-ivory-50 p-3 md:mx-0" data-testid="panel-complete-profile">
      <Avatar m={me} size={36} />
      <p className="min-w-0 flex-1 text-sm text-ink-800">Adding a profession, country and sectors helps people understand your work. You can keep participating while you complete them; public listing stays under your control.</p>
      <Link href="/member/onboarding" className={btn} data-testid="link-complete-profile">Complete profile</Link>
      <button type="button" className="text-xs text-sand-400 hover:text-ink-800" onClick={() => { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } setHidden(true); }} data-testid="button-dismiss-complete">Later</button>
    </div>
  );
}

const NAV = [
  { href: '/member', label: 'The One Feed', icon: Home, exact: true },
  { href: '/member/people', label: 'People', icon: Users },
  { href: '/member/messages', label: 'Messages', icon: MessageSquare },
  { href: '/member/certifications', label: 'Official', icon: Award },
  { href: '/member/packages', label: 'Packages', icon: Briefcase },
];

function AppShell({ me, base, children }: Ctx & { children: ReactNode }) {
  const [loc] = useLocation();
  const personalPage = loc === '/member/settings' || loc === `/member/profile/${me.id}`;
  const { signOut } = useClerk();
  const unread = base.threads.reduce((n, t) => n + t.unread, 0) + base.threads.filter((t) => !t.accepted && !t.requestedByMe).length;
  const active = (h: string, exact?: boolean) => (exact ? loc === h || loc === '/member/' : loc.startsWith(h));
  const nav = [...NAV, ...(me.founder ? [{ href: '/member/admin', label: 'Admin', icon: Shield }] : [])];
  return (
    <Frame>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gold-500/25 bg-lagoon-900/95 backdrop-blur" data-testid="network-header">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" aria-label="The One Movement International — Home" data-testid="link-network-home">
            <img src={tomiLogo} alt="The One Movement International" width={640} height={336} className="h-auto w-[72px] object-contain sm:w-24" data-testid="img-network-logo" />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            {me.founder && <FounderAlertBadge />}
                        <Link href="/member/messages" className="relative rounded-full p-2 text-ivory-200 hover:text-gold-400 md:hidden" aria-label={`Messages${unread ? `, ${unread} need attention` : ''}`}>
              <Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-ink-900">{unread}</span>}
            </Link>
            <Link href="/" className="hidden rounded-full px-3 py-2 text-xs text-ivory-300 hover:text-gold-400 md:inline-flex" data-testid="link-public-site">Home</Link>
            <Link href="/ecosystem" className="hidden rounded-full px-3 py-2 text-xs text-ivory-300 hover:text-gold-400 md:inline-flex" data-testid="link-public-explore">Explore</Link>
            <Link href="/news" className="hidden rounded-full px-3 py-2 text-xs text-ivory-300 hover:text-gold-400 md:inline-flex" data-testid="link-public-news">News</Link>
            <Link href="/member/settings" aria-label="Settings and edit profile" className="rounded-full p-2 text-ivory-300 hover:text-gold-400" data-testid="link-settings"><Settings className="h-4 w-4" /></Link>
            <Link href={`/member/profile/${me.id}`} aria-label="My profile" className="flex items-center gap-1.5 rounded-full p-1 pr-1 sm:pr-3 text-xs text-ivory-200 hover:text-gold-400" data-testid="link-header-profile"><Avatar m={me} size={32} /><span className="hidden sm:inline">My profile</span></Link>
            <button type="button" onClick={() => signOut({ redirectUrl: basePath || '/' })} aria-label="Sign out" title="Sign out" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full p-2 text-xs text-ivory-300 hover:text-coral-500" data-testid="button-signout"><LogOut className="h-4 w-4" /><span className="hidden lg:inline">Sign out</span></button>
          </div>
        </div>
        <nav aria-label="Public site navigation" className="border-t border-gold-500/20 bg-lagoon-800 md:hidden" data-testid="nav-public-mobile">
          <div className="grid h-11 grid-cols-4 text-xs font-semibold text-ivory-100">
            <Link href="/" className="flex items-center justify-center gap-1.5 hover:text-gold-400" data-testid="link-mobile-home"><Home className="h-3.5 w-3.5 text-gold-400" />Home</Link>
            <Link href="/member/ecosystem" className="flex items-center justify-center gap-1.5 border-l border-gold-500/20 hover:text-gold-400" data-testid="link-mobile-space"><BadgeCheck className="h-3.5 w-3.5 text-gold-400" />My space</Link>
            <Link href="/ecosystem" className="flex items-center justify-center gap-1.5 border-x border-gold-500/20 hover:text-gold-400" data-testid="link-mobile-explore"><Compass className="h-3.5 w-3.5 text-gold-400" />Explore</Link>
            <Link href="/news" className="flex items-center justify-center gap-1.5 hover:text-gold-400" data-testid="link-mobile-news"><Newspaper className="h-3.5 w-3.5 text-gold-400" />News</Link>
          </div>
        </nav>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-0 pb-24 pt-[6.75rem] sm:px-4 md:pb-10 md:pt-24">
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 md:flex">
          <Link href={`/member/profile/${me.id}`} className="mb-3 flex items-center gap-3 rounded-2xl border border-sand-200 bg-ivory-50 p-3" data-testid="link-my-profile">
            <Avatar m={me} size={40} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-900">{me.fullName}</span><span className="block text-xs text-sand-400">{me.followers} followers · {me.following} following</span></span>
          </Link>
          <Link href="/member/ecosystem" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/ecosystem') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid="nav-my-space"><Compass className="h-4 w-4" />My space</Link>
          {nav.map(({ href, label, icon: I, exact }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active(href, exact) ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid={`nav-${label.toLowerCase()}`}>
              <I className="h-4 w-4" />{label}{label === 'Messages' && unread > 0 && <span className="ml-auto rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-ink-900">{unread}</span>}
            </Link>
          ))}
          {me.founder && (
            <Link href="/member/founder" aria-current={active('/member/founder') ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${active('/member/founder') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'border border-gold-500/35 text-lagoon-900 hover:bg-ivory-200'}`} data-testid="nav-founder-workspace">
              <Shield className="h-4 w-4 shrink-0" />Founder Command Center
            </Link>
          )}
          <Link href="/member/invite" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/invite') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid="nav-invite"><UserPlus className="h-4 w-4" />Invite{base.growth && !me.founder && <span className="ml-auto text-[10px] text-sand-400">{base.growth.qualifiedInvites}</span>}</Link>
          <Link href="/member/membership" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/membership') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid="nav-membership"><BadgeCheck className="h-4 w-4" />Membership</Link>
          <Link href="/member/business" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/business') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`} data-testid="nav-business"><Building2 className="h-4 w-4" />Company</Link>
          <Link href="/member/settings" className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${active('/member/settings') ? 'bg-lagoon-900 font-semibold text-gold-400' : 'text-ink-800 hover:bg-ivory-200'}`}><Settings className="h-4 w-4" />Settings & workspace</Link>
          <Link href="/member/thanks-emirates" className={`mt-4 flex items-center gap-3 rounded-2xl border border-lagoon-600/40 px-4 py-3 text-sm ${active('/member/thanks-emirates') ? 'bg-lagoon-900 text-gold-400' : 'bg-lagoon-600/5 text-ink-800 hover:border-lagoon-600'}`} data-testid="nav-thanks-emirates"><Sparkles className="h-4 w-4 text-lagoon-600" />Thanks Emirates</Link>
          <Link href="/member/thanks-the-world" className={`mt-2 flex items-center gap-3 rounded-2xl border border-gold-500/40 px-4 py-3 text-sm ${active('/member/thanks-the-world') ? 'bg-lagoon-900 text-gold-400' : 'text-ink-800 hover:border-gold-500'}`} data-testid="nav-thanks-the-world"><Globe2 className="h-4 w-4 text-gold-700" />Thanks the World</Link>
          <Link href="/donate" className="mt-2 flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-ink-800 hover:border-gold-500" data-testid="link-humanitarian"><HandHeart className="h-4 w-4 text-gold-700" />Humanitarian action</Link>
        </aside>
        <main className="min-w-0 flex-1">
          {me.founder && (
            <Link href="/member/founder" aria-current={active('/member/founder') ? 'page' : undefined} className="mx-3 mb-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-gold-500/40 bg-lagoon-900 px-4 py-3 text-sm font-semibold text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 md:hidden" data-testid="nav-founder-workspace-mobile">
              Founder Command Center<Shield className="h-4 w-4 shrink-0" />
            </Link>
          )}
          <Link href="/member/thanks-emirates" className="mx-3 mt-4 mb-3 flex items-center justify-between gap-3 rounded-xl border border-gold-500/40 bg-lagoon-900 px-4 py-3 text-xs text-ivory-100 md:hidden" data-testid="nav-thanks-emirates-mobile">
            <span>Thanks Emirates · Share your story</span><Sparkles className="h-4 w-4 shrink-0 text-gold-400" />
          </Link>
          <Link href="/member/thanks-the-world" className="mx-3 mb-3 flex items-center justify-between gap-3 rounded-xl border border-gold-500/40 bg-ivory-50 px-4 py-3 text-xs text-ink-800 md:hidden" data-testid="nav-thanks-the-world-mobile">
            <span>Thanks the World · Your stories</span><Globe2 className="h-4 w-4 shrink-0 text-gold-700" />
          </Link>
          <div className="tomi-member-path mx-3 mb-4 md:mx-0" aria-label="Belong, discover, connect, contribute, grow" data-testid="member-path"><span>Belong</span><span>Discover</span><span>Connect</span><span>Contribute</span><span>Grow</span></div>
          {(loc === '/member' || loc === '/member/') && <><JourneyProgress compact /><MemberWelcome /></>}
          {me.enabled ? <PendingInvitation /> : !personalPage && <ActivationPrompt />}{!personalPage && <CompleteProfile me={me} />}{!personalPage && <PendingSector />}{children}
        </main>
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
      <Onboard eyebrow={s === 403 ? 'ACCESS PAUSED' : 'CONNECTION'} title={s === 403 ? 'Verified account required' : 'The network did not load'}>
        <p className="mb-4 text-sm text-ink-700">{s === 403 ? 'Only members with a verified account can enter the network. If your account was suspended after moderation, contact the TOMI team.' : 'Check your connection and try again.'}</p>
        <ErrorBox onRetry={() => stateQ.refetch()} msg="Unable to open your member network." />
      </Onboard>
    );
  }
  const state = stateQ.data!;
  if (!state.me) {
    return (
      <Onboard eyebrow="WELCOME" title="Create your member profile">
        <p className="mb-6 text-sm text-ink-700">Membership is free. A verified account can participate while your profile is in progress. Add your account type, name, profession, country and sectors when ready; profile completion, directory listing and official certification are separate choices.</p>
        <ProfileForm onboarding initial={profileQ.data?.profile ?? null} defaultName={user?.fullName ?? ''} onDone={() => stateQ.refetch()} />
      </Onboard>
    );
  }
  const me = state.me;
  return (
    <MeCtx.Provider value={{ me, base: state }}>
      <AppShell me={me} base={state}>
        <Switch>
          <Route path="/member" component={Feed} />
          <Route path="/member/ecosystem" component={MemberEcosystem} />
          <Route path="/user-portal"><Redirect to="/member" replace /></Route>
          <Route path="/member/people" component={People} />
          <Route path="/member/profile/:id/:conn" component={Connections} />
          <Route path="/member/profile/:id" component={ProfilePage} />
          <Route path="/member/messages/:id?" component={Messages} />
          <Route path="/member/packages" component={Packages} />
          <Route path="/member/certifications" component={Certifications} />
          <Route path="/member/admin">{me.founder ? <Admin /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/news">{me.founder ? <FounderNews /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/partners">{me.founder ? <FounderPartners /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/programs">{me.founder ? <FounderPrograms /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/pages">{me.founder ? <FounderPages /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/members/:clerkId">{me.founder ? <FounderMemberDetail /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/sectors/:slug">{me.founder ? <FounderSectors /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/sectors">{me.founder ? <FounderSectors /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/members">{me.founder ? <FounderMembers /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder/media">{me.founder ? <FounderMedia /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/founder">{me.founder ? <FounderWorkspace /> : <Redirect to="/member" replace />}</Route>
          <Route path="/member/invite"><div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0"><h1 className="font-display text-2xl text-ink-900">Invite your community</h1><InvitationProgress growth={state.growth} founder={me.founder} /></div></Route>
          <Route path="/member/membership" component={Membership} />
          <Route path="/member/business/:memberId" component={BusinessDetail} />
          <Route path="/member/business" component={Business} />
          <Route path="/member/settings" component={SettingsPage} />
          <Route path="/member/onboarding" component={MemberOnboarding} />
          <Route path="/member/thanks-emirates" component={ThanksEmiratesForm} />
          <Route path="/member/thanks-the-world" component={ThanksTheWorldMember} />
          <Route><Redirect to="/member" replace /></Route>
        </Switch>
      </AppShell>
    </MeCtx.Provider>
  );
}

export default function MemberPage() {
  const [location] = useLocation();
  const search = useSearch();
  const intent = location === '/member/thanks-the-world' ? gratitudeIntent(search) : null;
  return (
    <>
      <Helmet><title>TOMI NETWORK — THE ONE MOVEMENT INTERNATIONAL</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Show when="signed-in"><NetworkGate /></Show>
      <Show when="signed-out"><Redirect to={intent ? `/sign-in?gratitudeIntent=${intent}` : '/sign-in'} /></Show>
    </>
  );
}
