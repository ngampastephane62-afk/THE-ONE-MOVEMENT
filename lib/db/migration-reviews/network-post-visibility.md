# Network post visibility — migration review

## Approval and target

The owner approved applying this schema change to the development database only.
Production remains read-only and will not be changed or deployed by this work.

Generated migration:

`lib/db/drizzle/0019_fat_joshua_kane.sql`

## Development data impact

The pre-migration, aggregate-only development snapshot contained:

- 29 ecosystem profiles: 16 with network visibility enabled, 13 not enabled.
- 4 profiles opted into the public directory; 0 suspended.
- 4 network posts, all authored by already-enabled profiles.

Adding the non-null `visibility` column with its `community` default assigns that
value to the 4 existing posts, preserving their current signed-in-network
audience. No account or profile visibility flag is changed. No post body, media,
reaction, comment, follow, or identity data is updated or deleted.

These development counts differ from the production snapshot. No production
counts are used to target or mutate development records.

## Exact operations

The SQL contains:

1. Add `network_posts.visibility`, non-null, default `community`.
2. Add nullable `network_posts.visibility_sector`.
3. Add an index over visibility, visibility sector, and post ID.
4. Restrict visibility to `community`, `followers`, `sector`, or `draft`.
5. Require a recognized sector slug only for `sector` posts, and require a null
   sector for other visibility values. The allowed list matches the 17 sectors
   permitted by the member-profile database constraint.

There is no `DROP`, `DELETE`, `TRUNCATE`, `RENAME`, or explicit bulk `UPDATE`.

## Compatibility and security

- Existing rows receive `community`, retaining the audience that current code
  already grants to posts from enabled profiles.
- Existing API code may ignore the new columns; it does not need to be restarted
  for this migration itself.
- No profile is newly listed, no account role changes, and no Clerk data is
  touched.
- Visibility authorization must be enforced by the API for feed reads, direct
  post actions, comments, likes, views, and edits. Hiding a post in the UI alone
  is insufficient.
- For a member whose profile is not listed, the public-community post may show
  only the author name on that post. Other profile fields and private contact
  data remain excluded.
- Sector posts must use the owner's active sector selection; Founder access is
  separately validated server-side.

## Rollback

Before new posts use followers, sector, or draft visibility, removal of the new
columns and constraints would restore the prior schema without losing existing
post content. After those values are in use, dropping the columns would erase
privacy choices and must not be done automatically. Prefer a forward repair.

## Verification before application

- Generated SQL reviewed against the requested operations and data impact.
- Development migration history was checked before generation; this is the only
  newly generated migration.
- Apply with the project's reviewed Drizzle migration command only. Do not use
  schema push, `push-force`, custom production DDL, or deployment hooks.
