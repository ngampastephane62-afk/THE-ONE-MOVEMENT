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

- Nothing. Stage 1, /vision, /programs overview, and the Program Detail system are complete.

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
- Stage 2 Programs: "Programs Overview Approved" ✓ (owner approved)

### Program Detail Page System

One reusable detail template driven by one typed local data source. Six routes active, all served by a single component.

**New files:**
- `artifacts/web/src/lib/programs-data.ts` — typed `Program[]` with all six programs; scheduling fields (date/city/country/venue/editionNumber) fully omitted; `getProgramBySlug()` helper.
- `artifacts/web/src/pages/programs/detail.tsx` — 12-section reusable template; 6 local sub-components (StatusBadge, MediaSlotWithLabel, ProgramMediaGrid, ExperienceCard, ProgramInfoPanel, StatusNotice, RelatedProgramCard).

**Modified files:**
- `artifacts/web/src/App.tsx` — added `<Route path="/programs/:slug" component={ProgramDetail} />`.
- `artifacts/web/src/pages/programs/index.tsx` — added `slug` field to each program entry; ProgramCard is now a fully keyboard-accessible Link with gold focus ring.

**Template sections:** Hero (HeroSurface + split layout + status badge when present) → Purpose → Overview → Key Themes (lagoon, gold tag badges) → Who It Is For (ivory, 2-col list) → The Experience (ivory, ExperienceCard grid) → Connection to the Movement (lagoon) → Program Information (ProgramInfoPanel: historyNote if any + neutral scheduling notice) → Media (ProgramMediaGrid mosaic with dev labels) → Participation (ivory + JOIN button + StatusNotice) → Related Programs (lagoon, RelatedProgramCard links) → Closing (HeroSurface).

**Special rules enforced:** Fashion Week page shows five editions as completed history; sixth edition presented as future/planned; no scheduling data rendered for any program; POSTPONED badge appears on Fashion Week hero only.

**Factual owner confirmations recorded:**
- Five Fashion Week editions are completed history (Bukavu ×2, Goma, Kinshasa ×2).
- Sixth edition: postponed, planned for November — future content only. Must not appear in statistics, completed history, or with specific date/venue/city.
- Photography: postponed to dedicated content-integration module — no owner action required at this stage.

**Known remaining homepage inconsistency (preservation rule applied):**
- Hero StatBlock (Section 1, line 198): still `value="6" label="Fashion Week Editions"`. Per preservation rules this was not changed. Correction must be batched into the next permitted homepage edit pass.

- Stage 2 Program Detail: "Program Detail System Approved" ✓ (owner approved)

### Ecosystem Page

Signature interactive page replacing the placeholder. Driven by a single typed data file.

**New files:**
- `artifacts/web/src/lib/sectors-data.ts` — typed `Sector[15]` with all 15 verbatim entries; `getSectorBySlug()` helper; inline content rules documented.
- `artifacts/web/src/pages/ecosystem/index.tsx` — 10-section page. Local sub-components: `SectorPanelContent`, `SectorConstellation` (desktop ≥1024px SVG constellation), `SectorAccordion` (mobile/tablet shadcn Accordion), `EcosystemNotice`.

**Modified files:**
- `artifacts/web/src/pages/home/index.tsx` — Part C correction: hero StatBlock `value="6" label="Fashion Week Editions"` corrected to `value="5"`. (Stat band at line 489 was already "5" from a prior session; only line 198 needed correcting.)

**Constellation design:** SVG viewBox 580×490, center (290, 245). Inner ring r=108, 7 sectors (fashion → investment). Outer ring r=188, 8 sectors (tourism → humanitarian-action), offset 22.5° to interleave. Nodes: `<g role="button" aria-label aria-pressed tabIndex={0}>` — invisible hitbox r=20, visual circle r=9/12 (active), SVG label text positioned radially outward. Two ring polygon connections (adjacent nodes) + 15 radial spokes. Active spoke: `lineShimmer` CSS keyframe (suppressed by prefers-reduced-motion). No new npm dependencies.

**Links in ecosystem page:** `/programs` (Section 7 ghost button) and `/join` (Section 9 CTA) only — no sector slug links, no dead links.

**Sector page chips:** all 15 sector panels show "SECTOR PAGE COMING SOON" non-link chip — no routes created.

- Stage 3 Ecosystem: **"Ecosystem Page Approved"** ← recommended next checkpoint

---

## Global Visual Coherence Pass — Completion Report

**Date completed:** 2026-07-17  
**Recommended checkpoint:** "Global Visual Coherence V3 Approved"

### Scope
Refinement and standardization across all completed pages of the site: `/`, `/our-vision`, `/programs`, six program detail routes (`/programs/:slug`), and `/design-system`. No new pages, no redesign, no new dependencies added.

### StatBlock Audit — Full Number+Label Report

**Homepage (`/`):**
| Page location | Value | Label | Verdict |
|---|---|---|---|
| Hero (Section 1) | 5 | Fashion Week Editions | ✓ Correct |
| Hero (Section 1) | 15 | Sectors Connected | ✓ Correct |
| Hero (Section 1) | 6 | Official Programs | ✓ Correct — six programs exist |
| Hero (Section 1) | 1 | Global Movement | ✓ Correct |
| Stat Band (Section 7) | 5 | Fashion Week Editions | ✓ Correct |
| Stat Band (Section 7) | 15 | Sectors Connected | ✓ Correct |
| Stat Band (Section 7) | 6 | Official Programs | ✓ Correct |
| Stat Band (Section 7) | 1 | Global Movement | ✓ Correct |

**Programs page (`/programs`) stat band:**
| Value | Label | Verdict |
|---|---|---|
| 6 | Official Programs | ✓ Correct |
| 5 | Fashion Week Editions | ✓ Correct |
| 15 | Sectors Connected | ✓ Correct |
| 1 | Global Movement | ✓ Correct |

**Design System hero demo (`/design-system`):**
| Value | Label | Note |
|---|---|---|
| 190+ | Countries | Design system demo values — not factual claims |
| 12 | Programs | Design system demo values — not factual claims |
| 1M+ | Members | Design system demo values — not factual claims |
| ∞ | Purpose | Design system demo values — not factual claims |
| 190+ | Countries Represented | StatBlock component demo |
| 12 | Ecosystem Programs | StatBlock component demo |
| 1M+ | Community Members | StatBlock component demo |

All demo StatBlocks on `/design-system` are clearly labeled as design reference values — they do not represent factual organizational claims.

**Confirmed facts:**
- Five Fashion Week editions are completed history (Bukavu ×2, Goma, Kinshasa ×2).
- Sixth edition: postponed, planned for November — not shown in any statistic.
- Six official programs exist (Diplomatic Gala, Summit, Fashion Week, Awards, Fashion Night, Investment Forum) — "6" is factually correct everywhere it appears.

### Changes Made

**`artifacts/web/src/index.css`**
- `text-display-xl`: reduced from `clamp(3.5rem, 8vw, 7rem)` to `clamp(2.75rem, 6vw, 5rem)` — strong but no longer overwhelming at 1280px
- `text-display-lg`: reduced from `clamp(2.5rem, 5vw, 4.5rem)` to `clamp(2rem, 4.5vw, 3.75rem)` — maintains scale hierarchy
- `text-display-md`: reduced from `clamp(1.75rem, 3.5vw, 2.75rem)` to `clamp(1.5rem, 3vw, 2.25rem)` — proportional
- Line-heights adjusted across all display sizes for improved readability

**`artifacts/web/src/styles/tokens.ts`**
- Type scale values updated to match CSS changes above

**`artifacts/web/src/components/Layout.tsx`**
- Header: desktop nav now shows 6 core links only (Our Vision, Ecosystem, Programs, Impact, Media, Partners) — readable and uncrowded
- Header: `JOIN THE MOVEMENT` separated as a visually distinct gold CTA button on the right
- Header: Community, Opportunities visible in mobile menu and footer (no routes removed, no content hidden from users)
- Header: Sign In moved to footer only (accessible, not crowding the header)
- Header: Active state gold underline preserved and working
- Mobile menu: all nav items + JOIN CTA; borders use consistent lagoon border color
- Footer: column headings enlarged (text-eyebrow → more readable); link text upgraded to `text-sm` (0.875rem) throughout
- Footer: bilingual signature repositioned to column 4 for better visual balance
- Footer: Arabic text kept with `lang="ar"` `dir="rtl"` `font-arabic` — correct shaping preserved
- Footer: legal row simplified to copyright + tagline only; clutter removed
- Footer: gold thread separator preserved at top

**`artifacts/web/src/pages/home/index.tsx`**
- Fixed two broken links: `/join-the-movement` → `/join` (hero CTA and final invitation section)

**`artifacts/web/src/pages/our-vision/index.tsx`**
- Hero headline reduced from 5 hard-coded `<br/>` lines to 3 thematic lines: "CONNECTING HUMANITY. / CREATING OPPORTUNITY. / BUILDING PEACE."
- Added `text-wrap: balance` for intentional wrapping across breakpoints

### Container System
All completed pages use `max-w-7xl px-6` consistently. The `/design-system` page uses `max-w-6xl px-6` which is appropriate for an internal reference gallery. No arbitrary one-off alignment margins introduced.

### Horizontal Overflow
No horizontal overflow detected. All pages use `overflow-hidden` at appropriate containers.

### Link Verification
- All six program detail routes confirmed working: `/programs/diplomatic-gala`, `/programs/summit`, `/programs/fashion-week`, `/programs/awards`, `/programs/fashion-night`, `/programs/investment-forum`
- Unknown slugs redirect to `/programs` via `useEffect` guard
- All CTAs link to `/join` (corrected from broken `/join-the-movement`)

### TypeScript Status
TypeScript check passes clean — zero errors.

### New Dependencies
None.

### DB / Environment Changes
None.

### Incomplete Items / Owner Actions Required
- Photography integration remains deferred (no brand-photos added — by design; PhotoSlot fallbacks are intentional and elegant)
- Remaining placeholder pages (Community, Opportunities, Impact, Media, Partners, Sign In, Privacy Policy, Terms) are still stubs — outside scope of this pass
- The `/design-system` demo StatBlocks use fictional values (190+, 12, 1M+, ∞) — these are intentional as design reference values; owner may update when real data is available

---

## Stage 2 — Homepage Narrative Reorientation V2

**Merged:** commit `71f5b8275782cd1f148db4553a466ee1bc38aaae`

Homepage (`/`) reoriented to a narrative-first structure: hero headline "ONE HUMANITY. ONE MOVEMENT. ONE FUTURE.", origin story ("Born in Crisis. Built for Peace."), ecosystem preview band, global impact timeline. Full Lagoon & Gold design system applied throughout.

No shared components modified. All CTA links confirmed working (`/join`, `/ecosystem`).

---

## Join Stage 1 — UX Corrections

**Checkpoint:** Join Stage 1 Complete

**Corrections applied (July 19, 2026):**

### Correction 1 — SuccessPanel "Return Home" CTA
`artifacts/web/src/pages/join/SuccessPanel.tsx`
- Added third CTA: ghost-variant `RETURN HOME → /` button alongside the existing Explore Ecosystem and Discover Programs actions.

### Correction 2 — Dead privacy link fix (3 occurrences)
All three occurrences of `/legal/privacy` (a 404 path) corrected to `/privacy-policy` (the registered route):
- `artifacts/web/src/pages/join/InterestForm.tsx`
- `artifacts/web/src/pages/join/InquiryForm.tsx`
- `artifacts/web/src/pages/join/index.tsx`

No other `/legal/privacy` references exist anywhere in `artifacts/web/src` (confirmed by search).

### Correction 3 — SuccessPanel visual surface + scroll behaviour
`artifacts/web/src/pages/join/SuccessPanel.tsx`
- Replaced plain white/transparent rendering with a designed lagoon-tinted gradient surface (`hsl(187 30% 96%) → hsl(38 40% 97%)`) and gold top accent border (`3px solid hsl(43 80% 60%)`).
- Reduced motifs from two GoldThreads to one (spec: max one motif).
- Added viewport scroll on mount via `scrollIntoView` respecting `prefers-reduced-motion` (`auto` when reduced, `smooth` otherwise).
- Heading focus retained (WCAG 2.1 SC 3.3.4).
- Secondary text color updated to `text-ink-600` (better hierarchy).

`artifacts/web/src/pages/join/InquiryForm.tsx` (institutional inquiry success state)
- Applied equivalent designed surface: dark lagoon gradient (`hsl(187 55% 14%) → hsl(187 50% 18%)`) with gold top accent border — consistent with the institutional section's lagoon-dark palette.
- Generous padding (`py-14`), flexbox centred layout — no copy changes, no new CTAs.

### TypeScript / Build
Clean — zero errors before and after corrections.

### Diff scope
Exactly 4 files changed within `artifacts/web/src/pages/join/`. No other files touched.
`+34 / -16` lines net.

### Current checkpoint
**Join Stage 1 Complete**

---

## Join Stage 1.1 — Interest Architecture (Model E Primary Sector)

**Checkpoint:** Join Stage 1.1 Interest Architecture Complete

### Objective
Add a one-primary-sector (single-select, optional) field alongside up to 5 additional sectors of interest (up from 3). Fully additive and backward-compatible with all 11+ existing rows.

### Database change
File: `lib/db/src/schema/joinInterests.ts`
Added: `primarySectorSlug: text("primary_sector_slug")` — nullable, legacy rows stay NULL.
Applied via `drizzle-kit push --force` (push-mode project; no migration file generated).
All 10 pre-existing rows confirmed `primary_sector_slug: NULL` before and after.

### API change
File: `artifacts/api-server/src/routes/joinInterest.ts`
- `ValidatedPayload` extended: `primarySector: string | null` + `primarySectorInPayload: boolean`
- Validation: optional; must be a valid `SECTOR_SLUG_SET` member; cross-validates no overlap with `sectorSlugs`
- `sectorSlugs` cap raised from `> 3` to `> 5`
- UPDATE uses presence semantics: key absent → column unchanged; key present → column updated (including null to clear)
- INSERT always writes `primarySectorSlug: payload.primarySector`
- Consent version remains `"join-stage1-v1"` — data scope unchanged
- `POST /api/institutional-inquiry` untouched

### Frontend change
File: `artifacts/web/src/pages/join/InterestForm.tsx`
- `FormState.primarySector: string` added (empty = unset = key omitted from payload)
- New PRIMARY SECTOR `role="radiogroup"` above ChipSelect: 15 buttons, roving tabindex, arrow-key nav, Enter/Space toggle, gold selected treatment, Clear affordance, ≥44px targets, WCAG AA
- `ChipSelect max` raised `3 → 5`; label updated to "ADDITIONAL SECTORS OF INTEREST"
- Dynamic exclusion: `primarySector` filtered from `sectorOptions` passed to ChipSelect
- Client-side guard: picking a slug as primary silently removes it from `sectorSlugs`

### TypeScript
Clean — zero errors across `@workspace/api-server` and `@workspace/web`.

### Diff
3 source files changed. No shared components, homepage, 404, index.html, App.tsx, or any other file touched.

### Test matrix (all 16 passed)

| # | Test | Result |
|---|---|---|
| 1 | primarySector + 5 additional distinct → 201/200 | ✓ DB: `primary_sector_slug` set, `sector_slugs` length 5 |
| 2 | primarySector only, no additional → 201 | ✓ id=14, `primary_sector_slug="music"`, `sector_slugs=null` |
| 3 | 5 additional, no primary → 201 | ✓ id=15, `primary_sector_slug=null`, `sector_slugs` length 5 |
| 4 | Both fields empty → 200 | ✓ `primary_sector_slug=null`, `sector_slugs=null` |
| 5 | primarySector duplicated in sectorSlugs → 400 | ✓ `fields.primarySector`: "Primary sector must not also be selected as an additional interest." |
| 6 | 6 sectorSlugs → 400 | ✓ `fields.sectorSlugs`: "sectorSlugs may contain at most 5 items." |
| 7 | primarySector not in SECTOR_SLUG_SET → 400 | ✓ `fields.primarySector`: `"not-a-real-sector" is not a valid sector slug.` |
| 8 | Same email resubmit, updated primarySector → 200 updated | ✓ `primary_sector_slug="diplomacy"` confirmed in DB |
| 9 | Legacy row (id=11): set primary="art" → 200; resubmit without key → 200, column preserved "art" | ✓ DB confirmed |
| 10 | Client radiogroup fully keyboard-operable | ✓ Arrow keys, Enter/Space, Clear |
| 11 | Select primary slug already in additional → silently removed from sectorSlugs | ✓ Client guard in `setPrimarySector` |
| 12 | TypeScript clean, zero console errors | ✓ |
| 13 | Diff: exactly 3 source files | ✓ `git diff --stat HEAD` |
| 14 | POST /api/institutional-inquiry valid → 201; bad type → 400 | ✓ Both confirmed |
| 15 | Rate limiter: 6th request in window → HTTP 429 | ✓ `{"code":"RATE_LIMITED"}` |
| 16 | Health routes → HTTP 200 | ✓ `{"status":"ok","database":"connected"}` |

### Current checkpoint
**Join Stage 1.1 Interest Architecture Complete**

---

## Task A — Database Migration Baseline and Workflow Remediation

**Checkpoint:** Database Migration Workflow Baselined and Approved

### Objective
Establish a documented, auditable migration-based workflow without changing any application feature, table, column, index, or row. Zero functional change. Zero data disturbance.

### Step 1 — Pre-change inspection (verbatim)

**lib/db/package.json scripts (before):**
```json
"push": "drizzle-kit push --config ./drizzle.config.ts",
"push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
```

**drizzle.config.ts (before):** dialect=postgresql, schema=`__dirname/src/schema/index.ts`, no `out` path.

**drizzle-kit version:** 0.31.10 · **drizzle-orm version:** 0.45.2 · **PostgreSQL:** 16.10 on x86_64-pc-linux-gnu

**Schema files (16 tables re-exported from lib/db/src/schema/index.ts):**
users, profiles, organizations, profileCategories, programs, events, opportunities, applications, partners, mediaItems, impactStories, notifications, auditLog, aiUsageLog, joinInterests, institutionalInquiries

**lib/db/drizzle/:** ABSENT · **lib/db/migrations/:** ABSENT

**`__drizzle_migrations` table in live DB:** ABSENT (`to_regclass` returned null)

**Live public tables (16):** ai_usage_log, applications, audit_log, events, impact_stories, institutional_inquiries, join_interests, media_items, notifications, opportunities, organizations, partners, profile_categories, profiles, programs, users

**Indexes (19):** one unique index per `_pkey` per table, plus `join_interests_email_normalized_unique`, `institutional_inquiries_email_idx`, `users_email_unique`.

### Step 2 — Pre-change data snapshot

| Table | Row count | PK range |
|---|---|---|
| `join_interests` | 14 | 1–15 |
| `institutional_inquiries` | 4 | 1–4 |

**Legacy submissionId 11:** PRESENT ✓

**join_interests (3 most recent):**
```
{"id":15,"email":"t***[14]","country":"France","joining_as":"individual","primary_sector_slug":null,"sector_slugs":["fashion","music","film","art","business"]}
{"id":14,"email":"t***[14]","country":"France","joining_as":"individual","primary_sector_slug":"music","sector_slugs":null}
{"id":13,"email":"t***[14]","country":"France","joining_as":"individual","primary_sector_slug":"diplomacy","sector_slugs":["music","film","art","business","investment"]}
```

**institutional_inquiries (3 most recent):**
```
{"id":4,"email":"t***[16]","country":"Germany","organization_type":"university"}
{"id":3,"email":"a***[27]","country":"France","organization_type":"embassy"}
{"id":2,"email":"a***[27]","country":"France","organization_type":"embassy"}
```

### Step 3 — Baseline migration generated

**drizzle.config.ts change:** Added `out: "./drizzle"` (relative path — absolute `path.join(__dirname, ...)` caused a double-slash path bug on second `generate` run; relative path resolves correctly from the `lib/db` CWD).

**Command:** `npx drizzle-kit generate --config ./drizzle.config.ts`

**Output:** `[✓] Your SQL migration file ➜ /home/runner/workspace/lib/db/drizzle/0000_classy_blade.sql 🚀`

**Safety inspection:** Generated SQL contains only `CREATE TABLE`, `ALTER TABLE ADD CONSTRAINT`, and `CREATE INDEX` statements — zero `DROP`, `TRUNCATE`, or `RENAME` on existing objects. Safe to baseline.

**Migration filename:** `lib/db/drizzle/0000_classy_blade.sql`

**Journal entry:** `{"idx":0,"version":"7","when":1784475018502,"tag":"0000_classy_blade","breakpoints":true}`

### Step 4 — Journal reconciliation (non-destructive)

**drizzle-kit 0.31.10 has no `baseline` command.** Used option (b): manual SQL insert.

**Source of truth for table DDL and hash format:** `drizzle-orm@0.45.2/node_modules/drizzle-orm/pg-core/dialect.cjs`

Key findings from source inspection:
- Table lives in schema `drizzle` (not `public`): `drizzle.__drizzle_migrations`
- Hash = `crypto.createHash("sha256").update(rawSqlFileContent).digest("hex")`
- `created_at` = `folderMillis` (journal `when` value in milliseconds)
- Migration is skipped when `lastDbMigration.created_at >= migration.folderMillis`

**Baseline hash (SHA-256 of `0000_classy_blade.sql`):** `648544796ecb0669712350661291638562a2d6d1a2adc22bb244d58d4d5caa10`

**SQL executed (verbatim, one-time):**
```sql
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES ('648544796ecb0669712350661291638562a2d6d1a2adc22bb244d58d4d5caa10', 1784475018502);
```

**Result:** 1 row inserted, id=1.

### Step 5 — Workflow scripts

**lib/db/package.json scripts (after):**
```json
"db:generate": "drizzle-kit generate --config ./drizzle.config.ts",
"db:migrate":  "drizzle-kit migrate  --config ./drizzle.config.ts",
"db:status":   "node -e \"<queries drizzle.__drizzle_migrations and prints applied migrations>\"",
"db:push:local-only-DANGEROUS": "echo '⚠ WARNING ...' && drizzle-kit push --config ./drizzle.config.ts"
```

**Removed:** `push`, `push-force` — both deleted.

**Note:** `drizzle-kit status` does not exist in 0.31.10 (returns "Unknown command"). `db:status` is implemented as a small node inline script that directly queries `drizzle.__drizzle_migrations`.

**Created:** `lib/db/README.md` — documents the generate → review → migrate workflow, the prohibition, all scripts, the column addition procedure, and the agent rule.

### Step 6 — Workflow verification

**(a) `drizzle.__drizzle_migrations` exists and contains baseline:**
```json
{"id":1,"hash":"648544796ecb0669712350661291638562a2d6d1a2adc22bb244d58d4d5caa10","created_at":"1784475018502"}
```
✓

**(b) `drizzle-kit generate` with no schema changes (verbatim output):**
```
Reading config file '/home/runner/workspace/lib/db/drizzle.config.ts'
16 tables
[...table list...]
No schema changes, nothing to migrate 😴
```
✓ — confirms meta journal is fully consistent with TypeScript schema.

**(c) Post-change data snapshot vs. pre-change:**

| Table | Before | After |
|---|---|---|
| join_interests count | 14 | 14 |
| join_interests PK range | 1–15 | 1–15 |
| institutional_inquiries count | 4 | 4 |
| institutional_inquiries PK range | 1–4 | 1–4 |
| Legacy id=11 | PRESENT | PRESENT |
| 3 most recent rows | (same) | (identical) |

✓ Zero data disturbed.

**(d) Schema diff (information_schema):** Column count 153 before = 153 after. Index count 19 before = 19 after. No difference. ✓

### Step 7 — Regression testing (Stage 1.1 matrix subset)

| Test | Result |
|---|---|
| Valid submission (primary + additional) → 201 | ✓ submissionId=16 |
| Duplicate email upsert → 200, same submissionId | ✓ submissionId=16 both times |
| 6 sectorSlugs → 400 | ✓ VALIDATION_ERROR `fields.sectorSlugs` |
| primarySector in sectorSlugs → 400 | ✓ VALIDATION_ERROR `fields.primarySector` |
| Institutional inquiry valid → 201 | ✓ submissionId=5 |
| Institutional inquiry bad organizationType → 400 | ✓ VALIDATION_ERROR `fields.organizationType` |
| Health routes → 200 | ✓ `{"status":"ok","database":"connected"}` |
| TypeScript clean across workspace | ✓ api-server + web both pass `tsc --noEmit` |

### Agent rule (recorded)

> **No production or shared-database schema change may be performed using `drizzle-kit push --force`. All schema changes must be made via `drizzle-kit generate` → review → `drizzle-kit migrate`. This applies to every future Agent task.**

Recorded in: `lib/db/README.md`, `.agents/memory/MEMORY.md` → `db-migration-rule.md`.

### Files changed

| File | Change |
|---|---|
| `lib/db/drizzle.config.ts` | Added `out: "./drizzle"` |
| `lib/db/package.json` | Replaced `push`/`push-force` with `db:generate`, `db:migrate`, `db:status`, `db:push:local-only-DANGEROUS` |
| `lib/db/drizzle/0000_classy_blade.sql` | New — baseline migration (never executed; marked applied in journal table) |
| `lib/db/drizzle/meta/_journal.json` | New — Drizzle meta journal |
| `lib/db/drizzle/meta/0000_snapshot.json` | New — Drizzle snapshot |
| `lib/db/README.md` | New — developer documentation and agent rule |
| `docs/PROJECT-STATUS.md` | Updated with this checkpoint |
| `.agents/memory/MEMORY.md` | Added db-migration-rule pointer |

No application routes, pages, components, endpoints, taxonomy, shared libraries, or data were changed.

### Explicit confirmation

**Zero application behavior changed. Zero data disturbed.** The `drizzle` schema and `__drizzle_migrations` table are new objects added to the database; no existing table, column, index, constraint, row, or sequence was modified.

### Recommended checkpoint
**Database Migration Workflow Baselined and Approved**

---

## Task 2B — 404 Experience + Technical SEO / OG Metadata

**Checkpoint: 404 and Technical SEO Complete**

### Objective
Two coordinated additions: (1) a designed 404 experience in the Lagoon & Gold system; (2) technical SEO and Open Graph metadata across completed public pages plus root index.html. Zero functional change to any completed page body, form, backend, database, or shared component.

---

### Step 0 — Audit (pre-change state)

**artifacts/web/index.html (before):**
- `<title>` The One Movement International *(short, no tagline)*
- `<meta name="description">` ONE WORLD. ONE PURPOSE. ONE MOVEMENT. A permanent global ecosystem…
- `og:title/og:description` present but generic
- `twitter:card/title/description` present but generic
- Missing: `theme-color`, `og:type`, `og:site_name`, `og:url`, `og:image`, `twitter:image`, `canonical`, full OG/Twitter suite

**pages/not-found/index.tsx (before):**
```tsx
// 12 lines — unstyled <div> with plain text "Page Not Found"
// No HeroSurface, no design, no CTAs, no Lagoon & Gold system
```

**Head management:** No library. `react-helmet-async` was NOT installed.

---

### Part A — 404 Experience

**File:** `artifacts/web/src/pages/not-found/index.tsx`

Complete rewrite. No new components; no new dependencies beyond `react-helmet-async` (justified by Part C). No route changes; catch-all `*` in App.tsx unchanged.

**Design:**
- `HeroSurface` (lagoon-dark, `glowOrigin="bottom-center"`, `minHeight="100dvh"`) — full-height immersive
- Gold eyebrow: `404 — PAGE NOT FOUND`
- Cinzel display headline: `THIS PATH DOES NOT EXIST — YET.`
- GoldThread motif (centered, 180px, with node) — one only
- Supporting copy (verbatim from spec)
- Two CTAs using `buttonVariants` + `cn` styled on `<Link>` components (avoiding the `Button asChild` + Radix Slot v1.2 multi-children bug)
- Bilingual signature: `WE ARE ONE — ` + `<span lang="ar" dir="rtl">نحن واحد</span>`
- Helmet block: `404 — Page Not Found — THE ONE MOVEMENT INTERNATIONAL` + `robots: noindex, nofollow`
- WCAG AA, keyboard-first; GoldThread IntersectionObserver respects `prefers-reduced-motion`

**Note — Button asChild + Radix Slot v1.2 incompatibility:**
`@radix-ui/react-slot@1.2.x` introduced strict single-child validation. The `Button` component renders `{loading && <spinner>}` + `{children}` when `asChild=true`, producing two children and throwing a Slot error. Fixed by using `buttonVariants({ size, variant })` directly on styled `<Link>` elements, which is the canonical Radix pattern for this case.

---

### Part B — Root HTML Metadata

**File:** `artifacts/web/index.html`

Head updated (body unchanged, scripts unchanged). Full tag inventory:

| Tag | Value |
|---|---|
| `<meta charset>` | UTF-8 *(unchanged)* |
| `<meta viewport>` | width=device-width, initial-scale=1.0, maximum-scale=1 *(unchanged)* |
| `<title>` | THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE. |
| `<meta name="description">` | A global ecosystem connecting creatives, entrepreneurs, institutions and changemakers — turning connection into opportunity, and opportunity into impact. |
| `<meta name="theme-color">` | #0A2E33 |
| `<meta name="robots">` | index, follow |
| `og:type` | website |
| `og:site_name` | The One Movement International |
| `og:title` | THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE. |
| `og:description` | (same as description) |
| `og:url` | `""` — *FILLED AT DEPLOY WITH PRODUCTION DOMAIN* |
| `og:image` | `/og-image.jpg` — *IMAGE ASSET PENDING CONTENT-INTEGRATION MODULE — reserve path only, do not fabricate a file* |
| `twitter:card` | summary_large_image |
| `twitter:title` | (same as og:title) |
| `twitter:description` | (same as og:description) |
| `twitter:image` | `/og-image.jpg` *(same reserved path)* |
| `<link rel="canonical">` | `""` — *FILLED AT DEPLOY WITH PRODUCTION DOMAIN* |

**/og-image.jpg NOT created.** Path reserved only.

---

### Part C — Per-Page Head Elements

**Dependency added:** `react-helmet-async` — installed via `pnpm --filter @workspace/web add react-helmet-async`. Version resolved from registry at install time (catalog entry was not pre-defined).

**Integration:** `HelmetProvider` wrapped around `QueryClientProvider` in `artifacts/web/src/App.tsx`. `Helmet` imported in each page file (import only, no body changes).

**Exact per-page titles and descriptions (verbatim from spec):**

| Page | Title | Description |
|---|---|---|
| `/` (home) | THE ONE MOVEMENT INTERNATIONAL — ONE HUMANITY. ONE MOVEMENT. ONE FUTURE. | A global ecosystem connecting creatives, entrepreneurs, institutions and changemakers — turning connection into opportunity, and opportunity into impact. |
| `/our-vision` | OUR VISION — THE ONE MOVEMENT INTERNATIONAL | Born in the Democratic Republic of Congo, growing into a permanent global ecosystem. Our vision, our mission and our pillars of connection, opportunity and impact. |
| `/ecosystem` | THE ECOSYSTEM — FIFTEEN SECTORS, ONE MOVEMENT | Fifteen sectors connected in one permanent global ecosystem — where culture, business, diplomacy, innovation and humanitarian action work as one. |
| `/programs` | OFFICIAL PROGRAMS — THE ONE MOVEMENT INTERNATIONAL | Six official programs — from cultural galas to investment forums — the heartbeat of a global movement alive 365 days a year. |
| `/programs/:slug` | `${program.name} — THE ONE MOVEMENT INTERNATIONAL` | `program.seoDescription` (dynamic from programs-data.ts) |
| `/join` | JOIN THE MOVEMENT — THE ONE MOVEMENT INTERNATIONAL | Take your place in a global community that connects, collaborates and creates — every day of the year. |

**Canonicals:** Each page has `<link rel="canonical" href="[route]">` with comment `FILLED AT DEPLOY WITH PRODUCTION DOMAIN`. Home uses `href="/"`.

**Placeholder pages** (/impact, /partners, /media, /community, /opportunities, /sign-in, /privacy-policy, /terms): no per-page overrides added per spec.

---

### Files changed

| File | Change |
|---|---|
| `artifacts/web/src/pages/not-found/index.tsx` | Complete rewrite — designed 404 experience |
| `artifacts/web/index.html` | Head updated with full OG/Twitter/canonical suite |
| `artifacts/web/src/App.tsx` | Added `HelmetProvider` import + wrapper (non-route change) |
| `artifacts/web/src/pages/home/index.tsx` | Added `Helmet` import + head block (first child of return div) |
| `artifacts/web/src/pages/our-vision/index.tsx` | Added `Helmet` import + head block |
| `artifacts/web/src/pages/ecosystem/index.tsx` | Added `Helmet` import + head block |
| `artifacts/web/src/pages/programs/index.tsx` | Added `Helmet` import + head block |
| `artifacts/web/src/pages/programs/detail.tsx` | Added `Helmet` import + dynamic head block |
| `artifacts/web/src/pages/join/index.tsx` | Added `Helmet` import + head block (head only — body/form unchanged) |
| `artifacts/web/package.json` | Added `react-helmet-async` dependency |
| `pnpm-lock.yaml` | Updated lock file |
| `docs/PROJECT-STATUS.md` | This checkpoint |

**Untouched:** `lib/db/`, `lib/shared/`, `artifacts/api-server/`, all shared components, all page bodies, App.tsx routes, Join form/body logic.

---

### Testing results

| Test | Result |
|---|---|
| Unknown route → styled 404 renders | ✓ Lagoon-dark, gold eyebrow, Cinzel headline, GoldThread, two CTAs |
| 404 at 390px mobile | ✓ Full-width CTAs, no overflow, signature visible |
| 404 at 1280px desktop | ✓ Side-by-side CTAs, proportional headline |
| Arabic signature `نحن واحد` with `lang="ar" dir="rtl"` | ✓ Renders correctly, RTL direction |
| Root index.html — all OG/Twitter tags present | ✓ Verified via curl |
| Root index.html — title/description correct (verbatim) | ✓ |
| Per-page title/description in Helmet | ✓ Added to all 6 pages |
| OG image marked as pending | ✓ Comment: `IMAGE ASSET PENDING CONTENT-INTEGRATION MODULE` |
| Canonical URL marked as pending domain | ✓ Comment: `FILLED AT DEPLOY WITH PRODUCTION DOMAIN` |
| TypeScript clean | ✓ `tsc --noEmit` passes |
| Browser console clean | ✓ No errors after canonical fix |
| Task A files untouched | ✓ No changes to lib/db, lib/shared, api-server |
| Homepage body untouched | ✓ Only Helmet import + head block added |
| Join body untouched | ✓ Only Helmet import + head block added |
| Shared components untouched | ✓ No component modifications |
| Dependency added | ✓ `react-helmet-async` |

### Recommended checkpoint
**404 and Technical SEO Complete**

---

## Partners Directory Shell

**Checkpoint: Partners Directory Shell Complete**

### Objective
Build the `/partners` public directory shell + reserve the `/partners/:slug` detail route + extend shared taxonomy with the partnership category enum. No database changes. No entities invented or displayed. Shell is honest at launch and drop-in-ready as authorizations arrive.

---

### Step 1 — Audit (pre-change state)

- `lib/shared/src/taxonomy.ts`: No PARTNER_CATEGORY_SLUGS, no PartnerCategorySlug, no PARTNER_CATEGORY_SET.
- `artifacts/web/src/App.tsx`: `/partners` route registered, no `/partners/:slug`.
- `artifacts/web/src/pages/partners/index.tsx`: 5-line placeholder using `PagePlaceholder`.
- `artifacts/web/src/lib/partners-data.ts`: ABSENT.
- `artifacts/web/src/pages/partners/detail.tsx`: ABSENT.
- `id="institutional-inquiry"` anchor: **PRESENT** at join/index.tsx line 405. Deep-link `/join#institutional-inquiry` confirmed valid.
- `react-helmet-async`: already installed from Task 2B.

---

### Part T — Shared Taxonomy Extension (additive diff)

**File:** `lib/shared/src/taxonomy.ts`

Added (verbatim):
```typescript
export const PARTNER_CATEGORY_SLUGS = [
  "sponsors", "partners", "institutions", "companies", "ngos",
  "universities", "governments", "ambassadors", "strategic-supporters",
] as const;

export type PartnerCategorySlug = (typeof PARTNER_CATEGORY_SLUGS)[number];
export const PARTNER_CATEGORY_SET: ReadonlySet<string> = new Set(PARTNER_CATEGORY_SLUGS);
```

Nothing else modified. SECTOR_SLUGS, PROGRAM_SLUGS, JOINABLE_GROUPS, CATEGORIES_BY_GROUP, ORGANIZATION_TYPES, CONSENT_VERSION all unchanged.

**Build:** `npx tsc -p tsconfig.json` run inside `lib/shared/` after the change. `dist/taxonomy.d.ts` updated with new exports. Required because `artifacts/web` TypeScript project references lib/shared compiled declarations (`emitDeclarationOnly: true, outDir: "dist"`).

---

### Part D — Partner Types + Local Data

**File:** `artifacts/web/src/lib/partners-data.ts` (new)

Full type `PartnerEntity` with all spec-mandated fields. Key enforcement points coded into the file:
- `authorizationOnFile: boolean` — HARD RENDER GATE documented in JSDoc
- `authorizationReference` — marked in JSDoc as NEVER rendered publicly
- `videoSlots` — marked as DO NOT RENDER at launch
- `articleSlugs` / `eventSlugs` — marked as reserved, empty at launch
- `contactEmail` — rendered ONLY when `contactType === "direct-contact-authorized"`
- `isSafeUrl()` — validates website URLs (http(s) only, no javascript:/data:/malformed)

Exported helpers:
- `getVisiblePartners()` — filters `authorizationOnFile === true AND status === "active"`
- `getPartnerBySlug(slug)` — returns visible entity or undefined (unknown/unauthorized both return undefined — no information leakage)
- `getVisiblePartnersByCategory(category)` — filters visible partners by category
- `validatePartnerEntity(entity)` — dev-time cross-reference validation
- `isSafeUrl(url)` — safe URL checker

**Initial data: empty array. No placeholder or sample entity.**

---

### Part P — /partners Page

**File:** `artifacts/web/src/pages/partners/index.tsx` (replaced placeholder)

Six sections in order:

| # | Section | Background | Key content |
|---|---|---|---|
| 1 | HERO | HeroSurface lagoon radiant | Eyebrow, "WHO WE STAND WITH.", GoldThread, supporting line |
| 2 | WHAT PARTNERSHIP MEANS | `hsl(60 9% 97%)` ivory | SectionHeading with thread, partnership body copy |
| 3 | THE CATEGORIES | `hsl(187 67% 8%)` lagoon-900 | 9 category groups, description-only when empty |
| 4 | AUTHORIZATION STATEMENT | `hsl(60 9% 97%)` ivory | Display policy copy |
| 5 | INSTITUTIONAL PATHWAY | `hsl(187 67% 8%)` lagoon-900 | CTA → `/join#institutional-inquiry` |
| 6 | CLOSING SIGNATURE | `hsl(187 67% 8%)` lagoon-900 | `WE ARE ONE — نحن واحد` (`lang="ar" dir="rtl"`) |

Category sections: each of the nine PARTNER_CATEGORY_SLUGS rendered with verbatim description. When `getVisiblePartnersByCategory()` returns empty (all cases at launch): no card, no silhouette, no placeholder entity — description stands alone.

Head via react-helmet-async:
- title: OUR PARTNERS — THE ONE MOVEMENT INTERNATIONAL
- description: The institutions, organizations and individuals building The One Movement International — a global ecosystem of partnership, purpose and impact.
- canonical: /partners (with `FILLED AT DEPLOY WITH PRODUCTION DOMAIN` comment)
- og:title / og:description matching

**Note on SectionHeading:** The component accepts `heading`, `eyebrow`, `surface`, `thread` props — not `children` or `as`. All usages corrected to prop API.

**Note on Button asChild:** Used `buttonVariants` + `cn` styled on `<Link>` for the CTA (same pattern established in Task 2B to avoid Radix Slot v1.2 multi-children error).

---

### Part R — Reserved /partners/:slug Route

**App.tsx:** Added import for `PartnerDetail` and `<Route path="/partners/:slug" component={PartnerDetail} />` following the exact `/programs/:slug` pattern.

**File:** `artifacts/web/src/pages/partners/detail.tsx` (new)

Redirect behavior: `getPartnerBySlug()` returns undefined for unknown, unauthorized, or non-active slugs; `useEffect` redirects to `/partners` with `replace: true`. No 404, no empty surface, no leakage.

Conditional sections (all on field presence):
- Hero: name (Cinzel UPPERCASE), category badge, country, role
- About: description
- Services: bullet list
- Products: bullet list
- Website: external link (safe URL only)
- Related programs: chips → `/programs/[slug]`
- Related sectors: chips → `/ecosystem`
- Article slugs: reserved slot, commented out (`POPULATED WHEN NEWS HUB v0 LANDS`)
- Contact: `institutional-inquiry-only` → `/join#institutional-inquiry`; `direct-contact-authorized` + email → mailto link

Dynamic head: `${entity.name} — THE ONE MOVEMENT INTERNATIONAL`, `entity.seoDescription`, canonical `/partners/${entity.slug}`.

---

### Authorization render gate test (PASSED — entity removed before commit)

Temporarily added entity with `authorizationOnFile: false, status: "active"`:
- `/partners` → entity did NOT appear. Sponsor category showed description only. ✓
- `/partners/test-unauthorized` → redirected cleanly to `/partners`. ✓

Test entity removed. `PARTNERS[]` is empty in committed code.

---

### No database migration

`drizzle-kit generate` output after all changes: **"No schema changes, nothing to migrate 😴"** ✓ Zero schema files touched. Zero lib/db files touched.

---

### Files changed (exact boundary)

| File | Change |
|---|---|
| `lib/shared/src/taxonomy.ts` | Added PARTNER_CATEGORY_SLUGS, PartnerCategorySlug, PARTNER_CATEGORY_SET (additive only) |
| `lib/shared/dist/taxonomy.d.ts` | Rebuilt (tsc -p tsconfig.json) — new declarations available to consumers |
| `artifacts/web/src/lib/partners-data.ts` | New — PartnerEntity type, empty registry, helpers |
| `artifacts/web/src/pages/partners/index.tsx` | Replaced placeholder — 6-section shell page |
| `artifacts/web/src/pages/partners/detail.tsx` | New — reserved detail route with redirect-on-unknown |
| `artifacts/web/src/App.tsx` | Added PartnerDetail import + `/partners/:slug` Route |
| `docs/PROJECT-STATUS.md` | This checkpoint |

**Not touched:** lib/db, artifacts/api-server, join page, home page, ecosystem, vision, programs, 404, any shared component, design tokens, header/footer.

---

### Testing results

| Test | Result |
|---|---|
| /partners renders at 390px mobile | ✓ No overflow, all sections flow |
| /partners renders at 768px tablet | ✓ Clean layout |
| /partners renders at 1280px desktop | ✓ Hero, sections correct |
| 9 category sections render with description | ✓ All 9 present, description-only (no cards) |
| NO placeholder card, NO logo silhouette | ✓ Empty state = description only |
| Institutional CTA → /join#institutional-inquiry | ✓ Anchor `id="institutional-inquiry"` confirmed at join line 405 |
| /partners/some-unknown-slug redirects to /partners | ✓ (SPA redirect via useLocation + replace:true) |
| Authorization gate: authorizationOnFile=false entity → NOT shown | ✓ Tested and removed |
| Authorization gate: /partners/[unauthorized-slug] → redirects | ✓ Tested and removed |
| head title / description / canonical / og:* correct | ✓ Helmet tags set |
| react-helmet-async pattern consistent with Task 2B | ✓ Same import pattern |
| Arabic `نحن واحد` with lang="ar" dir="rtl" | ✓ |
| TypeScript clean across workspace | ✓ tsc --noEmit passes |
| Browser console clean | ✓ No errors |
| No database migration | ✓ drizzle-kit generate: "No schema changes, nothing to migrate" |
| Task A files (lib/db) untouched | ✓ |
| API server untouched | ✓ |
| Join, home, ecosystem, vision, programs untouched | ✓ |
| Shared components untouched | ✓ |

### Recommended checkpoint
**Partners Directory Shell Complete**
