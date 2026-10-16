import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearch } from 'wouter';
import { useGetMagazineConfig, useGetMagazineSubmissions, useGetMagazineOrders, getGetMagazineOrdersQueryKey, getGetMagazineConfigQueryKey, type MagazineSubmission } from '@workspace/api-client-react';
import { ProposalForm, MyProposals, FounderReview, FeatureReturn, useSubmissionKeys } from '@/components/magazine/contribute';
import { primaryBtn, ghostBtn } from '@/components/magazine/shared';
import { ART } from '@/components/magazine/editorial-data';
import MyOrders from '@/components/magazine/MyOrders';

const STEPS = [
  ['Propose', 'Send your title, article and an optional photo link. Free.'],
  ['Founder review', 'Every proposal is read. Accepted or declined, always with a note.'],
  ['Conditions', 'If accepted, the note states the edition and publication conditions.'],
  ['Your decision', 'Only then may you pay USD 200 — if you accept that total and those terms.'],
];

export default function TropikMagazineContribute() {
  const params = new URLSearchParams(useSearch());
  const orderId = Number(params.get('order') ?? 0);
  const ck = params.get('checkout') ?? '';
  const k = useSubmissionKeys();
  const cfg = useGetMagazineConfig({ query: { queryKey: getGetMagazineConfigQueryKey() } });
  const subs = useGetMagazineSubmissions({ query: { enabled: k.signedIn, queryKey: k.own } });
  const readerOrders = useGetMagazineOrders({ query: { enabled: k.signedIn, queryKey: [...getGetMagazineOrdersQueryKey(), ...k.own] } });
  const [editing, setEditing] = useState<MagazineSubmission | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const refetchRef = useRef(subs.refetch);
  refetchRef.current = subs.refetch;
  useEffect(() => { if (k.signedIn && orderId > 0 && ck === 'complete') refetchRef.current(); }, [k.signedIn, orderId, ck]);

  const startEdit = (s: MagazineSubmission) => { setEditing(s); requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };

  return (
    <div className="min-h-[100dvh] bg-ivory-100 text-ink-900">
      <Helmet>
        <title>Contribute to Tropik Magazine — propose an inside page | TOMI</title>
        <meta name="description" content="Propose an article for one inside page of the printed Tropik Magazine. Founder review first; USD 200 only if accepted and you agree to the conditions." />
      </Helmet>

      <section className="border-b border-ink-900/15">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <Link href="/tropik-magazine" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700 hover:text-lagoon-700" data-testid="link-back-magazine">Tropik Magazine</Link>
            <p className="mt-6 text-eyebrow text-gold-600">CONTRIBUTOR SPACE</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.9]">One inside page. <span className="italic text-lagoon-600">Your story.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-800">Propose an article for one inside page of the printed magazine. This is a curated editorial review — not a marketplace and not self-publishing. Nothing you write appears on the public magazine page.</p>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-700" data-testid="text-editorial-offer">Tropik tells stories across three places: an editorial article in the ecosystem News, a relay on the Tropik Instagram and Facebook pages, and the printed magazine. Accepted stories are considered for all three by the editorial team; the USD 200 reservation covers the one inside printed page only, and no audience figure is promised per article.</p>
          </div>
          <div className="hidden md:col-span-4 md:block"><img src={ART(13)} alt="Tropik Magazine cover featuring Reischca Kazumba" className="aspect-[3/4] w-full object-cover shadow-[0_24px_50px_-24px_hsl(187_67%_12%/0.55)]" /></div>
        </div>
        <ol className="mx-auto grid max-w-6xl gap-px bg-ink-900/15 px-0 md:grid-cols-4">
          {STEPS.map(([t, d], i) => <li key={t} className="bg-ivory-100 p-5"><span className="font-display text-3xl text-gold-500">{i + 1}</span><p className="mt-1 text-sm font-semibold uppercase tracking-[0.15em]">{t}</p><p className="mt-1 text-sm leading-relaxed text-ink-700">{d}</p></li>)}
        </ol>
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="border-l-2 border-gold-500 bg-ivory-50 px-4 py-3 text-sm leading-relaxed text-ink-800" data-testid="text-feature-terms"><strong>The USD 200 terms.</strong> A single standalone inside page, separate from the media kit’s partnership packages. No payment before acceptance. Payment reserves the page under the Founder’s stated conditions; it does not publish automatically and does not include a PDF or reader copy. Payments are processed by Stripe.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-14">
        {orderId > 0 && (ck === 'complete' || ck === 'cancelled') && k.signedIn && <FeatureReturn orderId={orderId} kind={ck} onRefresh={() => subs.refetch()} />}

        {!k.isLoaded ? <div className="h-64 animate-pulse bg-ivory-200" aria-busy="true" /> : !k.signedIn ? (
          <div className="grid gap-6 border border-ink-900/20 bg-ivory-50 p-8 md:grid-cols-12" data-testid="section-signed-out">
            <div className="md:col-span-8"><h2 className="font-display text-3xl">Sign in to propose an article.</h2><p className="mt-2 text-sm leading-relaxed text-ink-700">Your proposals are tied to your account so you can follow review, edit, withdraw or — once accepted — decide whether to pay USD 200.</p></div>
            <div className="flex items-center md:col-span-4 md:justify-end"><Link href="/sign-in" className={primaryBtn} data-testid="link-sign-in-contribute">Sign in</Link></div>
          </div>
        ) : (
          <>
            {cfg.data && !cfg.data.available && <p className="text-sm text-ink-700" data-testid="text-checkout-closed">Payments are currently closed. You can still send and edit proposals; payment opens only after acceptance and when checkout is available.</p>}
            <section ref={formRef} className="scroll-mt-24" aria-labelledby="form-heading">
              <h2 id="form-heading" className="font-display text-4xl">{editing ? 'Edit your proposal' : 'Propose an article'}</h2>
              <div className="mt-8"><ProposalForm key={editing ? `edit-${editing.id}-${editing.updatedAt}` : 'new'} editing={editing} onDone={() => setEditing(null)} /></div>
            </section>
            <section aria-labelledby="mine-heading">
              <div className="flex items-end justify-between gap-3"><h2 id="mine-heading" className="font-display text-4xl">My proposals</h2><button type="button" className={ghostBtn} onClick={() => subs.refetch()} disabled={subs.isFetching} data-testid="button-refresh-proposals">{subs.isFetching ? 'Refreshing…' : 'Refresh'}</button></div>
              <div className="mt-6">
                {subs.isLoading ? <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-28 animate-pulse bg-ivory-200" />)}</div>
                  : subs.isError ? <div role="alert" className="flex items-center justify-between border border-crimson-700/30 p-4 text-sm text-crimson-700">Your proposals could not be loaded.<button className={ghostBtn} onClick={() => subs.refetch()} data-testid="button-retry-proposals">Retry</button></div>
                  : <MyProposals list={subs.data?.submissions ?? []} config={cfg.data} onEdit={startEdit} />}
              </div>
            </section>
            {subs.data?.founder && <FounderReview />}
            {cfg.data && (readerOrders.isError || readerOrders.data?.orders.some(o => o.format !== 'feature')) && (
              <section aria-label="Earlier reader requests">
                <p className="text-sm text-ink-700">Earlier reader requests are retained below. The media kit is now free; reader-edition checkout is closed.</p>
                <MyOrders orders={(readerOrders.data?.orders ?? []).filter(o => o.format !== 'feature')}
                  config={{ ...cfg.data, available: false }} isLoading={readerOrders.isLoading}
                  isError={readerOrders.isError} onRetry={() => readerOrders.refetch()} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
