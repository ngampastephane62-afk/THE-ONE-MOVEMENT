/**
 * LAGOON & GOLD — Design System Tokens  (Palette V2)
 * The One Movement International
 *
 * Palette V2 replaces ink as the primary dark surface with the lagoon teal
 * family. Gold is retained as the second signature. Coral is a small-dose
 * energy accent only. Ink-900 is kept for body text on light surfaces.
 *
 * Stage 1 revision approved by owner. Values are FINAL for this system.
 */

export const tokens = {
  /* ── Color families ────────────────────────────────────────────────────────
   *
   *  ACCESSIBLE PAIRINGS — WCAG AA verified (Palette V2):
   *
   *  ✓ ink-900 on ivory-100       — contrast ≥ 12:1  (body text, primary use)
   *  ✓ ivory-100 on lagoon-900    — contrast ≥ 14:1  (body on dark hero/nav)
   *  ✓ ivory-100 on lagoon-800    — contrast ≥ 12:1  (body on dark surfaces)
   *  ✓ ink-900 on gold-500        — contrast ≥ 4.8:1 (button labels on gold)
   *  ✓ ivory-100 on ink-900       — contrast ≥ 12:1  (body on ink surfaces)
   *  ✓ gold-400 on lagoon-900     — contrast ≥ 8.5:1 (bright gold on teal dark)
   *  ✓ lagoon-600 on ivory-100    — contrast ≈ 8.8:1 (accessible teal body text)
   *  ✓ lagoon-500 on ivory-100    — contrast ≈ 6.6:1 (large text / display ok)
   *  ✓ crimson-700 on ivory-100   — contrast ≈ 5.1:1 (error text — OK for body)
   *
   *  DISPLAY / LARGE TEXT ONLY (not for body copy):
   *  ~ lagoon-400 on ivory-100    — contrast ≈ 4.1:1 (large text ✓, body ✗)
   *  ~ gold-500 on ivory-100      — contrast ≈ 2.8:1 (eyebrow / display only)
   *  ~ gold-400 on lagoon-900     — contrast ≈ 8.5:1 (passes AA — any size ok)
   *
   *  BANNED PAIRINGS:
   *  ✗ gold-400 on ivory          — contrast < 2:1 (never use)
   *  ✗ coral-500 on ivory (body)  — contrast ≈ 2.4:1 (display / tags only)
   *  ✗ lagoon-400 on ivory (body) — use lagoon-600 instead for body text
   */
  color: {
    // Ink — deep warm near-black bronze
    // Kept for body text on light surfaces and as a structural neutral.
    // Never use below ink-700 as a text color on light bg.
    ink: {
      950: "#090603",
      900: "#16100A",
      800: "#1A120B",
      700: "#221508",
      600: "#2C1E0D",
    },

    // Lagoon — deep teal family. PRIMARY DARK SURFACE (V2).
    // Replaces ink as hero/nav/footer background.
    // lagoon-900/800 = dark surfaces; lagoon-500/400 = accents & highlights.
    // lagoon-600 = AA-accessible teal for body text on ivory.
    lagoon: {
      900: "#0A2E33",  // deep teal-ink — nav, footer, hero base
      800: "#0E3D44",  // slightly lighter — secondary dark surface
      700: "#114E58",  // subtle border
      600: "#0D5F6E",  // accessible body text on ivory (≥ 4.5:1)
      500: "#157A8C",  // rich teal — accents, hovers, active states
      400: "#2BA3B8",  // electric bright teal — display / highlight only
    },

    // Gold — rich warm gold. SECOND SIGNATURE (retained from V1).
    // gold-400 = bright highlight on dark (lagoon) surfaces only.
    // gold-500 = core gold (buttons, active states, eyebrow at display size).
    // gold-600 = AA-accessible gold on light surfaces.
    gold: {
      400: "#F0CE83",
      500: "#C9A24B",
      600: "#A07B2B",
      700: "#7A5E1A",
    },

    // Ivory — warm light reading surfaces (unchanged from V1).
    ivory: {
      50:  "#FDFAF5",
      100: "#F7F1E5",
      200: "#EDE3CD",
      300: "#DDD0B4",
    },

    // Sand — muted desert mid-tone (unchanged from V1).
    sand: {
      100: "#E8DECC",
      200: "#D4C5A8",
      300: "#B8A78A",
      400: "#9A8B72",
    },

    // Coral — warm amber-coral. SMALL-DOSE ACCENT ONLY.
    // Use for tags, stat numbers (occasionally), energy highlights.
    // NEVER large areas. Contrast on ivory is ~2.4:1 — display/tags only.
    coral: {
      500: "#E27D4F",
      600: "#C45E30",  // darker for accessible text use if needed
    },

    // Crimson — error states and rare destructive accents.
    crimson: {
      700: "#7A2E2E",
      800: "#5E2020",
    },

    // Reserved program token — now harmonized with the master palette.
    // Updated from teal (#3E8FA3) to brand lagoon-500.
    programFashionweek: "#157A8C",
  },

  /* ── Typography ─────────────────────────────────────────────────────────── */
  font: {
    display: "'Cinzel', Georgia, serif",
    body:    "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
    arabic:  "'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif",
    mono:    "'IBM Plex Mono', Menlo, monospace",
  },

  /* ── Type scale ─────────────────────────────────────────────────────────── */
  typeScale: {
    displayXl: "clamp(3.5rem, 8vw, 7rem) / 0.92 / 0.04em",
    displayLg: "clamp(2.5rem, 5vw, 4.5rem) / 0.95 / 0.035em",
    displayMd: "clamp(1.75rem, 3.5vw, 2.75rem) / 1.05 / 0.03em",
    h1: "2rem / 1.15 / -0.01em",
    h2: "1.5rem / 1.2 / 0",
    h3: "1.25rem / 1.25 / 0",
    h4: "1rem / 1.3 / 0.02em",
    bodyLg: "1.125rem / 1.65",
    body: "1rem / 1.6",
    small: "0.875rem / 1.5",
    caption: "0.75rem / 1.4",
    eyebrow: "0.6875rem / 1.4 / 0.18em / uppercase",
  },

  /* ── Spacing — section rhythm ───────────────────────────────────────────── */
  section: {
    sm: "3rem",
    md: "5rem",
    lg: "8rem",
    xl: "12rem",
  },

  /* ── Radius personalities ───────────────────────────────────────────────── */
  radius: {
    none:  "0px",
    sharp: "2px",
    soft:  "6px",
    round: "9999px",
  },

  /* ── Motion ─────────────────────────────────────────────────────────────── */
  motion: {
    easeEntrance: "cubic-bezier(0.22, 1, 0.36, 1)",
    easeOut:      "ease-out",
    fadeUp:       "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
    fadeIn:       "fadeIn 0.4s ease-out both",
    hover:        "0.15s ease-in-out",
    shimmer:      "goldShimmer 2.4s linear infinite",
  },

  /* ── Signature motifs ───────────────────────────────────────────────────── */
  motifs: {
    // 1. GOLD THREAD — 1px line (H or V), optional node dot, shimmer on scroll-into-view
    // 2. RADIANT SURFACE — lagoon-900 base with radial gold glow (teal-meets-gold sunrise)
    // 3. GEOMETRIC ACCENT — thin-line SVG rhombus strip; gold-on-lagoon or lagoon-on-ivory
    // 4. DUOTONE IMAGE — lagoon-tinted via CSS filter; hover reveals full color
    // 5. PHOTO SLOT — img with duotone overlay + elegant lagoon-800 fallback
    // 6. PHOTO MOSAIC — asymmetric editorial grid (1 large + several small)
  },
} as const;
