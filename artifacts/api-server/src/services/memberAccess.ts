import { missingProfileEssentials, type CompletionProfile } from "@workspace/shared";

export function hasCommunityAccess(profile: CompletionProfile | null | undefined, verified: boolean, restricted: boolean) {
  return verified && !restricted && missingProfileEssentials(profile).length === 0;
}

/** A legacy activation was also consent to the signed-in directory. Capture
 * this before automatic activation; never infer consent from completion. */
export function directoryChoice(profile: { enabled: boolean; directoryVisible?: boolean | null } | undefined) {
  return profile?.directoryVisible ?? profile?.enabled ?? false;
}
