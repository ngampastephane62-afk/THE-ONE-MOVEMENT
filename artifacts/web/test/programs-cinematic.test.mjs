import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react'), runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = fileURLToPath(new URL('../src/', import.meta.url));
const approved = JSON.parse(readFileSync(new URL('./fixtures/programs-approved.json', import.meta.url), 'utf8'));
const read = p => readFileSync(path.join(root, p), 'utf8');
const page = 'pages/programs/index.tsx';
const image = kind => ({ children, ...props }) => React.createElement('div', {
  'data-approved-image': kind, 'data-photo-id': props.id || props.slug || props.programme,
}, children);

function load(relative, mocks, cache = new Map()) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const source = readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', '"/nested/"');
  const code = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  }}).outputText;
  runInNewContext(code, {
    module, exports: module.exports,
    require(id) {
      if (id in mocks) return mocks[id];
      if (id.endsWith('.css')) return {};
      if (id.startsWith('.') || id.startsWith('@/')) {
        const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
        const resolved = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'].map(x => base + x).find(existsSync);
        assert.ok(resolved, `Cannot resolve ${id}`);
        return load(path.relative(root, resolved), mocks, cache);
      }
      return requireWeb(id);
    },
  });
  return module.exports;
}

test('the six approved programme names, descriptions, dates and slugs are unchanged', () => {
  const source = ts.createSourceFile(page, read(page), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let rows;
  function walk(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText(source) === 'PROGRAMS') {
      rows = n.initializer.elements.map(o => Object.fromEntries(o.properties.map(p => [p.name.getText(source), p.initializer.text])));
    }
    ts.forEachChild(n, walk);
  }
  walk(source);
  assert.deepEqual(rows, approved);
});

test('visible-first rendering keeps all six selected image components, destinations and separate real-action slots', () => {
  const actions = [];
  const mocks = {
    'react-helmet-async': { Helmet: () => null },
    wouter: { Link: ({ href, children, ...p }) => React.createElement('a', { href, ...p }, children) },
    '@/components/HeroSurface': { default: ({ children }) => React.createElement('section', {}, children) },
    '@/components/GoldThread': { default: () => React.createElement('hr') },
    '@/components/StatBlock': { default: ({ label }) => React.createElement('span', {}, label) },
    '@/components/ArchivePhoto': { default: image('archive') },
    '@/components/ProgramVision': { default: image('vision') },
    '@/components/programs/ProgrammeCover': { default: image('cover') },
    '@/components/programs/ProgramSuppliedImage': { default: image('supplied') },
    '@/components/programs/ProgrammeFilm': { ProgrammeFilmPoster: image('film') },
    '@/components/DiplomaticGalaMedia': { DiplomaticGalaPreview: image('gala') },
    '@/lib/cover-media': { programCardMedia: slug => ({ source: `approved-${slug}`, title: slug }) },
    '@/components/ui/button': { Button: ({ children }) => React.createElement('div', {}, children) },
    ...Object.fromEntries(['Photo', 'Video'].map(kind => [`@/components/editorial/${kind}Actions`, {
      default: p => { actions.push({ kind, ...p }); return React.createElement('div', { 'data-real-action-slot': kind }); },
    }])),
  };
  const Page = load(page, mocks).default;
  const html = renderToStaticMarkup(React.createElement(Page));
  const text = html.replace(/<[^>]*>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  assert.match(text, /THE HEARTBEAT OF THE MOVEMENT\./);
  assert.match(text, /EVERY PROGRAM FEEDS THE ECOSYSTEM/);
  for (const p of approved) {
    assert.ok(text.includes(p.name));
    assert.ok(text.includes(p.desc));
    assert.ok(html.includes(`href="/programs/${p.slug}"`));
  }
  for (const [kind, id] of [['gala', undefined], ['archive', 'summit-goma'], ['cover', 'fashion-week'], ['film', 'awards-rosina-2027'], ['supplied', 'fashion-night'], ['supplied', 'investment-forum']]) {
    assert.ok(html.includes(`data-approved-image="${kind}"`));
    if (id) assert.ok(html.includes(`data-photo-id="${id}"`));
  }
  assert.equal(actions.length, 6);
  assert.equal(actions.filter(a => a.kind === 'Video').length, 2);
  assert.ok(actions.every(a => a.layout === 'row' && a.shareExtrasBelow === true && a.tone === 'dark'));
  assert.equal((html.match(/<\/a><div class="pgm-actions">/g) || []).length, 6);
  assert.match(html, /data-still="false"/);
  assert.match(html, /id="official-programs"/);
  assert.doesNotMatch(html, /data-armed="true"|<video/);
});

test('pause, reduced motion, offscreen motion and the strict decorative layer stack have explicit safeguards', () => {
  const css = read('pages/programs/programs-motion.css');
  for (let layer = 0; layer < 4; layer++) assert.match(css, new RegExp(`\\.pgm-l${layer} \\{[^}]*z-index: ${layer}`));
  assert.match(css, /\.pgm-l1 \*,/);
  assert.match(css, /pgm-word-mask:not\(:last-child\).*margin-inline-end/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /data-still='true'[\s\S]*opacity: 1 !important/);
  assert.match(css, /data-hidden='true'/);
  assert.match(css, /data-off='true'/);
  const motion = read('pages/programs/ProgramsMotion.tsx');
  assert.match(motion, /typeof IntersectionObserver === 'undefined'/);
  assert.match(motion, /focusin/);
  assert.match(motion, /pointer: fine/);
  assert.match(motion, /visibilitychange/);
  assert.doesNotMatch(motion + read(page), /from ['"](?:three|gsap|framer-motion)/);
});

test('the opt-in secondary share trigger opens the existing menu and other action layouts stay unchanged', () => {
  function fixture(props) {
    const states = [], events = new Map();
    let cursor = 0;
    const mocks = {
      react: { ...React, useState: initial => {
        const i = cursor++;
        if (!(i in states)) states[i] = initial;
        return [states[i], v => { states[i] = v; }];
      }},
      'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [name,
        ['jsx', 'jsxs'].includes(name) ? (type, p, ...rest) => {
          if (p?.['data-testid']) events.set(p['data-testid'], p);
          return fn(type, p, ...rest);
        } : fn,
      ])),
      '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
      '@/lib/media-share': { mediaShareUrl: () => '', videoShareUrl: () => '' },
      '@/hooks/use-media-engagement': {
        engagementErrorMessage: () => '',
        useMediaEngagement: () => ({
          q: { data: { likes: 3, liked: false, comments: [] }, isLoading: false },
          m: { isPending: false }, signedIn: true, isLoaded: true, founder: false,
        }),
      },
    };
    const Actions = load('components/editorial/MediaActions.tsx', mocks).default;
    return { events, render: () => {
      cursor = 0; events.clear();
      return renderToStaticMarkup(React.createElement(Actions, { source: '/approved.webp', title: 'Approved photo', ...props }));
    }};
  }
  const f = fixture({ layout: 'row', shareExtrasBelow: true });
  const html = f.render();
  assert.match(html, /tomi-actions-row/);
  assert.match(html, /More ways to share/);
  assert.doesNotMatch(html, /data-testid="menu-share-approved-webp"/);
  f.events.get('button-more-share-approved-webp').onClick();
  assert.match(f.render(), /data-testid="menu-share-approved-webp"/);
  assert.equal(f.events.get('button-more-share-approved-webp')['aria-expanded'], true);
  assert.ok(f.events.has('button-copy-approved-webp'));
  const originalRow = fixture({ layout: 'row' });
  assert.doesNotMatch(originalRow.render(), /button-more-share-approved-webp/);
  const originalCompact = fixture({ compact: true });
  assert.match(originalCompact.render(), /More ways to share/);
});
