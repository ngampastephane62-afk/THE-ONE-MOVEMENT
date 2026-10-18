import { Link } from 'wouter';
import { btn } from '@/components/network/kit';
import '@/styles/universe.css';

const ghostDark = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-ivory-100/30 px-4 py-2 text-xs font-semibold text-ivory-100 hover:border-gold-400 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400';

/** Orientation only: no activation, profile writes or inferred preferences. */
export default function MemberWelcome() {
  return (
    <section aria-labelledby="member-welcome-title" className="tomi-welcome mx-3 mb-4 rounded-2xl p-5 sm:p-7 md:mx-0" data-testid="panel-member-welcome">
      <div className="tomi-weave-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <p className="text-eyebrow text-gold-400">YOUR TOMI UNIVERSE</p>
        <h2 id="member-welcome-title" className="mt-2 font-display text-2xl leading-tight tracking-[0.03em] text-ivory-50 sm:text-3xl">You belong to a global movement</h2>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-gold-400">I belong. I can connect. I can contribute. I can grow.</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ivory-200">Your membership is free. Explore people, knowledge and programmes across a global community for peace, unity and humanity. Completing your profile is optional; participating in the network requires your explicit activation.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/member/settings" className={ghostDark} data-testid="link-welcome-profile">Complete my profile (optional)</Link>
          <Link href="/member/settings?tab=workspace" className={btn} data-testid="link-welcome-discovery">Discover programmes & resources</Link>
          <Link href="/member/people" className={ghostDark} data-testid="link-welcome-people">Discover people</Link>
          <Link href="/ecosystem" className={ghostDark} data-testid="link-welcome-sectors">Explore all 17 sectors</Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ivory-200">Confirm your display name, add a photo, profession, sectors and a short biography whenever you are ready. You can skip these steps and keep exploring.</p>
        <p className="mt-3 border-t border-ivory-100/15 pt-3 text-xs leading-relaxed text-ivory-300">Ordinary publishing does not require ten invitations. Official certification is separate from ordinary membership, and paid promotion does not grant official recognition. Ordinary conversations are free, with acceptance and first-contact anti-spam limits. Specialized services, including professional introductions, have separate eligibility requirements.</p>
      </div>
    </section>
  );
}
