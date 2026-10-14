// Commercial terms transcribed from the Founder-provided annual package PDFs.
// Amounts are USD cents. These are package fees, never equity investments.
export const DOCUMENTS = [
  { slug: "membership-kit", title: "Designers, fashion brands & exhibitors · Membership Kit", restricted: false },
  { slug: "partnership-package", title: "Annual partnership & sponsorship · 2026–2027", restricted: false },
  { slug: "investor-deck", title: "Global Investor & Strategic Partnership Forum · Confidential", restricted: true },
];
export const PACKAGE_DEFINITIONS = [
  ...[["silver", "Silver", 2000], ["gold", "Gold", 5000], ["gold-premium", "Gold Premium", 6000], ["diamond", "Diamond", 10000], ["platinum", "Platinum", 20000]].map(([slug, name, price]) =>
    ({ slug: `designer-${slug}`, name: `Designer · ${name}`, amount: Number(price) * 100, audience: "designer", documentSlug: "membership-kit" })),
  ...[["annual-partner", "The One Annual Partner", 10000], ["official-sponsor", "Official Sponsor", 50000], ["gold-sponsor", "Gold Sponsor", 100000], ["platinum-sponsor", "Platinum Strategic Sponsor", 250000], ["global-partner", "The One Global Partner", 500000]].map(([slug, name, price]) =>
    ({ slug: String(slug), name: String(name), amount: Number(price) * 100, audience: String(slug).includes("sponsor") ? "sponsor" : "partner", documentSlug: "partnership-package" })),
];
export const customPackages = [
  { slug: "exhibitor-custom", name: "Exhibitor · tailored annual package", amount: null, audience: "exhibitor", documentSlug: "membership-kit" },
  { slug: "speaker-custom", name: "Speaker · programme-specific agreement", amount: null, audience: "speaker", documentSlug: "partnership-package" },
  { slug: "media-custom", name: "Media partner · programme-specific agreement", amount: null, audience: "media-partner", documentSlug: "partnership-package" },
];
