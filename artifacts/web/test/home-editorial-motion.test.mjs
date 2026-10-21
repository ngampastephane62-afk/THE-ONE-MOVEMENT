import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react'), runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const film = '../src/components/programs/ProgrammeFilm.tsx';
const reveal = '../src/components/home/HomeReveal.tsx';
const ID = 'awards-rosina-2027';

// Controlled DOM/media doubles exercise the real hooks and callbacks without
// starting a server, downloading video, authenticating or writing engagement.
function fixture(file, { props = {}, reduced = false, observer = true } = {}) {
  const states = [], refs = [], effects = [], observations = [], events = new Map(), focus = new Map();
  let cursor = 0, refCursor = 0, plays = 0, pauses = 0;
  const element = {
    getBoundingClientRect: () => ({ top: 1200 }),
    addEventListener: (name, fn) => focus.set(name, fn),
    removeEventListener: name => focus.delete(name),
  };
  const video = {
    paused: true, muted: true,
    play() { plays++; this.paused = false; return Promise.resolve(); },
    pause() { pauses++; this.paused = true; events.get('video')?.onPause(); },
  };
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; observations.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
        return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
      },
      useRef(initial) { const i = refCursor++; return refs[i] ??= { current: initial }; },
      useEffect: fn => effects.push(fn),
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
      name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
        if (props?.['data-testid']) events.set(props['data-testid'], props);
        if (type === 'video') { events.set('video', props); if (props.ref) props.ref.current = video; }
        else if (props?.ref && (type === 'figure' || props['data-hx'])) props.ref.current = element;
        if (props?.['data-hx']) events.set('reveal', props);
        return fn(type, props, ...rest);
      } : fn,
    ])),
    'lucide-react': requireWeb('lucide-react'),
    '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
    '@/lib/media-share': { useDeepLinkFocus: () => ({ current: null }) },
    '@/components/editorial/VideoActions': { default: ({ layout }) => React.createElement('div', { 'data-actions-layout': layout }) },
  };
  const module = { exports: {} };
  runInNewContext(ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8').replaceAll('import.meta.env.BASE_URL', JSON.stringify('/nested/')), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module, exports: module.exports,
    window: { innerHeight: 844, matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }) },
    IntersectionObserver: observer ? Observer : undefined,
    require(id) { assert.ok(id in mocks, `Unexpected dependency: ${id}`); return mocks[id]; },
  });
  return {
    events, observations, focus, video, exports: module.exports,
    get plays() { return plays; }, get pauses() { return pauses; },
    effects: () => effects.map(fn => fn()).filter(fn => typeof fn === 'function'),
    render() {
      cursor = 0; refCursor = 0; effects.length = 0; events.clear();
      return renderToStaticMarkup(React.createElement(module.exports.default, props));
    },
  };
}

test('Home film initially uses a lazy poster, native ratio, no autoplay or video preload, and row engagement', () => {
  const f = fixture(film, { props: { id: ID, presentation: 'home' } });
  const html = f.render();
  assert.doesNotMatch(html, /<video/);
  assert.match(html, /loading="lazy"/);
  assert.equal(f.events.get(`film-${ID}`).style.aspectRatio, f.exports.PROGRAMME_FILMS[ID].ratio);
  assert.match(html, /data-actions-layout="row"/);
  assert.equal(f.plays, 0);
  assert.ok(f.events.has(`button-play-${ID}`));
  assert.ok(f.events.has(`button-sound-${ID}`));
});

test('User play starts muted with preload none and scrolling offscreen pauses Home film', () => {
  const f = fixture(film, { props: { id: ID, presentation: 'home' } });
  f.render(); f.effects();
  f.events.get(`button-play-${ID}`).onClick();
  assert.match(f.render(), /<video/);
  assert.equal(f.events.get('video').muted, true);
  assert.equal(f.events.get('video').preload, 'none');
  f.effects();
  assert.equal(f.video.paused, false);
  f.observations[0].callback([{ isIntersecting: false }]);
  assert.equal(f.pauses, 1);
  assert.doesNotMatch(f.render(), /<video/);
});

test('ProgrammeFilm omitted presentation preserves other pages and reduced-motion controls', () => {
  const old = fixture(film, { props: { id: ID } });
  assert.match(old.render(), /<video/);
  assert.equal(old.events.get('video').autoPlay, true);
  assert.equal(old.events.get('video').preload, 'metadata');
  const reduced = fixture(film, { reduced: true, props: { id: ID, presentation: 'home' } });
  assert.doesNotMatch(reduced.render(), /<video/);
  assert.ok(reduced.events.has(`button-play-${ID}`), 'Reduced motion does not remove manual playback');
});

test('Home title content stays visible without observer or with reduced motion, with no timed hidden state', () => {
  for (const options of [{ observer: false }, { reduced: true }]) {
    const f = fixture(reveal, { ...options, props: { children: 'Approved unchanged title' } });
    assert.match(f.render(), /data-hx="static"/);
    f.effects();
    assert.match(f.render(), /Approved unchanged title/);
    assert.equal(f.observations.length, 0);
  }
  const source = readFileSync(new URL(reveal, import.meta.url), 'utf8');
  assert.doesNotMatch(source, /setTimeout|setState\('armed'\)/);
});

test('Title animates on intersection, while keyboard focus first keeps it static', () => {
  const f = fixture(reveal, { props: { children: 'Event title' } });
  f.render(); f.effects();
  assert.match(f.observations[0].options.rootMargin, /40px/);
  f.observations[0].callback([{ isIntersecting: true }]);
  assert.match(f.render(), /data-hx="in"/);
  const keyboard = fixture(reveal, { props: { children: 'Event title' } });
  keyboard.render(); keyboard.effects(); keyboard.focus.get('focusin')();
  keyboard.observations[0].callback([{ isIntersecting: true }]);
  assert.match(keyboard.render(), /data-hx="static"/);
});

test('Ambient motion controller scopes itself to Home pattern layers and cleans up observation', () => {
  const source = readFileSync(new URL('../src/components/home/useAmbientPatternPause.ts', import.meta.url), 'utf8');
  assert.match(source, /\.thp-pattern/);
  assert.match(source, /animationPlayState = en.isIntersecting \? 'running' : 'paused'/);
  assert.match(source, /io.disconnect/);
  assert.doesNotMatch(source, /tch|OneUniverse|fetch\(|setInterval/);
});
