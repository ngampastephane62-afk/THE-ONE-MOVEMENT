import { SECTOR_SLUGS } from "@workspace/shared";
import type { MembershipAccount } from "@workspace/api-zod";

export const FOUNDER_NOTIFICATION_KINDS = ["registration", "email_verified", "profile_complete", "certification", "report", "request", "service_reply"] as const;
export function publishedPostCount(posts: { hidden: boolean; visibility: string }[]) {
  // Authorized aggregate only; this never exposes follower-only post content.
  return posts.filter(p => !p.hidden && ["community", "sector", "followers"].includes(p.visibility)).length;
}
export function commandTotals(accounts: MembershipAccount[], now = Date.now()) {
  return {
    accounts: accounts.length,
    verified: accounts.filter(a => a.emailVerified).length,
    unverified: accounts.filter(a => !a.emailVerified).length,
    noProfile: accounts.filter(a => a.profileStatus === "no_profile").length,
    incomplete: accounts.filter(a => a.profileStatus === "incomplete").length,
    complete: accounts.filter(a => a.profileStatus === "complete").length,
    active: accounts.filter(a => !a.suspended && a.lastSignInAt && Date.parse(a.lastSignInAt) >= now - 30 * 86400000).length,
    discoverable: accounts.filter(a => a.networkEnabled && !a.suspended).length,
    newMembers: accounts.filter(a => Date.parse(a.createdAt) >= now - 7 * 86400000).length,
    suspended: accounts.filter(a => a.suspended).length,
  };
}
export function registrationEvents(account: MembershipAccount, previous: { verified: boolean; complete: boolean } | undefined, baseline: Date) {
  const recent = Date.parse(account.createdAt) >= baseline.getTime();
  const complete = account.profileStatus === "complete";
  return [
    ...(!previous && recent ? ["registration"] : []),
    ...(account.emailVerified && (previous ? !previous.verified : recent) ? ["email_verified"] : []),
    ...(complete && (previous ? !previous.complete : recent) ? ["profile_complete"] : []),
  ];
}
export function certificationDecisionIssue(application: { role: string; status: string; agreementConfirmed: boolean; paymentConfirmed: boolean }, decision: string) {
  if (!["approved", "rejected", "revoked"].includes(decision)) return "Décision invalide.";
  // Only established programme certifications, never login/security privileges.
  if (!["business", "partner", "sponsor", "media-partner", "official-model", "exhibitor", "speaker", "designer", "investor"].includes(application.role))
    return "Ce rôle ne peut pas être attribué par une certification.";
  if (decision === "revoked" && application.status !== "approved") return "Seule une certification approuvée peut être révoquée.";
  if (decision !== "revoked" && application.status !== "pending") return "Cette demande a déjà été traitée. Actualisez la fiche.";
  if (decision === "approved" && ["partner", "sponsor", "designer", "exhibitor"].includes(application.role)
    && (!application.agreementConfirmed || !application.paymentConfirmed))
    return "Les validations contractuelles et commerciales existantes doivent être confirmées dans le parcours officiel.";
  return null;
}
// The original enquiry taxonomy has fifteen entries. The authorized world
// catalogue additionally contains real estate and health care.
export const ADMIN_SECTORS = [...SECTOR_SLUGS, "real-estate", "health-care"] as const;
