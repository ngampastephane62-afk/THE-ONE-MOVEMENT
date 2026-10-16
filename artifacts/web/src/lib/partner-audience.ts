/**
 * Public outlet-scale figures, not measured reach of a TOMI programme.
 * Checked against the linked official publications on 2026-10-16.
 * Keep units and reference periods separate; never aggregate these entries.
 */
export interface BroadcasterAudienceEntry {
  id: string;
  name: string;
  partnerIds: number[];
  value: string | null;
  metric: string;
  period: string;
  scope: string;
  sourceUrl: string | null;
  sourceLabel: string;
  note?: string;
}

export const BROADCASTER_AUDIENCE: BroadcasterAudienceEntry[] = [
  {
    id: 'canal', name: 'CANAL+', partnerIds: [32], value: '40M+',
    metric: 'Subscribers worldwide',
    period: '2025 subscriber base · published 28 July 2026',
    scope: 'Combined CANAL+ and MultiChoice group',
    sourceUrl: 'https://www.canalplusgroup.com/uploads/CANAL_Presentation_2026_Half_Year_Results_13b6e8aad0.pdf',
    sourceLabel: 'CANAL+ · 2026 half-year results',
    note: 'Group subscriber scale, including MultiChoice; not viewers of the Movement’s documentary.',
  },
  {
    id: 'tv5monde', name: 'TV5MONDE', partnerIds: [30], value: '80M',
    metric: 'Weekly television viewers',
    period: '2025–2026 season press kit',
    scope: 'Worldwide television network',
    sourceUrl: 'https://presse.tv5monde.com/wp-content/uploads/2025/10/fea10a4506abb7e65df4e67ad0d282df.pdf',
    sourceLabel: 'TV5MONDE · official 2025–2026 press kit',
    note: 'Also distributed to 400M+ households across 200+ countries and territories. Distribution is not measured viewership.',
  },
  {
    id: 'rfi', name: 'RFI', partnerIds: [39], value: '105M',
    metric: 'Weekly radio and digital contacts',
    period: '2025 key figures',
    scope: 'Worldwide · broadcast and digital platforms',
    sourceUrl: 'https://www.francemediasmonde.com/en/our-media/rfi',
    sourceLabel: 'France Médias Monde · RFI key figures',
    note: 'The publisher’s combined radio/digital contacts metric; not unique viewers of a TOMI broadcast.',
  },
  {
    id: 'africanews', name: 'Africanews', partnerIds: [14], value: '40M',
    metric: 'Television households reached',
    period: 'Reference date not stated by the publisher',
    scope: '35+ African countries, the United Kingdom and the United States',
    sourceUrl: 'https://www.africanews.com/page/about',
    sourceLabel: 'Africanews · official corporate information',
    note: 'Distribution footprint, not the audience measured for an individual story.',
  },
  {
    id: 'africa24', name: 'Africa24', partnerIds: [37], value: '80M+',
    metric: 'Households reached, as stated by the publisher',
    period: 'Measurement period not specified',
    scope: 'Africa24 TV · French-language channel',
    sourceUrl: 'https://africa24group.com/en/services',
    sourceLabel: 'Africa24 Group · official services presentation',
    note: 'This figure is stated for Africa24 TV only; it is not a separate audience figure for Africa24 Infinity.',
  },
  {
    id: 'africa24-infinity', name: 'Africa24 Infinity', partnerIds: [13], value: null,
    metric: 'Creative industries, fashion, music and culture',
    period: 'No independently published audience figure verified',
    scope: 'Africa24 Group · Infinity channel',
    sourceUrl: 'https://africa24group.com/en/services',
    sourceLabel: 'Africa24 Group · channel presentation',
    note: 'Africa24 TV’s household figure is not reused for Infinity.',
  },
  {
    id: 'emirates-news', name: 'Emirates News', partnerIds: [4], value: null,
    metric: 'Programme-specific audience not provided',
    period: 'No reliable dated audience figure available',
    scope: 'Emirates News',
    sourceUrl: null,
    sourceLabel: 'Relationship confirmed in the Founder’s partner archive',
    note: 'No parent-network audience is attributed to this programme.',
  },
  {
    id: 'yalla-tv', name: 'Yalla TV', partnerIds: [29], value: null,
    metric: 'Channel audience not publicly quantified',
    period: 'No reliable dated audience figure available',
    scope: 'Dubai · United Arab Emirates',
    sourceUrl: 'https://yallatv.ae/about-us',
    sourceLabel: 'Yalla TV · official channel presentation',
  },
  {
    id: 'fa-tv', name: 'FA TV', partnerIds: [41], value: null,
    metric: 'Channel audience not provided',
    period: 'No reliable dated audience figure available',
    scope: 'FA TV',
    sourceUrl: null,
    sourceLabel: 'Relationship confirmed in the Founder’s partner archive',
  },
  {
    id: 'madi-tv', name: 'Madi TV', partnerIds: [43], value: null,
    metric: 'Channel audience not provided',
    period: 'No reliable dated audience figure available',
    scope: 'Goma · Democratic Republic of the Congo',
    sourceUrl: null,
    sourceLabel: 'Relationship confirmed in the Founder’s partner archive',
  },
  {
    id: 'dubai-news-center', name: 'Dubai News Center', partnerIds: [44], value: null,
    metric: 'Partner audience not provided',
    period: 'No reliable dated audience figure available',
    scope: 'Dubai News Center',
    sourceUrl: null,
    sourceLabel: 'Partnership confirmed by the Founder',
    note: 'No figures from a similarly named media organisation are substituted.',
  },
];
