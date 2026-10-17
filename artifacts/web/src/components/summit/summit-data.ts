/**
 * summit-data.ts — content model for the Summit ecosystem page.
 * Rules: no invented listings, members, partners, prices or confirmations.
 * `status` is shown to visitors so future features are never mistaken for live ones.
 */
export type FeatureStatus = 'live' | 'early-access' | 'coming-soon';

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: 'AVAILABLE NOW',
  'early-access': 'EARLY ACCESS',
  'coming-soon': 'COMING SOON',
};

export const ROUTES = {
  join: '/join',
  signUp: '/sign-up',
  settings: '/member/settings',
  people: '/member/people',
  ecosystem: '/ecosystem',
  media: '/media',
  impact: '/impact',
  partners: '/partners',
  marketplaceEnquiry: '/join?intent=marketplace#institutional-inquiry',
  knowledgeEnquiry: '/join?intent=knowledge-hub#institutional-inquiry',
  investment: '/join?intent=investment#institutional-inquiry',
  partnership: '/join?intent=partnership#institutional-inquiry',
  speaker: '/join?intent=programme-service&program=summit&service=speaker#institutional-inquiry',
  speakerSponsor: '/join?intent=programme-service&program=summit&service=speaker&coverage=existing-sponsor#institutional-inquiry',
  exhibitor: '/join?intent=programme-service&program=summit&service=exhibitor#institutional-inquiry',
} as const;

export interface Pillar {
  id: string;
  index: string;
  name: string;
  description: string;
  status: FeatureStatus;
  statusNote: string;
  action: { label: string; href: string };
  anchor: string;
}

export const PILLARS: Pillar[] = [
  { id: 'marketplace', index: '01', name: 'THE ONE MARKETPLACE', description: 'Discover products, businesses, professional services and expertise.', status: 'early-access', statusNote: 'Member profiles can describe what you offer today. Listings and transactions are not live yet.', action: { label: 'Request early access', href: ROUTES.marketplaceEnquiry }, anchor: '#marketplace' },
  { id: 'knowledge', index: '02', name: 'THE ONE KNOWLEDGE HUB', description: 'Educational resources, practical guides, expert insights, training materials and knowledge sharing.', status: 'early-access', statusNote: 'A curated set of official external resources is available now. The full TOMI library is in development.', action: { label: 'Browse resources', href: '#knowledge' }, anchor: '#knowledge' },
  { id: 'network', index: '03', name: 'THE ONE NETWORK', description: 'Discover professionals, entrepreneurs, experts and potential partners.', status: 'live', statusNote: 'Opt-in public directory and signed-in member discovery are live.', action: { label: 'Open the directory', href: ROUTES.ecosystem }, anchor: '#network' },
  { id: 'summit', index: '04', name: 'THE ONE SUMMIT & EXCHANGE', description: 'The annual physical gathering: exhibitions, demonstrations, workshops and professional networking.', status: 'live', statusNote: 'Exhibitor and speaker enquiries are open. Programme details are confirmed officially.', action: { label: 'See the experience', href: '#experience' }, anchor: '#experience' },
  { id: 'media', index: '05', name: 'THE ONE MEDIA', description: 'Interviews, business stories, expert discussions, innovation reports and educational content.', status: 'live', statusNote: 'The media section and archive are live. New series are added as they are produced.', action: { label: 'Visit The One Media', href: ROUTES.media }, anchor: '#media' },
  { id: 'impact', index: '06', name: 'THE ONE IMPACT', description: 'Governance, sustainability, climate, infrastructure, education and social impact initiatives.', status: 'live', statusNote: 'The impact section is live. Proposed projects are not presented as funded.', action: { label: 'Explore impact', href: ROUTES.impact }, anchor: '#impact' },
];

export interface SummitSector {
  id: string;
  name: string;
  line: string;
  /** Existing platform sector keys used for real resources, programmes and member discovery. */
  keys: string[];
}

export const SUMMIT_SECTORS: SummitSector[] = [
  { id: 'business', name: 'Business & Entrepreneurship', line: 'Founders, companies and the services that help them grow.', keys: ['business', 'innovation'] },
  { id: 'technology', name: 'Technology & Artificial Intelligence', line: 'Digital tools, AI and the people building them.', keys: ['technology', 'innovation'] },
  { id: 'real-estate', name: 'Real Estate & Infrastructure', line: 'Places, construction and long-term development.', keys: ['real-estate'] },
  { id: 'governance', name: 'Governance & Public Leadership', line: 'Institutions, accountability and public dialogue.', keys: ['diplomacy', 'ngos'] },
  { id: 'climate', name: 'Environment, Climate & Sustainability', line: 'Energy, water, waste and climate solutions.', keys: [] },
  { id: 'finance', name: 'Finance & Investment', line: 'Capital, investors and responsible finance.', keys: ['investment'] },
  { id: 'agriculture', name: 'Agriculture & Industry', line: 'Food systems, production and manufacturing.', keys: [] },
  { id: 'media', name: 'Media & Creative Industries', line: 'Storytelling, film, art and creative enterprise.', keys: ['media', 'film', 'art'] },
  { id: 'education', name: 'Education & Professional Development', line: 'Skills, training and lifelong learning.', keys: ['education'] },
  { id: 'humanitarian', name: 'Humanitarian & Social Impact', line: 'Organisations improving lives and communities.', keys: ['humanitarian-action', 'ngos', 'health-care'] },
];

export const KNOWLEDGE_TOPICS = [
  'Entrepreneurship', 'Technology and AI', 'Investment and Finance', 'Real Estate and Infrastructure', 'Governance',
  'Environment and Climate', 'Agriculture and Industry', 'Diplomacy and Cooperation', 'Media and Marketing', 'Education and Professional Development',
];

export const KNOWLEDGE_FORMATS = ['Articles', 'Guides', 'Videos', 'Reports', 'Case studies', 'Expert interviews', 'Training materials'];

export const ZONES = [
  { code: 'A', name: 'Business Marketplace', line: 'Businesses showcase products, services and professional solutions.' },
  { code: 'B', name: 'Innovation & Technology', line: 'Technology demonstrations, startups, AI solutions and innovation.' },
  { code: 'C', name: 'Infrastructure & Real Estate', line: 'Infrastructure, construction, real estate and development opportunities.' },
  { code: 'D', name: 'Sustainability & Climate', line: 'Pollution reduction, waste management, energy, water and climate solutions.' },
  { code: 'E', name: 'Knowledge & Skills', line: 'Workshops, practical demonstrations, training and expert learning.' },
  { code: 'F', name: 'Media & Content', line: 'Interviews, reports, live discussions and business storytelling.' },
  { code: 'G', name: 'Partnership Lounge', line: 'Professional meetings and potential business or institutional collaborations.' },
];

export const IMPACT_FOCUS = [
  'Governance and accountability', 'Environmental protection', 'Pollution and waste management', 'Climate solutions',
  'Education and skills', 'Youth entrepreneurship', 'Sustainable infrastructure', 'Community innovation',
];

export const PATHWAYS = [
  { who: 'Individual professionals', next: 'Create a free account, then make your profile public if you want to be found.', label: 'Create an account', href: ROUTES.signUp },
  { who: 'Entrepreneurs & businesses', next: 'Describe your offer on your free member profile, and request marketplace early access.', label: 'Request marketplace access', href: ROUTES.marketplaceEnquiry },
  { who: 'Experts & educators', next: 'Tell us what you teach or advise on. We reply about knowledge contributions and Summit sessions.', label: 'Offer your expertise', href: ROUTES.knowledgeEnquiry },
  { who: 'Investors & partners', next: 'Send an investment or partnership enquiry. A member of the team follows up personally.', label: 'Start a conversation', href: ROUTES.investment },
  { who: 'Institutions & organisations', next: 'Share your mandate and the collaboration you have in mind.', label: 'Institutional enquiry', href: ROUTES.partnership },
  { who: 'Exhibitors & participants', next: 'Enquire about exhibiting. Scope and terms are agreed in writing before anything is confirmed.', label: 'Exhibitor enquiry', href: ROUTES.exhibitor },
];
