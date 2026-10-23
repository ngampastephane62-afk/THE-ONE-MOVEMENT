import { defineConfig } from "drizzle-kit";
import review from "./drizzle.review.config";

// Generation only. Applying a canonical migration still requires the standard
// migration command and separately verified development target.
export default defineConfig({ ...review, out: "./drizzle" });
