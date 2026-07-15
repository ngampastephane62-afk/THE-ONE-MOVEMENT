# Project Status — THE ONE MOVEMENT INTERNATIONAL

## APPROVED

- Stage 0 — Project Foundation: architecture, folder structure, routing with
  placeholder pages, minimal neutral layout shell, database structure, and
  this status document. Nothing more.

## COMPLETED

- Full-stack TypeScript scaffold: React + Vite frontend (Tailwind CSS,
  shadcn/ui available) and an Express backend.
- Client-side routing (wouter) with all 12 required placeholder pages, each
  showing only the page name as a heading and "Content coming soon.":
  Home, Our Vision, Ecosystem, Community, Programs, Opportunities, Impact,
  Media, Partners, Join the Movement, Sign In, and NotFound. Two supporting
  placeholder pages (Privacy Policy, Terms) were added so the footer links
  resolve to real routes.
- Minimal, neutral layout shell (`Layout.tsx`): top navigation listing every
  page, and a footer with "© The One Movement International" plus Privacy
  Policy / Terms links. Plain black/white/grey styling, system font only, no
  animation, no imagery — as required for this stage.
- PostgreSQL database (Drizzle ORM) with all 14 required tables: `users`,
  `profiles`, `organizations`, `profile_categories`, `programs`, `events`,
  `opportunities`, `applications`, `partners`, `media_items`,
  `impact_stories`, `notifications`, `audit_log`, `ai_usage_log`. Schema
  pushed to the database. No donation, payment, ticket-price, or fundraising
  fields exist anywhere in the schema.
- `profile_categories` seeded with all 28 required values across the 5
  required groups (Creative & Cultural, Business & Innovation, Institutions,
  Community & Impact, Strategic Support). No other table was seeded.
- Health-check endpoints: `GET /api/healthz` (simple) and `GET /api/health`
  (status + live database connectivity confirmation via a `SELECT 1` probe).
- Placeholder rate-limiting middleware (`rateLimit.ts`) with a comment
  explaining its future purpose; a `services/` directory placeholder for
  future external integrations.
- Generic server error handler: unhandled errors are logged server-side and
  the client only ever receives a generic `{ error: "Internal server error" }`
  message — raw database/internal errors are never exposed.
- Documented loading-state convention: see the comment block and
  implementation in `client` `Home` page (`artifacts/web/src/pages/home/index.tsx`),
  which uses the generated `useGetHealth` hook as the reference pattern
  (loading → error → data states).

## IN PROGRESS

- Nothing. Stage 0 scope is complete.

## FUTURE

- Stage 1: premium design system and visual identity (this stage's plain
  styling is a deliberate placeholder).
- Public page content for Home, Our Vision, Ecosystem, Community, Programs,
  Opportunities, Impact, Media, Partners.
- Authentication and member accounts (Sign In / Join the Movement flows).
- Member profiles, dashboards, and privacy controls.
- Opportunities/applications workflows, programs/events management.
- AI features (explicitly out of scope for Stage 0).
- Administration tooling and audit trail consumption.
- Real rate limiting (current middleware is a documented no-op).

## RISKS

- None identified for this stage. The schema intentionally excludes any
  donation/payment/ticket-price/fundraising fields per the legal requirement
  — this constraint must be preserved in all future stages.
- No authentication exists yet, so all data-mutating routes must remain
  unbuilt (or protected) until an auth stage is completed.

## CHECKPOINTS

- Recommended checkpoint name: **"Foundation Approved"**
