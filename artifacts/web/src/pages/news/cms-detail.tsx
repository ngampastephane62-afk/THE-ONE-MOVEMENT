import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { RotateCw } from 'lucide-react';
import { useGetPublishedNewsArticle, getGetPublishedNewsArticleQueryKey } from '@workspace/api-client-react';
import NewsRenderer from '@/components/news-cms/NewsRenderer';
import { errStatus } from '@/components/network/kit';
import { publicMediaUrl } from '@/lib/news-cms';

export default function CmsNewsDetail({ slug }: { slug: string }) {
  const q = useGetPublishedNewsArticle(slug, { query: { queryKey: getGetPublishedNewsArticleQueryKey(slug), refetchOnMount: 'always', refetchInterval: 120000, retry: (n, e) => errStatus(e) !== 404 && n < 2 } });
  if (q.isLoading) return (
    <div aria-busy="true" className="min-h-[70vh] bg-ivory-50"><div className="h-72 animate-pulse bg-lagoon-900" /><div className="mx-auto max-w-3xl space-y-4 px-6 py-12">{[0, 1, 2].map((i) => <div key={i} className="h-5 animate-pulse rounded bg-ivory-200" />)}</div></div>
  );
  if (q.isError || !q.data) {
    const missing = errStatus(q.error) === 404;
    return (
      <div className="grid min-h-[60vh] place-items-center bg-ivory-50 px-6 py-24 text-center" data-testid="state-cms-article-missing">
        <Helmet><title>News — The One Movement International</title><meta name="robots" content="noindex" /></Helmet>
        <div className="max-w-md">
          <p className="text-eyebrow text-gold-700">News</p>
          <h1 className="mt-3 font-display text-2xl uppercase text-lagoon-900">{missing ? 'This article is not available.' : 'The article did not load.'}</h1>
          <div className="mt-6 flex justify-center gap-4 text-sm font-semibold">
            {!missing && <button type="button" onClick={() => q.refetch()} className="inline-flex items-center gap-1 text-gold-700" data-testid="button-retry-cms-article"><RotateCw className="h-4 w-4" />Try again</button>}
            <Link href="/news" className="text-lagoon-900 underline underline-offset-4" data-testid="link-back-news">All news</Link>
          </div>
        </div>
      </div>
    );
  }
  const a = q.data;
  const s = a.snapshot;
  const title = `${s.seoTitle || s.title} — The One Movement International`;
  const desc = s.seoDescription || s.subtitle || '';
  const media = publicMediaUrl(a.slug);
  return (
    <div>
      <Helmet>
        <title>{title}</title>
        {desc && <meta name="description" content={desc} />}
        <meta property="og:title" content={s.seoTitle || s.title} />
        {desc && <meta property="og:description" content={desc} />}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={a.publishedAt} />
        {s.cover && <meta property="og:image" content={new URL(media(s.cover.uploadId), window.location.origin).toString()} />}
      </Helmet>
      <NewsRenderer snapshot={s} mediaUrl={media} publishedAt={a.publishedAt} shareUrl={window.location.href} />
      <div className="bg-ivory-50 pb-16"><div className="mx-auto max-w-3xl px-6"><Link href="/news" className="text-sm font-semibold text-lagoon-900 underline underline-offset-4" data-testid="link-all-news">All news</Link></div></div>
    </div>
  );
}
