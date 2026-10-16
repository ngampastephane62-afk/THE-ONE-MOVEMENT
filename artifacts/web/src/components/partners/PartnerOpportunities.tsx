import { Link } from 'wouter';
import { useEffect, useRef } from 'react';
import { ArrowRight, FileText, Landmark, Megaphone } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';

const ctaPrimary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius)] bg-gold-500 px-6 py-3 text-sm font-semibold tracking-wide text-ink-900 transition-colors duration-200 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900';
const ctaSecondary =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius)] border border-gold-500/70 px-6 py-3 text-sm font-semibold tracking-wide text-gold-400 transition-colors duration-200 hover:bg-gold-500/10 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900';

const partnerAreas = [
  'Visibility across Movement programmes',
  'Outdoor marketing',
  'Editorial and media collaboration',
  'Programme collaboration',
];

export default function PartnerOpportunities() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // Single owner of Partners-page commercial hashes (opportunities + reader) to avoid competing scrolls.
    const id = window.location.hash.slice(1);
    if (!['partnership-opportunities', 'investment-presentation', 'annual-partnership'].includes(id)) return;
    const timer = window.setTimeout(() => {
      const el = id === 'partnership-opportunities' ? sectionRef.current : document.getElementById(id);
      el?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <section
      ref={sectionRef}
      id="partnership-opportunities"
      className="scroll-mt-24 py-section-lg bg-lagoon-900 text-ivory-100"
      aria-labelledby="opportunities-heading"
      data-testid="section-partner-opportunities"
    >
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div id="opportunities-heading">
            <SectionHeading eyebrow="TWO PATHS" heading="INVEST OR PARTNER WITH US" surface="dark" thread />
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200">
            Investment and partnership are separate conversations. Choose the path that matches your intent.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* INVESTOR */}
          <Reveal>
            <article
              className="flex h-full flex-col border border-lagoon-700 bg-lagoon-800 p-7 sm:p-10 transition-colors duration-300 hover:border-gold-500/60"
              data-testid="card-investor-path"
            >
              <Landmark className="h-6 w-6 text-gold-400" aria-hidden="true" />
              <p className="mt-6 text-eyebrow text-gold-400">BECOME AN INVESTOR</p>
              <h3 className="mt-3 font-display text-2xl leading-tight text-ivory-100 sm:text-3xl">
                Invest in The One Movement Multinational
              </h3>
              <p className="mt-5 leading-relaxed text-ivory-200">
                For investors interested in the long-term development of the Movement. Every investment conversation starts
                with a direct enquiry and is reviewed individually.
              </p>

              <div
                className="mt-7 border-l-2 border-gold-500/60 bg-lagoon-900/60 px-4 py-4"
                data-testid="text-investment-context"
              >
                <p className="text-sm leading-relaxed text-ivory-200">
                  The Founder's presentation sets out a stated capital requirement of USD 4 million to launch and position the
                  platform. This is a funding need, not a valuation and not funds already raised; allocation by category is still
                  to be defined. Revenue figures for 2026–2028 are projections, not achieved results.
                </p>
                <a
                  href="#investment-presentation"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold-400 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  data-testid="link-read-investment-presentation"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" /> Read the public investment presentation
                </a>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-ivory-300">
                Investments carry risk. No return is guaranteed, and nothing on this page is an offer of securities.
              </p>

              <div className="mt-auto pt-8">
                <Link href="/join?intent=investment#institutional-inquiry" className={ctaPrimary} data-testid="link-investor-inquiry">
                  Start an investment enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* PARTNER */}
          <Reveal delay={120}>
            <article
              className="flex h-full flex-col border border-lagoon-700 bg-lagoon-800 p-7 sm:p-10 transition-colors duration-300 hover:border-gold-500/60"
              data-testid="card-partner-path"
            >
              <Megaphone className="h-6 w-6 text-gold-400" aria-hidden="true" />
              <p className="mt-6 text-eyebrow text-gold-400">BECOME A PARTNER</p>
              <h3 className="mt-3 font-display text-2xl leading-tight text-ivory-100 sm:text-3xl">
                Partner with the Movement
              </h3>
              <ul className="mt-5">
                {partnerAreas.map((a) => (
                  <li key={a} className="border-b border-lagoon-700 py-3 text-ivory-100 last:border-0">
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-ivory-300">
                Sponsorship packages are fees for defined services. They are not an investment and carry no financial return.
                Visibility is delivered as described in each approved package.
              </p>

              <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:flex-wrap">
                <Link href="/member/packages" className={ctaPrimary} data-testid="link-member-packages">
                  Review packages <span className="font-normal opacity-80">(member area)</span>
                </Link>
                <Link href="/join?intent=partnership#institutional-inquiry" className={ctaSecondary} data-testid="link-partnership-inquiry">
                  Request a tailored partnership <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
