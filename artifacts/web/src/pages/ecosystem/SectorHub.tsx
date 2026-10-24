import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useParams } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@clerk/react';
import { ArrowLeft, ArrowRight, ExternalLink, RotateCw } from 'lucide-react';
import '@/styles/universe.css';
import '@/styles/exhibition.css';
import {
  useGetEcosystemMembers,
  useGetMemberProfile,
  useGetNetworkState,
  getGetMemberProfileQueryKey,
  getGetNetworkStateQueryKey,
  type PublicMember,
  type NetworkPost,
} from '@workspace/api-client-react';
import { SECTORS, getSectorBySlug, type Sector } from '@/lib/sectors-data';
import { programsForSector, resourcesForSector, sectorName, formatChecked } from '@/lib/ecosystem-match';
import SectorEmblem from '@/components/ecosystem/SectorEmblem';
import SectorWorld from '@/components/ecosystem/worlds/SectorWorld';
import RealEstateWorld from '@/components/ecosystem/RealEstateWorld';
import FashionConnections from '@/components/programs/FashionConnections';
import FashionWorldContext from '@/components/ecosystem/FashionWorldContext';
import PeaceVoices from '@/components/programs/PeaceVoices';
import WorldMotif from '@/components/ecosystem/worlds/WorldMotif';
import { getWorldConfig } from '@/components/ecosystem/worlds/world-config';

const AREAS = [
  { id: 'discover', n: '01', label: 'Discover' },
  { id: 'community', n: '02', label: 'Community' },
  { id: 'learn', n: '03', label: 'Learn & Grow' },
  { id: 'opportunities', n: '04', label: 'Opportunities' },
  { id: 'posts', n: '05', label: 'Community Posts' },
  { id: 'collaborate', n: '06', label: 'Collaborate' },
  { id: 'activity', n: '07', label: 'My Activity' },
] as const;

const STATUS_LABEL: Record<string, string> = { announced: 'Announced', planned: 'Planned · details not yet confirmed', postponed: 'Postponed' };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

/** Editorial related worlds: sectors that share an official programme with this one. */
function relatedWorlds(sector: Sector) {
  const mine = new Set(sector.relatedPrograms.map((p) => p.toUpperCase()));
  return SECTORS.filter((s) => s.slug !== sector.slug)
    .map((s) => ({ s, shared: s.relatedPrograms.filter((p) => mine.has(p.toUpperCase())) }))
    .filter((x) => x.shared.length)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 6);
}

function Area({ id, n, title, lead, children, tone = 'light' }: { id: string; n: string; title: string; lead?: ReactNode; children: ReactNode; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-28 border-t py-16 ${dark ? 'border-lagoon-600/40 bg-lagoon-900 text-ivory-100' : 'border-sand-200 bg-ivory-100 text-ink-900'}`} data-testid={`section-hub-${id}`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className={`font-mono text-[11px] uppercase tracking-[0.24em] ${dark ? 'text-gold-400' : 'text-gold-700'}`}>{n} / 07</p>
          <h2 id={`${id}-title`} className="mt-2 font-display text-2xl tracking-[0.06em] sm:text-3xl">{title.toUpperCase()}</h2>
          {lead && <div className={`mt-3 text-sm leading-relaxed ${dark ? 'text-ivory-300' : 'text-ink-700'}`}>{lead}</div>}
        </header>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

function Retry({ msg, onRetry, busy, testid }: { msg: string; onRetry: () => void; busy: boolean; testid: string }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 border border-crimson-700/30 bg-crimson-700/5 p-5">
      <p className="text-sm text-crimson-700">{msg}</p>
      <button type="button" onClick={onRetry} disabled={busy} data-testid={testid} className="inline-flex min-h-[44px] items-center gap-2 bg-lagoon-900 px-4 text-xs uppercase tracking-wider text-ivory-100 disabled:opacity-60">
        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-gold-500/50 p-6">
      <p className="font-display text-base tracking-wide">{title}</p>
      {children && <div className="mt-2 text-sm leading-relaxed opacity-80">{children}</div>}
    </div>
  );
}

const linkCls = 'inline-flex min-h-[44px] items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-lagoon-700 underline-offset-4 hover:text-gold-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500';
const btnCls = 'inline-flex min-h-[44px] items-center justify-center gap-2 bg-gold-500 px-5 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-700';

function PersonCard({ m, slug, signedIn }: { m: PublicMember; slug: string; signedIn: boolean }) {
  const [failed, setFailed] = useState(false);
  const href = signedIn && m.enabled ? `/member/profile/${m.id}` : `/community/members/${m.id}`;
  return (
    <li className="min-w-0">
      <Link href={href} data-testid={`link-hub-member-${m.id}`} className="flex h-full min-w-0 flex-col gap-2 border border-sand-200 bg-ivory-50 p-4 [overflow-wrap:anywhere] hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
        <span className="flex min-w-0 items-center gap-3">
          {m.avatarUrl && !failed
            ? <img src={`${import.meta.env.BASE_URL}${m.avatarUrl.replace(/^\//, '')}`} alt="" loading="lazy" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            : <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lagoon-900 font-display text-xs text-gold-400">{initials(m.fullName)}</span>}
          <span className="min-w-0">
            <span className="block truncate font-display text-sm text-ink-900">{m.fullName}</span>
            <span className="block truncate text-xs text-ink-700">{[m.profession, m.organization, m.country].filter(Boolean).join(' · ')}</span>
          </span>
        </span>
        {m.offering && <span className="text-xs text-ink-700 line-clamp-2"><b className="text-lagoon-600">Offers: </b>{m.offering}</span>}
        <span className="mt-auto flex flex-wrap gap-1 pt-1">
          {m.sectors.map((s) => <span key={s} className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${s === slug ? 'bg-gold-500/25 text-ink-900' : 'bg-ivory-200 text-ink-700'}`}>{sectorName(s)}</span>)}
        </span>
      </Link>
    </li>
  );
}

function PostCard({ p, slug }: { p: NetworkPost; slug: string }) {
  return (
    <li className="border border-lagoon-600/50 bg-lagoon-800/60 p-4" data-testid={`card-hub-post-${p.id}`}>
      <p className="flex flex-wrap items-center gap-x-2 text-xs text-ivory-300">
        <Link href={`/member/profile/${p.author.id}`} className="font-semibold text-ivory-100 hover:text-gold-400">{p.author.fullName}</Link>
        <span>· {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ivory-100 line-clamp-6 [overflow-wrap:anywhere]">{p.text}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-gold-400">Author selected {sectorName(slug)} on their profile</p>
    </li>
  );
}

function useSignedInAreas(sector: Sector): [ReactNode, ReactNode] {
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = !!(isLoaded && isSignedIn);
  const params = { sector: sector.slug };
  const profileQ = useGetMemberProfile({ query: { enabled, queryKey: getGetMemberProfileQueryKey() } });
  const netQ = useGetNetworkState(params, { query: { enabled, queryKey: getGetNetworkStateQueryKey(params), retry: false } });
  const profile = profileQ.data?.profile ?? null;
  const following = !!profile?.sectors.includes(sector.slug as (typeof profile.sectors)[number]);
  const posts = useMemo(() => (netQ.data?.posts ?? []).filter((p) => p.author.sectors.includes(sector.slug as (typeof p.author.sectors)[number])).slice(0, 6), [netQ.data, sector.slug]);
  const networkMembers = useMemo(() => (netQ.data?.members ?? []).filter((m) => m.id !== netQ.data?.me?.id).slice(0, 6), [netQ.data]);

  const postsArea = (
      <Area id="posts" n="05" title="Community Posts" tone="dark" lead={<p>Only posts the member network already shows you, from authors who chose {sector.name} on their own profile. Existing moderation, blocking and reporting stay in place on the full feed.</p>}>
        {!isLoaded ? <div className="h-32 animate-pulse bg-lagoon-800" aria-busy="true" /> : !enabled ? (
          <Empty title="A dedicated sector feed is not available yet.">
            <p>Member posts live in the moderated community feed, visible after signing in. Posts are not yet tagged by sector, so nothing is shown here as if it were.</p>
            <div className="mt-3 flex flex-wrap gap-3"><Link href="/community" className={`${linkCls} !text-gold-400`} data-testid="link-hub-community-feed">Open the community <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>
          </Empty>
        ) : netQ.isLoading ? <div className="grid gap-3" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-28 animate-pulse bg-lagoon-800" />)}</div>
          : netQ.isError ? <Retry msg="Your member feed could not be loaded." onRetry={() => netQ.refetch()} busy={netQ.isFetching} testid="button-retry-hub-posts" />
          : posts.length ? (
            <>
              <ul className="grid gap-3">{posts.map((p) => <PostCard key={p.id} p={p} slug={sector.slug} />)}</ul>
              <Link href="/member" className={`${linkCls} mt-4 !text-gold-400`} data-testid="link-hub-full-feed">Comment, like or report in the full feed <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            </>
          ) : (
            <Empty title={`No recent posts from ${sector.name} members in your feed.`}>
              <p>The sector view only filters the latest page of your existing feed by authors' chosen sectors.</p>
              <Link href="/member" className={`${linkCls} !text-gold-400`} data-testid="link-hub-feed-empty">Go to the member feed</Link>
            </Empty>
          )}
      </Area>
  );
  const activityArea = (
      <Area id="activity" n="07" title="My Activity" lead={<p>Your sector participation is managed in your member settings, using what the platform already stores.</p>}>
        {!isLoaded ? <div className="h-32 animate-pulse bg-ivory-200" aria-busy="true" /> : !enabled ? (
          <Empty title="Sign in to manage your participation.">
            <p>Members choose up to eight sectors, save resources and read the community feed.</p>
            <div className="mt-3 flex flex-wrap gap-3"><Link href="/sign-in" className={btnCls} data-testid="link-hub-signin">Sign in</Link><Link href="/join" className={linkCls} data-testid="link-hub-join">Join the movement</Link></div>
          </Empty>
        ) : profileQ.isLoading ? <div className="h-32 animate-pulse bg-ivory-200" aria-busy="true" />
          : profileQ.isError ? <Retry msg="Your profile could not be loaded." onRetry={() => profileQ.refetch()} busy={profileQ.isFetching} testid="button-retry-hub-profile" />
          : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-sand-200 bg-ivory-50 p-4 sm:col-span-3" data-testid="status-hub-following">
                <p className="text-eyebrow text-gold-700">Sector on your profile</p>
                <p className="mt-1 font-display text-lg">{!profile ? 'No member profile yet' : following ? `${sector.name} is one of your sectors` : `${sector.name} is not on your profile`}</p>
                <p className="mt-1 text-xs text-ink-700">{profile ? `${profile.sectors.length} of 8 sectors selected${profile.sectors.length ? `: ${profile.sectors.map(sectorName).join(', ')}` : ''}.` : 'Create your profile to choose sectors.'}</p>
              </div>
              <Link href="/member/settings" className={`${btnCls} sm:col-span-1`} data-testid="link-hub-manage-sectors">{following ? 'Manage sectors' : 'Add in settings'}</Link>
              <Link href="/member/settings?tab=workspace" className={`${linkCls} justify-center border border-sand-300`} data-testid="link-hub-saved">Saved resources</Link>
              <Link href="/member" className={`${linkCls} justify-center border border-sand-300`} data-testid="link-hub-myfeed">My member feed</Link>
            </div>
          )}
        {enabled && networkMembers.length > 0 && (
          <div className="mt-8">
            <p className="text-eyebrow text-gold-700">Network members in {sector.name}</p>
            <ul className="mt-3 flex flex-wrap gap-2">{networkMembers.map((m) => (
              <li key={m.id}><Link href={`/member/profile/${m.id}`} className="inline-flex min-h-[44px] items-center gap-2 border border-sand-200 bg-ivory-50 px-3 text-xs hover:border-gold-500" data-testid={`link-hub-network-${m.id}`}><span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-lagoon-900 text-[10px] text-gold-400">{initials(m.fullName)}</span>{m.fullName}{m.followed && <span className="text-[10px] uppercase text-gold-700">Following</span>}</Link></li>
            ))}</ul>
          </div>
        )}
      </Area>
  );
  return [postsArea, activityArea];
}

export default function SectorHub() {
  const params = useParams<{ slug: string }>();
  const sector = getSectorBySlug(params.slug ?? '');
  const { isSignedIn } = useAuth();
  const membersQ = useGetEcosystemMembers();

  const sectorMembers = useMemo(() => (membersQ.data?.members ?? []).filter((m) => m.sectors.includes((sector?.slug ?? '') as PublicMember['sectors'][number])), [membersQ.data, sector?.slug]);

  if (!sector) {
    return (
      <main className="min-h-[100dvh] bg-lagoon-900 px-6 py-32 text-ivory-100">
        <div className="mx-auto max-w-xl">
          <p className="text-eyebrow text-gold-400">Unknown gateway</p>
          <h1 className="mt-3 font-display text-3xl">THIS WORLD DOES NOT EXIST</h1>
          <p className="mt-3 text-ivory-300">The ecosystem has seventeen sectors. Choose one of them.</p>
          <Link href="/ecosystem#explore" className={`${btnCls} mt-6`} data-testid="link-hub-back-unknown">See all seventeen</Link>
        </div>
      </main>
    );
  }

  const cfg = getWorldConfig(sector.slug);
  const accent = cfg?.accent ?? '39 52% 54%';
  const idx = SECTORS.findIndex((s) => s.slug === sector.slug);
  const programs = programsForSector(sector);
  const resources = resourcesForSector(sector.slug);
  const related = relatedWorlds(sector);
  const crossCounts = new Map<string, number>();
  sectorMembers.forEach((m) => m.sectors.forEach((s) => { if (s !== sector.slug) crossCounts.set(s, (crossCounts.get(s) ?? 0) + 1); }));
  const cross = [...crossCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const prev = SECTORS[(idx - 1 + SECTORS.length) % SECTORS.length];
  const next = SECTORS[(idx + 1) % SECTORS.length];

  return (
    <main className="bg-ivory-100" style={{ '--w': accent } as CSSProperties} data-testid={`page-sector-hub-${sector.slug}`}>
      <Helmet><title>{`${sector.name} · Ecosystem world · TOMI`}</title><meta name="description" content={`${sector.descriptor}. ${sector.contributes}`} /></Helmet>

      <header className="tomi-weave-dark relative isolate overflow-hidden bg-lagoon-900 pb-14 pt-28 text-ivory-100">
        {cfg && <div className="x-decor x-gates-ambient pointer-events-none absolute inset-0 -z-10 overflow-hidden [&>svg]:h-full [&>svg]:w-full" style={{ opacity: 0.14 }} aria-hidden="true"><WorldMotif motif={cfg.motif} /></div>}
        <div className="x-content relative mx-auto max-w-7xl px-5 sm:px-6">
          <Link href={`/ecosystem?sector=${sector.slug}#explore`} className="inline-flex min-h-[44px] items-center gap-2 text-xs uppercase tracking-[0.16em] text-ivory-300 hover:text-gold-400" data-testid="link-hub-back"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> All seventeen gateways</Link>
          <div className="mt-6 flex items-start gap-4">
            <div className="hidden shrink-0 sm:block"><SectorEmblem slug={sector.slug} /></div>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-400">World {String(idx + 1).padStart(2, '0')} of {SECTORS.length} · Ongoing sector</p>
              <h1 className="mt-2 break-words font-display text-4xl tracking-[0.06em] sm:text-6xl" data-testid="text-hub-title">{sector.name.toUpperCase()}</h1>
              <p className="mt-3 max-w-2xl text-lg text-ivory-200">{sector.descriptor}</p>
            </div>
          </div>
        </div>
        <nav aria-label="Sector areas" className="x-content relative mx-auto mt-10 max-w-7xl px-5 sm:px-6">
          <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {AREAS.map((a) => (
              <li key={a.id} className="shrink-0"><a href={`#${a.id}`} className="inline-flex min-h-[44px] items-center gap-2 border border-ivory-100/15 bg-lagoon-800/60 px-3 text-xs uppercase tracking-[0.12em] text-ivory-200 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid={`link-hub-area-${a.id}`}><span className="font-mono text-gold-400">{a.n}</span>{a.label}</a></li>
            ))}
          </ul>
        </nav>
      </header>

      <Area id="discover" n="01" title="Discover" lead={<p>{sector.contributes}</p>}>
        <p className="text-eyebrow text-gold-700">Who belongs here</p>
        <ul className="mt-3 flex flex-wrap gap-2">{sector.whoBelongs.map((w) => <li key={w} className="border border-sand-300 bg-ivory-50 px-3 py-1.5 text-sm">{w}</li>)}</ul>
        <p className="mt-6 text-sm text-ink-700">This sector is a permanent, ongoing world of the ecosystem. It is not an event, and it stays open between the official programmes it connects with.</p>
        <div className="mt-8 overflow-hidden">{sector.slug === 'real-estate' ? <RealEstateWorld /> : <SectorWorld slug={sector.slug} />}</div>
      </Area>

      {sector.slug === 'fashion' && (
        <>
          {/* Moved from the Fashion Week programme page (Task 33): ongoing sector content, not event content. */}
          <section aria-label="Fashion knowledge and training" className="border-t border-sand-200 bg-ivory-100 py-12" data-testid="section-fashion-sector-learning">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl text-ink-800">Pattern cutting, textile heritage, sustainable sourcing, fashion law, brand building and styling. Practitioners and educators can propose sessions or mentoring; proposals are reviewed before anything is announced.</p>
              <Link href="/programs/fashion-week#apply" className="tomi-cta inline-flex min-h-12 shrink-0 items-center border border-lagoon-900 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon-900" data-testid="link-fashion-sector-teach">Offer to teach or mentor</Link>
            </div>
          </section>
          <FashionWorldContext />
          <FashionConnections />
          <PeaceVoices />
        </>
      )}

      <Area id="community" n="02" title="Community" lead={<p>Members who chose {sector.name} and made their profile public themselves. Self-described, not endorsements or verified partnerships.</p>}>
        {membersQ.isLoading ? <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Loading members">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse bg-ivory-200" />)}</div>
          : membersQ.isError ? <Retry msg="Public members could not be loaded." onRetry={() => membersQ.refetch()} busy={membersQ.isFetching} testid="button-retry-hub-members" />
          : sectorMembers.length ? (
            <>
              <p className="mb-3 text-xs text-ink-700" data-testid="text-hub-member-count">{sectorMembers.length} public {sectorMembers.length === 1 ? 'profile' : 'profiles'}</p>
              <ul className="grid gap-3 sm:grid-cols-2">{sectorMembers.slice(0, 12).map((m) => <PersonCard key={m.id} m={m} slug={sector.slug} signedIn={!!isSignedIn} />)}</ul>
              {sectorMembers.length > 12 && <Link href={`/ecosystem?sector=${sector.slug}#directory`} className={`${linkCls} mt-3`} data-testid="link-hub-directory">See all in the directory</Link>}
            </>
          ) : (
            <Empty title={`No ${sector.name} profiles in the current public selection.`}>
              <p>Only members who opt into the public directory appear here. Explore the directory or update your own listing preferences.</p>
              <Link href="/member" className={`${btnCls} mt-3`} data-testid="link-hub-create-profile">Create your member space</Link>
            </Empty>
          )}
      </Area>

      <Area id="learn" n="03" title="Learn & Grow" tone="dark" lead={<p>Curated links to official public pages. TOMI does not host these materials and does not claim a partnership with their publishers.</p>}>
        {resources.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {resources.map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col gap-2 border border-lagoon-600/50 bg-lagoon-800/60 p-4 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid={`link-hub-resource-${r.id}`}>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-gold-400">{r.kind} · {r.organization}</span>
                  <span className="font-display text-base text-ivory-100">{r.title}</span>
                  <span className="text-sm text-ivory-300">{r.description}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] text-ivory-300">Checked {formatChecked(r.checkedOn)} <ExternalLink className="h-3 w-3" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></span>
                </a>
              </li>
            ))}
          </ul>
        ) : <Empty title="No curated resources for this sector yet."><p>Courses, books and guides will appear once sources are reviewed for licensing.</p></Empty>}
        <p className="mt-4 text-xs text-ivory-300">Courses, books and videos specific to {sector.name} are not yet published on the platform.</p>
      </Area>

      <Area id="opportunities" n="04" title="Opportunities" lead={<p>A reviewed sector-opportunity directory is not connected to this page yet. The programme links below are not job listings, castings or calls for applications.</p>}>
        <Empty title={`${sector.name} opportunity listings · awaiting publishing infrastructure`}>
          <p>Approved jobs, calls and project openings will appear here once a reviewed opportunity system exists. Meanwhile, the programmes this sector connects with are listed with their real status.</p>
        </Empty>
        <p className="mt-8 text-eyebrow text-gold-700">Connected official programmes</p>
        {programs.length ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {programs.map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className="flex h-full flex-col gap-1 border border-sand-200 bg-ivory-50 p-4 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-hub-program-${p.slug}`}>
                  <span className="font-display text-sm text-ink-900">{p.name}</span>
                  <span className="text-xs text-ink-700">{p.tagline}</span>
                  <span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-lagoon-700" data-testid={`status-hub-program-${p.slug}`}>{STATUS_LABEL[p.status ?? 'planned']}{p.status === 'announced' && p.date ? ` · ${p.date}` : ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-ink-700">No official programme is linked to this sector.</p>}
        <Link href="/opportunities" className={`${linkCls} mt-4`} data-testid="link-hub-opportunities">Programme pathways <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </Area>

      <SignedInPartsSlot sector={sector}>
        {(posts, activity) => (
          <>
            {posts}
            <Area id="collaborate" n="06" title="Collaborate" tone="dark" lead={<p>Two different things, kept apart: real overlaps between public members, and editorial suggestions based on shared official programmes.</p>}>
              <p className="text-eyebrow text-gold-400">Actual member overlaps</p>
              {membersQ.isLoading ? <div className="mt-3 h-16 animate-pulse bg-lagoon-800" /> : membersQ.isError ? <p className="mt-3 text-sm text-ivory-300">Unavailable until public members load.</p> : cross.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cross.map(([s, c]) => <li key={s}><Link href={`/ecosystem/${s}`} className="inline-flex min-h-[44px] items-center gap-2 border border-gold-500/40 px-3 text-xs text-ivory-100 hover:border-gold-400" data-testid={`link-hub-cross-${s}`}>{sectorName(s)}<span className="font-mono text-gold-400">{c} {c === 1 ? 'member' : 'members'} in both</span></Link></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-ivory-300">No shared sector interests appear in the current public selection.</p>}

              <p className="mt-10 text-eyebrow text-gold-400">Connected worlds · editorial suggestion</p>
              <ul className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {related.map(({ s, shared }) => (
                  <li key={s.slug}><Link href={`/ecosystem/${s.slug}`} className="flex h-full flex-col gap-1 border border-lagoon-600/50 bg-lagoon-800/60 p-4 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid={`link-hub-related-${s.slug}`}>
                    <span className="font-display text-sm tracking-[0.1em] text-ivory-100">{s.name.toUpperCase()}</span>
                    <span className="text-xs text-ivory-300">{s.descriptor}</span>
                    <span className="mt-2 text-[10px] uppercase tracking-[0.14em] text-gold-400">Shares {shared.join(', ')}</span>
                  </Link></li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ivory-300">Suggestions are not completed collaborations or partnerships.</p>
            </Area>
            {activity}
          </>
        )}
      </SignedInPartsSlot>

      <nav aria-label="Neighbouring worlds" className="border-t border-sand-200 bg-ivory-100">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-8 sm:px-6">
          <Link href={`/ecosystem/${prev.slug}`} className={linkCls} data-testid="link-hub-prev"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />{prev.name}</Link>
          <Link href={`/ecosystem/${next.slug}`} className={linkCls} data-testid="link-hub-next">{next.name}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </div>
      </nav>
    </main>
  );
}

/** Splits signed-in areas so the visible order stays 05 Posts, 06 Collaborate, 07 My Activity. */
function SignedInPartsSlot({ sector, children }: { sector: Sector; children: (posts: ReactNode, activity: ReactNode) => ReactNode }) {
  return <SplitSignedIn sector={sector} render={children} />;
}

function SplitSignedIn({ sector, render }: { sector: Sector; render: (posts: ReactNode, activity: ReactNode) => ReactNode }) {
  const [posts, activity] = useSignedInAreas(sector);
  return <>{render(posts, activity)}</>;
}
