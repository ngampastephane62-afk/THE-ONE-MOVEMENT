import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const sources = new Set();
const normalize = value => value.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const human = value => {
  const s = normalize(value);
  return s.length >= 2 && s.length <= 6000 && /\p{L}/u.test(s)
    && !/^(?:https?:|\/api\/|\/storage\/|data:|[.#]\w|\w+:\/\/)/.test(s)
    && !/(?:SELECT |INSERT |UPDATE .* SET|count\(\*\)|className=|\b(?:bg|text|border|rounded|flex|grid|hover|focus|space|gap|px|py|font|tracking|leading)-\w|max-width:|min-width:|calc\(|:nth-|@keyframes)/i.test(s);
};
const props = new Set(["label", "title", "subtitle", "description", "note", "summary", "unavailableNote", "text", "body", "eyebrow",
  "heading", "subheading", "hint", "placeholder", "alt", "msg", "message", "emptyTitle", "emptyBody", "caption",
  "purpose", "criteria", "introduction", "question", "aria-label", "t", "d", "tab", "benefit", "short", "name"]);
function collect(file) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const add = value => { if (human(value)) sources.add(normalize(value)); };
  function visit(n) {
    if (ts.isJsxText(n)) add(n.text);
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      if ((ts.isJsxAttribute(p) && props.has(p.name.getText(ast))) ||
        (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent))) ||
        (ts.isPropertyAssignment(p) && props.has(p.name.getText(ast).replace(/^['"]|['"]$/g, ""))) ||
        (n.text.length > 18 && /\s/.test(n.text) && /[.!?]$/.test(n.text) && !ts.isImportDeclaration(p))) add(n.text);
      // Labels selected by ternary/boolean JSX expressions.
      if (ts.isConditionalExpression(p) && p.parent && ts.isJsxExpression(p.parent)) add(n.text);
      // Short data-driven headings and tuple labels do not necessarily end in punctuation.
      if (ts.isArrayLiteralExpression(p) && /^(?:[A-Z][a-z]{2,}(?:[ '’&,:().!?–—-][A-Za-zÀ-ÿ '’&,:().!?–—-]*)?|[A-Z][A-Z ]{4,})$/.test(n.text)) add(n.text);
    }
    if (ts.isTemplateExpression(n)) {
      let key = n.head.text, fixed = key.length;
      n.templateSpans.forEach((span, i) => { key += `{${i}}` + span.literal.text; fixed += span.literal.text.length; });
      if (fixed >= 12 && /\s/.test(key) && !/[<>]|import\(|sql`|filename=|;base64,/.test(key)) add(key);
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
}
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["assets", "locales", "node_modules", "generated", "tests", "test"].includes(e.name)) continue;
    const file = path.join(dir, e.name);
    if (e.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) collect(file);
  }
}
walk("artifacts/web/src");
walk("lib/shared/src");
const clerkRequire = createRequire(path.resolve("artifacts/web/package.json"));
const { enUS } = await import(pathToFileURL(clerkRequire.resolve("@clerk/localizations")).href);
function authCopy(value) {
  if (typeof value === "string" && human(value) && !/^en-US$/.test(value)) sources.add(normalize(value));
  else if (value && typeof value === "object") Object.values(value).forEach(authCopy);
}
authCopy(enUS);
const languages = ["fr", "ar", "es", "pt", "sw", "zh"];
// Existing typed catalogues also supply many page translations. Evaluate only
// their bundled static exports, not the browser LocaleProvider or visitor data.
const req = createRequire(path.resolve("artifacts/api-server/package.json"));
const { build } = await import(pathToFileURL(req.resolve("esbuild")).href);
const bundle = await build({ stdin: { contents: `
  import {socialProfileCopy} from './artifacts/web/src/lib/locales/social-profile-copy';
  import {documentaryPartnersCopy} from './artifacts/web/src/lib/locales/documentary-partners-copy';
  import {magazineCopy} from './artifacts/web/src/lib/locales/magazine-copy';
  import {partnersCopy} from './artifacts/web/src/lib/locales/partners-copy';
  import {EDITORIAL_MEDIA_COPY} from './artifacts/web/src/lib/editorial-media-copy';
  export const dictionaries = Object.fromEntries(['fr','ar','es','pt','sw','zh'].map(l=>[l,
    {...socialProfileCopy[l],...documentaryPartnersCopy[l],...magazineCopy[l],...partnersCopy[l],...EDITORIAL_MEDIA_COPY[l]}]));
`, resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false });
const typed = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const dictionaries = Object.fromEntries(languages.map(lang => {
  const root = JSON.parse(fs.readFileSync(`artifacts/web/src/lib/locales/${lang}.json`, "utf8"));
  Object.assign(root, typed.dictionaries[lang]);
  const extraDir = "artifacts/web/src/lib/locales/editorial";
  if (fs.existsSync(extraDir)) for (const name of fs.readdirSync(extraDir)) {
    if (new RegExp(`^${lang}(?:-\\d+)?\\.json$`).test(name)) Object.assign(root, JSON.parse(fs.readFileSync(path.join(extraDir, name), "utf8")));
  }
  return [lang, new Set(Object.keys(root).map(key => normalize(key).toLowerCase()))];
}));
const result = [...sources].sort().filter(source => languages.some(lang => !dictionaries[lang].has(source.toLowerCase())))
  .map((source, index) => ({ index, source }));
const out = process.argv[2] ?? "/tmp/tomi-missing-copy.json";
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ extracted: sources.size, missing: result.length, output: out }));
