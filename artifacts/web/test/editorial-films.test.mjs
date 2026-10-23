import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const root = new URL('../src/', import.meta.url).pathname;
const read = (path) => readFileSync(resolve(root, path), 'utf8');
function fixture() {
  const cache = new Map();
  const mocks = {
    react: React,
    'react/jsx-runtime': requireWeb('react/jsx-runtime'),
    '@/hooks/use-news-motion': { useNewsPlaybackScope: () => ({ current: null }) },
    './cinematic/PublishedCampaignVideos': { __esModule: true, default: () => null },
    './cinematic/use-cinematic-reveal': { useCinematicReveal: () => ({ current: null }) },
    './use-cinematic-reveal': { useCinematicReveal: () => ({ current: null }) },
    '../VideoActions': { __esModule: true, default: (props) => React.createElement('div', { 'data-engagement': props.videoId, 'data-layout': props.layout }, props.title) },
  };
  function load(path) {
    const full = resolve(root, path);
    if (cache.has(full)) return cache.get(full);
    const exports = {};
    const source = readFileSync(full, 'utf8').replaceAll('import.meta.env.BASE_URL', '"/"');
    cache.set(full, exports);
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    runInNewContext(code, {
      exports, console,
      require: (name) => {
        if (mocks[name]) return mocks[name];
        if (name.endsWith('.css')) return {};
        const target = name.startsWith('@/') ? resolve(root, name.slice(2)) : resolve(dirname(full), name);
        try { return load(`${target}.tsx`); } catch (err) { if (err.code !== 'ENOENT') throw err; }
        return load(`${target}.ts`);
      },
    }, { filename: full });
    return exports;
  }
  return { load };
}

test('the 29-second awareness film keeps its original media and engagement identity with exact corrected copy', () => {
  const { AWARENESS_FILM: film, engagementId } = fixture().load('lib/editorial-films.ts');
  assert.equal(film.title, 'UNITED AGAINST HATE SPEECH & DISINFORMATION');
  assert.equal(film.name, 'PEACE & UNITY · AWARENESS CAMPAIGN');
  assert.equal(film.file, 'documentary-teaser-03.mp4');
  assert.equal(engagementId(film), 'documentary-teaser-03');
  assert.equal(film.description, 'An awareness campaign developed with MONUSCO, the United Nations peacekeeping mission in the Democratic Republic of Congo, promoting peace, unity and the fight against disinformation and hate speech.');
  assert.equal(film.credit, 'Awareness campaign on peace, unity, disinformation and hate speech.');
  assert.doesNotMatch([film.name, film.title, film.description, film.credit].join(' '), /CANAL|documentary|teaser|endorsement/i);
  assert.equal(film.width / film.height, 1280 / 678);
});

test('three removed entries are archived, not destroyed; unrelated published films and IDs survive', () => {
  const m = fixture().load('lib/editorial-films.ts');
  assert.equal(m.EDITORIAL_FILM_ARCHIVE.length, 6);
  assert.deepEqual(Array.from(m.PUBLISHED_FILMS, (f) => f.file), [
    'documentary-teaser-03.mp4', 'fashion-week-tv5.mp4', 'radio-okapi-trailer.mp4',
  ]);
  for (const no of ['01', '02', '04']) {
    const f = m.EDITORIAL_FILM_ARCHIVE.find((x) => x.file === `documentary-teaser-${no}.mp4`);
    assert.equal(f.status, 'archived');
    assert.equal(m.engagementId(f), `documentary-teaser-${no}`);
  }
  assert.equal(m.engagementId(m.PUBLISHED_FILMS[1]), 'fashion-week-tv5');
  assert.equal(m.engagementId(m.PUBLISHED_FILMS[2]), 'radio-okapi');
});

test('actual public collection mounts only published players with correct text and same compact engagement IDs', () => {
  const f = fixture();
  const Page = f.load('components/editorial/BroadcastFilms.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Page));
  assert.equal((html.match(/<video /g) ?? []).length, 3);
  for (const no of ['01', '02', '04']) assert.doesNotMatch(html, new RegExp(`documentary-teaser-${no}`));
  assert.doesNotMatch(html, />CANAL|The One Documentaire|Documentary highlight|checked=""/i);
  for (const id of ['documentary-teaser-03', 'fashion-week-tv5', 'radio-okapi']) {
    assert.ok(html.includes(`data-engagement="${id}"`));
  }
  assert.equal((html.match(/data-layout="row"/g) ?? []).length, 3);
  assert.match(html, /MONUSCO/);
  assert.match(html, /TV5MONDE/);
  assert.match(html, /RADIO OKAPI/);
  assert.match(html, /width="1280" height="678"/);
  assert.doesNotMatch(html, /autoplay/i);
  assert.match(html, /controls=""/);
  assert.match(html, /playsInline=""/);
});

test('the alternate Partners collection cannot re-expose archived videos or incorrect documentary attribution', () => {
  const f = fixture();
  const Section = f.load('components/editorial/DocumentaryTeasers.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Section));
  assert.equal((html.match(/<video /g) ?? []).length, 1);
  assert.match(html, /UNITED AGAINST HATE SPEECH/);
  assert.match(html, /documentary-teaser-03.mp4/);
  assert.doesNotMatch(html, /CANAL|Four excerpts|Documentaire|1 min 16|7 s|1 min 01/);
});

test('motion and presentation preserve accessibility, aspect ratios, original native controls and dynamic rendering', () => {
  const css = read('components/editorial/cinematic/cinematic.css');
  const hook = read('components/editorial/cinematic/use-cinematic-reveal.ts');
  const card = read('components/editorial/cinematic/CinematicVideoStory.tsx');
  assert.match(css, /object-fit: contain/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(hook, /IntersectionObserver/);
  assert.match(hook, /clearTimeout/);
  assert.match(hook, /focusin/);
  assert.match(hook, /dataset.immediate = 'true'/);
  assert.match(css, /--cine-copy-delay: calc\(var\(--cine-frame-delay\) \+ var\(--cine-frame-duration\)\)/);
  assert.match(css, /--cine-actions-delay: calc\(var\(--cine-copy-delay\) \+ \.65s\)/);
  assert.match(css, /tomi-cine-action-in/);
  assert.match(css, /nth-child\(3\)/);
  assert.match(card, /aspectRatio:.*film.width.*film.height/);
  assert.match(card, /preload="none" autoPlay=\{false\}/);
  assert.match(card, /layout="row"/);
  assert.match(read('components/editorial/BroadcastFilms.tsx'), /films.map/);
});

test('future videos reuse only the existing published News feed and management paths, with pagination and freshness', () => {
  const source = read('components/editorial/cinematic/PublishedCampaignVideos.tsx');
  assert.match(source, /getPublishedNewsArticles/);
  assert.match(source, /filter\(\(a\) => !!a.snapshot.video\)/);
  assert.match(source, /getNextPageParam/);
  assert.match(source, /fetchNextPage/);
  assert.match(source, /refetchInterval: 60000/);
  assert.match(source, /refetchOnWindowFocus: true/);
  assert.match(source, /publicMediaUrl\(a.slug\)/);
  assert.match(source, /embedSrc/);
  assert.match(source, /videoWidth, videoHeight/);
  assert.match(source, /ShareStory/);
  assert.doesNotMatch(source, /useGetFounderNews|mutate|new CMS/);
});
