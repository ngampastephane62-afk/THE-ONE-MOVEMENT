import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const output = await build({
  entryPoints: ["src/services/founderControlPolicy.ts"], bundle: true,
  write: false, platform: "node", format: "esm",
});
const { commandTotals, registrationEvents, certificationDecisionIssue, ADMIN_SECTORS } = await import(
  `data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString("base64")}`
);
const now = Date.parse("2026-11-04T12:00:00Z");
const base = {
  clerkId: "user_fixture", name: "Fixture", email: "fixture@example.com", emailVerified: true,
  createdAt: new Date(now - 86400000).toISOString(), lastSignInAt: null,
  profileStatus: "no_profile", missingFields: [], sectors: [], networkEnabled: false,
  suspended: false, lastReminderAt: null, reminderStatus: null, remindersOptedOut: false,
};
test("exact identity totals include unverified and profile-less accounts; activity is not discoverability", () => {
  const totals = commandTotals([
    base,
    { ...base, clerkId: "user_unverified", emailVerified: false },
    { ...base, clerkId: "user_complete", profileStatus: "complete", networkEnabled: true },
    { ...base, clerkId: "user_incomplete", profileStatus: "incomplete", lastSignInAt: new Date(now).toISOString() },
    { ...base, clerkId: "user_suspended", profileStatus: "complete", networkEnabled: true, suspended: true },
  ], now);
  assert.deepEqual(totals, { accounts: 5, verified: 4, unverified: 1, noProfile: 2, incomplete: 1, complete: 2, active: 1, discoverable: 1, newMembers: 5, suspended: 1 });
  assert.equal(totals.accounts, totals.noProfile + totals.incomplete + totals.complete);
});
test("all seventeen administrative sectors are unique and independent of three-sector membership", () => {
  assert.equal(ADMIN_SECTORS.length, 17);
  assert.equal(new Set(ADMIN_SECTORS).size, 17);
  assert.ok(ADMIN_SECTORS.includes("humanitarian-action"));
});
test("installation does not announce historical private accounts as newly registered", () => {
  assert.deepEqual(registrationEvents({ ...base, createdAt: new Date(now - 86400000).toISOString() }, undefined, new Date(now)), []);
});
test("new registrations and verification/completion transitions are detected without requiring listing", () => {
  const account = { ...base, createdAt: new Date(now + 1000).toISOString(), emailVerified: false };
  assert.deepEqual(registrationEvents(account, undefined, new Date(now)), ["registration"]);
  assert.deepEqual(registrationEvents({ ...account, emailVerified: true, profileStatus: "complete" }, { verified: false, complete: false }, new Date(now)), ["email_verified", "profile_complete"]);
  assert.deepEqual(registrationEvents({ ...account, emailVerified: true, profileStatus: "complete" }, { verified: true, complete: true }, new Date(now)), []);
});
test("official decisions cannot grant login privileges, skip commercial checks or overwrite decided requests", () => {
  const pending = { role: "speaker", status: "pending", agreementConfirmed: false, paymentConfirmed: false };
  assert.equal(certificationDecisionIssue(pending, "approved"), null);
  assert.match(certificationDecisionIssue({ ...pending, role: "founder" }, "approved"), /rôle/);
  assert.match(certificationDecisionIssue({ ...pending, role: "admin" }, "approved"), /rôle/);
  assert.match(certificationDecisionIssue({ ...pending, role: "sponsor", agreementConfirmed: true }, "approved"), /commerciales/);
  assert.equal(certificationDecisionIssue({ ...pending, role: "sponsor", agreementConfirmed: true, paymentConfirmed: true }, "approved"), null);
  assert.match(certificationDecisionIssue({ ...pending, status: "approved" }, "approved"), /traitée/);
  assert.equal(certificationDecisionIssue({ ...pending, status: "approved" }, "revoked"), null);
  assert.match(certificationDecisionIssue(pending, "revoked"), /approuvée/);
});
