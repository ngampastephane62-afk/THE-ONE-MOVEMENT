import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Real source components rendered with isolated hooks and safe UI boundaries.
// No browser, application server, Clerk, API, storage or database is contacted.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '../src');
const plain = x => JSON.parse(JSON.stringify(x));

function fixture({ reduced = false, search = '' } = {}) {
  const cache = new Map(), slots = [], effects = [], events = new Map();
  let cursor = 0, activeComponent, activeProps, tree;
  const listeners = new Map();
  const media = { matches: reduced, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name) };
  const mocks = {
    react: {
      ...React,
      useState(init) {
        const i = cursor++;
        if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init;
        return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }];
      },
      useRef: value => ({ current: value }),
      useEffect: effect => { effects.push(effect); },
      useMemo: value => value(),
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([key, value]) => [
      key, ['jsx', 'jsxs'].includes(key) ? (type, props, ...rest) => {
        if (props?.['data-testid']) events.set(props['data-testid'], props);
        return value(type, props, ...rest);
      } : value,
    ])),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children), useSearch: () => search },
    '@/lib/utils': { cn: (...items) => items.filter(Boolean).join(' ') },
    '@/components/network/kit': {
      Avatar: ({ m }) => React.createElement('span', { 'data-testid': 'avatar' }, m.avatarUrl ? 'Authorized photo' : 'Initials'),
      Badges: () => null,
    },
    [resolve(root, 'components/ecosystem/PersonaPicker.tsx')]: { default: () => null },
    [resolve(root, 'components/ecosystem/SectorDetail.tsx')]: { default: ({ sector }) => React.createElement('div', { 'data-testid': `panel-sector-${sector.slug}` }, sector.name) },
  };
  mocks[resolve(root, 'components/network/kit.tsx')] = mocks['@/components/network/kit'];
  function load(filename) {
    if (filename in mocks) return mocks[filename];
    if (cache.has(filename)) return cache.get(filename);
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText;
    const module = { exports: {} };
    runInNewContext(source, {
      module, exports: module.exports, URLSearchParams, URL,
      window: { matchMedia: () => media },
      require: id => {
        if (id.endsWith('.css')) return {};
        if (id in mocks) return mocks[id];
        if (id === 'lucide-react') return requireWeb(id);
        if (id === '@workspace/shared') return load(resolve(root, '../../../lib/shared/src/socialProfiles.ts'));
        if (id.startsWith('.') || id.startsWith('@/')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
          const local = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(local, `Known local source: ${id}`);
          return load(local);
        }
        assert.fail(`Unexpected runtime dependency forbidden: ${id}`);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  function render(path = activeComponent, props = activeProps ?? {}) {
    activeComponent = path; activeProps = props; cursor = 0; events.clear();
    tree = load(resolve(root, path)).default(props);
    return renderToStaticMarkup(tree);
  }
  return { load: path => load(resolve(root, path)), render, events, effects, media, listeners };
}

test('atlas contains all 17 canonical sectors and their individual existing explorer destinations', () => {
  const f = fixture(), html = f.render('components/home/MovementAtlas.tsx');
  const { SECTORS } = f.load('lib/sectors-data.ts');
  assert.equal(SECTORS.length, 17);
  for (const s of SECTORS) {
    assert.ok(html.includes(`href="/ecosystem?sector=${s.slug}#explore"`), s.slug);
    assert.ok(f.events.has(`link-atlas-sector-${s.slug}`));
  }
  assert.match(html, /Illustrative composition · not a map of members/);
  assert.doesNotMatch(html, /members online|live locations|active members/i);
});

test('atlas lists exactly six official programme links without an invented seventh programme', () => {
  const f = fixture();
  f.render('components/home/MovementAtlas.tsx');
  const { PROGRAMS } = f.load('lib/programs-data.ts');
  const expected = ['diplomatic-gala', 'summit', 'fashion-week', 'awards', 'fashion-night', 'investment-forum'];
  assert.deepEqual(plain(PROGRAMS.map(p => p.slug)).sort(), expected.sort());
  for (const slug of expected) assert.equal(f.events.get(`link-atlas-program-${slug}`).href, `/programs/${slug}`);
});

test('atlas pauses before visibility, supports manual pause and observes preference changes', () => {
  const f = fixture();
  assert.match(f.render('components/home/MovementAtlas.tsx'), /tomi-atlas is-paused/);
  const cleanup = f.effects[0]();
  assert.doesNotMatch(f.render(), /tomi-atlas is-paused/);
  f.events.get('button-atlas-motion').onClick();
  assert.match(f.render(), /tomi-atlas is-paused/);
  f.events.get('button-atlas-motion').onClick();
  f.render();
  f.media.matches = true;
  f.listeners.get('change')();
  assert.match(f.render(), /Reduced motion enabled/);
  assert.equal(f.events.get('button-atlas-motion').disabled, true);
  cleanup();
  assert.equal(f.listeners.size, 0);
});

test('reduced-motion visitor receives a static atlas and cannot override the system preference', () => {
  const f = fixture({ reduced: true });
  const html = f.render('components/home/MovementAtlas.tsx');
  assert.match(html, /tomi-atlas is-paused/);
  assert.match(html, /Reduced motion enabled/);
  assert.equal(f.events.get('button-atlas-motion')['aria-pressed'], true);
  assert.equal(f.events.get('button-atlas-motion').disabled, true);
});

test('sector URL parsing is allowlisted, optional and never saved as a preference', () => {
  const f = fixture(), location = f.load('components/ecosystem/sector-location.ts');
  for (const { slug } of f.load('lib/sectors-data.ts').SECTORS) {
    const href = location.sectorDestination(slug);
    assert.equal(location.sectorFromSearch(new URL(href, 'https://fixture.invalid').search), slug);
  }
  assert.equal(location.sectorFromSearch('?sector=unknown'), 'fashion');
  assert.equal(location.sectorFromSearch(''), 'fashion');
  assert.equal(location.sectorDestination('javascript:invalid'), '/ecosystem#explore');
  const source = readFileSync(resolve(root, 'components/ecosystem/sector-location.ts'), 'utf8');
  assert.doesNotMatch(source, /localStorage|fetch\(|mutate\(|useAct/);
});

test('all sector gateways remain buttons with explicit selection and usable detail panels', () => {
  const f = fixture();
  const html = f.render('components/ecosystem/SectorExplorer.tsx');
  for (const { slug } of f.load('lib/sectors-data.ts').SECTORS) {
    const control = f.events.get(`button-sector-${slug}`);
    assert.equal(control.type, 'button');
    assert.equal(typeof control['aria-pressed'], 'boolean');
  }
  assert.match(html, /Gateway 01 of 17/);
  f.events.get('button-sector-health-care').onClick();
  assert.match(f.render(), /panel-sector-health-care/);
  assert.equal(f.events.get('button-sector-health-care')['aria-pressed'], true);
});

test('sector filtering retains its accessible empty state and clear action', () => {
  const f = fixture();
  f.render('components/ecosystem/SectorExplorer.tsx');
  f.events.get('input-sector-search').onChange({ target: { value: 'no-sector-matches-this' } });
  assert.match(f.render(), /No sector matches/);
  f.events.get('button-clear-filters').onClick();
  assert.match(f.render(), /17 of 17 gateways/);
});

test('editorial Chapter exposes real headings and preserves optional actions', () => {
  const f = fixture();
  const html = f.render('components/editorial/Chapter.tsx', {
    as: 'h2', id: 'fixture-title', index: '02', title: 'A shared mission',
    tone: 'dark', aside: React.createElement('a', { href: '/join' }, 'Join'),
  });
  assert.match(html, /<h2 id="fixture-title"/);
  assert.match(html, /data-tone="dark"/);
  assert.match(html, /href="\/join"/);
});

test('people and opportunity paths point only to real existing public routes', () => {
  const f = fixture(), html = f.render('components/home/MovementPaths.tsx');
  for (const href of ['/community', '/ambassadors', '/opportunities']) assert.ok(html.includes(`href="${href}"`));
  assert.doesNotMatch(html, /confirmed speakers|guaranteed|live members|members online/i);
});

test('all three profile layouts display only provided information, not future private fields', () => {
  const member = {
    fullName: 'Chosen Display Name', profession: '', organization: '', country: '',
    website: '', avatarUrl: null, coverUrl: null, badges: [], privateSentinel: 'hidden account data',
  };
  for (const layout of ['immersive', 'centered', 'editorial']) {
    const f = fixture();
    const html = f.render('components/network/ProfileHero.tsx', { m: member, layout, coverPosition: 50 });
    assert.ok(html.includes(`profile-hero-${layout}`));
    assert.match(html, /Chosen Display Name/);
    assert.doesNotMatch(html, /hidden account data|Nationality|Residence|Languages|verified account/i);
    assert.doesNotMatch(html, /data-testid="text-profile-role"/);
  }
});

test('programme accents are defined for precisely the six official slugs', () => {
  const f = fixture();
  const source = readFileSync(resolve(root, 'styles/universe.css'), 'utf8');
  const slugs = [...source.matchAll(/data-program='([^']+)'/g)].map(m => m[1]);
  assert.deepEqual(slugs.sort(), plain(f.load('lib/programs-data.ts').PROGRAMS.map(p => p.slug)).sort());
});

test('new motion has reduced-motion fallbacks and visible keyboard-focus treatments', () => {
  const css = readFileSync(resolve(root, 'styles/universe.css'), 'utf8');
  const global = readFileSync(resolve(root, 'index.css'), 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.tomi-chapter-anim\s*\{\s*animation: none/);
  assert.match(css, /\.tomi-gateway:focus-visible/);
  assert.match(global, /prefers-reduced-motion: reduce[\s\S]*tomi-atlas-spin[\s\S]*animation: none/);
  assert.match(global, /\.tomi-atlas\.is-paused \.tomi-atlas-spin/);
  assert.match(global, /\.tomi-atlas-row:focus-visible/);
});
