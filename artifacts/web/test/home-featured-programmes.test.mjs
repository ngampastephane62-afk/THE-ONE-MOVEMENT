import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const source = readFileSync(new URL('../src/components/home/OfficialProgrammes.tsx', import.meta.url), 'utf8');

// Exercise the actual curated card mapping, stubbing only media transport and
// entrance wrappers. No API, account, video download or database is used.
function render() {
  const module = { exports: {} };
  const mocks = {
    'react/jsx-runtime': requireWeb('react/jsx-runtime'),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children) },
    'lucide-react': requireWeb('lucide-react'),
    './HomeReveal': { default: ({ children }) => children },
    '@/components/SectionHeading': { default: ({ heading }) => React.createElement('h2', {}, heading) },
    '@/components/ArchivePhoto': {
      default: ({ id }) => React.createElement('figure', { 'data-approved-photo': id }),
      archivePhotoSource: id => `/approved/${id}.webp`,
    },
    '@/components/editorial/MediaActions': { default: ({ source, layout }) => React.createElement('div', { 'data-social-source': source, 'data-layout': layout }) },
    '@/components/programs/ProgrammeFilm': { default: ({ id, presentation }) => React.createElement('figure', { 'data-approved-film': id, 'data-presentation': presentation }) },
  };
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module, exports: module.exports,
    require(id) {
      if (id.endsWith('.css')) return {};
      assert.ok(id in mocks, `Unexpected card dependency: ${id}`);
      return mocks[id];
    },
  });
  return renderToStaticMarkup(React.createElement(module.exports.default));
}

test('Home features exactly Awards, Summit and Fashion Week with their approved sources and existing routes', () => {
  const html = render();
  assert.deepEqual([...html.matchAll(/data-testid="card-home-program-([^"]+)"/g)].map(m => m[1]), ['awards', 'summit', 'fashion-week']);
  for (const slug of ['awards', 'summit', 'fashion-week']) assert.ok(html.includes(`href="/programs/${slug}"`));
  assert.match(html, /data-approved-film="awards-rosina-2027"/);
  assert.match(html, /data-approved-photo="summit-goma"/);
  assert.match(html, /data-approved-film="fashion-knight-2026"/);
  assert.match(html, />The One Awards<\/span><\/h3>/);
  assert.match(html, />The One Summit<\/span><\/h3>/);
  assert.match(html, />The One Fashion Week International<\/span><\/h3>/);
  assert.equal((html.match(/data-presentation="home"/g) ?? []).length, 2);
  assert.match(html, /data-social-source="\/approved\/summit-goma.webp" data-layout="row"/);
  assert.match(html, />Discover The One Awards<\/span>/);
  assert.match(html, />Discover The One Summit<\/span>/);
  assert.match(html, />Discover The One Fashion Week<\/span>/);
  assert.doesNotMatch(html, /UPCOMING EVENT/);
  assert.doesNotMatch(html, /diplomatic-gala|ProgramVision/);
});

test('Home community patterns are decorative, restrained, motion-optional and media frames consistent', () => {
  const css = readFileSync(new URL('../src/components/home/home-patterns.css', import.meta.url), 'utf8');
  const paths = readFileSync(new URL('../src/components/home/MovementPaths.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../src/pages/home/HomeExperience.tsx', import.meta.url), 'utf8');
  assert.match(paths, /thp-pattern--steps/);
  assert.match(paths, /aria-hidden="true"/);
  assert.match(home, /thp-pattern--dark/);
  assert.match(css, /var\(--kuba-lattice\)/);
  assert.match(css, /var\(--kuba-steps\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /pointer-events: none/);
  assert.doesNotMatch(css, /aspect-ratio:\s*3\s*\/\s*4\s*!important/);
  assert.match(css, /object-fit: contain/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /tomi-act-l[^}]*position: absolute/);
  assert.match(css, /font-size: clamp\(1\.65rem, 7\.8vw, 2rem\)/);
});
