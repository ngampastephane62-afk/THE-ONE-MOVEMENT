import GoldThread from '@/components/GoldThread';
import { ActionLink } from './SummitUI';
import { ROUTES } from './summit-data';

const NAV = [
  ['Ecosystem', '#ecosystem'], ['Learn every day', '#everyday'], ['Sectors', '#sectors'], ['Marketplace', '#marketplace'], ['Knowledge', '#knowledge'],
  ['Network', '#network'], ['Summit', '#experience'], ['Media', '#media'], ['Impact', '#impact'], ['Join', '#participate'],
] as const;

export default function SummitHero() {
  const img = `${import.meta.env.BASE_URL}images/summit-ecosystem-hero.jpg`;
  return (
    <>
      <header className="relative isolate overflow-hidden bg-lagoon-900 text-ivory-100">
        <img src={img} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55" />
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(100deg, hsl(187 67% 9% / 0.96) 0%, hsl(187 67% 10% / 0.82) 45%, hsl(187 67% 12% / 0.35) 100%)' }} />
        <div className="mx-auto flex min-h-[88dvh] max-w-7xl flex-col justify-end px-6 pb-16 pt-32 lg:pb-24">
          <p className="text-eyebrow text-gold-400 animate-fade-in">THE ONE MOVEMENT INTERNATIONAL · AFRICA · UAE · WORLD</p>
          <h1 className="mt-5 text-[clamp(2.6rem,10vw,6.5rem)] leading-[0.92] tracking-[-0.02em] animate-fade-up" style={{ fontFamily: 'var(--font-display)' }}>
            THE ONE SUMMIT
          </h1>
          <p className="mt-4 max-w-3xl text-[clamp(1.25rem,3.2vw,2.25rem)] leading-tight text-gold-300 animate-fade-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
            WHERE IDEAS BECOME OPPORTUNITIES.
          </p>
          <GoldThread className="mt-7" length="200px" node />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            An international ecosystem connecting business, knowledge, innovation, professional communities and impact.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory-300 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            Discover, learn, share expertise and build relationships all year. The annual Summit is where the ecosystem meets in person.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ActionLink href="#ecosystem" testId="link-hero-explore">Explore the ecosystem</ActionLink>
            <ActionLink href={ROUTES.signUp} variant="ghost-dark" testId="link-hero-join">Join the network</ActionLink>
          </div>
          <p className="mt-8 text-xs text-ivory-300">Concept illustration · not a confirmed venue or event photograph.</p>
        </div>
      </header>
      <nav aria-label="Summit page sections" className="sticky top-20 z-30 border-b border-sand-200 bg-ivory-50/95 backdrop-blur supports-[backdrop-filter]:bg-ivory-50/80">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
          {NAV.map(([label, href]) => (
            <li key={href} className="shrink-0">
              <a href={href} className="block px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700 transition-colors hover:text-lagoon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-summit-nav-${href.slice(1)}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
