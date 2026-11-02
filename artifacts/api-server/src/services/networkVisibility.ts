import type { NetworkPostAuthor } from "@workspace/api-zod";

export type PostVisibility = "community" | "followers" | "sector" | "draft";

export function projectPostAuthor(input: {
  id: number;
  fullName: string;
  profileVisible: boolean;
  profession?: string;
  avatarUrl?: string | null;
  founder?: boolean;
}, forComment = false): NetworkPostAuthor {
  if (!input.profileVisible) {
    return { id: input.id, fullName: forComment ? "Community member" : input.fullName, profileVisible: false };
  }
  return {
    id: input.id,
    fullName: input.fullName,
    profileVisible: true,
    ...(input.profession ? { profession: input.profession } : {}),
    avatarUrl: input.avatarUrl ?? null,
    ...(input.founder ? { founder: true } : {}),
  };
}

export function canViewPost(input: {
  visibility: PostVisibility;
  authorId: number;
  viewerId: number;
  visibilitySector: string | null;
  followsAuthor: boolean;
  activeSectors: readonly string[];
  founder: boolean;
}) {
  if (input.authorId === input.viewerId) return true;
  switch (input.visibility) {
    case "community":
      return true;
    case "followers":
      return input.followsAuthor;
    case "sector":
      return input.founder || (!!input.visibilitySector && input.activeSectors.includes(input.visibilitySector));
    case "draft":
      return false;
  }
}
