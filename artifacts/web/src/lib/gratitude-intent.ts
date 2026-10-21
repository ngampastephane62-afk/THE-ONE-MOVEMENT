export type GratitudeIntent = 'text' | 'video';

/** Closed allow-list: a campaign return destination, never an arbitrary redirect URL. */
export function gratitudeIntent(search: string, key = 'intent'): GratitudeIntent | null {
  const value = new URLSearchParams(search).get(key);
  return value === 'text' || value === 'video' ? value : null;
}

export function gratitudeMemberPath(intent: GratitudeIntent) {
  return `/member/thanks-the-world?intent=${intent}`;
}
