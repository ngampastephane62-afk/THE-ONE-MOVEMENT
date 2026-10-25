import { Link } from 'wouter';
import { Lock } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { missingProfileEssentials, PROFILE_REQUIREMENTS, type MissingProfileField } from '@workspace/shared';

/** Single source for participation readiness: the owner's own saved profile checked by the shared rule.
 * `locked` is true while loading, on error, or when essentials are missing, so no gated mutation fires early. */
export function useProfileReadiness() {
  const { isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && !!isSignedIn;
  const q = useGetMemberProfile({ query: { enabled, queryKey: getGetMemberProfileQueryKey() } });
  const missing: MissingProfileField[] = q.data ? missingProfileEssentials(q.data.profile ?? null) : [];
  const complete = enabled && !!q.data && missing.length === 0;
  return { query: q, loading: enabled && q.isLoading, error: q.isError, missing, complete, locked: !complete };
}

export const missingLabel = (m: MissingProfileField[]) => m.map((k) => PROFILE_REQUIREMENTS[k]).join(', ');

/** Inline (non-blocking) explanation shown in place of or beside a locked control. */
export function ReadinessLock({ action, className = '' }: { action: string; className?: string }) {
  const r = useProfileReadiness();
  if (r.complete) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-sand-200 bg-ivory-100 px-3 py-2 text-xs text-ink-800 ${className}`} role="note" data-testid="note-readiness-lock">
      <Lock className="h-3.5 w-3.5 shrink-0 text-gold-700" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        {r.loading ? `Checking your profile before you can ${action}.`
          : r.error ? <>Your profile could not be checked, so you cannot {action} yet. <button type="button" className="font-semibold underline" onClick={() => r.query.refetch()} data-testid="button-retry-readiness">Retry</button></>
          : <>To {action}, complete your essential profile{r.missing.length ? ` (${missingLabel(r.missing)})` : ''}.</>}
      </span>
      {!r.loading && !r.error && <Link href="/member/onboarding" className="font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-readiness-complete-profile">Complete profile</Link>}
    </div>
  );
}
