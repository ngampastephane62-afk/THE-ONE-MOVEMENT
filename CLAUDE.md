# TOMI engineering instructions

This is the existing THE ONE MOVEMENT INTERNATIONAL application, not a rebuild.
Read `MIGRATION_HANDOVER.md` and `docs/INDEPENDENT_DEVELOPMENT.md` first.

## Architecture

- pnpm workspaces, Node 24, TypeScript. Keep the lockfile and workspace layout.
- `artifacts/web`: React 19, Vite 7, Wouter, Clerk, public/member/Founder UI.
- `artifacts/api-server`: Express 5, Clerk middleware, service layer, esbuild.
- `lib/db`: PostgreSQL, Drizzle schema and reviewed SQL migrations.
- `lib/shared`: common policies and contracts.
- `lib/api-spec/openapi.yaml`, `lib/api-client-react`, `lib/api-zod`: API contract
  and generated client/validators. Update the contract before regeneration.
- `scripts`: operational utilities; scripts may upload files or access providers.
  Reading a script is not permission to execute it.

## Commands

Use `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`.
Use `PORT=22333 BASE_PATH=/ pnpm build:app` for frontend/backend builds.
`PORT=22333 BASE_PATH=/ pnpm verify` runs all three checks.
Offline tests remove provider credentials and database configuration.
They do not certify authenticated flows, live payments, email or Daily calls.
`pnpm test:database:disposable` creates, migrates, tests and removes a fresh local
PostgreSQL cluster; it never consumes the caller's database connection.
Database integration tests require a separately verified disposable database;
never point them at production or an unverified inherited connection.

## Development safety

No production secrets, member records or storage objects belong in this account.
Use a separate Clerk development instance and database. Do not copy production
credentials. Use the Replit Secrets UI, never chat or committed `.env` files.
Retain Clerk and existing server-side Founder authorization. Do not add a bypass.
The current preview payment guard requires `NODE_ENV=development`,
`TOMI_PREVIEW_SKIP_STRIPE_INIT=1` and genuine Replit editor markers.
This guard skips payment initialization only, not every integration route.
Do not start the app with production connectors attached.
Never run schema push, seed, payment bootstrap, email sending or media upload
merely to make an import pass. Post-merge setup installs dependencies only.

## Git and releases

GitHub is the application source of truth:
`https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT`.
Create feature branches from current GitHub `main`; commit narrowly and open PRs.
Never force-push or rewrite history. Do not push the earlier prototype's history
or unrelated assets into GitHub. See the independent-development guide.
Check existing fixes and rollout status before duplicating work.
Keep the 17 sectors, six programs, branding, subscriptions, member networking,
My Space, administration and integration behavior intact.

Production remains on `@ngampastephane6/THE-ONE-MOVEMENT`.
Git push does not republish Replit. The CI workflow deliberately has no deployment
step. No supported external automatic republish trigger was identified in the
official documentation reviewed on 2026-11-19. Do not invent one or use private
APIs/session cookies. A live release needs the production owner's authorized
Publishing action until a supported mechanism is verified and approved.
Do not alter production databases, secrets, storage, DNS or payment ownership.
Schema changes need a backup, compatibility review and approved migration plan.
