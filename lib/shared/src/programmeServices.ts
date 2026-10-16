/** Programme participation services are not annual sponsorship or equity offers. */
const programmeNames: Record<string, string> = {
  summit: "The One Summit",
  "fashion-week": "The One Fashion Week International",
  "fashion-night": "The One Fashion Night",
  awards: "The One Awards",
  "diplomatic-gala": "The One Diplomatic Gala",
  "investment-forum": "The One Investment Forum",
};

const roles = [
  { role: "speaker", name: "Speaker", benefit: "A platform for your ideas, thought leadership and relevant professional introductions." },
  { role: "exhibitor", name: "Exhibitor", benefit: "Present your products or services and meet relevant visitors and collaborators." },
  { role: "brand", name: "Brand activation", benefit: "Explore an activation, branded content and agreed visibility without an annual sponsorship." },
  { role: "media", name: "Media participation", benefit: "Discuss editorial access, interviews and coordinated coverage opportunities." },
  { role: "designer", name: "Designer / stylist", benefit: "Present your creative work through an agreed showcase and editorial content." },
  { role: "model", name: "Model", benefit: "Explore casting, runway participation and portfolio imagery under agreed terms." },
  { role: "hair-stylist", name: "Hair stylist", benefit: "Showcase your craft through backstage work, creative credits and portfolio content." },
  { role: "makeup-artist", name: "Makeup artist", benefit: "Contribute to the creative team with agreed credits and portfolio content." },
] as const;

export interface ProgrammeServiceOffer {
  programme: string;
  programmeName: string;
  role: string;
  name: string;
  benefit: string;
  priceUsd: number | null;
}

export function getProgrammeServiceOffers(programme: string): ProgrammeServiceOffer[] {
  const name = programmeNames[programme];
  if (!name) return [];
  const fashion = programme === "fashion-week" || programme === "fashion-night";
  return roles.filter((item) => fashion || ["speaker", "exhibitor", "brand", "media"].includes(item.role))
    .map((item) => ({
      ...item, programme, programmeName: name,
      priceUsd: programme === "summit" && item.role === "speaker" ? 10000 : null,
    }));
}

export function getProgrammeServiceOffer(programme: string, role: string): ProgrammeServiceOffer | undefined {
  return getProgrammeServiceOffers(programme).find((item) => item.role === role);
}
