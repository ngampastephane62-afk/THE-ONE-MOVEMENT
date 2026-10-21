/** UI destinations only. Server-side Founder authorization remains authoritative. */
export const ADMIN_TABS = ['certs', 'reports', 'members', 'media', 'intros', 'news', 'offers', 'gratitude'] as const;
export type AdminTab = typeof ADMIN_TABS[number];

export function adminTabFromSearch(search: string): AdminTab {
  const value = new URLSearchParams(search).get('tab');
  return ADMIN_TABS.find(tab => tab === value) ?? 'certs';
}
