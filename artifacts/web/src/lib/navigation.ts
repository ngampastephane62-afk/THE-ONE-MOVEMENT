/**
 * Single source of truth for the top-level navigation structure. Both the
 * nav bar and the router read from this list so pages can never drift out
 * of sync with the routes that exist.
 */
export interface NavItem {
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Our Vision", path: "/our-vision" },
  { label: "Ecosystem", path: "/ecosystem" },
  { label: "Community", path: "/community" },
  { label: "Programs", path: "/programs" },
  { label: "Opportunities", path: "/opportunities" },
  { label: "Impact", path: "/impact" },
  { label: "Media", path: "/media" },
  { label: "Partners", path: "/partners" },
  { label: "Join the Movement", path: "/join" },
  { label: "Sign In", path: "/sign-in" },
];
