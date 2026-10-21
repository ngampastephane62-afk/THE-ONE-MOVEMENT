import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Render the actual home component with isolated React hooks: no server,
// authenticated session, database, external service or data mutation.
const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = resolve(import.meta.dirname, '../src');

function fixture() {
  const states = [], events = new Map(), cache = new Map();
  let cursor = 0;
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
        return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
      },
      useRef: value => ({ current: value }),
      useEffect() {},
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
      name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
        if (props?.['data-testid']) events.set(props['data-testid'], props);
        return fn(type, props, ...rest);
      } : fn,
    ])),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children) },
    'lucide-react': requireWeb('lucide-react'),
  };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} };
    runInNewContext(ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, {
      module, exports: module.exports,
      require(id) {
        if (id.endsWith('.css')) return {};
        if (id in mocks) return mocks[id];
        assert.ok(id.startsWith('@/') || id.startsWith('.'), `No new runtime dependencies: ${id}`);
        const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(filename), id);
        const local = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
        assert.ok(local, `Existing local dependency: ${id}`);
        return load(local);
      },
    }, { filename });
    cache.set(filename, module.exports);
    return module.exports;
  }
  const component = load(resolve(root, 'components/home/OneUniverse.tsx'));
  const registry = load(resolve(root, 'lib/sectors-data.ts')).SECTORS;
  return {
    events, component, registry,
    render() {
      cursor = 0; events.clear();
      return renderToStaticMarkup(React.createElement(component.default));
    },
  };
}

test('home universe reuses exactly the 17 official names, numbers, order and canonical routes', () => {
  const f = fixture();
  assert.equal(f.registry.length, 17);
  assert.deepEqual(JSON.parse(JSON.stringify(f.component.UNIVERSE_SECTORS)), JSON.parse(JSON.stringify(f.registry.map((s, i) => ({
    number: String(i + 1).padStart(2, '0'), slug: s.slug, name: s.name,
    href: `/ecosystem?sector=${s.slug}#explore`,
  })))));
  const html = f.render();
  assert.equal((html.match(/data-testid="button-universe-node-/g) ?? []).length, 17);
  assert.equal((html.match(/data-testid="button-universe-list-/g) ?? []).length, 17);
  assert.match(html, /<ol[^>]+aria-label="The 17 sectors/);
  for (const [i, sector] of f.registry.entries()) {
    assert.equal(f.events.get(`button-universe-node-${sector.slug}`)['aria-label'], `${String(i + 1).padStart(2, '0')} ${sector.name}`);
  }
});

test('every touch/list selection reveals its real description, number and Explore destination', () => {
  const f = fixture();
  f.render();
  for (const sector of f.registry) {
    f.events.get(`button-universe-list-${sector.slug}`).onClick();
    const html = f.render();
    assert.equal(f.events.get('text-universe-sector-name').children, sector.name);
    assert.equal(f.events.get('link-universe-explore').href, `/ecosystem?sector=${sector.slug}#explore`);
    assert.equal(f.events.get(`button-universe-node-${sector.slug}`)['aria-pressed'], true);
    assert.ok(html.includes(sector.descriptor.replaceAll('&', '&amp;')), sector.slug);
  }
});

test('globe indicators select directly and arrow keys wrap at both ends', () => {
  const f = fixture();
  f.render();
  let prevented = 0;
  const key = value => f.events.get('button-universe-node-fashion').onKeyDown({ key: value, preventDefault() { prevented++; } });
  key('ArrowLeft');
  f.render();
  assert.equal(f.events.get('text-universe-sector-name').children, 'Humanitarian Action');
  key('ArrowRight');
  f.render();
  assert.equal(f.events.get('text-universe-sector-name').children, 'Fashion');
  f.events.get('button-universe-node-health-care').onClick();
  f.render();
  assert.equal(f.events.get('text-universe-sector-name').children, 'Health & Care');
  assert.equal(prevented, 2);
});

test('universe remains home-only, responsive, reduced-motion safe and free of backend dependencies', () => {
  const home = readFileSync(resolve(root, 'pages/home/HomeExperience.tsx'), 'utf8');
  const source = readFileSync(resolve(root, 'components/home/OneUniverse.tsx'), 'utf8');
  const css = readFileSync(resolve(root, 'components/home/one-universe.css'), 'utf8');
  assert.match(home, /<OneUniverse\s*\/>/);
  assert.ok(existsSync(resolve(root, 'components/TomiConstellation.tsx')));
  assert.match(source, /IntersectionObserver/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /max-width:\s*767px/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(source, /fetch\(|@clerk|api-client|stripe|localStorage|three|canvas/);
});
