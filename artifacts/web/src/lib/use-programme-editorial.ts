import { useGetProgramEditorial, getGetProgramEditorialQueryKey, type ProgramEditorial, type ProgramPerson, type ProgramVideo } from '@workspace/api-client-react';
import { posterFor } from '@/components/editorial/posters';

/**
 * Public programme editorial content (server filters unpublished people/videos).
 * `data` is undefined while loading or on error; callers then use their base copy.
 * When the server responds, its people list is authoritative (even if empty) so an
 * explicitly unpublished person is never restored by a fallback.
 */
export function useProgrammeEditorial(slug: string) {
  const q = useGetProgramEditorial(slug, { query: { queryKey: getGetProgramEditorialQueryKey(slug), staleTime: 60_000, retry: 1 } });
  return { data: q.data as ProgramEditorial | undefined, loading: q.isLoading };
}

/** Non-empty server text, else the fallback. */
export const pick = (server: string | null | undefined, fallback: string) => (server && server.trim() ? server : fallback);

export const byOrder = <T extends { order: number }>(xs: T[]) => [...xs].sort((a, b) => a.order - b.order);

/** Public videos for a person: published, with a server-computed URL. */
export const playable = (vs: ProgramVideo[]) => byOrder(vs.filter((v) => v.published && !!v.url));

/** Portrait URL: uploaded portrait first, then the legacy official poster key. */
export function portraitOf(p: ProgramPerson): { src: string; width?: number; height?: number; source?: string } | null {
  if (p.portraitUrl) return { src: p.portraitUrl };
  const legacy = p.portraitKey ? posterFor(p.portraitKey) : undefined;
  return legacy?.src ? { src: legacy.src, width: legacy.width, height: legacy.height, source: legacy.source } : null;
}

export const publishedPeople = (e: ProgramEditorial | undefined, kind: ProgramPerson['kind']) =>
  byOrder((e?.people ?? []).filter((p) => p.published && p.kind === kind));
