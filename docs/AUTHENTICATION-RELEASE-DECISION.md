# Authentication release decision

On 2026-10-16, the user explicitly chose to keep Clerk and exclude the older custom-authentication implementation.

## Outcome

- The main application's Clerk sign-in, member routes, identity model and database migration history are preserved.
- The older task's custom password hashing, session cookies, registration/login endpoints, migration, dependencies and frontend replacements are excluded.
- No application code differs from the main branch as a result of retiring that implementation. Only this decision record and the standing project instruction are added.
- This retires the original custom-authentication scope; it does not claim that scope was implemented or released.

## Publishing

No deployment was performed from the isolated task copy. Publishing remains a separate action from the main application after the task outcome is incorporated.

## Verification

After resolving the integration conflicts, the application tree was compared with the main branch and was identical before adding these documentation-only records. The existing Clerk sign-in component was confirmed unchanged. No database was altered while excluding the older implementation.
