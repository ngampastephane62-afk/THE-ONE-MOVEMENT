/**
 * world-config.ts: pure configuration for the seventeen TOMI living worlds.
 * Editorial orientation copy only. No members, partners, statistics, courses
 * or opportunities are invented here; real records live on existing routes.
 */
import { SECTORS } from '@/lib/sectors-data';

export type WorldMotif =
  | 'runway' | 'sound' | 'ribbon' | 'reel' | 'gallery' | 'network' | 'growth' | 'horizon'
  | 'table' | 'orbit' | 'circuit' | 'circle' | 'broadcast' | 'pages' | 'skyline' | 'pulse' | 'shelter';

export interface WorldConfig {
  slug: string;
  motif: WorldMotif;
  /** Space-separated HSL accent derived from the lagoon/gold/coral family. */
  accent: string;
  headline: [string, string, string];
  intro: string;
  discover: { k: string; t: string; d: string }[];
  learn: { t: string; d: string }[];
}

export const WORLD_CHAPTERS = [
  { id: 'discover', label: 'Discover' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'professions', label: 'Professions' },
  { id: 'learn', label: 'Learn & grow' },
  { id: 'join', label: 'Join' },
  { id: 'share', label: 'Share' },
] as const;

export const WORLD_CONFIG: Record<string, WorldConfig> = {
  fashion: { slug: 'fashion', motif: 'runway', accent: '19 72% 60%', headline: ['The runway is a', 'conversation', 'between cultures.'],
    intro: 'Designers, models, stylists and artisans turn textile, craft and identity into a language the world can read.',
    discover: [{ k: 'Runway', t: 'Collections in motion', d: 'A show is an argument made in cloth, light and pace.' }, { k: 'Textiles', t: 'Craft that carries memory', d: 'Weaves, dyes and patterns hold the history of the places that made them.' }, { k: 'Studio', t: 'Where ideas are cut', d: 'Pattern-making, fittings and the slow work behind every look.' }],
    learn: [{ t: 'Building a collection', d: 'From concept and research to range planning and presentation.' }, { t: 'Craft and sourcing', d: 'Working respectfully with artisans and materials.' }, { t: 'Presenting your work', d: 'Lookbooks, portfolios and the language of a brand.' }] },
  music: { slug: 'music', motif: 'sound', accent: '43 80% 73%', headline: ['Sound arrives', 'before', 'translation.'],
    intro: 'Musicians, performers and producers carry rhythm across borders long before words do.',
    discover: [{ k: 'Stage', t: 'The live room', d: 'Concerts turn strangers into an audience that breathes together.' }, { k: 'Studio', t: 'The recorded idea', d: 'Arrangement, production and the patience of the mix.' }, { k: 'Heritage', t: 'Instruments with lineage', d: 'Every tradition brings its own tuning, scale and story.' }],
    learn: [{ t: 'Performance practice', d: 'Preparing a set, reading a room, working with a crew.' }, { t: 'Production basics', d: 'How recording, editing and mixing shape a track.' }, { t: 'Rights and releases', d: 'Orientation on authorship and distribution. Not legal advice.' }] },
  dance: { slug: 'dance', motif: 'ribbon', accent: '350 55% 68%', headline: ['A body in motion', 'speaks', 'every language.'],
    intro: 'Dancers and choreographers carry culture from stage to stage through movement alone.',
    discover: [{ k: 'Choreography', t: 'Composing with bodies', d: 'Space, timing and gesture arranged into meaning.' }, { k: 'Traditions', t: 'Many dance cultures', d: 'Each form keeps its own history and community, to be learned on its own terms.' }, { k: 'Performance', t: 'The shared moment', d: 'Companies, festivals and the discipline of rehearsal.' }],
    learn: [{ t: 'Technique and care', d: 'Training sustainably and protecting the body.' }, { t: 'Making new work', d: 'From improvisation to a finished piece.' }, { t: 'Touring and collaboration', d: 'Working with music, fashion and film partners.' }] },
  film: { slug: 'film', motif: 'reel', accent: '39 52% 54%', headline: ['Every frame', 'carries', 'a world.'],
    intro: 'Filmmakers, producers and studios document and imagine, carrying stories further than any of us can travel.',
    discover: [{ k: 'Story', t: 'Documentary and fiction', d: 'Both begin with listening closely to people and place.' }, { k: 'Craft', t: 'Image and sound', d: 'Camera, light, edit and score working as one.' }, { k: 'Distribution', t: 'Reaching audiences', d: 'Festivals, broadcasters and platforms each open different doors.' }],
    learn: [{ t: 'Development', d: 'Treatments, research and consent from contributors.' }, { t: 'Production', d: 'Crews, schedules and responsible filming.' }, { t: 'Post and release', d: 'Editing, credits and honest attribution.' }] },
  art: { slug: 'art', motif: 'gallery', accent: '19 65% 58%', headline: ['A wall, a light,', 'and a', 'question.'],
    intro: 'Artists, curators and galleries turn shared values into shared experience.',
    discover: [{ k: 'Painting', t: 'Surface and gesture', d: 'One of the oldest ways to record what we see and believe.' }, { k: 'Sculpture', t: 'Form in space', d: 'Work you walk around, and that changes as you move.' }, { k: 'Digital', t: 'New media, old questions', d: 'Screens and code as materials for contemporary art.' }],
    learn: [{ t: 'Curating', d: 'Building an exhibition and the story it tells.' }, { t: 'Documenting work', d: 'Photographing, captioning and archiving a practice.' }, { t: 'Showing internationally', d: 'Residencies, loans and cultural exchange.' }] },
  business: { slug: 'business', motif: 'network', accent: '189 62% 45%', headline: ['Connection', 'becomes', 'enterprise.'],
    intro: 'Entrepreneurs and companies convert relationships across continents into work and opportunity.',
    discover: [{ k: 'Ventures', t: 'Starting something', d: 'Ideas tested with real customers in real markets.' }, { k: 'Collaboration', t: 'Across sectors', d: 'Designers with investors, tourism with media, culture with commerce.' }, { k: 'Leadership', t: 'Teams that last', d: 'Culture, governance and responsibility.' }],
    learn: [{ t: 'From idea to offer', d: 'Defining what you sell and to whom.' }, { t: 'Working across borders', d: 'Culture, language and trust in partnerships.' }, { t: 'Responsible growth', d: 'Building jobs and value that stay local.' }] },
  investment: { slug: 'investment', motif: 'growth', accent: '43 70% 60%', headline: ['Capital is', 'a long', 'conversation.'],
    intro: 'Investors, funds and institutions help talent and ideas grow. Orientation only, never financial advice.',
    discover: [{ k: 'Projects', t: 'Ideas seeking support', d: 'Every serious project starts with a clear plan and honest numbers.' }, { k: 'Development', t: 'Economies that grow', d: 'Long horizons, local partners and shared benefit.' }, { k: 'Diligence', t: 'Trust, verified', d: 'Nothing on TOMI replaces your own independent due diligence.' }],
    learn: [{ t: 'Investment basics', d: 'Risk, horizon and return explained plainly.' }, { t: 'Impact considerations', d: 'Measuring more than financial outcomes.' }, { t: 'Preparing a pitch', d: 'What founders should be ready to show.' }] },
  tourism: { slug: 'tourism', motif: 'horizon', accent: '28 70% 62%', headline: ['Travel is how', 'cultures', 'meet.'],
    intro: 'Tourism boards, hospitality and travel professionals turn curiosity into real exchange.',
    discover: [{ k: 'Destinations', t: 'Landscapes and cities', d: 'Places best understood through the people who live there.' }, { k: 'Heritage', t: 'Architecture and memory', d: 'Sites that carry centuries of craft.' }, { k: 'Hospitality', t: 'The art of welcome', d: 'Service as a cultural practice.' }],
    learn: [{ t: 'Responsible travel', d: 'Benefiting host communities and environments.' }, { t: 'Destination storytelling', d: 'Presenting a place without stereotypes.' }, { t: 'Hospitality careers', d: 'The many roles behind a good stay.' }] },
  diplomacy: { slug: 'diplomacy', motif: 'table', accent: '200 40% 75%', headline: ['Peace is built', 'one', 'conversation at a time.'],
    intro: 'Embassies, institutions and diplomats open doors for culture, business and cooperation.',
    discover: [{ k: 'Dialogue', t: 'Around the table', d: 'Listening first, across languages and positions.' }, { k: 'Cultural diplomacy', t: 'Soft bridges', d: 'Art, music and fashion as channels between nations.' }, { k: 'Cooperation', t: 'Shared agendas', d: 'Frameworks such as the Sustainable Development Goals.' }],
    learn: [{ t: 'How institutions work', d: 'Roles of embassies and international organisations.' }, { t: 'Protocol and respect', d: 'The courtesies that make dialogue possible.' }, { t: 'Cultural exchange', d: 'Designing programmes that honour every side.' }] },
  innovation: { slug: 'innovation', motif: 'orbit', accent: '50 85% 65%', headline: ['What if', 'is the first', 'line of every invention.'],
    intro: 'Innovators, researchers and universities expand what the ecosystem can do.',
    discover: [{ k: 'Discovery', t: 'Science in progress', d: 'Questions asked carefully and tested honestly.' }, { k: 'Invention', t: 'Prototypes', d: 'Small experiments before big claims.' }, { k: 'Exchange', t: 'Ideas that travel', d: 'The best solutions often come from another field.' }],
    learn: [{ t: 'Design thinking', d: 'Understanding a problem before solving it.' }, { t: 'From lab to life', d: 'How research becomes products and services.' }, { t: 'Ethics of innovation', d: 'Who benefits, who is affected.' }] },
  technology: { slug: 'technology', motif: 'circuit', accent: '185 70% 55%', headline: ['Tools for a', 'connected', 'humanity.'],
    intro: 'Developers, technology companies and digital creators keep a global community connected every day.',
    discover: [{ k: 'Artificial intelligence', t: 'Learning machines', d: 'Powerful tools that need human judgement around them.' }, { k: 'Digital systems', t: 'Platforms and code', d: 'The infrastructure behind everyday connection.' }, { k: 'Future industries', t: 'What comes next', d: 'New roles appearing faster than job titles.' }],
    learn: [{ t: 'Learning artificial intelligence', d: 'Core concepts, limits and responsible use.' }, { t: 'Building for the web', d: 'Accessibility, privacy and performance.' }, { t: 'Digital creativity', d: 'Code as a creative medium.' }] },
  ngos: { slug: 'ngos', motif: 'circle', accent: '150 35% 60%', headline: ['Organised', 'compassion', 'in action.'],
    intro: 'NGOs, foundations and civil society bring structure, experience and reach to shared causes.',
    discover: [{ k: 'Communities', t: 'Close to the ground', d: 'Change led with, not for, the people affected.' }, { k: 'Civil society', t: 'Many voices', d: 'Associations that hold memory and trust.' }, { k: 'Missions', t: 'Shared causes', d: 'Health, education, culture and dignity.' }],
    learn: [{ t: 'Programme design', d: 'Needs, goals and honest evaluation.' }, { t: 'Partnerships', d: 'Working with institutions and companies transparently.' }, { t: 'Safeguarding', d: 'Protecting the people you serve.' }] },
  media: { slug: 'media', motif: 'broadcast', accent: '10 60% 62%', headline: ['Voices that', 'inform', 'the world.'],
    intro: 'Journalists, publishers, podcasters and creators carry stories to audiences everywhere.',
    discover: [{ k: 'Journalism', t: 'Reporting with care', d: 'Verification before amplification.' }, { k: 'Podcasts', t: 'The intimate medium', d: 'Long conversations that build trust.' }, { k: 'Publishing', t: 'Print and digital', d: 'Magazines and editorial that last beyond the feed.' }],
    learn: [{ t: 'Sourcing and attribution', d: 'Crediting work and people correctly.' }, { t: 'Broadcast basics', d: 'Formats, interviews and editing.' }, { t: 'Building an audience', d: 'Consistency, honesty and community.' }] },
  education: { slug: 'education', motif: 'pages', accent: '38 60% 70%', headline: ['Knowledge,', 'shared across', 'borders.'],
    intro: 'Universities, schools, educators and students prepare the next generation of global builders.',
    discover: [{ k: 'Universities', t: 'Research and teaching', d: 'Places where questions become disciplines.' }, { k: 'Learning', t: 'For every age', d: 'From the classroom to lifelong learning.' }, { k: 'Exchange', t: 'Study across cultures', d: 'Mobility that changes how people see the world.' }],
    learn: [{ t: 'Finding your path', d: 'Choosing studies that match your purpose.' }, { t: 'Teaching well', d: 'Inclusive classrooms and new tools.' }, { t: 'Open knowledge', d: 'Public resources anyone can use.' }] },
  'real-estate': { slug: 'real-estate', motif: 'skyline', accent: '39 52% 54%', headline: ['The city is a', 'shared', 'drawing.'],
    intro: 'Architects, agents, developers and investors shape where humanity lives and works.',
    discover: [], learn: [] },
  'health-care': { slug: 'health-care', motif: 'pulse', accent: '165 45% 58%', headline: ['Care is', 'the quietest', 'form of culture.'],
    intro: 'Health professionals, care organisations and advocates support well-being across communities. Editorial content, never medical advice.',
    discover: [{ k: 'Wellbeing', t: 'Body and mind', d: 'Health shaped by community, environment and dignity.' }, { k: 'Care', t: 'The human work', d: 'Nurses, carers and families at the centre.' }, { k: 'Medical innovation', t: 'New tools', d: 'Progress that must reach everyone, not only some.' }],
    learn: [{ t: 'Community health', d: 'Prevention and access explained.' }, { t: 'Careers in care', d: 'The many professions behind a healthy society.' }, { t: 'Trusted information', d: 'Official public sources first.' }] },
  'humanitarian-action': { slug: 'humanitarian-action', motif: 'shelter', accent: '15 65% 62%', headline: ['Dignity,', 'resilience,', 'solidarity.'],
    intro: 'Humanitarian organisations, volunteers and impact leaders turn connection into contribution.',
    discover: [{ k: 'Dignity', t: 'People first', d: 'Every response begins with respect for those affected.' }, { k: 'Resilience', t: 'Communities rebuilding', d: 'Local leadership after crisis.' }, { k: 'Solidarity', t: 'Across borders', d: 'Support that travels where it is needed.' }],
    learn: [{ t: 'Humanitarian principles', d: 'Humanity, neutrality, impartiality, independence.' }, { t: 'Volunteering well', d: 'Preparation, humility and safety.' }, { t: 'Coordination', d: 'Working with official humanitarian channels.' }] },
};

/**
 * Existing Founder-archive photographs (assets/media/founder/catalog.json) that genuinely depict
 * this sector's activity at TOMI. Only sectors with a contextually correct archive photo are listed;
 * every other world keeps its illustrative motif until approved sector photography is supplied.
 */
export const WORLD_ARCHIVE_PHOTO: Partial<Record<string, { id: 'runway-edition-five' | 'community-outreach' | 'diplomatic-encounter' | 'summit-goma'; note: string }>> = {
  fashion: { id: 'runway-edition-five', note: 'Founder archive · The One Fashion Week, fifth edition. A record of a past TOMI event.' },
  'humanitarian-action': { id: 'community-outreach', note: 'Founder archive · previous TOMI community outreach. Dates and places are not asserted.' },
  diplomacy: { id: 'diplomatic-encounter', note: 'Founder archive · official meeting with the Ambassador of the DRC to the UAE, Abu Dhabi. Not a partnership claim beyond this meeting.' },
};

export function getWorldConfig(slug: string): WorldConfig | undefined {
  return WORLD_CONFIG[slug];
}

/** Every registered sector has a world configuration. */
export const WORLD_SLUGS = SECTORS.map((s) => s.slug).filter((s) => s in WORLD_CONFIG);
