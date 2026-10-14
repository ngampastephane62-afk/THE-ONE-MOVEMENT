import { Link } from 'wouter';
import { Download, FileLock2, FileText } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, card, label, money } from '@/components/network/kit';

export default function Packages() {
  const q = useGetNetworkState({}, { query: { queryKey: getGetNetworkStateQueryKey({}) } });
  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} /></div>;
  const { packages, documents, stripeReady } = q.data!;
  const groups = Array.from(new Set(packages.map((p) => p.audience)));

  return (
    <div className="flex flex-col gap-6 px-3 pt-4 md:px-0 md:pt-0">
      <header className="overflow-hidden rounded-3xl bg-lagoon-900 p-6 text-ivory-100">
        <p className="text-eyebrow text-gold-400">OPTIONAL COMMERCIAL PACKAGES</p>
        <h1 className="mt-1 font-display text-2xl">Annual packages</h1>
        <p className="mt-2 max-w-2xl text-sm text-ivory-300">Your account and the social network stay free. Packages are separate, optional 12-month commercial agreements. Each starts with an application, review and written terms; payment is a single annual payment, renewed only by a new signed agreement — never an automatic debit and never an equity purchase.</p>
        {!stripeReady && <p className="mt-3 inline-block rounded-full bg-gold-500/20 px-3 py-1 text-xs text-gold-400">Online payment is not yet enabled — approved agreements are settled as stated in your written terms.</p>}
      </header>

      {groups.length === 0 ? <Empty title="No packages published" body="The package catalogue is not available right now." /> : groups.map((g) => (
        <section key={g}>
          <h2 className="mb-3 font-display text-lg text-ink-900">{label(g)}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {packages.filter((p) => p.audience === g).map((p) => {
              const doc = documents.find((d) => d.slug === p.documentSlug);
              return (
                <li key={p.slug} className={`${card} flex flex-col gap-2 p-5`} data-testid={`card-package-${p.slug}`}>
                  <p className="font-semibold text-ink-900">{p.name}</p>
                  <p className="font-display text-2xl text-lagoon-700">{money(p.amount, p.currency)}</p>
                  <p className="text-xs text-sand-400">{p.amount == null ? 'Custom scope — fees are quoted after review' : `One payment · ${p.durationMonths} months`}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    <Link href={`/member/certifications?package=${encodeURIComponent(p.slug)}&role=${encodeURIComponent(g)}`} className={btn} data-testid={`link-apply-${p.slug}`}>{p.amount == null ? 'Request a quote' : 'Apply'}</Link>
                    {doc?.accessible && <a href={doc.url} download className="inline-flex items-center gap-1 rounded-full border border-sand-300 px-3 py-2 text-xs font-semibold text-ink-800 hover:border-lagoon-600"><FileText className="h-3.5 w-3.5" />Terms PDF</a>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section>
        <h2 className="mb-3 font-display text-lg text-ink-900">Official documents</h2>
        {documents.length === 0 ? <Empty title="No documents" body="Official package documents will appear here." /> : (
          <ul className={`${card} divide-y divide-sand-100`}>
            {documents.map((d) => (
              <li key={d.slug} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`row-doc-${d.slug}`}>
                <span className="flex items-center gap-2 text-sm text-ink-900">{d.restricted ? <FileLock2 className="h-4 w-4 text-crimson-700" /> : <FileText className="h-4 w-4 text-gold-600" />}{d.title}{d.restricted && <span className="rounded-full bg-crimson-700/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-crimson-700">Confidential</span>}</span>
                {d.accessible ? <a href={d.url} download className="inline-flex items-center gap-1 rounded-full bg-lagoon-900 px-3 py-1.5 text-xs font-semibold text-ivory-50"><Download className="h-3.5 w-3.5" />Download</a>
                  : <Link href="/member/certifications?role=investor&program=investment-forum" className="text-xs font-semibold text-lagoon-700 underline">Request investor certification for access</Link>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
