import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const root = new URL('../src/', import.meta.url);

// Approved content at the start of the cinematic redesign. This frontend-only
// task changes presentation, never canonical identities or public mappings.
test('cinematic discovery preserves official sectors, resource mappings and real search index', () => {
  const approved = {
    'lib/sectors-data.ts': 'a79c6f39294a523660e5d4756a86556acacf1af6ac99b17d7a9eb390b847905e',
    'lib/ecosystem-resources.ts': 'd6b1a8436353a87d5a4cb49d7cd0df31e242185a459a6137eb1122cb7f1cb13b',
    'components/discovery/discovery-index.ts': 'ad005b5a6b1482649ebef2c47f4f135a278389623b67471b0e83b680c959f72c',
    'components/ecosystem/worlds/world-config.ts': 'cc5b915000d69196f85b6e50d36da83e2013e6bc7a6e1524459fe01ccca4508f',
  };
  for (const [path, fingerprint] of Object.entries(approved)) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex'), fingerprint, path);
  }
});

test('Founder world images remain optimized local assets, not bundled reference footage', () => {
  for (const name of ['founder-world-earth.webp', 'founder-world-gold.webp']) {
    const bytes = readFileSync(new URL(`../public/images/vision/${name}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(bytes.length < 250_000, `${name} stays suitable for mobile`);
  }
});

test('motion observers work with tall mobile sections and never hide unarmed content', () => {
  const hook = readFileSync(new URL('components/ecosystem/exhibition/useStage.ts', root), 'utf8');
  assert.match(hook, /threshold: 0/);
  assert.match(hook, /armed \? \{ 'data-seen'/);
  assert.match(hook, /typeof IntersectionObserver === 'undefined'/);
  assert.match(hook, /focusin/);
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /onScreen && !hidden && !reduced/);
  const css = readFileSync(new URL('styles/exhibition.css', root), 'utf8');
  assert.match(css, /eco-paused[\s\S]*opacity: 1 !important/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.eco-x \.x-decor \*/);
});

test('public deep links, direct world entry and symbolic-key boundaries remain explicit', () => {
  const page = readFileSync(new URL('pages/ecosystem/index.tsx', root), 'utf8');
  assert.match(page, /sectorFromSearch\(search\)/);
  assert.match(page, /\['explore', 'discover', 'one-key-passage'\]/);
  assert.doesNotMatch(page, /pushState|replaceState/);
  const explorer = readFileSync(new URL('components/ecosystem/SectorExplorer.tsx', root), 'utf8');
  assert.match(explorer, /<details[\s\S]*Personalize your discovery/);
  assert.match(explorer, /button-enter-world/);
  assert.match(explorer, /motif: c\?\.motif \?\? \('skyline' as const\)/);
  const passage = readFileSync(new URL('components/ecosystem/exhibition/KeyPassage.tsx', root), 'utf8');
  assert.match(passage, /symbol of discovery, not a product/);
  assert.match(passage, /if \(still \|\| typeof IntersectionObserver === 'undefined'\)/);
  assert.match(passage, /if \(hidden\) return/);
});
