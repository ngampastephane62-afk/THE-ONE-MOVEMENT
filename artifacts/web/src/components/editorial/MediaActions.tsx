import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Copy, Facebook, Heart, MessageCircle, RotateCw, Share2, Trash2 } from 'lucide-react';
import type { VideoEngagementInput } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { mediaShareUrl, videoShareUrl } from '@/lib/media-share';
import { engagementErrorMessage, useMediaEngagement, type MediaTarget } from '@/hooks/use-media-engagement';

export type MediaActionsProps = MediaTarget & {
  title: string;
  founder?: boolean;
  tone?: 'light' | 'dark';
  /** compact: hides the Facebook / Instagram helper buttons behind Share. */
  compact?: boolean;
  /** Opt-in (Home only): Like / Comment / Share on one row; extra share destinations in a Share menu. Default 'default' is unchanged. */
  layout?: 'default' | 'row';
  className?: string;
};

/**
 * Unified like / comment / share strip for editorial videos (videoId) and
 * editorial photographs (source = canonical public path). Likes and comments
 * persist on TOMI only; nothing is ever posted to Facebook or Instagram.
 */
const compactCount = (n: number) => n < 1000 ? String(n) : n < 1e6 ? `${(n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, '')}K` : `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;

export default function MediaActions(props: MediaActionsProps) {
  const { title, founder, tone = 'light', compact = false, layout = 'default', className } = props;
  const row = layout === 'row';
  const target: MediaTarget = props.videoId ? { videoId: props.videoId } : { source: props.source! };
  const ident = (props.videoId ?? props.source ?? '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(-60);
  const { q, m, signedIn, isLoaded, founder: isFounder } = useMediaEngagement(target);
  const canModerate = founder ?? isFounder;
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(!compact);
  const [note, setNote] = useState('');
  const dark = tone === 'dark';
  const e = q.data;

  const act = (data: VideoEngagementInput, ok?: () => void) => {
    setNote('');
    m.mutate(data, { onSuccess: ok, onError: (err) => setNote(engagementErrorMessage(err)) });
  };
  const url = typeof window !== 'undefined' ? (props.videoId ? videoShareUrl(props.videoId) : mediaShareUrl(props.source!)) : '';
  const copy = async (msg: string) => {
    try { if (!navigator.clipboard) throw new Error(); await navigator.clipboard.writeText(url); setNote(msg); }
    catch { setNote(`Copy failed. Copy this address manually: ${url}`); }
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* cancelled */ } }
    else { setMore(true); void copy('Link copied.'); }
  };

  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onDown = (ev: PointerEvent) => { if (!menuRef.current?.contains(ev.target as Node)) setMenu(false); };
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { setMenu(false); shareBtnRef.current?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menu]);

  const pill = cn(
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
    dark ? 'border-ivory-100/30 text-ivory-100 hover:border-gold-400 hover:text-gold-400' : 'border-sand-300 bg-ivory-50 text-ink-800 hover:border-lagoon-600',
  );
  const muted = dark ? 'text-ivory-200' : 'text-ink-700';
  const likes = e?.likes ?? 0;
  const count = e?.comments.length ?? 0;

  return (
    <div className={cn('flex flex-col gap-3', className)} data-testid={`media-actions-${ident}`} role="group" aria-label={`Reactions and sharing for ${title}`}>
      {row ? (
        <div className="tomi-actions-row" data-tone={tone}>
          {q.isLoading || !isLoaded ? (
            <span className="tomi-actions-skel" aria-label="Loading reactions" />
          ) : q.isError ? (
            <button type="button" className="tomi-act tomi-act--wide" onClick={() => q.refetch()} data-testid={`button-retry-engagement-${ident}`}>
              <RotateCw className="h-4 w-4" aria-hidden /><span>Retry reactions</span>
            </button>
          ) : (
            <>
              <button type="button" className="tomi-act" data-on={!!e?.liked}
                disabled={!signedIn || m.isPending} onClick={() => act({ action: 'like', accepted: !e?.liked })} aria-pressed={!!e?.liked}
                aria-label={`${e?.liked ? 'Unlike' : 'Like'} · ${likes} ${likes === 1 ? 'like' : 'likes'}`} data-testid={`button-like-${ident}`}>
                <Heart className={cn('h-4 w-4', e?.liked && 'fill-current')} aria-hidden /><span className="tomi-act-n" aria-hidden>{compactCount(likes)}</span><span className="tomi-act-l" aria-hidden>Like</span>
              </button>
              <button type="button" className="tomi-act" onClick={() => setOpen(!open)} aria-expanded={open}
                aria-label={`Comments · ${count} ${count === 1 ? 'comment' : 'comments'}`} data-testid={`button-comments-${ident}`}>
                <MessageCircle className="h-4 w-4" aria-hidden /><span className="tomi-act-n" aria-hidden>{compactCount(count)}</span><span className="tomi-act-l" aria-hidden>Comment</span>
              </button>
            </>
          )}
          <div className="tomi-act-wrap" ref={menuRef}>
            <button ref={shareBtnRef} type="button" className="tomi-act w-full" onClick={() => setMenu(!menu)} aria-haspopup="true" aria-expanded={menu} data-testid={`button-share-${ident}`}>
              <Share2 className="h-4 w-4" aria-hidden /><span className="tomi-act-l tomi-act-l--always">Share</span>
            </button>
            {menu && (
              <div className="tomi-share-menu" role="group" aria-label={`Share ${title}`} data-testid={`menu-share-${ident}`}>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button type="button" onClick={() => { setMenu(false); void share(); }} data-testid={`button-native-share-${ident}`}><Share2 className="h-4 w-4" aria-hidden />Share via device</button>
                )}
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer noopener" onClick={() => setMenu(false)} data-testid={`link-facebook-${ident}`}><Facebook className="h-4 w-4" aria-hidden />Facebook<span className="sr-only"> (opens in a new tab)</span></a>
                <button type="button" onClick={() => { setMenu(false); void copy('Link copied.'); }} data-testid={`button-copy-${ident}`}><Copy className="h-4 w-4" aria-hidden />Copy link</button>
                <button type="button" onClick={() => { setMenu(false); void copy('Link copied. Paste it into your Instagram or TikTok story or bio; we never post for you.'); }} data-testid={`button-insta-tiktok-${ident}`}><Copy className="h-4 w-4" aria-hidden />Instagram / TikTok</button>
              </div>
            )}
          </div>
        </div>
      ) : (
      <div className="flex flex-wrap items-center gap-2">
        {q.isLoading || !isLoaded ? (
          <span className={cn('h-9 w-40 animate-pulse rounded-full', dark ? 'bg-ivory-100/15' : 'bg-sand-200')} aria-label="Loading reactions" />
        ) : q.isError ? (
          <button type="button" className={cn(pill, dark ? 'text-coral-500' : 'text-crimson-700')} onClick={() => q.refetch()} data-testid={`button-retry-engagement-${ident}`}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden />Reactions unavailable. Retry
          </button>
        ) : (
          <>
            <button type="button" className={cn(pill, e?.liked && (dark ? 'border-coral-500 text-coral-500' : 'border-crimson-700 text-crimson-700'))}
              disabled={!signedIn || m.isPending} onClick={() => act({ action: 'like', accepted: !e?.liked })} aria-pressed={!!e?.liked}
              aria-label={`${e?.liked ? 'Unlike' : 'Like'} · ${likes} ${likes === 1 ? 'like' : 'likes'}`} data-testid={`button-like-${ident}`}>
              <Heart className={cn('h-3.5 w-3.5', e?.liked && 'fill-current')} aria-hidden />{likes} {likes === 1 ? 'like' : 'likes'}
            </button>
            <button type="button" className={pill} onClick={() => setOpen(!open)} aria-expanded={open} data-testid={`button-comments-${ident}`}>
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />{count} {count === 1 ? 'comment' : 'comments'}
            </button>
          </>
        )}
        <button type="button" className={pill} onClick={share} data-testid={`button-share-${ident}`}><Share2 className="h-3.5 w-3.5" aria-hidden />Share</button>
        {more ? (
          <>
            <a className={pill} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer noopener" data-testid={`link-facebook-${ident}`}><Facebook className="h-3.5 w-3.5" aria-hidden />Facebook<span className="sr-only"> (opens in a new tab)</span></a>
            <button type="button" className={pill} onClick={() => copy('Link copied.')} data-testid={`button-copy-${ident}`}><Copy className="h-3.5 w-3.5" aria-hidden />Copy link</button>
            <button type="button" className={pill} onClick={() => copy('Link copied. Paste it into your Instagram or TikTok story or bio; we never post for you.')} data-testid={`button-insta-tiktok-${ident}`}>Instagram / TikTok</button>
          </>
        ) : (
          <button type="button" className={cn(pill, 'border-transparent underline underline-offset-4')} onClick={() => setMore(true)} data-testid={`button-more-share-${ident}`}>More ways to share</button>
        )}
      </div>
      )}
      {note && <p className={cn('text-xs break-words', muted)} role="status">{note}</p>}
      {isLoaded && !signedIn && (
        <p className={cn('text-xs', muted)}>
          <Link href="/sign-in" className={cn('font-semibold underline underline-offset-2', dark ? 'text-gold-400' : 'text-lagoon-700')}>Sign in</Link> as an approved member to like or comment. Anyone can read comments and share.
        </p>
      )}
      {open && (
        <div className={cn('rounded-2xl border p-3', dark ? 'border-ivory-100/20 bg-lagoon-900/80' : 'border-sand-200 bg-ivory-50')}>
          {q.isError ? <button type="button" className="text-xs text-crimson-700 underline" onClick={() => q.refetch()}>Comments did not load. Retry</button>
            : !e ? <p className={cn('text-xs', muted)}>Loading comments...</p>
            : e.comments.length === 0 ? <p className={cn('text-xs', muted)}>No comments yet.</p> : (
              <ul className="flex flex-col gap-3" aria-label="Comments">
                {e.comments.map((c) => (
                  <li key={c.id} className="flex gap-2 text-sm" data-testid={`comment-${c.id}`}>
                    <div className="min-w-0 flex-1">
                      <b className={dark ? 'text-ivory-100' : 'text-ink-900'}>{c.author}</b>{' '}
                      <time className={cn('text-[11px]', muted)} dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleDateString()}</time>
                      <p className={cn('whitespace-pre-wrap break-words', dark ? 'text-ivory-200' : 'text-ink-700')}>{c.text}</p>
                    </div>
                    {c.canDelete ? (
                      <button type="button" aria-label={`Delete comment by ${c.author}`} className={cn('self-start p-1 hover:text-crimson-700', muted)} onClick={() => act({ action: 'delete', id: c.id })} data-testid={`button-delete-comment-${c.id}`}><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
                    ) : canModerate && (
                      <button type="button" className={cn('self-start text-[11px] underline hover:text-crimson-700', muted)} onClick={() => act({ action: 'moderate', id: c.id, accepted: false })} data-testid={`button-moderate-comment-${c.id}`}>Hide comment</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          {signedIn && (
            <form className="mt-3 flex gap-2" onSubmit={(ev) => { ev.preventDefault(); if (text.trim()) act({ action: 'comment', text: text.trim() }, () => setText('')); }}>
              <label className="sr-only" htmlFor={`comment-${ident}`}>Write a comment on {title}</label>
              <input id={`comment-${ident}`} className="min-w-0 flex-1 rounded-full border border-sand-300 bg-ivory-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-700/70" maxLength={1500} value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Add a comment" data-testid={`input-comment-${ident}`} />
              <button className="rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-ivory-50 ring-1 ring-ivory-100/30 disabled:opacity-50" disabled={!text.trim() || m.isPending} data-testid={`button-post-comment-${ident}`}>{m.isPending ? 'Posting...' : 'Post comment'}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
