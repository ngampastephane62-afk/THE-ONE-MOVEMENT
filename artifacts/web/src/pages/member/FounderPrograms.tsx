import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'wouter';
import { ExternalLink, RotateCw } from 'lucide-react';
import { useGetFounderProgramEditorial, getGetFounderProgramEditorialQueryKey, useGetProgramInquiries, getGetProgramInquiriesQueryKey } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btnGhost, card } from '@/components/network/kit';
import ProgramEditor from '@/components/founder/programs/ProgramEditor';
import { useMe } from './ctx';

const PROGRAMMES = [
  { slug: 'diplomatic-gala', name: 'THE ONE DIPLOMATIC GALA' },
  { slug: 'summit', name: 'THE ONE SUMMIT' },
  { slug: 'fashion-week', name: 'THE ONE FASHION WEEK INTERNATIONAL' },
  { slug: 'awards', name: 'THE ONE AWARDS' },
  { slug: 'fashion-night', name: 'THE ONE FASHION NIGHT' },
  { slug: 'investment-forum', name: 'THE ONE INVESTMENT FORUM' },
] as const;
const LEAVE = 'You have unsaved changes. Leave without saving?';
const WAIT = 'Please wait until the current save or upload finishes.';

function Inquiries({ slug }: { slug: string }) {
  const q = useGetProgramInquiries(slug, { query: { queryKey: getGetProgramInquiriesQueryKey(slug) } });
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={`${card} flex flex-col gap-3 p-4 sm:p-5`} aria-labelledby="inq-h" data-testid="section-program-inquiries">
      <div className="flex items-center justify-between gap-2">
        <h3 id="inq-h" className="font-display text-lg text-ink-900">Program inquiries</h3>
        <button type="button" className={btnGhost} onClick={() => q.refetch()} disabled={q.isFetching} data-testid="button-inquiries-reload"><RotateCw className={`h-3.5 w-3.5 ${q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />Reload</button>
      </div>
      {q.isLoading ? <Skeleton rows={3} /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} msg="Inquiries could not be loaded." />
        : !q.data?.length ? <Empty title="No inquiries yet" body="Speaker, partnership, sponsorship and media inquiries for this programme will appear here (latest 100)." />
        : (
          <ul className="flex flex-col gap-2">
            {q.data.map((r) => (
              <li key={r.id} className="rounded-xl border border-sand-200 bg-ivory-100" data-testid={`row-inquiry-${r.id}`}>
                <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className="flex min-h-11 w-full flex-wrap items-center gap-2 p-3 text-left text-sm">
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-ink-900">{r.name}{r.organization ? ` · ${r.organization}` : ''}</span><span className="block truncate text-xs text-ink-700">{r.title} · {r.country} · {new Date(r.createdAt).toLocaleDateString()}</span></span>
                  <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-ink-800">{r.status}</span>
                </button>
                {open === r.id && <div className="border-t border-sand-200 p-3 text-sm"><a href={`mailto:${r.email}`} className="text-lagoon-700 underline">{r.email}</a><p className="mt-2 whitespace-pre-line text-ink-800">{r.message}</p></div>}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}

export default function FounderPrograms() {
  const { me } = useMe();
  const [slug, setSlug] = useState<string>('awards');
  const [k, setK] = useState(0);
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const q = useGetFounderProgramEditorial(slug, { query: { queryKey: getGetFounderProgramEditorialQueryKey(slug), enabled: !!me?.founder, refetchOnWindowFocus: false } });

  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => { if (dirtyRef.current || busyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, []);

  if (!me?.founder) return <Redirect to="/member" replace />;
  const current = PROGRAMMES.find((p) => p.slug === slug)!;
  const choose = (next: string) => {
    if (busyRef.current) { window.alert(WAIT); return; }
    if (dirtyRef.current && !window.confirm(LEAVE)) return;
    dirtyRef.current = false; setSlug(next); setK((x) => x + 1);
  };
  const reload = async () => { dirtyRef.current = false; await q.refetch(); setK((x) => x + 1); };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-programs">
      <Helmet><title>Programs & Events — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <Link href="/member/founder" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-programs-back-founder">Back to Founder Workspace</Link>
        <p className="mt-2 text-eyebrow text-gold-400">FOUNDER · PROGRAMS & EVENTS</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Manage the six official programs</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">Edit text, hero media, people, videos, categories and announcements. Save draft keeps changes private; Publish changes updates the public page. Recognition is never linked to commercial inquiries.</p>
        <div role="tablist" aria-label="Programme" className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {PROGRAMMES.map((p) => (
            <button key={p.slug} role="tab" aria-selected={p.slug === slug} type="button" onClick={() => p.slug !== slug && choose(p.slug)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-semibold ${p.slug === slug ? 'bg-gold-500 text-ink-900' : 'border border-ivory-100/30 text-ivory-100 hover:border-gold-400'}`} data-testid={`tab-program-${p.slug}`}>
              {p.name.replace('THE ONE ', '')}
            </button>
          ))}
        </div>
        <Link href={`~/programs/${slug}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-program-public"><ExternalLink className="h-3.5 w-3.5" />View public page</Link>
      </header>

      {q.isLoading ? <Skeleton rows={6} />
        : q.isError || !q.data ? <ErrorBox onRetry={() => q.refetch()} msg="This programme could not be loaded." />
        : <ProgramEditor key={`${slug}-${k}`} initial={q.data} programmeName={current.name} onDirty={(d) => { dirtyRef.current = d; }} onBusy={(b) => { busyRef.current = b; }} onReload={reload} />}

      <Inquiries slug={slug} />
    </div>
  );
}
