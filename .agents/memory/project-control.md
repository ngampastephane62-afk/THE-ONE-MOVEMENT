---
name: Project control and Tropik licensing
description: Approval boundaries for development, financial accounts, and legal ownership of TOMI.
---

The project stakeholder requires sole control and validation of work, including Stripe and other accounts associated with The One Movement.

**Why:** The stakeholder explicitly conditioned continued development on retaining control without affecting another developer's account.

**How to apply:** Deliver changes in preview for approval before publication. Obtain explicit approval before changing connected financial accounts, access, ownership, or billing settings. Do not infer account ownership, founder privileges, or who pays for usage from the display name of a chat participant; verify the actual workspace and account configuration.

The stakeholder identifies Tropik Agency as the creator and copyright holder of The One Movement ecosystem, with rights covering its creation, development, and organization.

**Why:** This is the stakeholder's explicit declaration of the business relationship and intended rights holder, not independently verified legal evidence or a transfer of technical account ownership.

**How to apply:** Use Tropik Agency as the declared rights-holder context, but obtain exact legal details and licence terms before changing legal notices or merchant identity. A branding or footer edit does not transfer account ownership, payment proceeds, or legal rights. If work is still hosted in another developer's workspace, establish stakeholder-controlled hosting and billing before promising independent control or spending.

Keep Clerk as the application's authentication provider; do not introduce the older parallel custom-password/session system.

**Why:** On 2026-10-16, the user explicitly chose “Keep Clerk and leave out the older authentication task” after the two implementations conflicted.

**How to apply:** Preserve the current member sign-in and identity integration when incorporating older work. Any later provider migration requires a new explicit request.

Owner approval of the Privacy Policy and Terms was explicitly granted on 2026-10-16. This is owner approval, not confirmation of review by qualified legal counsel.

**Why:** The owner selected “I approve the current copy as owner” after being told the policies distinguish free accounts, monthly professional subscriptions and annual event packages.

**How to apply:** Do not continue treating owner sign-off on that copy as missing. Keep professional legal validation separate, and seek renewed approval for material changes to legal obligations or business terms.

The Founder authorized only the private Workspace foundation: reuse existing
authentication and Founder authorization, preserve the administration tools and
mark unfinished content modules unavailable. The next editorial/CMS phase needs
new Founder approval.

**Why:** The controlled implementation directive explicitly limits work to Phase A
and requires stopping before Phase B.

**How to apply:** Do not interpret the Workspace or its navigation as authorization
to implement page editing, new roles, media management or publication workflows.
Do not change Founder identity, Clerk, membership/payment rules, database schemas,
production data, restart backend servers or deploy under this authorization.

Separate authorization permits restoring the development preview API only after
verifying that startup cannot run Stripe initialization, migrations, webhook
creation or synchronization. If the effective environment cannot be established
safely, stop before starting the API and request further authorization.

**Why:** The Founder explicitly required a controlled, development-only restoration,
preserved production behavior and a stop when startup safety cannot be guaranteed.

**How to apply:** Do not treat preview restoration as permission to override
ambiguous runtime environment markers, access production data, fabricate an
authenticated Founder session, change payment rules or deploy.

The Founder subsequently authorized the Command Center's News & Publishing
module first, not the rest of the CMS roadmap. Before persistence work, inspect
existing structures; if a migration is needed, present its exact schema,
operations, compatibility, rollback and security implications and wait for
approval. Completion of News also requires approval before starting another module.

**Why:** The Founder explicitly requires one functional module at a time and a
migration approval gate, while preserving the existing application, archive,
Clerk identity, membership rules and payments.

**How to apply:** News authorization supersedes the earlier foundation-only
restriction solely for this module. Partners, Members, Payments, page editing,
notifications and broader redesign remain outside the current implementation
authorization. Do not bypass the approval gate with fake persistence.

The latest News instruction narrows the active authorization to migration
preparation, SQL review and static validation only. Wait for fresh explicit
approval before further database execution or implementing the News editor.
Starting or restarting backend servers is prohibited under this scope.

**Why:** The Founder supplied a newer preparation-only directive after previously
approving development migration execution. A newer restriction controls subsequent
work; it does not undo operations legitimately completed before it arrived.

**How to apply:** Report the actual state and distinguish prepared, executed and
unimplemented work. Do not reapply migrations or delete tables to simulate an
unexecuted state. Preserve existing authentication, membership, payments, content,
animations and production isolation.
