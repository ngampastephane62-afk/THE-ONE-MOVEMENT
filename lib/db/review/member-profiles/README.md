# Member profile extension — applied in development only

The Founder separately approved preparation and development-only application.
The approved SQL is now canonical as `drizzle/0016_member_profile_extension.sql`
and was applied with `db:migrate`, after editor/target and migration-hash checks.
No authentication change, new account, production operation or deployment was
performed. Owner API inputs and profile forms are not extended by this migration.

## Isolation

- The application imports `src/schema/ecosystemMembers.ts`, synchronized only
  after successful database application. Public projections remain allowlists.
- The canonical `drizzle/meta/_journal.json` now ends at migration 0016.
- `index.ts` replaces only the member table for offline Drizzle generation.
- The review configuration has **no database credentials**.
- The SQL here is the historical review copy, not an additional migration.
  Do not apply it again; the equivalent canonical migration is already recorded.
- Do not import this review schema into application code before the database
  has the corresponding columns. Drizzle can otherwise select missing columns.
- Do not copy this whole proposed table over a newer runtime definition.
  Integrate the five new fields and two constraints without losing later work.

Generated using installed drizzle-kit 0.31.10, seeded from the current canonical
migration history through 0015. Temporary full output and snapshots were written
under `/tmp/tomi-member-profile-review`, not the canonical migration directory.
The checked-in SQL is identical apart from a trailing newline. Temporary files
are disposable, not the source of truth for a later application.

To reproduce, use a **fresh temporary directory**, copy the canonical `drizzle`
directory there and point the review config's relative `out` at that directory.
Run `pnpm exec drizzle-kit generate --config ./review/member-profiles/drizzle.review.config.ts --name member_profile_extension_review`
from `lib/db` only after confirming its output directory matches that fresh copy.
Do not run migration or push commands with this review configuration.

## Reviewed scope

Exactly five nullable columns, no defaults, no backfill:
`account_type`, `city_region`, `organization_type`, `contact_name`, `main_sector`.
Exactly two CHECK constraints: account type and the 17 public sector identifiers.
Existing rows retain NULL for all new fields. No profile classification is
guessed. No existing key, column, visibility flag, role or relation changes.

Offline comparison of generated snapshots verified that all 49 other tables
and all existing member definitions are unchanged. The generated statements
contain no DELETE, UPDATE, DROP, TRUNCATE, RENAME, NOT NULL or default assignment.
After application, the five columns were confirmed present, nullable and without
defaults, and both constraints were validated. All 27 existing profiles were
preserved; an aggregate digest of all pre-existing fields was identical before
and after application. Public API responses did not expose the new fields.
Authenticated profile-form saving remains unimplemented for these fields.

The shared taxonomy currently lists 15 sector identifiers, while the frontend
has 17, including `real-estate` and `health-care`. The new CHECK covers all 17.
Future API validation for the new field must cover those exact 17 values;
the existing contracts are not changed by this preparation.

## Privacy and compatibility

Future inputs and owner responses may expose these fields to the owner only.
Do not extend public DTOs, search results, nested network projections or caches.
Organization contact name must not implicitly replace the public display name.
Keep the same Clerk-linked profile and unique identity; do not block existing
members whose new fields remain NULL. No duplicate identity or new role.

## Historical application checklist and future changes

1. Recheck the development target, current history and drift from this baseline.
2. Regenerate and review against the current canonical snapshot if it changed.
   The `0016` prefix is provisional, not a reservation of the next migration ID.
3. Promote only the reviewed migration and matching metadata into the canonical
   history. Preserve the generate → review → migrate workflow.
4. Apply only after separate authorization and database prechecks.
   ADD COLUMN/CHECK requires table locks; assess active traffic first.
5. Only after successful application, activate runtime schema changes and add
   owner-only API contracts, validation and the two profile forms.
6. Verify legacy profiles, upsert identity, edits/reloads and public privacy.
   Do not publish without separate Founder authorization.

Pre-migration runtime schema baseline SHA-256:
`15ad03374b280211ec10302e53f90673acfda5bf85c0dc99aa65efc0fb6809ad`.
