import { useRef } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Building2, Compass, Hammer, Landmark, LineChart, Ruler, Users, GraduationCap, Briefcase, Lightbulb, Building } from 'lucide-react';
import '@/styles/sector-world.css';
import ArchitectureSkyline from './ArchitectureSkyline';
import Chapter from './SectorWorldChapter';
import { SECTORS } from '@/lib/sectors-data';

const CHAPTERS = [
  { id: 're-discover', label: 'Discover' },
  { id: 're-professions', label: 'Professions' },
  { id: 're-learn', label: 'Learn & grow' },
  { id: 're-showcase', label: 'Showcase' },
  { id: 're-join', label: 'Join' },
];

const DISCOVER = [
  { k: 'Architecture', t: 'Form that answers climate', d: 'From courtyard houses that breathe in coastal heat to towers that shade their own streets, buildings carry the intelligence of where they stand.' },
  { k: 'Cities', t: 'Places people stay', d: 'Markets, waterfronts and squares decide whether a district lives after six. Real estate is a long conversation with the public realm.' },
  { k: 'Property', t: 'Homes, workplaces, land', d: 'Ownership, tenancy and stewardship shape family stability and enterprise. Good practice starts with clear, honest information.' },
  { k: 'Sustainability', t: 'Building for the next generation', d: 'Local materials, passive cooling and adaptive reuse often matter as much as new technology in lowering a building\u2019s footprint.' },
];

const ROLES = [
  { icon: Ruler, r: 'Architects', d: 'Shape space, light and structure, translating a brief and a site into a building people can live with.' },
  { icon: Building2, r: 'Real estate agents', d: 'Guide buyers, sellers and tenants through a property, a neighbourhood and a negotiation.' },
  { icon: Briefcase, r: 'Brokers', d: 'Connect parties on larger commercial and investment transactions and structure the deal between them.' },
  { icon: Hammer, r: 'Developers', d: 'Assemble land, finance, design and construction to bring a project from idea to occupancy.' },
  { icon: LineChart, r: 'Investors', d: 'Commit capital to property over long horizons, weighing risk, location and responsibility.' },
  { icon: Compass, r: 'Property consultants', d: 'Advise on valuation, planning, management and strategy so decisions rest on evidence.' },
];

const LEARN = [
  { t: 'Architecture', d: 'How climate, culture and materials inform design, and how to read a plan, a section and a site.' },
  { t: 'Real estate careers', d: 'The many doors into the field, from design studios to agencies, development firms and public planning.' },
  { t: 'Brokerage', d: 'What brokers do, how mandates work, and why trust and disclosure matter in every transaction.' },
  { t: 'Property investment', d: 'Core ideas such as location, yield, holding costs and risk. Editorial orientation only, never financial advice.' },
  { t: 'Market knowledge', d: 'Reading local markets through official statistics, planning documents and the people who know the street.' },
];

const AUDIENCES = [
  { icon: Briefcase, a: 'Professionals', d: 'Make your practice visible to other sectors.', href: '/sign-up', cta: 'Create a free account' },
  { icon: Lightbulb, a: 'Creators', d: 'Photographers, illustrators and storytellers of the built world.', href: '/sign-up', cta: 'Create a free account' },
  { icon: GraduationCap, a: 'Students', d: 'Architecture, planning and property students finding their path.', href: '/join', cta: 'See how to join' },
  { icon: Landmark, a: 'Entrepreneurs', d: 'Builders of new property, design and proptech ventures.', href: '/join', cta: 'See how to join' },
  { icon: LineChart, a: 'Investors', d: 'Meet people across the 17 worlds, not a listings feed.', href: '/community', cta: 'Browse the community' },
  { icon: Building, a: 'Organizations', d: 'Firms, agencies and institutions joining the conversation.', href: '/join', cta: 'See how to join' },
];

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function RealEstateWorld() {
  const root = useRef<HTMLDivElement>(null);
  // In-page navigation without touching location.hash, so #explore deep links never regress.
  const go = (id: string) => {
    const el = root.current?.querySelector<HTMLElement>(`#${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  return (
    <div ref={root} className="sw-world" data-testid="world-real-estate">
      <header className="sw-hero">
        <div className="sw-hero-art">
          <ArchitectureSkyline className="h-full w-full" />
          <span className="sw-art-label">Illustrative artwork. Not a real building or project.</span>
        </div>
        <div className="sw-hero-copy">
          <p className="text-eyebrow text-gold-400">World {String(SECTORS.findIndex((s) => s.slug === 'real-estate') + 1).padStart(2, '0')} of {SECTORS.length} · Real Estate</p>
          <h3 className="mt-3 text-display-lg text-ivory-100">The city is a<br /><em className="sw-serif">shared</em> drawing.</h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-200">
            Architects, agents, developers and investors shape where humanity lives and works. Enter the world of architecture and cities, meet the professions, and find your place in it. Belonging is free.
          </p>
          <nav aria-label="Real Estate world chapters" className="mt-6 flex flex-wrap gap-2">
            {CHAPTERS.map((c, i) => (
              <button key={c.id} type="button" onClick={() => go(c.id)} className="sw-chip" data-testid={`button-chapter-${c.id}`}>
                <span className="font-mono text-[10px] text-gold-500">{String(i + 1).padStart(2, '0')}</span> {c.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <Chapter id="re-discover" n="01" eyebrow="Discover real estate" title="Architecture, cities, property">
        <div className="sw-discover">
          {DISCOVER.map((x, i) => (
            <article key={x.k} className="sw-discover-card" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-500">{x.k}</p>
              <h5 className="mt-2 font-display text-base tracking-[0.04em] text-ivory-100">{x.t}</h5>
              <p className="mt-2 text-sm leading-relaxed text-ivory-300">{x.d}</p>
            </article>
          ))}
        </div>
      </Chapter>

      <Chapter id="re-professions" n="02" eyebrow="Meet the professions" title="Six roles that build a city">
        <p className="-mt-2 mb-5 max-w-2xl text-sm text-ivory-300">Descriptions of the roles, not member profiles. To meet real members who chose to be listed, use the community directory below.</p>
        <ul className="sw-roles">
          {ROLES.map(({ icon: Icon, r, d }) => (
            <li key={r} className="sw-role">
              <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
              <div>
                <p className="font-display text-sm tracking-[0.08em] text-ivory-100">{r.toUpperCase()}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ivory-300">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter id="re-learn" n="03" eyebrow="Learn & grow" title="Five threads of knowledge" light>
        <p className="-mt-2 mb-5 max-w-2xl text-sm text-ink-700">Editorial orientation topics, not courses or certifications. The curated official resources above are the place to go deeper.</p>
        <ol className="sw-learn">
          {LEARN.map((l, i) => (
            <li key={l.t}>
              <span className="sw-learn-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="font-display text-base tracking-[0.05em] text-ink-900">{l.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{l.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter id="re-showcase" n="04" eyebrow="Showcase your work" title="Your portfolio, in your words">
        <div className="sw-showcase">
          <ul className="space-y-3 text-sm text-ivory-200">
            <li className="sw-tick">Professional portfolios</li>
            <li className="sw-tick">Architectural projects</li>
            <li className="sw-tick">Property presentations</li>
          </ul>
          <div>
            <p className="text-sm leading-relaxed text-ivory-300">Describe your practice on your TOMI member profile and choose whether it appears in the community directory. You stay in control of what is public.</p>
            <Link href="/member" className="sw-cta mt-5" data-testid="link-showcase-member">
              Open my member space <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Chapter>

      <Chapter id="re-join" n="05" eyebrow="Join the Real Estate world" title="Six ways in. All free.">
        <ul className="sw-audiences">
          {AUDIENCES.map(({ icon: Icon, a, d, href, cta }) => (
            <li key={a} className="sw-audience">
              <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
              <p className="mt-3 font-display text-sm tracking-[0.1em] text-ivory-100">{a.toUpperCase()}</p>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ivory-300">{d}</p>
              <Link href={href} className="sw-link mt-4" data-testid={`link-join-${a.toLowerCase()}`}>{cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            </li>
          ))}
        </ul>
        <div className="sw-free">
          <Users className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <p className="text-sm text-ivory-200">Ordinary membership is free. Joining never grants professional, verified or ambassador status automatically.</p>
          <Link href="/join" className="sw-cta" data-testid="link-join-real-estate">Join TOMI free</Link>
        </div>
      </Chapter>
    </div>
  );
}
