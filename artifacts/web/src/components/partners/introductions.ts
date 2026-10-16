import { PARTNER_LEADERSHIP, PARTNER_INTRODUCTION_TARGETS, type PartnerLeader } from '@workspace/shared';
import { createPartnerIntroduction, getPartnerIntroductions, updatePartnerIntroduction } from '@workspace/api-client-react';
import { useAuth } from '@clerk/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** Verified public leadership. Source links are attribution only, never contact routes. */
export type { PartnerLeader };
export const leaderFor = (id: number): PartnerLeader | undefined => PARTNER_LEADERSHIP[id];

/** If the target list is published, only listed ids may be requested. */
export const isIntroTarget = (id: number) => {
  return PARTNER_INTRODUCTION_TARGETS.some((t) => t.id === id);
};

export type IntroStatus = 'new' | 'reviewing' | 'replied' | 'closed';
export type IntroductionInput = {
  partnerId: number; contactName: string; organizationName: string; country: string;
  email: string; message: string; consentAccepted: boolean; website?: string;
};
export type PartnerIntroduction = {
  id: number; partnerId: number; partnerName: string; leaderName: string | null; leaderRole: string | null;
  contactName: string; email: string; organizationName: string; country: string; message: string;
  status: IntroStatus; createdAt: string;
};

export class IntroError extends Error { constructor(public status: number, msg: string) { super(msg); } }

function introError(error: unknown): never {
  const e = error as { status?: number; message?: string };
  throw new IntroError(e?.status ?? 0, e?.message ?? 'Request unavailable.');
}

export const INTRO_KEY = ['partner-introductions'] as const;

export function useCreatePartnerIntroduction() {
  return useMutation({
    mutationFn: (data: IntroductionInput) =>
      createPartnerIntroduction(data).catch(introError),
  });
}

export function useGetPartnerIntroductions() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  return useQuery({ queryKey: [...INTRO_KEY, userId], queryFn: () => getPartnerIntroductions().catch(introError), enabled: isLoaded && !!isSignedIn });
}

export function useUpdatePartnerIntroduction() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: IntroStatus }) =>
      updatePartnerIntroduction(id, { status }).catch(introError),
    onSuccess: (row) => qc.setQueryData<PartnerIntroduction[]>([...INTRO_KEY, userId], (old) => old?.map((r) => (r.id === row.id ? row : r))),
  });
}
