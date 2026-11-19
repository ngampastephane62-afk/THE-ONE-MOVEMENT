# Independent TOMI development and release procedure

## Source and scope

GitHub source: https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT

Verified source baseline: `db9212a7c7246cc08309b7a33bab6df772d1edef`.
The Founder's earlier Replit project is a prototype and has unrelated history.
The restoration imports the existing application; it does not redesign it.
The proposed file update preserves the application assets and code and adds
development safety, CI and engineering documentation. It does not move hosting.

Replit file merges do not transport Git remotes, private Git references,
credentials, databases or LFS object caches. The source history fetched during
preparation is not proof that a later editor has a fully configured Git clone.

## Full-history coding checkout

The safest GitHub coding checkout is a separate authenticated clone, rather than
pushing the earlier prototype's unrelated Git history. In the Founder's Replit
Shell, after connecting their GitHub account, run:

```sh
git clone https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT.git tomi-source
cd tomi-source
git lfs install --local
git lfs pull
git lfs fsck --objects
git switch -c feature/short-description origin/main
pnpm install --frozen-lockfile
```

The directory must not already exist. Do not clone into or overwrite an existing
working tree. If credentials fail, use Replit's GitHub connection, not passwords
or tokens embedded in URLs. Existing ignored files and private config are not
part of the source import.

For new work: fetch current `main`, branch from it, implement a narrow change,
run `PORT=22333 BASE_PATH=/ pnpm verify`, push the feature branch and open a PR.
Merge only after checks pass and required review. Never force-push.
The local safety changes must themselves be reviewed and landed as a feature PR;
do not assume they already exist on GitHub `main`.

## Isolated development configuration

Provision a separate empty development PostgreSQL database. Do not copy members,
messages, publications or a production dump. Configure `DATABASE_URL` privately.
Review the SQL journal before applying migrations to that empty database.
`0021_community_communications.sql` is outside the journal and needs independent
review; do not blindly apply every SQL file or use schema push.

For a database smoke test with no access to any inherited database, install the
PostgreSQL 16 command-line tools and run `pnpm test:database:disposable`. The
script creates a new empty cluster on a private Unix socket, applies journaled
migrations, runs the call-budget concurrency/constraint test, and stops/removes
its own temporary cluster. It ignores the caller's `DATABASE_URL` and provider
credentials. This does not provision the persistent application database.

Create a separate Clerk development instance and configure these names in Replit
Secrets/configuration: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`,
`VITE_CLERK_PUBLISHABLE_KEY`. Keep server/frontend keys on the same test instance.
Set test redirect URLs for the Founder's actual preview origin.
Do not copy production Clerk users or grant Founder privileges via a bypass.

Configure a separate random `SESSION_SECRET`, a test Founder identity using
`TOMI_FOUNDER_EMAIL`, `NODE_ENV=development` and
`TOMI_PREVIEW_SKIP_STRIPE_INIT=1`. Run only in the Replit editor. Set the Daily
pilot to disabled initially. Do not attach production Stripe, Resend, storage
or Daily connections. The payment startup skip does not disable provider routes.
The inherited object storage ID is not permission to use production media.
Do not connect it to a writable production bucket; provision separate test storage.

Start API: `PORT=8080 pnpm --filter @workspace/api-server dev`.
Start frontend: `PORT=22333 BASE_PATH=/ pnpm --filter @workspace/web dev`.
The normal preview needs both services registered, not only a Run command.
Check `/api/healthz`, `/api/health`, the public frontend, Clerk sign-in, and
member/Founder authorization with dedicated test identities.

## CI and safe release fallback

`.github/workflows/ci.yml` installs from the lockfile, typechecks, runs offline
regression tests and builds the frontend/backend. It has read-only contents
permission, no production secrets and no deployment step. It skips database
integration tests and LFS downloads; build success does not certify LFS media.
GitHub-hosted workflow execution is only verified after an actual Actions run.
An owner should require the `Typecheck, offline tests and builds` status check
in a branch ruleset. Do not enable merges while required checks are red.

Official documentation reviewed on 2026-11-19:

- https://docs.replit.com/learn/projects-and-artifacts/replit-deployments
- https://docs.replit.com/features/workspace-tools/git-interface

Publishing creates a snapshot; later Git pushes do not update that snapshot.
No documented public GitHub Actions deployment API, CLI, or webhook for automatic
republishing of this existing app was identified. No Replit token is requested:
an undocumented token-based workflow is not a supported solution.

Until supported automation is verified, use this mobile-friendly owner procedure:

1. On a phone browser, open the **original** production project:
   https://replit.com/@ngampastephane6/THE-ONE-MOVEMENT.
2. Sign in as its owner or an explicitly authorized collaborator. Use the
   owner's normal account security; never share the owner's password.
3. Confirm the GitHub PR checks passed and record the tested commit SHA.
4. In the original project's Git pane, pull `main` only if the workspace is
   clean. Stop on divergence, conflicts, or uncommitted work. Never reset/force.
5. Confirm the workspace SHA matches the tested SHA. Review any migration plan
   and backups first. Inspect build/start hooks for automatic schema work.
6. After release authorization, open Tools → Publishing, review the existing
   deployment and select its republish/update action. Do not create a replacement
   deployment, change the custom domain, reconnect production integrations, or
   replace the database.
7. Verify the existing domain, public/member/Founder flows, payment availability
   without charging, and error logs. Use the existing deployment's rollback
   procedure if needed; roll back incompatible schema changes only under the
   reviewed database plan.

This is a manual publish fallback, **not automatic deployment**. Full automation
remains an unmet requirement, not something solved by a GitHub workflow label.
Do not perform a live release during development restoration.

## Claude Code

`CLAUDE.md` describes the actual repository, commands and safety boundaries.
In a compatible Claude Code environment, authorize GitHub repository access and
use a clean feature branch. Node 24 and pnpm 10.26.1 are required. Run the offline
checks without production credentials. Authenticated app testing additionally
needs the isolated development secrets above. This does not verify the user's
Claude subscription, account access or cloud environment.
