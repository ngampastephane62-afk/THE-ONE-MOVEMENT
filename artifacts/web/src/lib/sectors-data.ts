/**
 * sectors-data.ts — Typed sector registry for The One Movement International.
 *
 * CONTENT RULES (non-negotiable):
 * - All entries are VERBATIM from the owner specification.
 * - Do not invent sectors, statistics, member counts, organizations, partners,
 *   achievements, or completed collaborations.
 * - Cross-sector examples are POSSIBILITIES, never past accomplishments.
 * - Sector detail pages do not yet exist — surface a "SECTOR PAGE COMING SOON"
 *   chip in UI; never create links to sector slugs.
 */

export type Sector = {
  /** URL-safe identifier */
  slug: string;
  /** Display name — shown in Cinzel (uppercase) */
  name: string;
  /** Short descriptor — one line beneath the name */
  descriptor: string;
  /** What this sector contributes to the Movement — paragraph */
  contributes: string;
  /** Who belongs in this sector — list of member types */
  whoBelongs: string[];
  /** Program display names that this sector connects with (non-link) */
  relatedPrograms: string[];
};

export const SECTORS: Sector[] = [
  {
    slug: 'fashion',
    name: 'Fashion',
    descriptor: 'Design, craft and identity on the world stage',
    contributes:
      'Creativity, craftsmanship and cultural expression that give the Movement its most visible stage.',
    whoBelongs: ['Designers', 'Models', 'Stylists', 'Artisans', 'Creative professionals'],
    relatedPrograms: ['The One Fashion Week International', 'The One Fashion Night'],
  },
  {
    slug: 'music',
    name: 'Music',
    descriptor: 'Sound that crosses every border',
    contributes: 'Performance and sound that unite audiences beyond language.',
    whoBelongs: ['Musicians', 'Performers', 'Producers', 'Cultural organizations'],
    relatedPrograms: ['The One Fashion Night', 'The One Diplomatic Gala'],
  },
  {
    slug: 'dance',
    name: 'Dance',
    descriptor: 'Movement as a universal language',
    contributes: 'Expression through movement that carries culture from stage to stage.',
    whoBelongs: ['Dancers', 'Choreographers', 'Performance companies'],
    relatedPrograms: ['The One Fashion Night', 'The One Fashion Week International'],
  },
  {
    slug: 'film',
    name: 'Film',
    descriptor: 'Stories that travel the world',
    contributes:
      'Stories and documentation that carry the Movement\'s message across the world.',
    whoBelongs: ['Filmmakers', 'Videographers', 'Producers', 'Studios'],
    relatedPrograms: ['The One Awards', 'The One Summit'],
  },
  {
    slug: 'art',
    name: 'Art',
    descriptor: 'Creation without frontiers',
    contributes: 'Visual creation that turns shared values into shared experience.',
    whoBelongs: ['Artists', 'Curators', 'Galleries', 'Cultural institutions'],
    relatedPrograms: ['The One Diplomatic Gala', 'The One Awards'],
  },
  {
    slug: 'business',
    name: 'Business',
    descriptor: 'Enterprise connecting continents',
    contributes:
      'Enterprise and entrepreneurship that convert connection into opportunity and jobs.',
    whoBelongs: ['Entrepreneurs', 'Companies', 'Startups', 'Business leaders'],
    relatedPrograms: ['The One Summit', 'The One Investment Forum'],
  },
  {
    slug: 'investment',
    name: 'Investment',
    descriptor: 'Capital meeting opportunity',
    contributes: 'Capital that helps talent and ideas grow across borders.',
    whoBelongs: ['Investors', 'Funds', 'Business angels', 'Institutions'],
    relatedPrograms: ['The One Investment Forum', 'The One Summit'],
  },
  {
    slug: 'tourism',
    name: 'Tourism',
    descriptor: 'Cultures discovering each other',
    contributes:
      'Travel and hospitality that turn cultural curiosity into real exchange.',
    whoBelongs: [
      'Tourism boards',
      'Hospitality companies',
      'Travel professionals',
    ],
    relatedPrograms: ['The One Summit', 'The One Fashion Night'],
  },
  {
    slug: 'diplomacy',
    name: 'Diplomacy',
    descriptor: 'Dialogue between nations and peoples',
    contributes:
      'Institutional bridges that open doors for culture, business and cooperation.',
    whoBelongs: [
      'Embassies',
      'Governments',
      'International organizations',
      'Diplomats',
    ],
    relatedPrograms: ['The One Diplomatic Gala', 'The One Summit'],
  },
  {
    slug: 'innovation',
    name: 'Innovation',
    descriptor: 'Ideas that change what is possible',
    contributes: 'New ideas and models that expand what the ecosystem can do.',
    whoBelongs: ['Innovators', 'Researchers', 'Startups', 'Universities'],
    relatedPrograms: ['The One Summit', 'The One Investment Forum'],
  },
  {
    slug: 'technology',
    name: 'Technology',
    descriptor: 'Tools for a connected humanity',
    contributes:
      'Digital tools and platforms that keep a global community connected every day.',
    whoBelongs: ['Technology companies', 'Developers', 'Digital creators'],
    relatedPrograms: ['The One Summit', 'The One Investment Forum'],
  },
  {
    slug: 'ngos',
    name: 'NGOs',
    descriptor: 'Organized compassion in action',
    contributes:
      'Organized civil society bringing structure, experience and reach to shared causes.',
    whoBelongs: ['NGOs', 'Foundations', 'Civil society organizations'],
    relatedPrograms: ['The One Diplomatic Gala', 'The One Awards'],
  },
  {
    slug: 'media',
    name: 'Media',
    descriptor: 'Voices that inform the world',
    contributes:
      'Storytelling and coverage that carry the Movement\'s voice to the world.',
    whoBelongs: [
      'Media organizations',
      'Journalists',
      'Content creators',
      'Influencers',
    ],
    relatedPrograms: ['The One Awards', 'The One Fashion Week International'],
  },
  {
    slug: 'education',
    name: 'Education',
    descriptor: 'Knowledge shared across borders',
    contributes:
      'Learning and research that prepare the next generation of global builders.',
    whoBelongs: ['Universities', 'Schools', 'Students', 'Educators'],
    relatedPrograms: ['The One Summit', 'The One Awards'],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    descriptor: 'Sustainable places and communities to live and work',
    contributes: 'Built environments, responsible development and cross-sector collaboration that connect communities and enterprise.',
    whoBelongs: ['Developers', 'Property professionals', 'Architects', 'Urban planners', 'Real estate investors'],
    relatedPrograms: ['The One Summit', 'The One Diplomatic Gala'],
  },
  {
    slug: 'health-care',
    name: 'Health & Care',
    descriptor: 'Well-being and care across communities',
    contributes: 'Health knowledge, care and community well-being through learning, dialogue and responsible collaboration.',
    whoBelongs: ['Healthcare professionals', 'Care organizations', 'Health innovators', 'Community health advocates'],
    relatedPrograms: ['The One Summit', 'The One Awards', 'The One Diplomatic Gala'],
  },
  {
    slug: 'humanitarian-action',
    name: 'Humanitarian Action',
    descriptor: 'Impact where it matters most',
    contributes:
      'Purpose at the center: turning connection into contribution and lives improved.',
    whoBelongs: [
      'Humanitarian organizations',
      'Volunteers',
      'Impact leaders',
    ],
    relatedPrograms: ['The One Awards', 'The One Diplomatic Gala'],
  },
];

export function getSectorBySlug(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
