---
name: Editorial asset storage jobs
description: Standalone preparation scripts and sidecar authentication failure diagnosis.
---

Standalone media-preparation jobs should depend only on the storage SDK, not initialize the application's database/authentication services.

**Why:** A temporary bundled uploader could resolve the API server’s direct dependencies but not the database package’s transitive `pg` dependency. Importing a general application file helper pulled in that unrelated dependency graph.

**How to apply:** Reuse a storage-only service or call the existing SDK from the API package directory. Avoid installing a new TypeScript runner just for an asset job.

Copy the existing sidecar credential format precisely, including the SDK’s `subject_token_field_name` property.

**Why:** An incorrect property name caused a misleading “Cannot call write after a stream was destroyed” error during a storage upload rather than a clear authentication error.

**How to apply:** Check credential-source configuration before treating this upload error as a network stream cancellation bug. Never log or manually inspect the token.
