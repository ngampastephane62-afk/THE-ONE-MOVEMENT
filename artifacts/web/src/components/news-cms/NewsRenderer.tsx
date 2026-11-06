import { useState } from 'react';
import { Link } from 'wouter';
import { Share2 } from 'lucide-react';
import type { NewsBlock, NewsImage, NewsSnapshot } from '@workspace/api-client-react';
import { PARTNER_INTRODUCTION_TARGETS } from '@workspace/shared';
import { categoryLabel, embedSrc, formatDate } from '@/lib/news-cms';

interface Props {
  snapshot: NewsSnapshot;
  mediaUrl: (uploadId: string) => string;
  publishedAt?: string | null;
  partnerLabel?: string | null;
  programmeLabel?: string | null;
  shareUrl?: string;
  preview?: boolean;
}

function Figure({ img, mediaUrl, caption, testId }: { img: NewsImage; mediaUrl: Props['mediaUrl']; caption?: string | null; testId?: string }) {
  return (
    <figure className="my-8" data-testid={testId}>
      <img src={mediaUrl(img.uploadId)} alt={img.alt} loading="lazy" className="block h-auto w-full rounded-sm bg-ivory-200 object-contain" />
      {(caption || img.credit) && (
        <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-lagoon-700">
          {caption && <span className="italic">{caption}</span>}
          {img.credit && <span className="text-xs uppercase tracking-wider text-sand-400">Credit: {img.credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function Block({ b, mediaUrl, i }: { b: NewsBlock; mediaUrl: Props['mediaUrl']; i: number }) {
  switch (b.type) {
    case 'paragraph': return <p className="whitespace-pre-line text-lg leading-relaxed text-lagoon-800">{b.text}</p>;
    case 'heading': return b.level === 2
      ? <h2 className="mt-10 font-display text-2xl uppercase tracking-wide text-lagoon-900">{b.text}</h2>
      : <h3 className="mt-8 font-display text-xl uppercase tracking-wide text-lagoon-900">{b.text}</h3>;
    case 'quote': return (
      <figure className="my-8 border-l-2 border-gold-500 pl-6">
        <blockquote className="whitespace-pre-line text-xl italic leading-relaxed text-lagoon-700">{b.text}</blockquote>
        {b.attribution && <figcaption className="mt-3 text-sm text-lagoon-600">{b.attribution}</figcaption>}
      </figure>
    );
    case 'list': {
      const items = b.items.filter((x) => x.trim());
      return b.ordered
        ? <ol className="list-decimal space-y-2 pl-6 text-lg leading-relaxed text-lagoon-800">{items.map((t, k) => <li key={k}>{t}</li>)}</ol>
        : <ul className="list-disc space-y-2 pl-6 text-lg leading-relaxed text-lagoon-800 marker:text-gold-500">{items.map((t, k) => <li key={k}>{t}</li>)}</ul>;
    }
    case 'image': return <Figure img={b} caption={b.caption} mediaUrl={mediaUrl} testId={`img-block-${i}`} />;
  }
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const [msg, setMsg] = useState('');
  const share = async () => {
    setMsg('');
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setMsg('Link copied to clipboard.');
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      setMsg('Sharing is not available here. Copy the address from your browser bar.');
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-gold-500/50 px-4 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-share-article"><Share2 className="h-4 w-4" />Share</button>
      <span role="status" className="text-xs text-lagoon-700">{msg}</span>
    </div>
  );
}

export default function NewsRenderer({ snapshot: s, mediaUrl, publishedAt, partnerLabel, programmeLabel, shareUrl, preview }: Props) {
  const date = s.publicationDate ?? publishedAt ?? null;
  partnerLabel = partnerLabel ?? (s.relatedPartnerKey ? PARTNER_INTRODUCTION_TARGETS.find((p) => String(p.id) === s.relatedPartnerKey)?.name ?? null : null);
  const embed = s.video?.kind === 'embed' ? embedSrc(s.video.provider, s.video.videoId) : null;
  return (
    <article className="bg-ivory-50" data-testid="article-rendered">
      <header className="bg-lagoon-900 px-6 py-14 text-ivory-100 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-eyebrow text-gold-400" data-testid="text-article-category">{categoryLabel(s.category)}</p>
          <h1 className="mt-4 font-display text-3xl uppercase leading-tight tracking-wide text-ivory-50 sm:text-5xl" data-testid="text-article-title">{s.title || 'Untitled article'}</h1>
          {s.subtitle && <p className="mt-4 text-lg leading-relaxed text-ivory-200">{s.subtitle}</p>}
          <div className="mt-6 h-px w-24 bg-gold-400" aria-hidden="true" />
          <p className="mt-5 text-sm text-ivory-300" data-testid="text-article-byline">
            {s.author && <span>{s.author}</span>}{s.author && date && ' · '}
            {date && <time dateTime={date}>{formatDate(date)}</time>}
            {!s.author && !date && preview && <span className="italic">No author or date set</span>}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-12">
        {s.cover && <Figure img={s.cover} mediaUrl={mediaUrl} testId="img-article-cover" />}
        {s.video?.kind === 'upload' && (
          <video controls preload="metadata" className="my-8 w-full rounded-sm bg-lagoon-900" src={mediaUrl(s.video.uploadId)} data-testid="video-article"><track kind="captions" /></video>
        )}
        {s.video?.kind === 'embed' && (embed ? (
          <div className="relative my-8 aspect-video overflow-hidden rounded-sm bg-lagoon-900">
            <iframe src={embed} title={`${s.title} video`} className="absolute inset-0 h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy" data-testid="iframe-article-video" />
          </div>
        ) : <p className="my-8 rounded-sm border border-coral-500/40 p-4 text-sm text-lagoon-800">This video reference is not valid and is not shown.</p>)}
        <div className="space-y-6">{s.body.map((b, i) => <Block key={i} b={b} i={i} mediaUrl={mediaUrl} />)}</div>
        {preview && s.body.length === 0 && <p className="text-sm italic text-sand-400">The body is empty.</p>}
        {s.additionalImages.length > 0 && (
          <section className="mt-12 border-t border-sand-200 pt-8" aria-label="Additional images">
            <p className="text-eyebrow text-gold-700">Gallery</p>
            <div className="grid gap-4 sm:grid-cols-2">{s.additionalImages.map((img, i) => <Figure key={i} img={img} mediaUrl={mediaUrl} testId={`img-gallery-${i}`} />)}</div>
          </section>
        )}
        {(partnerLabel || programmeLabel || s.relatedProgrammeSlug) && (
          <div className="mt-12 flex flex-wrap gap-3 border-t border-sand-200 pt-6 text-xs uppercase tracking-wide">
            {partnerLabel && <span className="rounded-sm border border-lagoon-700/30 px-3 py-1.5 text-lagoon-700" data-testid="text-related-partner">Partner · {partnerLabel}</span>}
            {s.relatedProgrammeSlug && (preview
              ? <span className="rounded-sm border border-gold-500/40 px-3 py-1.5 text-lagoon-700">Programme · {programmeLabel ?? s.relatedProgrammeSlug}</span>
              : <Link href={`/programs/${s.relatedProgrammeSlug}`} className="rounded-sm border border-gold-500/40 px-3 py-1.5 text-lagoon-700 hover:border-gold-500" data-testid="link-related-programme">Programme · {programmeLabel ?? s.relatedProgrammeSlug.replace(/-/g, ' ')}</Link>)}
          </div>
        )}
        {shareUrl && <div className="mt-10"><ShareButton url={shareUrl} title={s.seoTitle || s.title} /></div>}
      </div>
    </article>
  );
}
