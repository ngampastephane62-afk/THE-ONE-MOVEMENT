import { PROGRAMME_THEMES, type ProgrammeSlug } from '@/lib/programme-editorial';
import { useProgrammeEditorial } from '@/lib/use-programme-editorial';
import Announcements from './Announcements';
import Partnership from './Partnership';
import { ProgrammeCmsLead, ProgrammeMedia, ProgrammeParticipation, ProgrammePeople } from './ProgrammeCommon';
import type { Role } from './Participation';

/**
 * Shared editorial architecture slots for programmes with bespoke pages (Gala, Summit, Fashion Week).
 * Each slot reads the same public CMS query (deduplicated by React Query) and hides itself when empty.
 */
export function BespokeLead({ slug }: { slug: ProgrammeSlug }) {
  const { data } = useProgrammeEditorial(slug);
  return <ProgrammeCmsLead editorial={data} theme={PROGRAMME_THEMES[slug]} n="02" />;
}

export function BespokeTail({ slug, name, people = true, participation = true, partnership = false, exclude, mediaEyebrow }: {
  slug: ProgrammeSlug; name: string; people?: boolean; participation?: boolean; partnership?: boolean; exclude?: Role[]; mediaEyebrow?: string;
}) {
  const { data } = useProgrammeEditorial(slug);
  const T = PROGRAMME_THEMES[slug];
  return (
    <>
      {people && <ProgrammePeople editorial={data} theme={T} n="04" />}
      <ProgrammeMedia editorial={data} theme={T} n="05" eyebrow={mediaEyebrow} />
      {participation && <ProgrammeParticipation programme={slug} editorial={data} theme={T} n="06" exclude={exclude} id={`${slug}-participate`} />}
      {partnership && <Partnership programme={slug} programmeName={name} theme={T} n="07" />}
      <Announcements theme={T} n="08" editorial={data} />
    </>
  );
}
