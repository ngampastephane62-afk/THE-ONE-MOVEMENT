import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// This command can never target DATABASE_URL from the caller.
if (process.env.REPLIT_DEPLOYMENT || process.env.NODE_ENV === "production") {
  throw new Error("Disposable database tests cannot run in production.");
}
const root = fileURLToPath(new URL("../", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "tomi-test-"));
const data = join(dir, "data");
const socket = join(dir, "socket");
mkdirSync(socket, { mode: 0o700 });
const env = Object.fromEntries(
  ["PATH", "HOME", "TMPDIR", "LANG"].filter(k => process.env[k])
    .map(k => [k, process.env[k]]),
);
env.NODE_ENV = "test";
env.DATABASE_URL = `postgresql://tomi_test@localhost/tomi_test?host=${encodeURIComponent(socket)}&port=55439`;
let started = false;
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd, env, encoding: "utf8", timeout: 120_000,
  });
  // Do not relay raw database/tool errors which could include connection strings.
  if (result.status !== 0) {
    throw new Error(`${command} ${args[0]} failed; isolated phase stopped (exit ${result.status ?? "unavailable"}).`);
  }
  return result.stdout;
}
try {
  run("initdb", ["-D", data, "-A", "trust", "-U", "tomi_test", "--no-locale"]);
  run("pg_ctl", ["-D", data, "-l", join(dir, "postgres.log"),
    "-o", `-h '' -k ${socket} -p 55439`, "-w", "start"]);
  started = true;
  run("createdb", ["-h", socket, "-p", "55439", "-U", "tomi_test", "tomi_test"]);
  console.log("Created a new empty PostgreSQL cluster on a private Unix socket; no inherited database connection used.");
  run("pnpm", ["--filter", "@workspace/db", "db:migrate"]);
  console.log("Journaled migrations succeeded on the disposable database.");
  const counts = run("psql", ["-h", socket, "-p", "55439", "-U", "tomi_test",
    "-d", "tomi_test", "-Atc", "select count(*) from information_schema.tables where table_schema='public'"]);
  console.log(`Created public tables: ${counts.trim()}`);
  console.log(run(process.execPath, ["--test", "test/direct-call-postgres.test.mjs"],
    join(root, "artifacts/api-server")));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (started) {
    try { run("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]); }
    catch { console.error("Could not stop the disposable PostgreSQL instance; cleanup deferred."); process.exitCode = 1; }
  }
  // Only remove the exact fresh temporary directory created by this command.
  const status = spawnSync("pg_ctl", ["-D", data, "status"], { env, encoding: "utf8" });
  if (status.status === 3 || !started) rmSync(dir, { recursive: true, force: true });
}
