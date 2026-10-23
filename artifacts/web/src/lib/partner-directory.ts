import type { QueryClient } from '@tanstack/react-query';
import {
  getGetPartnerDirectoryQueryKey, getGetAdminPartnerDirectoryQueryKey,
  type PartnerOrganization, type PartnerOrganizationSave, type PartnerPageContent,
} from '@workspace/api-client-react';

export type PartnerCategory = PartnerOrganization['category'];
export type PartnerRelationship = PartnerOrganization['relationship'];
export type PartnerStatus = PartnerOrganization['status'];

export const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  institutions: 'Institutions',
  'corporate-brands': 'Corporate & Brands',
  'culture-creativity': 'Culture & Creativity',
  'media-press': 'Media & Press',
};
export const CATEGORIES = Object.keys(CATEGORY_LABEL) as PartnerCategory[];

export const RELATIONSHIP_LABEL: Record<PartnerRelationship, string> = {
  'historical-collaboration': 'Historical collaboration',
  'media-relationship': 'Media relationship',
  'event-collaborator': 'Event collaborator',
  'current-partner': 'Current partner',
  'institutional-reference': 'Institutional reference',
};
export const RELATIONSHIPS = Object.keys(RELATIONSHIP_LABEL) as PartnerRelationship[];

export const DEFAULT_CONTENT = {
  heroTitle: 'OUR GLOBAL NETWORK.',
  heroLineOne: 'CONNECTED BY PURPOSE.',
  heroLineTwo: 'UNITED BY POSSIBILITY.',
  heroDescription: 'Discover the organizations, brands, media and institutions connected to the journey of The One Movement International.',
  directoryTitle: 'ORGANIZATIONS, IDENTIFIED.',
  directoryDescription: 'Explore the organizations connected to our journey. Each listing identifies its relationship; historical collaboration does not imply a current partnership or endorsement.',
  collaborationTitle: 'BECOME PART OF THE MOVEMENT.',
  collaborationSubtitle: "LET'S BUILD SOMETHING MEANINGFUL.",
  partnershipButton: 'EXPLORE PARTNERSHIP OPPORTUNITIES',
  conversationButton: 'START A CONVERSATION',
  displayNote: 'Historical relationships were confirmed by the Founder. Each emblem refers only to the named organization and the stated relationship, not to endorsement of the entire TOMI platform. New listings require verification before publication.',
};
export type ContentForm = typeof DEFAULT_CONTENT;
export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT) as (keyof ContentForm)[];
export const CONTENT_MAX: Record<keyof ContentForm, number> = {
  heroTitle: 160, heroLineOne: 160, heroLineTwo: 160, heroDescription: 1500, directoryTitle: 160, directoryDescription: 1500,
  collaborationTitle: 160, collaborationSubtitle: 160, partnershipButton: 160, conversationButton: 160, displayNote: 1500,
};

/** Merge server content with defaults so empty fields never blank the page. */
export function mergeContent(c?: Partial<PartnerPageContent> | null): ContentForm {
  const out = { ...DEFAULT_CONTENT };
  if (c) for (const k of CONTENT_KEYS) { const v = (c as Record<string, unknown>)[k]; if (typeof v === 'string' && v.trim()) out[k] = v; }
  return out;
}
export function contentForm(c?: Partial<PartnerPageContent> | null): ContentForm {
  const out = { ...DEFAULT_CONTENT };
  if (c) for (const k of CONTENT_KEYS) { const v = (c as Record<string, unknown>)[k]; if (typeof v === 'string') out[k] = v; }
  return out;
}

export function safeHttpUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  try { const u = new URL(v); return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password && u.hostname.includes('.') ? u.href : null; } catch { return null; }
}

export interface PartnerForm {
  name: string; description: string; website: string;
  category: PartnerCategory; relationship: PartnerRelationship;
  priority: string; relationshipVerified: boolean; rightsConfirmed: boolean;
  logoUploadId: string | null; legacyLogoId: number | null;
}
export function emptyPartnerForm(): PartnerForm {
  return { name: '', description: '', website: '', category: 'institutions', relationship: 'historical-collaboration', priority: '100', relationshipVerified: false, rightsConfirmed: false, logoUploadId: null, legacyLogoId: null };
}
export function partnerFormFrom(p: PartnerOrganization): PartnerForm {
  return {
    name: p.name ?? '', description: p.description ?? '', website: p.website ?? '',
    category: p.category, relationship: p.relationship, priority: String(p.priority ?? 0),
    relationshipVerified: !!p.relationshipVerified, rightsConfirmed: !!p.rightsConfirmed,
    logoUploadId: p.logoUploadId ?? null, legacyLogoId: p.legacyLogoId ?? null,
  };
}
export function partnerIssues(f: PartnerForm, status: PartnerStatus, hasLogo: boolean): string[] {
  const out: string[] = [];
  const n = f.name.trim();
  if (n.length < 2 || n.length > 200) out.push('Official name must be 2 to 200 characters.');
  else if (['bank', 'banking'].includes(n.toLowerCase().replace(/[^a-z0-9]+/g, ''))) out.push('Enter an identifiable organization name, not the Banking placeholder.');
  if (f.description.length > 2000) out.push('Description must be 2000 characters or fewer.');
  if (f.website.trim() && (!safeHttpUrl(f.website.trim()) || f.website.length > 2000)) out.push('Website must be a full http(s):// address without credentials, under 2000 characters.');
  if (f.logoUploadId && !f.rightsConfirmed) out.push('Confirm logo display rights before saving an uploaded logo.');
  const p = Number(f.priority);
  if (f.priority.trim() === '' || !Number.isInteger(p) || p < 0 || p > 100000) out.push('Display order must be a whole number from 0 to 100000.');
  if (status === 'published') {
    if (!hasLogo) out.push('A logo is required to publish.');
    if (!f.relationshipVerified) out.push('Confirm the relationship has been verified before publishing.');
    if (!f.rightsConfirmed) out.push('Confirm logo display rights before publishing.');
  }
  return out;
}
export function toPartnerSave(f: PartnerForm, status: PartnerStatus, expectedUpdatedAt: string | null): PartnerOrganizationSave {
  return {
    name: f.name.trim(), description: f.description.trim(), website: f.website.trim(),
    category: f.category, relationship: f.relationship, status, priority: Number(f.priority),
    relationshipVerified: f.relationshipVerified, rightsConfirmed: f.rightsConfirmed,
    logoUploadId: f.logoUploadId, legacyLogoId: f.legacyLogoId, expectedUpdatedAt,
  } as PartnerOrganizationSave;
}

export function invalidatePartners(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: getGetPartnerDirectoryQueryKey() });
  qc.invalidateQueries({ queryKey: getGetAdminPartnerDirectoryQueryKey() });
}

export function partnerErr(e: unknown, fallback = 'Not saved. Your edits are kept; please try again.') {
  const x = e as { status?: number; data?: { error?: unknown; code?: unknown } | null } | null;
  const d = x?.data?.error;
  const msg = typeof d === 'string' ? d : '';
  if (x?.status === 409) {
    if (/duplicate|already exists|same name/i.test(msg) || x?.data?.code === 'duplicate') return `An organization with this name already exists in the directory. Edit the existing entry instead of creating a duplicate.${msg ? ' (' + msg + ')' : ''}`;
    return 'This record changed elsewhere. Your edits are kept here; reload the list to get the latest version before saving again.';
  }
  if (x?.status === 403 || x?.status === 401) return 'Founder access is required for this action.';
  if (x?.status === 400 && msg) return msg;
  return msg || fallback;
}
