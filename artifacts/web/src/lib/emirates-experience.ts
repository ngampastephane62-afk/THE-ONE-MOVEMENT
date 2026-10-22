/**
 * Pure data + helpers for the Thank You, Emirates experience (Task 26).
 * No network, no React. Ruler identities come from the shared UAE_RULERS
 * snapshot (Federal Supreme Council); this file only maps them to emirates.
 */
import { IMPACT_REGIONS } from '@workspace/shared';
import { UAE_RULERS, type EmiratesPerson } from './emirates-directory';

export type EmirateId = 'abu-dhabi' | 'dubai' | 'sharjah' | 'ajman' | 'umm-al-quwain' | 'ras-al-khaimah' | 'fujairah';

export interface EmirateEntry {
  id: EmirateId;
  name: string;
  /** Genuine Arabic name; render whole with lang="ar" dir="rtl". */
  ar: string;
  rulerSlug: string;
  intro: string;
  /** Simple descriptive intro; sourced to the UAE government portal overview (see INTRO_SOURCE), not the Council page. */
  /** Schematic (not to scale) position inside a 0-100 box; west → east, south → north. */
  x: number;
  y: number;
  /** Hue used for the subtle regional background tint (HSL hue). */
  hue: number;
}

export const PRESIDENT_SLUG = 'mohamed-bin-zayed';
/** Source for the short geographic intros (UAE government portal, the seven emirates). Main: please verify URL. */
export const INTRO_SOURCE = { label: 'UAE Government portal · The seven emirates', href: 'https://u.ae/en/about-the-uae/the-seven-emirates' };
export const COUNCIL_SOURCE = 'https://uaecabinet.ae/en/federal-supreme-council';

export const SEVEN_EMIRATES: readonly EmirateEntry[] = [
  { id: 'abu-dhabi', name: 'Abu Dhabi', ar: 'أبوظبي', rulerSlug: 'mohamed-bin-zayed', intro: 'The largest of the seven emirates, home to Abu Dhabi city, the federal capital.', x: 26, y: 66, hue: 189 },
  { id: 'dubai', name: 'Dubai', ar: 'دبي', rulerSlug: 'mohammed-bin-rashid', intro: 'An emirate on the Arabian Gulf coast, home to the city of Dubai.', x: 56, y: 44, hue: 39 },
  { id: 'sharjah', name: 'Sharjah', ar: 'الشارقة', rulerSlug: 'sultan-al-qasimi', intro: 'An emirate with territory on both the Arabian Gulf and the Gulf of Oman coasts.', x: 63, y: 37, hue: 19 },
  { id: 'ajman', name: 'Ajman', ar: 'عجمان', rulerSlug: 'humaid-al-nuaimi', intro: 'The smallest of the seven emirates by area, on the Arabian Gulf coast.', x: 67, y: 31, hue: 160 },
  { id: 'umm-al-quwain', name: 'Umm Al Quwain', ar: 'أم القيوين', rulerSlug: 'saud-al-mualla', intro: 'A coastal emirate on the Arabian Gulf, between Ajman and Ras Al Khaimah.', x: 71, y: 25, hue: 200 },
  { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', ar: 'رأس الخيمة', rulerSlug: 'saud-al-qasimi', intro: 'The northernmost emirate, extending to the Hajar Mountains.', x: 78, y: 15, hue: 12 },
  { id: 'fujairah', name: 'Fujairah', ar: 'الفجيرة', rulerSlug: 'hamad-al-sharqi', intro: 'An emirate in the east of the country, on the Gulf of Oman coast.', x: 86, y: 38, hue: 172 },
];

export function emirateRuler(e: Pick<EmirateEntry, 'rulerSlug'>): EmiratesPerson | undefined {
  return UAE_RULERS.find((p) => p.slug === e.rulerSlug);
}
export function president(): EmiratesPerson | undefined {
  return UAE_RULERS.find((p) => p.slug === PRESIDENT_SLUG);
}
/** Wrapping index step (prev = -1, next = +1). */
export function stepIndex(i: number, delta: number, length: number = SEVEN_EMIRATES.length): number {
  if (length <= 0) return 0;
  return (((i + delta) % length) + length) % length;
}

export type ContinentId = 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania';
export interface ContinentEntry {
  id: ContinentId;
  label: string;
  /** Lower-case continent names accepted from /api/gratitude/options countries[].continent. */
  aliases: string[];
  /** Optional lower-case countries[].region filter (needed because the API groups North and South under 'Americas'). */
  regions?: string[];
  /** Tokens matched against a configured campaign's slug or identity.style. */
  campaignTokens: string[];
  /** IMPACT_REGIONS key for the editorial /thanks-world directory, if one exists. */
  directoryKey: string | null;
  /** Schematic focal point inside the 0-1000 x 0-500 world composition. */
  cx: number;
  cy: number;
}

export const CONTINENTS: readonly ContinentEntry[] = [
  { id: 'africa', label: 'Africa', aliases: ['africa'], campaignTokens: ['africa'], directoryKey: 'africa', cx: 530, cy: 300 },
  { id: 'asia', label: 'Asia', aliases: ['asia'], campaignTokens: ['asia'], directoryKey: 'asia', cx: 740, cy: 170 },
  { id: 'europe', label: 'Europe', aliases: ['europe'], campaignTokens: ['europe'], directoryKey: 'europe', cx: 520, cy: 135 },
  { id: 'north-america', label: 'North America', aliases: ['americas', 'north america'], regions: ['north america', 'northern america', 'central america', 'caribbean'], campaignTokens: ['north-america', 'usa'], directoryKey: 'usa', cx: 220, cy: 160 },
  { id: 'south-america', label: 'South America', aliases: ['americas', 'south america'], regions: ['south america'], campaignTokens: ['south-america'], directoryKey: 'south-america', cx: 320, cy: 340 },
  { id: 'oceania', label: 'Oceania', aliases: ['oceania', 'australia'], campaignTokens: ['oceania'], directoryKey: 'oceania', cx: 860, cy: 360 },
];

type CountryLike = { code: string; name: string; continent?: string | null; region?: string | null };
type CampaignLike = { id: number; slug: string; name: string; status: string; parentId?: number | null; identity?: unknown };

const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
const styleOf = (c: CampaignLike) => { const s = (c.identity as { style?: unknown } | null | undefined)?.style; return typeof s === 'string' ? s.toLowerCase() : ''; };

export function continentOf(id: string): ContinentEntry | undefined {
  return CONTINENTS.find((c) => c.id === id);
}
/** Countries whose continent matches (exact alias) and, for the Americas split, whose region matches. */
export function countriesInContinent<T extends CountryLike>(countries: readonly T[] | undefined, id: ContinentId): T[] {
  const c = continentOf(id);
  if (!c || !countries) return [];
  return countries.filter((k) => c.aliases.includes(norm(k.continent)) && (!c.regions || c.regions.includes(norm(k.region))));
}
/** Active campaigns explicitly configured as global (style 'global' or no parent and no regional token). */
export function globalCampaigns<T extends CampaignLike>(campaigns: readonly T[] | undefined): T[] {
  return (campaigns ?? []).filter((c) => c.status === 'active' && (styleOf(c) === 'global' || c.slug === 'thanks-the-world'));
}
/** Active campaigns genuinely configured for this continent (slug token or identity style). Never invents. */
export function regionalCampaigns<T extends CampaignLike>(campaigns: readonly T[] | undefined, id: ContinentId): T[] {
  const c = continentOf(id);
  if (!c) return [];
  return (campaigns ?? []).filter((k) => {
    if (k.status !== 'active' || styleOf(k) === 'global') return false;
    const slugTokens = norm(k.slug);
    return c.campaignTokens.some((t) => styleOf(k) === t || slugTokens === t || slugTokens.endsWith(`-${t}`) || slugTokens.startsWith(`${t}-`) || slugTokens.includes(`-${t}-`));
  });
}
/** Editorial impact directory (NOT an active campaign) for a continent, from IMPACT_REGIONS. */
export function impactDirectory(id: ContinentId): { href: string; label: string; region: string } | null {
  const c = continentOf(id);
  const r = c?.directoryKey ? IMPACT_REGIONS.find((x) => x.key === c.directoryKey) : undefined;
  return r ? { href: `/thanks-world#${r.key}`, label: r.campaign, region: r.label } : null;
}
export const GLOBAL_CAMPAIGN_HREF = '/thanks-the-world';
export const EMIRATES_FORM_HREF = '/member/thanks-emirates';
