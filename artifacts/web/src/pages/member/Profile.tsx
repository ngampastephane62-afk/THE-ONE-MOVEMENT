import { useState } from 'react';
import { useProfileReadiness } from '@/components/network/readiness';
import { Link, useLocation, useParams } from 'wouter';
import { Ban, Copy, UserPlus, Flag, MessageSquare, Palette, Building2, LayoutGrid, List, FileText } from 'lucide-react';
import type { NetworkPost } from '@workspace/api-client-react';
import ProfileHero, { appearanceOf, onCoverBtn } from '@/components/network/ProfileHero';
import { useGetNetworkState, getGetNetworkStateQueryKey, useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import PostCard from '@/components/network/PostCard';
import ReportDialog, { type ReportTarget } from '@/components/network/ReportDialog';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, field, useAct } from '@/components/network/kit';
import { useMe } from './ctx';
import { publicProfileUrl } from '@/lib/network-invitations';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { errMsg } from './proHooks';
import MemberIdentityStrip from '@/components/network/MemberIdentityStrip';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const { me, base } = useMe();
  const [, nav] = useLocation();
  const { run, pending } = useAct();
  const ready = useProfileReadiness();
  const [report, setReport] = useState<ReportTarget | null>(null);
  const [asking, setAsking] = useState(false);
  const [intro, setIntro] = useState('');
  const [err, setErr] = useState('');
  const [openPost, setOpenPost] = useState<number | null>(null);
  const params = { person: pid };
  const q = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params), enabled: Number.isFinite(pid), refetchInterval: 30000 } });

  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton rows={2} /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const p = q.data?.person;
  if (!p) return <div className="p-3 md:p-0"><Empty title="Profile unavailable" body="This member may have left the network, been suspended, or blocked contact."><Link href="/member/people" className={btnGhost}>Back to people</Link></Empty></div>;
  const mine = p.id === me.id;
  const thread = base.threads.find((t) => t.other.id === p.id);
  const posts = (q.data?.posts ?? []).filter((x) => x.author.id === p.id);
  const opened = openPost != null ? posts.find((x) => x.id === openPost) : undefined;
  const sectors = SECTORS.filter((s) => (p.sectors as string[]).includes(s.slug));
  const doAct = (pr: Promise<unknown>) => { setErr(''); pr.catch(() => setErr('That action failed. Try again.')); };

  const ap = appearanceOf(p);
  const dark = ap.layout === 'immersive';
  const ghost = dark ? onCoverBtn : btnGhost;
  const primary = dark ? 'inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50' : btn;
  const statCls = dark ? 'rounded hover:text-gold-400 hover:underline' : 'rounded hover:text-lagoon-700 hover:underline';
  const actions = mine ? <><Link href="/member/settings" className={primary} data-testid="link-edit-profile"><Palette className="h-3.5 w-3.5" />Customize page</Link><Link href="/member/invite" className={ghost} data-testid="link-growth"><UserPlus className="h-3.5 w-3.5" />Invite</Link></> : p.blocked ? (
    <button className={ghost} disabled={pending} onClick={() => doAct(run({ action: 'block', targetId: p.id, accepted: false }))} data-testid="button-unblock">Unblock</button>
  ) : (<>
    <button className={p.followed ? ghost : primary} disabled={pending || (!p.followed && ready.locked)} title={!p.followed && ready.locked ? 'Complete your essential profile to follow' : undefined} onClick={() => { if (!p.followed && ready.locked) return; doAct(run({ action: 'follow', targetId: p.id, accepted: !p.followed })); }} data-testid="button-follow">{p.followed ? 'Following' : 'Follow'}</button>
    {!p.followed && ready.locked && !ready.loading && <Link href="/member/onboarding" className={ghost} data-testid="link-follow-complete-profile">Complete profile to follow</Link>}
    {thread ? <Link href={`/member/messages/${thread.id}`} className={ghost} data-testid="link-thread"><MessageSquare className="h-3.5 w-3.5" />{thread.accepted ? 'Message' : thread.declined && thread.requestedByMe ? 'Request declined' : thread.requestedByMe ? 'Request pending' : 'Respond to request'}</Link>
      : <button className={ghost} onClick={() => setAsking(true)} data-testid="button-request-message"><MessageSquare className="h-3.5 w-3.5" />Request to message</button>}
  </>);
  const stats = <>
    <Link href={`/member/profile/${p.id}/followers`} className={statCls} data-testid="link-followers"><b className={dark ? '' : 'text-ink-900'}>{p.followers}</b> followers</Link>
    <Link href={`/member/profile/${p.id}/following`} className={statCls} data-testid="link-following"><b className={dark ? '' : 'text-ink-900'}>{p.following}</b> following</Link>
    <span><b className={dark ? '' : 'text-ink-900'}>{posts.length}{q.data?.nextCursor ? '+' : ''}</b> posts</span>
  </>;

  return (
    <div className="flex flex-col gap-4">
      <MemberIdentityStrip label="Profile" />
      <ProfileHero m={p} layout={ap.layout} coverPosition={ap.pos} actions={actions} stats={stats} />
      <section className={`${card} mx-3 p-5 sm:p-6 md:mx-0`}>
          <section aria-label="Member description">
            <h2 className="text-eyebrow text-gold-700">ABOUT</h2>
            <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-800" data-testid="text-profile-bio">{p.bio || (mine ? 'Add a short description so other members can learn about your work and connect with you.' : 'This member has not added a description yet.')}</p>
            {mine && !p.bio && <Link href="/member/settings" className="mt-2 inline-flex text-sm font-semibold text-lagoon-700 hover:underline">Add my description</Link>}
          </section>
          {(p.offering || p.lookingFor) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {p.offering && <div className="rounded-xl bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">OFFERS</p><p className="mt-1 text-sm text-ink-800">{p.offering}</p></div>}
              {p.lookingFor && <div className="rounded-xl bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">LOOKING FOR</p><p className="mt-1 text-sm text-ink-800">{p.lookingFor}</p></div>}
            </div>
          )}
          {mine && <OwnerActiveSectors />}
          {sectors.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{sectors.map((s) => <span key={s.slug} className="rounded-full bg-lagoon-900 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-400">{s.name}</span>)}</div>}
          <Link href={mine ? '/member/business' : `/member/business/${p.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-lagoon-700 hover:underline" data-testid="link-business-detail"><Building2 className="h-3.5 w-3.5" />{mine ? 'My company page and attestations' : 'Company page and attestations'}</Link>
          {mine && me.isPublic && <PublicLink id={me.id} />}
          {!mine && (
            <div className="mt-4 flex gap-4 border-t border-sand-100 pt-3 text-xs text-sand-400">
              <button onClick={() => setReport({ memberId: p.id })} className="inline-flex items-center gap-1 hover:text-crimson-700" data-testid="button-report-member"><Flag className="h-3.5 w-3.5" />Report</button>
              {!p.blocked && <button onClick={() => { if (confirm(`Block ${p.fullName}? They will no longer be able to contact you.`)) doAct(run({ action: 'block', targetId: p.id, accepted: true })); }} className="inline-flex items-center gap-1 hover:text-crimson-700" data-testid="button-block"><Ban className="h-3.5 w-3.5" />Block</button>}
            </div>
          )}
          {err && <p className="mt-2 text-xs text-crimson-700" role="alert">{err}</p>}
      </section>

      {asking && (
        <form className={`${card} mx-3 p-4 md:mx-0`} onSubmit={(e) => {
          e.preventDefault(); setErr('');
          if (!intro.trim()) { setErr('An initial note is required.'); return; }
          run({ action: 'thread.start', targetId: p.id, text: intro.trim() }).then((r) => nav(r.id ? `/member/messages/${r.id}` : '/member/messages')).catch((error) => setErr(errMsg(error, 'The request could not be sent. Your note is kept.')));
        }}>
          <label htmlFor="intro" className="text-sm font-semibold text-ink-900">Introduce yourself to {p.fullName.split(' ')[0]} — initial note required</label>
          <p className="text-xs text-ink-700" data-testid="text-request-safety">Ordinary conversations are free. They must accept before you can send more than this initial note. To prevent spam: up to 5 new requests per rolling 24 hours and 10 pending outgoing requests. Accepted conversations have no daily message quota. TOMI-organized professional introductions remain a separate service.</p>
          <textarea id="intro" required className={`${field} mt-2 min-h-24`} maxLength={1000} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Why you would like to connect" data-testid="input-intro" />
          <div className="mt-3 flex gap-2"><button className={btn} disabled={pending || !intro.trim()} data-testid="button-send-request">Send request</button><button type="button" className={btnGhost} onClick={() => setAsking(false)}>Cancel</button></div>
        </form>
      )}

      <section className="flex flex-col gap-4 px-3 md:px-0">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg text-ink-900">Posts</h2><span className="inline-flex items-center gap-1 text-xs text-sand-400">{ap.posts === 'grid' ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}{ap.posts === 'grid' ? 'Gallery' : 'List'}</span></div>
        {posts.length === 0 ? <Empty title={mine ? 'Share your first post' : 'No posts yet'} body={mine ? 'Show the network what you build, design or defend.' : `${p.fullName} has not published yet.`}>{mine && <Link href="/member" className={btn}>Write a post</Link>}</Empty>
          : ap.posts === 'grid' ? <PostGrid posts={posts} onOpen={setOpenPost} />
          : posts.map((x) => <PostCard key={x.id} post={x} meId={me.id} onReport={(postId, memberId) => setReport({ postId, memberId })} />)}
      </section>
      {opened && (
        <Dialog open onOpenChange={(value) => { if (!value) setOpenPost(null); }}>
          <DialogContent className="w-[95vw] max-w-2xl border-0 bg-ivory-50 px-2 pb-2 pt-10" aria-describedby={undefined} data-testid="dialog-post">
            <DialogTitle className="sr-only">Post by {opened.author.fullName}</DialogTitle>
            <PostCard post={opened} meId={me.id} onReport={(postId, memberId) => setReport({ postId, memberId })} />
          </DialogContent>
        </Dialog>
      )}
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}

function PublicLink({ id }: { id: number }) {
  const url = publicProfileUrl(id);
  const [st, setSt] = useState<'ok' | 'fail' | null>(null);
  const copy = () => { if (!navigator.clipboard) { setSt('fail'); return; } navigator.clipboard.writeText(url).then(() => setSt('ok'), () => setSt('fail')); };
  return (
    <div className="mt-4 rounded-xl bg-ivory-100 p-3" data-testid="panel-public-link">
      <p className="text-eyebrow text-gold-700">PUBLIC PROFILE LINK</p>
      <p className="mt-1 text-xs text-ink-700">Anyone can see your profile details here. Posts are never shown publicly.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className={`${field} min-w-0 flex-1 py-1.5 font-mono text-xs`} data-testid="input-public-link" />
        <button type="button" className={btnGhost} onClick={copy} data-testid="button-copy-public-link"><Copy className="h-3.5 w-3.5" />{st === 'ok' ? 'Copied' : 'Copy'}</button>
      </div>
      {st === 'fail' && <p className="mt-1 text-xs text-crimson-700" role="alert">Copy failed. Select the link and copy it manually.</p>}
    </div>
  );
}

function PostGrid({ posts, onOpen }: { posts: NetworkPost[]; onOpen: (id: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2" data-testid="grid-posts">
      {posts.map((x) => {
        const img = x.media.find((m) => m.contentType.startsWith('image/'));
        const vid = !img && x.media.find((m) => m.contentType.startsWith('video/'));
        return (
          <button key={x.id} type="button" onClick={() => onOpen(x.id)} className="group relative aspect-square overflow-hidden rounded-md bg-lagoon-900 text-left sm:rounded-xl" aria-label={`Open post: ${x.text.slice(0, 60) || 'media'}`} data-testid={`tile-post-${x.id}`}>
            {img ? <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : vid ? <video src={vid.url} muted playsInline preload="metadata" className="h-full w-full object-contain" />
              : <span className="flex h-full flex-col justify-between bg-[linear-gradient(150deg,hsl(187_67%_12%),hsl(189_74%_24%))] p-2.5 sm:p-4"><FileText className="h-4 w-4 text-gold-400" /><span className="line-clamp-4 font-display text-[11px] leading-snug text-ivory-100 sm:text-sm">{x.text}</span></span>}
            <span className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-lagoon-900/80 to-transparent px-2 pb-1.5 pt-6 text-[10px] font-semibold text-ivory-50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{x.likes} likes · {x.comments.length} comments</span>
          </button>
        );
      })}
    </div>
  );
}

/** Owner-only: saved primary and active sectors from the private member profile. Never rendered for other members. */
function OwnerActiveSectors() {
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });
  const p = q.data?.profile;
  if (q.isLoading) return <div className="mt-4 h-6 w-48 animate-pulse bg-ivory-200" aria-hidden="true" />;
  if (!p) return null;
  const name = (slug: string) => SECTORS.find((s) => s.slug === slug)?.name ?? slug;
  const active = p.activeSectors ?? null;
  return (
    <div className="mt-4 border-l-2 border-gold-500 pl-3" data-testid="panel-owner-active-sectors">
      <p className="text-eyebrow text-gold-700">MY ACTIVE SECTORS <span className="normal-case tracking-normal text-sand-400">(visible to you)</span></p>
      {active && p.mainSector ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink-900" data-testid="text-owner-main-sector">{name(p.mainSector)} · primary</span>
          {active.filter((a) => a !== p.mainSector).map((a) => <span key={a} className="rounded-full border border-lagoon-900 px-2.5 py-1 text-[10px] uppercase tracking-wider text-lagoon-900" data-testid={`text-owner-active-${a}`}>{name(a)}</span>)}
        </div>
      ) : (
        <p className="mt-1 text-sm text-ink-700" data-testid="text-owner-active-unset">Not chosen yet. <Link href="/member/settings" className="font-semibold text-lagoon-700 hover:underline">Choose a primary sector</Link></p>
      )}
    </div>
  );
}
