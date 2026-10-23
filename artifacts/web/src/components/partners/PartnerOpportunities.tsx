import { Link } from 'wouter';
import { ArrowRight, Handshake, Landmark } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';

const PATHS = [
  { key: 'partner', icon: Handshake, eyebrow: 'BECOME A PARTNER', title: 'Partner with the Movement', body: 'Annual collaboration with programmes, media and communities across Africa, the UAE and international editions.', href: '/partners/partnership', cta: 'Explore partnership' },
  { key: 'investment', icon: Landmark, eyebrow: 'EXPLORE INVESTMENT OPPORTUNITIES', title: 'Invest in The One Movement Multinational', body: 'A separate conversation for investors interested in the long-term development of the platform.', href: '/partners/investment', cta: 'Explore investment' },
];

export default function PartnerOpportunities() {
  return (
    <section id="partnership-opportunities" className="scroll-mt-24 bg-lagoon-900 py-section-lg text-ivory-100" aria-labelledby="opportunities-heading" data-testid="section-partner-opportunities">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div id="opportunities-heading">
            <SectionHeading eyebrow="TWO PATHWAYS" heading="PARTNERSHIP OR INVESTMENT" surface="dark" thread />
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200">Two distinct relationships, each with its own conversation. Choose the one that reflects your intent.</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-px bg-lagoon-700 lg:grid-cols-2">
          {PATHS.map(({ key, icon: Icon, eyebrow, title, body, href, cta }) => (
            <Link key={key} href={href} className="group flex flex-col bg-lagoon-800 p-8 transition-colors duration-300 hover:bg-lagoon-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400 sm:p-12" data-testid={`link-path-${key}`}>
              <Icon className="h-7 w-7 text-gold-400" aria-hidden="true" />
              <span className="mt-8 text-eyebrow text-gold-400">{eyebrow}</span>
              <span className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{title}</span>
              <span className="mt-4 max-w-md leading-relaxed text-ivory-200">{body}</span>
              <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gold-400">{cta}<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
