import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useGetGratitudeOptions, getGetGratitudeOptionsQueryKey } from '@workspace/api-client-react';
import { ErrorBox, Skeleton } from '@/components/network/kit';
import { CONTINENTS, countriesInContinent, globalCampaigns, regionalCampaigns, impactDirectory, GLOBAL_CAMPAIGN_HREF, EMIRATES_FORM_HREF, type ContinentId } from '@/lib/emirates-experience';
import { useEmReveal } from './use-emirates-motion';

/** Schematic continent blobs (deliberately abstract, labelled as such). */
const BLOBS: Record<ContinentId, string> = {
  'north-america': 'M120 90 Q220 50 320 100 Q300 180 250 230 Q190 220 150 170 Z',
  'south-america': 'M280 260 Q350 260 360 320 Q340 400 300 440 Q270 380 270 310 Z',
  europe: 'M460 90 Q540 70 580 110 Q560 160 500 165 Q460 140 460 90 Z',
  africa: 'M470 200 Q570 180 610 240 Q590 340 530 400 Q480 330 465 260 Z',
  asia: 'M600 80 Q760 50 880 110 Q860 220 760 250 Q660 230 610 160 Z',
  oceania: 'M800 330 Q880 310 920 350 Q900 400 840 405 Q800 380 800 330 Z',
};

/** Chapter 07 — compact global explorer driven only by GET /api/gratitude/options. */
export default function GlobalExplorer() {
  const r = useEmReveal<HTMLElement>();
  const [sel, setSel] = useState<ContinentId>('asia');
  const opts = useGetGratitudeOptions({ query: { queryKey: getGetGratitudeOptionsQueryKey(), refetchOnWindowFocus: true, retry: 2 } });
  const campaigns = opts.data?.campaigns;
  const global = useMemo(() => globalCampaigns(campaigns), [campaigns]);
  const regional = useMemo(() => regionalCampaigns(campaigns, sel), [campaigns, sel]);
  const countries = useMemo(() => countriesInContinent(opts.data?.countries, sel), [opts.data, sel]);
  const c = CONTINENTS.find((x) => x.id === sel)!;
  const dir = impactDirectory(sel);
  const tx = 500 - c.cx, ty = 250 - c.cy;

  return (
    <section ref={r} id="em-world" aria-labelledby="em-world-h" className="bg-ivory-50 py-section-lg">
      <div className="mx-auto max-w-6xl px-6">
        <p className="em-r-fade text-eyebrow text-gold-600">07 · THE GLOBAL GRATITUDE MOVEMENT</p>
        <h2 id="em-world-h" className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1] text-ink-900">
          <span className="em-mask"><span className="em-r-line block">ONE WORLD.</span></span>
          <span className="em-mask"><span className="em-r-line block text-lagoon-600" style={{ ['--d' as string]: '120ms' }}>MANY STORIES OF GRATITUDE.</span></span>
        </h2>
        <p className="em-r-fade mt-5 max-w-2xl text-ink-800" style={{ ['--d' as string]: '220ms' }}>Thank You, Emirates is one expression of a wider TOMI initiative. Choose a continent to see what is actually open there.</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <figure className="em-r-media overflow-hidden border border-sand-300 bg-lagoon-900 lg:col-span-7">
            <svg viewBox="0 0 1000 500" className="block h-auto w-full" aria-hidden>
              <g className="em-world-pan" style={{ transform: `translate(${tx * 0.25}px, ${ty * 0.25}px) scale(1.06)`, transformOrigin: '500px 250px' }}>
                {CONTINENTS.map((k) => (
                  <path key={k.id} d={BLOBS[k.id]} className="em-cont" fill={k.id === sel ? 'hsl(39 52% 54%)' : 'hsl(40 40% 96% / .14)'} stroke="hsl(39 52% 54% / .5)" style={{ transform: k.id === sel ? 'scale(1.06)' : 'none' }} />
                ))}
                <circle cx="640" cy="205" r="7" fill="hsl(19 72% 60%)" />
                <text x="652" y="200" fontSize="14" fill="hsl(40 40% 96% / .8)" letterSpacing="3">UAE</text>
              </g>
            </svg>
            <figcaption className="border-t border-gold-500/25 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ivory-300/80">Schematic world · continent shapes are abstract, not boundaries</figcaption>
          </figure>

          <div className="lg:col-span-5">
            <div role="group" aria-label="Choose a continent" className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {CONTINENTS.map((k) => (
                <button key={k.id} type="button" onClick={() => setSel(k.id)} aria-pressed={k.id === sel}
                  className={`em-focus min-h-11 border px-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${k.id === sel ? 'border-lagoon-600 bg-lagoon-600 text-ivory-50' : 'border-sand-300 text-ink-800 hover:border-lagoon-600'}`}
                  data-testid={`button-continent-${k.id}`}>{k.label}</button>
              ))}
            </div>

            <div key={sel} className="mt-6" aria-live="polite">
              <p className="em-mask"><span className="em-swap-mask block font-display text-3xl text-ink-900" data-testid="text-continent-name">{c.label}</span></p>
              {opts.isLoading ? <div className="mt-4"><Skeleton rows={3} /></div> : opts.isError ? <div className="mt-4"><ErrorBox onRetry={() => opts.refetch()} msg="Campaigns could not be loaded." /></div> : (
                <div className="em-swap-mask mt-4 space-y-4" style={{ ['--d' as string]: '120ms' }}>
                  {countries.length > 0 && <p className="text-xs text-ink-700" data-testid="text-continent-countries">{countries.length} countries in {c.label} can be chosen when writing a story.</p>}
                  {regional.length > 0 ? (
                    <ul className="space-y-2">{regional.map((k) => <li key={k.id} className="border-l-2 border-lagoon-600 pl-3"><p className="font-display text-xl text-ink-900">{k.name}</p><p className="text-[10px] uppercase tracking-widest text-lagoon-600">Open campaign</p><Link href={GLOBAL_CAMPAIGN_HREF} className="em-focus inline-flex min-h-11 items-center text-sm text-lagoon-700 underline" data-testid={`link-regional-campaign-${k.id}`}>Open the campaign explorer · select {k.name}</Link></li>)}</ul>
                  ) : (
                    <p className="border-l-2 border-sand-300 pl-3 text-sm text-ink-800" data-testid="text-no-regional">No regional campaign is configured for {c.label} yet.</p>
                  )}
                  {global.map((k) => (
                    <Link key={k.id} href={GLOBAL_CAMPAIGN_HREF} className="em-focus group flex items-center justify-between gap-3 border border-lagoon-600 p-4 hover:bg-ivory-100" data-testid={`link-global-campaign-${k.id}`}>
                      <span><span className="block font-display text-lg text-ink-900">{k.name}</span><span className="text-[10px] uppercase tracking-widest text-lagoon-600">Open · global, not regional · stories from {c.label} welcome</span></span>
                      <ArrowRight className="h-4 w-4 text-lagoon-600 transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                  {dir && <Link href={dir.href} className="em-focus flex items-center justify-between gap-3 border border-sand-300 p-4 hover:bg-ivory-100" data-testid={`link-impact-directory-${sel}`}>
                    <span><span className="block font-display text-lg text-ink-900">{dir.label}</span><span className="text-[10px] uppercase tracking-widest text-gold-600">Impact directory · editorial, not a campaign{sel === 'north-america' ? ' · United States only' : ''}</span></span>
                    <ArrowRight className="h-4 w-4 text-ink-700" aria-hidden />
                  </Link>}
                </div>
              )}
            </div>
            <p className="mt-6 border-t border-sand-300 pt-4 text-xs text-ink-700">The Emirates campaign remains separate: stories go through the <Link href={EMIRATES_FORM_HREF} className="text-lagoon-700 underline" data-testid="link-world-emirates-form">Thanks Emirates member form</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
