export type PavilionTheme = { id: string; index: string; title: string; line: string; detail: string[]; category: string };

export const PAVILION_THEMES: PavilionTheme[] = [
  { id: 'culture-heritage', index: '01', title: 'Culture & Heritage', line: 'Living traditions, languages, dress and memory.', detail: ['Heritage objects and textiles', 'Storytelling and oral history', 'Community-led cultural displays'], category: 'cultural-communities' },
  { id: 'arts-music-dance', index: '02', title: 'Arts, Music & Dance', line: 'The sound and movement of a nation.', detail: ['Live music and dance showcases', 'Visual art and installation', 'Artist introductions'], category: 'artists-performers' },
  { id: 'fashion-design', index: '03', title: 'Fashion & Design', line: 'Craft, textile and form as national identity.', detail: ['Textile and design exhibits', 'Craft and artisan presentation', 'Creative-industry exchange'], category: 'creative-industries' },
  { id: 'business-investment', index: '04', title: 'Business & Investment', line: 'Enterprise, trade and the opportunities between.', detail: ['Enterprise and trade presentations', 'Investment conversations', 'Introductions across markets'], category: 'businesses' },
  { id: 'technology-innovation', index: '05', title: 'Technology & Innovation', line: 'What a country is building next.', detail: ['Startup and innovation showcases', 'Digital and research projects', 'Partnerships for growth'], category: 'technology' },
  { id: 'tourism-gastronomy', index: '06', title: 'Tourism & Gastronomy', line: 'Places to visit. Tables to share.', detail: ['Destination storytelling', 'Culinary heritage and tasting', 'Hospitality connections'], category: 'tourism-hospitality' },
  { id: 'education-community', index: '07', title: 'Education & Community Initiatives', line: 'People, learning and the work of care.', detail: ['Community and diaspora initiatives', 'Education and youth projects', 'Humanitarian programmes'], category: 'humanitarian' },
];

export const CULTURAL_EXPERIENCE = [
  'Traditional and contemporary performances',
  'Music and dance',
  'Cultural exhibitions',
  'Fashion and design',
  'Art and craftsmanship',
  'Technology and innovation',
  'Business and investment showcases',
  'Community and humanitarian initiatives',
];

export const PARTNERSHIP_AREAS: { title: string; category?: string; href?: string }[] = [
  { title: 'Institutional partnerships', category: 'public-institutions' },
  { title: 'National pavilion participation', category: 'diplomatic-missions' },
  { title: 'Cultural partnerships', category: 'cultural-communities' },
  { title: 'Business and investment partnerships', category: 'businesses' },
  { title: 'Technology and innovation partnerships', category: 'technology' },
  { title: 'Humanitarian partnerships', category: 'humanitarian' },
  { title: 'Media partnerships', category: 'media' },
  { title: 'Sponsorship opportunities', href: '/join?intent=partnership#institutional-inquiry' },
];
