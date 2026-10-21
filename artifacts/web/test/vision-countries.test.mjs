import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const folder = new URL('../src/pages/our-vision/', import.meta.url);
const records = JSON.parse(readFileSync(new URL('countries.json', folder), 'utf8'));
const module = { exports: {} };
runInNewContext(ts.transpileModule(readFileSync(new URL('country-data.ts', folder), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, {
  module, exports: module.exports,
  require(id) { assert.equal(id, './countries.json'); return records; },
});
const { COUNTRIES, countryLabel, searchCountries, GRATITUDE_THEMES, COUNTRY_DATA_SOURCE } = module.exports;

test('Local maintained-source snapshot covers countries and territories with unique two-letter codes and valid geography', () => {
  assert.ok(COUNTRIES.length >= 249);
  assert.equal(new Set(COUNTRIES.map(c => c.code)).size, COUNTRIES.length);
  for (const c of COUNTRIES) {
    assert.match(c.code, /^[A-Z]{2}$/);
    assert.ok(c.name && c.officialName && c.region && c.subregion);
    assert.ok(c.continents.length > 0 && c.continents.every(Boolean));
    assert.ok(Array.isArray(c.nativeNames));
  }
});

test('Geography retains source classifications, including Americas as an appropriate grouping', () => {
  const cd = COUNTRIES.find(c => c.code === 'CD');
  const ae = COUNTRIES.find(c => c.code === 'AE');
  assert.equal(cd.subregion, 'Middle Africa');
  assert.equal(ae.subregion, 'Western Asia');
  assert.equal(ae.continents[0], 'Asia');
  assert.equal(COUNTRIES.find(c => c.code === 'US').continents[0], 'Americas');
  assert.equal(COUNTRIES.find(c => c.code === 'AQ').continents[0], 'Antarctica');
});

test('Search supports ISO codes, accents, case, trimming, English and native names', () => {
  assert.ok(searchCountries('  cd  ').some(c => c.code === 'CD'));
  assert.ok(searchCountries('cote', 'fr').some(c => c.code === 'CI'));
  assert.ok(searchCountries('CONGO').some(c => c.code === 'CD'));
  assert.ok(searchCountries('الإمارات', 'ar').some(c => c.code === 'AE'));
  assert.ok(searchCountries('Francia', 'es').some(c => c.code === 'FR'));
  assert.equal(searchCountries('zzznocountry123').length, 0);
});

test('Clearing search restores every choice without mutating the source; selection needs no nationality', () => {
  const original = COUNTRIES.map(c => c.code).join(',');
  searchCountries('south');
  assert.equal(searchCountries('').length, COUNTRIES.length);
  assert.equal(COUNTRIES.map(c => c.code).join(','), original);
  assert.doesNotMatch(readFileSync(new URL('country-data.ts', folder), 'utf8'), /fetch\(|localStorage|geolocation|navigator\./);
});

test('International labels work with a defined fallback for unavailable browser locale support', () => {
  const de = COUNTRIES.find(c => c.code === 'DE');
  assert.equal(countryLabel(de, 'fr'), 'Allemagne');
  assert.equal(countryLabel(de, 'not_a_locale'), de.name);
  assert.ok(countryLabel(COUNTRIES.find(c => c.code === 'AE'), 'ar'));
});

test('All six exact gratitude themes and dataset attribution are retained under the source license', () => {
  assert.deepEqual([...GRATITUDE_THEMES], [
    'My Country', 'My Community', 'People Who Inspired Me',
    'Leadership & Positive Change', 'Culture & Heritage', 'Peace & Solidarity',
  ]);
  assert.equal(COUNTRY_DATA_SOURCE.license, 'ODbL 1.0');
  assert.equal(COUNTRY_DATA_SOURCE.url, 'https://github.com/mledoze/countries');
  assert.match(readFileSync(new URL('countries.LICENSE.txt', folder), 'utf8'), /ODC Open Database License/);
});
