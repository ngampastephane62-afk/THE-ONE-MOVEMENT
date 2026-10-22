import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Play, RotateCw, Share2 } from 'lucide-react';
import type { NewsPublicArticle } from '@workspace/api-client-react';
import { categoryLabel, embedSrc, formatDate, publicMediaUrl } from '@/lib/news-cms';
import { MEDIA_START, announceMediaStart, type MediaStartDetail } from '@/hooks/use-news-motion';
import { cn } from '@/lib/utils';

export const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2';

/** Splits a headline into up to three grouped lines (word groups, never letters). */
export function Lines({ text, base = 0, step = 140, className }: { text: string; base?: number; step?: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const per = Math.max(1, Math.ceil(words.length / Math.min(3, Math.max(1, Math.ceil(words.length / 3)))));
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += per) groups.push(words.slice(i, i + per).join(' '));
  return (
    <span className={className}>
      {groups.map((g, i) => (
        <span key={i} className="nm-line"><span style={{ ['--d' as string]: `${base + i * step}ms` }}>{g}</span></span>
      ))}
    </span>
  );
}

export function Meta({ a, tone = 'dark', d = 0, extra }: { a: NewsPublicArticle; tone?: 'dark' | 'light'; d?: number; extra?: ReactNode }) {
  return (
    <p className={cn('nm-up text-eyebrow', tone === 'dark' ? 'text-gold-400' : 'text-gold-700')} style={{ ['--d' as string]: `${d}ms` }} data-testid={`text-meta-${a.slug}`}>
      {categoryLabel(a.snapshot.category)} · <span className="sr-only">Published </span><time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>{extra}
    </p>
  );
}

export function DiscoverLink({ a, label = 'Discover story', tone = 'dark', d = 0 }: { a: NewsPublicArticle; label?: string; tone?: 'dark' | 'light'; d?: number }) {
  return (
    <Link href={`/news/${a.slug}`} className={cn('nm-up group inline-flex min-h-11 items-center gap-3 rounded-sharp border px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors', tone === 'dark' ? 'border-gold-400/60 text-ivory-50 hover:bg-gold-400 hover:text-ink-900' : 'border-lagoon-900/30 text-lagoon-900 hover:border-gold-600 hover:bg-lagoon-900 hover:text-ivory-50', ring)} style={{ ['--d' as string]: `${d}ms` }} data-testid={`link-discover-${a.slug}`}>
      {label}<span className="sr-only">: {a.snapshot.title}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

/** Native share / copy only — the CMS has no per-article likes or comments. */
export function ShareStory({ a, tone = 'dark' }: { a: NewsPublicArticle; tone?: 'dark' | 'light' }) {
  const [msg, setMsg] = useState('');
  const share = async () => {
    const url = new URL(`${import.meta.env.BASE_URL}news/${a.slug}`.replace(/\/{2,}/g, '/'), window.location.origin).toString();
    setMsg('');
    try {
      if (navigator.share) { await navigator.share({ title: a.snapshot.title, url }); return; }
      await navigator.clipboard.writeText(url); setMsg('Link copied');
    } catch (e) { if ((e as Error)?.name !== 'AbortError') setMsg('Copy the address from your browser'); }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={share} className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors', tone === 'dark' ? 'border-ivory-100/30 text-ivory-100 hover:border-gold-400 hover:text-gold-400' : 'border-lagoon-900/25 text-lagoon-900 hover:border-gold-600', ring)} aria-label={`Share ${a.snapshot.title}`} data-testid={`button-share-${a.slug}`}><Share2 className="h-4 w-4" aria-hidden /></button>
      <span role="status" className={cn('text-xs', tone === 'dark' ? 'text-ivory-300' : 'text-lagoon-700')}>{msg}</span>
    </span>
  );
}

/**
 * Honest media frame: object-contain at the original ratio, user-started playback.
 * Native videos are coordinated by the page's playback scope; an embed is mounted
 * only after Watch and unmounted when any other News media starts.
 */
export function StoryMedia({ a, ratio = 'aspect-[4/3]', preferVideo = false, priority = false, className, from = '', d = 0 }: { a: NewsPublicArticle; ratio?: string; preferVideo?: boolean; priority?: boolean; className?: string; from?: string; d?: number }) {
  const s = a.snapshot;
  const url = publicMediaUrl(a.slug);
  const owner = useId();
  const [play, setPlay] = useState(false);
  const [failed, setFailed] = useState<'image' | 'video' | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const base = s.video?.kind === 'embed' ? embedSrc(s.video.provider, s.video.videoId) : null;
  const isEmbed = !!base;
  const embed = base && play ? (() => { const u = new URL(base); u.searchParams.set('autoplay', '1'); return u.toString(); })() : base;
  const showVideo = !!s.video && (play || (preferVideo && !s.cover && s.video.kind === 'upload'));

  useEffect(() => {
    if (!isEmbed) return;
    const h = (e: Event) => { if ((e as CustomEvent<MediaStartDetail>).detail?.owner !== owner) setPlay(false); };
    document.addEventListener(MEDIA_START, h);
    return () => document.removeEventListener(MEDIA_START, h);
  }, [isEmbed, owner]);

  const start = () => { setFailed(null); setPlay(true); if (isEmbed) announceMediaStart(owner); };
  const retry = () => { setFailed(null); setImageReady(false); setAttempt((n) => n + 1); };

  let body: ReactNode;
  if (failed) {
    body = (
      <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
        <div>
          <p className="text-sm text-ivory-200">{failed === 'video' ? 'This video could not be loaded right now.' : 'This image could not be loaded right now.'}</p>
          <button type="button" onClick={retry} className={cn('mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-400/60 px-4 text-xs font-semibold uppercase tracking-wider text-gold-400', ring)} data-testid={`button-retry-media-${a.slug}`}><RotateCw className="h-3.5 w-3.5" aria-hidden />Retry</button>
        </div>
      </div>
    );
  } else if (showVideo && s.video?.kind === 'upload') {
    body = <video key={attempt} controls autoPlay={play} playsInline preload="metadata" onError={() => setFailed('video')} className="absolute inset-0 h-full w-full object-contain" src={url(s.video.uploadId)} aria-label={`${s.title} video`} data-testid={`video-story-${a.slug}`} />;
  } else if (showVideo && embed) {
    body = <iframe key={attempt} src={embed} title={`${s.title} video`} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy" />;
  } else if (s.cover) {
    body = <>
      <img key={attempt} src={url(s.cover.uploadId)} alt={s.cover.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" onLoad={() => setImageReady(true)} onError={() => setFailed('image')} className={cn('absolute inset-0 h-full w-full object-contain', !imageReady && 'opacity-0')} data-testid={`img-story-${a.slug}`} />
      {!imageReady && <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center bg-ivory-100/5 p-6 text-center text-xs uppercase tracking-[0.16em] text-ivory-300">Loading published cover…</div>}
    </>;
  } else {
    body = (
      <div className="absolute inset-0 grid place-items-center p-6 text-center">
        <div>
          <p className="font-display text-sm tracking-[0.35em] text-gold-400/80">TOMI</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ivory-300/70">No cover image published</p>
        </div>
      </div>
    );
  }
  const canPlay = !!s.video && !showVideo && !failed && (s.video.kind === 'upload' || !!base);

  return (
    <div className={cn('nm-media relative', from, className)} style={{ ['--d' as string]: `${d}ms` }}>
      <div className={cn('nm-push relative w-full overflow-hidden rounded-sharp bg-[hsl(170_45%_7%)]', ratio)} style={{ ['--d' as string]: `${d}ms` }}>
        {body}
        {canPlay && (
          <button type="button" onClick={start} className={cn('absolute bottom-3 left-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory-50/95 px-4 text-xs font-semibold uppercase tracking-wider text-lagoon-900 shadow-lg hover:bg-gold-400', ring)} aria-label={`Play video: ${s.title}`} data-testid={`button-play-story-${a.slug}`}>
            <Play className="h-4 w-4 fill-current" aria-hidden />Watch
          </button>
        )}
      </div>
      {s.cover?.credit && !showVideo && !failed && <p className="mt-2 text-[10px] uppercase tracking-wider text-sand-400">Credit: {s.cover.credit}</p>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, sub, tone = 'dark', id }: { eyebrow: string; title: string; sub?: string; tone?: 'dark' | 'light'; id: string }) {
  return (
    <header className="max-w-3xl">
      <p className={cn('nm-up text-eyebrow', tone === 'dark' ? 'text-gold-400' : 'text-gold-700')}>{eyebrow}</p>
      <h2 id={id} className={cn('nm-headline mt-4 font-display text-[clamp(1.9rem,6vw,4rem)] uppercase leading-[0.98] tracking-[0.03em]', tone === 'dark' ? 'text-ivory-50' : 'text-lagoon-900')}>
        <Lines text={title} base={80} />
      </h2>
      <span className="nm-rule mt-6 block h-px w-24 bg-gold-500" style={{ ['--d' as string]: '260ms' }} aria-hidden />
      {sub && <p className={cn('nm-up mt-5 text-lg leading-relaxed', tone === 'dark' ? 'text-ivory-200' : 'text-lagoon-800')} style={{ ['--d' as string]: '380ms' }}>{sub}</p>}
    </header>
  );
}
