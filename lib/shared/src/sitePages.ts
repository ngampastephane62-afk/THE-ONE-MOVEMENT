import { SECTOR_SLUGS } from "./taxonomy";

/** Editorial public surfaces only: never identity, private member or checkout pages. */
export const SITE_EDITABLE_PAGES = [
  { key: "home", label: "Accueil", path: "/" },
  { key: "vision", label: "Notre vision", path: "/our-vision" },
  { key: "ecosystem", label: "Écosystème", path: "/ecosystem" },
  { key: "programs", label: "Programmes", path: "/programs" },
  { key: "opportunities", label: "Opportunités", path: "/opportunities" },
  { key: "impact", label: "Impact", path: "/impact" },
  { key: "media", label: "Médias", path: "/media" },
  { key: "tropik", label: "Tropik Magazine", path: "/tropik-magazine" },
  { key: "tropik-contribute", label: "Proposer un article Tropik", path: "/tropik-magazine/contribute" },
  { key: "thanks-emirates", label: "Thanks Emirates", path: "/thanks-emirates" },
  { key: "ambassadors", label: "Ambassadeurs et leurs portraits", path: "/ambassadors" },
  { key: "thanks-world", label: "Thanks World", path: "/thanks-world" },
  { key: "thanks-the-world", label: "Thanks the World", path: "/thanks-the-world" },
  { key: "documentary", label: "The One Documentary", path: "/the-one-documentary" },
  { key: "news", label: "Actualités et articles", path: "/news" },
  { key: "partners", label: "Partenaires et leurs pages", path: "/partners" },
  { key: "join", label: "Rejoindre le mouvement", path: "/join" },
  { key: "donate", label: "Contribuer", path: "/donate" },
  { key: "privacy", label: "Confidentialité", path: "/privacy-policy" },
  { key: "terms", label: "Conditions", path: "/terms" },
  ...["diplomatic-gala", "summit", "fashion-week", "awards", "fashion-night", "investment-forum"].map(slug => ({
    key: `program-${slug}`, label: `Programme · ${slug}`, path: `/programs/${slug}`,
  })),
  ...[...SECTOR_SLUGS, "real-estate", "health-care"].map(slug => ({
    key: `sector-${slug}`, label: `Secteur · ${slug}`, path: `/ecosystem/${slug}`,
  })),
];

export function sitePageForPath(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return SITE_EDITABLE_PAGES.find(p => p.path === path)
    ?? SITE_EDITABLE_PAGES.find(p => ["news", "partners", "ambassadors"].includes(p.key) && path.startsWith(`${p.path}/`))
    ?? null;
}
