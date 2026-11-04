---
name: Founder membership dashboard
description: Owner's central My Space statistics, member follow-up and ecosystem onboarding requirements.
---

The Founder requires a dashboard in My Space showing visitors, all created accounts, completed and incomplete profiles, and everyone in the ecosystem. Incomplete profiles need an email-reminder action explaining how to finish and what comes next: presenting their work and choosing sectors.

The Founder requires a dedicated administrative directory of **all registered
authentication accounts**, including unverified, profile-less, incomplete,
unlisted and suspended accounts, rather than a renamed People directory.
Administrative account visibility does not imply public discoverability.

**Why:** The Founder explicitly requested a professional Command Center and
reported that the ordinary discoverable directory was insufficient.

**How to apply:** Resolve identities from the authentication provider, keep
production and development figures clearly distinguished, and reconcile rather
than hardcode approximate account totals. Founder oversight covers all seventeen
sectors without changing ordinary membership selections. Administrative service
contact must be clearly identified and separate from personal conversations;
it must not bypass personal blocks to create ordinary social messages. Sensitive
actions require explicit confirmation and a durable actor/target/time audit.
Never expose passwords, secrets or unrestricted private conversations.

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

Resend send-only API keys cannot read the domain list. When the integration
explicitly reports this limited permission, retain the narrower key and require
the Founder to attest that the sender domain is Verified in Resend before
confirming an individual reminder; bind that attestation to the signed preview.

**Why:** Requiring broader account-management permissions just to inspect
domains would violate least privilege, while silently treating the sender as
verified could produce failed mail or unintended sends.

**How to apply:** Keep reminder sends individually confirmed and fail closed
when credentials, sender address, domain verification, or the destination
environment are unresolved. Development unsubscribe links must not point at
production state.
