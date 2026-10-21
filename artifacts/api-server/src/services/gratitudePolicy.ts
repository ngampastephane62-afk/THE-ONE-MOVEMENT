import { GRATITUDE_COUNTRIES, GRATITUDE_THEMES } from "@workspace/shared";
import { NetworkError } from "./networkAuth";

export const countries = new Map(GRATITUDE_COUNTRIES.map(c => [c.code, c]));
export const themes = new Set<string>(GRATITUDE_THEMES.map(t => t.id));
export const identityStyles = new Set(["global", "emirates", "africa", "usa", "europe"]);
export { isCampaignPath, isReservedMediaPath } from "./mediaIsolation";
export const pageNumber = (n: unknown) => {
  const value = n === undefined ? 1 : Number(n);
  if (!Number.isInteger(value) || value < 1 || value > 10000) throw new NetworkError(400, "Invalid page.");
  return value;
};
export function positiveId(n: unknown) {
  if (!Number.isSafeInteger(n) || Number(n) < 1) throw new NetworkError(400, "Invalid identifier.");
  return Number(n);
}
export function versionMatch(actual: number, supplied: unknown) {
  if (actual !== supplied) throw new NetworkError(409, "This story changed. Reload its latest version before continuing.");
}
export function validateCountryTheme(country: string | null | undefined, theme: string | null | undefined) {
  if (country != null && !countries.has(country)) throw new NetworkError(400, "Choose a supported country.");
  if (theme != null && !themes.has(theme)) throw new NetworkError(400, "Choose a gratitude theme.");
}
export const rateRules = {
  submit: [[3600, 5]], upload: [[3600, 10]],
  comment: [[600, 10], [86400, 60]], like: [[60, 60]],
  view: [[60, 60]], share_intent: [[60, 60]],
} as const;
