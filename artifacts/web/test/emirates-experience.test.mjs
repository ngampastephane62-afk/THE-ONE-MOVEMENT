import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Offline rendering and interaction fixtures. No account, submission or DB writes.
const root = resolve(import.meta.dirname, '../src');
const web = createRequire(new URL('../package.json', import.meta.url));
const React = web('react');
const runtime = web('react/jsx-runtime');
const { renderToStaticMarkup } = web('react-dom/server');
const read = p => readFileSync(resolve(root, p), 'utf8');
const plain = v => JSON.parse(JSON.stringify(v));
const regionSource = readFileSync(resolve(root, '../../../lib/shared/src/impactLeaders.ts'), 'utf8');
const impact = runInNewContext(`(${regionSource.match(/export const IMPACT_REGIONS[^=]*=\s*(\[[\s\S]*?\n\]);/)[1]})`);
const world = { id: 6, slug: 'thanks-the-world', name: 'THANKS THE WORLD', status: 'active', parentId: null, identity: { style: 'global' } };

function fixture(extra = {}) {
  const cache = new Map(), events = new Map();
  const motion = { useEmReveal: () => ({ current: null }), useEmAmbient: () => ({ current: null }),
    useEmiratesMotion: () => ({ paused: false, toggle: () => {} }), useSwipe: () => ({}) };
  const mocks = {
    react: React,
    'react/jsx-runtime': { ...runtime,
      jsx: (type, p, ...rest) => { if (p?.['data-testid']) events.set(p['data-testid'], p); return runtime.jsx(type, p, ...rest); },
      jsxs: (type, p, ...rest) => { if (p?.['data-testid']) events.set(p['data-testid'], p); return runtime.jsxs(type, p, ...rest); },
    },
    wouter: { Link: ({ children, ...p }) => React.createElement('a', p, children) },
    '@workspace/shared': { IMPACT_REGIONS: impact },
    '@/lib/utils': { cn: (...v) => v.filter(Boolean).join(' ') },
    './use-emirates-motion': motion,
    '@/components/editorial/EmiratesHero': { default: ({ children }) => React.createElement('section', { 'data-approved-hero': true }, children) },
    '@/components/GoldThread': { default: () => null },
    '@/components/editorial/PersonPortrait': {
      default: ({ slug, name, contain, className }) => React.createElement('figure', { 'data-portrait': slug, 'data-contain': contain, className, 'aria-label': name }),
      PortraitCredit: ({ slug }) => React.createElement('span', { 'data-credit': slug }, 'Original photo credit'),
      PortraitActions: ({ slug }) => React.createElement('span', { 'data-reactions': slug }),
    },
    '@radix-ui/react-dialog': Object.fromEntries(['Root', 'Portal', 'Overlay', 'Content', 'Close', 'Title', 'Description'].map(name => [name,
      ({ children, asChild, open, onOpenChange, ...p }) => name === 'Root' && !open ? null :
        React.createElement(name === 'Close' ? 'button' : 'div', p, children),
    ])),
    '@workspace/api-client-react': {
      getGetGratitudeOptionsQueryKey: () => ['/api/gratitude/options'],
      useGetGratitudeOptions: () => ({ data: { campaigns: [world], countries: [] }, isLoading: false, isError: false, refetch() {} }),
    },
    '@/components/network/kit': { ErrorBox: ({ children }) => React.createElement('div', { role: 'alert' }, children), Skeleton: () => React.createElement('div', { 'aria-busy': true }) },
    ...extra,
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
    const module = { exports: {} };
    cache.set(file, module.exports);
    const code = ts.transpileModule(readFileSync(file, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/'"), {
      fileName: file, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(code, { module, exports: module.exports, URL, console, require: id => {
      if (id in mocks) return mocks[id];
      if (id.endsWith('.css')) return {};
      if (id === 'lucide-react') return web(id);
      if (id.startsWith('.') || id.startsWith('@/')) {
        const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(file), id);
        const found = ['', '.ts', '.tsx', '.json'].map(ext => base + ext).find(existsSync);
        assert.ok(found, `Local import ${id}`); return load(found);
      }
      assert.fail(`Unexpected runtime import ${id}`);
    } }, { filename: file });
    cache.set(file, module.exports); return module.exports;
  }
  return { load: p => load(resolve(root, p)), events,
    render: (Component, props) => { events.clear(); return renderToStaticMarkup(React.createElement(Component, props)); } };
}

const model = fixture().load('lib/emirates-experience.ts');
test('all seven emirates retain the verified distinct ruler identities and official source', () => {
  assert.equal(model.SEVEN_EMIRATES.length, 7);
  assert.equal(new Set(model.SEVEN_EMIRATES.map(e => e.id)).size, 7);
  assert.equal(new Set(model.SEVEN_EMIRATES.map(e => e.rulerSlug)).size, 7);
  for (const e of model.SEVEN_EMIRATES) {
    const p = model.emirateRuler(e);
    assert.ok(p?.name); assert.match(p.source, /^https:\/\/uaecabinet\.ae\//);
    assert.match(e.ar, /[\u0600-\u06ff]/);
  }
  assert.equal(model.president().slug, 'mohamed-bin-zayed');
  assert.match(model.president().role, /President of the UAE/);
});

test('previous/next navigation wraps without losing access to any emirate', () => {
  assert.equal(model.stepIndex(0, -1), 6);
  assert.equal(model.stepIndex(6, 1), 0);
  assert.equal(model.stepIndex(0, 15), 1);
  assert.equal(model.stepIndex(0, 1, 0), 0);
  let i = 0; const seen = new Set();
  for (let n = 0; n < 7; n++) { seen.add(i); i = model.stepIndex(i, 1); }
  assert.equal(seen.size, 7);
});

test('global and regional campaigns use active real configuration, not editorial directories', () => {
  const campaigns = [world, { ...world, id: 7, slug: 'thanks-africa', identity: { style: 'africa' } },
    { ...world, id: 8, slug: 'thanks-europe', status: 'paused', identity: { style: 'europe' } },
    { ...world, id: 9, slug: 'thanks-asian-inspired', identity: {} }];
  assert.deepEqual(plain(model.globalCampaigns(campaigns).map(c => c.id)), [6]);
  assert.deepEqual(plain(model.regionalCampaigns(campaigns, 'africa').map(c => c.id)), [7]);
  assert.equal(model.regionalCampaigns(campaigns, 'europe').length, 0);
  assert.equal(model.regionalCampaigns(campaigns, 'asia').length, 0);
  for (const c of model.CONTINENTS) assert.equal(model.regionalCampaigns([world], c.id).length, 0);
  assert.equal(model.globalCampaigns(undefined).length, 0);
  assert.equal(model.EMIRATES_FORM_HREF, '/member/thanks-emirates');
});

test('all six continent gateways resolve existing directory anchors, not invented campaigns', () => {
  assert.equal(model.CONTINENTS.length, 6);
  for (const c of model.CONTINENTS) {
    const d = model.impactDirectory(c.id);
    if (d) { assert.ok(impact.some(r => r.key === d.href.split('#')[1])); assert.match(d.href, /^\/thanks-world#/); }
  }
  assert.equal(model.impactDirectory('north-america').href, '/thanks-world#usa');
});

test('the API Americas classification is separated using geographic subregion', () => {
  const countries = [
    { code: 'US', name: 'United States', continent: 'Americas', region: 'Northern America' },
    { code: 'BR', name: 'Brazil', continent: 'Americas', region: 'South America' },
    { code: 'JM', name: 'Jamaica', continent: 'Americas', region: 'Caribbean' },
    { code: 'AE', name: 'United Arab Emirates', continent: 'Asia', region: 'Western Asia' },
  ];
  assert.deepEqual(plain(model.countriesInContinent(countries, 'north-america').map(c => c.code)), ['US', 'JM']);
  assert.deepEqual(plain(model.countriesInContinent(countries, 'south-america').map(c => c.code)), ['BR']);
  assert.deepEqual(plain(model.countriesInContinent(countries, 'asia').map(c => c.code)), ['AE']);
});

test('approved introduction transclusion keeps real English/Arabic text and the existing form destination', () => {
  const f = fixture(), Intro = f.load('components/emirates/EmiratesIntro.tsx').default;
  const html = f.render(Intro);
  assert.match(html, /data-approved-hero/);
  assert.match(html, /SHUKRAN EMIRATES/);
  assert.match(html, /lang="ar" dir="rtl"/);
  assert.match(html, /شكراً للإمارات/);
  assert.match(html, /href="\/member\/thanks-emirates"/);
  const hero = read('components/editorial/EmiratesHero.tsx');
  for (const original of ['emirates-dunes.webp', 'seven emirates panorama', 'tomi-pan', 'UAE flag']) assert.ok(hero.toLowerCase().includes(original.toLowerCase()), original);
});

test('federation reveals one selected portrait; direct selection and arrows retain all profiles', () => {
  const f = fixture(), Federation = f.load('components/emirates/FederationChapter.tsx').default;
  let selected = 0;
  let html = f.render(Federation, { index: selected, onSelect: n => { selected = n; } });
  assert.equal((html.match(/data-portrait=/g) || []).length, 1);
  assert.match(html, /not an official or to-scale map/);
  for (const e of model.SEVEN_EMIRATES) assert.ok(f.events.has(`button-emirate-${e.id}`));
  f.events.get('button-emirate-fujairah').onClick();
  assert.equal(selected, 6);
  html = f.render(Federation, { index: selected, onSelect: n => { selected = n; } });
  assert.match(html, /Hamad bin Mohammed Al Sharqi/);
  assert.match(html, /data-portrait="hamad-al-sharqi"/);
  f.events.get('button-emirate-next').onClick();
  assert.equal(selected, 0);
});

test('leadership is optional and uses an accessible closeable library dialog with one profile', () => {
  const f = fixture(), Explorer = f.load('components/emirates/LeadershipExplorer.tsx').default;
  let selected = 0;
  const props = { index: 0, onSelect: n => { selected = n; }, onOpenChange() {} };
  assert.equal(f.render(Explorer, { ...props, open: false }), '');
  const html = f.render(Explorer, { ...props, open: true });
  assert.equal((html.match(/data-portrait=/g) || []).length, 1);
  assert.match(html, /Return to the campaign/);
  assert.match(html, /No endorsement, sponsorship or partnership/);
  assert.match(html, /data-credit="mohamed-bin-zayed"/);
  f.events.get('button-explorer-next').onClick();
  assert.equal(selected, 1);
  f.events.get('button-explorer-prev').onClick();
  assert.equal(selected, 6);
  f.events.get('dialog-leadership-explorer').onKeyDown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(selected, 1);
  f.events.get('dialog-leadership-explorer').onKeyDown({ key: 'ArrowLeft', target: { closest: () => ({ tagName: 'TEXTAREA' }) }, preventDefault() { assert.fail('Typing must not be intercepted'); } });
  assert.equal(selected, 1, 'Arrow keys in a comment must not replace its portrait or lose its draft');
  assert.match(read('components/emirates/LeadershipExplorer.tsx'), /@radix-ui\/react-dialog/);
});

test('participation retains free access, verification, network activation and member-only visibility', () => {
  const f = fixture(), Journey = f.load('components/emirates/JourneyChapter.tsx').default;
  const html = f.render(Journey);
  assert.match(html, /NO PAYMENT/);
  assert.match(html, /verif/i);
  assert.match(html, /network/i);
  assert.match(html, /signed-in members/);
  assert.match(html, /href="\/member\/thanks-emirates"/);
  assert.doesNotMatch(html, /checkout|payment_intent|stripe/i);
});

test('global explorer shows the real global campaign, never fake open regional campaigns', () => {
  const f = fixture(), Global = f.load('components/emirates/GlobalExplorer.tsx').default;
  const html = f.render(Global);
  assert.match(html, /No regional campaign is configured/);
  assert.match(html, /href="\/thanks-the-world"/);
  assert.match(html, /global, not regional/);
  assert.match(html, /editorial, not a campaign/);
  for (const c of model.CONTINENTS) assert.ok(html.includes(c.label));
  assert.doesNotMatch(html, />Open campaign</);
});

test('touch/pen swipes navigate, while vertical scrolling, mouse and form controls remain untouched', () => {
  const f = fixture({ react: { ...React, useRef: value => ({ current: value }) } });
  const { useSwipe } = f.load('components/emirates/use-emirates-motion.ts');
  let previous = 0, next = 0;
  const h = useSwipe(() => previous++, () => next++);
  assert.equal(h.style.touchAction, 'pan-y');
  const down = (x, y, pointerType = 'touch', target = null) => h.onPointerDown({ clientX: x, clientY: y, pointerType, target });
  const up = (x, y) => h.onPointerUp({ clientX: x, clientY: y });
  down(200, 100); up(80, 105);
  down(80, 100, 'pen'); up(200, 105);
  assert.equal(next, 1); assert.equal(previous, 1);
  down(200, 100); up(190, 400);
  down(200, 100, 'mouse'); up(0, 100);
  down(200, 100, 'touch', { closest: () => ({ tagName: 'BUTTON' }) }); up(0, 100);
  down(200, 100); h.onPointerCancel(); up(0, 100);
  assert.equal(next, 1); assert.equal(previous, 1);
});

test('secondary resources preserve important claims and provenance without mounting portrait lists by default', () => {
  const f = fixture(), Resources = f.load('components/emirates/EmiratesResources.tsx').default;
  const html = f.render(Resources);
  assert.match(html, /<details/);
  assert.doesNotMatch(html, /<details[^>]* open/);
  assert.match(html, /text-target/);
  assert.match(html, /That target was not achieved/);
  assert.match(html, /ILLUSTRATIVE ONLY/);
  assert.match(html, /NOT REAL TESTIMONIALS/);
  assert.match(html, /Future phase/);
  assert.match(html, /2026/);
  assert.doesNotMatch(html, /data-portrait=/);
});

test('motion honours reduced motion, offscreen/hidden state, pause and cleanup while chapters retain order', () => {
  const page = read('pages/thanks-emirates/index.tsx');
  const chapters = ['<EmiratesIntro', '<FederationChapter', '<LeadershipChapter', '<EmiratesStoryChapter', '<HumanStoryChapter', '<JourneyChapter', '<GlobalExplorer', '<EmiratesResources'];
  for (let i = 1; i < chapters.length; i++) assert.ok(page.indexOf(chapters[i - 1]) < page.indexOf(chapters[i]));
  const hooks = read('components/emirates/use-emirates-motion.ts');
  for (const safeguard of ['prefers-reduced-motion', 'IntersectionObserver', "el.dataset.em = 'in'", "removeEventListener", 'visibilityState', 'disconnect']) assert.ok(hooks.includes(safeguard), safeguard);
  const css = read('components/emirates/emirates.css');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /clip-path/);
  const explorer = read('components/emirates/LeadershipExplorer.tsx');
  assert.match(explorer, /data-paused=\{paused/);
  assert.match(explorer, /button-explorer-motion/);
});
