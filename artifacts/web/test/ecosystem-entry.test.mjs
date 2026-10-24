import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
function load(path, require) {
  const exports = {};
  const code = ts.transpileModule(source(path), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(code, { exports, require, URLSearchParams });
  return exports;
}
const sectors = ['fashion', 'real-estate', ...Array.from({ length: 15 }, (_, i) => `sector-${i}`)]
  .map(slug => ({ slug, name: slug, descriptor: 'A sector', contributes: 'Knowledge', whoBelongs: [] }));

test('ecosystem tools precede selection; old Instagram handle directory is absent', () => {
  const page = source('pages/ecosystem/index.tsx');
  const tags = ['<KeyPassage', '<TomiGuideIntro', '<GlobalDiscovery', '<SectorExplorer', '<PillarGrid'];
  assert.ok(tags.every((tag, i) => page.indexOf(tag) >= 0 && (!i || page.indexOf(tags[i - 1]) < page.indexOf(tag))));
  assert.ok(!source('pages/ecosystem/SectorHub.tsx').includes('PeaceVoices'));
  assert.equal(existsSync(new URL('../src/components/programs/PeaceVoices.tsx', import.meta.url)), false);
});

test('only an explicit valid URL sector preselects a gateway; legacy URL helper keeps its default', () => {
  const helpers = load('components/ecosystem/sector-location.ts', () => ({ SECTORS: sectors }));
  for (const search of ['', '?sector=unknown', '?sector=../fashion']) assert.equal(helpers.sectorChoiceFromSearch(search), '');
  for (const slug of ['fashion', 'real-estate']) assert.equal(helpers.sectorChoiceFromSearch(`?sector=${slug}`), slug);
  assert.equal(helpers.sectorFromSearch(''), 'fashion');
});

test('actual selection handlers do not open a world until its key is clicked; filters and sector changes preserve the two-step flow', () => {
  const state = [], effects = [];
  let stateIndex = 0, effectIndex = 0, scrolls = 0;
  const react = {
    useState(initial) {
      const i = stateIndex++;
      if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
      return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
    },
    useMemo: fn => fn(),
    useEffect(fn, deps) {
      const i = effectIndex++, old = effects[i];
      effects[i] = { fn, deps, pending: !old || deps.some((value, j) => value !== old.deps[j]) };
    },
  };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  const code = ts.transpileModule(source('components/ecosystem/SectorExplorer.tsx'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(code, {
    exports,
    require(id) {
      if (id === 'react') return react;
      if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (id.endsWith('sectors-data')) return { SECTORS: sectors };
      if (id.endsWith('ecosystem-resources')) return { ECOSYSTEM_PERSONAS: [] };
      if (id.endsWith('useStage')) return { useStage: () => ({ ref: null, attrs: {} }), prefersReducedMotion: () => true };
      if (id.endsWith('world-config')) return { getWorldConfig: () => ({ motif: 'skyline', accent: '39 52% 54%' }) };
      return { __esModule: true, default: id.split('/').pop(), Link: 'a', ArrowRight: 'svg', ChevronDown: 'svg', Search: 'svg', SlidersHorizontal: 'svg' };
    },
    document: { getElementById: () => ({ scrollIntoView: () => { scrolls++; } }) },
    requestAnimationFrame: fn => { fn(); return 1; }, cancelAnimationFrame() {},
  });
  function render() {
    stateIndex = effectIndex = 0;
    const tree = exports.default();
    for (const effect of effects) if (effect.pending) effect.fn();
    return tree;
  }
  function find(node, predicate) {
    if (!node || typeof node !== 'object') return undefined;
    if (Array.isArray(node)) return node.map(x => find(x, predicate)).find(Boolean);
    return predicate(node) ? node : find(node.props?.children, predicate);
  }
  const byId = (tree, id) => find(tree, n => n.props?.['data-testid'] === id);
  const world = tree => find(tree, n => n.type === 'SectorWorld' || n.type === 'RealEstateWorld');
  let tree = render();
  assert.equal(world(tree), undefined);
  byId(tree, 'button-sector-fashion').props.onClick();
  tree = render();
  assert.equal(world(tree), undefined, 'selection alone must not mount Fashion');
  assert.ok(byId(tree, 'button-one-key-open-fashion'));
  byId(tree, 'button-one-key-open-fashion').props.onClick();
  tree = render();
  assert.equal(world(tree).props.slug, 'fashion');
  assert.equal(scrolls, 1);
  byId(tree, 'button-sector-real-estate').props.onClick();
  tree = render();
  assert.equal(world(tree), undefined, 'changing sectors closes the previous world');
  byId(tree, 'button-one-key-open-real-estate').props.onClick();
  tree = render();
  assert.equal(world(tree).type, 'RealEstateWorld');
  find(tree, n => n.props?.id === 'sector-search').props.onChange({ target: { value: 'no-match-at-all' } });
  tree = render();
  assert.ok(byId(tree, 'button-enter-world'), 'selected key remains accessible when search filters hide its card');
});
