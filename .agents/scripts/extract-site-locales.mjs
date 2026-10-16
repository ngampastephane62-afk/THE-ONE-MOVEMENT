import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
const root = "artifacts/web/src";
const strings = new Set();
const valid = raw => {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < 2 || text.length > 2400 || !/[A-Za-z]/.test(text)) return null;
  if (/^(https?:|\/|#|@|\.|var\(|hsl\(|rgb\()/i.test(text)) return null;
  if (/[{}<>=\\]/.test(text) || /(^|\s)(?:bg-|text-|font-|border-|rounded-|grid-|flex-|hover:|focus:|px-|py-|mt-|gap-|sm:|md:|lg:|aria-|data-)/.test(text)) return null;
  if (/^[a-z\d]+(?:[-._:/][a-z\d]+)+$/i.test(text) || /^[A-Z0-9]+_[A-Z_0-9]+$/.test(text)) return null;
  if (text.includes(" ") && !/[A-Za-z]{2}/.test(text)) return null;
  return text;
};
function visit(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const walk = node => {
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const skip = ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) ||
        ts.isLiteralTypeNode(parent) ||
        ts.isPropertyAssignment(parent) && parent.name.getText(source).includes("class") ||
        ts.isJsxAttribute(parent) && !["placeholder", "title", "alt", "aria-label"].includes(parent.name.getText(source));
      if (!skip) {
        const text = valid(node.text);
        if (text) strings.add(text);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
}
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory() && !["ui", "locales"].includes(item.name)) walk(p);
    else if (item.isFile() && /\.tsx?$/.test(p) && !p.includes("locale")) visit(p);
  }
}
walk(root);
for (const file of [
  "lib/shared/src/ambassadorCatalogue.ts", "lib/shared/src/impactLeaders.ts",
  "artifacts/api-server/src/services/monthlyMembership.ts",
  "artifacts/api-server/src/routes/professional.ts",
  "artifacts/api-server/src/routes/editorialEngagement.ts",
]) visit(file);
for (const text of [
  "Email address", "Password", "Continue", "Sign in", "Sign up", "Create your account",
  "Welcome back", "First name", "Last name", "Forgot password?", "Verify your email",
  "Enter the verification code", "Resend code", "Continue with Google", "or",
  "Don't have an account?", "Already have an account?", "Sign out", "Manage account",
  "Send verification code", "Enter your email address", "Enter your password",
  "Use another method", "Back", "Cancel", "Save", "Submit", "Loading...", "Search",
  "pending", "paid", "refunded", "expired", "new", "contacted", "arranged", "closed",
]) strings.add(text);
const folder = "generated-artifacts/site-locales";
fs.mkdirSync(folder, { recursive: true });
const old = fs.existsSync(`${folder}/source.json`) ? JSON.parse(fs.readFileSync(`${folder}/source.json`, "utf8")) : [];
const known = new Set(old);
const values = [...old, ...[...strings].filter(s => !known.has(s)).sort()];
for (let i = 0; i < values.length; i += 80) {
  fs.writeFileSync(`${folder}/batch-${String(i / 80).padStart(3, "0")}.json`, JSON.stringify(values.slice(i, i + 80)));
}
fs.writeFileSync(`${folder}/source.json`, JSON.stringify(values));
console.log({ phrases: values.length, batches: Math.ceil(values.length / 80), characters: values.join("").length });
