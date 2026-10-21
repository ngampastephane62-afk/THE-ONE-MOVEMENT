import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import ArchivePhoto from '@/components/ArchivePhoto';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';

/**
 * Curated official programmes on Home — exactly three, in Founder order.
 * Media are existing approved sources only:
 *  - Awards: ProgrammeFilm 'awards-rosina-2027' (Rosina, already approved)
 *  - Summit: ArchivePhoto 'summit-goma' (same source as cover-media programCardMedia('summit'))
 *  - Fashion Week: ProgrammeFilm 'fashion-knight-2026' (official artwork, same as ProgrammeCover)
 */
const ITEMS = [
  { slug: 'awards', number: 'I', name: 'The One Awards', line: 'Recognition for courage, creativity and positive impact.' },
  { slug: 'summit', number: 'II', name: 'The One Summit', line: 'Leadership, ideas and business across continents.' },
  { slug: 'fashion-week', number: 'III', name: 'The One Fashion Week International', line: 'Where the movement began. Sixth edition in Dubai, 22 December 2026.' },
] as const;

function Media({ slug }: { slug: (typeof ITEMS)[number]['slug'] }) {
  if (slug === 'awards') return <ProgrammeFilm id="awards-rosina-2027" className="w-full" caption="Rosina · producer, partner and speaker" />;
  if (slug === 'summit') return <ArchivePhoto id="summit-goma" actions={false} frameClassName="aspect-[3/4] w-full" objectPosition="center 30%" sizes="(min-width: 768px) 30vw, 92vw" />;
  return <ProgrammeFilm id="fashion-knight-2026" className="w-full" caption="Official artwork · Dubai, 22 December 2026" />;
}

export default function OfficialProgrammes() {
  return (
    <section className="thp-programmes bg-ivory-50 py-section-lg" aria-labelledby="program-preview-heading" data-testid="section-official-programmes">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div id="program-preview-heading">
              <SectionHeading eyebrow="OFFICIAL PROGRAMS" heading="WHERE THE MOVEMENT MEETS" surface="light" size="lg" thread />
            </div>
            <Link href="/programs" className="inline-flex min-h-[44px] items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700 hover:text-ink-900" data-testid="link-home-all-programs">
              All programs <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <ol className="mt-14 grid items-start gap-x-8 gap-y-14 md:grid-cols-3">
          {ITEMS.map((p, i) => (
            <li key={p.slug} className={i === 1 ? 'md:mt-16' : ''}><Reveal delay={i * 110}>
              <article className="thp-card" data-testid={`card-home-program-${p.slug}`}>
                <div className="thp-card-media"><Media slug={p.slug} /></div>
                <div className="thp-card-body">
                  <span className="thp-card-num" aria-hidden="true">{p.number}</span>
                  <h3 className="thp-card-title">{p.name}</h3>
                  <p className="thp-card-line">{p.line}</p>
                  <Link href={`/programs/${p.slug}`} className="thp-card-link" data-testid={`link-home-program-${p.slug}`}>
                    Discover <span className="sr-only">{p.name}</span> <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
