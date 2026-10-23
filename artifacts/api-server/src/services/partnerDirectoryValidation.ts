import {
  CreatePartnerOrganizationBody, UpdatePartnerPageContentBody,
  type PartnerOrganizationSave, type PartnerPageContentSave,
} from "@workspace/api-zod";
import { NetworkError } from "./networkAuth";
import { normalizedOrganization } from "@workspace/shared/partner-directory";

export { normalizedOrganization };
export function partnerWebsite(value: string) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password && u.hostname.includes(".");
  } catch { return false; }
}
export function partnerInput(raw: unknown): PartnerOrganizationSave {
  // Generated allOf uses intersections; validate unknown fields explicitly.
  const fields = ["name", "category", "relationship", "description", "website", "logoUploadId", "legacyLogoId", "status", "relationshipVerified", "rightsConfirmed", "priority", "expectedUpdatedAt"];
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || Object.keys(raw).some((k) => !fields.includes(k))) throw new NetworkError(400, "Choose valid organization fields.");
  const parsed = CreatePartnerOrganizationBody.safeParse(raw);
  if (!parsed.success) throw new NetworkError(400, "Complete the organization name, category and relationship correctly.");
  const p = parsed.data;
  p.name = p.name.trim(); p.description = p.description.trim(); p.website = p.website.trim();
  const key = normalizedOrganization(p.name);
  if (p.name.length < 2 || key.length < 2 || ["banking", "bank"].includes(key)) throw new NetworkError(400, "Enter an identifiable organization name, not the Banking placeholder.");
  if (!partnerWebsite(p.website)) throw new NetworkError(400, "Use an official http:// or https:// website without credentials.");
  if (p.status === "published" && (!p.relationshipVerified || !p.rightsConfirmed || !(p.logoUploadId || p.legacyLogoId))) throw new NetworkError(400, "Publishing requires an approved logo, verified relationship and logo rights confirmation.");
  if (p.logoUploadId && !p.rightsConfirmed) throw new NetworkError(400, "Confirm logo rights before saving an uploaded image.");
  return p;
}
export function partnerContentInput(raw: unknown): PartnerPageContentSave {
  const parsed = UpdatePartnerPageContentBody.safeParse(raw);
  if (!parsed.success) throw new NetworkError(400, "Complete the page text within the displayed limits.");
  const p = parsed.data;
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || Object.keys(raw).some(k => !Object.hasOwn(p, k))) throw new NetworkError(400, "Choose valid page text fields.");
  for (const key of Object.keys(p) as (keyof typeof p)[]) {
    p[key] = p[key].trim();
    if (p[key].length < 2) throw new NetworkError(400, "Page text cannot be blank.");
  }
  return p;
}
