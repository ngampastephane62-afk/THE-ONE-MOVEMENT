import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import ArchivePhoto, { archivePhotoSource } from '@/components/ArchivePhoto';
import MediaActions from '@/components/editorial/MediaActions';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import SectionHeading from '@/components/SectionHeading';
import HomeReveal from './HomeReveal';
import './home-patterns.css';

/**
 * Curated official programmes on Home — exactly three, in Founder order.
 * Media are existing approved sources only:
 *  - Awards: ProgrammeFilm 'awards-rosina-2027' (Rosina, already approved)
 *  - Summit: ArchivePhoto 'summit-goma' (same source as cover-media programCardMedia('summit'))
 *  - Fashion Week: ProgrammeFilm 'fashion-knight-2026' (official artwork, same as ProgrammeCover)
 * Copy and dates are unchanged; no status labels are invented.
 */
const ITEMS = [
  { slug: 'awards', number: 'I', name: 'The One Awards', short: 'The One Awards', line: 'Recognition for courage, creativity and positive impact.', variant: 'curtain' as const },
  { slug: 'summit', number: 'II', name: 'The One Summit', short: 'The One Summit', line: 'Leadership, ideas and business across continents.', variant: 'sweep' as const },
  { slug: 'fashion-week', number: 'III', name: 'The One Fashion Week International', short: 'The One Fashion Week', line: 'Where the movement began. Sixth edition in Dubai, 22 December 2026.', variant: 'editorial' as const },
] as const;

function Media({ slug }: { slug: (typeof ITEMS)[number]['slug'] }) {
  if (slug === 'awards') return <ProgrammeFilm id="awards-rosina-2027" presentation="home" className="w-full" caption="Rosina · producer, partner and speaker" />;
  if (slug === 'summit') return (
    <div>
      <ArchivePhoto id="summit-goma" actions={false} sizes="(min-width: 1024px) 34vw, 92vw" />
      <MediaActions source={archivePhotoSource('summit-goma')} title="The One Summit" layout="row" className="mt-3" />
    </div>
  );
  return <ProgrammeFilm id="fashion-knight-2026" presentation="home" className="w-full" caption="Official artwork · Dubai, 22 December 2026" />;
}

export default function OfficialProgrammes() {
  return (
    <section className="thp-programmes bg-ivory-50 py-section-lg" aria-labelledby="program-preview-heading" data-testid="section-official-programmes">
      <div className="mx-auto max-w-7xl px-6">
        <HomeReveal variant="rise">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div id="program-preview-heading">
              <SectionHeading eyebrow="OFFICIAL PROGRAMS" heading="WHERE THE MOVEMENT MEETS" surface="light" size="lg" thread />
            </div>
            <Link href="/programs" className="inline-flex min-h-[44px] items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700 hover:text-ink-900" data-testid="link-home-all-programs">
              All programs <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </HomeReveal>
        <ol className="thp-events mt-14">
          {ITEMS.map((p, i) => (
            <li key={p.slug} className={`thp-event thp-event--${p.slug}`} data-testid={`card-home-program-${p.slug}`}>
              <div className={`thp-event-pattern thp-event-pattern--${p.slug}`} aria-hidden="true" />
              <article className="thp-event-grid">
                <HomeReveal variant={p.variant} className="thp-event-head">
                  <span className="thp-event-num" aria-hidden="true">{String(i + 1).padStart(2, '0')} <i>/ {p.number}</i></span>
                  <h3 className="thp-event-title"><span>{p.name}</span></h3>
                  <span className="thp-goldline" aria-hidden="true" />
                  <p className="thp-event-line">{p.line}</p>
                </HomeReveal>
                <HomeReveal variant="mask" delay={160} className="thp-event-media">
                  <Media slug={p.slug} />
                </HomeReveal>
                <div className="thp-event-cta">
                  <Link href={`/programs/${p.slug}`} className="thp-discover" data-testid={`link-home-program-${p.slug}`}>
                    <span>Discover {p.short}</span> <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
