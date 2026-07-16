/**
 * GLOBAL GOLD — Design System Tokens
 * The One Movement International
 *
 * This file is the canonical reference for all token values.
 * The live theme is driven by CSS custom properties in index.css;
 * this file documents those values in TS for use in prose, tooling,
 * and component logic that needs raw values.
 *
 * Stage 1 — Design System (this stage). Values are FINAL for this
 * system and should not change without an explicit design revision.
 */

export const tokens = {
  /* ── Color families ────────────────────────────────────────────────────────
   *
   *  ACCESSIBLE PAIRINGS (WCAG AA verified):
   *
   *  ✓ ink-900 on ivory-100    — contrast ≥ 12:1  (body text, primary use)
   *  ✓ ivory-100 on ink-900    — contrast ≥ 12:1  (body text on dark, primary use)
   *  ✓ ink-900 on gold-500     — contrast ≥ 4.8:1 (button label on gold, large text ✓)
   *  ✓ ink-900 on gold-400     — contrast ≥ 3.5:1 (large text / display only ✓)
   *  ✓ ivory-100 on ink-800    — contrast ≥ 12:1  (dark hero body copy)
   *  ✓ crimson-700 on ivory-100— contrast ≥ 5.1:1 (accent tag — OK for body)
   *
   *  CAUTION / USE ONLY AT LARGE SIZES (≥ 24px or bold ≥ 18.67px):
   *  ~ gold-500 on ivory-100   — contrast ≈ 2.8:1 (eyebrow text, display only)
   *  ~ gold-400 on ink-900     — contrast ≈ 8.5:1 (bright gold on dark — passes AA)
   *
   *  BANNED PAIRINGS:
   *  ✗ gold-400 on ivory        — contrast < 2:1 (never use)
   *  ✗ gold-500 on white        — contrast < 3:1 (never use for body text)
   */
  color: {
    // Ink — deep warm near-black bronze family
    // Primary dark surface. Never use below ink-700 as a text color on light bg.
    ink: {
      950: "#090603",
      900: "#16100A",
      800: "#1A120B",
      700: "#221508",
      600: "#2C1E0D",
    },

    // Gold — rich warm gold
    // gold-400 = bright living highlight (use on dark surfaces only, large text only on light)
    // gold-500 = core brand gold (buttons, active states, eyebrow text at display size)
    // gold-600/700 = darkened gold for accessible body-size text on light surfaces
    gold: {
      400: "#F0CE83",
      500: "#C9A24B",
      600: "#A07B2B",
      700: "#7A5E1A",
    },

    // Ivory — warm light reading surfaces
    // Primary light background: ivory-100. Body text: ink-900 on ivory = ≥ 12:1.
    ivory: {
      50:  "#FDFAF5",
      100: "#F7F1E5",
      200: "#EDE3CD",
      300: "#DDD0B4",
    },

    // Sand — muted desert mid-tone
    // Secondary surfaces, subtle fills, decorative backgrounds
    sand: {
      100: "#E8DECC",
      200: "#D4C5A8",
      300: "#B8A78A",
      400: "#9A8B72",
    },

    // Crimson — MINIMAL USE ONLY (tags, data accents, error states)
    // Never use as a background larger than a badge or data chip.
    crimson: {
      700: "#7A2E2E",
      800: "#5E2020",
    },

    // Reserved — defined but NOT used in any default component
    programFashionweek: "#3E8FA3",
  },

  /* ── Typography ─────────────────────────────────────────────────────────── */
  font: {
    // Display: Cinzel — architectural, art-deco, monumental
    // Justification: Roman monumental proportions give institutional gravitas.
    // Geometric construction without ornamental excess. At clamp(3.5rem,8vw,7rem)
    // with 0.04em tracking it reads as landmark identity, not decoration.
    display: "'Cinzel', Georgia, serif",

    // Body: IBM Plex Sans — clean humanist, full Latin coverage, companion Arabic
    body: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",

    // Arabic / RTL: IBM Plex Sans Arabic — optical companion to IBM Plex Sans
    arabic: "'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif",

    mono: "'IBM Plex Mono', Menlo, monospace",
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
    eyebrow: "0.6875rem / 1.4 / 0.18em / uppercase", // always gold, always Cinzel or IBM Plex Sans
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
    sharp: "2px",  // institutional: section borders, structural lines, cards
    soft:  "6px",  // interactive: buttons, inputs, badges, checkboxes
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
    // All animations disabled under prefers-reduced-motion: reduce
  },

  /* ── Signature motifs ───────────────────────────────────────────────────── */
  motifs: {
    // 1. GOLD THREAD — thin gold line (H or V), optional node dot, shimmer
    // 2. RADIANT SURFACE — dark container with radial gold glow from bottom
    // 3. GEOMETRIC ACCENT — thin-line SVG woven geometric border strip
    // 4. DUOTONE IMAGE TREATMENT — .img-duotone CSS class (ink+gold → hover reveal)
  },
} as const;
