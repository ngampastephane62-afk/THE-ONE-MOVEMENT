import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRAMME_TOPICS, programmeTopicIds } from '../src/lib/programme-learning.ts';

test('fourteen distinct topics provide substantive learning notes, prompts and HTTPS sources', () => {
  assert.equal(PROGRAMME_TOPICS.length, 14);
  assert.equal(new Set(PROGRAMME_TOPICS.map((topic) => topic.id)).size, 14);
  for (const topic of PROGRAMME_TOPICS) {
    assert.ok(topic.intro.length > 200, topic.id);
    assert.equal(topic.prompts.length, 3, topic.id);
    assert.ok(topic.question.endsWith('?'), topic.id);
    assert.equal(new URL(topic.resource.url).protocol, 'https:');
    assert.ok(topic.resource.publisher && topic.resource.format && topic.resource.title);
  }
});

test('all six programmes start from configured relevant topics without hiding the wider collection', () => {
  const ids = new Set(PROGRAMME_TOPICS.map((topic) => topic.id));
  for (const slug of ['summit', 'diplomatic-gala', 'fashion-week', 'fashion-night', 'awards', 'investment-forum', 'unknown']) {
    const related = programmeTopicIds(slug);
    assert.ok(related.length >= 3);
    assert.equal(new Set(related).size, related.length);
    for (const id of related) assert.ok(ids.has(id), `${slug}: ${id}`);
    assert.ok(related.length < ids.size);
  }
});

test('sensitive and imagined subjects keep the necessary distinctions', () => {
  const intro = (id) => PROGRAMME_TOPICS.find((topic) => topic.id === id).intro;
  assert.match(intro('antiquity-myth'), /not a scientific account/);
  assert.match(intro('fiction-literature'), /distinct from historical evidence/);
  assert.match(intro('health-medicine'), /must not be presented as diagnosis/);
  assert.match(intro('materials-mining'), /does not establish ownership/);
  assert.match(intro('business-investment'), /does not recommend a transaction/);
  assert.match(intro('journeys-motivation'), /not a TOMI endorsement/);
});
