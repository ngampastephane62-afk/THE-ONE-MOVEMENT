import { useState } from 'react';
import type { ProgramEditorial } from '@workspace/api-client-react';
import type { ProgrammeTheme } from '@/lib/programme-editorial';
import { byOrder, playable, publishedPeople } from '@/lib/use-programme-editorial';
import Chapter from './Chapter';
import { PeopleFilms, PeopleStage } from './NomineeGallery';
import ProgramVideoPlayer from './ProgramVideoPlayer';
import { OpportunityList, useOpportunities, type Role } from './Participation';

/** Founder-managed introduction + hero media, for pages whose own hero is bespoke. Renders only when set. */
export function ProgrammeCmsLead({ editorial, theme, n = '02' }: { editorial?: ProgramEditorial; theme: ProgrammeTheme; n?: string }) {
  if (!editorial) return null;
  const intro = editorial.introduction.trim();
  const desc = editorial.description.trim();
  const purpose = editorial.purpose.trim();
  const video = editorial.heroVideoUrl;
  const image = editorial.heroImageUrl;
  if (!intro && !desc && !purpose && !video && !image) return null;
  return (
    <Chapter n={n} eyebrow="WHAT IS THIS PROGRAM?" title={['THE PROGRAM,', 'IN BRIEF.']} tone="paper" theme={theme} testId="section-cms-lead">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="space-y-5 text-lg leading-relaxed lg:col-span-6">
          {intro && <p className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{intro}</p>}
          {desc && <p className="whitespace-pre-line">{desc}</p>}
          {purpose && <p className="whitespace-pre-line border-l-2 pl-5 opacity-90" style={{ borderColor: theme.accent }}>{purpose}</p>}
        </div>
        {(video || image) && (
          <div className="mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8">
            {video ? (
              <video src={video} poster={image ?? undefined} controls playsInline preload="none" className="block max-h-[75vh] w-full bg-ink-900 object-contain" data-testid="video-cms-hero" />
            ) : image ? <img src={image} alt="" className="block h-auto w-full object-contain" loading="lazy" data-testid="img-cms-hero" /> : null}
          </div>
        )}
      </div>
    </Chapter>
  );
}

/** Confirmed speakers and featured participants published by the Founder. Nothing renders without them. */
export function ProgrammePeople({ editorial, theme, n }: { editorial?: ProgramEditorial; theme: ProgrammeTheme; n: string }) {
  const [film, setFilm] = useState<string | null>(null);
  const speakers = publishedPeople(editorial, 'speaker').filter((p) => p.confirmed);
  const participants = publishedPeople(editorial, 'participant');
  const people = [...speakers, ...participants];
  if (people.length === 0) return null;
  return (
    <>
      <Chapter n={n} eyebrow="FEATURED PEOPLE" title={speakers.length ? ['CONFIRMED', 'VOICES.'] : ['FEATURED', 'PARTICIPANTS.']} tone="night" theme={theme} testId="section-programme-people">
        <PeopleStage people={people} theme={theme} statusLabel={speakers.length && !participants.length ? 'Confirmed speaker' : 'Featured'} onWatch={setFilm} />
      </Chapter>
      {people.some((p) => playable(p.videos).length) && (
        <Chapter n={`${n}B`} eyebrow="VIDEOS AND PROFILES" title={['IN THEIR', 'OWN WORDS.']} tone="paper" theme={theme}>
          <PeopleFilms people={people} active={film} onSelect={setFilm} theme={theme} />
        </Chapter>
      )}
    </>
  );
}

/** Official programme videos and media published by the Founder. One player mounted at a time. */
export function ProgrammeMedia({ editorial, theme, n, eyebrow = 'OFFICIAL VIDEOS AND MEDIA', title = ['OFFICIAL', 'MEDIA.'] }: { editorial?: ProgramEditorial; theme: ProgrammeTheme; n: string; eyebrow?: string; title?: string[] }) {
  const vids = playable(byOrder(editorial?.media ?? []));
  const [i, setI] = useState(0);
  if (vids.length === 0) return null;
  const v = vids[Math.min(i, vids.length - 1)];
  return (
    <Chapter n={n} eyebrow={eyebrow} title={title} tone="paper" theme={theme} testId="section-programme-media">
      <div className="grid gap-8 md:grid-cols-12">
        <ProgramVideoPlayer key={v.id} video={v} className="mx-auto w-full max-w-xl md:col-span-7" />
        {vids.length > 1 && (
          <ul className="md:col-span-4 md:col-start-9" aria-label="More videos">
            {vids.map((x, k) => (
              <li key={x.id}><button type="button" aria-pressed={k === i} onClick={() => setI(k)} className="flex min-h-12 w-full items-center gap-3 border-b py-2 text-left text-sm" style={{ borderColor: 'hsl(30 15% 50% / 0.25)', color: k === i ? undefined : 'inherit', opacity: k === i ? 1 : 0.7 }} data-testid={`button-media-${x.id}`}><span className="font-mono text-[11px]">{String(k + 1).padStart(2, '0')}</span>{x.title}</button></li>
            ))}
          </ul>
        )}
      </div>
    </Chapter>
  );
}

/** Compact participation opportunities driven by the Founder-managed category list. */
export function ProgrammeParticipation({ programme, editorial, theme, n, exclude, lede, id = 'participate' }: { programme: string; editorial?: ProgramEditorial; theme: ProgrammeTheme; n: string; exclude?: Role[]; lede?: string; id?: string }) {
  const items = useOpportunities(programme, editorial?.participationRoles as Role[] | undefined, exclude);
  if (items.length === 0) return null;
  return (
    <Chapter id={id} n={n} eyebrow="PARTICIPATION OPPORTUNITIES" title={['TAKE PART.']} tone="paper" theme={theme} lede={lede ? <p>{lede}</p> : undefined} testId="section-programme-participation">
      <OpportunityList items={items} theme={theme} />
    </Chapter>
  );
}
