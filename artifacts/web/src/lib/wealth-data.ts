export type WealthEstimate = { display: string; date: string; source: string; publisher: string; scope?: string; note?: string };
const f = (slug: string, display: string, date = "2026-10-16", scope?: string): WealthEstimate => ({
  display, date, scope, publisher: "Forbes", source: `https://www.forbes.com/profile/${slug}/`,
});
export const WEALTH_ESTIMATES: Record<string, WealthEstimate> = {
  "aliko-dangote": f("aliko-dangote", "US$51 billion", "2026-10-14"),
  "strive-masiyiwa": f("strive-masiyiwa", "US$2.2 billion"),
  "patrice-motsepe": f("patrice-motsepe", "US$3.4 billion", "2026-10-14"),
  "oprah-winfrey": f("oprah-winfrey", "US$3.4 billion"),
  "jay-z": f("jay-z", "US$2.8 billion", "2026-10-15"),
  "tyler-perry": f("tyler-perry", "US$1.4 billion"),
  "melinda-french-gates": f("melinda-french-gates", "US$34.3 billion"),
  "bernard-arnault": f("bernard-arnault", "US$120.1 billion", "2026-10-16", "Individual & family"),
  "mukesh-ambani": f("mukesh-ambani", "US$82.5 billion"),
  "jorge-paulo-lemann": f("jorge-paulo-lemann", "US$19.8 billion", "2026-10-16", "Individual & family"),
  "gina-rinehart": f("gina-rinehart", "US$24.9 billion"),
  "kevin-hart": { display: "US$300 million", date: "Consulted 2026-10-16", publisher: "Celebrity Net Worth", source: "https://www.celebritynetworth.com/richest-celebrities/richest-comedians/kevin-hart-net-worth/", note: "Third-party estimate, not an audited disclosure. Other publications report different figures." },
  "ciara": { display: "US$20 million", date: "Consulted 2026-10-16", publisher: "Celebrity Net Worth", source: "https://www.celebritynetworth.com/richest-celebrities/singers/ciara-net-worth/", note: "Third-party estimate, not an audited disclosure." },
  "winnie-harlow": { display: "US$5 million", date: "Consulted 2026-10-16", publisher: "Celebrity Net Worth", source: "https://www.celebritynetworth.com/richest-celebrities/models/winnie-harlow-net-worth/", note: "Third-party estimate, not an audited disclosure." },
};
