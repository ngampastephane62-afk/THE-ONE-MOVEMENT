import { getGetMagazineStatisticsQueryKey, useGetMagazineStatistics } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { RefreshCw } from 'lucide-react';
import { KIT_PDF_URL } from './editorial-data';

const fmt = (n: number) => new Intl.NumberFormat(document.documentElement.lang || 'en').format(n);
const when = (iso: string) => new Date(iso).toLocaleString(document.documentElement.lang || 'en', { dateStyle: 'medium', timeStyle: 'short' });

export default function MagazineStats() {
  const q = useGetMagazineStatistics({ query: { queryKey: getGetMagazineStatisticsQueryKey(), refetchInterval: 30000 } });
  const d = q.data;
  const rows = d ? [
    { k: 'opens', v: d.opens, l: 'Reading sessions opened', h: 'Distinct browser sessions that opened the magazine.' },
    { k: 'pages', v: d.pagesViewed, l: 'Pages actually seen', h: 'Each page counted once per session, after two visible seconds.' },
    { k: 'engaged', v: d.engagedSessions, l: 'Engaged readings', h: 'At least 30 seconds of visible reading across two or more pages.' },
  ] : [];
  return (
    <aside aria-labelledby="stats-heading" className="border border-ivory-50/15 bg-ink-900/40 p-6" data-testid="panel-magazine-stats">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Live on this site</p>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ivory-300"><span className={`h-1.5 w-1.5 rounded-full ${q.isError ? 'bg-ivory-300' : 'bg-gold-400 motion-safe:animate-pulse'}`} />Updates every 30 s</span>
      </div>
      <h2 id="stats-heading" className="mt-3 font-display text-3xl leading-tight">Measured, not declared.</h2>
      <p className="mt-2 text-sm leading-relaxed text-ivory-200">Counted from real readings of this digital magazine. These are sessions, not unique people, and social audiences are never added in.</p>

      {q.isLoading && <div className="mt-6 space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse bg-ivory-50/10" />)}</div>}
      {q.isError && (
        <div className="mt-6 border border-ivory-50/20 p-4" role="alert">
          <p className="text-sm text-ivory-100">The reading statistics could not be loaded.</p>
          <button type="button" onClick={() => q.refetch()} className="mt-3 inline-flex items-center gap-2 bg-gold-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="button-stats-retry"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Retry</button>
        </div>
      )}
      {d && (
        <>
          <dl className="mt-6 divide-y divide-ivory-50/10 border-y border-ivory-50/10">
            {rows.map((r) => (
              <div key={r.k} className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 py-4">
                <dd className="min-w-[4.5ch] font-display text-4xl tabular-nums text-ivory-50" data-testid={`stat-${r.k}`}>{fmt(r.v)}</dd>
                <dt><span className="block text-sm font-semibold text-ivory-100">{r.l}</span><span className="block text-xs leading-relaxed text-ivory-300">{r.h}</span></dt>
              </div>
            ))}
          </dl>
          {d.opens === 0 && <p className="mt-4 text-sm text-ivory-200" data-testid="text-stats-zero">No reading counted yet. Open the magazine: your session will be the first.</p>}
          <p className="mt-4 text-xs leading-relaxed text-ivory-300" data-testid="text-stats-period">
            {d.startedAt ? <>Collection started {when(d.startedAt)}. </> : <>Counting begins with the first reading. </>}
            Last update {when(d.updatedAt)}. Edition: Tropik Magazine editorial selection.
          </p>
        </>
      )}

      <div className="mt-6 border-t border-ivory-50/15 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">Why it matters</p>
        <p className="mt-2 text-sm leading-relaxed text-ivory-200">Every story here is read on paper-like pages, page by page. An accepted contributor article can be relayed on the Tropik social pages and, after acceptance and written conditions, printed on an inside page for USD 200.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tropik-magazine/contribute" className="bg-gold-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="link-stats-contribute">Propose your story</Link>
          <a href={KIT_PDF_URL} className="border border-ivory-50/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory-50 hover:border-gold-400" data-testid="link-stats-kit">Media kit PDF · Free</a>
        </div>
      </div>
    </aside>
  );
}
