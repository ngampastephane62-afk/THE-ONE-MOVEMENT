---
name: Founder membership dashboard
description: Owner's central My Space statistics, member follow-up and ecosystem onboarding requirements.
---

The Founder requires a dashboard in My Space showing visitors, all created accounts, completed and incomplete profiles, and everyone in the ecosystem. Incomplete profiles need an email-reminder action explaining how to finish and what comes next: presenting their work and choosing sectors.

The owner requests convenient Google sign-in alongside email registration. The 2026-10-30 member-experience directive supersedes separate voluntary network activation: verified accounts with the basic name, professional identity, primary sector and country should gain ordinary free community access automatically. Google authentication must happen on Google's own page; TOMI must never ask for a Gmail password.

**Why:** The owner repeated this sequence to obtain reliable account and ecosystem counts for partners.

**How to apply:** Keep account creation, verification, completion, activity and discoverability separately measured. Remove the extra activation step for ordinary free participation, but preserve existing directory privacy choices and obtain directory-visibility consent independently. Never auto-publicize profiles or auto-approve official roles, certifications, commercial partnerships or programme applications.

**Why:** The updated directive explicitly requests automatic community access while retaining privacy and official approval boundaries; the former combined activation/visibility consent must not become implicit publication consent.

Use only the organization's confirmed domain, theonemovementinternational.ae, for the current email setup; do not substitute d1movementinternational.ai.

**Why:** On 2026-10-30 the owner said they do not control the proposed .ai domain and explicitly corrected the domain to the organization's .ae domain.

**How to apply:** Verify the sender domain through Resend before sending; domain ownership alone does not establish sending verification. Do not invent DKIM records or claim delivery before an authorized single-recipient test succeeds.

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
