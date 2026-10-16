import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Facebook, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { useGetVideoEngagement, getGetVideoEngagementQueryKey, useUpdateVideoEngagement, type VideoEngagementInput } from '@workspace/api-client-react';

export function videoShareUrl(videoId: string) {
  const u = new URL(window.location.href);
  u.search = ''; u.searchParams.set('video', videoId); u.hash = `video-${videoId}`;
  return u.toString();
}

export default function VideoActions({ videoId, title, founder }: { videoId: string; title: string; founder?: boolean }) {
  const { isSignedIn } = useAuth();
  const qc = useQueryClient();
  const key = getGetVideoEngagementQueryKey(videoId);
  const q = useGetVideoEngagement(videoId, { query: { queryKey: key, refetchInterval: 60000 } });
  const m = useUpdateVideoEngagement({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: key }) } });
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const act = (data: VideoEngagementInput, ok?: () => void) => { setNote(''); m.mutate({ videoId, data }, { onSuccess: ok, onError: () => setNote('That did not go through. Try again.') }); };
  const url = typeof window !== 'undefined' ? videoShareUrl(videoId) : '';
  const copy = async (msg: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url); setNote(msg);
    } catch { setNote('Copy failed. Copy the page address manually.'); }
  };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* cancelled */ } } else copy('Link copied.'); };
  const e = q.data;
  const pill = 'inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:border-lagoon-600 disabled:opacity-50';

  return (
    <div className="mt-3 flex flex-col gap-3" data-testid={`video-actions-${videoId}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button className={`${pill} ${e?.liked ? 'border-coral-500 text-coral-500' : ''}`} disabled={!isSignedIn || m.isPending || !e} onClick={() => act({ action: 'like', accepted: !e?.liked })} aria-pressed={!!e?.liked} data-testid={`button-like-${videoId}`}><Heart className={`h-3.5 w-3.5 ${e?.liked ? 'fill-current' : ''}`} />{e?.likes ?? 0}</button>
        <button className={pill} onClick={() => setOpen(!open)} aria-expanded={open} data-testid={`button-comments-${videoId}`}><MessageCircle className="h-3.5 w-3.5" />{e?.comments.length ?? 0}</button>
        <button className={pill} onClick={share} data-testid={`button-share-${videoId}`}><Share2 className="h-3.5 w-3.5" />Share</button>
        <a className={pill} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer noopener" data-testid={`link-facebook-${videoId}`}><Facebook className="h-3.5 w-3.5" />Facebook</a>
        <button className={pill} onClick={() => copy('Link copied.')} data-testid={`button-copy-${videoId}`}><Copy className="h-3.5 w-3.5" />Copy link</button>
        <button className={pill} onClick={() => copy('Link copied. Paste it into your Instagram or TikTok story or bio; we do not post for you.')} data-testid={`button-insta-tiktok-${videoId}`}>Instagram / TikTok</button>
      </div>
      {note && <p className="text-xs text-ink-700" role="status">{note}</p>}
      {!isSignedIn && <p className="text-xs text-ink-700"><Link href="/sign-in" className="font-semibold text-lagoon-700 underline">Sign in</Link> to like or comment.</p>}
      {open && (
        <div className="rounded-2xl border border-sand-200 bg-ivory-50 p-3">
          {q.isLoading ? <p className="text-xs text-sand-400">Loading comments...</p> : q.isError ? <button className="text-xs text-crimson-700 underline" onClick={() => q.refetch()}>Comments did not load. Retry</button> : e!.comments.length === 0 ? <p className="text-xs text-sand-400">No comments yet.</p> : (
            <ul className="flex flex-col gap-2">{e!.comments.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm" data-testid={`comment-${c.id}`}><div className="flex-1"><b className="text-ink-900">{c.author}</b> <span className="text-[10px] text-sand-400">{new Date(c.createdAt).toLocaleDateString()}</span><p className="whitespace-pre-wrap break-words text-ink-700">{c.text}</p></div>
                {c.canDelete ? <button aria-label="Delete comment" className="text-sand-400 hover:text-crimson-700" onClick={() => act({ action: 'delete', id: c.id })} data-testid={`button-delete-comment-${c.id}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  : founder && <button className="text-[10px] text-sand-400 underline hover:text-crimson-700" onClick={() => act({ action: 'moderate', id: c.id, accepted: false })} data-testid={`button-moderate-comment-${c.id}`}>Hide</button>}</li>))}</ul>
          )}
          {isSignedIn && <form className="mt-3 flex gap-2" onSubmit={(ev) => { ev.preventDefault(); if (text.trim()) act({ action: 'comment', text: text.trim() }, () => setText('')); }}>
            <input className="min-w-0 flex-1 rounded-full border border-sand-300 bg-ivory-50 px-3 py-1.5 text-sm" maxLength={1500} value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Add a comment" aria-label="Comment" data-testid={`input-comment-${videoId}`} />
            <button className="rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-ivory-50 disabled:opacity-50" disabled={!text.trim() || m.isPending} data-testid={`button-post-comment-${videoId}`}>Post</button>
          </form>}
        </div>
      )}
    </div>
  );
}
