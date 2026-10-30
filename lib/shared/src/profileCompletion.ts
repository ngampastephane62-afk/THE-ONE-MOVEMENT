import { ACTIVE_SECTOR_LIMIT } from "./memberProfilePolicy";
import { SECTOR_SLUGS } from "./taxonomy";

export type CompletionProfile = {
  accountType?: string | null;
  fullName?: string | null;
  profession?: string | null;
  country?: string | null;
  organizationType?: string | null;
  contactName?: string | null;
  mainSector?: string | null;
  activeSectors?: string[] | null;
};

export const PROFILE_REQUIREMENTS = {
  accountType: "account type",
  fullName: "display name",
  profession: "profession",
  country: "country",
  organizationType: "organization type",
  contactName: "contact person",
  mainSector: "primary sector",
  activeSectors: "active sectors",
} as const;
export type MissingProfileField = keyof typeof PROFILE_REQUIREMENTS;

/** Essential setup only: no photo, biography, social account, payment or public
 * listing is required. Completion never implies consent to network activation. */
export function missingProfileEssentials(p: CompletionProfile | null | undefined): MissingProfileField[] {
  if (!p) return ["accountType", "fullName", "profession", "country", "mainSector", "activeSectors"];
  const missing: MissingProfileField[] = [];
  if (p.accountType !== "individual" && p.accountType !== "organization") missing.push("accountType");
  for (const field of ["fullName", "profession", "country"] as const) {
    if ((p[field] ?? "").trim().length < 2) missing.push(field);
  }
  if (p.accountType === "organization") {
    if (!(p.organizationType ?? "").trim()) missing.push("organizationType");
    if ((p.contactName ?? "").trim().length < 2) missing.push("contactName");
  }
  // Legacy programme taxonomy has fifteen slugs; active membership also admits
  // the two additional worlds, as enforced by the existing database constraint.
  const allowed = new Set<string>([...SECTOR_SLUGS, "real-estate", "health-care"]);
  if (!p.mainSector || !allowed.has(p.mainSector)) missing.push("mainSector");
  const active = p.activeSectors ?? [];
  if (active.length < 1 || active.length > ACTIVE_SECTOR_LIMIT ||
    new Set(active).size !== active.length || active.some(s => !allowed.has(s)) ||
    !p.mainSector || !active.includes(p.mainSector)) missing.push("activeSectors");
  return missing;
}
