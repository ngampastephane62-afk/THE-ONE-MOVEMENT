import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useGetFounderCommandCenter, useGetFounderSector, getGetFounderSectorQueryKey } from '@workspace/api-client-react';
import { errStatus } from '@/components/network/kit';
import { POLL, fmt, num, overviewOpts, sectorName } from '@/components/founder/command-helpers';

function Err({ e, retry, what }: { e: unknown; retry: () => void; what: string }) {
  return <div role="alert" className="rounded-2xl border border-crimson-700/30 bg-ivory-50 p-5" data-testid="error-sectors"><p className="font-semibold text-ink-900">{what} could not be loaded{errStatus(e) ? ` (HTTP ${errStatus(e)})` : ''}.</p><button type="button" onClick={retry} className="mt-3 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900" data-testid="button-retry-sectors">Retry</button></div>;
}

function SectorDetail({ slug }: { slug: string }) {
  const q = useGetFounderSector(slug, { query: { queryKey: getGetFounderSectorQueryKey(slug), refetchInterval: POLL } });
  const d = q.data;
  if (q.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-sand-100" aria-hidden="true" />;
  if (!d) return <Err e={q.error} retry={() => q.refetch()} what="This sector" />;
  const s = d.summary;
  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[['Participants', s.participants], ['New · 7 days', s.newMembers], ['Posts', s.posts], ['Pending certifications', s.pendingCertifications], ['Open reports', d.reports]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-sand-200 bg-ivory-50 p-3"><dt className="text-eyebrow text-gold-700">{l}</dt><dd className="mt-1 font-display text-xl text-ink-900">{num(Number(v))}</dd></div>
        ))}
      </dl>
      <section aria-labelledby="sec-acc">
        <h2 id="sec-acc" className="font-display text-lg text-ink-900">Accounts in this sector ({d.accounts.length})</h2>
        {d.accounts.length === 0 ? <p className="mt-2 rounded-xl border border-dashed border-sand-300 p-4 text-sm text-ink-700">No account has selected this sector.</p> : (
          <ul className="mt-2 divide-y divide-sand-100 rounded-2xl border border-sand-200 bg-ivory-50">
            {d.accounts.map((a) => (
              <li key={a.clerkId}><Link href={`/member/founder/members/${encodeURIComponent(a.clerkId)}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-ivory-100" data-testid={`link-sector-member-${a.clerkId}`}>
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-900">{a.name || 'Unnamed account'}</span><span className="block truncate font-mono text-[11px] text-ink-700">{a.email}</span></span>
                <span className="text-[11px] text-ink-700">{a.suspended ? 'Suspended · ' : ''}Last sign-in {fmt(a.lastSignInAt)}</span>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="sec-act">
        <h2 id="sec-act" className="font-display text-lg text-ink-900">Recent activity</h2>
        {d.activity.length === 0 ? <p className="mt-2 text-sm text-ink-700">No recent posts in this sector.</p> : (
          <ul className="mt-2 flex flex-col gap-2">{d.activity.map((x) => <li key={x.id} className="rounded-xl border border-sand-200 bg-ivory-50 p-3 text-sm"><p className="line-clamp-3 whitespace-pre-wrap text-ink-900">{x.text || '(media post)'}</p><p className="mt-1 text-[11px] text-ink-700">{x.kind} · {fmt(x.createdAt)}</p></li>)}</ul>
        )}
      </section>
      <section aria-labelledby="sec-cert">
        <h2 id="sec-cert" className="font-display text-lg text-ink-900">Certifications</h2>
        {d.certifications.length === 0 ? <p className="mt-2 text-sm text-ink-700">No certification applications linked to this sector.</p> : (
          <ul className="mt-2 flex flex-col gap-2">{d.certifications.map((c) => <li key={c.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-sand-200 bg-ivory-50 p-3 text-sm"><span>{c.role} · {c.program}</span><span className="text-xs font-semibold uppercase text-gold-700">{c.status}</span></li>)}</ul>
        )}
        <p className="mt-2 text-xs text-ink-700">Decide applications from each member's detail page.</p>
      </section>
    </div>
  );
}

export default function FounderSectors() {
  const { slug } = useParams<{ slug?: string }>();
  const q = useGetFounderCommandCenter(overviewOpts());
  return (
    <section className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-founder-sectors">
      <Helmet><title>{slug ? `${sectorName(slug)} — Sectors` : 'All Sectors'} — Founder</title></Helmet>
      <Link href={slug ? '/member/founder/sectors' : '/member/founder'} className="inline-flex items-center gap-1 text-xs font-semibold text-lagoon-700" data-testid="link-back-sectors"><ArrowLeft className="h-3.5 w-3.5" />{slug ? 'All sectors' : 'Founder Command Center'}</Link>
      <header className="border-b border-sand-200 pb-4">
        <p className="text-eyebrow text-gold-700">FOUNDER · SECTORS</p>
        <h1 className="mt-1 font-display text-2xl text-ink-900 sm:text-3xl">{slug ? sectorName(slug) : 'All Sectors'}</h1>
        <p className="mt-1 text-xs text-ink-700">Refreshes every 30 seconds.{q.data && q.data.environment !== 'production' ? ' Development preview data.' : ''}</p>
      </header>
      {slug ? <SectorDetail slug={slug} /> : q.isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-sand-100" aria-hidden="true" /> : !q.data ? <Err e={q.error} retry={() => q.refetch()} what="Sectors" /> : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {q.data.sectors.map((s) => (
            <li key={s.slug}><Link href={`/member/founder/sectors/${s.slug}`} className="flex h-full flex-col gap-2 rounded-2xl border border-sand-200 bg-ivory-50 p-4 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`card-sector-${s.slug}`}>
              <span className="font-display text-lg text-ink-900">{sectorName(s.slug)}</span>
              <span className="grid grid-cols-2 gap-1 text-xs text-ink-700"><span>{num(s.participants)} participants</span><span>{num(s.newMembers)} new · 7 d</span><span>{num(s.posts)} posts</span><span>{num(s.pendingCertifications)} pending cert.</span><span>{num(s.pendingReports)} open reports</span></span>
            </Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}
