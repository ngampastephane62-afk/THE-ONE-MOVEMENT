import { useRef, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ExternalLink, Share2, Users } from 'lucide-react';
import '@/styles/sector-world.css';
import '@/styles/worlds.css';
import Chapter from '../SectorWorldChapter';
import WorldMotif from './WorldMotif';
import { WORLD_CHAPTERS, getWorldConfig } from './world-config';
import { SECTORS, type Sector } from '@/lib/sectors-data';
import { PROGRAMS } from '@/lib/programs-data';
import { ECOSYSTEM_RESOURCES } from '@/lib/ecosystem-resources';
import { showListedMembers } from '../directory-navigation';

export function DirectoryButton({ sector }: { sector: Sector }) {
  return (
    <div className="mt-4">
      <button type="button" onClick={() => showListedMembers(sector.slug)} className="lw-btn" data-testid={`button-world-directory-${sector.slug}`}>Filter the directory by {sector.name}</button>
      <p className="mt-2 text-xs text-ivory-300">Shows only members who chose to be listed under this sector. The list may be empty.</p>
    </div>
  );
}

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Resolve the sector's related programme names to real programme routes. */
export function relatedProgrammes(sector: Sector) {
  return sector.relatedPrograms
    .map((name) => PROGRAMS.find((p) => p.name.toLowerCase() === name.toLowerCase()))
    .filter((p): p is (typeof PROGRAMS)[number] => Boolean(p));
}

/** Opportunities chapter: real programme routes plus the live opportunities board. Shared with Real Estate. */
export function WorldOpportunities({ sector, id, n }: { sector: Sector; id: string; n: string }) {
  const progs = relatedProgrammes(sector);
  return (
    <Chapter id={id} n={n} eyebrow="Discover opportunities" title="Where this world gathers">
      <div data-testid={`chapter-opportunities-${sector.slug}`}>
        <p className="-mt-2 mb-5 max-w-2xl text-sm text-ivory-300">TOMI programmes connected to {sector.name}. Open calls appear only on the opportunities board when they are actually published; none are invented here.</p>
        {progs.length ? (
          <ul className="lw-grid">
            {progs.map((p) => (
              <li key={p.slug} className="lw-card">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] lw-accent">Programme</p>
                <p className="mt-2 font-display text-sm tracking-[0.06em] text-ivory-100">{p.name}</p>
                <Link href={`/programs/${p.slug}`} className="lw-link mt-2" data-testid={`link-world-programme-${sector.slug}-${p.slug}`}>View programme <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="lw-empty">No programme is linked to this world yet. This page will grow as programmes are confirmed.</p>
        )}
        <Link href="/opportunities" className="lw-btn mt-6" data-testid={`link-world-opportunities-${sector.slug}`}>Open the opportunities board <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </Chapter>
  );
}

/** Share chapter: points to the existing SectorShare controls above (no duplicate share widget). */
export function WorldShareChapter({ sector, id, n }: { sector: Sector; id: string; n: string }) {
  const goShare = () => {
    const el = document.querySelector<HTMLElement>(`[data-testid="share-sector-${sector.slug}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    el.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  };
  return (
    <Chapter id={id} n={n} eyebrow="Share this world" title="Open the door for someone">
      <div className="sw-free" data-testid={`chapter-share-${sector.slug}`}>
        <Share2 className="h-5 w-5 text-gold-400" aria-hidden="true" />
        <p className="text-sm text-ivory-200">Send a clean link to the {sector.name} world. No tracking is added.</p>
        <button type="button" onClick={goShare} className="sw-cta" data-testid={`button-world-share-${sector.slug}`}>Share options</button>
      </div>
    </Chapter>
  );
}

export default function SectorWorld({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const sector = SECTORS.find((s) => s.slug === slug);
  const cfg = getWorldConfig(slug);
  if (!sector || !cfg) return null;
  const idx = SECTORS.findIndex((s) => s.slug === slug) + 1;
  const cid = (c: string) => `w-${slug}-${c}`;
  const go = (c: string) => {
    const el = root.current?.querySelector<HTMLElement>(`#${cid(c)}`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };
  const resources = ECOSYSTEM_RESOURCES.filter((r) => r.sectors.includes(slug)).slice(0, 3);

  return (
    <div ref={root} key={slug} className="lw-world" style={{ '--w': cfg.accent } as CSSProperties} data-testid={`world-${slug}`}>
      <header className="lw-hero" data-testid={`world-hero-${slug}`}>
        <div className="lw-hero-copy">
          <p className="text-eyebrow lw-accent">World {String(idx).padStart(2, '0')} of {SECTORS.length} · {sector.name}</p>
          <h3 className="mt-3 text-display-lg text-ivory-100">{cfg.headline[0]}<br /><em className="lw-serif">{cfg.headline[1]}</em> {cfg.headline[2]}</h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-200">{cfg.intro} Belonging is free.</p>
          <nav aria-label={`${sector.name} world chapters`} className="mt-6 flex flex-wrap gap-2">
            {WORLD_CHAPTERS.map((c, i) => (
              <button key={c.id} type="button" onClick={() => go(c.id)} className="lw-chip" data-testid={`button-world-chapter-${slug}-${c.id}`}>
                <span className="font-mono text-[10px] lw-accent">{String(i + 1).padStart(2, '0')}</span> {c.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="lw-art">
          <WorldMotif motif={cfg.motif} />
          <span className="lw-art-label">Illustrative motif. Not a real event or place.</span>
        </div>
      </header>

      <Chapter id={cid('discover')} n="01" eyebrow={`Discover ${sector.name}`} title={sector.descriptor}>
        <div className="lw-grid" data-testid={`chapter-discover-${slug}`}>
          {cfg.discover.map((x) => (
            <article key={x.k} className="lw-card">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] lw-accent">{x.k}</p>
              <h5 className="mt-2 font-display text-base tracking-[0.04em] text-ivory-100">{x.t}</h5>
              <p className="mt-2 text-sm leading-relaxed text-ivory-300">{x.d}</p>
            </article>
          ))}
        </div>
      </Chapter>

      <WorldOpportunities sector={sector} id={cid('opportunities')} n="02" />

      <Chapter id={cid('professions')} n="03" eyebrow="Explore professionals" title="Who belongs here">
        <div data-testid={`chapter-professions-${slug}`}>
          <p className="-mt-2 mb-5 max-w-2xl text-sm text-ivory-300">Roles in this world, not member profiles. Real members who chose to be listed appear in the community directory.</p>
          <ul className="flex flex-wrap gap-2">
            {sector.whoBelongs.map((w) => <li key={w} className="lw-chip">{w}</li>)}
          </ul>
          <DirectoryButton sector={sector} />
          <Link href="/community" className="lw-link mt-2" data-testid={`link-world-community-${slug}`}><Users className="h-4 w-4" aria-hidden="true" /> Browse the community directory</Link>
        </div>
      </Chapter>

      <Chapter id={cid('learn')} n="04" eyebrow="Learning & knowledge" title="Threads to follow" light>
        <div data-testid={`chapter-learn-${slug}`}>
          <p className="-mt-2 mb-5 max-w-2xl text-sm text-ink-700">Editorial orientation topics, not courses or certifications.</p>
          <ol className="lw-grid">
            {cfg.learn.map((l, i) => (
              <li key={l.t} className="lw-card-light">
                <span className="font-mono text-xs text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-1 font-display text-base tracking-[0.05em] text-ink-900">{l.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{l.d}</p>
              </li>
            ))}
          </ol>
          {resources.length > 0 && (
            <ul className="mt-5 space-y-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-lagoon-600 underline" data-testid={`link-world-resource-${slug}-${r.id}`}>
                    {r.title} · {r.organization} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Chapter>

      <Chapter id={cid('join')} n="05" eyebrow={`Join the ${sector.name} world`} title="Belonging is free">
        <div className="sw-free" data-testid={`chapter-join-${slug}`}>
          <Users className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <p className="text-sm text-ivory-200">Ordinary membership is free. Joining never grants professional, verified or ambassador status automatically.</p>
          <Link href="/join" className="lw-btn" data-testid={`link-world-join-${slug}`}>Join this world</Link>
          <Link href="/member" className="lw-link" data-testid={`link-world-member-${slug}`}>Show your work on your profile</Link>
        </div>
      </Chapter>

      <WorldShareChapter sector={sector} id={cid('share')} n="06" />
    </div>
  );
}
