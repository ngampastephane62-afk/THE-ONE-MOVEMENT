import { Link } from 'wouter';
import { useAuth } from '@clerk/react';

const btn = 'inline-flex min-h-[44px] items-center px-5 py-3 text-xs font-semibold uppercase tracking-wider';

export default function JoinPaths() {
  const { isLoaded, isSignedIn } = useAuth();
  const member = isLoaded && isSignedIn;
  return (
    <section className="eco-hero py-section-md" aria-labelledby="paths-title">
      <div className="mx-auto max-w-7xl px-6">
        <h2 id="paths-title" className="text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>{member ? 'YOU ARE ALREADY IN' : 'ONE IDENTITY, TWO WAYS IN'}</h2>
        <div className="mt-8 grid gap-px bg-gold-500/25 md:grid-cols-[1.3fr_1fr]">
          <div className="bg-lagoon-900 p-8">
            <p className="text-eyebrow text-gold-400">INDIVIDUALS & ORGANIZATIONS</p>
            {member ? (
              <>
                <h3 className="mt-3 font-display text-xl text-ivory-100" data-testid="text-paths-member">Welcome back to your member space</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-200">You already have a TOMI identity. Manage your sectors of interest, directory visibility and saved items from My Space. No new account is needed.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/member" data-testid="link-paths-myspace" className={`${btn} bg-gold-500 text-ink-900 hover:bg-gold-400`}>Go to My Space</Link>
                  <Link href="/member/ecosystem" data-testid="link-paths-profile" className={`${btn} border border-ivory-100/30 text-ivory-100 hover:border-ivory-100/70`}>Manage my sectors &amp; profile</Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="mt-3 font-display text-xl text-ivory-100">Create your member space</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-200">A free private workspace for people and organizations alike: choose your sectors of interest, get programme and resource suggestions, save what matters, and decide whether to appear in the public directory. An account does not guarantee programme places or opportunities.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/sign-up" data-testid="link-paths-signup" className={`${btn} bg-gold-500 text-ink-900 hover:bg-gold-400`}>Create account</Link>
                  <Link href="/sign-in" data-testid="link-paths-signin" className={`${btn} border border-ivory-100/30 text-ivory-100 hover:border-ivory-100/70`}>Sign in</Link>
                </div>
              </>
            )}
            <p className="mt-6 border-l border-gold-500/40 pl-3 text-xs leading-relaxed text-ivory-300" data-testid="text-paths-policy">Access is free. Our new policy is one identity per member with up to three active sectors; that limit is not yet enforced, and the sectors you pick today are saved as general interests.</p>
          </div>
          <div className="bg-lagoon-800 p-8">
            <p className="text-eyebrow text-gold-400">PARTNERSHIPS · OPTIONAL</p>
            <h3 className="mt-3 font-display text-xl text-ivory-100">Send an enquiry</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory-200">Organizations join with the same member identity. Use the enquiry pathway only when you want to discuss an actual partnership, sponsorship, institutional or media collaboration with the team.</p>
            <Link href="/join" data-testid="link-paths-join" className={`${btn} mt-6 border border-gold-500/60 text-gold-400 hover:bg-gold-500/10`}>Go to enquiries</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
