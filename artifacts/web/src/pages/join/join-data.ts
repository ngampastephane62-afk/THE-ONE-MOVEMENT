/**
 * join-data.ts — local data for the /join page.
 *
 * Machine-readable slug lists come from @workspace/shared (taxonomy module).
 * Display labels live here. No invented content, no marketing copy beyond
 * what is verbatim in the spec.
 */

import {
  CATEGORIES_BY_GROUP,
  ORGANIZATION_TYPES,
  type JoinableGroup,
} from '@workspace/shared';

// ---------------------------------------------------------------------------
// Path definitions — five paths, three joinable via the standard form
// ---------------------------------------------------------------------------

export interface PathDefinition {
  id: string;
  label: string;
  desc: string;
  /** audienceGroup value for the form; null = institutional/strategic path */
  audienceGroup: JoinableGroup | null;
  /** When true, clicking this card scrolls to the inquiry section */
  scrollsToInquiry: boolean;
}

export const PATH_DEFINITIONS: PathDefinition[] = [
  {
    id: 'creative-cultural',
    label: 'CREATIVE & CULTURAL',
    desc: 'Designers, artists, musicians, filmmakers, performers and the talents around them.',
    audienceGroup: 'creative-cultural',
    scrollsToInquiry: false,
  },
  {
    id: 'business-innovation',
    label: 'BUSINESS & INNOVATION',
    desc: 'Entrepreneurs, startups, companies, investors and technology builders.',
    audienceGroup: 'business-innovation',
    scrollsToInquiry: false,
  },
  {
    id: 'institutions',
    label: 'INSTITUTIONS',
    desc: 'Embassies, governments, international organizations, universities and NGOs.',
    audienceGroup: null,
    scrollsToInquiry: true,
  },
  {
    id: 'community-impact',
    label: 'COMMUNITY & IMPACT',
    desc: 'Volunteers, students and humanitarian organizations.',
    audienceGroup: 'community-impact',
    scrollsToInquiry: false,
  },
  {
    id: 'strategic-support',
    label: 'STRATEGIC SUPPORT',
    desc: 'Sponsors, partners and media organizations.',
    audienceGroup: null,
    scrollsToInquiry: true,
  },
];

// ---------------------------------------------------------------------------
// Category display labels — verbatim from spec, keyed by taxonomy slug
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<string, string> = {
  designer: 'Designer',
  model: 'Model',
  photographer: 'Photographer',
  videographer: 'Videographer',
  'makeup-artist': 'Makeup Artist',
  'hair-stylist': 'Hair Stylist',
  musician: 'Musician',
  artist: 'Artist',
  dancer: 'Dancer',
  filmmaker: 'Filmmaker',
  influencer: 'Influencer',
  entrepreneur: 'Entrepreneur',
  startup: 'Startup',
  company: 'Company',
  investor: 'Investor',
  innovator: 'Innovator',
  'technology-company': 'Technology Company',
  volunteer: 'Volunteer',
  student: 'Student',
  'humanitarian-organization': 'Humanitarian Organization',
};

/** Returns display-labelled categories for the given audience group slug. */
export function getCategoriesForGroup(
  group: string,
): { slug: string; label: string }[] {
  const slugs =
    CATEGORIES_BY_GROUP[group as JoinableGroup] ?? [];
  return slugs.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[slug] ?? slug,
  }));
}

// ---------------------------------------------------------------------------
// Organization type display labels
// ---------------------------------------------------------------------------

export const ORG_TYPE_LABELS: Record<string, string> = {
  embassy: 'Embassy',
  government: 'Government',
  'international-organization': 'International Organization',
  university: 'University',
  ngo: 'NGO',
  sponsor: 'Sponsor',
  partner: 'Partner',
  'media-organization': 'Media Organization',
};

/** All org type options with display labels, sourced from taxonomy. */
export const ORG_TYPE_OPTIONS: { slug: string; label: string }[] =
  ORGANIZATION_TYPES.map((slug) => ({
    slug,
    label: ORG_TYPE_LABELS[slug] ?? slug,
  }));

// ---------------------------------------------------------------------------
// Journey steps — verbatim from spec
// ---------------------------------------------------------------------------

export const JOURNEY_STEPS: string[] = [
  'Submit your expression of interest.',
  'Our team reviews your submission.',
  'Receive official updates from the Movement.',
  'Review any future participation terms before deciding whether to continue.',
  'Take part only when a relevant program or opportunity is confirmed.',
];

// ---------------------------------------------------------------------------
// Consent text — verbatim from spec
// ---------------------------------------------------------------------------

export const CONSENT_TEXT =
  'I agree that The One Movement International may store and protect the information I provide using safeguards appropriate to the current service, and contact me regarding my expression of interest, future platform updates, official announcements and relevant opportunities. I understand that I may request access, correction, deletion or withdrawal of consent.';

// ---------------------------------------------------------------------------
// FAQ — verbatim from spec
// ---------------------------------------------------------------------------

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Who can join?',
    a: 'The Movement welcomes expressions of interest from creatives, entrepreneurs, students, volunteers, organizations and institutions that share its values of connection, opportunity and peace.',
  },
  {
    q: 'Is membership free?',
    a: 'Yes. Creating a free member account and ecosystem profile requires no payment, and neither does submitting an expression of interest. There is no paid membership, and an account does not guarantee event places or programme access.',
  },
  {
    q: 'Can organizations join?',
    a: "Yes. Companies, startups, NGOs and humanitarian organizations can submit an expression of interest by selecting 'Organization'. Embassies, governments, international organizations, universities, sponsors, partners and media organizations can use the institutional inquiry pathway.",
  },
  {
    q: 'Can I join from any country?',
    a: 'Expressions of interest may be submitted from many locations. Participation remains subject to applicable requirements and the terms of any confirmed program.',
  },
  {
    q: 'Can I create a member account?',
    a: 'Yes. You can create a free account and a private ecosystem profile from the Sign in page, independently of this enquiry form. You choose whether your profile appears in the public directory. A social network, messaging and marketplace features remain future direction.',
  },
];

// ---------------------------------------------------------------------------
// Group display labels
// ---------------------------------------------------------------------------

export const GROUP_LABELS: Record<string, string> = {
  'creative-cultural': 'Creative & Cultural',
  'business-innovation': 'Business & Innovation',
  'community-impact': 'Community & Impact',
};
