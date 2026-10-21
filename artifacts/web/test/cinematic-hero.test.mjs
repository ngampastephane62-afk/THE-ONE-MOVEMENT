import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Real hero rendered without the application server, auth, API or image services.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '..');
const source = readFileSync(resolve(root, 'src/components/home/CinematicHero.tsx'), 'utf8');
const css = readFileSync(resolve(root, 'src/components/home/cinematic-hero.css'), 'utf8');

function fixture(reduced = false, base = '/nested/', { seen = false, blockedStorage = false } = {}) {
  const states = [], effects = [], events = new Map(), listeners = new Map();
  const storage = new Map(seen ? [['tomi:home-intro-seen', '1']] : []);
  let cursor = 0;
  const media = {
    matches: reduced,
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: event => listeners.delete(event),
  };
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
        return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
      },
      useEffect: fn => effects.push(fn),
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
      name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
        if (props?.['data-testid']) events.set(props['data-testid'], props);
        return fn(type, props, ...rest);
      } : fn,
    ])),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children) },
    'lucide-react': requireWeb('lucide-react'),
    '@/assets/media/home/tomi-official-logo.png': { default: '/nested/assets/tomi-official-logo.png' },
  };
  const module = { exports: {} };
  runInNewContext(ts.transpileModule(source.replaceAll('import.meta.env.BASE_URL', JSON.stringify(base)), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module, exports: module.exports,
    window: { matchMedia: () => media, sessionStorage: {
      getItem(key) { if (blockedStorage) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blockedStorage) throw new Error('Storage blocked'); storage.set(key, value); },
    } },
    require(id) {
      if (id.endsWith('.css')) return {};
      assert.ok(id in mocks, `No unexpected dependency or network client: ${id}`);
      return mocks[id];
    },
  });
  return {
    events, effects, media, listeners, storage, exports: module.exports,
    remount() { states.length = 0; effects.length = 0; },
    render(props = {}) {
      cursor = 0; events.clear();
      return renderToStaticMarkup(React.createElement(module.exports.default, props));
    },
  };
}

test('cinematic hero renders official message and existing destinations under a nested base', () => {
  const f = fixture(), html = f.render();
  assert.match(html, /The One Movement/);
  assert.match(html, /International/);
  assert.match(html, /We Are One/);
  assert.match(html, /For Peace &amp; Unity/);
  assert.equal(f.events.get('link-hero-ecosystem').href, '/ecosystem');
  assert.equal(f.events.get('link-hero-join').href, '/join');
  assert.match(f.events.get('link-hero-join').className, /tch-btn--solid/);
  assert.match(f.events.get('link-hero-ecosystem').className, /tch-btn--ghost/);
  assert.ok(html.indexOf('data-testid="link-hero-join"') < html.indexOf('data-testid="link-hero-ecosystem"'));
  assert.doesNotMatch(html, /<a[^>]*>\s*<button/);
  const sources = [...html.matchAll(/\bsrc="([^"]+)"/g)].map(match => match[1]);
  assert.ok(sources.length >= 3, 'Background, original portrait and flag present');
  for (const src of sources) {
    if (src === '/nested/assets/tomi-official-logo.png') {
      assert.ok(existsSync(resolve(root, 'src/assets/media/home/tomi-official-logo.png')));
      continue;
    }
    assert.ok(src.startsWith('/nested/media/tomi-intro/'), src);
    const path = resolve(root, 'public', src.replace('/nested/', ''));
    assert.ok(existsSync(path), path);
    assert.ok(statSync(path).size > 0, path);
  }
});

test('Goma origin is honest about missing imagery and accepts a future approved local asset', () => {
  const f = fixture(), html = f.render();
  assert.match(html, /Goma/);
  assert.match(html, /Dubai/);
  assert.equal(f.events.has('img-hero-origin'), false, 'No missing asset request or invented volcano');
  const future = f.render({ originAsset: { file: 'approved-goma.webp', alt: 'Approved future Goma landscape', width: 1200, height: 800 } });
  assert.match(future, /src="\/nested\/media\/tomi-intro\/approved-goma.webp"/);
  assert.match(future, /alt="Approved future Goma landscape"/);
  assert.match(css, /tch-origin-reveal/);
  assert.match(css, /tch-ember-to-gold/);
});

test('atmospheric motion can be paused and resumed without an animation gate', () => {
  const f = fixture();
  assert.match(f.render(), /data-paused="false"/);
  f.events.get('button-toggle-hero-motion').onClick();
  assert.match(f.render(), /data-paused="true"/);
  assert.equal(f.events.get('button-toggle-hero-motion')['aria-pressed'], true);
  f.events.get('button-toggle-hero-motion').onClick();
  assert.match(f.render(), /data-paused="false"/);
});

test('reduced motion and live preference changes stop motion and clean up listener', () => {
  const f = fixture(true);
  f.render();
  const cleanups = f.effects.map(effect => effect()).filter(fn => typeof fn === 'function');
  assert.match(f.render(), /data-paused="true"/);
  assert.equal(f.events.has('button-toggle-hero-motion'), false);
  f.media.matches = false;
  f.listeners.get('change')();
  assert.match(f.render(), /data-paused="false"/);
  assert.ok(f.events.has('button-toggle-hero-motion'));
  cleanups.forEach(cleanup => cleanup());
  assert.equal(f.listeners.size, 0);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /animation-play-state:\s*paused/);
});

test('intro timeline is approximately ten seconds, immediately skippable and never a navigation gate', () => {
  const f = fixture();
  assert.match(f.render(), /data-intro="play"/);
  assert.equal(f.exports.INTRO_DURATION_S, 9.6);
  assert.deepEqual(JSON.parse(JSON.stringify(f.exports.INTRO_TIMELINE)), [
    { id: 'depth', start: 0, end: 3 },
    { id: 'globe-illumination', start: 3, end: 5 },
    { id: 'logo-title', start: 5, end: 8 },
    { id: 'cta-settle', start: 8, end: 10 },
  ]);
  assert.equal(f.events.get('link-hero-join').href, '/join');
  assert.equal(f.events.get('link-hero-ecosystem').href, '/ecosystem');
  f.events.get('button-skip-intro').onClick();
  assert.match(f.render(), /data-intro="done"/);
  assert.equal(f.events.has('button-skip-intro'), false);
  assert.equal(f.storage.get(f.exports.INTRO_KEY), '1');
  assert.match(css, /tch-settle 1\.6s 8s/);
  assert.match(css, /data-intro='done'[\s\S]*?animation: none/);
});

test('session navigation, blocked storage and reduced motion never force a repeated intro', () => {
  const remembered = fixture(false, '/nested/', { seen: true });
  assert.match(remembered.render(), /data-intro="done"/);
  const blocked = fixture(false, '/nested/', { blockedStorage: true });
  assert.match(blocked.render(), /data-intro="play"/);
  blocked.effects.forEach(effect => effect());
  blocked.remount();
  assert.match(blocked.render(), /data-intro="done"/);
  const reduced = fixture(true);
  assert.match(reduced.render(), /data-intro="done"/);
  assert.equal(reduced.events.has('button-skip-intro'), false);
  reduced.effects.forEach(effect => effect());
  assert.equal(reduced.storage.get(reduced.exports.INTRO_KEY), '1');
});

test('phase one preserves homepage content and keeps responsive composition frontend-only', () => {
  const home = readFileSync(resolve(root, 'src/pages/home/HomeExperience.tsx'), 'utf8');
  assert.match(home, /<CinematicHero\s*\/>/);
  assert.ok(existsSync(resolve(root, 'src/components/home/HomeBrandHero.tsx')));
  for (const marker of ['what-heading', 'ecosystem-preview-heading', 'global-universe', 'fashion-proof-heading', 'program-preview-heading', 'HomeArchiveCarousel']) {
    assert.ok(home.includes(marker), marker);
  }
  assert.match(css, /max-width:\s*767px/);
  assert.match(css, /max-width:\s*1023px/);
  assert.match(css, /max-width:\s*359px/);
  assert.match(css, /\.tomi-home-editorial \.reveal\.reveal-right:not\(\.is-visible\):has\(> #video-movement-reel\)/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(source, /fetch\(|localStorage|@clerk|api-client|stripe|setInterval|requestAnimationFrame/);
});
