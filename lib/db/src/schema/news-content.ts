/** Persisted editorial contract. Runtime validation belongs to the future CMS API. */
export type NewsCategory =
  | "news" | "video-news" | "partnership-announcement"
  | "official-announcement" | "opportunity" | "press-release"
  | "event-announcement" | "humanitarian-update" | "ecosystem-update" | "tropik-article";

export type NewsImageReference = {
  uploadId: string;
  alt: string;
  credit: string | null;
};

export type NewsVideoReference =
  | { kind: "upload"; uploadId: string }
  | { kind: "embed"; provider: "youtube" | "vimeo"; videoId: string };

export type NewsContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; attribution: string | null }
  | { type: "list"; ordered: boolean; items: string[] }
  | (NewsImageReference & { type: "image"; caption: string | null });

export type NewsArticleSnapshotV1 = {
  schemaVersion: 1;
  title: string;
  subtitle: string | null;
  category: NewsCategory;
  cover: NewsImageReference | null;
  video: NewsVideoReference | null;
  body: NewsContentBlock[];
  additionalImages: NewsImageReference[];
  author: string | null;
  publicationDate: string | null;
  relatedPartnerKey: string | null;
  relatedProgrammeSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  mediaRightsConfirmed: boolean;
};
