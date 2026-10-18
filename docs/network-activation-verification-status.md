# TOMI — Phase 2 / Task 1 — Founder decision

## Recorded status

**IMPLEMENTED — ISOLATED TESTS PASSED — RUNTIME UNVERIFIED**

**BLOCKED FOR RUNTIME VERIFICATION**

The Founder accepts the reported source correction and previous isolated test
results as preliminary validation only. Runtime verification is on hold.
This is not a production-ready fix, and there is no claim that the correction
is active in production.

The source correction must remain unchanged: new network profiles default to
`enabled: false`. Explicit member activation remains required. Existing member
activation states and independent public visibility choices must be preserved.

The previous isolated test results do not establish that real Clerk sessions,
PostgreSQL persistence, or the complete registration-to-activation flow work in
the application runtime. No tests were rerun to record this decision.

## Outstanding requirements

- Verification of a Clerk Development instance.
- Confirmation that browser and server credentials belong to that same
  development instance.
- Confirmation of a dedicated non-production PostgreSQL database.
- Confirmation of restricted database access, without production privileges.
- An approved safe verification procedure that does not initialize or
  synchronize Stripe or run migrations.
- Explicit Founder authorization for the environment and the proposed runtime
  verification scope before any further investigation or execution.

## Administrative attestation checklist

All items are pending. This checklist requests attestations only, not technical
execution or disclosure of credentials.

- [ ] An authorized administrator confirms that the selected Clerk environment
  is Development, separate from production.
- [ ] The administrator confirms that browser and server credentials belong to
  the same Development instance, and effective host/proxy configuration does not
  route this verification to production.
- [ ] The administrator confirms that the selected PostgreSQL database is
  dedicated to verification, is non-production, and contains no real member data.
- [ ] Database permissions are restricted to the verification resources and
  provide no access to production resources.
- [ ] A safe verification procedure is reviewed and approved: no standard API
  startup with Stripe initialization, no Stripe synchronization, no migrations,
  and no production access.
- [ ] The Founder explicitly authorizes the environment and exact permitted
  verification operations, including any future test-account creation,
  test-data writes, and cleanup. Attestation alone does not authorize execution.

For each item, record only: confirmed / not confirmed / unknown, reviewer role,
review date, and a non-sensitive administrative evidence reference.
Do not include secret values, tokens, keys, database connection strings,
usernames, hostnames, or sensitive infrastructure identifiers.

## Hold and preservation instructions

Do not continue investigating this task until the Founder provides the required
environment authorization. Do not implement a runtime launcher, modify
application code, start/restart/stop servers, access databases, create accounts,
run tests or migrations, initialize/synchronize Stripe, or deploy under this
decision.

Preserve existing functionality, routes, designs, images, and member data.
Do not begin another technical task without a separate Founder mandate.

## Administrative completion

Status documentation and attestation checklist completed. The technical task
remains blocked for runtime verification; it is not marked runtime-verified,
production-active, or production-ready.
