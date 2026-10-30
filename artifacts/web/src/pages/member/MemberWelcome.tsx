import { Link } from 'wouter';
import { btn } from '@/components/network/kit';
import '@/styles/universe.css';
import MemberIdentityStrip from '@/components/network/MemberIdentityStrip';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { MAX_PROFILE_SECTORS, recommendSectors } from '@/lib/sector-recommendations';
import { missingEssentials } from './Onboarding';
import { useMe } from './ctx';

/** Read-only: shows saved sectors and transparent suggestions; editing happens in the completion form. */
function MySectors() {
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });
  if (q.isLoading) return <div className="mx-3 mb-4 h-28 animate-pulse rounded-2xl bg-sand-100 md:mx-0" aria-hidden="true" />;
  const p = q.data?.profile;
  if (!p) return null;
  const saved = SECTORS.filter((s) => (p.sectors as string[]).includes(s.slug));
  const ideas = recommendSectors(p.profession ?? '', p.sectors as string[], 3);
  const missing = missingEssentials(p);
  return (
    <section aria-labelledby="my-sectors-title" className="mx-3 mb-4 rounded-2xl border border-sand-200 bg-ivory-50 p-5 md:mx-0" data-testid="panel-my-sectors">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="my-sectors-title" className="font-display text-lg text-ink-900">My sectors <span className="font-mono text-xs text-ink-700">{saved.length}/{MAX_PROFILE_SECTORS} maximum</span></h2>
        <Link href="/member/onboarding" className="text-xs font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-edit-sectors">{missing.length ? 'Complete profile' : 'Edit'}</Link>
      </div>
      {saved.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">{saved.map((s) => <li key={s.slug} className="border border-lagoon-900 bg-lagoon-900 px-3 py-1.5 text-xs uppercase tracking-wider text-gold-400" data-testid={`chip-my-sector-${s.slug}`}>{s.name}</li>)}</ul>
      ) : <p className="mt-2 text-sm text-ink-700">No sectors saved yet.</p>}
      {ideas.length > 0 && (
        <div className="mt-4 border-t border-sand-200 pt-3">
          <p className="text-xs text-ink-700">Suggested from your saved profession and sectors. Add any of them in your profile.</p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-3">{ideas.map(({ sector, reason }) => <li key={sector.slug} data-testid={`text-suggested-sector-${sector.slug}`}><span className="font-semibold text-ink-900">{sector.name}</span><span className="block text-xs text-ink-700">{reason}</span></li>)}</ul>
        </div>
      )}
      {missing.length > 0 && <p className="mt-3 text-xs text-ink-700" data-testid="text-missing-essentials">Still to add: {missing.join(', ')}.</p>}
    </section>
  );
}

const ghostDark = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400';

/** Orientation only: no activation, profile writes or inferred preferences. */
export default function MemberWelcome() {
  const { me } = useMe();
  return (
    <>
    <MemberIdentityStrip label="Welcome" />
    <section aria-labelledby="member-welcome-title" className="tomi-welcome mx-3 mb-4 rounded-2xl p-5 sm:p-7 md:mx-0" data-testid="panel-member-welcome">
      <div className="tomi-weave-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <p className="text-eyebrow text-gold-400">WELCOME TO THE ONE MOVEMENT INTERNATIONAL</p>
        <h2 id="member-welcome-title" className="mt-2 font-display text-2xl leading-tight tracking-[0.03em] text-ivory-50 sm:text-3xl">WE ARE ONE.</h2>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-gold-400">I belong. I can connect. I can contribute. I can grow.</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-200">You are now part of a global ecosystem connecting people, opportunities, ideas and industries. Your journey starts here. Introduce yourself, discover members, share your work and grow your network.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {me.enabled ? <Link href="/member#composer" className={btn} data-testid="link-welcome-first-post">CREATE YOUR FIRST POST</Link> : <Link href="/member/onboarding" className={btn} data-testid="link-welcome-profile">Complete my basic profile</Link>}
          <Link href="/member/people" className={ghostDark} data-testid="link-welcome-people">DISCOVER MEMBERS</Link>
          <Link href="/member/invite" className={ghostDark} data-testid="link-welcome-invite">INVITE YOUR NETWORK</Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ivory-200">Required: name, professional identity, country and one primary sector, with a verified email. Free community access is automatic. Photo, biography, company, extra sectors, directory listing and public internet visibility remain optional.</p>
        <p className="mt-3 border-t border-ivory-100/15 pt-3 text-xs leading-relaxed text-ivory-300">Ordinary publishing does not require ten invitations. Official certification is separate from ordinary membership, and paid promotion does not grant official recognition. Ordinary conversations are free, with acceptance and first-contact anti-spam limits. Specialized services, including professional introductions, have separate eligibility requirements.</p>
      </div>
    </section>
    <MySectors />
    </>
  );
}
