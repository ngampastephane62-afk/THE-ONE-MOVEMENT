/**
 * Thanks World — regional impact directory. Pure data.
 *
 * A CURATED editorial selection by TOMI of widely documented public figures.
 * It is NOT a Forbes ranking, NOT an endorsement, and NONE of these people is
 * a TOMI ambassador, nominee, partner or participant. No contact is implied.
 * Historical figures are marked and presented as memorial references only.
 */

export type ImpactRegion = "africa" | "usa" | "europe" | "asia" | "south-america" | "oceania";
export type ImpactSector =
  | "business"
  | "arts"
  | "education"
  | "humanitarian"
  | "science"
  | "civic";

export interface ImpactSource {
  label: string;
  url: string;
}

export interface ImpactLeader {
  slug: string;
  name: string;
  region: ImpactRegion;
  country: string;
  sectors: ImpactSector[];
  role: string;
  summary: string;
  historical?: boolean;
  lifespan?: string;
  website?: string;
  sources: ImpactSource[];
}

export const IMPACT_SECTORS: { key: ImpactSector; label: string }[] = [
  { key: "business", label: "Business & Industry" },
  { key: "arts", label: "Arts & Culture" },
  { key: "education", label: "Education" },
  { key: "humanitarian", label: "Humanitarian" },
  { key: "science", label: "Science & Innovation" },
  { key: "civic", label: "Civic Leadership" },
];

export const IMPACT_REGIONS: { key: ImpactRegion; label: string; campaign: string }[] = [
  { key: "africa", label: "Africa", campaign: "Thanks Africa" },
  { key: "usa", label: "United States", campaign: "Thanks USA" },
  { key: "europe", label: "Europe", campaign: "Thanks Europe" },
  { key: "asia", label: "Asia", campaign: "Thanks Asia" },
  { key: "south-america", label: "South America", campaign: "Thanks South America" },
  { key: "oceania", label: "Oceania", campaign: "Thanks Oceania" },
];

/** Date every Wikipedia source and key claim below was fetched and checked. */
export const IMPACT_SOURCES_REVIEWED = "2026-10-16";

export const IMPACT_DISCLAIMER =
  "A curated TOMI editorial selection, not a ranking or an endorsement. Inclusion does not imply participation or affiliation. Dr Denis Mukwege is separately identified as a TOMI partner on the organisation's declaration. Public wealth estimates are dated, not audited personal disclosures.";

const w = (title: string): ImpactSource => ({
  label: `Wikipedia — ${title.replace(/_/g, " ")}`,
  url: `https://en.wikipedia.org/wiki/${title}`,
});

export const IMPACT_LEADERS: ImpactLeader[] = [
  { slug: "ben-amadasun", name: "Ben Amadasun", region: "africa", country: "Nigeria", sectors: ["arts", "business"], role: "Vice President of Content, Netflix Middle East & Africa", summary: "Netflix executive overseeing content in the Middle East and Africa, supporting African screen stories and production.", sources: [{ label: "Mail & Guardian · 11 Sep 2026", url: "https://mg.co.za/friday/2026-09-11-ten-years-in-netflix-announces-new-expansive-slate-for-the-rest-of-2026" }] },
  { slug: "amina-mohammed", name: "Amina J. Mohammed", region: "africa", country: "Nigeria", sectors: ["civic", "humanitarian"], role: "Deputy Secretary-General, United Nations", summary: "UN Deputy Secretary-General and Chair of the United Nations Sustainable Development Group; previously Nigeria's Minister of Environment.", sources: [{ label: "United Nations · biography", url: "https://www.un.org/sg/en/content/dsg/biography" }] },
  { slug: "navi-pillay", name: "Navi Pillay", region: "africa", country: "South Africa", sectors: ["humanitarian", "civic"], role: "Nobel Peace Prize 2026 laureate", summary: "Jurist and former United Nations High Commissioner for Human Rights. Awarded the 2026 Nobel Peace Prize for her efforts to promote peace and international law, announced 9 October 2026.", sources: [{ label: "Nobel Committee · 9 Oct 2026", url: "https://www.nobelprize.org/prizes/peace/2026/press-release/" }] },
  { slug: "antonio-guterres", name: "António Guterres", region: "europe", country: "Portugal", sectors: ["civic", "humanitarian"], role: "Secretary-General, United Nations", summary: "Ninth Secretary-General of the United Nations, in office since January 2017. Previously served as UN High Commissioner for Refugees.", sources: [{ label: "United Nations · Secretary-General", url: "https://www.un.org/sg/en" }] },
  { slug: "bernard-arnault", name: "Bernard Arnault", region: "europe", country: "France", sectors: ["business"], role: "Chairman and CEO, LVMH", summary: "Leads the LVMH luxury goods group, whose businesses span fashion, leather goods, wines, jewellery and retail.", sources: [w("Bernard_Arnault"), { label: "LVMH", url: "https://www.lvmh.com/" }] },
  { slug: "malala-yousafzai", name: "Malala Yousafzai", region: "asia", country: "Pakistan", sectors: ["education", "humanitarian"], role: "Education advocate · Nobel Peace Prize 2014", summary: "Co-founder of Malala Fund and advocate for girls' education; co-recipient of the 2014 Nobel Peace Prize.", sources: [{ label: "Nobel Prize", url: "https://www.nobelprize.org/prizes/peace/2014/yousafzai/facts/" }] },
  { slug: "mukesh-ambani", name: "Mukesh Ambani", region: "asia", country: "India", sectors: ["business"], role: "Chairman, Reliance Industries", summary: "Leads Reliance Industries across energy, retail and digital services.", sources: [w("Mukesh_Ambani")] },
  { slug: "lula-da-silva", name: "Luiz Inácio Lula da Silva", region: "south-america", country: "Brazil", sectors: ["civic"], role: "President of Brazil", summary: "Brazilian president, serving a third term beginning in January 2023.", sources: [w("Luiz_Inácio_Lula_da_Silva")] },
  { slug: "jorge-paulo-lemann", name: "Jorge Paulo Lemann", region: "south-america", country: "Brazil", sectors: ["business"], role: "Investor · co-founder, 3G Capital", summary: "Brazilian investor associated with 3G Capital and international consumer businesses.", sources: [w("Jorge_Paulo_Lemann")] },
  { slug: "cathy-freeman", name: "Cathy Freeman", region: "oceania", country: "Australia", sectors: ["education"], role: "Olympic champion and education advocate", summary: "Olympic 400-metre champion at Sydney 2000; her foundation supports education for Aboriginal and Torres Strait Islander young people.", sources: [w("Cathy_Freeman")] },
  { slug: "gina-rinehart", name: "Gina Rinehart", region: "oceania", country: "Australia", sectors: ["business"], role: "Executive chairman, Hancock Prospecting", summary: "Australian business leader in mining and agriculture.", sources: [w("Gina_Rinehart")] },
  /* Business & Industry */
  { slug: "aliko-dangote", name: "Aliko Dangote", region: "africa", country: "Nigeria", sectors: ["business"], role: "Founder, Dangote Group", summary: "Built the Dangote Group across cement, sugar, fertiliser and refining, including the Dangote Petroleum Refinery near Lagos; the Aliko Dangote Foundation funds health and nutrition work.", website: "https://www.dangote.com", sources: [w("Aliko_Dangote"), { label: "Forbes profile", url: "https://www.forbes.com/profile/aliko-dangote/" }] },
  { slug: "mo-ibrahim", name: "Mo Ibrahim", region: "africa", country: "Sudan / United Kingdom", sectors: ["business", "civic"], role: "Founder, Celtel and the Mo Ibrahim Foundation", summary: "Founded the mobile operator Celtel, which brought mobile telephony to many African markets; his foundation publishes the Ibrahim Index of African Governance.", website: "https://mo.ibrahim.foundation", sources: [w("Mo_Ibrahim")] },
  { slug: "strive-masiyiwa", name: "Strive Masiyiwa", region: "africa", country: "Zimbabwe", sectors: ["business", "humanitarian"], role: "Founder, Econet Group", summary: "Founded Econet Wireless and the Cassava Technologies group; with his wife Tsitsi he funds scholarships for orphaned and vulnerable children.", sources: [w("Strive_Masiyiwa")] },
  { slug: "oprah-winfrey", name: "Oprah Winfrey", region: "usa", country: "United States", sectors: ["business", "arts", "education"], role: "Media executive and philanthropist", summary: "Built Harpo Productions after The Oprah Winfrey Show; founded the Oprah Winfrey Leadership Academy for Girls in South Africa in 2007.", sources: [w("Oprah_Winfrey"), { label: "Forbes profile", url: "https://www.forbes.com/profile/oprah-winfrey/" }] },
  { slug: "warren-buffett", name: "Warren Buffett", region: "usa", country: "United States", sectors: ["business"], role: "Chairman, Berkshire Hathaway", summary: "Led Berkshire Hathaway for decades and co-founded the Giving Pledge, committing the large majority of his wealth to philanthropy.", sources: [w("Warren_Buffett"), { label: "Forbes profile", url: "https://www.forbes.com/profile/warren-buffett/" }] },
  { slug: "robert-f-smith", name: "Robert F. Smith", region: "usa", country: "United States", sectors: ["business", "education"], role: "Founder, Vista Equity Partners", summary: "Founded the software-focused investment firm Vista Equity Partners; in 2019 pledged to pay off the student debt of Morehouse College's graduating class.", sources: [w("Robert_F._Smith_(investor)")] },

  /* Arts & Culture */
  { slug: "chimamanda-ngozi-adichie", name: "Chimamanda Ngozi Adichie", region: "africa", country: "Nigeria", sectors: ["arts"], role: "Novelist and essayist", summary: "Author of Purple Hibiscus, Half of a Yellow Sun and Americanah; her talk We Should All Be Feminists reached a worldwide audience.", sources: [w("Chimamanda_Ngozi_Adichie")] },
  { slug: "angelique-kidjo", name: "Angélique Kidjo", region: "africa", country: "Benin", sectors: ["arts", "humanitarian"], role: "Singer-songwriter, UNICEF Goodwill Ambassador", summary: "Multiple Grammy Award-winning artist; her Batonga Foundation supports education for girls in Africa.", sources: [w("Angélique_Kidjo")] },
  { slug: "wole-soyinka", name: "Wole Soyinka", region: "africa", country: "Nigeria", sectors: ["arts", "civic"], role: "Playwright and poet", summary: "Awarded the Nobel Prize in Literature in 1986, the first African laureate in the category.", sources: [w("Wole_Soyinka")] },
  { slug: "ava-duvernay", name: "Ava DuVernay", region: "usa", country: "United States", sectors: ["arts"], role: "Filmmaker", summary: "Director of Selma, 13th and When They See Us; founded the film collective ARRAY to distribute work by under-represented filmmakers.", sources: [w("Ava_DuVernay")] },
  { slug: "lin-manuel-miranda", name: "Lin-Manuel Miranda", region: "usa", country: "United States", sectors: ["arts"], role: "Composer, lyricist and actor", summary: "Created In the Heights and Hamilton; Hamilton received the Pulitzer Prize for Drama in 2016.", sources: [w("Lin-Manuel_Miranda")] },
  { slug: "beyonce", name: "Beyoncé", region: "usa", country: "United States", sectors: ["arts", "business"], role: "Singer, songwriter and producer", summary: "One of the most awarded artists in Grammy history; founded Parkwood Entertainment and the BeyGOOD philanthropic initiative.", sources: [w("Beyoncé")] },

  /* Education */
  { slug: "patrick-awuah", name: "Patrick Awuah", region: "africa", country: "Ghana", sectors: ["education"], role: "Founder, Ashesi University", summary: "Left Microsoft to found Ashesi University in Ghana in 2002, built on ethics, liberal arts and leadership education.", website: "https://www.ashesi.edu.gh", sources: [w("Patrick_Awuah")] },
  { slug: "fred-swaniker", name: "Fred Swaniker", region: "africa", country: "Ghana", sectors: ["education", "business"], role: "Founder, African Leadership Group", summary: "Founded the African Leadership Academy and African Leadership University to develop leaders across the continent.", sources: [w("Fred_Swaniker")] },
  { slug: "graca-machel", name: "Graça Machel", region: "africa", country: "Mozambique", sectors: ["education", "humanitarian"], role: "Former Minister of Education, Mozambique", summary: "Served as Mozambique's first Minister of Education after independence and authored the 1996 UN study on the impact of armed conflict on children.", sources: [w("Graça_Machel")] },
  { slug: "michelle-obama", name: "Michelle Obama", region: "usa", country: "United States", sectors: ["education", "civic"], role: "Former First Lady of the United States", summary: "Led the Reach Higher and Let Girls Learn initiatives; author of the memoir Becoming.", sources: [w("Michelle_Obama")] },
  { slug: "geoffrey-canada", name: "Geoffrey Canada", region: "usa", country: "United States", sectors: ["education"], role: "Founder, Harlem Children's Zone", summary: "Developed the Harlem Children's Zone cradle-to-career model of education and community support.", sources: [w("Geoffrey_Canada")] },
  { slug: "sal-khan", name: "Salman Khan", region: "usa", country: "United States", sectors: ["education", "science"], role: "Founder, Khan Academy", summary: "Founded Khan Academy, a non-profit offering free online lessons used by learners around the world.", website: "https://www.khanacademy.org", sources: [w("Sal_Khan")] },

  /* Humanitarian */
  { slug: "denis-mukwege", name: "Denis Mukwege", region: "africa", country: "Democratic Republic of Congo", sectors: ["humanitarian"], role: "Gynaecologist, founder of Panzi Hospital", summary: "Treats survivors of sexual violence at Panzi Hospital in Bukavu; co-recipient of the 2018 Nobel Peace Prize.", sources: [w("Denis_Mukwege")] },
  { slug: "leymah-gbowee", name: "Leymah Gbowee", region: "africa", country: "Liberia", sectors: ["humanitarian", "civic"], role: "Peace activist", summary: "Led the women's peace movement that helped end Liberia's Second Civil War; co-recipient of the 2011 Nobel Peace Prize.", sources: [w("Leymah_Gbowee")] },
  { slug: "desmond-tutu", name: "Desmond Tutu", region: "africa", country: "South Africa", sectors: ["humanitarian", "civic"], role: "Archbishop and anti-apartheid leader", summary: "Received the 1984 Nobel Peace Prize and chaired South Africa's Truth and Reconciliation Commission.", historical: true, lifespan: "1931–2021", sources: [w("Desmond_Tutu")] },
  { slug: "jose-andres", name: "José Andrés", region: "usa", country: "United States / Spain", sectors: ["humanitarian"], role: "Chef, founder of World Central Kitchen", summary: "Founded World Central Kitchen in 2010 to deliver meals in disaster and conflict zones.", website: "https://wck.org", sources: [w("José_Andrés")] },
  { slug: "melinda-french-gates", name: "Melinda French Gates", region: "usa", country: "United States", sectors: ["humanitarian"], role: "Philanthropist, founder of Pivotal Ventures", summary: "Co-led the Bill & Melinda Gates Foundation for over two decades and founded Pivotal Ventures, focused on women and families.", sources: [w("Melinda_French_Gates")] },
  { slug: "jimmy-carter", name: "Jimmy Carter", region: "usa", country: "United States", sectors: ["humanitarian", "civic"], role: "39th President of the United States", summary: "Through The Carter Center, became a major supporter of efforts to eradicate Guinea worm disease (dracunculiasis); 2002 Nobel Peace Prize laureate.", historical: true, lifespan: "1924–2024", sources: [w("Jimmy_Carter")] },

  /* Science & Innovation */
  { slug: "wangari-maathai", name: "Wangari Maathai", region: "africa", country: "Kenya", sectors: ["science", "humanitarian"], role: "Biologist, founder of the Green Belt Movement", summary: "First woman in East and Central Africa to earn a doctorate; founded the Green Belt Movement and received the 2004 Nobel Peace Prize.", historical: true, lifespan: "1940–2011", sources: [w("Wangari_Maathai")] },
  { slug: "juliana-rotich", name: "Juliana Rotich", region: "africa", country: "Kenya", sectors: ["science", "business"], role: "Technologist, co-founder of Ushahidi", summary: "Co-founded Ushahidi, open-source crisis-mapping software, and BRCK, a connectivity hardware company.", sources: [w("Juliana_Rotich")] },
  { slug: "tebello-nyokong", name: "Tebello Nyokong", region: "africa", country: "South Africa", sectors: ["science"], role: "Chemist, Rhodes University", summary: "Researches photodynamic therapy for cancer; recipient of the L'Oréal-UNESCO For Women in Science award in 2009.", sources: [w("Tebello_Nyokong")] },
  { slug: "jennifer-doudna", name: "Jennifer Doudna", region: "usa", country: "United States", sectors: ["science"], role: "Biochemist, UC Berkeley", summary: "Co-developed CRISPR-Cas9 genome editing; co-recipient of the 2020 Nobel Prize in Chemistry.", sources: [w("Jennifer_Doudna")] },
  { slug: "katalin-kariko", name: "Katalin Karikó", region: "usa", country: "United States / Hungary", sectors: ["science"], role: "Biochemist", summary: "Research on modified mRNA underpinned mRNA vaccines; co-recipient of the 2023 Nobel Prize in Physiology or Medicine.", sources: [w("Katalin_Karikó")] },
  { slug: "kizzmekia-corbett", name: "Kizzmekia Corbett-Helaire", region: "usa", country: "United States", sectors: ["science"], role: "Viral immunologist", summary: "Scientific lead at the US National Institutes of Health on research that contributed to the Moderna COVID-19 vaccine.", sources: [w("Kizzmekia_Corbett")] },

  /* Civic Leadership */
  { slug: "nelson-mandela", name: "Nelson Mandela", region: "africa", country: "South Africa", sectors: ["civic", "humanitarian"], role: "First democratically elected President of South Africa", summary: "Anti-apartheid leader imprisoned for 27 years; President 1994–1999 and co-recipient of the 1993 Nobel Peace Prize. Presented here as a memorial reference.", historical: true, lifespan: "1918–2013", website: "https://www.nelsonmandela.org", sources: [w("Nelson_Mandela"), { label: "Nelson Mandela Foundation", url: "https://www.nelsonmandela.org" }] },
  { slug: "ellen-johnson-sirleaf", name: "Ellen Johnson Sirleaf", region: "africa", country: "Liberia", sectors: ["civic"], role: "Former President of Liberia", summary: "President of Liberia 2006–2018, the first woman in Africa elected president of her country; co-recipient of the 2011 Nobel Peace Prize.", sources: [w("Ellen_Johnson_Sirleaf")] },
  { slug: "ngozi-okonjo-iweala", name: "Ngozi Okonjo-Iweala", region: "africa", country: "Nigeria", sectors: ["civic", "business"], role: "Director-General, World Trade Organization", summary: "Became the first woman and first African to lead the WTO in 2021, after serving twice as Nigeria's Finance Minister.", sources: [w("Ngozi_Okonjo-Iweala")] },
  { slug: "barack-obama", name: "Barack Obama", region: "usa", country: "United States", sectors: ["civic"], role: "44th President of the United States", summary: "President 2009–2017 and 2009 Nobel Peace Prize laureate; the Obama Foundation runs leadership programmes including in Africa.", website: "https://www.obama.org", sources: [w("Barack_Obama"), { label: "Obama Foundation", url: "https://www.obama.org" }] },
  { slug: "john-lewis", name: "John Lewis", region: "usa", country: "United States", sectors: ["civic"], role: "Civil rights leader and Congressman", summary: "Led the 1965 Selma march across the Edmund Pettus Bridge and served in Congress from 1987 until his death.", historical: true, lifespan: "1940–2020", sources: [w("John_Lewis")] },
  { slug: "stacey-abrams", name: "Stacey Abrams", region: "usa", country: "United States", sectors: ["civic"], role: "Voting-rights advocate and author", summary: "Founded Fair Fight Action to promote voter participation; former Minority Leader of the Georgia House of Representatives.", sources: [w("Stacey_Abrams")] },
];

export function getLeadersBySector(sector: ImpactSector, region?: ImpactRegion): ImpactLeader[] {
  return IMPACT_LEADERS.filter((l) => l.sectors.includes(sector) && (!region || l.region === region));
}
