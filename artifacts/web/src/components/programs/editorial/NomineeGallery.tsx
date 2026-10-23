import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, ArrowUpRight, Film } from 'lucide-react';
import type { ProgramPerson } from '@workspace/api-client-react';
import PhotoActions from '@/components/editorial/PhotoActions';
import type { ProgrammeTheme } from '@/lib/programme-editorial';
import { playable, portraitOf } from '@/lib/use-programme-editorial';
import ProgramVideoPlayer from './ProgramVideoPlayer';
import { useReducedMotion } from './motion';

const profileHref = (p: ProgramPerson) => p.profileUrl || null;

/**
 * Compact interactive people gallery: one featured stage + an accessible selector rail.
 * Portraits and posters are object-contain (never cropped). No wealth data is shown.
 */
export function PeopleStage({ people, theme, statusLabel, onWatch }: { people: ProgramPerson[]; theme: ProgrammeTheme; statusLabel: string; onWatch?: (id: string) => void }) {
  const [idx, setIdx] = useState(0);
  const [turn, setTurn] = useState(0);
  const reduced = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const i = Math.min(idx, people.length - 1);
  const person = people[i];
  if (!person) return null;
  const img = portraitOf(person);
  const href = profileHref(person);
  const go = (next: number, focus = false) => {
    const n = (next + people.length) % people.length;
    setIdx(n); setTurn((t) => t + 1);
    if (focus) tabs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: people.length - 1 };
    if (e.key in map) { e.preventDefault(); go(map[e.key], true); }
  };
  const ctrl = 'inline-flex h-11 w-11 shrink-0 items-center justify-center border focus-visible:outline-none focus-visible:ring-2';
  const anim = reduced ? '' : 'animate-[tomiPersonIn_850ms_cubic-bezier(0.19,1,0.22,1)_both]';
  const hasFilm = playable(person.videos).length > 0;

  return (
    <div data-testid="gallery-people">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        <div id={`person-panel-${person.id}`} role="tabpanel" aria-labelledby={`person-tab-${person.id}`} className="lg:col-span-7">
          <div className="relative flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.nightSoft, minHeight: 'min(68vh, 34rem)' }}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(60% 60% at 50% 40%, ${theme.accent.replace(')', ' / 0.14)')}, transparent 70%)` }} />
            {img ? (
              <img key={`${person.id}-${turn}`} src={img.src} width={img.width} height={img.height} alt={`${person.name} — official TOMI image`}
                className={`relative block max-h-[min(68vh,34rem)] w-auto max-w-full object-contain ${anim}`} data-testid={`img-person-${person.id}`} />
            ) : (
              <span className="relative text-5xl tracking-widest" style={{ fontFamily: 'var(--font-display)', color: theme.accent }} role="img" aria-label={person.name}>{person.name.split(' ').map((p) => p[0]).join('').slice(0, 3)}</span>
            )}
            <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.3em]" style={{ color: theme.accent }}>{String(i + 1).padStart(2, '0')} / {String(people.length).padStart(2, '0')}</span>
          </div>
          {img?.source && <div className="mt-3"><PhotoActions source={img.source} title={`${person.name} · official TOMI image`} tone="dark" layout="row" /></div>}
        </div>

        <div className="min-w-0 lg:col-span-5" aria-live="polite">
          <span className="inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ borderColor: theme.accent, color: theme.accent }} data-testid="status-person">{statusLabel}</span>
          <h3 key={`h-${person.id}`} className={`mt-5 break-words text-[clamp(2rem,7vw,3.5rem)] leading-[0.95] ${anim}`} style={{ fontFamily: 'var(--font-display)' }} data-testid="text-person-name">{person.name}</h3>
          {person.designation && <p className="mt-3 text-sm uppercase tracking-[0.16em]" style={{ color: theme.mist }}>{person.designation}</p>}
          {person.biography && <p className="mt-6 line-clamp-5 max-w-md leading-relaxed" style={{ color: theme.mist }}>{person.biography}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {href && (href.startsWith('/') ? (
              <Link href={href} className="inline-flex min-h-12 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: theme.accent, color: theme.night }} data-testid={`link-person-profile-${person.id}`}>View profile <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: theme.accent, color: theme.night }} data-testid={`link-person-profile-${person.id}`}>View profile <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            ))}
            {hasFilm && onWatch && (
              <button type="button" onClick={() => onWatch(person.id)} className="inline-flex min-h-12 items-center gap-2 border px-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: 'hsl(40 40% 94% / 0.35)' }} data-testid={`button-person-film-${person.id}`}>
                <Film className="h-4 w-4" aria-hidden="true" /> Watch {playable(person.videos).length > 1 ? 'films' : 'film'}
              </button>
            )}
          </div>
        </div>
      </div>

      {people.length > 1 && (
        <div className="mt-10 flex items-center gap-2 sm:gap-3">
          <button type="button" className={ctrl} style={{ borderColor: 'hsl(40 40% 94% / 0.3)' }} onClick={() => go(i - 1)} aria-label="Previous" data-testid="button-person-prev"><ArrowLeft className="h-4 w-4" /></button>
          <div role="tablist" aria-label={statusLabel} onKeyDown={onKey} className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {people.map((p, k) => {
              const pi = portraitOf(p);
              const active = k === i;
              return (
                <button key={p.id} ref={(el) => { tabs.current[k] = el; }} id={`person-tab-${p.id}`} role="tab" aria-selected={active} aria-controls={`person-panel-${p.id}`} tabIndex={active ? 0 : -1}
                  onClick={() => go(k)} className="group w-20 shrink-0 snap-start text-left focus-visible:outline-none focus-visible:ring-2 sm:w-28" data-testid={`tab-person-${p.id}`}>
                  <span className="block aspect-[4/5] overflow-hidden" style={{ backgroundColor: theme.nightSoft, outline: active ? `1px solid ${theme.accent}` : 'none', outlineOffset: 2 }}>
                    {pi && <img src={pi.src} alt="" loading="lazy" className={`h-full w-full object-contain transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-55 group-hover:opacity-90'}`} />}
                  </span>
                  <span className="mt-2 block truncate text-[11px] uppercase tracking-[0.12em]" style={{ color: active ? theme.accent : theme.mist }}>{p.name}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className={ctrl} style={{ borderColor: 'hsl(40 40% 94% / 0.3)' }} onClick={() => go(i + 1)} aria-label="Next" data-testid="button-person-next"><ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
      <style>{'@keyframes tomiPersonIn{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}'}</style>
    </div>
  );
}

/** People films: one player mounted at a time, chosen from a compact list; each person's videos keep their own order. */
export function PeopleFilms({ people, active, onSelect, theme }: { people: ProgramPerson[]; active: string | null; onSelect: (id: string) => void; theme: ProgrammeTheme }) {
  const [videoIdx, setVideoIdx] = useState(0);
  const withFilm = people.filter((p) => playable(p.videos).length > 0);
  if (withFilm.length === 0) return null;
  const current = withFilm.find((p) => p.id === active) ?? withFilm[0];
  const vids = playable(current.videos);
  const v = vids[Math.min(videoIdx, vids.length - 1)];
  const line = 'hsl(30 15% 50% / 0.25)';
  return (
    <div className="grid gap-8 md:grid-cols-12 md:items-start" data-testid="section-people-films">
      <div className="md:col-span-5" role="group" aria-label="Choose a film">
        <ul className="border-t" style={{ borderColor: line }}>
          {withFilm.map((p, k) => {
            const on = p.id === current.id;
            return (
              <li key={p.id} className="border-b" style={{ borderColor: line }}>
                <button type="button" aria-pressed={on} onClick={() => { onSelect(p.id); setVideoIdx(0); }} className="flex min-h-14 w-full items-center gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2" data-testid={`button-film-${p.id}`}>
                  <span className="w-7 font-mono text-[11px] opacity-60">{String(k + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</span>
                    <span className="block text-xs opacity-70">{playable(p.videos).length} approved {playable(p.videos).length > 1 ? 'videos' : 'video'}</span>
                  </span>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent, opacity: on ? 1 : 0 }} />
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed opacity-70">Original approved films. Playback starts only when you press play.</p>
      </div>
      <div className="md:col-span-6 md:col-start-7">
        {vids.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={`${current.name} videos`}>
            {vids.map((x, k) => (
              <button key={x.id} type="button" aria-pressed={x.id === v.id} onClick={() => setVideoIdx(k)} className="min-h-11 border px-3 text-xs" style={{ borderColor: x.id === v.id ? theme.accent : line }} data-testid={`button-video-${x.id}`}>{x.title}</button>
            ))}
          </div>
        )}
        <ProgramVideoPlayer key={v.id} video={v} className="mx-auto max-w-md" />
      </div>
    </div>
  );
}
