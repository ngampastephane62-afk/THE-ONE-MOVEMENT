/** Dedicated review media must never inherit another publication channel's access. */
export function isCampaignPath(path: string) { return /\/gratitude-(pending|private)\//.test(path); }
export function isReservedMediaPath(path: string) { return isCampaignPath(path) || /\/news-pending\//.test(path); }
