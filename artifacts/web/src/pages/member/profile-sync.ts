import type { QueryClient } from '@tanstack/react-query';
import {
  getGetMemberProfileQueryKey, getGetEcosystemMembersQueryKey,
  getGetPublicNetworkProfileQueryKey,
  type MemberProfile, type MemberProfileInput, type NetworkState,
} from '@workspace/api-client-react';
import { appearanceOf } from '@/components/network/ProfileHero';
import { STATE_PREFIX } from '@/components/network/kit';
import { visibleLocation } from '@workspace/shared';

/** Only editable fields: never copy identity, media or activation into a draft. */
export function profileInput(profile: MemberProfile | null, defaultName = ''): MemberProfileInput {
  const ap = appearanceOf(profile);
  return {
    fullName: profile?.fullName ?? defaultName,
    profession: profile?.profession ?? '', organization: profile?.organization ?? '',
    country: profile?.country ?? '', bio: profile?.bio ?? '',
    accountType: profile?.accountType ?? null,
    cityRegion: profile?.cityRegion ?? '',
    organizationType: profile?.organizationType ?? '',
    contactName: profile?.contactName ?? '',
    mainSector: profile?.mainSector ?? null,
    activeSectors: profile?.activeSectors ? [...profile.activeSectors] : null,
    locationVisibility: profile?.locationVisibility ?? 'hidden',
    otherProfessionalActivity: profile?.otherProfessionalActivity ?? '',
    offering: profile?.offering ?? '', lookingFor: profile?.lookingFor ?? '',
    website: profile?.website ?? '', instagramUrl: profile?.instagramUrl ?? '',
    facebookUrl: profile?.facebookUrl ?? '', tiktokUrl: profile?.tiktokUrl ?? '',
    linkedinUrl: profile?.linkedinUrl ?? '', sectors: [...(profile?.sectors ?? [])],
    isPublic: profile?.isPublic ?? false, publicMedia: profile?.publicMedia ?? false,
    profileLayout: ap.layout, coverPosition: ap.pos, postsLayout: ap.posts,
  };
}

/** Accept normalization only for fields not edited since the request snapshot. */
export function reconcileProfile(
  current: MemberProfileInput, submitted: MemberProfileInput, confirmed: MemberProfileInput,
): MemberProfileInput {
  const next = { ...confirmed };
  for (const key of Object.keys(confirmed) as (keyof MemberProfileInput)[]) {
    if (JSON.stringify(current[key]) !== JSON.stringify(submitted[key])) {
      Object.assign(next, { [key]: current[key] });
    }
  }
  // A newer decision to hide the page must not re-enable its public media.
  if (!next.isPublic) next.publicMedia = false;
  return next;
}

export async function synchronizeProfile(qc: QueryClient, profile: MemberProfile) {
  const keys = [
    getGetMemberProfileQueryKey(), STATE_PREFIX, getGetEcosystemMembersQueryKey(),
    getGetPublicNetworkProfileQueryKey(profile.id),
  ];
  // Older in-flight reads must not replace the newly confirmed response.
  await Promise.all(keys.map(queryKey => qc.cancelQueries({ queryKey })));
  qc.setQueryData(getGetMemberProfileQueryKey(), { profile });
  const fields = profileInput(profile);
  qc.setQueriesData<NetworkState>({ queryKey: STATE_PREFIX }, (state) => {
    if (!state) return state;
    // Patch only the owner's view. Lists/public representations retain their
    // own server-side visibility rules and are refetched instead.
    return { ...state, me: state.me?.id === profile.id ? {
      ...state.me,
      // Explicit network-cache allowlist, independent of future owner inputs.
      fullName: fields.fullName, profession: fields.profession,
      organization: fields.organization, ...visibleLocation(fields), bio: fields.bio,
      offering: fields.offering, lookingFor: fields.lookingFor, website: fields.website,
      instagramUrl: fields.instagramUrl, facebookUrl: fields.facebookUrl,
      tiktokUrl: fields.tiktokUrl, linkedinUrl: fields.linkedinUrl,
      sectors: fields.sectors, isPublic: fields.isPublic,
      // Preserve the existing owner-only `me` cache behavior, not public data.
      publicMedia: fields.publicMedia,
      profileLayout: fields.profileLayout, coverPosition: fields.coverPosition,
      postsLayout: fields.postsLayout,
    } : state.me };
  });
  for (const queryKey of keys.slice(1)) void qc.invalidateQueries({ queryKey });
}
