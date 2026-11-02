import { Link, useLocation } from 'wouter';
import { useUser } from '@clerk/react';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { missingProfileEssentials, PROFILE_REQUIREMENTS, type CompletionProfile } from '@workspace/shared';
import JourneyProgress from './JourneyProgress';
import { ErrorBox, Skeleton } from '@/components/network/kit';
import ProfileForm from './ProfileForm';

/** Human labels for the shared completion rule (same function the server enforces). */
export function missingEssentials(p: CompletionProfile | null | undefined): string[] {
  return missingProfileEssentials(p).map((k) => PROFILE_REQUIREMENTS[k]);
}

/** Essential profile completion. Saving never activates the network or public listing. */
export default function MemberOnboarding() {
  const { user } = useUser();
  const [, navigate] = useLocation();
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });
  const profile = q.data?.profile ?? null;
  const missing = missingEssentials(profile);
  return (
    <section className="flex flex-col gap-6 px-3 pt-4 md:px-0 md:pt-0" aria-labelledby="onboarding-title" data-testid="page-member-onboarding">
      <header className="border-b border-sand-200 pb-5">
        <p className="text-eyebrow text-gold-700">YOUR MEMBERSHIP</p>
        <h1 id="onboarding-title" className="mt-2 font-display text-2xl text-ink-900 sm:text-3xl">Complete your profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">
          {q.isLoading ? 'Loading your saved details.' : missing.length === 0
            ? 'Your profile details are complete. Saving here does not list you in People or in the public directory; those visibility choices are separate.'
            : `Still to add: ${missing.join(', ')}. Your existing details are already filled in below.`}
        </p>
      </header>
      <JourneyProgress />
      {q.isLoading ? <Skeleton rows={4} />
        : q.isError ? <ErrorBox onRetry={() => q.refetch()} msg="Your profile could not be loaded." />
        : <ProfileForm onboarding initial={profile} defaultName={user?.fullName ?? ''} onDone={(newer) => { if (!newer) navigate('/member'); }} onCancel={() => navigate('/member')} />}
      <p className="text-xs text-ink-700">Prefer to explore first? <Link href="/ecosystem" className="font-semibold text-lagoon-700 underline">Browse all 17 sectors</Link>.</p>
    </section>
  );
}
