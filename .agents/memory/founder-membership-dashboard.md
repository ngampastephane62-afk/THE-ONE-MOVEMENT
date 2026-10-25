---
name: Founder membership dashboard
description: Owner's central My Space statistics, member follow-up and ecosystem onboarding requirements.
---

The Founder requires a dashboard in My Space showing visitors, all created accounts, completed and incomplete profiles, and everyone in the ecosystem. Incomplete profiles need an email-reminder action explaining how to finish and what comes next: presenting their work and choosing sectors.

The owner requests convenient Google sign-in alongside email registration, followed by essential profile completion, sector selection and voluntary ecosystem participation. Google authentication must happen on Google's own page; TOMI must never ask for a Gmail password.

**Why:** The owner repeated this sequence to obtain reliable account and ecosystem counts for partners.

**How to apply:** Keep account creation, complete profiles and active ecosystem membership separate in both onboarding and reporting. Maintain a nonblocking sign-in/create-account invitation for anonymous visitors. Do not auto-activate, auto-publicize profiles or auto-accept programme applications.

**Why:** The owner repeated that content-management tools alone do not meet their need to see and follow up with members.

**How to apply:** Keep visitors, accounts, profile completion and ecosystem membership as distinct, clearly defined measures. Explain creating an account or signing in to The One Movement wherever people enter the ecosystem, including beneath Subscribe. Do not expose the dashboard or private account contacts to ordinary members or public visitors.

The approved schema proposal limits visit measurement to consent-based, daily
anonymous sessions with 90-day retention, and profile reminders to one per week
with an opt-out.

**Why:** The owner approved this proposal when authorizing SQL preparation.

**How to apply:** Do not claim that the schema alone enforces collection consent,
retention or sending frequency. Implement and verify those controls before
enabling the corresponding features; account/profile totals are not visitor
statistics.

Do not assume that development and published sites use different authentication
tenants just because their application databases are separate.

**Why:** Accurate reporting must distinguish the configured identity directory
from the environment-specific profile and visit records.

**How to apply:** Label account counts as coming from the configured sign-in
service and completion/activity as belonging to the current application
environment. Do not claim published accounts are excluded without verifying
the identity-provider configuration.
