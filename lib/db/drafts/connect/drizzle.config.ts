import { defineConfig } from "drizzle-kit";

// Generate only, no credentials and no migrate script. Never run the reference
// baseline SQL against a database: it describes tables that already exist.
export default defineConfig({
  schema: "./drafts/connect/schema.ts",
  out: "./drafts/connect/review",
  dialect: "postgresql",
});
