import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronDown, Globe2 } from 'lucide-react';
import { useGetGratitudeOptions, getGetGratitudeOptionsQueryKey, type GetGratitudeOptionsQueryResult } from '@workspace/api-client-react';
import { ErrorBox, Skeleton } from '@/components/network/kit';
import { CONTINENTS, countriesInContinent, globalCampaigns, regionalCampaigns, impactDirectory, GLOBAL_CAMPAIGN_HREF, EMIRATES_FORM_HREF, type ContinentId } from '@/lib/emirates-experience';
import { useEmAmbient, useEmReveal } from './use-emirates-motion';
import { WORLD_GOLD, WORLD_EARTH, UAE_ON_WORLD, MediaCredit } from './emirates-media';

/** Focal points of each continent on the 1000x667 gold world artwork. */
const FOCUS: Record<ContinentId, { x: number; y: number }> = {
  'north-america': { x: 235, y: 255 },
  'south-america': { x: 320, y: 455 },
  europe: { x: 525, y: 230 },
  africa: { x: 510, y: 405 },
  asia: { x: 720, y: 265 },
  oceania: { x: 815, y: 480 },
};

/** Chapter 07 — umbrella global campaign, then collapsed continent gateways. Driven only by GET /api/gratitude/options. */
export default function GlobalExplorer() {
  const r = useEmReveal<HTMLElement>();
  const umbrellaMotion = useEmAmbient<HTMLDivElement>();
  const mapMotion = useEmAmbient<HTMLElement>();
  const [sel, setSel] = useState<ContinentId | null>(null);
  const opts = useGetGratitudeOptions({ query: { queryKey: getGetGratitudeOptionsQueryKey(), refetchOnWindowFocus: true, retry: 2 } });
  const campaigns = opts.data?.campaigns;
  const global = useMemo(() => globalCampaigns(campaigns), [campaigns]);
  const f = sel ? FOCUS[sel] : null;
  const zoom = 1.9;
  const stage = f ? `translate(${(50 - (f.x / 10) * zoom)}%, ${(50 - (f.y / 6.67) * zoom)}%) scale(${zoom})` : 'none';

  return (
    <section ref={r} id="em-world" aria-labelledby="em-world-h" className="bg-ivory-50 py-section-lg">
      <div className="mx-auto max-w-6xl px-6">
        <p className="em-r-fade text-eyebrow text-gold-600">06 · THE GLOBAL GRATITUDE MOVEMENT</p>
        <h2 id="em-world-h" className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1] text-ink-900">
          <span className="em-mask"><span className="em-r-line block">ONE WORLD.</span></span>
          <span className="em-mask"><span className="em-r-line block text-lagoon-600" style={{ ['--d' as string]: '120ms' }}>MANY STORIES OF GRATITUDE.</span></span>
        </h2>
        <p className="em-r-fade mt-5 max-w-2xl text-ink-800" style={{ ['--d' as string]: '220ms' }}>Thank You, Emirates is one expression of a wider TOMI initiative. One umbrella, many cultural doors: open a continent to see what is actually available there.</p>

        {/* Umbrella: global campaign(s) */}
        <div ref={umbrellaMotion} className="em-r-media relative mt-10 overflow-hidden bg-lagoon-900 text-ivory-100" style={{ ['--d' as string]: '260ms' }}>
          <img src={WORLD_EARTH.src} alt="" loading="lazy" decoding="async" className="em-kb absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(190_55%_9%/.95)_0%,hsl(190_55%_9%/.7)_50%,transparent_100%)]" aria-hidden />
          <div className="relative max-w-xl p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 text-eyebrow text-gold-400"><Globe2 className="h-4 w-4" aria-hidden /> THE UMBRELLA · GLOBAL CAMPAIGN</p>
            {opts.isLoading ? <div className="mt-5"><Skeleton rows={2} /></div> : opts.isError ? <div className="mt-5"><ErrorBox onRetry={() => opts.refetch()} msg="Campaigns could not be loaded." /></div> : global.length > 0 ? (
              <div className="mt-5 space-y-3">
                {global.map((k) => (
                  <Link key={k.id} href={GLOBAL_CAMPAIGN_HREF} className="em-focus group flex items-center justify-between gap-4 border border-gold-500/50 bg-lagoon-900/50 p-5 backdrop-blur-sm transition-colors hover:border-gold-400" data-testid={`link-global-campaign-${k.id}`}>
                    <span><span className="block font-display text-2xl">{k.name}</span><span className="text-[10px] uppercase tracking-widest text-gold-200">Open · global, not regional · stories from every continent welcome</span></span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gold-400 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                ))}
              </div>
            ) : <p className="mt-5 text-sm text-ivory-200" data-testid="text-no-global">No global campaign is open at the moment.</p>}
          </div>
          <div className="relative px-7 pb-3 sm:px-10"><MediaCredit m={WORLD_EARTH} tone="dark" /></div>
        </div>

        {/* Gateways */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <figure ref={mapMotion} className="em-r-media relative self-start overflow-hidden bg-[hsl(30_20%_4%)] lg:sticky lg:top-24 lg:col-span-6" style={{ ['--d' as string]: '200ms' }}>
            <div className="relative aspect-[1000/667] overflow-hidden">
              <div className="em-world-stage absolute inset-0" style={{ transform: stage }}>
                <img src={WORLD_GOLD.src} alt={WORLD_GOLD.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
                <svg viewBox="0 0 1000 667" className="absolute inset-0 h-full w-full" aria-hidden>
                  <circle cx={UAE_ON_WORLD.x} cy={UAE_ON_WORLD.y} r="5" fill="hsl(19 72% 62%)" stroke="hsl(40 40% 97%)" strokeWidth="1" />
                  {f && <circle cx={f.x} cy={f.y} r="22" fill="none" stroke="hsl(39 70% 66%)" strokeWidth="1" className="em-pulse" />}
                </svg>
              </div>
              <p className="em-world-caption absolute bottom-3 left-4 font-display text-lg tracking-[0.2em]" aria-hidden>{sel ? CONTINENTS.find((c) => c.id === sel)?.label.toUpperCase() : 'THE WORLD'}</p>
            </div>
            <figcaption className="px-4 pb-2"><MediaCredit m={WORLD_GOLD} tone="dark" /></figcaption>
          </figure>

          <div className="lg:col-span-6">
            <p className="text-eyebrow text-ink-700">CONTINENT GATEWAYS</p>
            <ul className="mt-3 border-t border-sand-300">
              {CONTINENTS.map((k, i) => (
                <Gateway key={k.id} id={k.id} label={k.label} n={i + 1} open={sel === k.id} onToggle={() => setSel(sel === k.id ? null : k.id)} opts={opts} />
              ))}
            </ul>
            <p className="mt-6 text-xs text-ink-700">The Emirates campaign remains separate: stories go through the <Link href={EMIRATES_FORM_HREF} className="text-lagoon-700 underline" data-testid="link-world-emirates-form">Thanks Emirates member form</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

type Opts = {
  data?: GetGratitudeOptionsQueryResult;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
};
function Gateway({ id, label, n, open, onToggle, opts }: { id: ContinentId; label: string; n: number; open: boolean; onToggle: () => void; opts: Opts }) {
  const campaigns = opts.data?.campaigns;
  const regional = useMemo(() => regionalCampaigns(campaigns, id), [campaigns, id]);
  const countries = useMemo(() => countriesInContinent(opts.data?.countries, id), [opts.data, id]);
  const dir = impactDirectory(id);
  const panel = `em-gate-${id}`;
  return (
    <li className="border-b border-sand-300">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panel} aria-pressed={open}
        className="em-focus group flex min-h-16 w-full items-center gap-4 text-left" data-testid={`button-continent-${id}`}>
        <span className="font-mono text-[11px] text-gold-600">{String(n).padStart(2, '0')}</span>
        <span className={`flex-1 font-display text-2xl transition-colors ${open ? 'text-lagoon-600' : 'text-ink-900 group-hover:text-lagoon-600'}`} data-testid={open ? 'text-continent-name' : undefined}>{label}</span>
        <ChevronDown className="em-gate-chev h-5 w-5 text-ink-700" aria-hidden />
      </button>
      <div id={panel} className="em-gate-panel" data-open={open} role="region" aria-label={`${label} gateway`} hidden={!open}>
        <div>
          <div className="space-y-3 pb-6 pl-8">
            {opts.isLoading ? <Skeleton rows={2} /> : opts.isError ? <ErrorBox onRetry={() => opts.refetch()} msg="Campaigns could not be loaded." /> : <>
              {countries.length > 0 && <p className="text-xs text-ink-700" data-testid="text-continent-countries">{countries.length} countries in {label} can be chosen when writing a story.</p>}
              {regional.length > 0 ? (
                <ul className="space-y-2">{regional.map((k) => <li key={k.id} className="border-l-2 border-lagoon-600 pl-3"><p className="font-display text-xl text-ink-900">{k.name}</p><p className="text-[10px] uppercase tracking-widest text-lagoon-600">Open regional campaign</p><Link href={GLOBAL_CAMPAIGN_HREF} className="em-focus inline-flex min-h-11 items-center text-sm text-lagoon-700 underline" data-testid={`link-regional-campaign-${k.id}`}>Open the campaign explorer · select {k.name}</Link></li>)}</ul>
              ) : (
                <p className="border-l-2 border-sand-300 pl-3 text-sm text-ink-800" data-testid="text-no-regional">No regional campaign is configured for {label} yet. Stories from {label} are welcome in the global campaign above.</p>
              )}
              {dir && <Link href={dir.href} className="em-focus group flex items-center justify-between gap-3 border border-sand-300 bg-ivory-100 p-4 transition-colors hover:border-gold-500" data-testid={`link-impact-directory-${id}`}>
                <span><span className="block font-display text-lg text-ink-900">{dir.label}</span><span className="text-[10px] uppercase tracking-widest text-gold-600">Impact directory · editorial, not a campaign{id === 'north-america' ? ' · United States only' : ''}</span></span>
                <ArrowRight className="h-4 w-4 text-ink-700 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>}
            </>}
          </div>
        </div>
      </div>
    </li>
  );
}
