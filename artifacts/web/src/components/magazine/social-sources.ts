/**
 * Source-backed audience and social data for Tropik Magazine.
 * Edit ONLY with confirmed, owner-supplied values. Leave `url`/`readers` as null until verified:
 * the UI hides or softens anything that is null. Never insert follower counts that are not measured.
 */
export type SocialChannel = { id: 'instagram' | 'facebook'; name: string; handle: string | null; url: string | null; source: string };

export const SOCIAL: SocialChannel[] = [
  { id: 'instagram', name: 'Instagram', handle: '@tropikagencecom', url: 'https://www.instagram.com/tropikagencecom/', source: 'Tropik Magazine Media Kit 2026' },
  { id: 'facebook', name: 'Facebook', handle: 'Tropik', url: 'https://www.facebook.com/share/19rgZnFamZ/?mibextid=wwXIfr', source: 'Official page link supplied by the Founder' },
];

/** Figures published in the Tropik Magazine Media Kit 2026. Copies and views are not unique readers. */
export const KIT_FIGURES = [
  { value: '5+', label: 'Editions produced' },
  { value: '20+', label: 'Countries of distribution' },
  { value: '20,000+', label: 'Printed copies distributed' },
  { value: '1.4M+', label: 'Monthly digital views' },
];
export const KIT_FIGURES_SOURCE = 'Figures stated in the Tropik Magazine Media Kit 2026. Copies and views are not counts of unique readers.';

/** Measured website readership. Fill when the owner supplies the figure AND its period, e.g. { total: '312,400', period: 'Jan–Jun 2026', source: 'TropikAgency.com analytics' }. */
export const WEBSITE_READERS: { total: string; period: string; source: string } | null = null;
