import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Eye, Flag, Heart, MessageCircle, MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react';
import type { NetworkPost } from '@workspace/api-client-react';
import { Avatar, MediaView, ago, btn, btnGhost, card, field, useAct } from './kit';

const viewed = new Set<number>();

type SectorSlug = NonNullable<NetworkPost['visibilitySector']>;
type SectorOption = { slug: SectorSlug; name: string };

function PostAvatar({ author, size = 44 }: { author: NetworkPost['author']; size?: number }) {
  if (!author.profileVisible) return (
    <span className="grid shrink-0 place-items-center rounded-full bg-ivory-200 text-sand-500" style={{ width: size, height: size }} aria-hidden="true">
      <UserRound size={size * 0.48} />
    </span>
  );
  return <Avatar m={{ fullName: author.fullName, avatarUrl: author.avatarUrl ?? null }} size={size} />;
}

const visibilityName = (post: NetworkPost, sectors: SectorOption[]) => {
  if (post.visibility === 'followers') return 'Followers only';
  if (post.visibility === 'draft') return 'Draft · only you';
  if (post.visibility === 'sector') return sectors.find((s) => s.slug === post.visibilitySector)?.name ?? 'Sector only';
  return 'All verified members';
};

export default function PostCard({ post, meId, sectors, onReport }: { post: NetworkPost; meId: number; sectors: SectorOption[]; onReport: (postId: number, memberId: number) => void }) {
  const { run, pending } = useAct();
  const ref = useRef<HTMLElement>(null);
  const mine = post.author.id === meId;
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.text);
  const [visibility, setVisibility] = useState<NetworkPost['visibility']>(post.visibility);
  const [visibilitySector, setVisibilitySector] = useState<SectorSlug | ''>(post.visibilitySector ?? '');
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(post.comments.length > 0 && post.comments.length <= 2);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (mine || viewed.has(post.id) || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.6 && !viewed.has(post.id)) {
        viewed.add(post.id);
        run({ action: 'post.view', id: post.id }).catch(() => viewed.delete(post.id));
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, mine]);

  const act = (p: Promise<unknown>, after?: () => void) => { setErr(''); p.then(() => after?.()).catch(() => setErr('That action did not go through. Try again.')); };

  return (
    <article ref={ref} className={`${card} p-4 sm:p-5`} data-testid={`card-post-${post.id}`}>
      <header className="flex items-start justify-between gap-2">
        {post.author.profileVisible ? <Link href={`/member/profile/${post.author.id}`} className="flex min-w-0 items-center gap-3">
          <PostAvatar author={post.author} size={44} />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-ink-900">{post.author.fullName}</span>{post.author.founder && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold text-ink-900">Founder</span>}</span>
            <span className="block truncate text-xs text-sand-400">{post.author.profession ?? ''}{post.author.profession ? ' · ' : ''}{ago(post.createdAt)}{post.edited ? ' · edited' : ''}{post.kind !== 'post' ? ` · ${post.kind === 'business' ? 'Business' : 'Reel'}` : ''}</span>
          </span>
        </Link> : <div className="flex min-w-0 items-center gap-3">
          <PostAvatar author={post.author} size={44} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink-900">{post.author.fullName}</span>
            <span className="block truncate text-xs text-sand-400">{ago(post.createdAt)}{post.edited ? ' · edited' : ''}{post.kind !== 'post' ? ` · ${post.kind === 'business' ? 'Business' : 'Reel'}` : ''}</span>
          </span>
        </div>}
        <div className="relative">
          <button type="button" onClick={() => setMenu((v) => !v)} aria-label="Post options" aria-expanded={menu} className="rounded-full p-1.5 text-sand-400 hover:bg-ivory-200" data-testid={`button-post-menu-${post.id}`}><MoreHorizontal className="h-5 w-5" /></button>
          {menu && (
            <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-sand-200 bg-ivory-50 py-1 text-sm shadow-lg">
              {mine ? (<>
                <button type="button" onClick={() => { setEditing(true); setMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-ivory-200" data-testid={`button-edit-post-${post.id}`}><Pencil className="h-4 w-4" />Edit</button>
                <button type="button" onClick={() => { setMenu(false); if (confirm('Delete this post permanently?')) act(run({ action: 'post.delete', id: post.id })); }} className="flex w-full items-center gap-2 px-3 py-2 text-crimson-700 hover:bg-ivory-200" data-testid={`button-delete-post-${post.id}`}><Trash2 className="h-4 w-4" />Delete</button>
              </>) : (
                <button type="button" onClick={() => { setMenu(false); onReport(post.id, post.author.id); }} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-ivory-200" data-testid={`button-report-post-${post.id}`}><Flag className="h-4 w-4" />Report post</button>
              )}
            </div>
          )}
        </div>
      </header>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <label className="sr-only" htmlFor={`edit-${post.id}`}>Edit post</label>
          <textarea id={`edit-${post.id}`} className={`${field} min-h-24`} value={text} maxLength={5000} onChange={(e) => setText(e.target.value)} />
          <label className="text-xs font-semibold text-ink-700">Who can see this post?
            <select className="mt-1 w-full rounded-xl border border-sand-300 bg-ivory-50 px-3 py-2 text-sm" value={visibility} onChange={(e) => { setVisibility(e.target.value as NetworkPost['visibility']); if (e.target.value !== 'sector') setVisibilitySector(''); }} data-testid={`select-edit-post-visibility-${post.id}`}>
              <option value="community">All verified members</option>
              <option value="followers">People who follow you</option>
              {sectors.length > 0 && <option value="sector">One of my sectors</option>}
              <option value="draft">Only me · save as draft</option>
            </select>
          </label>
          {visibility === 'sector' && (
            <label className="text-xs font-semibold text-ink-700">Choose a sector
            <select className="mt-1 w-full rounded-xl border border-sand-300 bg-ivory-50 px-3 py-2 text-sm" value={visibilitySector} onChange={(e) => setVisibilitySector(e.target.value as SectorSlug | '')} data-testid={`select-edit-post-sector-${post.id}`}>
                <option value="">Select a sector</option>
                {sectors.map((sector) => <option key={sector.slug} value={sector.slug}>{sector.name}</option>)}
              </select>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} disabled={pending || (!text.trim() && !post.media.length) || (visibility === 'sector' && !visibilitySector)} onClick={() => act(run({ action: 'post.edit', id: post.id, text: text.trim(), kind: post.kind, mediaIds: post.media.map((m) => m.id), visibility, visibilitySector: visibility === 'sector' ? visibilitySector || null : null }), () => setEditing(false))} data-testid={`button-save-post-${post.id}`}>Save</button>
            <button type="button" className={btnGhost} onClick={() => { setEditing(false); setText(post.text); setVisibility(post.visibility); setVisibilitySector(post.visibilitySector ?? ''); }}>Cancel</button>
          </div>
        </div>
      ) : <>
        {post.text && <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-900">{post.text}</p>}
        <p className="mt-2 text-[11px] text-sand-400" data-testid={`text-post-visibility-${post.id}`}>{visibilityName(post, sectors)}</p>
      </>}

      {post.media.length > 0 && <div className="mt-3"><MediaView media={post.media} /></div>}

      <footer className="mt-3 flex items-center gap-1 border-t border-sand-100 pt-2 text-sm text-ink-700">
        <button type="button" aria-pressed={post.liked} onClick={() => act(run({ action: 'post.like', id: post.id, accepted: !post.liked }))} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-ivory-200 ${post.liked ? 'text-coral-600' : ''}`} data-testid={`button-like-${post.id}`}>
          <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />{post.likes}
        </button>
        <button type="button" onClick={() => setShowComments((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-ivory-200" data-testid={`button-comments-${post.id}`}>
          <MessageCircle className="h-4 w-4" />{post.comments.length}
        </button>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-sand-400" title="Real member views"><Eye className="h-3.5 w-3.5" />{post.views}</span>
      </footer>
      {err && <p className="mt-2 text-xs text-crimson-700" role="alert">{err}</p>}

      {showComments && (
        <div className="mt-2 flex flex-col gap-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2" data-testid={`comment-${c.id}`}>
              {c.author.profileVisible ? <Link href={`/member/profile/${c.author.id}`} aria-label={`View ${c.author.fullName}'s profile`} className="h-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-avatar-${c.id}`}><PostAvatar author={c.author} size={36} /></Link> : <PostAvatar author={c.author} size={36} />}
              <div className="min-w-0 flex-1 rounded-2xl bg-ivory-100 px-3 py-2">
                <div className="flex items-start justify-between gap-2 text-xs">
                  {c.author.profileVisible ? <Link href={`/member/profile/${c.author.id}`} className="min-w-0 break-words rounded font-semibold text-lagoon-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-author-${c.id}`}>{c.author.fullName}</Link> : <span className="min-w-0 break-words font-semibold text-ink-700">{c.author.fullName}</span>}
                  <span className="shrink-0 text-sand-400">{ago(c.createdAt)}</span>
                </div>
                {c.author.profileVisible && <Link href={`/member/profile/${c.author.id}`} className="mt-1 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-description-${c.id}`}>
                  {c.author.profession && <span className="block break-words text-xs text-ink-700">{c.author.profession}</span>}
                  <span className="mt-1 block text-[11px] font-semibold text-lagoon-700 hover:underline">View profile{c.author.id !== meId ? ' & connect' : ''}</span>
                </Link>}
                <p className="mt-2 whitespace-pre-wrap break-words border-t border-sand-200 pt-2 text-sm text-ink-800">{c.text}</p>
                {c.author.id === meId && <button type="button" onClick={() => act(run({ action: 'comment.delete', id: c.id }))} className="mt-1 text-[11px] text-sand-400 hover:text-crimson-700" data-testid={`button-delete-comment-${c.id}`}>Delete</button>}
              </div>
            </div>
          ))}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (comment.trim()) act(run({ action: 'comment.create', id: post.id, text: comment.trim() }), () => setComment('')); }}>
            <label className="sr-only" htmlFor={`c-${post.id}`}>Write a comment</label>
            <input id={`c-${post.id}`} className={`${field} rounded-full py-2`} placeholder="Add a thoughtful reply" value={comment} maxLength={2000} onChange={(e) => setComment(e.target.value)} data-testid={`input-comment-${post.id}`} />
            <button className={btn} disabled={pending || !comment.trim()} data-testid={`button-send-comment-${post.id}`}>Reply</button>
          </form>
        </div>
      )}
    </article>
  );
}
