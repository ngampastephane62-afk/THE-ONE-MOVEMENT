import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearch } from 'wouter';
import { useGetMagazineConfig, useGetMagazineOrders, getGetMagazineConfigQueryKey } from '@workspace/api-client-react';
import Reveal from '@/components/Reveal';
import OrderForm from '@/components/magazine/OrderForm';
import MyOrders from '@/components/magazine/MyOrders';
import FounderOrders from '@/components/magazine/FounderOrders';
import CheckoutReturn from '@/components/magazine/CheckoutReturn';
import { COVER_URL, useMagazineKeys, ghostBtn } from '@/components/magazine/shared';

const TOPICS = ['Fashion', 'Culture', 'Business', 'Lifestyle', 'Emerging talent'];

export default function TropikMagazine() {
  const params = new URLSearchParams(useSearch());
  const orderId = Number(params.get('order') ?? 0);
  const ck = params.get('checkout');
  const initialFormat = params.get('format') === 'print' ? 'print' : 'digital';
  const keys = useMagazineKeys();
  const [coverOk, setCoverOk] = useState(true);
  const cfg = useGetMagazineConfig({ query: { queryKey: getGetMagazineConfigQueryKey() } });
  const ordersQ = useGetMagazineOrders({ query: { enabled: keys.signedIn, queryKey: keys.list } });
  const config = cfg.data;

  return (
    <div className="min-h-[100dvh] bg-ivory-100 text-ink-900">
      <Helmet>
        <title>Tropik Magazine 2026 — 10-page presentation | TOMI</title>
        <meta name="description" content="Tropik Magazine 2026: a 10-page presentation on fashion, culture, business, lifestyle and emerging talent. Digital PDF or printed copy." />
      </Helmet>

      <section className="relative overflow-hidden border-b border-ink-900/15">
        <div className="pointer-events-none absolute -right-10 top-6 select-none font-display text-[22vw] leading-none text-lagoon-900/[0.05]" aria-hidden="true" translate="no">2026</div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <figure className="relative mx-auto max-w-sm">
              <div className="absolute -bottom-4 -right-4 h-full w-full border border-gold-500" aria-hidden="true" />
              {coverOk ? (
                <img src={COVER_URL} alt="Cover of Tropik Magazine 2026" onError={() => setCoverOk(false)} className="relative aspect-[3/4] w-full bg-ivory-200 object-cover shadow-[0_30px_60px_-20px_hsl(187_67%_12%/0.45)]" data-testid="img-magazine-cover" />
              ) : (
                <div className="relative flex aspect-[3/4] w-full flex-col justify-between bg-lagoon-900 p-8 text-ivory-50"><span className="text-eyebrow text-gold-400">TROPIK</span><span className="font-display text-5xl">Magazine 2026</span></div>
              )}
              <figcaption className="mt-8 text-xs text-ink-700">Cover only. The full PDF is never previewed publicly.</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 lg:pl-8">
            <p className="text-eyebrow text-gold-600">THE ONE MOVEMENT · TROPIK</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink-900 md:text-7xl">Tropik Magazine <span className="text-lagoon-600" translate="no">2026</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-800">A 10-page presentation and publication from the Tropik and TOMI world.</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Topics">
              {TOPICS.map((t) => <li key={t} className="border border-ink-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-ink-800">{t}</li>)}
            </ul>
            <div className="mt-10 border-l-2 border-gold-500 bg-ivory-50 px-5 py-4 text-sm leading-relaxed text-ink-800" data-testid="text-honesty-note">
              <strong className="font-semibold text-ink-900">What you are buying.</strong> This is the 2026 Tropik Magazine presentation, sold as-is: 10 pages. It is not a full reader issue, and buying it does not include any editorial placement or advertising listed inside.
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-px bg-ink-900/15">
              {[[config ? `${config.digitalUsd} USD` : '10 USD', 'Digital PDF'], [config ? `${config.printUsd} USD` : '25 USD', 'Printed copy'], [config ? `${config.shippingMinUsd}–${config.shippingMaxUsd} USD` : '10–30 USD', 'Shipping, quoted']].map(([v, l]) => (
                <div key={l} className="bg-ivory-100 p-4"><dd className="font-display text-2xl text-ink-900" translate="no">{v}</dd><dt className="mt-1 text-xs text-ink-700">{l}</dt></div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {orderId > 0 && (ck === 'complete' || ck === 'cancelled') && <div className="mb-12"><CheckoutReturn orderId={orderId} kind={ck} /></div>}
        {cfg.isLoading ? <div className="h-80 animate-pulse bg-ivory-200" aria-busy="true" /> :
          cfg.isError || !config ? (
            <div role="alert" className="flex items-center justify-between border border-crimson-700/30 p-5 text-sm text-crimson-700"><span>The store could not be loaded.</span><button className={ghostBtn} onClick={() => cfg.refetch()} data-testid="button-retry-config">Retry</button></div>
          ) : (
            <>
              <OrderForm config={config} initialFormat={initialFormat} />
              {keys.signedIn && <MyOrders orders={ordersQ.data?.orders ?? []} config={config} isLoading={ordersQ.isLoading} isError={ordersQ.isError} onRetry={() => ordersQ.refetch()} />}
              {keys.signedIn && ordersQ.data?.founder && <FounderOrders />}
            </>
          )}
      </div>
    </div>
  );
}
