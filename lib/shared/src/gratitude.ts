/** Country/theme choices describe gratitude, never verified nationality. */
import countrySnapshot from "./gratitude-countries.json";
export const GRATITUDE_COUNTRIES = countrySnapshot.map(c => ({
  code: c.code, name: c.name, region: c.subregion || c.region,
  continent: c.region === "Antarctic" ? "Antarctica" : c.region,
}));
export const GRATITUDE_THEMES = [
  { id: "country", label: "MY COUNTRY" },
  { id: "community", label: "MY COMMUNITY" },
  { id: "culture", label: "MY CULTURE" },
  { id: "inspiration", label: "PEOPLE WHO INSPIRED ME" },
  { id: "peace-unity", label: "PEACE & UNITY" },
  { id: "positive-leadership", label: "POSITIVE LEADERSHIP" },
  { id: "humanitarian-action", label: "HUMANITARIAN ACTION" },
  { id: "journey", label: "MY JOURNEY" },
] as const;
export const GRATITUDE_CONSENT_VERSION = "gratitude-public-v1";
export const GRATITUDE_LIMITS = { videoBytes: 100 * 1024 * 1024, imageBytes: 10 * 1024 * 1024, durationMs: 180000 } as const;
