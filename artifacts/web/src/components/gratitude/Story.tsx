import { useEffect, useRef, useState, type ReactNode } from 'react';
import '@/pages/thanks-the-world/ttw.css';
import { Link } from 'wouter';
import { Show } from '@clerk/react';
import { Flag as FlagIcon, Heart, Play, MessageCircle, Share2, Trash2, X } from 'lucide-react';
import { useGetGratitudeStory, getGetGratitudeStoryQueryKey, type GratitudeMedia, type GratitudeStory } from '@workspace/api-client-react';
import { ErrorBox, Skeleton, btn, btnGhost, field } from '@/components/network/kit';
import { Flag, IDENTITIES, errMsg, fmt, mediaSrc, useGratitudeAct, type IdentityKey } from '@/lib/gratitude';

export function IdentityBand({ id, className = '', children }: { id: IdentityKey; className?: string; children?: ReactNode }) {
  const t = IDENTITIES[id];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: t.bg }} data-identity={id}>
      <div className="pointer-events-none absolute inset-0" style={{ background: t.pattern }} aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

export function StoryMedia({ media, compact }: { media: GratitudeMedia[]; compact?: boolean }) {
  const ready = media.filter((m) => m.url);
  if (!ready.length) return null;
  const video = ready.find((m) => m.kind === 'video');
  if (video) {
    return <video src={mediaSrc(video.url)!} poster={mediaSrc(video.thumbnailUrl) ?? undefined} controls preload="metadata" playsInline className="w-full bg-ink-900" aria-label={video.altText || 'Story video'} data-testid={`video-story-media-${video.id}`} />;
  }
  const imgs = compact ? ready.slice(0, 1) : ready;
  return (
    <div className={`grid gap-1 ${imgs.length > 1 ? 'grid-cols-2' : ''}`}>
      {imgs.map((m, i) => <img key={m.id} src={mediaSrc(m.url)!} alt={m.altText || ''} loading="lazy" className={`w-full object-cover ${imgs.length === 3 && i === 0 ? 'col-span-2' : ''} ${compact ? 'aspect-[4/3]' : 'max-h-[70vh]'}`} data-testid={`img-story-media-${m.id}`} />)}
    </div>
  );
}

export function StoryCard({ s, href }: { s: GratitudeStory; href: string }) {
  const video = s.media.find((m) => m.kind === 'video' && (m.thumbnailUrl || m.url));
  const images = s.media.filter((m) => m.kind !== 'video' && m.url);
  return (
    <Link href={href} className="ttw-card group flex h-full flex-col overflow-hidden border border-sand-200 bg-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`card-story-${s.id}`}>
      {video ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-lagoon-900" data-testid={`thumb-video-${s.id}`}>
          {video.thumbnailUrl && <img src={mediaSrc(video.thumbnailUrl)!} alt={video.altText || ''} loading="lazy" className="h-full w-full object-cover opacity-90" />}
          <span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-ivory-50/90 text-lagoon-900 shadow-lg"><Play className="ml-0.5 h-6 w-6" aria-hidden /></span></span>
          <span className="sr-only">Video story</span>
        </div>
      ) : images.length > 0 && <div className="overflow-hidden"><StoryMedia media={images} compact /></div>}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-700"><Flag code={s.countryCode} name={s.countryName} className="h-4 w-6 shrink-0 border border-sand-200" />{s.countryName || s.continent || 'Worldwide'}{s.featured ? ' · Featured' : ''}</p>
        <h3 className="font-display text-xl leading-snug text-ink-900 group-hover:text-lagoon-700">{s.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-700">{s.body}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sand-200 pt-3 text-xs text-ink-700">
          <span className="truncate">{s.authorName}</span>
          <span className="flex gap-3 font-mono" aria-label={`${s.likes} likes, ${s.commentCount} comments`}><span>{fmt(s.likes)} likes</span><span>{fmt(s.commentCount)} replies</span></span>
        </div>
      </div>
    </Link>
  );
}

/** Records a view only after the story stays visible for 2 seconds, or its video starts playing. */
function useEngagedView(id: number, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const sent = useRef(false);
  const { run } = useGratitudeAct();
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => { sent.current = false; }, [id, enabled]);
  const send = () => { if (!sent.current && enabled) { sent.current = true; runRef.current({ action: 'view', id }).catch(() => { sent.current = false; }); } };
  const sendRef = useRef(send);
  sendRef.current = send;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof IntersectionObserver === 'undefined') return;
    let t: number | undefined;
    let visible = false;
    const clear = () => { if (t) { window.clearTimeout(t); t = undefined; } };
    const arm = () => { clear(); if (visible && document.visibilityState === 'visible') t = window.setTimeout(() => sendRef.current(), 2000); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; arm(); }, { threshold: 0.4 });
    const onVis = () => arm();
    document.addEventListener('visibilitychange', onVis);
    io.observe(el);
    return () => { io.disconnect(); clear(); document.removeEventListener('visibilitychange', onVis); };
  }, [id, enabled]);
  return { ref, onPlay: () => sendRef.current() };
}

export function StoryDetail({ id, onClose, signedInMemberId }: { id: number; onClose: () => void; signedInMemberId?: number }) {
  const q = useGetGratitudeStory(id, { query: { queryKey: getGetGratitudeStoryQueryKey(id), refetchOnMount: 'always' } });
  if (q.isLoading) return <div className="p-6"><Skeleton rows={4} /></div>;
  if (q.isError || !q.data) return <div className="p-6"><ErrorBox onRetry={() => q.refetch()} msg="This story is not available. It may have been withdrawn or is awaiting review." /><button className={`${btnGhost} mt-4`} onClick={onClose} data-testid="button-close-story">Back to stories</button></div>;
  return <StoryBody s={q.data} onClose={onClose} me={signedInMemberId} />;
}

function StoryBody({ s, onClose, me }: { s: GratitudeStory; onClose: () => void; me?: number }) {
  const published = s.status === 'published';
  const own = me !== undefined && me === s.authorId;
  const { ref, onPlay } = useEngagedView(s.id, published && me !== undefined && !own);
  const { run, pending } = useGratitudeAct();
  const [msg, setMsg] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [reporting, setReporting] = useState<number | 'story' | null>(null);
  const [reason, setReason] = useState('');
  const act = (p: Promise<unknown>, ok?: string) => { setMsg(null); p.then(() => ok && setMsg(ok)).catch((e) => setMsg(errMsg(e))); };

  const share = async () => {
    const url = `${window.location.origin}${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/thanks-the-world?story=${s.id}`;
    try {
      if (navigator.share) await navigator.share({ title: s.title, url });
      else { await navigator.clipboard.writeText(url); setMsg('Link copied.'); }
      run({ action: 'share', id: s.id }).catch(() => undefined);
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'AbortError') {
        setMsg('Sharing is unavailable in this browser. You can copy this story’s address from the address bar.');
      }
    }
  };

  return (
    <article ref={ref} className="ttw-detail" data-testid={`story-detail-${s.id}`}>
      <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-700">{s.campaignName}</p>
        <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full text-ink-700 hover:bg-ivory-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" aria-label="Close story" data-testid="button-close-story"><X className="h-5 w-5" /></button>
      </div>
      <div onPlay={onPlay}><StoryMedia media={s.media} /></div>
      <div className="px-5 py-6 sm:px-8">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lagoon-700"><Flag code={s.countryCode} name={s.countryName} className="h-6 w-9 shrink-0 border border-sand-200" />{[s.countryName, s.region, s.continent].filter(Boolean).join(' · ')}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink-900" data-testid="text-story-title">{s.title}</h2>
        <p className="mt-2 text-sm text-ink-700">Shared by {s.authorName}{s.publishedAt ? ` · ${new Date(s.publishedAt).toLocaleDateString()}` : ''}</p>
        <p className="mt-1 text-xs text-sand-400">A personal story reviewed by the Founder for publication. Countries describe the story's subject, not a verified nationality.</p>
        <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-ink-800" data-testid="text-story-body">{s.body}</div>

        {published && (
          <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-sand-200 py-4">
            <Show when="signed-in">
              {own ? <span className="text-xs text-ink-700">{fmt(s.likes)} thanks · your own story</span> : <button className={s.liked ? btn : btnGhost} disabled={pending} aria-pressed={s.liked} onClick={() => act(run({ action: 'like', id: s.id, accepted: !s.liked }))} data-testid="button-like-story"><Heart className="h-4 w-4" />{s.liked ? 'Thanked' : 'Thank'} · {fmt(s.likes)}</button>}
            </Show>
            <Show when="signed-out"><span className="text-xs text-ink-700">{fmt(s.likes)} thanks</span></Show>
            <button className={btnGhost} onClick={share} data-testid="button-share-story"><Share2 className="h-4 w-4" />Share</button>
            <span className="ml-auto font-mono text-xs text-sand-400" data-testid="text-story-stats">{fmt(s.views)} views · {fmt(s.shareIntents)} share actions</span>
          </div>
        )}
        {msg && <p className="mt-3 text-xs text-lagoon-700" role="status">{msg}</p>}

        {published && (
          <section className="mt-6" aria-label="Replies">
            <h3 className="flex items-center gap-2 font-display text-lg text-ink-900"><MessageCircle className="h-4 w-4 text-gold-600" />Replies ({fmt(s.commentCount)})</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {s.comments.map((c) => (
                <li key={c.id} className="border-l-2 border-gold-500/40 pl-3" data-testid={`comment-${c.id}`}>
                  <p className="text-xs text-ink-700"><span className="font-semibold text-ink-900">{c.authorName}</span> · {new Date(c.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{c.body}</p>
                  <Show when="signed-in">
                    <div className="mt-1 flex gap-3 text-xs">
                      {me === c.authorId && <button className="inline-flex min-h-11 items-center gap-1 px-1 text-crimson-700 underline" disabled={pending} onClick={() => confirm('Delete your reply?') && act(run({ action: 'deleteComment', id: s.id, commentId: c.id }))} data-testid={`button-delete-comment-${c.id}`}><Trash2 className="h-3 w-3" />Delete</button>}
                      {me !== c.authorId && <button className="inline-flex min-h-11 items-center gap-1 px-1 text-ink-700 underline" onClick={() => setReporting(c.id)} data-testid={`button-report-comment-${c.id}`}><FlagIcon className="h-3 w-3" />Report</button>}
                    </div>
                  </Show>
                </li>
              ))}
              {s.comments.length === 0 && <li className="text-sm text-ink-700">No replies yet.</li>}
            </ul>
            <Show when="signed-in">
              <form className="mt-4 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; act(run({ action: 'comment', id: s.id, body: comment.trim() }).then(() => setComment(''))); }}>
                <label className="text-xs font-semibold text-ink-800" htmlFor="ttw-comment">Add a kind reply</label>
                <textarea id="ttw-comment" className={`${field} min-h-20`} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} data-testid="input-comment" />
                <button className={`${btn} self-start`} disabled={pending || !comment.trim()} data-testid="button-submit-comment">Post reply</button>
              </form>
              {me !== s.authorId && <button className="mt-4 inline-flex min-h-11 items-center gap-1 text-xs text-ink-700 underline" onClick={() => setReporting('story')} data-testid="button-report-story"><FlagIcon className="h-3 w-3" />Report this story</button>}
            </Show>
            <Show when="signed-out"><p className="mt-4 text-sm text-ink-700"><Link href="/sign-in" className="font-semibold text-lagoon-700 underline">Sign in</Link> to thank, reply or report.</p></Show>
            {reporting !== null && (
              <form className="mt-4 flex flex-col gap-2 border border-sand-200 bg-ivory-100 p-4" onSubmit={(e) => { e.preventDefault(); act(run({ action: 'report', id: s.id, commentId: reporting === 'story' ? undefined : reporting, reason: reason.trim() }).then(() => { setReporting(null); setReason(''); }), 'Report sent to the Founder. Thank you.'); }}>
                <label className="text-xs font-semibold text-ink-800" htmlFor="ttw-report">Why should the Founder review this {reporting === 'story' ? 'story' : 'reply'}?</label>
                <textarea id="ttw-report" className={`${field} min-h-16`} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} data-testid="input-report-reason" />
                <div className="flex gap-2"><button className={btn} disabled={pending || reason.trim().length < 3} data-testid="button-send-report">Send report</button><button type="button" className={btnGhost} onClick={() => setReporting(null)}>Cancel</button></div>
              </form>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
