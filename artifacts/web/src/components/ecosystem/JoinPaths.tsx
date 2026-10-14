import { Link } from 'wouter';

export default function JoinPaths() {
  return (
    <section className="eco-hero py-section-md" aria-labelledby="paths-title">
      <div className="mx-auto max-w-7xl px-6">
        <h2 id="paths-title" className="text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>TWO WAYS IN</h2>
        <div className="mt-8 grid gap-px bg-gold-500/25 md:grid-cols-[1.3fr_1fr]">
          <div className="bg-lagoon-900 p-8">
            <p className="text-eyebrow text-gold-400">INDIVIDUALS</p>
            <h3 className="mt-3 font-display text-xl text-ivory-100">Create your member space</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory-200">A free private workspace: choose your sectors, get programme and resource suggestions, save what matters, and decide whether to appear in the public directory. An account does not guarantee programme places or opportunities.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-up" data-testid="link-paths-signup" className="bg-gold-500 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Create account</Link>
              <Link href="/sign-in" data-testid="link-paths-signin" className="border border-ivory-100/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:border-ivory-100/70">Sign in</Link>
            </div>
          </div>
          <div className="bg-lagoon-800 p-8">
            <p className="text-eyebrow text-gold-400">INSTITUTIONS & BUSINESSES</p>
            <h3 className="mt-3 font-display text-xl text-ivory-100">Send an enquiry</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory-200">Embassies, NGOs, companies, universities and media organizations talk to the team directly through the enquiry pathway.</p>
            <Link href="/join" data-testid="link-paths-join" className="mt-6 inline-block border border-gold-500/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10">Go to enquiries</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
