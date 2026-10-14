export interface EcosystemResource {
  id: string;
  organization: string;
  title: string;
  description: string;
  url: string;
  sectors: string[];
  kind: 'Global framework' | 'Official programme resources' | 'Knowledge hub';
  checkedOn: string;
}

// Curated summaries of official public pages, not a live feed or a claim that
// every UN-system agency listed here is a separate contracted TOMI partner.
export const ECOSYSTEM_RESOURCES: EcosystemResource[] = [
  {
    id: 'sdgs',
    organization: 'United Nations · UN DESA',
    title: 'The 17 Sustainable Development Goals',
    description: 'Explore the goals, targets and official resources connecting people, prosperity, planet, peace and partnerships.',
    url: 'https://sdgs.un.org/goals',
    sectors: ['diplomacy', 'ngos', 'humanitarian-action', 'education', 'investment', 'business', 'innovation', 'technology', 'real-estate', 'health-care'],
    kind: 'Global framework',
    checkedOn: '2026-10-14',
  },
  {
    id: 'unesco-culture',
    organization: 'UNESCO',
    title: 'Culture, heritage and creativity',
    description: 'Discover UNESCO’s work to safeguard heritage, support creative sectors and foster intercultural dialogue.',
    url: 'https://www.unesco.org/en/culture',
    sectors: ['fashion', 'music', 'dance', 'film', 'art', 'tourism', 'education', 'media', 'diplomacy'],
    kind: 'Official programme resources',
    checkedOn: '2026-10-14',
  },
  {
    id: 'who-health',
    organization: 'World Health Organization',
    title: 'Health and well-being knowledge',
    description: 'Browse official health-topic resources for learning about public health, care and well-being. Not a substitute for medical advice.',
    url: 'https://www.who.int/health-topics',
    sectors: ['health-care', 'humanitarian-action', 'ngos', 'education', 'innovation'],
    kind: 'Knowledge hub',
    checkedOn: '2026-10-14',
  },
  {
    id: 'ocha-humanitarian',
    organization: 'United Nations OCHA',
    title: 'Humanitarian coordination and information',
    description: 'Learn how OCHA coordinates aid, shares humanitarian information and advocates for crisis-affected communities.',
    url: 'https://www.unocha.org/',
    sectors: ['humanitarian-action', 'ngos', 'diplomacy', 'health-care', 'media'],
    kind: 'Official programme resources',
    checkedOn: '2026-10-14',
  },
  {
    id: 'global-compact',
    organization: 'United Nations Global Compact',
    title: 'The Ten Principles for responsible business',
    description: 'A principles-based approach to human rights, labour, the environment and anti-corruption for responsible enterprise.',
    url: 'https://unglobalcompact.org/what-is-gc/mission/principles',
    sectors: ['business', 'investment', 'real-estate', 'technology', 'innovation', 'tourism'],
    kind: 'Global framework',
    checkedOn: '2026-10-14',
  },
];

export const ECOSYSTEM_PERSONAS = [
  { id: 'creative', label: 'Artist, musician or designer', sectors: ['art', 'music', 'fashion', 'dance', 'film', 'media'] },
  { id: 'business', label: 'Business or entrepreneur', sectors: ['business', 'technology', 'innovation', 'tourism'] },
  { id: 'investor', label: 'Investor or real estate', sectors: ['investment', 'real-estate', 'business'] },
  { id: 'health', label: 'Health & care professional', sectors: ['health-care', 'humanitarian-action', 'innovation'] },
  { id: 'institution', label: 'Institution, NGO or diplomacy', sectors: ['diplomacy', 'ngos', 'humanitarian-action', 'education'] },
] as const;
