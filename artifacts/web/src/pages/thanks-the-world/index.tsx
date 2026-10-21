import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useSearch } from 'wouter';
import { useAuth } from '@clerk/react';
import { ArrowRight, Globe2, PenLine, Video } from 'lucide-react';
import {
  useGetGratitudeOptions, getGetGratitudeOptionsQueryKey, useGetGratitudeStories, getGetGratitudeStoriesQueryKey,
  useGetMemberProfile, getGetMemberProfileQueryKey, type GetGratitudeStoriesParams,
} from '@workspace/api-client-react';
import { ErrorBox, Skeleton, btnGhost, field } from '@/components/network/kit';
import { StoryCard, StoryDetail } from '@/components/gratitude/Story';
import { FlagField, IDENTITIES, identityOf } from '@/lib/gratitude';
import { searchCountries, countryLabel } from '@/pages/our-vision/country-data';
import WorldMap, { useMotionPause } from '@/components/gratitude/WorldMap';
import './ttw.css';

const SORTS = [['recent', 'Most recent'], ['featured', 'Featured'], ['likes', 'Most thanked'], ['views', 'Most viewed'], ['discussed', 'Most discussed']] as const;

export default function ThanksTheWorld() {
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => {
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setMotionReady(true);
  }, []);
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const storyId = Number(params.get('story')) || 0;
  const { isSignedIn } = useAuth();
  const prof = useGetMemberProfile({ query: { enabled: !!isSignedIn, queryKey: getGetMemberProfileQueryKey() } });
  const myId = prof.data?.profile?.id;

  const opts = useGetGratitudeOptions({ query: { queryKey: getGetGratitudeOptionsQueryKey(), refetchOnMount: 'always' } });
  const active = useMemo(() => (opts.data?.campaigns ?? []).filter((c) => c.status === 'active'), [opts.data]);
  const [campaign, setCampaign] = useState<number | undefined>();
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [sort, setSort] = useState<GetGratitudeStoriesParams['sort']>('recent');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [campaign, continent, country, sort]);

  const listParams: GetGratitudeStoriesParams = { campaign, continent: continent || undefined, country: country || undefined, sort, page };
  const stories = useGetGratitudeStories(listParams, { query: { queryKey: getGetGratitudeStoriesQueryKey(listParams), refetchOnMount: 'always', enabled: active.length > 0 } });
  const continents = useMemo(() => Array.from(new Set((opts.data?.countries ?? []).map((c) => c.continent).filter(Boolean))).sort(), [opts.data]);
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
  const serverCodes = useMemo(() => new Set((opts.data?.countries ?? []).map((c) => c.code)), [opts.data]);
  const matches = useMemo(() => countryQuery.trim() ? searchCountries(countryQuery, locale).filter((c) => serverCodes.has(c.code)).slice(0, 8) : [], [countryQuery, locale, serverCodes]);

  const lead = active.find((c) => c.id === campaign) ?? active[0];
  const idKey = identityOf(lead);
  const heroMotion = useMotionPause<HTMLElement>();
  const openStory = (id: number) => `/thanks-the-world?story=${id}`;

  return (
    <div className={`ttw bg-ivory-100 ${motionReady ? 'ttw-motion-ready' : ''}`}>
      <Helmet>
        <title>Thanks the World — Stories of gratitude from TOMI members</title>
        <meta name="description" content="Personal stories of gratitude shared by TOMI members and reviewed by the Founder before publication." />
      </Helmet>

      <section className="ttw-hero tl-stack text-ivory-100" aria-labelledby="ttw-hero-h" data-identity={idKey} ref={heroMotion.ref}>
        <div className={heroMotion.paused ? 'tl-paused' : ''}>
          <div className="tl-bg ttw-hero-bg" aria-hidden />
          <div className="tl-decor" aria-hidden><WorldMap art="gold" sequence ring /><FlagField codes={(opts.data?.countries ?? []).map((c) => c.code)} className="is-top" /></div>
          <div className="tl-read ttw-hero-read" aria-hidden />
        </div>
        <div className="tl-content mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-6">
          <p className="ttw-in ttw-in-1 text-eyebrow" style={{ color: IDENTITIES[idKey].accent }}>THE ONE MOVEMENT INTERNATIONAL</p>
          <h1 id="ttw-hero-h" className="mt-4 max-w-5xl font-display text-[clamp(2.6rem,10vw,7.5rem)] uppercase leading-[0.92] tracking-[0.01em]">
            <span className="ttw-mask"><span className="ttw-mask-in" style={{ ['--d' as string]: '.5s' }}>Thanks</span></span>
            <span className="ttw-mask"><span className="ttw-mask-in text-gold-400" style={{ ['--d' as string]: '.85s' }}>the World.</span></span>
          </h1>
          <p className="mt-6 font-display text-xl leading-snug text-ivory-100 sm:text-3xl">
            <span className="ttw-mask"><span className="ttw-mask-in" style={{ ['--d' as string]: '2.2s' }}>EVERY COUNTRY HAS A STORY.</span></span>
            <span className="ttw-mask"><span className="ttw-mask-in" style={{ ['--d' as string]: '2.6s' }}>EVERY VOICE MATTERS.</span></span>
          </p>
          <p className="ttw-in ttw-in-3 mt-4 text-sm uppercase tracking-[0.1em] text-gold-400">One world. Different cultures. Different nations. One humanity.</p>
          <p className="ttw-in ttw-in-3 mt-5 max-w-xl text-lg leading-relaxed text-ivory-200">Members thank the people, places and communities that shaped them. Every story is read by the Founder before anyone else sees it.</p>
          <div className="ttw-in ttw-in-3 ttw-ctas mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/member/thanks-the-world?intent=text" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold tracking-[0.08em] text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100" data-testid="link-share-story"><PenLine className="h-4 w-4" aria-hidden />SHARE YOUR STORY</Link>
            <Link href="/member/thanks-the-world?intent=video" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gold-400/70 px-6 text-sm font-semibold tracking-[0.08em] text-gold-200 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-upload-video"><Video className="h-4 w-4" aria-hidden />UPLOAD YOUR VIDEO</Link>
            <a href="#stories" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ivory-200/40 px-6 text-sm font-semibold tracking-[0.08em] hover:border-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-explore-stories">EXPLORE STORIES <ArrowRight className="h-4 w-4" aria-hidden /></a>
          </div>
        </div>
      </section>

      {storyId > 0 && (
        <div className="mx-auto max-w-3xl px-0 py-8 sm:px-6">
          <div className="border border-sand-200 bg-ivory-50 shadow-xl">
            <StoryDetail id={storyId} signedInMemberId={myId} onClose={() => navigate('/thanks-the-world')} />
          </div>
        </div>
      )}

      <section id="stories" className="mx-auto max-w-6xl px-5 py-14 sm:px-6" style={{ scrollMarginTop: 96 }} aria-labelledby="stories-h">
        {opts.isLoading ? <Skeleton rows={4} /> : opts.isError ? <ErrorBox onRetry={() => opts.refetch()} msg="The campaign could not be loaded." /> : active.length === 0 ? (
          <div className="mx-auto max-w-2xl border border-dashed border-gold-500/50 bg-ivory-50 p-8 text-center" data-testid="empty-no-campaign">
            <Globe2 className="mx-auto h-8 w-8 text-gold-600" aria-hidden />
            <h2 id="stories-h" className="mt-4 font-display text-2xl text-ink-900">No campaign is open yet</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">Thanks the World opens only when the Founder creates and activates a campaign. Until then there are no public stories here. You can write in the editor, but saving and submitting require an active campaign. Nothing is published without the Founder's review.</p>
            <Link href="/member/thanks-the-world?intent=text" className={`${btnGhost} mt-6`} data-testid="link-prepare-draft">Prepare a private draft</Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow text-gold-700">OPEN CAMPAIGNS</p>
                <h2 id="stories-h" className="mt-2 font-display text-3xl text-ink-900">{lead?.name}</h2>
                {lead?.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">{lead.description}</p>}
              </div>
            </div>
            {active.length > 1 && (
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Campaign">
                <button className={`ttw-chip ${campaign === undefined ? 'is-on' : ''}`} onClick={() => setCampaign(undefined)} aria-pressed={campaign === undefined} data-testid="button-campaign-all">All campaigns</button>
                {active.map((c) => <button key={c.id} className={`ttw-chip ${campaign === c.id ? 'is-on' : ''}`} aria-pressed={campaign === c.id} onClick={() => setCampaign(c.id)} data-testid={`button-campaign-${c.id}`}>{c.name}</button>)}
              </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-semibold text-ink-800">Continent
                <select className={`${field} mt-1`} value={continent} onChange={(e) => setContinent(e.target.value)} data-testid="select-continent">
                  <option value="">All continents</option>{continents.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div className="relative text-xs font-semibold text-ink-800">
                <label htmlFor="ttw-country">Country (any language)</label>
                <input id="ttw-country" className={`${field} mt-1`} value={countryQuery} placeholder={country || 'Search'} onChange={(e) => setCountryQuery(e.target.value)} data-testid="input-country-search" />
                {matches.length > 0 && <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto border border-sand-200 bg-ivory-50 shadow-lg">{matches.map((c) => <li key={c.code}><button type="button" className="w-full px-3 py-2 text-left text-sm font-normal hover:bg-ivory-200" onClick={() => { setCountry(c.code); setCountryQuery(''); }} data-testid={`option-country-${c.code}`}>{countryLabel(c, locale)}</button></li>)}</ul>}
                {country && <button type="button" className="mt-1 text-xs font-normal underline" onClick={() => setCountry('')} data-testid="button-clear-country">Clear {country}</button>}
              </div>
              <label className="text-xs font-semibold text-ink-800">Order
                <select className={`${field} mt-1`} value={sort} onChange={(e) => setSort(e.target.value as GetGratitudeStoriesParams['sort'])} data-testid="select-sort">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
            </div>
            <div className="mt-8">
              {stories.isLoading ? <Skeleton rows={4} /> : stories.isError ? <ErrorBox onRetry={() => stories.refetch()} /> : stories.data!.items.length === 0 ? (
                <div className="border border-sand-200 bg-ivory-50 p-8 text-center" data-testid="empty-stories"><p className="font-display text-xl text-ink-900">No published stories match yet.</p><p className="mt-2 text-sm text-ink-700">Stories appear here once the Founder approves them. Be among the first to share one.</p><Link href="/member/thanks-the-world?intent=text" className={`${btnGhost} mt-4`} data-testid="link-share-empty">Share your story</Link></div>
              ) : (
                <>
                  <ul className="ttw-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{stories.data!.items.map((s, i) => <li key={s.id} className="ttw-rise" style={{ ['--d' as string]: `${(i % 6) * 70}ms` }}><StoryCard s={s} href={openStory(s.id)} /></li>)}</ul>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button className={btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} data-testid="button-prev-page">Previous</button>
                    <span className="text-xs text-ink-700">Page {page}</span>
                    <button className={btnGhost} disabled={!stories.data!.hasMore} onClick={() => setPage((p) => p + 1)} data-testid="button-next-page">Next</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-sand-200 bg-ivory-50 px-5 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 text-sm leading-relaxed text-ink-700 md:grid-cols-3">
          <p><span className="block font-display text-lg text-ink-900">Reviewed, not verified</span>Stories are personal accounts. A country shows what the story is about, not the author's verified nationality.</p>
          <p><span className="block font-display text-lg text-ink-900">Your privacy holds</span>Taking part never makes a private profile public. Profile links appear only when the member's own settings allow it.</p>
          <p><span className="block font-display text-lg text-ink-900">Looking for public figures?</span>The earlier directory remains at <Link href="/thanks-world" className="text-lagoon-700 underline">Thanks World</Link>, and UAE testimonies at <Link href="/thanks-emirates" className="text-lagoon-700 underline">Thanks Emirates</Link>.</p>
        </div>
      </section>
    </div>
  );
}
