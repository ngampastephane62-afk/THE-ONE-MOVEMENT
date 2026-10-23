import { SECTORS, type Sector } from './sectors-data';

/** Maximum sectors the existing profile API persists. */
export const MAX_PROFILE_SECTORS = 8;

/**
 * Transparent editorial suggestions. A suggestion is produced only from
 * the member's own declared profession and saved sectors — nothing is inferred
 * from behaviour, and nothing is saved until the member chooses it.
 */
const PROFESSION_KEYWORDS: Record<string, string[]> = {
  fashion: ['fashion', 'design', 'model', 'stylist', 'textile', 'tailor', 'couture', 'artisan'],
  music: ['music', 'singer', 'musician', 'producer', 'dj', 'composer', 'artist manager'],
  dance: ['dance', 'choreograph'],
  film: ['film', 'director', 'cinema', 'actor', 'actress', 'video', 'documentary'],
  art: ['art', 'painter', 'sculpt', 'photograph', 'curator', 'gallery'],
  business: ['business', 'entrepreneur', 'ceo', 'founder', 'manager', 'consult', 'trade', 'sales', 'marketing'],
  investment: ['invest', 'finance', 'bank', 'capital', 'fund', 'analyst'],
  tourism: ['tourism', 'travel', 'hotel', 'hospitality', 'chef', 'restaurant'],
  diplomacy: ['diplomat', 'ambassador', 'embassy', 'consul', 'government', 'minister', 'policy'],
  innovation: ['innovation', 'research', 'startup'],
  technology: ['tech', 'developer', 'engineer', 'software', 'data', 'digital'],
  ngos: ['ngo', 'nonprofit', 'non-profit', 'charity', 'foundation', 'civil society'],
  media: ['media', 'journalist', 'editor', 'communication', 'pr', 'press', 'content', 'writer'],
  education: ['teacher', 'professor', 'education', 'lecturer', 'student', 'trainer', 'academic'],
  'real-estate': ['real estate', 'property', 'architect', 'construction', 'developer property'],
  'health-care': ['doctor', 'nurse', 'health', 'medical', 'pharma', 'clinic'],
  'humanitarian-action': ['humanitarian', 'relief', 'aid worker', 'peace', 'refugee'],
};

const COMPANIONS: Record<string, string[]> = {
  fashion: ['art', 'media'], music: ['dance', 'film'], dance: ['music', 'art'], film: ['media', 'art'],
  art: ['fashion', 'film'], business: ['investment', 'innovation'], investment: ['business', 'real-estate'],
  tourism: ['business', 'diplomacy'], diplomacy: ['humanitarian-action', 'ngos'], innovation: ['technology', 'business'],
  technology: ['innovation', 'education'], ngos: ['humanitarian-action', 'education'], media: ['film', 'business'],
  education: ['innovation', 'ngos'], 'real-estate': ['investment', 'tourism'], 'health-care': ['humanitarian-action', 'ngos'],
  'humanitarian-action': ['ngos', 'health-care'],
};

export type SectorSuggestion = { sector: Sector; reason: string };

export function recommendSectors(profession: string, saved: readonly string[], limit = 4): SectorSuggestion[] {
  const p = ` ${profession.toLowerCase()} `;
  const out = new Map<string, string>();
  if (p.trim()) {
    for (const [slug, words] of Object.entries(PROFESSION_KEYWORDS)) {
      if (!saved.includes(slug) && words.some((w) => p.includes(w))) out.set(slug, `Matches your profession "${profession.trim()}"`);
    }
  }
  for (const s of saved) {
    for (const c of COMPANIONS[s] ?? []) {
      if (!saved.includes(c) && !out.has(c)) out.set(c, `Often works alongside ${SECTORS.find((x) => x.slug === s)?.name ?? s}`);
    }
  }
  return [...out].slice(0, limit).flatMap(([slug, reason]) => {
    const sector = SECTORS.find((s) => s.slug === slug);
    return sector ? [{ sector, reason }] : [];
  });
}
