/**
 * Audience evidence supplied by Tropik as platform captures (Meta / Instagram Insights).
 * Values are copied exactly from the captures. Periods are stated only where the capture shows them.
 * Never sum these snapshots: periods and accounts overlap. They are views and accounts reached, not readers.
 */
const A = (name: string) => `${import.meta.env.BASE_URL}api/magazine/assets/${name}.webp`;

export type Fact = { term: string; value: string };
export type Snapshot = {
  id: string; platform: string; title: string; total: number; unit: string;
  period: string; facts: Fact[]; note: string; proof?: string; proofAlt?: string;
};

export const OVERVIEW: Snapshot = {
  id: 'overview', platform: 'Meta Insights · overview', title: 'Views', total: 2508795, unit: 'views',
  period: 'Period not specified on the capture',
  facts: [
    { term: 'Net followers', value: '+16,660' },
    { term: 'Accounts reached', value: '18,214' },
    { term: 'Views from non-followers', value: '96.5%' },
    { term: 'Views from followers', value: '3.5%' },
    { term: 'By format', value: 'Reels 2.2M · Stories 61K · Posts 52K' },
  ],
  note: 'Format figures are rounded by the platform and are shown as displayed.',
  proof: A('audience-proof-overview'), proofAlt: 'Cropped Meta Insights metric cards: 2,508,795 views and +16,660 net followers',
};

export const INSTAGRAM_60: Snapshot = {
  id: 'instagram-60', platform: 'Instagram Insights', title: 'Views', total: 1081909, unit: 'views',
  period: 'Last 60 days · 7 Apr – 5 Jun (year not shown)',
  facts: [
    { term: 'Accounts reached', value: '13,466' },
    { term: 'Reach change shown', value: '+9,729.2%' },
    { term: 'Views from non-followers', value: '99.4%' },
    { term: 'Views from followers', value: '0.6%' },
    { term: 'By format', value: 'Reels 95.7% · Posts 4.2%' },
  ],
  note: 'Not a monthly figure. Separate from the overview above; the two are never added together.',
  proof: A('audience-proof-instagram'), proofAlt: 'Cropped Instagram Insights views total: 1,081,909 views, 99.4% non-followers',
};

export const WEEK: Snapshot = {
  id: 'week', platform: 'Meta Insights', title: 'Views', total: 349397, unit: 'views',
  period: 'Last 7 days (dates not shown)',
  facts: [
    { term: 'Accounts reached', value: '767' },
    { term: 'Net followers', value: '−367' },
    { term: 'Views from non-followers', value: '98.8%' },
    { term: 'By format', value: 'Reels 345K · Stories 3.3K' },
  ],
  note: 'Overlaps the overview period; shown on its own.',
  proof: A('audience-proof-week'), proofAlt: 'Cropped Meta Insights seven-day metric cards: 349,397 views and −367 net followers',
};

export const REELS = [1017255, 1008939, 1007320, 101391, 88421, 51805].map((views, i) => ({
  src: A(`audience-reel-0${i + 1}`), views,
  alt: [
    'Fashion-event portrait of a woman in a dark teal dress',
    'Two women in conversation during a fashion event',
    'Fashion-event portrait of a woman in a black halter-neck dress',
    'A woman speaking into a microphone at an event',
    'The Burj Khalifa and Dubai skyline illuminated at night',
    'A man wearing sunglasses at a fashion event',
  ][i],
}));
export const REELS_NOTE = 'View counters as displayed on the Instagram content grid. The period over which they accumulated is not shown, and they are not part of the 60-day total.';

export const AUDIENCE_PROFILE = {
  source: 'Meta Insights · audience · period not specified on the capture',
  gender: [{ term: 'Men', value: '67.7%' }, { term: 'Women', value: '32.3%' }],
  ages: [['13–17', '8.5%'], ['18–24', '32.4%'], ['25–34', '37.1%'], ['35–44', '13.1%'], ['45–54', '4.8%'], ['55–64', '2.0%'], ['65+', '2.0%']] as const,
  agesNote: 'Shares as displayed; they total 99.9% because of rounding.',
};

export const TOP_CITIES = {
  source: 'Instagram Insights · last 30 days · 7 May – 5 Jun (year not shown)',
  cities: [['Dubai', '41.9%'], ['Kinshasa, Congo', '7.4%'], ['Bukavu', '5.4%'], ['Sharjah', '5.0%']] as const,
  note: 'The four leading cities only; the rest of the audience is not listed.',
  profileActivity: { value: '1,163', change: '+352.5%', vs: 'vs 7 Apr – 6 May' },
};

/** Secondary source account shown in the captures. Distinct from the official @tropikagencecom link in social-sources.ts. */
export const SOURCE_ACCOUNT = {
  handle: '@tropikagency', title: 'Tropik Agency UAE', url: 'https://www.instagram.com/tropikagency/',
  followers: '12.3K', posts: '279', views30: '873.8K',
  note: 'Figures for this account only, as displayed on its profile (followers rounded by Instagram; views over the last 30 days).',
};
