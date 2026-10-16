import { useState } from 'react';
import { Link } from 'wouter';
import { COVER_URL } from './shared';

export default function MagazineFeature() {
  const [ok, setOk] = useState(true);
  return (
    <section className="border-b border-sand-200 bg-ivory-100 py-section-lg" aria-labelledby="magazine-feature-heading" data-testid="section-magazine-feature">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          {ok ? <img src={COVER_URL} alt="Cover of Tropik Magazine 2026" onError={() => setOk(false)} className="mx-auto aspect-[3/4] w-full max-w-xs object-cover shadow-[0_24px_50px_-20px_hsl(187_67%_12%/0.5)]" />
            : <div className="mx-auto flex aspect-[3/4] w-full max-w-xs items-end bg-lagoon-900 p-6 font-display text-3xl text-ivory-50">Tropik Magazine 2026</div>}
        </div>
        <div className="md:col-span-8">
          <p className="text-eyebrow text-gold-600">NOW AVAILABLE · TROPIK MAGAZINE</p>
          <h2 id="magazine-feature-heading" className="mt-4 font-display text-4xl text-ink-900 md:text-5xl">Tropik Magazine 2026.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ink-700">A 10-page presentation on fashion, culture, business, lifestyle and emerging talent. Not a full reader issue.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/tropik-magazine?format=digital" className="flex items-baseline justify-between gap-6 border border-ink-900 bg-ink-900 px-5 py-4 text-ivory-50 hover:bg-lagoon-900" data-testid="link-magazine-digital"><span className="text-xs font-semibold uppercase tracking-[0.18em]">Digital PDF</span><span className="font-display text-2xl" translate="no">10 USD</span></Link>
            <Link href="/tropik-magazine?format=print" className="flex items-baseline justify-between gap-6 border border-ink-900 px-5 py-4 text-ink-900 hover:border-lagoon-600" data-testid="link-magazine-print"><span className="text-xs font-semibold uppercase tracking-[0.18em]">Printed copy</span><span className="font-display text-2xl" translate="no">25 USD</span></Link>
          </div>
          <p className="mt-3 text-xs text-ink-700">Print shipping 10–30 USD, exact quote confirmed before payment.</p>
        </div>
      </div>
    </section>
  );
}
