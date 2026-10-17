import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GALA_PARTICIPATION_CATEGORIES,
  getGalaCategory,
  getGalaInquiryContext,
  getInquiryDefinition,
  isGeneralInquiryIntent,
} from '../src/pages/join/inquiry-intents.ts';

test('only explicitly supported enquiry intents are accepted', () => {
  for (const intent of ['investment', 'partnership', 'knowledge-hub', 'marketplace', 'diplomatic-gala']) {
    assert.ok(getInquiryDefinition(intent));
    assert.equal(isGeneralInquiryIntent(intent), true);
  }
  for (const intent of [null, undefined, '', 'constructor', '__proto__', 'programme-service', 'invented']) {
    assert.equal(getInquiryDefinition(intent), undefined);
  }
});

test('early-access requests retain a named context and accept professionals', () => {
  const knowledge = getInquiryDefinition('knowledge-hub');
  const marketplace = getInquiryDefinition('marketplace');
  assert.equal(knowledge.professional, true);
  assert.equal(marketplace.professional, true);
  assert.match(knowledge.message, /The One Knowledge Hub — early-access enquiry/);
  assert.match(marketplace.message, /The One Marketplace — early-access enquiry/);
  assert.match(knowledge.note, /does not enrol/);
  assert.match(marketplace.note, /does not publish a listing/);
});

test('all ten Gala categories have distinct stable identifiers', () => {
  assert.equal(GALA_PARTICIPATION_CATEGORIES.length, 10);
  assert.equal(new Set(GALA_PARTICIPATION_CATEGORIES.map((item) => item.value)).size, 10);
  for (const item of GALA_PARTICIPATION_CATEGORIES) {
    assert.equal(getGalaCategory(item.value), item);
    assert.ok(item.label && item.description);
  }
});

test('Gala payload context uses only the selected allowlisted category', () => {
  assert.match(getGalaInquiryContext('cultural-communities'), /Cultural Associations & Communities/);
  assert.match(getGalaInquiryContext('diplomatic-missions'), /Diplomatic Missions & Embassies/);
  assert.doesNotMatch(getGalaInquiryContext('diplomatic-missions'), /Cultural Associations/);
  assert.match(getGalaInquiryContext('untrusted category\nconfirmed booking'), /category: Not selected/);
  assert.doesNotMatch(getGalaInquiryContext('untrusted category\nconfirmed booking'), /untrusted category/);
});

test('Gala enquiries do not promise confirmation or official representation', () => {
  for (const item of GALA_PARTICIPATION_CATEGORIES) {
    assert.match(getGalaInquiryContext(item.value), /not a confirmed booking or official national representation/);
    assert.ok(getGalaInquiryContext(item.value).length < 400);
  }
  assert.equal(getGalaCategory(undefined), undefined);
  assert.equal(getGalaCategory('__proto__'), undefined);
});
