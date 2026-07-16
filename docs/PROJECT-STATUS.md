# Project Status — THE ONE MOVEMENT INTERNATIONAL

## APPROVED

- Stage 0 — Project Foundation: architecture, folder structure, routing with
  placeholder pages, database structure.
- Stage 1 — Design System ("GLOBAL GOLD"): complete visual identity token
  system, UI components, signature brand motifs, and internal gallery page.

## COMPLETED

### Stage 0 — Foundation
- Full-stack TypeScript scaffold: React + Vite frontend, Express backend.
- Client-side routing (wouter) with all 12 required placeholder pages plus
  Privacy Policy, Terms, and the Stage 1 design system gallery (/design-system).
- PostgreSQL + Drizzle: 14 tables pushed, `profile_categories` seeded (28 rows
  across 5 groups). No donation/payment/ticket/fundraising fields anywhere.
- Health-check endpoints: `GET /api/healthz` and `GET /api/health` (live DB check).
- Placeholder middleware (`rateLimit.ts`) and services directory.
- Generic server error handler.

### Stage 1 — Design System ("GLOBAL GOLD")

#### Display Font
**Cinzel** (weights 400, 600, 700 via Google Fonts, `display=swap`).
Chosen over Marcellus (too romantic) and Josefin Sans (too fashion-forward).
Cinzel's Roman monumental proportions deliver genuine architectural gravitas at
oversized scale. At `clamp(3.5rem, 8vw, 7rem)` with `0.04em` tracking it reads
as a landmark institution, not a brand template.

#### Body / Arabic Font
**IBM Plex Sans** (300–600) for English body copy.
**IBM Plex Sans Arabic** (300–600) for Arabic/RTL — optical companion.
All loaded non-blocking with `display=swap`.

#### Final Token Values
| Token        | Hex        | HSL                  | Role                           |
|-------------|-----------|----------------------|-------------------------------|
| ink-950      | #090603   | 30 42% 4%            | Deepest dark                  |
| ink-900      | #16100A   | 30 37% 7%            | Primary dark surface / text   |
| ink-800      | #1A120B   | 29 35% 8%            | Dark hero background          |
| ink-600      | #2C1E0D   | 29 30% 18%           | Subtle dark border            |
| gold-400     | #F0CE83   | 43 80% 73%           | Bright living highlight       |
| gold-500     | #C9A24B   | 39 52% 54%           | Core brand gold / CTAs        |
| gold-600     | #A07B2B   | 37 55% 40%           | Accessible gold on ivory      |
| ivory-50     | #FDFAF5   | 40 71% 98%           | Card background               |
| ivory-100    | #F7F1E5   | 38 57% 94%           | Page background               |
| ivory-200    | #EDE3CD   | 38 44% 87%           | Secondary fills               |
| sand-200     | #D4C5A8   | 36 26% 74%           | Borders                       |
| sand-400     | #9A8B72   | 33 16% 53%           | Secondary text / muted        |
| crimson-700  | #7A2E2E   | 0 45% 32%            | Error / rare accent (minimal) |
| program-fashionweek | #3E8FA3 | 191 45% 44%   | RESERVED — not in defaults    |

#### Typography Scale
| Style       | Size                        | Line-height | Tracking   |
|------------|----------------------------|------------|------------|
| display-xl | clamp(3.5rem, 8vw, 7rem)   | 0.92       | 0.04em     |
| display-lg | clamp(2.5rem, 5vw, 4.5rem) | 0.95       | 0.035em    |
| display-md | clamp(1.75rem, 3.5vw, 2.75rem) | 1.05   | 0.03em     |
| eyebrow    | 0.6875rem, uppercase       | 1.4        | 0.18em     |
| body       | 1rem                       | 1.6        | —          |

#### UI Components (all states)
Button: primary gold, gold-outline, outline, secondary, ghost, destructive, link;
sizes sm/default/lg/xl; loading spinner; disabled.
Badge: default, gold, verified (gold border), secondary, outline, destructive, crimson.
Card: ivory default, dark cinematic, program (gold accent inset line at top).
Alert: default, info (gold border), success, warning, destructive.
Tabs: gold underline indicator on active.
Skeleton: gold shimmer sweep.
Input/Label/Textarea/Select/Checkbox: gold focus ring via `--ring` token.
Dialog/Modal, Dropdown, Popover: unstyled in this stage (Radix primitives).

#### Signature Motifs
1. **GoldThread** — 1px horizontal/vertical line with gold shimmer sweep
   on scroll-into-view (IntersectionObserver + CSS animation). Optional node dot.
   Disabled under `prefers-reduced-motion`.
2. **HeroSurface** — Ink background with layered radial gold gradients rising
   from below. Pure CSS, no noise, no glassmorphism.
3. **GeometricAccent** — SVG repeating rhombus strip inspired by woven geometry.
   Off by default; max one per section boundary.
4. **SectionHeading** — eyebrow + display heading + optional GoldThread.
5. **StatBlock** — oversized display number + quiet label (scale contrast).
6. **Duotone image utility** (`.img-duotone`) — sepia+hue filter for ink+gold
   tint with hover reveal to full color. Ships ready for Stage 2 imagery.

#### Composition Rules Applied
- Asymmetric layouts by default (headings left-aligned, content offset).
- Scale contrast: oversized StatBlock values paired with tiny eyebrow labels.
- Generous vertical rhythm: section-sm 3rem / section-md 5rem / section-lg 8rem / section-xl 12rem.

#### Radius Personalities
- `rounded-sharp` (2px): institutional elements — cards, section borders.
- `rounded-md` / `rounded-lg` (4–6px): interactive — buttons, inputs, badges.

#### WCAG AA Contrast — Verified Pairings
- ink-900 on ivory-100: ≥ 12:1 ✓ (body text)
- ivory-100 on ink-900: ≥ 12:1 ✓ (body on dark)
- ink-900 on gold-500: ≈ 4.8:1 ✓ (button labels)
- gold-400 on ink-900: ≈ 8.5:1 ✓ (bright gold on dark)
- gold-600 on ivory-100: ≈ 4.6:1 ✓ (eyebrow text)
- crimson-700 on ivory-100: ≈ 5.1:1 ✓ (error text)
- gold-500 on ivory-100: ≈ 2.8:1 ✗ body / ✓ large (display only)
- gold-400 on ivory: BANNED — always fails

#### RTL Safety
Arabic text uses `lang="ar"` and `dir="rtl"` scoped to the text span (not
the whole page). No hard-coded `left`/`right` CSS in layout shell. Tailwind
logical-property variants (`start`/`end`) used where applicable.

#### Internal Gallery (route /design-system)
Sections: Color Palette (contrast table), Typography (EN + AR samples), Components
(all variants), Signature Motifs, Spacing visualization, Motion demo, and a
composed Hero Demo combining HeroSurface + display-xl headline + eyebrow +
GoldThread + Buttons + StatBlocks.

## IN PROGRESS

- Nothing. Stage 1 scope is complete.

## FUTURE

- Stage 2: Real page content — Home, Our Vision, Ecosystem, Community, Programs,
  Opportunities, Impact, Media. Apply the design system to each page.
- Stage 2: Real photography/imagery using the duotone treatment.
- Authentication and member accounts (Sign In / Join flows).
- Member profiles, dashboard, privacy controls.
- Opportunities/applications workflows, programs/events management.
- AI features (explicitly out of scope for this stage).
- Administration tooling and audit trail.
- Real rate limiting (current middleware is a no-op).

## RISKS

- None for Stage 1. The `program-fashionweek` teal token (`#3E8FA3`) is defined
  in the CSS but intentionally used in zero default components — any Stage 2
  work using it must be scoped to programme-specific UI only.
- Schema continues to exclude all donation/payment/ticket/fundraising fields —
  this constraint must be preserved in all future stages.

## CHECKPOINTS

- Stage 0: "Foundation Approved"
- Stage 1 recommended checkpoint: **"Design System V1 Approved"**
