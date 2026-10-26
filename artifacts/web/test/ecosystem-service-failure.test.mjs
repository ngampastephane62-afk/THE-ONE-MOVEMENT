import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const requireWeb = createRequire(new URL('../package.json', import.meta.url));
const React = requireWeb('react');
const { renderToStaticMarkup } = requireWeb('react-dom/server');
const source = readFileSync(new URL('../src/pages/member/Ecosystem.tsx', import.meta.url), 'utf8');

function render(query, founder = false) {
  const module = { exports: {} };
  const mocks = {
    react: { ...React, useEffect: () => {} },
    'react/jsx-runtime': requireWeb('react/jsx-runtime'),
    'lucide-react': requireWeb('lucide-react'),
    wouter: { Link: ({ children, ...props }) => React.createElement('a', props, children) },
    '@workspace/api-client-react': {
      useGetProfessionalState: () => query,
      getGetProfessionalStateQueryKey: () => ['fixture-professional'],
    },
    './ctx': { useMe: () => ({ me: { founder } }) },
    '@/components/network/kit': {
      card: 'fixture-card',
      errStatus: error => error?.status,
      ErrorBox: ({ msg }) => React.createElement('p', { role: 'alert' }, msg),
    },
    '@/components/network/EcosystemNews': { default: () => null },
    '@/components/editorial/Chapter': {
      default: ({ title, aside }) => React.createElement('header', {}, title, aside),
    },
  };
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module, exports: module.exports,
    localStorage: { getItem: () => 'en' },
    require(id) {
      assert.ok(id in mocks, `Unexpected dependency: ${id}`);
      return mocks[id];
    },
  });
  return renderToStaticMarkup(React.createElement(module.exports.default));
}

test('a professional-service failure leaves every free service visible and paid access unverified', () => {
  const html = render({ isError: true, error: { status: 503 } });
  for (const href of ['/member', '/member/people', '/member/messages', '/ecosystem'])
    assert.ok(html.includes(`href="${href}"`));
  assert.match(html, /Free services remain available/);
  assert.match(html, /HTTP 503/);
  assert.match(html, /Professional access not verified/);
  assert.doesNotMatch(html, /href="\/member\/business"/);
  assert.doesNotMatch(html, />Free member</);
});

test('loading and stale-error data do not unlock paid services; confirmed Founder access is retained', () => {
  const loading = render({ isLoading: true });
  assert.match(loading, /data-testid="page-ecosystem"/);
  assert.match(loading, /Checking professional services/);
  const stale = render({ isError: true, data: { membership: { active: true, tier: 'business' } } });
  assert.doesNotMatch(stale, /href="\/member\/business"/);
  const founder = render({ isError: true }, true);
  assert.match(founder, /Founder access/);
  assert.match(founder, /href="\/member\/business"/);
});

test('successful subscription checks preserve the existing service access mapping', () => {
  assert.match(render({ data: { membership: null } }), />Free member</);
  assert.match(render({ data: { membership: { active: true, tier: 'business' } } }), /href="\/member\/business"/);
});
