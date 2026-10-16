export const DRC_AMBASSADOR_SOURCE = 'https://ambardc-abudhabi.org/mofaic-receives-credentials-copy-from-the-new-ambassador-of-the-democratic-republic-of-the-congo/';

// Personal names are only attached when supplied archive context and a public
// source support them. Unknown guests are not identified by their appearance.
export const OFFICIAL_MEETINGS = [
  { filename: '08.webp', word: 'DIPLOMACY', region: 'Abu Dhabi · UAE', people: 'Yuston Nessy · Marie Ndjeka Opombo', caption: 'Official meeting with the Ambassador of the DRC to the UAE · Abu Dhabi', position: 'center 42%', source: DRC_AMBASSADOR_SOURCE },
  { filename: '01.webp', word: 'DIALOGUE', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '02.webp', word: 'DIALOGUE', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '03.webp', word: 'TRUST', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official handshake · Founder archive', position: 'center 35%' },
  { filename: '04.webp', word: 'CONNECTION', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '05.webp', word: 'DIALOGUE', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '06.webp', word: 'CONNECTION', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '07.webp', word: 'DIALOGUE', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '09.webp', word: 'CONNECTION', region: 'Official meetings', people: 'Yuston Nessy', caption: 'Official meeting · Founder archive', position: 'center 30%' },
  { filename: '10.webp', word: 'TRUST', region: 'UAE', people: 'Yuston Nessy', caption: 'Official handshake · Founder archive', position: 'center 35%' },
] as const;

export const meetingImageUrl = (filename: string) => `${import.meta.env.BASE_URL}api/official-meetings/photos/${filename}`;
