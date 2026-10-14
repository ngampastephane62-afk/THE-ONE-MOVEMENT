import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Eye, Flag, Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { NetworkPost } from '@workspace/api-client-react';
import { Avatar, Badges, MediaView, ago, btn, btnGhost, card, field, useAct } from './kit';

const viewed = new Set<number>();

export default function PostCard({ post, meId, onReport }: { post: NetworkPost; meId: number; onReport: (postId: number, memberId: number) => void }) {
  const { run, pending } = useAct();
  const ref = useRef<HTMLElement>(null);
  const mine = post.author.id === meId;
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.text);
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
        <Link href={`/member/profile/${post.author.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar m={post.author} size={44} />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-ink-900">{post.author.fullName}</span><Badges m={post.author} compact /></span>
            <span className="block truncate text-xs text-sand-400">{post.author.profession} · {ago(post.createdAt)}{post.edited ? ' · edited' : ''}{post.kind !== 'post' ? ` · ${post.kind === 'business' ? 'Business' : 'Reel'}` : ''}</span>
          </span>
        </Link>
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
          <div className="flex gap-2">
            <button type="button" className={btn} disabled={pending || !text.trim()} onClick={() => act(run({ action: 'post.edit', id: post.id, text: text.trim(), kind: post.kind, mediaIds: post.media.map((m) => m.id) }), () => setEditing(false))} data-testid={`button-save-post-${post.id}`}>Save</button>
            <button type="button" className={btnGhost} onClick={() => { setEditing(false); setText(post.text); }}>Cancel</button>
          </div>
        </div>
      ) : post.text && <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-900">{post.text}</p>}

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
              <Link href={`/member/profile/${c.author.id}`} aria-label={`View ${c.author.fullName}'s profile`} className="h-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-avatar-${c.id}`}><Avatar m={c.author} size={36} /></Link>
              <div className="min-w-0 flex-1 rounded-2xl bg-ivory-100 px-3 py-2">
                <div className="flex items-start justify-between gap-2 text-xs">
                  <Link href={`/member/profile/${c.author.id}`} className="min-w-0 break-words rounded font-semibold text-lagoon-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-author-${c.id}`}>{c.author.fullName}</Link>
                  <span className="shrink-0 text-sand-400">{ago(c.createdAt)}</span>
                </div>
                <Link href={`/member/profile/${c.author.id}`} className="mt-1 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-comment-description-${c.id}`}>
                  <span className="block break-words text-xs text-ink-700">{[c.author.profession, c.author.organization].filter(Boolean).join(' · ')}</span>
                  {c.author.bio && <span className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-ink-700">{c.author.bio}</span>}
                  <span className="mt-1 block text-[11px] font-semibold text-lagoon-700 hover:underline">View profile{c.author.id !== meId ? ' & connect' : ''}</span>
                </Link>
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
