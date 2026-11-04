# Founder Command Center — additive development migration review

Migration: `0020_lowly_king_cobra.sql`.

## Purpose

Cover Clerk accounts that have no ecosystem profile without manufacturing
profiles, public visibility, security roles or legacy integer user records.

The four new tables hold account observations, installation and per-Founder
preferences, deduplicated private Founder notifications, and a separate
administrative service channel. They never contain passwords or authentication
secrets. Ordinary social conversations and personal blocks are not bypassed.

The existing audit log stores server-derived Clerk actor and affected account
identifiers in its structured details. Certification changes stay within
existing official applications; this is not an editor of Founder privileges.

## SQL review

The generated SQL contains four CREATE TABLE statements and four CREATE INDEX
statements. It contains no DROP, TRUNCATE, ALTER, RENAME, UPDATE, DELETE, role
grant or existing-record rewrite. Existing accounts, profiles, consent flags,
certifications, posts, payments and media are unchanged by the migration.

No production migration script or startup-time DDL is introduced. The managed
production schema remains controlled by the user's publishing process.

## Notification behavior

A persistent installation baseline prevents replaying all historical accounts
as new registrations. Reconciliation polls Clerk and the current application
database, uses a cross-worker transaction advisory lock and unique event keys,
and catches up after downtime. Founder pages poll every 30 seconds; the server
observer polls every minute while running. This is near-real-time, eventual
in-app synchronization, not an instant webhook or public announcement.

Preferences only control the Founder's in-app presentation, not public
visibility or email sending. The administrative channel is scoped by
server-derived Clerk recipient ID and cannot be opened by ordinary members.

## Account reconciliation boundary

Production read-only inspection found 31 ecosystem profiles, 13 listed in
People. Neither figure establishes the total number of Clerk accounts. The
administrative directory enumerates all pages of the runtime's Clerk directory,
checks total consistency, and explicitly fails instead of presenting a partial
count as exact. Production's actual authentication total must be verified in
an authorized production Founder session, not inferred from development.
