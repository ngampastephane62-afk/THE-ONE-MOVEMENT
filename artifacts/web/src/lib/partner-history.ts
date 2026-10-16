/** Relationships confirmed by the Founder from his logo archive (developed over
 * roughly ten years). Not a current-sponsor list: individual dates, durations
 * and deliverables have not been supplied, and no tier or amount is implied.
 */
export type HistoryCategory =
  | 'government' | 'culture' | 'multilateral' | 'diplomatic'
  | 'banking' | 'private' | 'brands' | 'broadcast' | 'press';

export type HistoryPartner = {
  id: number; name: string; category: HistoryCategory;
  /** false when no verified logo file exists: render a typographic name. */
  logo?: boolean;
  slug?: string; description?: string; sourceUrl?: string; linkLabel?: string;
};

export const partnerHistory: HistoryPartner[] = [
  { id: 2, name: 'Government of the Democratic Republic of the Congo', category: 'government' },
  { id: 15, name: 'Swiss Agency for Development and Cooperation · SDC', category: 'government' },
  { id: 3, name: 'Ministry of Culture, Arts and Heritage · DRC', category: 'culture' },
  { id: 1, name: 'Institut français', category: 'culture' },
  { id: 35, name: 'United Nations', category: 'multilateral' },
  { id: 38, name: 'MONUSCO', category: 'multilateral' },
  { id: 12, name: 'Fondation Panzi RDC', category: 'multilateral' },
  { id: 24, name: 'Embassy of the DRC in the United Arab Emirates', category: 'diplomatic' },
  { id: 6, name: 'Consulate General of Egypt in Dubai', category: 'diplomatic' },
  { id: 25, name: 'Private Office of H.H. Sheikh Ahmad Bin Obaid Al Maktoum', category: 'diplomatic' },
  { id: 40, name: 'Rawbank', category: 'banking' },
  { id: 7, name: 'Company of the Private Office of Sheikh Saeed Bin Ahmed Al Maktoum', category: 'private' },
  { id: 31, name: 'Shohra Hussain Group', category: 'private' },
  { id: 36, name: 'Blackpower Studio', category: 'private' },
  { id: 26, name: 'KONG', category: 'private' },
  { id: 33, name: 'Misters Says', category: 'private' },
  { id: 34, name: 'Supa Rice Mbeya', category: 'private' },
  {
    id: 42, name: 'Re-Loved Luxury', category: 'private', slug: 'history-reloved-luxury',
    description: 'Dubai-based pre-owned luxury fashion and accessories business.',
    sourceUrl: 'https://www.instagram.com/re_loved_luxury/', linkLabel: 'Instagram · Re-Loved Luxury',
  },
  { id: 18, name: 'Heineken', category: 'brands' },
  { id: 21, name: 'Moët & Chandon', category: 'brands' },
  { id: 28, name: 'Hennessy', category: 'brands' },
  { id: 19, name: 'CeraVe', category: 'brands' },
  { id: 27, name: 'Meliá Desert Palm', category: 'brands' },
  { id: 20, name: 'Anastacia Liv', category: 'brands' },
  { id: 32, name: 'CANAL+', category: 'broadcast' },
  { id: 30, name: 'TV5MONDE', category: 'broadcast' },
  { id: 39, name: 'RFI', category: 'broadcast' },
  { id: 14, name: 'Africanews', category: 'broadcast' },
  { id: 37, name: 'Africa24', category: 'broadcast' },
  { id: 13, name: 'Africa24 Infinity', category: 'broadcast' },
  { id: 4, name: 'Emirates News', category: 'broadcast' },
  { id: 29, name: 'Yalla TV', category: 'broadcast' },
  { id: 41, name: 'FA TV', category: 'broadcast' },
  {
    id: 43, name: 'Madi TV', category: 'broadcast', slug: 'history-madi-tv',
    description: 'Congolese Swahili-language television channel based in Goma.',
    sourceUrl: 'https://en.wikipedia.org/wiki/Madi_TV', linkLabel: 'About Madi TV · Wikipedia',
  },
  // Owner-confirmed. Official identity and logo pending: typographic entry only.
  { id: 44, name: 'Dubai News Center', category: 'press', logo: false },
  { id: 11, name: 'The Times of UAE', category: 'press' },
  { id: 16, name: 'International Business Magazine', category: 'press' },
  { id: 17, name: 'Licence Magazine', category: 'press' },
  { id: 9, name: 'D Fashion Magazine', category: 'press' },
  { id: 5, name: 'Edarabia', category: 'press' },
  { id: 8, name: 'Vibe Nation', category: 'press' },
  { id: 10, name: 'World Impact Media', category: 'press' },
  { id: 22, name: 'UAE Stories', category: 'press' },
  { id: 23, name: 'HP Arabia', category: 'press' },
];

export const historyLogo = (id: number) => `${import.meta.env.BASE_URL}api/documentary/media/archive-partner-${String(id).padStart(2, '0')}.webp`;
