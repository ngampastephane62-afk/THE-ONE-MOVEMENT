/**
 * Curated, owner-requested editorial News items with their own media.
 * Separate from the press-archive CMS and from lib/news-data (PhotoSlot-based).
 */
export interface EditorialVideoNews {
  slug: string;
  kicker: string;
  title: string;
  standfirst: string;
  publishedAt: string; // editorial publication date, not the filming date
  source: { name: string; url: string; handle: string };
  video: { id: string; src: string; poster: string; label: string; durationLabel: string; width: number; height: number };
  credit: string;
  body: { heading?: string; paragraphs: string[] }[];
}

const asset = (f: string) => `${import.meta.env.BASE_URL}api/editorial/assets/${f}`;

export const PINK_OCTOBER: EditorialVideoNews = {
  slug: 'pink-october-burj-khalifa',
  kicker: 'EMAAR · Announcement',
  title: 'EMAAR October Rose Showcase',
  standfirst:
    'The Burj Khalifa lights up in pink for Pink October. An announcement from EMAAR, available on its official page.',
  publishedAt: '2026-10-16',
  source: { name: 'EMAAR', url: 'https://www.instagram.com/emaardubai/', handle: '@emaardubai' },
  video: {
    id: 'pink-october-burj-khalifa',
    src: asset('pink-october-burj-khalifa.mp4'),
    poster: asset('pink-october-burj-khalifa.webp'),
    label: 'Burj Khalifa illuminated with a pink ribbon above the Dubai skyline, Pink October awareness',
    durationLabel: '1 min 20 s',
    width: 720,
    height: 1280,
  },
  credit: 'Source: EMAAR',
  body: [
    {
      paragraphs: [
        'EMAAR presents a pink-light showcase at the Burj Khalifa for Pink October, featuring the breast-cancer awareness ribbon on the tower.',
        'This announcement is shared for information. Visit EMAAR’s official page to see its updates.',
      ],
    },
  ],
};

export const EDITORIAL_VIDEO_NEWS: EditorialVideoNews[] = [PINK_OCTOBER];

export const getEditorialVideoNews = (slug: string) => EDITORIAL_VIDEO_NEWS.find((n) => n.slug === slug);

export function formatNewsDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
