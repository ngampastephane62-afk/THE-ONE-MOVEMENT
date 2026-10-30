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
  sectors?: string[] | null;
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

/** Basic membership needs only name, professional identity, country and one
 * valid primary sector. Legacy saved sectors remain valid; no profile reset. */
export function missingProfileEssentials(p: CompletionProfile | null | undefined): MissingProfileField[] {
  if (!p) return ["fullName", "profession", "country", "mainSector"];
  const missing: MissingProfileField[] = [];
  for (const field of ["fullName", "profession", "country"] as const) {
    if ((p[field] ?? "").trim().length < 2) missing.push(field);
  }
  // Legacy programme taxonomy has fifteen slugs; active membership also admits
  // the two additional worlds, as enforced by the existing database constraint.
  const allowed = new Set<string>([...SECTOR_SLUGS, "real-estate", "health-care"]);
  const primary = p.mainSector ?? p.activeSectors?.[0] ?? p.sectors?.[0];
  if (!primary || !allowed.has(primary)) missing.push("mainSector");
  return missing;
}
