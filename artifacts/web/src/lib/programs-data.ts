/**
 * programs-data.ts
 *
 * Typed local data source for the six official programs of The One Movement International.
 * This file is the single source of truth for all program detail pages.
 *
 * SCHEDULING FIELDS (date, city, country, venue, editionNumber) are OPTIONAL.
 * They are omitted for ALL programs at this stage — sections that depend on
 * them render the neutral notice "Official program details will be announced
 * when confirmed." instead of empty or placeholder content.
 *
 * CONTENT RULES (enforced here, not in the template):
 * — No invented dates, cities, venues, designers, models, speakers, sponsors,
 *   partners, media names, guest counts, attendance, or revenue.
 * — The sixth Fashion Week edition must never appear as completed history,
 *   in statistics, or with a specific date/venue/city.
 * — No donation, fundraising, ticketing, or payment language.
 */

/* ── Types ──────────────────────────────────────────────────────────────────── */

export type ProgramStatus = 'announced' | 'planned' | 'postponed';

export interface ProgramCTA {
  label: string;
  href: string;
}

export interface Program {
  /** URL slug — used in /programs/:slug routing. */
  slug: string;

  /** Full official name in UPPERCASE. */
  name: string;

  /** Short eyebrow: category + domain. */
  eyebrow: string;

  /** One-line tagline. */
  tagline: string;

  /** Hero statement — two to three sentences for the hero section. */
  heroStatement: string;

  /** Full purpose paragraph — why the program exists. */
  purpose: string;

  /** Full overview paragraph — what the program does. */
  overview: string;

  /** Key themes — rendered as badge/tag row. */
  themes: string[];

  /** Target audiences. */
  audiences: string[];

  /** Experience items — what the program brings together. */
  experienceItems: string[];

  /** How the program connects to the 365-day ecosystem. */
  movementConnection: string;

  // ── Scheduling — OPTIONAL. Omit when not confirmed. ──────────────────────

  /** Current program status — renders a badge in the hero when present. */
  status?: ProgramStatus;

  /**
   * Edition number — omit until officially announced.
   * @example 6
   */
  editionNumber?: number;

  /**
   * Date string — omit until officially confirmed.
   * @example "22 December 2026"
   */
  date?: string;

  /**
   * City name — omit until officially confirmed.
   */
  city?: string;

  /**
   * Country — omit until officially confirmed.
   */
  country?: string;

  /**
   * Venue — omit until officially confirmed.
   */
  venue?: string;

  // ── Media ─────────────────────────────────────────────────────────────────

  /**
   * Photo placeholder labels — rendered as tiny uppercase dev captions inside
   * premium lagoon-800 fallback surfaces. Replace with real filenames when
   * photographs are supplied during the content-integration module.
   */
  mediaSlots: string[];

  // ── CTAs ──────────────────────────────────────────────────────────────────

  /** Primary call to action — must point to an existing working route. */
  primaryCTA: ProgramCTA;

  /** Optional secondary CTA — only when a real destination exists. */
  secondaryCTA?: ProgramCTA;

  // ── Relations ─────────────────────────────────────────────────────────────

  /** Slugs of related programs to display in the Related Programs section. */
  relatedProgramSlugs: string[];

  // ── Notices ───────────────────────────────────────────────────────────────

  /**
   * Verification / status notice — rendered in the Participation section.
   * If absent the component renders nothing.
   */
  verificationNotice?: string;

  /**
   * History note — rendered above the neutral scheduling notice in the
   * Program Information panel. Only populate with verified, completed history.
   */
  historyNote?: string;

  // ── SEO ───────────────────────────────────────────────────────────────────

  seoTitle: string;
  seoDescription: string;
}

/* ── Data ────────────────────────────────────────────────────────────────────
   All six official programs. Fields are verbatim from the approved content
   specification. No scheduling fields are populated at this stage.
   ─────────────────────────────────────────────────────────────────────────── */

export const PROGRAMS: Program[] = [
  /* 1 ─ THE ONE DIPLOMATIC GALA ─────────────────────────────────────────── */
  {
    slug: 'diplomatic-gala',
    name: 'THE ONE DIPLOMATIC GALA',
    eyebrow: 'OFFICIAL PROGRAM — DIPLOMACY & CULTURE',
    tagline: 'Culture. Diplomacy. Art. Peace.',
    heroStatement:
      'An event bringing institutions, NGOs, humanitarian organizations, private offices, governments and business leaders together through diplomatic exchange, culture and dialogue for peace.',
    purpose:
      'The One Diplomatic Gala is conceived as a meeting point for institutions, NGOs, humanitarian organizations, private offices, governments and companies. Around one event, these communities can exchange perspectives, strengthen relationships and explore cooperation in service of peace and positive impact. Culture and art support that dialogue by creating a shared space beyond formal negotiations.',
    overview:
      'The programme is designed around speaker interventions, moderated diplomatic exchanges, institutional networking, cultural performances and recognition moments. Ambassadors, public-sector representatives, humanitarian actors and private-sector leaders can meet, discuss shared priorities and identify opportunities for collaboration. The official format, participants and schedule will be announced when confirmed.',
    themes: ['Diplomacy', 'Peace', 'Culture', 'Art', 'International Collaboration'],
    audiences: [
      'Embassies and diplomats',
      'Governments and institutions',
      'International organizations',
      'NGOs and humanitarian organizations',
      'Private offices',
      'Artists and cultural leaders',
      'Corporate leaders',
      'Media',
    ],
    experienceItems: [
      'Speaker interventions and moderated exchanges',
      'Diplomatic and humanitarian dialogue',
      'Cultural performances',
      'Recognition moments',
      'Institutional networking',
      'Artistic showcases',
      'Dialogue between cultures',
    ],
    movementConnection:
      "The Gala turns the Movement's values into an institutional bridge: connections made here open collaboration between governments, organizations and the Movement's global community — long after the evening ends.",
    mediaSlots: [
      'DIPLOMATIC GALA IMAGE — EVENING CEREMONY',
      'CULTURE AND DIPLOMACY IMAGE',
      'ARTISTIC PERFORMANCE IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['summit', 'awards'],
    verificationNotice: 'Further official details will be announced.',
    seoTitle: 'The One Diplomatic Gala — The One Movement International',
    seoDescription:
      'An evening where diplomacy meets culture: art, dialogue and peace at the heart of The One Movement International.',
  },

  /* 2 ─ THE ONE SUMMIT ──────────────────────────────────────────────────── */
  {
    slug: 'summit',
    name: 'THE ONE SUMMIT',
    eyebrow: 'OFFICIAL PROGRAM — LEADERSHIP & BUSINESS',
    tagline: 'Leadership. Innovation. Business.',
    heroStatement:
      'Where leaders, builders and investors explore the ideas and partnerships shaping a more connected world.',
    purpose:
      "The One Summit exists to convert the Movement's global network into working ideas: bringing leaders, entrepreneurs, investors and innovators together around the opportunities and responsibilities of a connected world.",
    overview:
      "The Summit is the Movement's thinking and building stage — conversations, presentations and working sessions where business meets purpose, and where cross-border collaboration moves from idea to intention.",
    themes: ['Leadership', 'Innovation', 'Entrepreneurship', 'Investment', 'Global Business'],
    audiences: [
      'Entrepreneurs and startups',
      'Corporate leaders',
      'Investors',
      'Innovators and technologists',
      'Institutions and universities',
      'Media',
    ],
    experienceItems: [
      'Keynote conversations',
      'Panels and roundtables',
      'Presentations and showcases',
      'Cross-sector networking',
      'Partnership conversations',
    ],
    movementConnection:
      'Every Summit conversation feeds the ecosystem: members meet collaborators, investors meet founders, and institutions meet the community — connections that continue inside the Movement all year.',
    mediaSlots: [
      'SUMMIT AND BUSINESS IMAGE — MAIN STAGE',
      'LEADERSHIP CONVERSATION IMAGE',
      'NETWORKING IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['investment-forum', 'diplomatic-gala'],
    verificationNotice: 'Further official details will be announced.',
    seoTitle: 'The One Summit — The One Movement International',
    seoDescription:
      "Leadership, innovation and business at the heart of The One Movement International's global ecosystem.",
  },

  /* 3 ─ THE ONE FASHION WEEK INTERNATIONAL ──────────────────────────────── */
  {
    slug: 'fashion-week',
    name: 'THE ONE FASHION WEEK INTERNATIONAL',
    eyebrow: 'OFFICIAL PROGRAM — FASHION & CULTURE',
    tagline: 'Fashion. Design. Runway. Culture.',
    heroStatement:
      'Sixth edition: Dubai, 22 December 2026. The program where the Movement began — a fashion week where every body, every origin and every story belongs on the runway.',
    // Sixth edition confirmed: Dubai, 22 December 2026 (first Dubai edition).
    status: 'announced',
    editionNumber: 6,
    date: '22 December 2026',
    city: 'Dubai',
    purpose:
      'The One Fashion Week International exists to prove that fashion can carry a message larger than fashion: peace, unity and radical inclusion. Born in the Democratic Republic of Congo, it gives the world\'s stage to talents the industry has overlooked — celebrating every body, every ability, every origin and every story.',
    overview:
      'A body-positive, fully inclusive fashion week uniting designers, models, artisans and artists across borders. Runways, showcases and cultural performances celebrate creativity as a universal language — built on the belief that we are One People. One Single Human Race.',
    themes: ['Fashion', 'Inclusion', 'Peace', 'Culture', 'Creative Industries'],
    audiences: [
      'Designers',
      'Models',
      'Photographers and videographers',
      'Makeup artists and hair stylists',
      'Artisans and creative professionals',
      'Media',
      'Cultural institutions',
    ],
    experienceItems: [
      'Runway shows',
      'Designer showcases',
      'Artisan exhibitions',
      'Cultural performances',
      'Creative community gatherings',
    ],
    movementConnection:
      "Fashion Week is where the Movement's story began, and it remains one program among six. Its five completed editions provide the historical foundation for the Movement's wider future direction.",
    // historyNote: verified completed history only. The sixth edition must NOT appear here.
    historyNote:
      'Five editions have been completed in the Democratic Republic of Congo — in Bukavu, Goma and Kinshasa. The fifth edition was held in Kinshasa under the theme Peace and Unity. Any formal institutional-support attribution remains subject to Founder confirmation. The sixth edition, the first in Dubai, is confirmed for 22 December 2026. Further official information will be announced.',
    mediaSlots: [
      'FASHION WEEK IMAGE — RUNWAY',
      'DESIGNER SHOWCASE IMAGE',
      'CULTURAL PERFORMANCE IMAGE',
      'COMMUNITY AND AUDIENCE IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['fashion-night', 'awards'],
    verificationNotice:
      'Applications are not currently open. Registration information for 22 December 2026 will be published after confirmation.',
    seoTitle: 'The One Fashion Week International — The One Movement International',
    seoDescription:
      'Born in the DRC. Five editions of fashion for peace, unity and radical inclusion — one official program of The One Movement International.',
  },

  /* 4 ─ THE ONE AWARDS ──────────────────────────────────────────────────── */
  {
    slug: 'awards',
    name: 'THE ONE AWARDS',
    eyebrow: 'OFFICIAL PROGRAM — RECOGNITION',
    tagline: 'Recognition. Excellence. Impact.',
    heroStatement:
      'A global recognition initiative celebrating individuals, organizations and changemakers whose creativity, leadership, courage and commitment contribute to a more connected, inclusive and peaceful world.',
    purpose:
      "The One Awards exist to recognize excellence that serves something larger than itself: creativity, courage, collaboration and positive impact across the Movement's global community.",
    overview:
      'A recognition program celebrating members, organizations and initiatives — from creative achievement to humanitarian contribution — whose work advances connection, opportunity and peace.',
    themes: ['Recognition', 'Excellence', 'Impact', 'Community'],
    audiences: [
      'Creatives and artists',
      'Entrepreneurs and organizations',
      'Humanitarian actors',
      'Institutions',
      'Community leaders',
      'Media',
    ],
    experienceItems: [
      'Recognition ceremonies',
      'Honoree stories',
      'Community celebration',
      'Cultural moments',
    ],
    movementConnection:
      "The Awards turn the Movement's values into visible examples — showing the community, and the world, what excellence with a conscience looks like.",
    mediaSlots: [
      'AWARDS IMAGE — CEREMONY',
      'HONOREE MOMENT IMAGE',
      'CELEBRATION IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['diplomatic-gala', 'summit'],
    verificationNotice: 'Further official details will be announced.',
    seoTitle: 'The One Awards — The One Movement International',
    seoDescription:
      'Recognition, excellence and impact across the global community of The One Movement International.',
  },

  /* 5 ─ THE ONE FASHION NIGHT ────────────────────────────────────────────── */
  {
    slug: 'fashion-night',
    name: 'THE ONE FASHION NIGHT',
    eyebrow: 'OFFICIAL PROGRAM — ENTERTAINMENT & CULTURE',
    tagline: 'Entertainment. Music. Fashion. Culture.',
    heroStatement:
      'A celebration where fashion meets music, dance and art — the Movement at its most alive.',
    purpose:
      "The One Fashion Night exists to celebrate: an open, vibrant evening where the Movement's cultures meet on one stage, and where creativity is experienced rather than explained.",
    overview:
      "An entertainment-led evening blending fashion, live music, dance and art — a cultural celebration open to the wider public, carrying the Movement's message of unity through joy.",
    themes: ['Entertainment', 'Music', 'Fashion', 'Dance', 'Culture'],
    audiences: [
      'The public',
      'Creatives and performers',
      'Designers',
      'Musicians and dancers',
      'Media',
      'Community members',
    ],
    experienceItems: [
      'Live performances',
      'Fashion showcases',
      'Music and dance',
      'Cultural celebration',
    ],
    movementConnection:
      "Fashion Night opens the Movement's doors widest — inviting the public into an experience of what unity through culture feels like, and welcoming new members into the community.",
    mediaSlots: [
      'FASHION NIGHT IMAGE — LIVE STAGE',
      'MUSIC AND DANCE IMAGE',
      'CELEBRATION IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['fashion-week', 'awards'],
    verificationNotice: 'Further official details will be announced.',
    seoTitle: 'The One Fashion Night — The One Movement International',
    seoDescription:
      'Fashion, music, dance and culture — a celebration of unity by The One Movement International.',
  },

  /* 6 ─ THE ONE INVESTMENT FORUM ─────────────────────────────────────────── */
  {
    slug: 'investment-forum',
    name: 'THE ONE INVESTMENT FORUM',
    eyebrow: 'OFFICIAL PROGRAM — INVESTMENT',
    tagline: 'Investment. Startups. Business Matching.',
    heroStatement:
      "Where capital meets creativity and conviction — connecting investors with the Movement's global opportunity.",
    purpose:
      "The One Investment Forum exists to close the distance between capital and talent: creating a trusted space where investors meet founders, projects and opportunities from across the Movement's international community.",
    overview:
      "A focused business program of presentations, curated introductions and investment conversations — built on the Movement's cross-sector network spanning creative industries, technology, tourism and impact.",
    themes: ['Investment', 'Startups', 'Business Matching', 'Entrepreneurship', 'Growth'],
    audiences: [
      'Investors',
      'Founders and startups',
      'Companies',
      'Institutions',
      'Business leaders',
    ],
    experienceItems: [
      'Founder presentations',
      'Curated business matching',
      'Investment roundtables',
      'Sector insights',
      'Network introductions',
    ],
    movementConnection:
      "The Forum converts the Movement's connections into economic opportunity — and every conversation it starts continues inside the permanent ecosystem.",
    mediaSlots: [
      'INVESTMENT FORUM IMAGE — PRESENTATIONS',
      'BUSINESS MATCHING IMAGE',
      'ROUNDTABLE IMAGE',
    ],
    primaryCTA: { label: 'JOIN THE MOVEMENT', href: '/join' },
    relatedProgramSlugs: ['summit', 'diplomatic-gala'],
    verificationNotice: 'Further official details will be announced.',
    seoTitle: 'The One Investment Forum — The One Movement International',
    seoDescription:
      "Investment, startups and business matching within The One Movement International's global ecosystem.",
  },
];

/** Look up a program by slug. Returns undefined for unknown slugs. */
export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
