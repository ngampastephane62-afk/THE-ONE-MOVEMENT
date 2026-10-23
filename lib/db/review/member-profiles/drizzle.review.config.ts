import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { tmpdir } from "node:os";

// No database credentials: this configuration is generation-only.
// Before generation, copy lib/db/drizzle into this temporary output directory.
// Relative `out` avoids the installed drizzle-kit absolute-path snapshot bug.
export default defineConfig({
  schema: path.join(__dirname, "index.ts"),
  out: path.relative(process.cwd(), path.join(tmpdir(), "tomi-member-profile-review")),
  dialect: "postgresql",
});
