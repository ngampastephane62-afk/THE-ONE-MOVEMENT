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
  { label: "Programs", path: "/programs" },
  { label: "Media", path: "/media" },
  { label: "Partners", path: "/partners" },
  { label: "Humanitarian Action", path: "/donate" },
  { label: "Join the Movement", path: "/join" },
];
