import { useAuth } from '@clerk/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVideoEngagement, getGetVideoEngagementQueryKey, updateVideoEngagement,
  getMediaEngagement, updateMediaEngagement, getGetMediaEngagementQueryKey,
  useGetNetworkState, getGetNetworkStateQueryKey,
  type VideoEngagementInput,
} from '@workspace/api-client-react';

export type MediaTarget = { videoId: string; source?: undefined } | { source: string; videoId?: undefined };

/** Root key shared by every instance of the same media, across pages. */
export const mediaRootKey = (t: MediaTarget) => ['media-engagement', t.videoId ? 'video' : 'source', t.videoId ?? t.source] as const;

export function useMediaEngagement(t: MediaTarget) {
  const { userId, isLoaded } = useAuth();
  const qc = useQueryClient();
  const viewer = isLoaded ? (userId ?? 'visitor') : 'pending';
  const key = [...mediaRootKey(t), viewer];

  const q = useQuery({
    queryKey: key,
    enabled: isLoaded,
    refetchInterval: 60000,
    retry: 1,
    queryFn: async () => t.videoId ? getVideoEngagement(t.videoId) : getMediaEngagement({ source: t.source! }),
  });

  const m = useMutation({
    mutationFn: async (data: VideoEngagementInput) => t.videoId ? updateVideoEngagement(t.videoId, data) : updateMediaEngagement(data, { source: t.source! }),
    onSuccess: (fresh) => {
      qc.setQueryData(key, fresh);
      qc.invalidateQueries({ queryKey: mediaRootKey(t), refetchType: 'none' });
      qc.invalidateQueries({ predicate: (qq) => JSON.stringify(qq.queryKey.slice(0, 3)) === JSON.stringify(mediaRootKey(t)) && JSON.stringify(qq.queryKey) !== JSON.stringify(key) });
      if (t.videoId) qc.invalidateQueries({ queryKey: getGetVideoEngagementQueryKey(t.videoId) });
      else qc.invalidateQueries({ queryKey: getGetMediaEngagementQueryKey({ source: t.source! }) });
    },
  });
  // Founder status comes from the server's authorised network state, never a client flag.
  // The server still decides every moderation request.
  const network = useGetNetworkState(undefined, { query: { enabled: isLoaded && !!userId, queryKey: [...getGetNetworkStateQueryKey(), userId], staleTime: 60000 } });
  const founder = !!userId && !!network.data?.me?.founder;
  return { q, m, signedIn: !!userId, isLoaded, founder };
}

export function engagementErrorMessage(err: unknown) {
  const s = (err as { status?: number })?.status;
  if (s === 401) return 'Your session has ended. Sign in again to continue.';
  if (s === 403) return 'Liking and commenting are open to verified, approved members.';
  if (s === 404) return 'This media is not open for reactions yet.';
  if (s === 429) return 'Too many actions in a short time. Wait a moment and try again.';
  return 'That did not go through. Try again.';
}
