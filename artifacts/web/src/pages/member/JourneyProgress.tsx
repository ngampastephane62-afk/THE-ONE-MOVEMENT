import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { useGetMemberProfile, getGetMemberProfileQueryKey, useGetNetworkState, getGetNetworkStateQueryKey } from '@workspace/api-client-react';
import { missingProfileEssentials, PROFILE_REQUIREMENTS } from '@workspace/shared';

type Step = { key: string; label: string; detail: string; done: boolean; href?: string; cta?: string };

/** Ordered membership journey derived only from the owner's own cached profile and network state. */
export function useJourney() {
  const profileQ = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });
  const stateQ = useGetNetworkState(undefined, { query: { queryKey: getGetNetworkStateQueryKey() } });
  const profile = profileQ.data?.profile ?? null;
  const missing = missingProfileEssentials(profile);
  const sectorKeys = new Set(['mainSector', 'activeSectors']);
  const coreMissing = missing.filter((k) => !sectorKeys.has(k));
  const sectorMissing = missing.filter((k) => sectorKeys.has(k));
  const activated = !!stateQ.data?.me?.enabled;
  return { profileQ, stateQ, missing, coreMissing, sectorMissing, complete: missing.length === 0, activated };
}

export default function JourneyProgress({ compact = false }: { compact?: boolean }) {
  const j = useJourney();
  if (j.profileQ.isLoading || j.stateQ.isLoading) return <div className="mx-3 mb-4 h-24 animate-pulse rounded-2xl bg-sand-100 md:mx-0" aria-hidden="true" data-testid="skeleton-journey" />;
  if (j.profileQ.isError) return (
    <div className="mx-3 mb-4 rounded-2xl border border-crimson-700/30 bg-ivory-50 p-4 text-sm text-ink-800 md:mx-0" role="alert" data-testid="error-journey">
      Your progress could not be loaded. <button type="button" className="font-semibold text-lagoon-700 underline" onClick={() => j.profileQ.refetch()} data-testid="button-retry-journey">Retry</button>
    </div>
  );
  const label = (ks: string[]) => ks.map((k) => PROFILE_REQUIREMENTS[k as keyof typeof PROFILE_REQUIREMENTS]).join(', ');
  const steps: Step[] = [
    { key: 'account', label: 'Account created', detail: 'Signed in with your own credentials.', done: true },
    { key: 'profile', label: 'Essential profile', detail: j.coreMissing.length ? `Still to add: ${label(j.coreMissing)}.` : 'Account type, name, profession and country saved.', done: !j.coreMissing.length, href: '/member/onboarding', cta: 'Complete profile' },
    { key: 'sectors', label: 'Choose sectors', detail: j.sectorMissing.length ? 'Pick a primary sector and 1 to 3 active sectors.' : 'Primary and active sectors saved.', done: !j.sectorMissing.length, href: '/member/onboarding', cta: 'Choose sectors' },
    { key: 'activate', label: 'Activate the network', detail: j.activated ? 'Visible to signed-in members.' : j.complete ? 'Your explicit choice. Nothing is activated automatically.' : 'Available once your essentials are saved.', done: j.activated },
    { key: 'participate', label: 'Post, follow, invite', detail: j.activated ? 'Open to you now.' : 'Unlocked after activation.', done: j.activated, href: j.activated ? '/member/invite' : undefined, cta: j.activated ? 'Invite' : undefined },
  ];
  const next = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  if (compact && !next) return null;
  return (
    <section aria-labelledby="journey-title" className="mx-3 mb-4 rounded-2xl border border-sand-200 bg-ivory-50 p-4 sm:p-5 md:mx-0 animate-fade-in" data-testid="panel-journey">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="journey-title" className="font-display text-lg text-ink-900">Your membership path</h2>
        <span className="font-mono text-xs text-ink-700" data-testid="text-journey-count">{doneCount}/{steps.length} steps</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-100" aria-hidden="true"><div className="h-full origin-left bg-gold-500 transition-transform duration-500 motion-reduce:transition-none" style={{ transform: `scaleX(${doneCount / steps.length})` }} /></div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {steps.map((s, i) => {
          const current = s === next;
          return (
            <li key={s.key} aria-current={current ? 'step' : undefined} className={`flex gap-3 rounded-xl border p-3 sm:flex-col sm:gap-2 ${current ? 'border-gold-500 bg-gold-400/15' : 'border-sand-200'}`} data-testid={`step-journey-${s.key}`} data-done={s.done}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${s.done ? 'bg-lagoon-900 text-gold-400' : current ? 'bg-gold-500 text-ink-900' : 'border border-sand-300 text-ink-700'}`}>{s.done ? <Check className="h-3.5 w-3.5" aria-label="Done" /> : i + 1}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-900">{s.label}</span>
                <span className="block text-xs leading-snug text-ink-700">{s.detail}</span>
                {current && s.href && s.cta && <Link href={s.href} className="mt-1.5 inline-block text-xs font-semibold text-lagoon-700 underline underline-offset-4" data-testid={`link-journey-${s.key}`}>{s.cta}</Link>}
                {current && s.key === 'activate' && <a href="#panel-activate" className="mt-1.5 inline-block text-xs font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-journey-activate">Review activation</a>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
