import { getGetFounderCommandCenterQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';

export const POLL = 30_000;
export const overviewOpts = () => ({ query: { queryKey: getGetFounderCommandCenterQueryKey(), refetchInterval: POLL } });

export const TOTAL_LABELS: Record<string, { label: string; note: string }> = {
  accounts: { label: 'Registered accounts', note: 'All accounts in the sign-in service for this environment.' },
  verified: { label: 'Email verified', note: 'Accounts with a verified email address.' },
  unverified: { label: 'Email unverified', note: 'Accounts without a verified email address.' },
  noProfile: { label: 'No profile', note: 'Account exists, no member profile saved.' },
  incomplete: { label: 'Incomplete profiles', note: 'Profile saved but essentials missing. Excludes accounts with no profile.' },
  complete: { label: 'Complete profiles', note: 'All profile essentials saved. Directory listing is separate.' },
  active: { label: 'Signed in · 30 days', note: 'Signed in during the last 30 days. Not the People listing.' },
  discoverable: { label: 'Listed in People', note: 'Opted into the member directory. Counted separately from activity.' },
  newMembers: { label: 'New · 7 days', note: 'Accounts created in the last 7 days.' },
  suspended: { label: 'Suspended', note: 'Accounts currently suspended.' },
  posts: { label: 'Community posts', note: 'Visible community and sector posts. Excludes hidden posts, drafts and follower-only posts.' },
  pendingCertifications: { label: 'Pending certifications', note: 'Official role applications awaiting review.' },
  pendingReports: { label: 'Open reports', note: 'Moderation reports awaiting review.' },
  mediaInquiries: { label: 'Media inquiries', note: 'Institutional press and media requests only.' },
  commercialApplications: { label: 'Company applications', note: 'Business listings pending review.' },
  administrativeRequests: { label: 'Join requests', note: 'Pending interest submissions from the Join page.' },
};
export const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase());
export const totalLabel = (k: string) => TOTAL_LABELS[k] ?? { label: humanize(k), note: 'Server-reported figure.' };

export const KIND_LABELS: Record<string, string> = {
  registration: 'New registrations', email_verified: 'Email verified', profile_complete: 'Profile completed',
  certification: 'Certification applications', report: 'Moderation reports', request: 'Member requests', service_reply: 'Replies to administration',
};

export const sectorName = (slug: string) => SECTORS.find((s) => s.slug === slug)?.name ?? humanize(slug);
export const fmt = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
export const num = (x: number) => x.toLocaleString();
export const rid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Review destinations for alerts without a member target. Only existing tools; null when none exists. */
export function alertHref(kind: string, detail: Record<string, unknown>): string | null {
  if (kind === 'report') return '/member/admin?tab=reports';
  if (kind === 'certification') return '/member/admin?tab=certs';
  if (kind === 'request' && detail.source === 'inquiry') return '/member/admin?tab=media';
  return null;
}
