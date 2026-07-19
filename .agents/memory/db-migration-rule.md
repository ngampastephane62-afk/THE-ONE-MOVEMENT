---
name: DB Migration Rule and Workflow
description: Mandatory generate→review→migrate workflow for all schema changes; push --force prohibited; drizzle-kit status does not exist in 0.31.10.
---

## Rule

No production or shared-database schema change may be performed using `drizzle-kit push --force`. All schema changes must be made via:

```
drizzle-kit generate → review SQL for destructive statements → drizzle-kit migrate
```

This applies to every Agent task, without exception.

**Why:** The platform stores personal data under UAE PDPL and GDPR obligations. An auditable migration trail in `lib/db/drizzle/` is mandatory. Push bypasses migration files entirely.

**How to apply:** Any time a schema change is needed (new column, new table, constraint, index), follow the procedure documented in `lib/db/README.md`. Never call `push` or `push-force` scripts against a shared database.

## Workflow scripts (lib/db/package.json)

| Script | Purpose |
|---|---|
| `db:generate` | `drizzle-kit generate` — emit SQL from TypeScript schema diff |
| `db:migrate` | `drizzle-kit migrate` — forward-only apply to DB |
| `db:status` | Node inline script — queries `drizzle.__drizzle_migrations` directly |
| `db:push:local-only-DANGEROUS` | Gated push with red-flag echo — dev only, never shared/prod |

## drizzle-kit 0.31.10 quirks

- `drizzle-kit status` command does NOT exist — returns "Unknown command". Use `db:status` script instead.
- `out` path in `drizzle.config.ts` must be a **relative path** (`"./drizzle"`), not `path.join(__dirname, "./drizzle")`. The absolute path causes a double-slash bug on the second `generate` call (reads `'.//home/runner/...`' and throws ENOENT on existing snapshots).
- `drizzle-kit generate` run from `lib/db/` directory with `--config ./drizzle.config.ts`.

## Baseline migration

- File: `lib/db/drizzle/0000_classy_blade.sql`
- Represents schema state at end of Join Stage 1.1 (includes `primary_sector_slug` on `join_interests`)
- Was NEVER executed against the live DB (tables pre-existed from push operations)
- Marked as applied via manual SQL: `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('<sha256>', 1784475018502)`
- Hash format: `crypto.createHash("sha256").update(rawSqlFileContent).digest("hex")` (from `drizzle-orm/pg-core/dialect.cjs`)
- Journal table lives in `drizzle` schema (NOT `public`): `drizzle.__drizzle_migrations (id SERIAL PK, hash text NOT NULL, created_at bigint)`

## After any schema change

1. Edit schema file in `lib/db/src/schema/`
2. `db:generate` — inspect generated SQL for DROP/TRUNCATE/RENAME; stop if found
3. `db:migrate` — apply to live DB
4. Rebuild `lib/db`: `cd lib/db && npx tsc -p tsconfig.json`
5. Restart API server workflow
