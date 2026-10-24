import type { ecosystemMembersTable } from "@workspace/db";
import type { MemberProfile, NetworkMember, PublicMember } from "@workspace/api-zod";
import { visibleLocation } from "@workspace/shared";

type MemberRow = typeof ecosystemMembersTable.$inferSelect;
export type NetworkPresentation = Pick<NetworkMember,
  "enabled" | "founder" | "suspended" | "avatarUrl" | "coverUrl" |
  "followers" | "following" | "followed" | "blocked" | "badges">;

// Projection is not authorization. Callers retain their existing ownership,
// activation, blocking, suspension and public/media eligibility checks.
// This common allowlist contains only today's intentionally shared display
// fields. Future private input must never be added here by default.
function displayFields(row: MemberRow) {
  return {
    id: row.id,
    fullName: row.fullName,
    profession: row.profession,
    organization: row.organization,
    ...visibleLocation(row),
    bio: row.bio,
    offering: row.offering,
    lookingFor: row.lookingFor,
    website: row.website,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    tiktokUrl: row.tiktokUrl,
    linkedinUrl: row.linkedinUrl,
    sectors: [...row.sectors] as PublicMember["sectors"],
    isPublic: row.isPublic,
    profileLayout: row.profileLayout,
    coverPosition: row.coverPosition,
    postsLayout: row.postsLayout,
  };
}

export function projectOwnerProfile(row: MemberRow): MemberProfile {
  return {
    ...displayFields(row),
    country: row.country,
    cityRegion: row.cityRegion ?? "",
    accountType: row.accountType ?? null,
    organizationType: row.organizationType ?? null,
    contactName: row.contactName ?? null,
    mainSector: row.mainSector as MemberProfile["mainSector"] ?? null,
    activeSectors: row.activeSectors ? [...row.activeSectors] as NonNullable<MemberProfile["activeSectors"]> : null,
    locationVisibility: row.locationVisibility ?? "hidden",
    otherProfessionalActivity: row.otherProfessionalActivity ?? null,
    savedItems: [...row.savedItems],
    publicMedia: row.publicMedia,
  };
}

export function projectPublicProfile(row: MemberRow): PublicMember {
  return displayFields(row);
}

// Only previously authorized, already resolved media URLs enter this boundary.
// Never spread a database profile, certification or arbitrary caller object.
function presentationFields(value: NetworkPresentation): NetworkPresentation {
  return {
    enabled: value.enabled,
    founder: value.founder,
    suspended: value.suspended,
    avatarUrl: value.avatarUrl,
    coverUrl: value.coverUrl,
    followers: value.followers,
    following: value.following,
    followed: value.followed,
    blocked: value.blocked,
    badges: value.badges.map(badge => ({
      role: badge.role, program: badge.program, expiresAt: badge.expiresAt,
    })),
  };
}

export function projectNetworkMember(row: MemberRow, value: NetworkPresentation): NetworkMember {
  return { ...displayFields(row), ...presentationFields(value) };
}

// A distinct public entry point prevents future network-only additions from
// silently entering shareable public profiles. No owner projection is reused.
export function projectPublicNetworkProfile(row: MemberRow, value: NetworkPresentation): NetworkMember {
  return { ...projectPublicProfile(row), ...presentationFields(value) };
}
