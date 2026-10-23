import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { tmpdir } from "node:os";

// Generation only. No database credentials. Never used by db:migrate.
export default defineConfig({
  schema: path.join(__dirname, "index.ts"),
  out: path.relative(process.cwd(), path.join(tmpdir(), "tomi-active-sector-privacy-review")),
  dialect: "postgresql",
});
