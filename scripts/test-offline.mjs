import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Never inherit database credentials, provider keys or connector configuration.
const env = Object.fromEntries(
  ["PATH", "HOME", "TMPDIR", "LANG", "SYSTEMROOT"].filter(k => process.env[k])
    .map(k => [k, process.env[k]]),
);
env.NODE_ENV = "test";
env.CI = "true";
const root = fileURLToPath(new URL("../", import.meta.url));
// Use the workspace's declared TS loader consistently on clean CI checkouts.
const tsx = createRequire(new URL("./package.json", import.meta.url)).resolve("tsx");
const databaseTests = new Set([
  "direct-call-postgres.test.mjs",
  "gratitude.integration.test.mjs",
]);
const suites = [
  ["artifacts/api-server", "test", /\.test\.mjs$/, []],
  ["artifacts/web", "test", /\.test\.mjs$/, []],
  ["scripts", "src/tests", /\.test\.ts$/, []],
];
let failed = false;
for (const [dir, tests, pattern, options] of suites) {
  const files = readdirSync(new URL(`../${dir}/${tests}/`, import.meta.url))
    .filter(name => pattern.test(name) && !databaseTests.has(name))
    .sort().map(name => `${tests}/${name}`);
  console.log(`\nOffline suite: ${dir} (${files.length} files)`);
  const result = spawnSync(process.execPath, ["--import", tsx, ...options, "--test", ...files], {
    cwd: `${root}${dir}`, env, stdio: "inherit", timeout: 120_000,
  });
  if (result.status !== 0) {
    failed = true;
    if (result.error) console.error(result.error.message);
  }
}
console.log("\nDatabase integration tests excluded: use only a verified disposable database.");
process.exitCode = failed ? 1 : 0;
