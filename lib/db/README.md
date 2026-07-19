# @workspace/db — Database Package

Drizzle ORM schema definitions and migration tooling for THE ONE MOVEMENT INTERNATIONAL (Tropik Agence FZE LLC).

---

## Database workflow

All schema changes must follow the **generate → review → migrate** sequence.

```
pnpm --filter @workspace/db db:generate   # 1. generate SQL from schema change
#   Review the generated .sql file — never apply if it contains
#   DROP TABLE, DROP COLUMN, TRUNCATE, or RENAME on existing objects
pnpm --filter @workspace/db db:migrate    # 2. apply reviewed migration to DB
```

### Never use push against shared or production databases

`drizzle-kit push` bypasses migration files and leaves no auditable trail. This
is prohibited for any shared, staging, or production database. The platform
stores personal data under UAE PDPL and GDPR obligations — a complete migration
history is mandatory.

A gated `db:push:local-only-DANGEROUS` script exists for development only. It
prints a red-flag warning before executing and must never be pointed at a shared
database.

---

## Available scripts (run from workspace root with `--filter @workspace/db`)

| Script | Command | Purpose |
|---|---|---|
| `db:generate` | `drizzle-kit generate` | Generate a new SQL migration from schema changes |
| `db:migrate` | `drizzle-kit migrate` | Apply all pending migrations to the database |
| `db:status` | `drizzle-kit status` | Show which migrations are applied / pending |
| `db:push:local-only-DANGEROUS` | `drizzle-kit push` (gated) | Dev-only direct push — NEVER use against shared/prod DB |

Or from within `lib/db/`:

```bash
cd lib/db
npx drizzle-kit generate --config ./drizzle.config.ts
npx drizzle-kit migrate  --config ./drizzle.config.ts
npx drizzle-kit status   --config ./drizzle.config.ts
```

---

## Adding a new column or table

1. Edit the relevant file in `lib/db/src/schema/`.
2. Run `db:generate`. A new `.sql` file appears in `lib/db/drizzle/`.
3. **Review the SQL.** If it contains any `DROP`, `TRUNCATE`, or `RENAME` on an existing table or column, **stop and investigate** before proceeding.
4. Run `db:migrate` to apply.
5. Rebuild the `lib/db` package so downstream TypeScript consumers pick up the updated types:
   ```bash
   cd lib/db && npx tsc -p tsconfig.json
   ```
6. Restart the API server.

---

## Migration journal

Migration files live in `lib/db/drizzle/`. The meta journal at
`lib/db/drizzle/meta/_journal.json` is the source of truth for which migrations
exist. Applied migrations are tracked in the live database's
`drizzle.__drizzle_migrations` table.

### Baseline (Migration 0000)

`0000_classy_blade.sql` was generated on 2026-07-19 as the historical baseline —
it represents the schema state at the end of Join Stage 1.1 (including
`primary_sector_slug` on `join_interests`). It was marked as already-applied
in `drizzle.__drizzle_migrations` without executing its SQL (the tables already
existed from prior `push` operations). All future migrations start from this
baseline.

---

## Agent rule (enforced)

> **No production or shared-database schema change may be performed using
> `drizzle-kit push --force`. All schema changes must be made via
> `drizzle-kit generate` → review → `drizzle-kit migrate`. This applies to
> every future Agent task.**
