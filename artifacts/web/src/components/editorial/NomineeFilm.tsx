import SocialVideo from './SocialVideo';
import { personImage } from './PersonPortrait';
const FILMS: Record<string, { id: string; path: string; title: string; webm?: boolean }> = {
  ciara: { id: 'ciara-nomination', path: 'ciara-announcement', title: 'Ciara · TOMI announcement', webm: true },
  mohombi: { id: 'mohombi-nomination', path: 'mohombi-announcement', title: 'Mohombi · TOMI announcement', webm: true },
  'nancy-isime': { id: 'nancy-isime-nomination', path: 'awards-nominees', title: 'Nancy Isime · TOMI announcement' },
};
export const hasNomineeFilm = (slug: string) => slug in FILMS;
export const nomineeFilmTitle = (slug: string) => FILMS[slug]?.title;
export default function NomineeFilm({ slug }: { slug: string }) {
  const film = FILMS[slug];
  if (!film) return <p className="border border-sand-300 p-4 text-sm text-ink-700">No individual announcement video has been supplied for this profile yet. The official nomination poster is available above.</p>;
  const prefix = `${import.meta.env.BASE_URL}api/${film.webm ? 'nominee-media/' : 'program-media/'}`;
  return <div className="max-w-md">
    <SocialVideo videoId={film.id} title={film.title} poster={personImage(`${slug}-poster`)} preload="none">
      {film.webm && <source src={`${prefix}${film.path}.webm`} type="video/webm" />}
      <source src={`${prefix}${film.path}.mp4`} type="video/mp4" />
      Your browser does not support video playback.
    </SocialVideo>
    <p className="mt-3 text-xs text-ink-700">{film.title} · Supplied by TOMI. Like and comment with your member account.</p>
  </div>;
}
