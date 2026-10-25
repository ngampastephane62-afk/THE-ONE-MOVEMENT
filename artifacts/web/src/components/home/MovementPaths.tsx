import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import './home-patterns.css';
import Chapter from '@/components/editorial/Chapter';
import HomeReveal from './HomeReveal';
import { defaultView, type SectionView } from '@/lib/home-editorial';
import EditorialFigure from './EditorialFigure';

const PATHS = [
  { href: '/community', index: '01', title: 'Meet the community', text: 'Discover the members who have chosen to share their profiles. Every person decides what to make public.' },
  { href: '/ambassadors', index: '02', title: 'Discover the voices', text: 'Explore the people and stories presented by TOMI, with their individual roles and recognition clearly identified.' },
  { href: '/opportunities', index: '03', title: 'Find your contribution', text: 'Explore existing ways to take part, collaborate and bring your work into the movement.' },
];
const VARIANTS = ['rise', 'sweep', 'curtain'] as const;

/** Links to real public discovery surfaces, never fabricated member previews. */
export default function MovementPaths({ ed = defaultView('paths') }: { ed?: SectionView } = {}) {
  const feature = ed.m('feature');
  return (
    <section aria-labelledby="movement-paths-title" className="thp-patterned bg-ivory-100 py-section-lg">
      <div className="thp-pattern" aria-hidden="true" />
      <div className="thp-pattern thp-pattern--steps" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-6">
        <div className={feature ? 'he-grid' : undefined}><HomeReveal variant="curtain">
          <Chapter as="h2" id="movement-paths-title" index="08" eyebrow={ed.t('eyebrow')}
            title={ed.t('heading')}
            lede={ed.t('lede')} />
        </HomeReveal>{feature && <EditorialFigure media={feature} className="he-media" />}</div>
        <div className="mt-8 divide-y divide-sand-300">
          {PATHS.map((path, i) => ({ ...path, href: ed.href(`p${i + 1}Href`), title: ed.t(`p${i + 1}Title`), text: ed.t(`p${i + 1}Text`) })).map((path, i) => (
            <HomeReveal key={path.index} variant={VARIANTS[i]} delay={i * 140}>
              <Link href={path.href} className="tomi-path-link thp-path group grid gap-3 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-600 md:grid-cols-[3rem_1fr_1.1fr_2rem]" data-testid={`link-movement-path-${path.index}`}>
                <span className="font-mono text-xs text-gold-700" aria-hidden="true">{path.index}</span>
                <h3 className="thp-path-title font-display text-xl text-ink-900 sm:text-3xl">{path.title}</h3>
                <p className="max-w-xl text-sm leading-relaxed text-ink-700">{path.text}</p>
                <ArrowUpRight className="h-5 w-5 text-lagoon-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </HomeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
