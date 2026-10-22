import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

// Offline fixtures only: no server, database, Clerk, storage or publication.
const root = resolve(import.meta.dirname, '../src');
const web = createRequire(new URL('../package.json', import.meta.url));
const React = web('react');
const { renderToStaticMarkup } = web('react-dom/server');
const read = p => readFileSync(resolve(root, p), 'utf8');
const plain = v => JSON.parse(JSON.stringify(v));

function fixture(extra = {}) {
  const cache = new Map();
  const mocks = {
    react: React,
    'react/jsx-runtime': web('react/jsx-runtime'),
    wouter: { Link: ({ children, ...p }) => React.createElement('a', p, children) },
    '@/lib/utils': { cn: (...v) => v.filter(Boolean).join(' ') },
    '@/lib/news-cms': {
      categoryLabel: c => c,
      formatDate: v => v,
      publicMediaUrl: slug => id => `/api/news/articles/${slug}/media/${id}`,
      embedSrc: (p, id) => p === 'youtube' ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : `https://player.vimeo.com/video/${id}`,
    },
    '@workspace/shared': { PARTNER_INTRODUCTION_TARGETS: [] },
    ...extra,
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    const code = ts.transpileModule(readFileSync(file, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/'"), {
      fileName: file,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(code, {
      module, exports: module.exports, URL, console,
      require: id => {
        if (id in mocks) return mocks[id];
        if (id.endsWith('.css')) return {};
        if (id === 'lucide-react') return web(id);
        if (id.startsWith('.') || id.startsWith('@/')) {
          const base = id.startsWith('@/') ? resolve(root, id.slice(2)) : resolve(dirname(file), id);
          const found = ['', '.ts', '.tsx'].map(ext => base + ext).find(existsSync);
          assert.ok(found, `Local import ${id}`);
          return load(found);
        }
        assert.fail(`Unexpected runtime dependency ${id}`);
      },
    }, { filename: file });
    cache.set(file, module.exports);
    return module.exports;
  }
  return p => load(resolve(root, p));
}

function article(id, publishedAt, category = 'news', changes = {}) {
  return { id, slug: `story-${id}`, publishedAt, snapshot: {
    schemaVersion: 1, title: `Story ${id}`, subtitle: `Introduction ${id}`,
    category, publicationDate: '2099-01-01T00:00:00Z', body: [],
    cover: null, video: null, author: 'TOMI', additionalImages: [],
    relatedProgrammeSlug: null, relatedPartnerKey: null, ...changes,
  } };
}
const model = fixture()('lib/news-feed.ts');

test('latest sorting uses publication instant, not event/display date, and never mutates API data', () => {
  const rows = [
    article(1, '2026-10-20T08:00:00Z'),
    article(2, '2026-10-21T09:00:00Z', 'event-announcement', { publicationDate: '2000-01-01' }),
    article(3, '2026-10-21T09:00:00Z'),
    article(4, 'invalid'),
  ];
  assert.deepEqual(plain(model.sortByPublishedAt(rows).map(a => a.id)), [3, 2, 1, 4]);
  assert.deepEqual(rows.map(a => a.id), [1, 2, 3, 4]);
});

test('a newly published article becomes hero on refreshed public data and the former hero remains discoverable', () => {
  const old = article(1, '2026-10-20T08:00:00Z');
  assert.equal(model.groupNews([old]).hero.id, 1);
  const newer = article(2, '2026-10-21T08:00:00Z');
  const groups = model.groupNews([old, newer]);
  assert.equal(groups.hero.id, 2);
  assert.deepEqual(plain(groups.feed.map(a => a.id)), [1]);
});

test('all published items occur once across editorial groups, including category overflow', () => {
  const rows = [
    article(20, '2026-10-22T10:00:00Z'),
    ...Array.from({ length: 5 }, (_, i) => article(10 + i, `2026-10-${10 + i}T10:00:00Z`, 'official-announcement')),
    article(5, '2026-10-09T10:00:00Z', 'video-news', { video: { kind: 'upload', uploadId: 'video-5' } }),
    article(4, '2026-10-08T10:00:00Z', 'opportunity'),
    article(3, '2026-10-07T10:00:00Z', 'news', { relatedProgrammeSlug: 'summit' }),
  ];
  const groups = model.groupNews([...rows, rows[0]]);
  const all = [groups.hero, ...groups.featured, ...groups.feed, ...groups.motion, ...groups.programmes].filter(Boolean);
  assert.deepEqual(all.map(a => a.id).sort(), rows.map(a => a.id).sort());
  assert.equal(groups.featured.length, 3);
  assert.equal(groups.motion[0].id, 5);
  assert.deepEqual(plain(groups.programmes.map(a => a.id)), [4, 3]);
});

test('older pagination never substitutes an older hero or silently loses current-page stories', () => {
  const latest = article(100, '2026-10-22T10:00:00Z');
  const older = [article(2, '2026-10-01T10:00:00Z'), article(1, '2026-09-01T10:00:00Z')];
  const groups = model.groupNews([latest], older);
  assert.equal(groups.hero.id, 100);
  assert.deepEqual(plain(groups.feed.map(a => a.id)), [2, 1]);
  assert.equal(model.groupNews([]).hero, null);
});

test('hero truthfully distinguishes real publication, empty, loading and connection failure', () => {
  const Hero = fixture()('components/news-live/LatestHero.tsx').default;
  const base = { hero: null, loading: false, error: false, onRetry() {}, paused: false, onTogglePause() {} };
  const render = props => renderToStaticMarkup(React.createElement(Hero, { ...base, ...props }));
  assert.match(render({}), /No story has been published yet/);
  assert.match(render({ loading: true }), /aria-busy="true"/);
  assert.match(render({ error: true }), /button-retry-latest/);
  const a = article(1, '2026-10-21T10:00:00Z', 'news', { cover: { uploadId: 'cover-1', alt: 'Official cover' } });
  const html = render({ hero: a });
  assert.match(html, /href="\/news\/story-1"/);
  assert.match(html, /src="\/api\/news\/articles\/story-1\/media\/cover-1"/);
  assert.match(html, /dateTime="2026-10-21T10:00:00Z"/i);
  assert.doesNotMatch(html, /2099-01-01|autoPlay=""|data-nm="armed"/);
});

test('public refresh and archive hierarchy preserve the existing publishing/privacy boundary', () => {
  const page = read('pages/news/index.tsx');
  assert.match(page, /refetchInterval: 60000/);
  assert.match(page, /refetchOnWindowFocus: true/);
  assert.match(page, /refetchIntervalInBackground: false/);
  assert.ok(page.indexOf('<LatestHero') < page.indexOf('<PressArchive'));
  assert.ok(page.indexOf('<StoriesInMotion') < page.indexOf('<PressArchive'));
  assert.doesNotMatch(page, /useGetFounderNews|founder\/news|mutateAsync/);
  const archive = read('components/news-live/PressArchive.tsx');
  for (const id of ['input-search-coverage', 'select-outlet', 'button-category-', 'button-clear-filters', 'link-outbound-', 'card-coverage-']) assert.ok(archive.includes(id), id);
  assert.match(archive, /EvidenceViewer/);
  assert.match(archive, /useCaptureDeepLink/);
});

test('uploaded and embedded media keep user-controlled playback and uncropped proportions', () => {
  const { StoryMedia } = fixture()('components/news-live/parts.tsx');
  const render = a => renderToStaticMarkup(React.createElement(StoryMedia, { a, preferVideo: true }));
  const uploaded = article(2, '2026-10-21T10:00:00Z', 'video-news', { video: { kind: 'upload', uploadId: 'video-2' } });
  const native = render(uploaded);
  assert.match(native, /<video[^>]*controls/);
  assert.match(native, /object-contain/);
  assert.doesNotMatch(native, /autoPlay=""/);
  const embedded = article(3, '2026-10-21T10:00:00Z', 'video-news', { video: { kind: 'embed', provider: 'youtube', videoId: 'abcdefghijk' } });
  const embed = render(embedded);
  assert.doesNotMatch(embed, /<iframe/);
  assert.match(embed, /button-play-story-story-3/);
  const media = read('components/news-live/parts.tsx');
  assert.match(media, /onError=\{\(\) => setFailed\('video'\)\}/);
  assert.match(media, /Loading published cover/);
});

test('archive gallery keeps every original capture and accessible manual navigation', () => {
  const load = fixture({ '@/lib/press': { assetUrl: s => s } });
  const Gallery = load('components/news-live/CaptureGallery.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Gallery, {
    images: ['/api/news/1/assets/0', '/api/news/1/assets/1'],
    outlet: 'Original publisher', onOpen() {}, testId: 'button-open-captures-1',
  }));
  assert.match(html, /button-open-captures-1"/);
  assert.match(html, /button-open-captures-1-slide-1/);
  assert.match(html, /Previous capture/);
  assert.match(html, /Next capture/);
  assert.match(html, /Screen 1 of 2/);
  assert.equal((html.match(/object-contain/g) || []).length, 2);
  assert.doesNotMatch(html, /object-cover|autoPlay|setInterval/);
});

test('archive reactions target the displayed capture, without changing the default photo chooser', () => {
  const load = fixture({
    '@/lib/media-share': { canonicalMediaSource: s => s },
    './GalleryActions': { default: ({ items, index, layout }) => React.createElement('div', { 'data-source': items[index].source, 'data-layout': layout }) },
  });
  const Photos = load('components/editorial/PhotoSetActions.tsx').default;
  const items = [{ src: '/capture-1', title: 'First' }, { src: '/capture-2', title: 'Second' }];
  const html = renderToStaticMarkup(React.createElement(Photos, { items, selectedIndex: 1, hideChooser: true, layout: 'row' }));
  assert.match(html, /data-source="\/capture-2"/);
  assert.match(html, /data-layout="row"/);
  assert.doesNotMatch(html, /Choose a photo to react to/);
  const normal = renderToStaticMarkup(React.createElement(Photos, { items }));
  assert.match(normal, /data-source="\/capture-1"/);
  assert.match(normal, /Choose a photo to react to/);
  const archive = read('components/news-live/PressArchive.tsx');
  assert.equal((archive.match(/selectedIndex=\{captureIndex\}/g) || []).length, 2);
});
