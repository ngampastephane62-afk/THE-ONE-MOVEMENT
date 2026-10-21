import snapshot from './countries.json';

/** Compact derivative of mledoze/countries, ODbL 1.0. See countries.LICENSE.txt.
 * Geographic groupings describe the source dataset, not political endorsement.
 * No visitor location, nationality or profile information is used.
 */
export interface Country {
  code: string;
  name: string;
  officialName: string;
  nativeNames: string[];
  region: string;
  subregion: string;
  /** Appropriate source geographic grouping; Americas remains unsplit. */
  continents: string[];
}

export const COUNTRIES: Country[] = snapshot;
export const COUNTRY_DATA_SOURCE = {
  name: 'mledoze/countries',
  url: 'https://github.com/mledoze/countries',
  license: 'ODbL 1.0',
  licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
  snapshotDate: '2026-10-21',
} as const;

export const GRATITUDE_THEMES = [
  'My Country',
  'My Community',
  'People Who Inspired Me',
  'Leadership & Positive Change',
  'Culture & Heritage',
  'Peace & Solidarity',
];

const displayNames = new Map<string, Intl.DisplayNames | null>();
export function countryLabel(country: Country, locale = 'en'): string {
  if (!displayNames.has(locale)) {
    try {
      displayNames.set(locale, new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' }));
    } catch {
      // Unsupported locales or older browsers retain the source English name.
      displayNames.set(locale, null);
    }
  }
  return displayNames.get(locale)?.of(country.code) || country.name;
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

export function searchCountries(query: string, locale = 'en'): Country[] {
  const needle = normalize(query.trim());
  return COUNTRIES.filter(country => !needle || normalize([
    country.code, country.name, country.officialName,
    countryLabel(country, locale), ...country.nativeNames,
  ].join(' ')).includes(needle)).sort((a, b) => countryLabel(a, locale).localeCompare(countryLabel(b, locale)));
}
