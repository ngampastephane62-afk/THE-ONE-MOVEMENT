import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Ban, Copy, ExternalLink, UserPlus, Flag, MapPin, MessageSquare, Pencil } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import PostCard from '@/components/network/PostCard';
import ReportDialog, { type ReportTarget } from '@/components/network/ReportDialog';
import { Avatar, Badges, Empty, ErrorBox, Skeleton, btn, btnGhost, card, field, useAct } from '@/components/network/kit';
import { useMe } from './ctx';
import { publicProfileUrl } from '@/lib/network-invitations';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const { me, base } = useMe();
  const [, nav] = useLocation();
  const { run, pending } = useAct();
  const [report, setReport] = useState<ReportTarget | null>(null);
  const [asking, setAsking] = useState(false);
  const [intro, setIntro] = useState('');
  const [err, setErr] = useState('');
  const params = { person: pid };
  const q = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params), enabled: Number.isFinite(pid) } });

  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton rows={2} /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const p = q.data?.person;
  if (!p) return <div className="p-3 md:p-0"><Empty title="Profile unavailable" body="This member may have left the network, been suspended, or blocked contact."><Link href="/member/people" className={btnGhost}>Back to people</Link></Empty></div>;
  const mine = p.id === me.id;
  const thread = base.threads.find((t) => t.other.id === p.id);
  const posts = (q.data?.posts ?? []).filter((x) => x.author.id === p.id);
  const sectors = SECTORS.filter((s) => (p.sectors as string[]).includes(s.slug));
  const doAct = (pr: Promise<unknown>) => { setErr(''); pr.catch(() => setErr('That action failed. Try again.')); };

  return (
    <div className="flex flex-col gap-4">
      <section className={`${card} overflow-hidden rounded-none border-x-0 sm:rounded-2xl sm:border-x`}>
        <div className="h-36 bg-lagoon-800 sm:h-48" style={p.coverUrl ? { backgroundImage: `url(${p.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: 'radial-gradient(ellipse at 80% 20%, hsl(39 52% 54% / 0.35), transparent 60%), linear-gradient(135deg, hsl(187 67% 12%), hsl(189 74% 28%))' }} />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
            <div className="rounded-full bg-ivory-50 p-1"><Avatar m={p} size={96} /></div>
            <div className="flex flex-wrap gap-2">
              {mine ? <><Link href="/member/invite" className={btnGhost} data-testid="link-growth"><UserPlus className="h-3.5 w-3.5" />{me.founder || base.growth?.canPost ? 'Invite' : `Invite ${Math.min(base.growth?.qualifiedInvites ?? 0, base.growth?.requiredInvites ?? 11)}/${base.growth?.requiredInvites ?? 11}`}</Link><Link href="/member/settings" className={btnGhost} data-testid="link-edit-profile"><Pencil className="h-3.5 w-3.5" />Edit profile</Link></> : p.blocked ? (
                <button className={btnGhost} disabled={pending} onClick={() => doAct(run({ action: 'block', targetId: p.id, accepted: false }))} data-testid="button-unblock">Unblock</button>
              ) : (<>
                <button className={p.followed ? btnGhost : btn} disabled={pending} onClick={() => doAct(run({ action: 'follow', targetId: p.id, accepted: !p.followed }))} data-testid="button-follow">{p.followed ? 'Following' : 'Follow'}</button>
                {thread ? <Link href={`/member/messages/${thread.id}`} className={btnGhost} data-testid="link-thread"><MessageSquare className="h-3.5 w-3.5" />{thread.accepted ? 'Message' : thread.declined && thread.requestedByMe ? 'Request declined' : thread.requestedByMe ? 'Request pending' : 'Respond to request'}</Link>
                  : <button className={btnGhost} onClick={() => setAsking(true)} data-testid="button-request-message"><MessageSquare className="h-3.5 w-3.5" />Request to message</button>}
              </>)}
            </div>
          </div>
          <h1 className="mt-3 flex flex-wrap items-center gap-2 font-display text-2xl text-ink-900" data-testid="text-profile-name">{p.fullName}</h1>
          <div className="mt-1"><Badges m={p} /></div>
          <p className="mt-1 text-ink-700">{[p.profession, p.organization].filter(Boolean).join(' · ')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sand-400">
            {p.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.country}</span>}
            {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-lagoon-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" />{p.website.replace(/^https?:\/\//, '')}</a>}
            <span data-testid="text-followers"><b className="text-ink-900">{p.followers}</b> followers</span>
            <span data-testid="text-following"><b className="text-ink-900">{p.following}</b> following</span>
          </div>
          {p.bio && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">{p.bio}</p>}
          {(p.offering || p.lookingFor) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {p.offering && <div className="rounded-xl bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">OFFERS</p><p className="mt-1 text-sm text-ink-800">{p.offering}</p></div>}
              {p.lookingFor && <div className="rounded-xl bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">LOOKING FOR</p><p className="mt-1 text-sm text-ink-800">{p.lookingFor}</p></div>}
            </div>
          )}
          {sectors.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{sectors.map((s) => <span key={s.slug} className="rounded-full bg-lagoon-900 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-400">{s.name}</span>)}</div>}
          {mine && me.isPublic && <PublicLink id={me.id} />}
          {!mine && (
            <div className="mt-4 flex gap-4 border-t border-sand-100 pt-3 text-xs text-sand-400">
              <button onClick={() => setReport({ memberId: p.id })} className="inline-flex items-center gap-1 hover:text-crimson-700" data-testid="button-report-member"><Flag className="h-3.5 w-3.5" />Report</button>
              {!p.blocked && <button onClick={() => { if (confirm(`Block ${p.fullName}? They will no longer be able to contact you.`)) doAct(run({ action: 'block', targetId: p.id, accepted: true })); }} className="inline-flex items-center gap-1 hover:text-crimson-700" data-testid="button-block"><Ban className="h-3.5 w-3.5" />Block</button>}
            </div>
          )}
          {err && <p className="mt-2 text-xs text-crimson-700" role="alert">{err}</p>}
        </div>
      </section>

      {asking && (
        <form className={`${card} mx-3 p-4 md:mx-0`} onSubmit={(e) => {
          e.preventDefault(); setErr('');
          run({ action: 'thread.start', targetId: p.id, text: intro.trim() || undefined }).then((r) => nav(r.id ? `/member/messages/${r.id}` : '/member/messages')).catch(() => setErr('The request could not be sent.'));
        }}>
          <label htmlFor="intro" className="text-sm font-semibold text-ink-900">Introduce yourself to {p.fullName.split(' ')[0]}</label>
          <p className="text-xs text-sand-400">They must accept before a conversation opens. You can send only this first note until then.</p>
          <textarea id="intro" className={`${field} mt-2 min-h-24`} maxLength={1000} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Why you would like to connect" data-testid="input-intro" />
          <div className="mt-3 flex gap-2"><button className={btn} disabled={pending} data-testid="button-send-request">Send request</button><button type="button" className={btnGhost} onClick={() => setAsking(false)}>Cancel</button></div>
        </form>
      )}

      <section className="flex flex-col gap-4 px-3 md:px-0">
        <h2 className="font-display text-lg text-ink-900">Posts</h2>
        {posts.length === 0 ? <Empty title={mine ? 'Share your first post' : 'No posts yet'} body={mine ? 'Show the network what you build, design or defend.' : `${p.fullName} has not published yet.`}>{mine && (me.founder || base.growth?.canPost ? <Link href="/member" className={btn}>Write a post</Link> : <Link href="/member/invite" className={btn}>Invite 11 people to unlock posting</Link>)}</Empty>
          : posts.map((x) => <PostCard key={x.id} post={x} meId={me.id} onReport={(postId, memberId) => setReport({ postId, memberId })} />)}
      </section>
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
