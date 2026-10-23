export type FounderSectionId =
  | 'overview' | 'pages' | 'news' | 'partners' | 'media' | 'programs' | 'branding' | 'history' | 'settings';

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
  newsEditor: { id: 'news-editor', label: 'News editor', href: '/member/founder/news', description: 'Write private drafts, preview them, and explicitly publish articles to the public News page.' },
  news: { id: 'news', label: 'Press archive', href: '/member/admin?tab=news', description: 'Manage the existing News press archive. This is not full editorial article publishing.' },
  mediaCenter: { id: 'media-management', label: 'MEDIA MANAGEMENT', href: '/member/founder/media', description: 'Create, edit, order, publish, archive and delete press and media publications on the public Media page.' },
  media: { id: 'media', label: 'Media requests', href: '/member/admin?tab=media', description: 'Review incoming media and press requests. This is not a media library.' },
  partnersManager: { id: 'manage-partners', label: 'MANAGE PARTNERS', href: '/member/founder/partners', description: 'Edit partner names, logos, categories, relationships and the public Partners page text.' },
  programsManager: { id: 'manage-programs', label: 'MANAGE PROGRAMS', href: '/member/founder/programs', description: 'Edit the six official programs: introduction, hero media, nominees, confirmed speakers, videos, categories, announcements, and review program inquiries.' },
  intros: { id: 'intros', label: 'Partner introductions', href: '/member/admin?tab=intros', description: 'Review partner introduction requests. Partner profiles cannot be edited here.' },
  certs: { id: 'certs', label: 'Certifications', href: '/member/admin?tab=certs', description: 'Review official role and programme certification requests.' },
  reports: { id: 'reports', label: 'Moderation reports', href: '/member/admin?tab=reports', description: 'Review member reports and moderation actions.' },
  offers: { id: 'offers', label: 'Humanitarian offers', href: '/member/admin?tab=offers', description: 'Review humanitarian offers submitted by members.' },
  magazine: { id: 'magazine', label: 'Magazine proposals', href: '~/tropik-magazine/contribute#founder-review', description: 'Review contributions proposed for Tropik Magazine.' },
};

export const FOUNDER_SECTIONS: FounderSection[] = [
  { id: 'overview', label: 'Overview', status: 'available', summary: 'Your workspace foundation and the founder tools available today.', toolIds: ['newsEditor', 'news', 'mediaCenter', 'partnersManager', 'programsManager', 'media', 'intros', 'certs', 'reports', 'offers', 'magazine'] },
  { id: 'pages', label: 'Pages', status: 'unavailable', summary: 'Editing public website pages.', unavailableNote: 'Page editing is not yet available. Public pages are currently updated by the TOMI technical team.', toolIds: [] },
  { id: 'news', label: 'News & Articles', status: 'available', summary: 'Write, preview and publish News articles. The historical press archive remains a separate tool.', toolIds: ['newsEditor', 'news', 'magazine'] },
  { id: 'partners', label: 'Partners', status: 'available', summary: 'Manage the public partner directory and page text, and review partner introduction requests.', toolIds: ['partnersManager', 'intros'] },
  { id: 'media', label: 'Media Management', status: 'available', summary: 'Publish press coverage, television, interviews and announcements to the public Media page. Media requests remain a separate tool for press enquiries.', toolIds: ['mediaCenter', 'media'] },
  { id: 'programs', label: 'Programs & Events', status: 'available', summary: 'Manage the six official programs, their people, videos and announcements, and review program inquiries.', toolIds: ['programsManager'] },
  { id: 'branding', label: 'Branding', status: 'unavailable', summary: 'Logos, colours and brand assets.', unavailableNote: 'Brand management is coming soon.', toolIds: [] },
  { id: 'history', label: 'Publishing History', status: 'unavailable', summary: 'A record of what has been published and when.', unavailableNote: 'Publishing history is not yet available. No history is recorded in this phase.', toolIds: [] },
  { id: 'settings', label: 'Founder Settings', status: 'unavailable', summary: 'Workspace preferences for the Founder.', unavailableNote: 'Founder settings are coming soon. Your account settings remain in member settings.', toolIds: [] },
];

export const PHASE_LABEL = 'Phase A · Workspace foundation';
