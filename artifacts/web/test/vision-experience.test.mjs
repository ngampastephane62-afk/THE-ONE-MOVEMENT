import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react'), runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const folder = new URL('../src/pages/our-vision/', import.meta.url);
const read = file => readFileSync(new URL(file, folder), 'utf8');

function fixture(entry) {
  const state = [], refs = [], events = new Map(), focused = [], cache = new Map();
  let cursor = 0, refCursor = 0;
  const react = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial;
      return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
    },
    useRef(initial) { const i = refCursor++; return refs[i] ??= { current: initial }; },
    useEffect() {},
    useMemo: fn => fn(),
  };
  const jsx = Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
    name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
      if (props?.['data-testid']) {
        events.set(props['data-testid'], props);
        if (typeof props.ref === 'function') props.ref({ focus: () => focused.push(props['data-testid']) });
      }
      return fn(type, props, ...rest);
    } : fn,
  ]));
  const wrap = tag => ({ children, ...props }) => React.createElement(tag, props, children);
  const mocks = {
    react, 'react/jsx-runtime': jsx, 'react-helmet-async': { Helmet: ({ children }) => children },
    wouter: { Link: wrap('a') }, 'lucide-react': requireWeb('lucide-react'),
    '@/components/ui/button': { Button: ({ children }) => React.createElement('button', null, children) },
    '@/components/HeroSurface': { default: ({ children }) => React.createElement('section', null, children) },
    '@/components/GoldThread': { default: () => React.createElement('span', { 'aria-hidden': true }) },
    '@/components/SectionHeading': { default: ({ eyebrow, heading }) => React.createElement('header', null, eyebrow, React.createElement('h2', null, heading)) },
    '@/components/EditorialFilm': { default: props => React.createElement('figure', { 'data-testid': props.testId, 'data-film-source': props.name }, props.label, props.caption, props.credit) },
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    runInNewContext(ts.transpileModule(read(file), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText, {
      module, exports: module.exports,
      document: { documentElement: { lang: 'en' } },
      require(id) {
        if (id in mocks) return mocks[id].default ? { __esModule: true, ...mocks[id] } : mocks[id];
        if (id.endsWith('.css')) return {};
        if (id === './countries.json') return JSON.parse(read('countries.json'));
        if (id.startsWith('./')) return load(`${id.slice(2)}.${id === './country-data' ? 'ts' : 'tsx'}`);
        throw new Error(`Unexpected dependency: ${id}`);
      },
    });
    cache.set(file, module.exports);
    return module.exports;
  }
  const component = load(entry);
  return {
    events, focused, exports: component,
    render() {
      cursor = 0; refCursor = 0; events.clear();
      return renderToStaticMarkup(React.createElement(component.default));
    },
  };
}

test('Vision renders the exact global mission, six benefit choices, archive film and existing destinations without old gallery', () => {
  const f = fixture('index.tsx'), html = f.render();
  for (const text of [
    'ONE WORLD.', 'ONE HUMANITY.', 'ONE SHARED FUTURE.',
    'We stand against discrimination, racism, hatred, violence, war and division.',
    'HOW WE CONNECT', 'HUMANITARIAN IMPACT', 'UNITY BECOMES MEANINGFUL THROUGH ACTION.',
    'THANKS THE WORLD', 'THANKS EMIRATES', 'THE ONE DOCUMENTARY',
  ]) assert.ok(html.includes(text), text);
  assert.equal(f.events.get('link-join-members').href, '/join');
  assert.equal(f.events.get('link-vision-thanks-the-world').href, '#thanks-the-world');
  assert.equal(f.events.get('link-vision-thanks-emirates').href, '/thanks-emirates');
  assert.equal(f.events.get('link-vision-the-one-documentary').href, '/the-one-documentary');
  assert.match(html, /data-testid="film-goma-donation" data-film-source="goma-donation"/);
  assert.match(html, /Context supplied by the Founder/);
  assert.match(html, /Archive record of a past action — not an active fundraising appeal/);
  assert.equal([...f.events.keys()].filter(k => k.startsWith('card-benefit-')).length, 6);
  assert.match(html, /<ol[^>]*><li /);
  assert.doesNotMatch(read('index.tsx'), /PhotoSlot|BrandPhotoActions|vision-bukavu\.jpg|vision-hero\.jpg/);
});

test('All six action areas select their corresponding description, panel label and highlighted hub connection', () => {
  const f = fixture('ConnectNetwork.tsx');
  f.render();
  assert.equal(f.exports.AREAS.length, 6);
  for (const area of f.exports.AREAS) {
    f.events.get(`node-area-${area.n}`).onClick();
    const html = f.render();
    assert.equal(f.events.get('text-area-title').children, area.t);
    assert.equal(f.events.get('text-area-description').children, area.d);
    assert.equal(f.events.get(`tab-area-${area.n}`)['aria-selected'], true);
    assert.match(html, new RegExp(`aria-labelledby="tv-tab-${area.n}"`));
    assert.equal((html.match(/class="spoke on"/g) || []).length, 1);
  }
});

test('Action tabs support arrow keys, wrapping, Home and End with matching keyboard focus', () => {
  const f = fixture('ConnectNetwork.tsx'); f.render();
  let prevented = 0;
  const key = (id, key) => { f.events.get(`tab-area-${id}`).onKeyDown({ key, preventDefault: () => prevented++ }); f.render(); };
  key('01', 'ArrowLeft'); assert.equal(f.focused.at(-1), 'tab-area-06');
  key('06', 'ArrowRight'); assert.equal(f.focused.at(-1), 'tab-area-01');
  key('01', 'End'); assert.equal(f.focused.at(-1), 'tab-area-06');
  key('06', 'Home'); assert.equal(f.focused.at(-1), 'tab-area-01');
  key('01', 'ArrowDown'); assert.equal(f.focused.at(-1), 'tab-area-02');
  assert.equal(prevented, 5);
});

test('Country and theme selection update the same preview, preserve selection through no-results and clear filters safely', () => {
  const f = fixture('ThanksWorldPreview.tsx');
  assert.doesNotMatch(f.render(), /flagcdn/);
  f.events.get('input-country-search').onChange({ target: { value: 'Japan' } }); f.render();
  f.events.get('select-country').onChange({ target: { value: 'JP' } }); f.render();
  assert.equal(f.events.get('img-country-flag').src, 'https://flagcdn.com/jp.svg');
  assert.equal(f.events.get('text-country-region').children, 'Eastern Asia');
  assert.equal(f.events.get('text-country-continent').children, 'Asia');
  f.events.get('button-theme-peace-solidarity').onClick(); f.render();
  assert.equal(f.events.get('text-country-theme').children, 'Peace & Solidarity');
  f.events.get('input-country-search').onChange({ target: { value: 'zzznocountry' } });
  let html = f.render();
  assert.ok(f.events.has('text-country-no-results'));
  assert.equal(f.events.get('select-country').value, 'JP');
  assert.match(html, /value="JP" selected/);
  f.events.get('input-country-search').onChange({ target: { value: '' } });
  html = f.render();
  assert.doesNotMatch(html, /No country or territory matches/);
  assert.ok((html.match(/<option /g) || []).length >= 250);
});

test('Failed flag has an explicit fallback and country change remounts its error state without cropping flags', () => {
  const f = fixture('ThanksWorldPreview.tsx'); f.render();
  f.events.get('select-country').onChange({ target: { value: 'NP' } }); f.render();
  assert.match(f.events.get('img-country-flag').className, /object-contain/);
  f.events.get('img-country-flag').onError(); f.render();
  assert.ok(f.events.has('text-flag-fallback'));
  assert.match(read('ThanksWorldPreview.tsx'), /<Flag key=\{country.code\}/);
});

test('Campaign remains preview-only with source attribution, no message capture, submission, private fields or persistence', () => {
  const f = fixture('ThanksWorldPreview.tsx'), html = f.render();
  assert.match(html, /Preview only — contributions are not yet open/);
  assert.match(html, /mledoze\/countries/);
  assert.match(html, /ODbL 1\.0/);
  assert.match(html, /not represent political endorsements/);
  assert.doesNotMatch(read('ThanksWorldPreview.tsx'), /fetch\(|localStorage|useMutation|<textarea|type="submit"|useMe\b|useAct\b/);
});

test('Motion has content-visible defaults, reduced-motion overrides, offscreen pause and no new animation libraries', () => {
  const f = fixture('VisionReveal.tsx');
  assert.match(f.render(), /data-entered="false"/);
  const css = read('vision.css');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /\.tv-rise-h \{ animation-delay: 4s/);
  assert.match(css, /\.tv-rise-m \{ animation-delay: 6s/);
  assert.doesNotMatch(css, /opacity:\s*0[;}]/);
  assert.match(read('VisionReveal.tsx'), /typeof IntersectionObserver === 'undefined'/);
  assert.doesNotMatch(read('index.tsx') + read('ConnectNetwork.tsx'), /from ['"](?:three|gsap|framer-motion)/);
});
