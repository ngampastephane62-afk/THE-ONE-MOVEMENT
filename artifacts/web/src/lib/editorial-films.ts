/**
 * Curated archive. Unpublishing changes visibility, never media bytes or the
 * long-lived engagement identity. Archived metadata is retained for the Founder.
 */
export interface EditorialFilm {
  id: string;
  name: string;
  title: string;
  description: string;
  file: string;
  poster: string;
  duration: string;
  width: number;
  height: number;
  credit: string;
  status: 'published' | 'archived';
}

export const AWARENESS_FILM: EditorialFilm = {
  id: 'canal', // Existing anchor, not a broadcaster attribution.
  name: 'PEACE & UNITY · AWARENESS CAMPAIGN',
  title: 'UNITED AGAINST HATE SPEECH & DISINFORMATION',
  description: 'An awareness campaign developed with MONUSCO, the United Nations peacekeeping mission in the Democratic Republic of Congo, promoting peace, unity and the fight against disinformation and hate speech.',
  file: 'documentary-teaser-03.mp4',
  poster: 'documentary-teaser-03.webp',
  duration: '29 s',
  width: 1280,
  height: 678,
  credit: 'Awareness campaign on peace, unity, disinformation and hate speech.',
  status: 'published',
};

export const EDITORIAL_FILM_ARCHIVE: readonly EditorialFilm[] = [
  AWARENESS_FILM,
  {
    id: 'archive-01', name: 'CANAL+ · 02',
    title: 'The One Documentaire · Teaser 02',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-01.mp4', poster: 'documentary-teaser-01.webp',
    duration: '1 min 16 s', width: 480, height: 848,
    credit: 'Founder archive · Documentary excerpt, not the complete film.',
    status: 'archived',
  },
  {
    id: 'archive-02', name: 'CANAL+ · 03',
    title: 'The One Documentaire · Teaser 03',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-02.mp4', poster: 'documentary-teaser-02.webp',
    duration: '7 s', width: 1280, height: 720,
    credit: 'Founder archive · Documentary excerpt, not the complete film.',
    status: 'archived',
  },
  {
    id: 'tv5monde', name: 'TV5MONDE Afrique · France 24',
    title: 'The One Fashion Week, on international television.',
    description: 'A television archive of The One Fashion Week, supplied by the Founder.',
    file: 'fashion-week-tv5.mp4', poster: 'fashion-week-tv5-runway.webp',
    duration: '1 min 26 s', width: 1280, height: 720,
    credit: 'Visible broadcaster credits: TV5MONDE Afrique · France 24. Archive supplied by the Founder.',
    status: 'published',
  },
  {
    id: 'archive-04', name: 'THE ONE DOCUMENTAIRE · 04',
    title: 'Documentary highlight 04',
    description: 'More documentary highlights supplied by the Founder, available here in the same collection.',
    file: 'documentary-teaser-04.mp4', poster: 'documentary-teaser-04.webp',
    duration: '1 min 01 s', width: 720, height: 1280,
    credit: 'Founder archive · Documentary excerpt, not the complete film.',
    status: 'archived',
  },
  {
    id: 'radio-okapi', name: 'RADIO OKAPI',
    title: 'Radio Okapi · Film archive',
    description: 'A separate film from the archive supplied by the Founder.',
    file: 'radio-okapi-trailer.mp4', poster: 'radio-okapi.webp',
    duration: '2 min 09 s', width: 1280, height: 720,
    credit: 'Film credit: MONUSCO / United Nations · Radio Okapi.',
    status: 'published',
  },
];

export const PUBLISHED_FILMS = EDITORIAL_FILM_ARCHIVE.filter((film) => film.status === 'published');
export const filmMedia = (name: string) => `${import.meta.env.BASE_URL}api/documentary/media/${name}`;
export const engagementId = (film: Pick<EditorialFilm, 'id' | 'file'>) =>
  film.id === 'radio-okapi' ? 'radio-okapi' : film.file.replace(/\.mp4$/, '');
