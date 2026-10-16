export const SOCIAL_PROFILES = [
  { field: "instagramUrl", name: "Instagram", placeholder: "https://www.instagram.com/yourname/", hosts: ["instagram.com", "www.instagram.com"] },
  { field: "facebookUrl", name: "Facebook", placeholder: "https://www.facebook.com/yourname", hosts: ["facebook.com", "www.facebook.com", "m.facebook.com"] },
  { field: "tiktokUrl", name: "TikTok", placeholder: "https://www.tiktok.com/@yourname", hosts: ["tiktok.com", "www.tiktok.com"] },
  { field: "linkedinUrl", name: "LinkedIn", placeholder: "https://www.linkedin.com/in/yourname/", hosts: ["linkedin.com", "www.linkedin.com"] },
] as const;

export type SocialProfileField = typeof SOCIAL_PROFILES[number]["field"];

/** Validate links only. An entered URL never means an OAuth-connected account. */
export function normalizeSocialProfile(field: SocialProfileField, input: string): string {
  const value = input.trim();
  if (!value) return "";
  const spec = SOCIAL_PROFILES.find(s => s.field === field)!;
  const invalid = () => new Error(`Use a complete HTTPS ${spec.name} profile address, or leave it empty.`);
  let url: URL;
  try { url = new URL(value); } catch { throw invalid(); }
  if (value.length > 500 || url.protocol !== "https:" || url.username || url.password || url.port ||
      !(spec.hosts as readonly string[]).includes(url.hostname)) throw invalid();
  const path = url.pathname;
  if (field === "instagramUrl" && (!/^\/[\w.]+\/?$/.test(path) || /^\/(p|reel|reels|stories|explore|accounts|direct|about|developer|legal)\/?$/i.test(path))) throw invalid();
  if (field === "tiktokUrl" && !/^\/@[\w.]+\/?$/.test(path)) throw invalid();
  if (field === "linkedinUrl" && !/^\/(in|company|school|showcase)\/[\w%-]+\/?$/i.test(path)) throw invalid();
  const facebookId = field === "facebookUrl" && path === "/profile.php" ? url.searchParams.get("id") : null;
  if (field === "facebookUrl" && !(facebookId && /^\d+$/.test(facebookId)) &&
      (!/^\/[\w.-]+\/?$/.test(path) || /^\/(login|login.php|sharer.php|share|watch|reel|reels|stories|dialog|l.php|plugins|help|settings)\/?$/i.test(path))) throw invalid();
  url.hash = "";
  url.search = "";
  if (facebookId) url.searchParams.set("id", facebookId);
  return url.toString();
}
