import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const runtime = requireWeb('react/jsx-runtime');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const source = readFileSync(new URL('../src/components/editorial/MediaActions.tsx', import.meta.url), 'utf8');
const ID = 'awards-rosina-2027';

// Actual presentation and event handlers; substitute the existing engagement
// transport only. No member login, network request or persisted data mutation.
function fixture({ layout = 'row', signedIn = true, likes = 4, error = false, native = false, photo = false } = {}) {
  const states = [], effects = [], events = new Map(), listeners = new Map();
  const mutations = [], copies = [], nativeShares = [], targets = [];
  let cursor = 0, retries = 0;
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const i = cursor++;
        if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
        return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }];
      },
      useRef: value => ({ current: value }),
      useEffect: fn => effects.push(fn),
    },
    'react/jsx-runtime': Object.fromEntries(Object.entries(runtime).map(([name, fn]) => [
      name, ['jsx', 'jsxs'].includes(name) ? (type, props, ...rest) => {
        if (props?.['data-testid']) events.set(props['data-testid'], props);
        if (type === 'form') events.set('comment-form', props);
        return fn(type, props, ...rest);
      } : fn,
    ])),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children) },
    'lucide-react': requireWeb('lucide-react'),
    '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
    '@/lib/media-share': {
      videoShareUrl: id => `https://example.test/?video=${id}`,
      mediaShareUrl: src => `https://example.test/?media=${encodeURIComponent(src)}`,
    },
    '@/hooks/use-media-engagement': {
      engagementErrorMessage: e => String(e),
      useMediaEngagement(target) {
        targets.push(target);
        return {
          signedIn, isLoaded: true, founder: false,
          q: {
            data: { likes, liked: false, comments: [{ id: 1, author: 'Public contributor', text: 'Existing public comment', createdAt: '2026-01-01', canDelete: false }] },
            isLoading: false, isError: error, refetch: () => { retries++; },
          },
          m: { isPending: false, mutate: (input, options) => { mutations.push(input); options?.onSuccess?.(); } },
        };
      },
    },
  };
  const module = { exports: {} };
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module, exports: module.exports, window: {},
    document: {
      addEventListener: (name, fn) => listeners.set(name, fn),
      removeEventListener: name => listeners.delete(name),
    },
    navigator: {
      clipboard: { writeText: async value => { copies.push(value); } },
      ...(native ? { share: async value => { nativeShares.push(value); } } : {}),
    },
    require(id) {
      assert.ok(id in mocks, `Unexpected dependency: ${id}`);
      return mocks[id];
    },
  });
  return {
    events, listeners, mutations, copies, nativeShares, targets,
    get retries() { return retries; },
    effects: () => effects.map(fn => fn()).filter(fn => typeof fn === 'function'),
    render() {
      cursor = 0; effects.length = 0; events.clear();
      return renderToStaticMarkup(React.createElement(module.exports.default, {
        ...(photo ? { source: '/approved/summit.webp' } : { videoId: ID }), title: 'Approved event', layout,
      }));
    },
  };
}

test('Home social row starts with only Like, Comment and Share, retaining real counts', () => {
  const f = fixture({ likes: 12345 }), html = f.render();
  for (const action of ['like', 'comments', 'share']) assert.ok(f.events.has(`button-${action}-${ID}`));
  for (const action of ['copy', 'insta-tiktok', 'more-share']) assert.equal(f.events.has(`button-${action}-${ID}`), false);
  assert.equal(f.events.has(`link-facebook-${ID}`), false);
  assert.match(html, /tomi-actions-row/);
  assert.match(f.events.get(`button-like-${ID}`)['aria-label'], /12345/);
  assert.equal(f.mutations.length, 0);
});

test('Share opens destinations only on request; Escape and outside pointer close the disclosure', () => {
  const f = fixture();
  f.render(); f.events.get(`button-share-${ID}`).onClick(); f.render();
  assert.ok(f.events.has(`button-copy-${ID}`));
  assert.ok(f.events.has(`button-insta-tiktok-${ID}`));
  assert.ok(f.events.has(`link-facebook-${ID}`));
  const cleanups = f.effects();
  f.listeners.get('keydown')({ key: 'Escape' });
  f.render();
  assert.equal(f.events.get(`button-share-${ID}`)['aria-expanded'], false);
  assert.equal(f.events.has(`menu-share-${ID}`), false);
  cleanups.forEach(fn => fn());
  f.events.get(`button-share-${ID}`).onClick(); f.render();
  f.effects();
  f.listeners.get('pointerdown')({ target: {} });
  f.render();
  assert.equal(f.events.has(`menu-share-${ID}`), false);
});

test('Like and comment keep the existing request contract and comment-success reset', () => {
  const f = fixture();
  f.render(); f.events.get(`button-like-${ID}`).onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(f.mutations[0])), { action: 'like', accepted: true });
  f.events.get(`button-comments-${ID}`).onClick();
  assert.match(f.render(), /Existing public comment/);
  f.events.get(`input-comment-${ID}`).onChange({ target: { value: '  A new comment  ' } });
  f.render(); f.events.get('comment-form').onSubmit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(JSON.stringify(f.mutations[1])), { action: 'comment', text: 'A new comment' });
  f.render();
  assert.equal(f.events.get(`input-comment-${ID}`).value, '');
});

test('Anonymous and unavailable-reaction states preserve restrictions and retry, while sharing remains available', () => {
  const anon = fixture({ signedIn: false });
  assert.match(anon.render(), /href="\/sign-in"/);
  assert.equal(anon.events.get(`button-like-${ID}`).disabled, true);
  anon.events.get(`button-comments-${ID}`).onClick();
  assert.match(anon.render(), /Existing public comment/);
  assert.equal(anon.events.has('comment-form'), false);
  const failed = fixture({ error: true });
  failed.render();
  failed.events.get(`button-retry-engagement-${ID}`).onClick();
  assert.equal(failed.retries, 1);
  assert.ok(failed.events.has(`button-share-${ID}`));
});

test('Default layout and photo canonical target remain backward compatible', () => {
  const old = fixture({ layout: 'default' });
  const html = old.render();
  assert.doesNotMatch(html, /tomi-actions-row/);
  assert.ok(old.events.has(`link-facebook-${ID}`));
  const photo = fixture({ photo: true });
  photo.render();
  assert.equal(photo.targets[0].source, '/approved/summit.webp');
  assert.equal(photo.targets[0].videoId, undefined);
});

test('Copy and native share retain their original URL and do not post to social networks', async () => {
  const f = fixture({ native: true });
  f.render(); f.events.get(`button-share-${ID}`).onClick(); f.render();
  f.events.get(`button-copy-${ID}`).onClick();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.copies[0], `https://example.test/?video=${ID}`);
  f.render(); f.events.get(`button-share-${ID}`).onClick(); f.render();
  f.events.get(`button-native-share-${ID}`).onClick();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.nativeShares[0].url, `https://example.test/?video=${ID}`);
  assert.equal(f.mutations.length, 0);
});
