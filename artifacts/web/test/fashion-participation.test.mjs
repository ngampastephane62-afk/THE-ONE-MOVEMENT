import test from 'node:test';
import assert from 'node:assert/strict';
import { FASHION_CATEGORIES, DESIGNER_PACKAGES, getFashionCategory, getFashionInquiryContext, getDesignerApplicationPath } from '../src/lib/fashion-participation.ts';
import { CONTINENTS, countryToContinent } from '../src/lib/member-continents.ts';

test('all twelve professional categories have distinct real application identifiers', () => {
  assert.equal(FASHION_CATEGORIES.length, 12);
  assert.equal(new Set(FASHION_CATEGORIES.map((item) => item.value)).size, 12);
  for (const category of FASHION_CATEGORIES) {
    assert.equal(getFashionCategory(category.value), category);
    assert.ok(category.benefits.length > 0 && category.conditions);
    assert.match(getFashionInquiryContext(category.value), new RegExp(category.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.equal(FASHION_CATEGORIES.filter((item) => item.designerPackages).length, 1);
  assert.equal(getFashionCategory('__proto__'), undefined);
});

test('designer prices remain catalogue cents and no extra packages are created', () => {
  assert.deepEqual(DESIGNER_PACKAGES.map((item) => [item.slug, item.amount]), [
    ['designer-silver', 200000], ['designer-gold', 500000], ['designer-gold-premium', 600000],
    ['designer-diamond', 1000000], ['designer-platinum', 2000000],
  ]);
  for (const item of DESIGNER_PACKAGES) {
    assert.equal(item.currency, 'usd');
    assert.equal(item.durationMonths, 12);
    assert.ok(item.benefits.length > 0 && item.conditions);
  }
  assert.equal(DESIGNER_PACKAGES.find((item) => item.slug === 'designer-diamond').travel, 'Not included');
});

test('fashion proposals preserve review and selection boundaries', () => {
  const context = getFashionInquiryContext('experts-educators');
  assert.match(context, /Experts, Educators & Fashion Schools/);
  assert.match(context, /subject to review and written terms/);
  assert.ok(context.length < 400);
  assert.doesNotMatch(getFashionInquiryContext('arbitrary input'), /arbitrary input/);
});

test('package sign-in return destinations are restricted to configured designer packages', () => {
  assert.equal(getDesignerApplicationPath('designer-gold'), '/member/certifications?package=designer-gold&role=designer&program=fashion-week');
  for (const slug of [null, '', '//example.com', 'https://example.com', '__proto__', 'official-sponsor']) {
    assert.equal(getDesignerApplicationPath(slug), undefined);
  }
});

test('continent discovery uses only recognisable self-declared country values', () => {
  assert.equal(CONTINENTS.length, 6);
  for (const name of ['FR', 'France', 'france']) assert.equal(countryToContinent(name), 'europe');
  for (const name of ['RDC', 'DRC', 'Democratic Republic of the Congo', 'Kenya', 'Côte d’Ivoire']) assert.equal(countryToContinent(name), 'africa');
  for (const name of ['UAE', 'United Arab Emirates', 'India']) assert.equal(countryToContinent(name), 'asia');
  assert.equal(countryToContinent('USA'), 'north-america');
  assert.equal(countryToContinent('Brazil'), 'south-america');
  assert.equal(countryToContinent('Australia'), 'oceania');
  for (const name of ['', 'unknown', 'global', 'Dubai', 'user-defined market']) assert.equal(countryToContinent(name), undefined);
});
