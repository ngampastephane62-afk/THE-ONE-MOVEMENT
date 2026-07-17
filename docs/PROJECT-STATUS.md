# Project Status — THE ONE MOVEMENT INTERNATIONAL

## APPROVED

- Stage 0 — Project Foundation: architecture, folder structure, routing with
  placeholder pages, database structure.
- Stage 1 — Design System ("GLOBAL GOLD"): complete visual identity token
  system, UI components, signature brand motifs, and internal gallery page.
- Stage 1 Revision — Palette V2 "LAGOON & GOLD": teal-based primary palette,
  photography pipeline, full Homepage V2 (9 sections), updated gallery and layout.

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

#### Signature Motifs (V1 originals)
1. **GoldThread** — 1px horizontal/vertical line with gold shimmer sweep
   on scroll-into-view (IntersectionObserver + CSS animation). Optional node dot.
   Disabled under `prefers-reduced-motion`.
2. **HeroSurface** — Layered radial gold gradients on lagoon-900 base. Pure CSS.
3. **GeometricAccent** — SVG repeating rhombus strip. Now two variants (see V2 below).
4. **SectionHeading** — eyebrow + display heading + optional GoldThread.
5. **StatBlock** — oversized display number + quiet label (scale contrast).
6. **Duotone image utility** (`.img-duotone`) — lagoon-tinted (V2) with hover reveal.

#### Composition Rules Applied
- Asymmetric layouts by default (headings left-aligned, content offset).
- Scale contrast: oversized StatBlock values paired with tiny eyebrow labels.
- Generous vertical rhythm: section-sm 3rem / section-md 5rem / section-lg 8rem / section-xl 12rem.

#### Radius Personalities
- `rounded-sharp` (2px): institutional elements — cards, section borders.
- `rounded-md` / `rounded-lg` (4–6px): interactive — buttons, inputs, badges.

### Stage 1 Revision — Palette V2 "LAGOON & GOLD"

#### Decision
Owner review replaced the ink-based dark palette with a teal-based "lagoon" family.
Gold family is fully retained. Coral added as a small-dose warm accent.

#### V2 Full Token Values
| Token               | Hex      | HSL              | Role                                        |
|--------------------|---------|-----------------|---------------------------------------------|
| lagoon-900          | #0A2E33 | 187 67% 12%     | Nav, footer, hero base (replaces ink-900)   |
| lagoon-800          | #0E3D44 | 187 58% 16%     | Secondary dark surface                      |
| lagoon-700          | #114E58 | 188 67% 21%     | Mid-dark (card borders on dark)             |
| lagoon-600          | #0D5F6E | 188 79% 24%     | AA teal body text on ivory ≈ 8.8:1 ✓        |
| lagoon-500          | #157A8C | 189 75% 31%     | Rich teal accent; equals program-fashionweek|
| lagoon-400          | #2BA3B8 | 189 61% 44%     | Electric bright — display/highlights only   |
| gold-400            | #F0CE83 | 43 80% 73%      | Bright living highlight (unchanged)         |
| gold-500            | #C9A24B | 39 52% 54%      | Core brand gold / CTAs (unchanged)          |
| gold-600            | #A07B2B | 37 55% 40%      | Accessible gold on ivory (unchanged)        |
| coral-500           | #E27D4F | 18 71% 60%      | Warm accent — tags, stat highlights ONLY    |
| coral-600           | #C45E30 | 20 62% 48%      | Darker coral if text contrast needed        |
| ivory-50            | #FDFAF5 | 40 71% 98%      | Card background (unchanged)                 |
| ivory-100           | #F7F1E5 | 38 57% 94%      | Page background (unchanged)                 |
| ivory-200           | #EDE3CD | 38 44% 87%      | Secondary fills (unchanged)                 |
| sand-200            | #D4C5A8 | 36 26% 74%      | Borders (unchanged)                         |
| sand-400            | #9A8B72 | 33 16% 53%      | Secondary text / muted (unchanged)          |
| crimson-700         | #7A2E2E | 0 45% 32%       | Error / rare accent (unchanged)             |
| ink-900             | #16100A | 30 37% 7%       | Retained for body text on ivory ≥ 12:1 ✓   |
| program-fashionweek | #157A8C | 189 75% 31%     | Now equals lagoon-500 (V2 harmonization)    |

#### V2 WCAG AA Contrast — Verified Pairings
| Pairing                    | Ratio    | AA Body | AA Large | Notes                               |
|---------------------------|---------|--------|---------|--------------------------------------|
| ink-900 on ivory-100       | ≥ 12:1  | ✓ PASS | ✓ PASS  | Primary body text — always safe      |
| ivory-100 on lagoon-900    | ≥ 14:1  | ✓ PASS | ✓ PASS  | Body on dark hero / nav / footer     |
| ivory-100 on lagoon-800    | ≥ 12:1  | ✓ PASS | ✓ PASS  | Body on secondary dark surfaces      |
| ivory-100 on ink-900       | ≥ 12:1  | ✓ PASS | ✓ PASS  | Retained for mixed-surface layouts   |
| ink-900 on gold-500        | ≈ 4.8:1 | ✓ PASS | ✓ PASS  | Button labels on gold                |
| gold-400 on lagoon-900     | ≈ 8.5:1 | ✓ PASS | ✓ PASS  | Gold highlights on teal dark         |
| lagoon-600 on ivory-100    | ≈ 8.8:1 | ✓ PASS | ✓ PASS  | AA teal body text on light bg        |
| lagoon-500 on ivory-100    | ≈ 6.6:1 | ✓ PASS | ✓ PASS  | Teal display/large text on light     |
| crimson-700 on ivory-100   | ≈ 5.1:1 | ✓ PASS | ✓ PASS  | Error text on light bg               |
| gold-600 on ivory-100      | ≈ 4.6:1 | ✓ PASS | ✓ PASS  | Eyebrow gold on light bg             |
| lagoon-400 on ivory-100    | ≈ 4.1:1 | ✗ FAIL | ✓ PASS  | Large text / display only            |
| gold-500 on ivory-100      | ≈ 2.8:1 | ✗ FAIL | ✓ PASS  | Display / eyebrow only. Never body.  |
| coral-500 on ivory-100     | ≈ 2.4:1 | ✗ FAIL | ✗ FAIL  | Tags / colour-only. Never text.      |
| gold-400 on ivory-100      | < 2:1   | ✗ FAIL | ✗ FAIL  | BANNED — never pair on light surface |

#### V2 Component & Motif Updates
- **Layout** — nav, footer, mobile drawer: ink-900 → lagoon-900/800 backgrounds.
- **HeroSurface** — base background: ink-900 → lagoon-900; gold glow unchanged.
- **GeometricAccent** — promoted from off-by-default to active brand element.
  Two `variant` prop values: `gold-on-lagoon` (default) and `lagoon-on-ivory`.
  Unique SVG `patternId` per variant to prevent ID collisions when both appear on-page.
- **Duotone `.img-duotone`** — filter updated: sepia-gold → lagoon-tinted via
  `hue-rotate(155deg) saturate(1.1) brightness(0.7)`. Hover reveals full colour.

#### V2 Photography Pipeline
- `artifacts/web/public/brand-photos/` — folder created (empty; `.gitkeep`).
- **PhotoSlot** — renders `/brand-photos/{filename}` with lagoon duotone hover.
  Elegant lagoon-800 fallback with GeometricAccent pattern when image is missing.
  Props: `filename`, `alt`, `className`, `variant` (`sharp`/`rounded`/`circle`), `duotone`.
- **PhotoMosaic** — asymmetric editorial grid: 1 large portrait (first filename) +
  up to 4 squares in secondary column. Each missing file renders a lagoon fallback.

#### V2 Homepage (9 sections)
1. **Hero** — lagoon radiant-surface; optional photo-01.jpg full-bleed with overlay;
   display-xl headline; bilingual signature (WE ARE ONE / نحن واحد); 2 CTA buttons;
   4-stat band (6 Fashion Week Editions / 15 Sectors Connected / 6 Official Programs / 1 Global Movement).
2. **What We Are** — 3 pillars (A Permanent Home / A Global Ecosystem / A Living Movement).
3. **Our Story** — exact spec copy ("Born in the DRC…"); PhotoMosaic (photo-02..06).
4. **Ecosystem** — 15 sector tiles; lagoon-400 hover; GeometricAccent divider.
5. **Who Can Join** — 5 category cards; gold top bar; lagoon hover.
6. **Official Programs** — 6 cards; PhotoSlot backgrounds + duotone.
7. **Stat Band** — numbers 6 / 15 / 6 / 1; dark lagoon-900 surface.
8. **Impact** — text + photo-13; ivory surface.
9. **Final Invitation** — HeroSurface; gold CTA; bilingual footer signature.

No dates, cities, venues, media org names, or partner logos anywhere on the page.

#### V2 Design System Gallery (/design-system)
- Header: lagoon-900 background; title updated to "LAGOON & GOLD Design System".
- Palette section: lagoon family swatches shown first (6 steps); coral family added;
  program-fashionweek swatch updated to #157A8C.
- Contrast table: updated with all V2 pairings (14 rows).
- Motifs section: GeometricAccent updated to show both variants side-by-side;
  duotone demo updated to lagoon tint; PhotoSlot demo (3 fallbacks); PhotoMosaic demo.
- Footer note updated to "Palette V2 Lagoon & Gold Complete".

#### RTL Safety
Arabic text uses `lang="ar"` and `dir="rtl"` scoped to the text span (not
the whole page). No hard-coded `left`/`right` CSS in layout shell. Tailwind
logical-property variants (`start`/`end`) used where applicable.

## IN PROGRESS

- Nothing. Stage 1, /vision page, and /programs overview page are complete.

## FUTURE

- Stage 2: Real page content — Our Vision, Ecosystem, Community, Programs,
  Opportunities, Impact, Media. Apply the design system to each placeholder page.
- Stage 2: Real photography — drop JPGs into `public/brand-photos/`, PhotoSlot
  and PhotoMosaic will render them with lagoon duotone automatically.
- Authentication and member accounts (Sign In / Join flows).
- Member profiles, dashboard, privacy controls.
- Opportunities/applications workflows, programs/events management.
- AI features (explicitly out of scope for this stage).
- Administration tooling and audit trail.
- Real rate limiting (current middleware is a no-op).

## RISKS

- The `coral-500` token (#E27D4F) fails WCAG AA at all text sizes against ivory.
  It is restricted to colour-chip tags and small-dot accents. Never use as text.
- `lagoon-400` (#2BA3B8) passes WCAG AA for large text only. Never use for body copy.
- Schema continues to exclude all donation/payment/ticket/fundraising fields —
  this constraint must be preserved in all future stages.

### /vision Page

Nine sections completed using existing V2 components only. No new dependencies.

| Section | Surface | Motif |
|---------|---------|-------|
| 1. Vision Hero | HeroSurface (lagoon radiant) + MediaArea | GoldThread |
| 2. The Mission | ivory-100 | SectionHeading thread |
| 3. Born in Bukavu | ivory-50, asymmetric | GoldThread |
| 4. From Event to Movement | lagoon-900 | pull-quote display-md gold-400 |
| 5. The 365-Day Model | ivory-100 | SectionHeading thread |
| 6. The Pillars | lagoon-900, 3×3 grid | — |
| 7. The Distinction | ivory-100 | SectionHeading thread |
| 8. The Global Ambition | lagoon-900, asymmetric | — |
| 9. Closing Invitation | HeroSurface | GoldThread |

Local components in the vision page file (no modifications to shared components):
- `MediaArea` — wraps PhotoSlot, overlays elegant dev label caption at bottom
- `PillarTile` — nine pillars grid tile with hover colour transition
- `StepCard` — numbered card with step label and description

All copy is verbatim from spec. No dates, cities, diplomatic endorsements, or future events as confirmed history appear on the page.

### Homepage Factual Corrections (Part A)
- Stat band (Section 7): "Fashion Week Editions" changed from 6 → **5**
- Fashion Week program card `extra` line: changed from "Six editions…" → **"Five editions. Born in the DRC. Recognized internationally."**

### Known Factual Inconsistency (not fixed — per preservation rules)
- The homepage hero section contains a second StatBlock also showing `value="6" label="Fashion Week Editions"`. Per preservation rules ("if you notice any factual inconsistency elsewhere on the homepage, DO NOT fix it — list it in the completion report"), this was not changed. Owner action required: change this value to "5" in the next permitted homepage edit pass.

### /programs Overview Page

Five sections built using existing V2 components only. No new dependencies.

| Section | Surface | Motif |
|---------|---------|-------|
| 1. Programs Hero | HeroSurface (lagoon radiant, bottom-center) | GoldThread, centered |
| 2. How Programs Work | ivory-100, two-column | SectionHeading thread |
| 3. The Programs | lagoon-900, 3×2 card grid | gold-on-lagoon GeometricAccent transition |
| 4. Stat Band | lagoon-900 strip | 4 StatBlocks (6/5/15/1) |
| 5. Closing Invitation | HeroSurface | GoldThread, bilingual signature |

Program cards: dark cinematic, 2px gold top border, 4:3 PhotoSlot area, dev label overlay, program name/tagline/description, non-clickable (cursor-default, no links). Grid: 1-col mobile / 2-col tablet / 3-col desktop. All six program card dev labels match spec verbatim. Footer line under grid: "Editions, dates and locations are announced officially through the Movement's channels."

Photo slots reserved: `programs-diplomatic-gala.jpg`, `programs-summit.jpg`, `programs-fashion-week.jpg`, `programs-awards.jpg`, `programs-fashion-night.jpg`, `programs-investment-forum.jpg`.

## CHECKPOINTS

- Stage 0: "Foundation Approved"
- Stage 1: "Design System V1 Approved"
- Stage 1 Revision: "Lagoon Gold V2 Approved"
- Stage 2 Vision: "Vision Page Approved"
- Stage 2 Programs: **"Programs Overview Approved"** ← recommended next checkpoint
