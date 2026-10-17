export const CONTINENTS = [
  { value: 'africa', label: 'Africa', codes: 'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW RE YT SH EH' },
  { value: 'asia', label: 'Asia', codes: 'AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE HK MO' },
  { value: 'europe', label: 'Europe', codes: 'AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA AX FO GG GI IM JE SJ' },
  { value: 'north-america', label: 'North America & Caribbean', codes: 'AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US AI AW BM BQ VG KY CW GL GP MQ MS PR BL MF SX TC VI' },
  { value: 'south-america', label: 'South America', codes: 'AR BO BR CL CO EC GY PY PE SR UY VE FK GF' },
  { value: 'oceania', label: 'Oceania', codes: 'AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU AS CX CC CK PF GU NC NU NF MP PN TK UM WF' },
] as const;

export type ContinentId = typeof CONTINENTS[number]['value'];

const normalise = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const index = new Map<string, ContinentId>();
const locales = ['en', 'fr', 'ar', 'es', 'pt', 'sw', 'zh'];
const countryNames = locales.map((locale) => new Intl.DisplayNames([locale], { type: 'region' }));
for (const continent of CONTINENTS) {
  for (const code of continent.codes.split(' ')) {
    index.set(normalise(code), continent.value);
    for (const names of countryNames) {
      const name = names.of(code);
      if (name) index.set(normalise(name), continent.value);
    }
  }
}

const aliases: Record<string, ContinentId> = {
  uae: 'asia', 'u a e': 'asia', emirates: 'asia', 'emirats arabes unis': 'asia',
  drc: 'africa', rdc: 'africa', 'dr congo': 'africa', 'congo kinshasa': 'africa',
  'democratic republic of congo': 'africa', 'democratic republic of the congo': 'africa',
  'republique democratique du congo': 'africa', congo: 'africa', 'ivory coast': 'africa',
  uk: 'europe', england: 'europe', scotland: 'europe', wales: 'europe', kosovo: 'europe',
  usa: 'north-america', 'u s a': 'north-america', 'united states of america': 'north-america',
};
for (const [country, continent] of Object.entries(aliases)) index.set(normalise(country), continent);

/** Discovery grouping from the member's self-declared country, not nationality or verified location. */
export function countryToContinent(country: string): ContinentId | undefined {
  return index.get(normalise(country));
}
