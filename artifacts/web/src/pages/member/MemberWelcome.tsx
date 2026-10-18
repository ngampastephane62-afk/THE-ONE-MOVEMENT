import { Link } from 'wouter';
import { btn, btnGhost } from '@/components/network/kit';

/** Orientation only: no activation, profile writes or inferred preferences. */
export default function MemberWelcome() {
  return (
    <section aria-labelledby="member-welcome-title" className="mx-3 mb-4 rounded-2xl border border-sand-200 bg-ivory-50 p-4 md:mx-0" data-testid="panel-member-welcome">
      <p className="text-eyebrow text-gold-700">YOUR TOMI UNIVERSE</p>
      <h2 id="member-welcome-title" className="mt-1 font-display text-xl text-ink-900">You belong to a global movement</h2>
      <p className="mt-2 text-sm font-semibold text-lagoon-800">I belong. I can connect. I can contribute. I can grow.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">Your membership is free. Explore people, knowledge and programmes across a global community for peace, unity and humanity. Completing your profile is optional; participating in the network requires your explicit activation.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/member/settings" className={btnGhost} data-testid="link-welcome-profile">Complete my profile (optional)</Link>
        <Link href="/member/settings?tab=workspace" className={btn} data-testid="link-welcome-discovery">Discover programmes & resources</Link>
        <Link href="/member/people" className={btnGhost} data-testid="link-welcome-people">Discover people</Link>
        <Link href="/ecosystem" className={btnGhost} data-testid="link-welcome-sectors">Explore all 17 sectors</Link>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-700">Confirm your display name, add a photo, profession, sectors and a short biography whenever you are ready. You can skip these steps and keep exploring.</p>
      <p className="mt-3 text-xs leading-relaxed text-ink-700">Ordinary publishing does not require ten invitations. Official certification is separate from ordinary membership, and paid promotion does not grant official recognition. Specialized services, including some messaging features, have separate eligibility requirements.</p>
    </section>
  );
}
