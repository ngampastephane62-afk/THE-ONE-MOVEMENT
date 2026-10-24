type PublicationIdentity = {
  status: string; publisher: string; externalUrl: string; title: string;
  publicationDate: string; description: string; coverUrl: string | null;
  embed?: { provider: string; videoId: string } | null;
};

/** Ignore tracking only: query parameters may identify completely different articles. */
export function articleIdentityUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    for (const key of [...u.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ["fbclid", "gclid"].includes(key.toLowerCase())) u.searchParams.delete(key);
    }
    u.searchParams.sort();
    return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}${u.search}`;
  } catch { return null; }
}

/** Hide exact display clones only, not different screenshots, dates or coverage.
 * Persistent records and their engagement remain untouched.
 */
export function uniquePublishedMedia<T extends PublicationIdentity>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    if (p.status !== "published") return false;
    const url = articleIdentityUrl(p.externalUrl);
    const publisher = p.publisher.trim().toLocaleLowerCase();
    if (!url || !publisher) return true;
    const key = JSON.stringify([
      publisher, url, p.title.trim(), p.publicationDate, p.description.trim(),
      p.coverUrl, p.embed?.provider ?? null, p.embed?.videoId ?? null,
    ]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
