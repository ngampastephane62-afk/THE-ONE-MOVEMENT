/**
 * Deterministic discovery index over existing TOMI routes, sectors and programmes.
 * Pure data and pure matching: no network, no AI, no invented results.
 */
import { SECTORS } from '@/lib/sectors-data';
import { PROGRAMS } from '@/lib/programs-data';
import { sectorDestination } from '@/components/ecosystem/sector-location';

export type DiscoveryKind = 'world' | 'programme' | 'page';

export interface DiscoveryEntry {
  id: string;
  kind: DiscoveryKind;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
}

const SECTOR_KEYWORDS: Record<string, string[]> = {
  fashion: ['designer', 'design', 'runway', 'textile', 'model', 'stylist', 'clothing'],
  music: ['musician', 'singer', 'concert', 'sound', 'producer', 'band'],
  dance: ['dancer', 'choreography', 'movement'],
  film: ['cinema', 'movie', 'documentary', 'filmmaker', 'video'],
  art: ['artist', 'gallery', 'painting', 'sculpture', 'exhibition', 'curator'],
  business: ['entrepreneur', 'company', 'startup', 'enterprise'],
  investment: ['investor', 'invest', 'capital', 'fund', 'finance'],
  tourism: ['travel', 'hotel', 'hospitality', 'destination', 'culture'],
  diplomacy: ['embassy', 'diplomat', 'peace', 'government', 'institution'],
  innovation: ['research', 'invention', 'science', 'idea'],
  technology: ['tech', 'ai', 'artificial', 'intelligence', 'digital', 'developer', 'code', 'software'],
  ngos: ['ngo', 'foundation', 'charity', 'civil', 'society'],
  media: ['journalist', 'press', 'podcast', 'publishing', 'broadcast', 'news'],
  education: ['learn', 'learning', 'university', 'school', 'student', 'teacher', 'study'],
  'real-estate': ['property', 'architect', 'architecture', 'agent', 'broker', 'developer', 'city'],
  'health-care': ['health', 'care', 'medical', 'wellbeing', 'wellness', 'nurse', 'doctor'],
  'humanitarian-action': ['humanitarian', 'volunteer', 'aid', 'impact', 'solidarity', 'project', 'projects'],
};

const PAGES: DiscoveryEntry[] = [
  { id: 'page-community', kind: 'page', title: 'Community directory', summary: 'Members who chose to be listed publicly.', href: '/community', keywords: ['people', 'members', 'professionals', 'network', 'meet', 'find'] },
  { id: 'page-opportunities', kind: 'page', title: 'Opportunities', summary: 'Published calls and opportunities.', href: '/opportunities', keywords: ['opportunity', 'job', 'call', 'apply', 'work'] },
  { id: 'page-thanks-world', kind: 'page', title: 'Thank You World', summary: 'Cultures and connection across humanity.', href: '/thanks-world', keywords: ['culture', 'cultures', 'world', 'africa', 'african', 'congo', 'drc', 'heritage'] },
  { id: 'page-thanks-emirates', kind: 'page', title: 'Shukran Emirates', summary: 'The UAE chapter of the movement.', href: '/thanks-emirates', keywords: ['emirates', 'uae', 'dubai', 'arabic', 'shukran'] },
  { id: 'page-documentary', kind: 'page', title: 'The One Documentary', summary: 'Documentary history of the movement.', href: '/the-one-documentary', keywords: ['documentary', 'film', 'goma', 'kinshasa', 'congo', 'drc', 'history', 'africa', 'african'] },
  { id: 'page-news', kind: 'page', title: 'News', summary: 'Announcements and coverage.', href: '/news', keywords: ['news', 'press', 'coverage', 'article'] },
  { id: 'page-media', kind: 'page', title: 'Media', summary: 'Media library and coverage.', href: '/media', keywords: ['media', 'photos', 'video', 'press'] },
  { id: 'page-tropik', kind: 'page', title: 'Tropik Magazine', summary: 'The magazine and contributions.', href: '/tropik-magazine', keywords: ['magazine', 'tropik', 'publish', 'write', 'editorial'] },
  { id: 'page-partners', kind: 'page', title: 'Partners', summary: 'Confirmed partners and supporters.', href: '/partners', keywords: ['partner', 'partners', 'sponsor', 'support'] },
  { id: 'page-impact', kind: 'page', title: 'Impact', summary: 'Humanitarian and social impact.', href: '/impact', keywords: ['impact', 'humanitarian', 'projects', 'social'] },
  { id: 'page-join', kind: 'page', title: 'Join the movement', summary: 'Free membership and enquiries.', href: '/join', keywords: ['join', 'member', 'membership', 'sign', 'free'] },
];

export const DISCOVERY_ENTRIES: DiscoveryEntry[] = [
  ...SECTORS.map((s) => ({
    id: `world-${s.slug}`, kind: 'world' as const, title: `${s.name} world`, summary: s.descriptor,
    href: sectorDestination(s.slug),
    keywords: [s.name, s.descriptor, ...s.whoBelongs, ...(SECTOR_KEYWORDS[s.slug] ?? [])],
  })),
  ...PROGRAMS.map((p) => ({
    id: `programme-${p.slug}`, kind: 'programme' as const, title: p.name, summary: 'TOMI programme', href: `/programs/${p.slug}`,
    keywords: [p.name, p.slug.replace(/-/g, ' ')],
  })),
  ...PAGES,
];

export const DISCOVERY_EXAMPLES = [
  'I want to learn artificial intelligence.',
  'I am a fashion designer.',
  'I want to discover African culture.',
  'I am looking for real estate professionals.',
  'I want to explore humanitarian projects.',
];

const STOP = new Set(['i', 'am', 'a', 'an', 'the', 'to', 'want', 'for', 'looking', 'explore', 'discover', 'in', 'of', 'and', 'my', 'me', 'is', 'are', 'what', 'you', 'world', 'some', 'with']);

export function tokenize(q: string): string[] {
  return q.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((t) => t.length > 1 && !STOP.has(t));
}

/** Deterministic scoring: exact keyword word match 3, prefix 2, substring 1. Ties keep index order. */
export function matchDiscovery(query: string, limit = 6, entries: DiscoveryEntry[] = DISCOVERY_ENTRIES): DiscoveryEntry[] {
  const toks = tokenize(query);
  if (!toks.length) return [];
  return entries
    .map((e, i) => {
      const words = e.keywords.flatMap((k) => tokenize(k));
      const hay = words.join(' ');
      let score = 0;
      for (const t of toks) {
        if (words.includes(t)) score += 3;
        else if (words.some((w) => w.startsWith(t) || (t.startsWith(w) && w.length > 3))) score += 2;
        else if (hay.includes(t)) score += 1;
      }
      return { e, i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.e);
}

/** Guided-navigation steps (TOMI AI preview). Rule-based, no model. */
export const GUIDE_STEPS = [
  { id: 'learn', q: 'I want to learn', a: 'Start with the Education and Technology worlds, then the curated official resources inside each world.', href: sectorDestination('education') },
  { id: 'create', q: 'I create things', a: 'Fashion, Music, Dance, Film and Art each have their own world. Pick yours and show your work on your member profile.', href: sectorDestination('fashion') },
  { id: 'culture', q: 'I want to explore cultures', a: 'Thank You World, Shukran Emirates and The One Documentary hold the movement\u2019s cultural story.', href: '/thanks-world' },
  { id: 'collaborate', q: 'I want to collaborate', a: 'Browse the community directory, or send a partnership enquiry that the TOMI team reviews.', href: '/community' },
] as const;
