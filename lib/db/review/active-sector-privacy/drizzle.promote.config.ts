import { defineConfig } from "drizzle-kit";
import review from "./drizzle.review.config";

// Generation only; application uses the normal, separately guarded db:migrate.
export default defineConfig({ ...review, out: "./drizzle" });
