import { Link, useLocation } from 'wouter';
import { useUser } from '@clerk/react';
import { useGetMemberProfile, getGetMemberProfileQueryKey, type MemberProfile } from '@workspace/api-client-react';
import { ErrorBox, Skeleton } from '@/components/network/kit';
import ProfileForm from './ProfileForm';

/** Same rule the onboarding form enforces, derived only from existing saved fields. */
export function missingEssentials(p: Pick<MemberProfile, 'fullName' | 'profession' | 'country' | 'sectors'> | null | undefined) {
  if (!p) return ['display name', 'profession', 'country', 'sectors'];
  const m: string[] = [];
  if ((p.fullName ?? '').trim().length < 2) m.push('display name');
  if ((p.profession ?? '').trim().length < 2) m.push('profession');
  if ((p.country ?? '').trim().length < 2) m.push('country');
  if (!(p.sectors?.length)) m.push('sectors');
  return m;
}

/** Optional completion view for existing members; never creates a second account. */
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
            ? 'Your essentials are complete. You can refine them at any time; your saved details are kept exactly as they are.'
            : `Still to add: ${missing.join(', ')}. Your existing details are already filled in below.`}
        </p>
      </header>
      {q.isLoading ? <Skeleton rows={4} />
        : q.isError ? <ErrorBox onRetry={() => q.refetch()} msg="Your profile could not be loaded." />
        : <ProfileForm onboarding initial={profile} defaultName={user?.fullName ?? ''} onDone={(newer) => { if (!newer) navigate('/member'); }} onCancel={() => navigate('/member')} />}
      <p className="text-xs text-ink-700">Prefer to explore first? <Link href="/ecosystem" className="font-semibold text-lagoon-700 underline">Browse all 17 sectors</Link>.</p>
    </section>
  );
}
