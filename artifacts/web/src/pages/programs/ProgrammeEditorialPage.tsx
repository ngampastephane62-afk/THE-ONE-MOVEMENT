import type { ReactElement } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowDown } from 'lucide-react';
import ProgramSuppliedImage from '@/components/programs/ProgramSuppliedImage';
import FashionNightSlideshow from '@/components/programs/FashionNightSlideshow';
import ProgrammeHero from '@/components/programs/editorial/ProgrammeHero';
import Chapter from '@/components/programs/editorial/Chapter';
import { ProgrammeMedia, ProgrammeParticipation, ProgrammePeople } from '@/components/programs/editorial/ProgrammeCommon';
import { pick, useProgrammeEditorial } from '@/lib/use-programme-editorial';
import Partnership from '@/components/programs/editorial/Partnership';
import Announcements from '@/components/programs/editorial/Announcements';
import { PROGRAMME_THEMES, type ProgrammeSlug } from '@/lib/programme-editorial';
import type { Program } from '@/lib/programs-data';

type Slug = 'fashion-night' | 'investment-forum';

/** Per-programme identity: motif, hero title split and media. Copy comes from programs-data. */
const IDENTITY: Record<Slug, { title: string[]; whatTitle: string[]; purposeTitle: string[]; motif: () => ReactElement; secondImage?: 'fashion-portrait'; ratio: string }> = {
  'fashion-night': {
    title: ['THE ONE', 'FASHION', 'NIGHT.'], whatTitle: ['ONE STAGE.', 'MANY RHYTHMS.'], purposeTitle: ['WHY IT', 'CELEBRATES.'], secondImage: 'fashion-portrait', ratio: 'aspect-[3/4]',
    motif: () => (
      <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-1/2 opacity-[0.12]" viewBox="0 0 100 200" preserveAspectRatio="none" fill="none">
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 12} 0 Q ${i * 12 + 30} 100 ${i * 12} 200`} stroke={PROGRAMME_THEMES['fashion-night'].accent} strokeWidth="0.3" />)}
      </svg>
    ),
  },
  'investment-forum': {
    title: ['THE ONE', 'INVESTMENT', 'FORUM.'], whatTitle: ['WHERE IDEAS', 'MEET CAPITAL.'], purposeTitle: ['PURPOSE', 'AND VISION.'], ratio: 'aspect-[2/3]',
    motif: () => (
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.08]" fill="none">
        <defs><pattern id="tomi-if-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" stroke={PROGRAMME_THEMES['investment-forum'].accent} strokeWidth="0.6" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#tomi-if-grid)" />
      </svg>
    ),
  },
};

/** Shared editorial architecture for programmes without a bespoke page. Empty chapters are omitted. */
export default function ProgrammeEditorialPage({ program }: { program: Program & { slug: Slug } }) {
  const slug = program.slug as Slug & ProgrammeSlug;
  const T = PROGRAMME_THEMES[slug];
  const id = IDENTITY[slug];
  const { data } = useProgrammeEditorial(slug);
  const Motif = id.motif;
  return (
    <div data-testid={`page-programme-${slug}`}>
      <Helmet>
        <title>{`${program.name} — THE ONE MOVEMENT INTERNATIONAL`}</title>
        <meta name="description" content={program.seoDescription} />
        <meta property="og:title" content={`${program.name} — THE ONE MOVEMENT INTERNATIONAL`} />
        <meta property="og:description" content={program.seoDescription} />
        <link rel="canonical" href={`/programs/${slug}`} />
      </Helmet>

      <ProgrammeHero theme={T} eyebrow={`01 · ${program.eyebrow}`} title={id.title} secondary={[program.tagline.toUpperCase()]} statement={pick(data?.introduction, program.heroStatement)}
        motif={<Motif />}
        media={data?.heroVideoUrl
          ? <video src={data.heroVideoUrl} poster={data.heroImageUrl ?? undefined} controls playsInline preload="none" className="block max-h-[78vh] w-full bg-ink-900 object-contain" />
          : data?.heroImageUrl ? <img src={data.heroImageUrl} alt="" className="block h-auto w-full object-contain" />
          : <ProgramSuppliedImage slug={slug} frameClassName={`${id.ratio} w-full`} captionClassName="text-ivory-300" />}
        actions={<>
          <a href="#participate" className="inline-flex min-h-12 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: T.accent, color: T.night }} data-testid="link-hero-participate">Take part <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
          <a href="#partner" className="inline-flex min-h-12 items-center border px-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: 'hsl(40 40% 94% / 0.35)' }} data-testid="link-hero-partner">Partner inquiry</a>
        </>}
      />

      <Chapter n="02" eyebrow="WHAT IS THIS PROGRAM?" title={id.whatTitle} tone="paper" theme={T}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <p className="whitespace-pre-line text-lg leading-relaxed lg:col-span-6">{pick(data?.description, program.overview)}</p>
          {id.secondImage && <FashionNightSlideshow captions={data?.photoCaptions} />}
        </div>
      </Chapter>

      <Chapter n="03" eyebrow="PURPOSE AND VISION" title={id.purposeTitle} tone="night" theme={T} narrow lede={<p className="whitespace-pre-line">{pick(data?.purpose, program.purpose)}</p>}>
        <ul className="flex flex-wrap gap-2" aria-label="Key themes">
          {program.themes.map((t) => <li key={t} className="border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: T.accent, color: T.accent }}>{t}</li>)}
        </ul>
      </Chapter>

      <ProgrammePeople editorial={data} theme={T} n="04" />
      <ProgrammeMedia editorial={data} theme={T} n="05" />
      <ProgrammeParticipation programme={slug} editorial={data} theme={T} n="06" lede={`Who it is for: ${program.audiences.join(', ').toLowerCase()}.`} />

      <Partnership programme={slug} programmeName={program.name} theme={T} n="07" />

      <Announcements theme={T} n="08" editorial={data} note={program.historyNote} />
    </div>
  );
}
