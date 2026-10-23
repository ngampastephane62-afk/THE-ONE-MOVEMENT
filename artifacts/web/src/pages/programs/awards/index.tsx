import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { AMBASSADOR_STATUS_NOTE, getAmbassadorsForProgramme } from '@workspace/shared';
import type { ProgramPerson } from '@workspace/api-client-react';
import ProgrammeFilm from '@/components/programs/ProgrammeFilm';
import ProgrammeHero from '@/components/programs/editorial/ProgrammeHero';
import Chapter from '@/components/programs/editorial/Chapter';
import { PeopleFilms, PeopleStage } from '@/components/programs/editorial/NomineeGallery';
import { OpportunityList, useOpportunities, type Role } from '@/components/programs/editorial/Participation';
import { ProgrammeMedia } from '@/components/programs/editorial/ProgrammeCommon';
import { pick, publishedPeople, useProgrammeEditorial } from '@/lib/use-programme-editorial';
import Partnership from '@/components/programs/editorial/Partnership';
import Announcements from '@/components/programs/editorial/Announcements';
import { AWARDS_COPY, PROGRAMME_THEMES, inquiryHref } from '@/lib/programme-editorial';
import { getProgramBySlug } from '@/lib/programs-data';

const T = PROGRAMME_THEMES.awards;
const API = `${import.meta.env.BASE_URL}api`;

/** Existing approved films, used only until the server responds. */
const FALLBACK_FILMS: Record<string, { id: string; title: string; url: string }[]> = {
  ciara: [{ id: 'ciara-nomination', title: 'Ciara · TOMI announcement', url: `${API}/nominee-media/ciara-announcement.mp4` }],
  mohombi: [{ id: 'mohombi-nomination', title: 'Mohombi · TOMI announcement', url: `${API}/nominee-media/mohombi-announcement.mp4` }],
  'nancy-isime': [{ id: 'nancy-isime-nomination', title: 'Nancy Isime · TOMI announcement', url: `${API}/program-media/awards-nominees.mp4` }],
};

function fallbackNominees(): ProgramPerson[] {
  return getAmbassadorsForProgramme('awards').map((a, i) => ({
    id: a.slug, name: a.name, designation: a.role, biography: a.impact[0] ?? '', kind: 'nominee', confirmed: true, published: true,
    portraitKey: a.poster, portraitUploadId: null, portraitUrl: null, profileUrl: `/ambassadors/${a.slug}`, order: i,
    videos: (FALLBACK_FILMS[a.slug] ?? []).map((f, k) => ({ ...f, description: '', credit: 'Supplied by TOMI', uploadId: null, assetKey: null, published: true, rightsConfirmed: true, order: k })),
  }));
}

/** Laurel-like concentric arcs: the Awards motif, decorative only, kept clear of text. */
function AwardsMotif() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-[-12rem] -z-10 h-[34rem] w-[34rem] opacity-[0.10]" viewBox="0 0 200 200" fill="none">
      {[90, 74, 58, 42].map((r) => <circle key={r} cx="100" cy="100" r={r} stroke={T.accent} strokeWidth="0.4" strokeDasharray={r === 90 ? '1 3' : undefined} />)}
    </svg>
  );
}

export default function AwardsPage() {
  const program = getProgramBySlug('awards');
  const { data } = useProgrammeEditorial('awards');
  const people = data ? publishedPeople(data, 'nominee') : fallbackNominees();
  const speakers = data ? publishedPeople(data, 'speaker').filter((p) => p.confirmed) : [];
  const opportunities = useOpportunities('awards', data?.participationRoles as Role[] | undefined, ['speaker']);
  const whatIs = data?.description.trim() ? data.description.split(/\n{2,}/) : AWARDS_COPY.whatIs;
  const criteria = data?.criteria.trim();
  const [film, setFilm] = useState<string | null>(null);
  const filmsRef = useRef<HTMLDivElement>(null);
  const watch = (slug: string) => {
    setFilm(slug);
    filmsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  const btn = 'inline-flex min-h-12 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.18em] focus-visible:outline-none focus-visible:ring-2';

  return (
    <div data-testid="page-awards">
      <Helmet>
        <title>THE ONE AWARDS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content={AWARDS_COPY.statement} />
        <meta property="og:title" content="THE ONE AWARDS — THE ONE MOVEMENT INTERNATIONAL" />
        <meta property="og:description" content={AWARDS_COPY.statement} />
        <link rel="canonical" href="/programs/awards" />
      </Helmet>

      {/* 01 · CINEMATIC INTRODUCTION */}
      <ProgrammeHero
        theme={T}
        eyebrow="01 · OFFICIAL PROGRAM · RECOGNITION"
        title={['THE ONE', 'AWARDS.']}
        secondary={AWARDS_COPY.secondary}
        statement={pick(data?.introduction, AWARDS_COPY.statement)}
        motif={<AwardsMotif />}
        media={data?.heroVideoUrl
          ? <video src={data.heroVideoUrl} poster={data.heroImageUrl ?? undefined} controls playsInline preload="none" className="block max-h-[78vh] w-full bg-ink-900 object-contain" data-testid="video-awards-hero" />
          : <ProgrammeFilm id="awards-rosina-2027" presentation="home" tone="dark" caption="Rosina · producer, partner and speaker · The One Awards · original supplied clip" />}
        actions={<>
          <a href="#nominees" className={btn} style={{ backgroundColor: T.accent, color: T.night }} data-testid="link-hero-nominees">Discover the nominees <ArrowDown className="h-4 w-4" aria-hidden="true" /></a>
          <a href="#partner" className={`${btn} border`} style={{ borderColor: 'hsl(40 40% 94% / 0.35)' }} data-testid="link-hero-partner">Partner inquiry</a>
        </>}
      />

      {/* 02 · WHAT IS THE ONE AWARDS? — with the not-for-sale principle */}
      <Chapter id="what" n="02" eyebrow="THE PROGRAM" title={['WHAT IS', 'THE ONE AWARDS?']} tone="paper" theme={T} testId="section-awards-what">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 text-lg leading-relaxed lg:col-span-6">
            {whatIs.map((p) => <p key={p}>{p}</p>)}
          </div>
          <aside className="relative border-l-2 py-2 pl-6 lg:col-span-5 lg:col-start-8" style={{ borderColor: T.accent }} aria-labelledby="not-for-sale" data-testid="statement-not-for-sale">
            <p id="not-for-sale" className="text-[clamp(1.4rem,3.6vw,2rem)] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{AWARDS_COPY.notForSale[0]}</p>
            <p className="mt-4 leading-relaxed opacity-85">{AWARDS_COPY.notForSale[1]}</p>
            <p className="mt-3 leading-relaxed opacity-85">{AWARDS_COPY.notForSale[2]}</p>
            {criteria
              ? <div className="mt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-60">Published criteria</p><p className="mt-2 whitespace-pre-line text-sm leading-relaxed" data-testid="text-awards-criteria">{criteria}</p></div>
              : <p className="mt-5 text-xs uppercase tracking-[0.16em] opacity-60">{AWARDS_COPY.criteriaPending}</p>}
          </aside>
        </div>
      </Chapter>

      {/* 03 · PURPOSE AND PHILOSOPHY — one consolidated statement */}
      {(program || data?.purpose.trim()) && (
        <Chapter n="03" eyebrow="OUR PURPOSE AND PHILOSOPHY" title={['RECOGNITION FOR', 'IMPACT, NOT WEALTH.']} tone="paper" theme={T} narrow
          lede={<p className="whitespace-pre-line">{pick(data?.purpose, program?.purpose ?? '')}</p>} />
      )}

      {/* 04 · AMBASSADORS OF PEACE — NOMINEES */}
      {people.length > 0 && (
        <Chapter id="nominees" n="04" eyebrow={`AMBASSADOR OF PEACE · ${AWARDS_COPY.nomineesSubtitle}`} title={[AWARDS_COPY.nomineesTitle]} tone="night" theme={T}
          lede={<p>{AWARDS_COPY.nomineesLede}</p>} testId="section-awards-nominees">
          <PeopleStage people={people} theme={T} statusLabel="Ambassador of Peace · Nominee" onWatch={watch} />
          <p className="mt-8 max-w-2xl text-xs leading-relaxed" style={{ color: T.mist }}>{AMBASSADOR_STATUS_NOTE}</p>
        </Chapter>
      )}

      {/* 05 · NOMINEE VIDEOS AND PROFILES */}
      <div ref={filmsRef} className="scroll-mt-16">
        <Chapter n="05" eyebrow="NOMINEE VIDEOS AND PROFILES" title={['IN THEIR', 'OWN FRAME.']} tone="paper" theme={T} testId="section-awards-films">
          <PeopleFilms people={[...people, ...speakers]} active={film} onSelect={setFilm} theme={T} />
        </Chapter>
      </div>

      {/* 06 · HOW TO PARTICIPATE — speakers */}
      <Chapter id="speak" n="06" eyebrow="HOW TO PARTICIPATE" title={[AWARDS_COPY.speaker.title]} tone="night" theme={T} testId="section-awards-speaker">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="max-w-xl text-lg leading-relaxed" style={{ color: T.mist }}>{AWARDS_COPY.speaker.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={inquiryHref.service('awards', 'speaker')} className={btn} style={{ backgroundColor: T.accent, color: T.night }} data-testid="link-apply-speaker">Apply as a speaker <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-relaxed" style={{ color: T.mist }}>An application is not an acceptance. Only speakers confirmed by the Founder are announced publicly.</p>
          </div>
          <div className="border-t pt-6 lg:col-span-4 lg:col-start-9" style={{ borderColor: 'hsl(40 40% 94% / 0.2)' }}>
            {(!data || speakers.length > 0) && <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: T.accent }}>Confirmed</p>}
            {(data ? speakers : [{ id: 'rosina', name: 'Rosina', designation: 'Producer, partner and speaker' }]).map((p) => (
              <div key={p.id} className="mt-3" data-testid={`text-speaker-${p.id}`}>
                <p className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</p>
                {p.designation && <p className="text-sm" style={{ color: T.mist }}>{p.designation}</p>}
              </div>
            ))}
            <p className="mt-6 text-xs font-semibold tracking-[0.2em]" style={{ color: T.accent }} data-testid="status-speaker-announcements">{AWARDS_COPY.speaker.status}</p>
          </div>
        </div>
      </Chapter>

      {/* 07 · PROFESSIONAL OPPORTUNITIES */}
      <Chapter n="07" eyebrow="PROFESSIONAL OPPORTUNITIES" title={['WORK WITH', 'THE AWARDS.']} tone="paper" theme={T}
        lede={<p>These services are separate from nomination and award selection. Taking part in any of them has no effect on recognition.</p>}>
        <OpportunityList items={opportunities} theme={T} />
      </Chapter>

      <ProgrammeMedia editorial={data} theme={T} n="07B" />

      {/* 08 · PARTNERSHIPS AND MEDIA INQUIRIES */}
      <Partnership programme="awards" programmeName="THE ONE AWARDS" theme={T} />

      {/* 09 · OFFICIAL ANNOUNCEMENTS — no date until confirmed */}
      <Announcements theme={T} editorial={data} />
    </div>
  );
}
