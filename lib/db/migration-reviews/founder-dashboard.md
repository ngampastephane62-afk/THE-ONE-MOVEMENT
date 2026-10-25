# Founder dashboard — migration review

## Scope and approval boundary

The owner approved preparing the two proposed tables and SQL, not applying the
migration. The generated migration is:

`lib/db/drizzle/0018_aspiring_captain_stacy.sql`

No migration, database write, API restart, tracking activation or email send was
performed during preparation. Runtime dashboard, reminder and tracking code is
not implemented by this schema preparation.

## Exact operations

The SQL contains exactly two `CREATE TABLE` statements:

### `site_visit_sessions`

- UTC calendar day.
- A daily session hash of 64 hexadecimal characters.
- Positive page-view count.
- First and last observation timestamps, with last not before first.
- Composite primary key `(day, session_hash)` prevents duplicate session rows
  within a day and supports date-based retention queries.
- No account identifier, email, raw session token, IP address, browsing path,
  referrer or user-agent column.

These are measured browser sessions, not identified people or historical
visitor counts. Summing daily sessions does not give deduplicated people across
multiple days.

### `member_profile_reminders`

- Stable UUID and unique Clerk account identifier.
- Requesting Founder's Clerk identifier.
- Attempt UUID, latest attempt timestamp, optional provider message identifier.
- Status restricted to `sending`, `accepted`, `failed`, `unknown`.
- Optional provider-acceptance and reminder opt-out timestamps.
- Creation and update timestamps.
- No recipient email, message body or provider credential.

This is the latest reminder state per account, not an email delivery history.
`accepted` means accepted by the email provider; it does not prove delivery,
opening or completion of the recipient's profile. An ambiguous request must not
be presented as a definitive failure or immediately retried.

## Compatibility and security

- No existing table, column, index, data or role is changed.
- No new Clerk identity, alternative authentication system or foreign-key
  dependency on legacy user tables is introduced.
- No extension, webhook, trigger, background task or email call is created.
- Other application modules do not depend on these new tables.
- New dashboard APIs must enforce the existing Founder gate server-side and
  return private, non-cacheable account data. Public visit collection must not
  expose either table or accept account/contact identifiers.

## Obligations before enabling the module

The following are application work, not guarantees supplied by this SQL:

1. Collect only after the visitor's agreement; derive session hashes on the
   server using a secret and UTC day, with no raw token or IP persistence.
2. Purge visit rows older than 90 days and clearly state the measurement start.
3. Distinguish accounts, profile completion, activated ecosystem membership
   and measured visitor sessions in the UI.
4. Resolve recipients from current Clerk records rather than a browser-supplied
   email address; recheck profile completion, verification and opt-out before
   sending.
5. Enforce one reminder per seven days, durable atomic reservation, provider
   idempotency, safe recovery of ambiguous attempts and a working opt-out.
6. Use the connected Resend service only after its credential and sender are
   valid. No real email sends are authorized by preparing or applying this SQL.

## Verification performed

- Database package TypeScript check passed.
- Generated SQL has exactly the two expected `CREATE TABLE` operations.
- No `ALTER`, `DROP`, `TRUNCATE`, `RENAME`, `INSERT`, `UPDATE` or `DELETE` statement.
- All existing table definitions in the new snapshot are unchanged from the
  preceding snapshot.
- No database connection was used by the verification script.

## Application and rollback

Before applying, obtain explicit development-only approval, verify the effective
environment and database target without displaying credentials, and check which
migrations are pending. Do not use schema push or apply unrelated pending SQL.

The current app remains compatible if these new empty tables are added.
Deployment and production migration require separate authorization.

Before application, rollback consists only of withdrawing the proposed schema
and generated migration files; no database rollback is needed.

After application, leaving unused tables in place is safer than destructive
rollback. Dropping either table would delete its collected statistics or reminder
state, so it requires a separate reviewed migration, an impact review and owner
approval. Never execute a destructive rollback automatically.
