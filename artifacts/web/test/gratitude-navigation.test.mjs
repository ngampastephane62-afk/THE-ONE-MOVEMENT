import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(new URL('../package.json', import.meta.url));
const ts = require('typescript');
const module = { exports: {} };
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/gratitude-intent.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module, exports: module.exports, URLSearchParams });
const { gratitudeIntent, gratitudeMemberPath } = module.exports;

test('only the two campaign intents survive the member sign-in round trip', () => {
  for (const intent of ['text', 'video']) {
    assert.equal(gratitudeIntent(`?intent=${intent}`), intent);
    assert.equal(gratitudeIntent(`?gratitudeIntent=${intent}`, 'gratitudeIntent'), intent);
    assert.equal(gratitudeMemberPath(intent), `/member/thanks-the-world?intent=${intent}`);
  }
});
test('external URLs, arbitrary member paths, malformed and empty intents cannot become redirects', () => {
  for (const value of ['', 'https://example.com', '//example.com', '/member/admin', 'VIDEO', 'javascript:alert(1)']) {
    assert.equal(gratitudeIntent(`?gratitudeIntent=${encodeURIComponent(value)}`, 'gratitudeIntent'), null);
  }
});
test('the UI carries campaign intent without changing identity providers or other programme destinations', () => {
  const read = p => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
  assert.match(read('pages/member/index.tsx'), /location === '\/member\/thanks-the-world'/);
  assert.match(read('pages/member/index.tsx'), /sign-in\?gratitudeIntent=/);
  assert.match(read('pages/sign-in/index.tsx'), /applicationPath \?\? \(intent \? gratitudeMemberPath\(intent\) : '\/member'\)/);
});
