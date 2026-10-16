/** Owner-confirmed partner identities. Public requests are addressed to TOMI only. */
export const PARTNER_INTRODUCTION_TARGETS = [
  { id: 1, name: "Institut français" }, { id: 2, name: "Government of the Democratic Republic of the Congo" },
  { id: 3, name: "Ministry of Culture, Arts and Heritage · DRC" }, { id: 4, name: "Emirates News" },
  { id: 5, name: "Edarabia" }, { id: 6, name: "Consulate General of Egypt in Dubai" },
  { id: 7, name: "Company of the Private Office of Sheikh Saeed Bin Ahmed Al Maktoum" },
  { id: 8, name: "Vibe Nation" }, { id: 9, name: "D Fashion Magazine" }, { id: 10, name: "World Impact Media" },
  { id: 11, name: "The Times of UAE" }, { id: 12, name: "Fondation Panzi RDC" },
  { id: 13, name: "Africa24 Infinity" }, { id: 14, name: "Africanews" },
  { id: 15, name: "Swiss Agency for Development and Cooperation · SDC" },
  { id: 16, name: "International Business Magazine" }, { id: 17, name: "Licence Magazine" },
  { id: 18, name: "Heineken" }, { id: 19, name: "CeraVe" }, { id: 20, name: "Anastacia Liv" },
  { id: 21, name: "Moët & Chandon" }, { id: 22, name: "UAE Stories" }, { id: 23, name: "HP Arabia" },
  { id: 24, name: "Embassy of the DRC in the United Arab Emirates" },
  { id: 25, name: "Private Office of H.H. Sheikh Ahmad Bin Obaid Al Maktoum" },
  { id: 26, name: "KONG" }, { id: 27, name: "Meliá Desert Palm" }, { id: 28, name: "Hennessy" },
  { id: 29, name: "Yalla TV" }, { id: 30, name: "TV5MONDE" }, { id: 31, name: "Shohra Hussain Group" },
  { id: 32, name: "CANAL+" }, { id: 33, name: "Misters Says" }, { id: 34, name: "Supa Rice Mbeya" },
  { id: 35, name: "United Nations" }, { id: 36, name: "Blackpower Studio" }, { id: 37, name: "Africa24" },
  { id: 38, name: "MONUSCO" }, { id: 39, name: "RFI" }, { id: 40, name: "Rawbank" },
  { id: 41, name: "FA TV" }, { id: 42, name: "Re-Loved Luxury" }, { id: 43, name: "Madi TV" },
  { id: 44, name: "Dubai News Center" },
] as const;

export interface PartnerLeader {
  name: string;
  role: string;
  sourceUrl: string;
  checkedAt: string;
  scope?: string;
}

/** Verified public functions are context, not a claim of personal access or endorsement. */
export const PARTNER_LEADERSHIP: Partial<Record<number, PartnerLeader>> = {
  1: { name: "Eva Nguyen Binh", role: "President of Institut français", checkedAt: "2026-10-16",
    sourceUrl: "https://www.institutfrancais.com/fr/magazine/presidente-linstitut-francais-eva-nguyen-binh-invitee-lemission-soft-power" },
  2: { name: "Judith Suminwa Tuluka", role: "Prime Minister", checkedAt: "2026-10-16",
    sourceUrl: "https://www.primature.gouv.cd/biographie-de-la-premiere-ministre" },
  7: { name: "Hisham Al Gurg", role: "CEO of Seed Group and the Private Office of Sheikh Saeed bin Ahmed Al Maktoum", checkedAt: "2026-10-16",
    sourceUrl: "https://seedgroup.com/news/seed-group-onboards-italian-start-up-bizaway-to-revolutionize-business-travel-in-the-uae-and-the-region" },
  12: { name: "Dr Denis Mukwege", role: "President and founder of Panzi Hospital and Foundation", checkedAt: "2026-10-16",
    sourceUrl: "https://panzifoundation.org/dr-denis-mukwege" },
  21: { name: "Jean-Jacques Guiony", role: "President and CEO of Moët Hennessy", checkedAt: "2026-10-16",
    scope: "Parent-group leadership, not the individual Maison’s CEO.",
    sourceUrl: "https://www.lvmh.com/en/our-group/governance/jean-jacques-guiony" },
  27: { name: "Gabriel Escarrer Jaume", role: "Chairman and CEO of Meliá Hotels International", checkedAt: "2026-10-16",
    scope: "Group leadership, not the hotel’s local general manager.",
    sourceUrl: "https://www.meliahotelsinternational.com/en/ourCompany/Pages/equipo-directivo.aspx" },
  28: { name: "Jean-Jacques Guiony", role: "President and CEO of Moët Hennessy", checkedAt: "2026-10-16",
    scope: "Parent-group leadership, not the individual Maison’s CEO.",
    sourceUrl: "https://www.lvmh.com/en/our-group/governance/jean-jacques-guiony" },
  29: { name: "Barbie Nuki Lezhava", role: "CEO of Yalla TV", checkedAt: "2026-10-16",
    sourceUrl: "https://yallatv.ae/about-us" },
  30: { name: "Kim Younes", role: "President and CEO of TV5MONDE", checkedAt: "2026-10-16",
    sourceUrl: "https://presse.tv5monde.com/communique-de-presse-du-conseil-dadministration-de-tv5monde" },
  32: { name: "Maxime Saada", role: "CEO of CANAL+", checkedAt: "2026-10-16",
    sourceUrl: "https://www.canalplusgroup.com/en/biography/maxime-saada-en" },
  37: { name: "Constant Nemale", role: "Founder and president of AFRICA24 Group", checkedAt: "2026-10-16",
    sourceUrl: "https://africa24tv.com/apo-group-sassocie-au-groupe-africa24-leader-media-tv-et-digital-en-afrique" },
  39: { name: "Jean-Marc Four", role: "Director of RFI", checkedAt: "2026-10-16",
    sourceUrl: "https://www.francemediasmonde.com/en/the-group/governance" },
  40: { name: "Mustafa Rawji", role: "Chief Executive Officer of Rawbank", checkedAt: "2026-10-16",
    sourceUrl: "https://rawbank.com/la-banque/equipe/mustafa-rawji-2" },
};
