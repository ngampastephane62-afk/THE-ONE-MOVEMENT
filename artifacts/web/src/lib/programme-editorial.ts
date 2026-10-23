/**
 * Base editorial content for the six official programmes.
 * This is the public fallback used until the Founder CMS
 * (GET /program-editorial/{slug}) is wired; nothing here invents
 * dates, venues, criteria, nominees or speakers.
 */
export type ProgrammeSlug = 'diplomatic-gala' | 'summit' | 'fashion-week' | 'awards' | 'fashion-night' | 'investment-forum';

export interface ProgrammeTheme {
  /** deep hero / band colour */
  night: string;
  /** slightly lifted surface on night */
  nightSoft: string;
  /** light reading surface */
  paper: string;
  /** signature accent */
  accent: string;
  /** muted text on night */
  mist: string;
  /** body ink on paper */
  ink: string;
}

export const PROGRAMME_THEMES: Record<ProgrammeSlug, ProgrammeTheme> = {
  awards: { night: 'hsl(163 52% 8%)', nightSoft: 'hsl(163 38% 13%)', paper: 'hsl(42 40% 95%)', accent: 'hsl(42 64% 58%)', mist: 'hsl(150 14% 74%)', ink: 'hsl(165 30% 12%)' },
  'fashion-night': { night: 'hsl(330 40% 10%)', nightSoft: 'hsl(330 30% 16%)', paper: 'hsl(24 45% 95%)', accent: 'hsl(14 80% 64%)', mist: 'hsl(330 14% 76%)', ink: 'hsl(330 30% 13%)' },
  'investment-forum': { night: 'hsl(214 42% 11%)', nightSoft: 'hsl(214 32% 17%)', paper: 'hsl(200 24% 95%)', accent: 'hsl(168 50% 52%)', mist: 'hsl(210 16% 74%)', ink: 'hsl(214 36% 14%)' },
  'diplomatic-gala': { night: 'hsl(187 67% 12%)', nightSoft: 'hsl(188 50% 18%)', paper: 'hsl(38 57% 94%)', accent: 'hsl(39 52% 54%)', mist: 'hsl(189 30% 72%)', ink: 'hsl(190 30% 14%)' },
  summit: { night: 'hsl(187 67% 12%)', nightSoft: 'hsl(188 50% 18%)', paper: 'hsl(38 57% 94%)', accent: 'hsl(39 52% 54%)', mist: 'hsl(189 30% 72%)', ink: 'hsl(190 30% 14%)' },
  'fashion-week': { night: 'hsl(187 67% 12%)', nightSoft: 'hsl(188 50% 18%)', paper: 'hsl(38 57% 94%)', accent: 'hsl(39 52% 54%)', mist: 'hsl(189 30% 72%)', ink: 'hsl(190 30% 14%)' },
};

export const ANNOUNCEMENT_DEFAULT = {
  title: 'OFFICIAL ANNOUNCEMENT COMING SOON.',
  body: "Event dates, venue, access information and official program details will be announced through The One Movement International's official channels.",
};

export const AWARDS_COPY = {
  title: 'THE ONE AWARDS.',
  secondary: ['RECOGNIZING EXCELLENCE.', 'CELEBRATING IMPACT.'],
  statement:
    'A global recognition initiative celebrating individuals, organizations and changemakers whose creativity, leadership, courage and commitment contribute to a more connected, inclusive and peaceful world.',
  whatIs: [
    'The One Awards is a recognition initiative of The One Movement International, dedicated to celebrating excellence, positive influence and meaningful contributions to society.',
    'Through recognition, storytelling and international connection, the program highlights individuals and initiatives that inspire progress, unity, cultural understanding and humanitarian engagement.',
  ],
  notForSale: [
    'Recognition at The One Awards is not for sale.',
    "Nominations and awards are based on the program's established eligibility and selection criteria.",
    'Sponsorship, exhibition, media services or other commercial arrangements do not guarantee nomination, selection or recognition.',
  ],
  criteriaPending: 'Formal selection criteria will be published by the Founder when approved.',
  nomineesTitle: 'AMBASSADORS OF PEACE.',
  nomineesSubtitle: 'VOICES THAT INSPIRE UNITY.',
  nomineesLede: 'Discover the personalities recognized through the Ambassador of Peace nomination initiative.',
  speaker: {
    title: 'BECOME A SPEAKER.',
    body: 'Share your expertise, perspectives and ideas with an international community of creatives, leaders and changemakers.',
    status: 'SPEAKER ANNOUNCEMENTS COMING SOON.',
  },
};

export const PARTNERSHIP_COPY = {
  title: 'PARTNER WITH THE MOVEMENT.',
  body: 'Explore opportunities to collaborate through culture, visibility, international engagement and meaningful impact.',
  guard: 'Packages and budgets are discussed privately. Paid participation never guarantees media coverage, broadcast appearances or editorial publication.',
};

/** Inquiry links reuse the existing /join inquiry flows; the programme is carried in the URL. */
export const inquiryHref = {
  service: (programme: string, role: string) => `/join?intent=programme-service&program=${encodeURIComponent(programme)}&service=${encodeURIComponent(role)}#institutional-inquiry`,
  partnership: (programme: string, kind: 'partner' | 'sponsor' | 'media' | 'collaborator') => `/join?intent=partnership&program=${encodeURIComponent(programme)}&interest=${kind}#institutional-inquiry`,
};
