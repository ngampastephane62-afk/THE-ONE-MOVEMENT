import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import './home-patterns.css';
import Chapter from '@/components/editorial/Chapter';

const PATHS = [
  { href: '/community', index: '01', title: 'Meet the community', text: 'Discover the members who have chosen to share their profiles. Every person decides what to make public.' },
  { href: '/ambassadors', index: '02', title: 'Discover the voices', text: 'Explore the people and stories presented by TOMI, with their individual roles and recognition clearly identified.' },
  { href: '/opportunities', index: '03', title: 'Find your contribution', text: 'Explore existing ways to take part, collaborate and bring your work into the movement.' },
];

/** Links to real public discovery surfaces, never fabricated member previews. */
export default function MovementPaths() {
  return (
    <section aria-labelledby="movement-paths-title" className="thp-patterned bg-ivory-100 py-section-lg">
      <div className="thp-pattern" aria-hidden="true" />
      <div className="thp-pattern thp-pattern--steps" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-6">
        <Chapter as="h2" id="movement-paths-title" index="08" eyebrow="PEOPLE & POSSIBILITIES"
          title="A shared mission. Your own way in."
          lede="Artists, creators, professionals and changemakers — different experiences, connected by a common purpose." />
        <div className="mt-8 divide-y divide-sand-300">
          {PATHS.map(path => (
            <Link key={path.href} href={path.href} className="tomi-path-link group grid gap-3 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-600 md:grid-cols-[3rem_1fr_1.1fr_2rem]" data-testid={`link-movement-path-${path.index}`}>
              <span className="font-mono text-xs text-gold-700" aria-hidden="true">{path.index}</span>
              <h3 className="font-display text-xl text-ink-900 sm:text-2xl">{path.title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-ink-700">{path.text}</p>
              <ArrowUpRight className="h-5 w-5 text-lagoon-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
