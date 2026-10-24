/** Current free-access policy. Raising this ceiling also requires reviewing the
 * existing database constraint; it is not a paid membership tier. */
export const ACTIVE_SECTOR_LIMIT = 3;

type SectorSelection = { mainSector?: string | null; activeSectors?: string[] | null };

export function activeSectorIssue(input: SectorSelection, current?: SectorSelection): string | null {
  if (input.mainSector === undefined && input.activeSectors === undefined) return null;
  const main = input.mainSector === undefined ? current?.mainSector : input.mainSector;
  const active = input.activeSectors === undefined ? current?.activeSectors : input.activeSectors;
  // Null preserves the explicitly supported legacy/unconfigured state.
  if (active == null) return null;
  if (active.length < 1 || active.length > ACTIVE_SECTOR_LIMIT || new Set(active).size !== active.length) {
    return "Choose one to three distinct active sectors.";
  }
  if (!main || !active.includes(main)) return "Your primary sector must be one of your active sectors.";
  return null;
}

export function visibleLocation(row: { country: string; cityRegion?: string | null; locationVisibility?: string }) {
  return {
    country: row.locationVisibility === "country" || row.locationVisibility === "country_city" ? row.country : "",
    cityRegion: row.locationVisibility === "country_city" ? row.cityRegion ?? "" : "",
  };
}
