/**
 * Design tokens — PLACEHOLDER VALUES ONLY.
 *
 * Stage 0 (project foundation) intentionally ships a neutral, unstyled
 * shell. The real visual identity (colors, typography, spacing scale) is
 * defined in Stage 1 and must replace these placeholders — do not treat
 * anything here as final brand direction.
 */
export const tokens = {
  color: {
    background: "#ffffff",
    foreground: "#111111",
    border: "#e5e5e5",
    muted: "#666666",
  },
  font: {
    family: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  spacing: {
    page: "1.5rem",
  },
} as const;
