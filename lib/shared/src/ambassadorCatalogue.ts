/**
 * Ambassador of Peace nominee catalogue — pure data, no React or image imports.
 *
 * STATUS RULES
 * — Every person listed is a NOMINEE for The One Awards "Ambassador of Peace"
 *   recognition. Nobody here is announced as a winner.
 * — Programme appearances (Summit, Fashion Week red carpet) are PLANNED
 *   appearances announced by TOMI. They are not past appearances and are not
 *   independently confirmed by the nominee.
 * — Biographical facts are drawn from the cited public sources. No private
 *   contact details, no invented affiliations or partnerships.
 * — `poster` is an asset key; the web frontend maps it to an image import.
 */

export type AmbassadorProgramme = "awards" | "summit" | "fashion-week";

export interface AmbassadorLink {
  label: string;
  url: string;
}

export interface AmbassadorProfile {
  slug: string;
  name: string;
  role: string;
  bio: string;
  business: string[];
  impact: string[];
  website?: string;
  socials: AmbassadorLink[];
  sources: AmbassadorLink[];
  /** Asset key resolved by the frontend (official TOMI poster). */
  poster: string;
  /** Original supplied filename, preserved for attribution. */
  posterSource: string;
  programmes: AmbassadorProgramme[];
  programmeLabels: string[];
  /** Date the public sources were last reviewed (ISO). */
  reviewed: string;
}

export const AMBASSADOR_STATUS_NOTE =
  "Nominations are not awards. Programme appearances listed are planned, as announced by TOMI, and are not past or independently confirmed appearances.";

const PROGRAMME_LABELS = [
  "The One Awards · Ambassador of Peace nominee",
  "The One Summit · announced speaker (planned)",
  "The One Fashion Week · red carpet (planned)",
];
const ALL: AmbassadorProgramme[] = ["awards", "summit", "fashion-week"];

export const AMBASSADOR_NOMINEES: AmbassadorProfile[] = [
  {
    slug: "david-jonsson",
    name: "David Jonsson",
    role: "Actor",
    bio: "British actor known for Industry, Rye Lane and Alien: Romulus. Winner of the 2025 BAFTA EE Rising Star Award. The supplied TOMI poster announces his Ambassador of Peace nomination; its Black Panther casting claim is not independently established and is not reproduced here.",
    business: ["Film, television and theatre actor."],
    impact: ["Recognised by BAFTA for his contribution as an emerging screen performer."],
    socials: [{ label: "BAFTA profile", url: "https://www.bafta.org/awards/film/ee-rising-star-award/" }],
    sources: [{ label: "BAFTA", url: "https://www.bafta.org/awards/film/ee-rising-star-award/" }, { label: "Wikipedia — David Jonsson", url: "https://en.wikipedia.org/wiki/David_Jonsson" }],
    poster: "david-jonsson",
    posterSource: "Supplied TOMI announcement artwork",
    programmes: ALL, programmeLabels: PROGRAMME_LABELS, reviewed: "2026-10-16",
  },
  {
    slug: "mohombi",
    name: "Mohombi",
    role: "Singer, songwriter and dancer",
    bio: "Congolese-Swedish singer and songwriter known internationally for Bumpy Ride and for collaborations across African and international pop music. Featured in the supplied TOMI Ambassador of Peace announcement film.",
    business: ["Recording artist and songwriter."],
    impact: ["Connects Congolese and international music audiences."],
    socials: [{ label: "Instagram", url: "https://www.instagram.com/mohombi/" }],
    sources: [{ label: "Wikipedia — Mohombi", url: "https://en.wikipedia.org/wiki/Mohombi" }],
    poster: "mohombi",
    posterSource: "Frame from the supplied TOMI announcement film",
    programmes: ALL, programmeLabels: PROGRAMME_LABELS, reviewed: "2026-10-16",
  },
  {
    slug: "winnie-harlow",
    name: "Winnie Harlow",
    role: "Model, entrepreneur and vitiligo advocate",
    bio: "Canadian model of Jamaican heritage, born Chantelle Brown-Young in Toronto in 1994. She came to wide attention on America's Next Top Model in 2014 and has since walked for major fashion houses and appeared on leading magazine covers, speaking openly about living with vitiligo.",
    business: ["Founder of CAY Skin, a sun-care brand she created after a severe sunburn affected her vitiligo pattern (per CAY Skin)."],
    impact: [
      "Public spokesperson on vitiligo, skin difference and representation in fashion.",
      "Widely cited voice for broader definitions of beauty on international runways.",
    ],
    website: "https://cayskin.com/pages/winnie-harlow",
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/winnieharlow/" },
      { label: "CAY Skin", url: "https://cayskin.com/pages/winnie-harlow" },
    ],
    sources: [
      { label: "Wikipedia — Winnie Harlow", url: "https://en.wikipedia.org/wiki/Winnie_Harlow" },
      { label: "CAY Skin — Meet Winnie Harlow (primary)", url: "https://cayskin.com/pages/winnie-harlow" },
    ],
    poster: "winnie-harlow",
    posterSource: "awards-winnie-harlow.webp · Katie_jensen_1792120714397.png (official TOMI poster)",
    programmes: ALL,
    programmeLabels: PROGRAMME_LABELS,
    reviewed: "2026-10-16",
  },
  {
    slug: "ciara",
    name: "Ciara",
    role: "Singer, songwriter, entrepreneur and philanthropist",
    bio: "American singer, songwriter and dancer, born Ciara Princess Harris in 1985. Her 2004 debut Goodies launched a career that includes a Grammy Award win and numerous chart singles.",
    business: [
      "Founder of OAM (On A Mission), a clinical skincare brand launched in September 2022.",
      "Co-founder, with Russell Wilson, of the Why Not You Foundation (founded 2014).",
    ],
    impact: [
      "The Why Not You Foundation supports youth empowerment through education, health and food-security initiatives; a portion of OAM sales goes to it (per OAM).",
    ],
    website: "https://www.oamskin.com",
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/ciara/" },
      { label: "OAM Skin", url: "https://www.oamskin.com" },
    ],
    sources: [
      { label: "Wikipedia — Ciara", url: "https://en.wikipedia.org/wiki/Ciara" },
      { label: "OAM — Giving Back (primary)", url: "https://www.oamskin.com/pages/giving-back" },
      { label: "PR Newswire — OAM launch, 15 Sep 2022", url: "https://www.prnewswire.com/news-releases/grammy-award-winning-artist-and-entrepreneur-ciara-unveils-oam-on-a-mission-clinical-skincare-made-simple-and-made-for-all-301625352.html" },
    ],
    poster: "ciara",
    posterSource: "awards-ciara-poster.webp (official TOMI poster)",
    programmes: ALL,
    programmeLabels: PROGRAMME_LABELS,
    reviewed: "2026-10-16",
  },
  {
    slug: "nancy-isime",
    name: "Nancy Isime",
    role: "Actress, television host and model",
    bio: "Nigerian actress, television presenter and model, born in Edo State in 1991. She has hosted major Nigerian television programmes and appeared in Nollywood film and series productions.",
    business: ["Screen, presenting and brand-ambassador work across Nigerian entertainment."],
    impact: [
      "Prominent Nigerian media personality representing Nollywood and African creative industries.",
    ],
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/nancyisimeofficial/" },
    ],
    sources: [
      { label: "Wikipedia — Nancy Isime", url: "https://en.wikipedia.org/wiki/Nancy_Isime" },
    ],
    poster: "nancy-isime",
    posterSource: "awards-nominees-poster.webp (official TOMI poster)",
    programmes: ALL,
    programmeLabels: PROGRAMME_LABELS,
    reviewed: "2026-10-16",
  },
  {
    slug: "kevin-hart",
    name: "Kevin Hart",
    role: "Comedian, actor, producer and investor",
    bio: "American comedian and actor, born in Philadelphia in 1979. Known for record-setting stand-up tours and films including Jumanji: Welcome to the Jungle and Central Intelligence.",
    business: [
      "Founder of Hartbeat, a media and entertainment company.",
      "Associated with HartBeat Ventures, as presented on his official website.",
    ],
    impact: [
      "Help From The Hart Charity partnered with UNCF and KIPP in 2018 on a $600,000 scholarship programme.",
    ],
    website: "https://www.kevinhartnation.com",
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/kevinhart4real/" },
      { label: "Official website", url: "https://www.kevinhartnation.com" },
      { label: "Hartbeat", url: "https://www.hartbeat.com" },
    ],
    sources: [
      { label: "Wikipedia — Kevin Hart", url: "https://en.wikipedia.org/wiki/Kevin_Hart" },
      { label: "Hartbeat — official site", url: "https://www.hartbeat.com" },
      { label: "Kevin Hart — official site (HartBeat Ventures)", url: "https://www.kevinhartnation.com/" },
      { label: "UNCF — Help From The Hart scholarship, Aug 2018", url: "https://uncf.org/the-latest/kevin-harts-charity-launches-a-new-600k-scholarship-program-with-uncf-and-k" },
    ],
    poster: "kevin-hart",
    posterSource: "Katie_jensen_1792120447986.png (official TOMI poster; spelling on poster reads 'Kevin Heart')",
    programmes: ALL,
    programmeLabels: PROGRAMME_LABELS,
    reviewed: "2026-10-16",
  },
];

export const AMBASSADOR_SLUGS = AMBASSADOR_NOMINEES.map((a) => a.slug);

export function getAmbassadorBySlug(slug: string): AmbassadorProfile | undefined {
  return AMBASSADOR_NOMINEES.find((a) => a.slug === slug);
}

export function getAmbassadorsForProgramme(p: AmbassadorProgramme): AmbassadorProfile[] {
  return AMBASSADOR_NOMINEES.filter((a) => a.programmes.includes(p));
}
