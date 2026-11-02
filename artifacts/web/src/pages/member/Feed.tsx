import { useState } from 'react';
import { Link } from 'wouter';
import { Briefcase, Clapperboard, Loader2, Newspaper } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey, type GetNetworkStateFeed, type NetworkActionInput, type NetworkPost } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import EcosystemNews from '@/components/network/EcosystemNews';
import PostCard from '@/components/network/PostCard';
import ReportDialog, { type ReportTarget } from '@/components/network/ReportDialog';
import { Avatar, Empty, ErrorBox, Skeleton, UploadTray, btn, btnGhost, card, field, useAct, useUploads } from '@/components/network/kit';
import { useMe } from './ctx';
import Chapter from '@/components/editorial/Chapter';

const TABS: { id: GetNetworkStateFeed; label: string }[] = [
  { id: 'all', label: 'For you' }, { id: 'following', label: 'Following' }, { id: 'business', label: 'Business' }, { id: 'reel', label: 'Reels' },
];
const KINDS = [
  { id: 'post', label: 'Update', icon: Newspaper }, { id: 'business', label: 'Business', icon: Briefcase }, { id: 'reel', label: 'Reel', icon: Clapperboard },
];

function Composer() {
  const { me, base } = useMe();
  const { run, pending } = useAct();
  const u = useUploads(6);
  const [text, setText] = useState('');
  const [kind, setKind] = useState('post');
  const [visibility, setVisibility] = useState<'community' | 'followers' | 'sector' | 'draft'>('community');
  type SectorSlug = NonNullable<NetworkActionInput['visibilitySector']>;
  const [visibilitySector, setVisibilitySector] = useState<SectorSlug | ''>('');
  const [err, setErr] = useState(false);
  const availableSectors = (me.founder ? SECTORS : SECTORS.filter((sector) => base.myActiveSectors.includes(sector.slug as SectorSlug))) as { slug: SectorSlug; name: string }[];
  const canPost = (text.trim() || u.ids.length) && !u.busy && !pending && !u.items.some((i) => i.status === 'error') &&
    (visibility !== 'sector' || !!visibilitySector);
  return (
    <form className={`${card} p-4`} onSubmit={(e) => {
      e.preventDefault(); setErr(false);
      run({ action: 'post.create', text: text.trim(), kind, mediaIds: u.ids, visibility, visibilitySector: visibility === 'sector' ? visibilitySector || null : null })
        .then(() => { setText(''); u.clear(); setKind('post'); setVisibility('community'); setVisibilitySector(''); })
        .catch(() => setErr(true));
    }}>
      <div className="flex gap-3">
        <Avatar m={me} size={44} />
        <div className="flex-1">
          <label htmlFor="composer" className="sr-only">Share with the network</label>
          <textarea id="composer" value={text} maxLength={5000} onChange={(e) => setText(e.target.value)} className={`${field} min-h-20 resize-y border-transparent bg-ivory-100`}
            placeholder={kind === 'business' ? 'Present an offer, a collaboration or a project seeking partners' : kind === 'reel' ? 'Caption your reel — attach a short video' : 'What are you working on?'} data-testid="input-composer" />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-700" data-testid="text-trial-posting">Community trials: updates, Business posts and reels are free. No subscription or invitations required.</p>
      <div className="mt-3"><UploadTray u={u} label="Photo, video, audio or PDF" testId="post-upload" /></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-700">Who can see this post?
          <select className="mt-1 w-full rounded-xl border border-sand-300 bg-ivory-50 px-3 py-2 text-sm" value={visibility} onChange={(e) => { setVisibility(e.target.value as typeof visibility); if (e.target.value !== 'sector') setVisibilitySector(''); }} data-testid="select-post-visibility">
            <option value="community">All verified members</option>
            <option value="followers">People who follow you</option>
            {availableSectors.length > 0 && <option value="sector">One of my sectors</option>}
            <option value="draft">Only me · save as draft</option>
          </select>
        </label>
        {visibility === 'sector' && (
          <label className="text-xs font-semibold text-ink-700">Choose a sector
            <select className="mt-1 w-full rounded-xl border border-sand-300 bg-ivory-50 px-3 py-2 text-sm" value={visibilitySector} onChange={(e) => setVisibilitySector(e.target.value as SectorSlug | '')} data-testid="select-post-sector">
              <option value="">Select a sector</option>
              {availableSectors.map((sector) => <option key={sector.slug} value={sector.slug}>{sector.name}</option>)}
            </select>
          </label>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-crimson-700" role="alert">Not published. Your draft is kept — try again.</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sand-100 pt-3">
        <div className="flex gap-1" role="radiogroup" aria-label="Post type">
          {KINDS.map(({ id, label, icon: I }) => (
            <button key={id} type="button" role="radio" aria-checked={kind === id} onClick={() => setKind(id)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${kind === id ? 'bg-gold-500 font-semibold text-ink-900' : 'text-ink-700 hover:bg-ivory-200'}`} data-testid={`kind-${id}`}><I className="h-3.5 w-3.5" />{label}</button>
          ))}
        </div>
        <button className={btn} disabled={!canPost} data-testid="button-publish">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Publish</button>
      </div>
    </form>
  );
}

export default function Feed() {
  const { me, base } = useMe();
  const [feed, setFeed] = useState<GetNetworkStateFeed>('all');
  const [before, setBefore] = useState<number | undefined>();
  const [older, setOlder] = useState<NetworkPost[]>([]);
  const [report, setReport] = useState<ReportTarget | null>(null);
  const params = { feed, ...(before ? { before } : {}) };
  const q = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params) } });
  const firstPage = useGetNetworkState({ feed }, { query: { queryKey: getGetNetworkStateQueryKey({ feed }), enabled: !!before } });
  const head = before ? firstPage.data?.posts ?? [] : q.data?.posts ?? [];
  const seen = new Set<number>();
  const posts = [...head, ...older, ...(before ? q.data?.posts ?? [] : [])].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  const switchFeed = (f: GetNetworkStateFeed) => { setFeed(f); setBefore(undefined); setOlder([]); };
  const suggestions = base.members.filter((m) => m.id !== me.id && !m.followed && !m.blocked).slice(0, 4);

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Chapter index="01" eyebrow="CONTRIBUTE" title="The One Feed" lede="Stories, projects and offers shared by members of the movement. Official TOMI news is published separately below." />
        <EcosystemNews limit={1} />
        <Composer />
        <div className="flex gap-1 overflow-x-auto rounded-full bg-ivory-200 p-1" role="tablist">
          {TABS.map((t) => <button key={t.id} role="tab" aria-selected={feed === t.id} onClick={() => switchFeed(t.id)} className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${feed === t.id ? 'bg-ivory-50 font-semibold text-lagoon-900 shadow-sm' : 'text-ink-700'}`} data-testid={`tab-feed-${t.id}`}>{t.label}</button>)}
        </div>
        {q.isLoading && !posts.length ? <Skeleton /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} msg="The feed could not be loaded." /> : posts.length === 0 ? (
          <Empty title={feed === 'following' ? 'Nobody followed yet' : 'The first story starts with you'} body={feed === 'following' ? 'Follow people whose work moves you and their posts will gather here.' : 'No posts here yet. Introduce yourself, share a project, or present what your organization needs.'}>
            <Link href="/member/people" className={btnGhost}>Find people</Link>
          </Empty>
        ) : (
          <>
            {posts.map((p) => <PostCard key={p.id} post={p} meId={me.id} sectors={(me.founder ? SECTORS : SECTORS.filter((sector) => base.myActiveSectors.includes(sector.slug as NonNullable<NetworkActionInput['visibilitySector']>))) as { slug: NonNullable<NetworkActionInput['visibilitySector']>; name: string }[]} onReport={(postId, memberId) => setReport({ postId, memberId })} />)}
            {q.data?.nextCursor ? (
              <button className={`${btnGhost} self-center`} disabled={q.isFetching} onClick={() => { if (before) setOlder((o) => [...o, ...(q.data?.posts ?? [])]); setBefore(q.data!.nextCursor!); }} data-testid="button-load-more">{q.isFetching && <Loader2 className="h-4 w-4 animate-spin" />}Load older posts</button>
            ) : <p className="py-4 text-center text-xs text-sand-400">You are all caught up.</p>}
          </>
        )}
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:w-72">
        {me.followers + me.following === 0 && (
          <div className="tomi-welcome rounded-2xl p-5">
            <p className="text-eyebrow text-gold-400">GETTING STARTED</p>
            <ol className="mt-3 flex flex-col gap-2 text-sm">
              <li><Link href="/member/settings" className="underline-offset-2 hover:underline">1 · Add a photo and cover</Link></li>
              <li>2 · Publish a first post about your work</li>
              <li><Link href="/member/invite" className="underline-offset-2 hover:underline">3 · Invite people to connect (optional)</Link></li>
              <li><Link href="/member/people" className="underline-offset-2 hover:underline">{me.founder ? 3 : 4} · Follow peers in your sectors</Link></li>
              <li><Link href="/member/certifications" className="underline-offset-2 hover:underline">{me.founder ? 4 : 5} · Apply for an official role</Link></li>
            </ol>
          </div>
        )}
        {suggestions.length > 0 && (
          <div className={`${card} p-4`}>
            <p className="text-sm font-semibold text-ink-900">Members to meet</p>
            <ul className="mt-3 flex flex-col gap-3">{suggestions.map((m) => <li key={m.id}><SuggestRow id={m.id} /></li>)}</ul>
          </div>
        )}
      </aside>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}

function SuggestRow({ id }: { id: number }) {
  const { base } = useMe();
  const { run, pending } = useAct();
  const m = base.members.find((x) => x.id === id)!;
  return (
    <div className="flex items-center gap-2">
      <Link href={`/member/profile/${m.id}`} className="flex min-w-0 flex-1 items-center gap-2"><Avatar m={m} size={34} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-900">{m.fullName}</span><span className="block truncate text-xs text-sand-400">{m.profession}</span></span></Link>
      <button className="rounded-full border border-lagoon-700 px-3 py-1 text-xs font-semibold text-lagoon-700 hover:bg-lagoon-700 hover:text-ivory-50" disabled={pending} onClick={() => run({ action: 'follow', targetId: m.id, accepted: true }).catch(() => undefined)} data-testid={`button-follow-${m.id}`}>Follow</button>
    </div>
  );
}
