import type { PartnerOrganization, PartnerPageContent } from "@workspace/api-zod";
import { partnerHistory, partnerReferenceCandidates, normalizedOrganization } from "@workspace/shared/partner-directory";

export const PARTNER_TYPE = "partner-directory-organization-v1";
export const PARTNER_CONTENT_TYPE = "partner-directory-content-v1";
export const BASE_REVISION = "baseline";
export const partnerPageDefaults: PartnerPageContent = {
  heroTitle: "OUR GLOBAL NETWORK.",
  heroLineOne: "CONNECTED BY PURPOSE.",
  heroLineTwo: "UNITED BY POSSIBILITY.",
  heroDescription: "Discover the organizations, brands, media and institutions connected to the journey of The One Movement International.",
  directoryTitle: "ORGANIZATIONS, IDENTIFIED.",
  directoryDescription: "Explore the organizations connected to our journey. Each listing identifies its relationship; historical collaboration does not imply a current partnership or endorsement.",
  collaborationTitle: "BECOME PART OF THE MOVEMENT.",
  collaborationSubtitle: "LET'S BUILD SOMETHING MEANINGFUL.",
  partnershipButton: "EXPLORE PARTNERSHIP OPPORTUNITIES",
  conversationButton: "START A CONVERSATION",
  displayNote: "Historical relationships were confirmed by the Founder. Each emblem refers only to the named organization and the stated relationship, not to endorsement of the entire TOMI platform. New listings require verification before publication.",
  updatedAt: BASE_REVISION,
};

const knownNames = new Set(partnerHistory.map((p) => normalizedOrganization(p.name)));
export const partnerCatalog: PartnerOrganization[] = [
  ...partnerHistory.map((p, i): PartnerOrganization => ({
    id: `history-${p.id}`, name: p.name,
    category: ["government", "multilateral", "diplomatic", "culture"].includes(p.category) ? "institutions"
      : ["broadcast", "press"].includes(p.category) ? "media-press" : "corporate-brands",
    relationship: ["broadcast", "press"].includes(p.category) ? "media-relationship" : "historical-collaboration",
    description: p.description ?? "",
    // Some historical source links are explanatory third-party pages, not official sites.
    website: p.id === 42 ? "https://www.instagram.com/re_loved_luxury/" : "",
    logoUploadId: null, legacyLogoId: p.logo === false ? null : p.id,
    logoUrl: p.logo === false ? null : `/api/documentary/media/archive-partner-${String(p.id).padStart(2, "0")}.webp`,
    status: p.logo === false ? "draft" : "published",
    relationshipVerified: true, rightsConfirmed: p.logo !== false,
    priority: i * 10, updatedAt: BASE_REVISION,
  })),
  ...partnerReferenceCandidates
    .filter(([name]) => !knownNames.has(normalizedOrganization(name)))
    .map(([name, category], i): PartnerOrganization => ({
      id: `review-${normalizedOrganization(name)}`, name, category,
      relationship: "historical-collaboration",
      description: "", website: "", logoUploadId: null, legacyLogoId: null, logoUrl: null,
      status: "draft", relationshipVerified: false, rightsConfirmed: false,
      priority: 1000 + i * 10, updatedAt: BASE_REVISION,
    })),
];

export const partnerCategoryOrder = ["institutions", "corporate-brands", "culture-creativity", "media-press"];
export const sortPartners = (a: PartnerOrganization, b: PartnerOrganization) =>
  partnerCategoryOrder.indexOf(a.category) - partnerCategoryOrder.indexOf(b.category)
  || a.priority - b.priority || a.name.localeCompare(b.name);
