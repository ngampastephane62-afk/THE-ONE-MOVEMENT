# TOMI independent development status — 19 November 2026

## Verified results

| Requirement | Status | Evidence and limitation |
|---|---|---|
| GitHub source imported | YES, in proposed project changes | Source tree fetched at `db9212a7c7246cc08309b7a33bab6df772d1edef`; application source retained without redesign. Applying it to the Founder's project still requires approval. |
| Complete Git LFS restoration | PARTIAL | Five of six tracked media paths restored; the 1.6 GB raw-media ZIP did not finish before the fetch timeout. Its pointer is retained, not deleted. Full integrity is not certified. |
| Development application running | NO | Both builds pass, but no authenticated app preview is certified. Dedicated Clerk development configuration is absent. Persistent isolated database and test storage setup remain. |
| GitHub push access | YES | Feature branch pushed and read back successfully. Draft PR: https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT/pull/1. GitHub main remained at the baseline. |
| Automated checks configured | YES, not green | Frozen install, all-package typecheck and frontend/API builds passed. Latest offline run: 366 tests, 302 passed, 64 failed. Disposable PostgreSQL test: one additional test passed. GitHub Actions execution is reported separately. |
| Automatic original-host deployment | NO | No supported public external republish trigger identified. CI deliberately does not deploy. Documented fallback requires the original owner's authorized publish action. |
| Original production changed by this work | NO | No production project connection, deployment, DNS edit, database access, provider sending, payment action or secret transfer was performed. This is not a complete independent audit of production state. |
| Claude Code ready | PARTIAL | Architecture, commands and safety rules added in `CLAUDE.md`; offline commands verified. The user's Claude environment, credentials and authenticated application flows are untested. |

## Safe changes prepared

- Removed automatic database schema push from post-merge setup.
- Added environment-file, credential-file and private-data ignore patterns.
- Replaced blocked Vite 7.3.7 with compatible Vite 7.3.8 after the latest major
  was tried and failed to build this application. Retained the pnpm lockfile.
- Fixed script typecheck root directory for existing cross-package imports.
- Added an offline test runner that removes inherited database/provider settings.
- Added a disposable PostgreSQL runner; journaled migrations created 67 public
  tables and the call-budget concurrency/constraint test passed.
- Added read-only GitHub CI, a manual release fallback, and Claude instructions.

The first GitHub Actions run executed and failed in verification:
https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT/actions/runs/44430947624.
Its dependency install passed. In addition to existing regression failures it
identified missing ffmpeg and inconsistent TypeScript loading on a clean runner.
The follow-up config installs ffmpeg, explicitly uses the declared TS loader,
and runs the build separately even if regression tests fail. A green result is
not claimed.

The existing application source and tests were not rewritten to hide failures.
Examples of failures include stale fixtures missing `auditLogTable` and call
tables, restricted mocks rejecting newly imported modules, and navigation/source
assertions no longer matching the source. These are test failures, not proof that
all corresponding production features are broken. The CI gate must not be
described as successful or used to authorize a production release.
The initial offline run had 362 tests with 65 failures; explicitly loading
TypeScript made additional cases execute and reduced the failure count to 64.

## Remaining setup and release steps

1. Review/apply the prepared restoration to the Founder's project. Review the
   feature PR separately; do not merge while required checks fail.
2. Configure a persistent empty development database, separate Clerk development
   instance, test Founder identity, `SESSION_SECRET`, preview origins and separate
   test storage through Replit Secrets/configuration. Do not reuse production.
3. Complete LFS retrieval and run its integrity check in the final coding checkout.
   Git remotes, references, object caches and databases are not moved by a file merge.
4. Repair the failing regression fixtures/assertions or underlying behavior in
   bounded follow-up changes, then require passing checks on `main`.
5. Verify public, authenticated member and Founder flows using test accounts.
   Verify email and Daily only against dedicated test configuration.
6. The original account owner must review the original workspace and release hooks,
   reconcile a clean Git checkout to the tested SHA, then authorize republishing
   the existing deployment. Keep its hosting, database, integrations and DNS.

There is no verified token or setup sequence that activates automatic publishing
under the currently documented capabilities. Do not substitute an undocumented
API, session cookie, password-sharing scheme, or an app-level code-pull endpoint.
If Replit later provides a supported mechanism, verify its scope and owner
authorization in a non-production test before enabling routine releases.

Official references:

- https://docs.replit.com/learn/projects-and-artifacts/replit-deployments
- https://docs.replit.com/features/workspace-tools/git-interface
