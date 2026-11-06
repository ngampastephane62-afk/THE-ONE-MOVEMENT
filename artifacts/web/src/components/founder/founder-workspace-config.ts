export type FounderSectionId =
  | 'overview' | 'pages' | 'news' | 'partners' | 'media' | 'programs' | 'members' | 'branding' | 'history' | 'settings';

export type SectionStatus = 'available' | 'partial' | 'unavailable';

export interface FounderTool {
  id: string;
  label: string;
  href: string;
  description: string;
}

export interface FounderSection {
  id: FounderSectionId;
  label: string;
  status: SectionStatus;
  summary: string;
  unavailableNote?: string;
  toolIds: string[];
}

/** Links to existing working founder tools. Admin tabs are allowlisted by the main integration. */
export const FOUNDER_TOOLS: Record<string, FounderTool> = {
  allPeople: { id: 'all-people', label: 'ALL REGISTERED MEMBERS', href: '/member/founder/members', description: 'Every registered account, including private profiles, with details, audit and confirmed administrative actions. The People directory is separate.' },
  allSectors: { id: 'all-sectors', label: 'ALL 17 SECTORS', href: '/member/founder/sectors', description: 'Participants, new members, activity, certifications and reports for each of the 17 sectors.' },
  communityFeed: { id: 'community-feed', label: 'THE ONE FEED', href: '/member', description: 'Publish community updates or choose a sector audience. Private drafts and follower-only visibility remain protected.' },
  businessOpportunities: { id: 'business-opportunities', label: 'BUSINESS OPPORTUNITIES', href: '~/opportunities', description: 'Browse existing opportunities and inquiry routes without changing commercial approvals.' },
  newsEditor: { id: 'news-editor', label: 'News editor', href: '/member/founder/news', description: 'Write private drafts, preview them, and explicitly publish articles to the public News page.' },
  news: { id: 'news', label: 'Press archive', href: '/member/admin?tab=news', description: 'Manage the existing News press archive. This is not full editorial article publishing.' },
  mediaCenter: { id: 'media-management', label: 'MEDIA MANAGEMENT', href: '/member/founder/media', description: 'Create, edit, order, publish, archive and delete press and media publications on the public Media page.' },
  media: { id: 'media', label: 'Media requests', href: '/member/admin?tab=media', description: 'Review incoming media and press requests. This is not a media library.' },
  partnersManager: { id: 'manage-partners', label: 'MANAGE PARTNERS', href: '/member/founder/partners', description: 'Edit partner names, logos, categories, relationships and the public Partners page text.' },
  pagesHome: { id: 'pages-home', label: "PAGE D'ACCUEIL", href: '/member/founder/pages', description: "Modifier les textes, medias, liens, sections et la presentation de la page d'accueil, avec brouillon, apercu et publication confirmee." },
  sitePages: { id: 'site-pages', label: 'TEXTES DU SITE', href: '/member/founder/site-pages', description: 'Edit the text of every public page in seven languages, with private drafts, preview and confirmed publication. Forms and member content are excluded.' },
  tropikEditor: { id: 'tropik-articles', label: 'TROPIK ARTICLES', href: '/member/founder/tropik', description: 'Add and publish Tropik Magazine articles with the News editor: drafts, preview and history. Published articles appear on the Tropik Magazine page.' },
  fashionWeekVideos: { id: 'fashion-week-videos', label: 'FASHION WEEK · PREVIOUS EDITIONS', href: '/member/founder/programs?program=fashion-week', description: 'Upload films from previous Fashion Week editions to the official programme page, with rights, draft and confirmed publication.' },
  programsManager: { id: 'manage-programs', label: 'MANAGE PROGRAMS', href: '/member/founder/programs', description: 'Edit the six official programs: introduction, hero media, nominees, confirmed speakers, videos, categories, announcements, and review program inquiries.' },
  intros: { id: 'intros', label: 'Partner introductions', href: '/member/admin?tab=intros', description: 'Review partner introduction requests. Partner profiles cannot be edited here.' },
  certs: { id: 'certs', label: 'Certifications', href: '/member/admin?tab=certs', description: 'Review official role and programme certification requests.' },
  reports: { id: 'reports', label: 'Moderation reports', href: '/member/admin?tab=reports', description: 'Review member reports and moderation actions.' },
  offers: { id: 'offers', label: 'Humanitarian offers', href: '/member/admin?tab=offers', description: 'Review humanitarian offers submitted by members.' },
  membershipDashboard: { id: 'membershipDashboard', label: 'Membership dashboard', href: '/member/founder/members', description: 'Accounts by profile status, consented daily visit counts and single, confirmed profile reminders.' },
  members: { id: 'members', label: 'Member moderation', href: '/member/admin?tab=members', description: 'Review suspended member accounts and the existing moderation controls. This is not a general profile editor.' },
  gratitude: { id: 'gratitude', label: 'Gratitude campaign moderation', href: '/member/admin?tab=gratitude', description: 'Review contributions and moderation for the existing gratitude campaigns.' },
  magazine: { id: 'magazine', label: 'Magazine proposals', href: '~/tropik-magazine/contribute#founder-review', description: 'Review contributions proposed for Tropik Magazine.' },
};

export const FOUNDER_SECTIONS: FounderSection[] = [
  { id: 'overview', label: 'Command Center', status: 'available', summary: 'One connected community with access to all 17 sectors. Private conversations, private drafts and member visibility choices stay protected.', toolIds: ['membershipDashboard', 'allPeople', 'allSectors', 'communityFeed', 'businessOpportunities', 'mediaCenter', 'reports', 'programsManager', 'fashionWeekVideos', 'pagesHome', 'sitePages', 'tropikEditor', 'newsEditor', 'news', 'partnersManager', 'media', 'intros', 'certs', 'members', 'gratitude', 'offers', 'magazine'] },
  { id: 'pages', label: 'Pages', status: 'available', summary: 'Edit the homepage layout and media, and the text of every public page in seven languages.', toolIds: ['pagesHome', 'sitePages'] },
  { id: 'news', label: 'News & Articles', status: 'available', summary: 'Write, preview and publish News articles. The historical press archive remains a separate tool.', toolIds: ['newsEditor', 'tropikEditor', 'news', 'magazine'] },
  { id: 'partners', label: 'Partners', status: 'available', summary: 'Manage the public partner directory and page text, and review partner introduction requests.', toolIds: ['partnersManager', 'intros'] },
  { id: 'media', label: 'Media Management', status: 'available', summary: 'Publish press coverage, television, interviews and announcements to the public Media page. Media requests remain a separate tool for press enquiries.', toolIds: ['mediaCenter', 'media'] },
  { id: 'programs', label: 'Programs & Events', status: 'available', summary: 'Manage the six official programs, their people, videos and announcements, and review program inquiries.', toolIds: ['programsManager', 'fashionWeekVideos'] },
  { id: 'members', label: 'Members & Moderation', status: 'available', summary: 'Open existing member, report and gratitude moderation tools. These actions remain protected by Founder permissions.', toolIds: ['membershipDashboard', 'members', 'reports', 'gratitude', 'certs'] },
  { id: 'branding', label: 'Branding', status: 'unavailable', summary: 'Logos, colours and brand assets.', unavailableNote: 'Brand management is coming soon.', toolIds: [] },
  { id: 'history', label: 'Publishing History', status: 'unavailable', summary: 'A record of what has been published and when.', unavailableNote: 'Publishing history is not yet available. No history is recorded in this phase.', toolIds: [] },
  { id: 'settings', label: 'Founder Settings', status: 'unavailable', summary: 'Workspace preferences for the Founder.', unavailableNote: 'Founder settings are coming soon. Your account settings remain in member settings.', toolIds: [] },
];

export const PHASE_LABEL = 'Founder Command Center · Private';
