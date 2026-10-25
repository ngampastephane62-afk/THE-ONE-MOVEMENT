/** Stable homepage sections. Editorial documents preserve the supplied homepage by default. */
export const HOME_SECTION_KEYS = ['hero', 'universe', 'programmes', 'movement', 'origin', 'archive', 'paths', 'join', 'custom'] as const;
export type HomeSectionKey = typeof HOME_SECTION_KEYS[number];
export interface HomeMedia {
  key: string;
  uploadId: string;
  kind: 'image' | 'video';
  url: string | null;
  alt: string;
  credit: string;
  rightsConfirmed: boolean;
}
export interface HomeSection {
  id: string;
  type: HomeSectionKey;
  enabled: boolean;
  layout: 'original' | 'stack' | 'media-left' | 'media-right';
  theme: 'original' | 'ivory' | 'lagoon';
  alignment: 'left' | 'center';
  spacing: 'compact' | 'normal' | 'large';
  fields: Record<string, string>;
  media: HomeMedia[];
}
export interface HomeEditorial {
  updatedAt: string | null;
  status: 'draft' | 'published';
  sections: HomeSection[];
}
export function defaultHomeEditorial(): HomeEditorial {
  return {
    updatedAt: null, status: 'published',
    sections: HOME_SECTION_KEYS.filter(type => type !== 'custom').map(type => ({
      id: type, type, enabled: true, layout: 'original', theme: 'original',
      alignment: 'left', spacing: 'normal', fields: {}, media: [],
    })),
  };
}
