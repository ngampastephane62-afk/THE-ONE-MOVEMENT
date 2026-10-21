import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import './cinematic-hero.css';
import officialLogo from '@/assets/media/home/tomi-official-logo.png';

export const INTRO_KEY = 'tomi:home-intro-seen';
/** Intro timeline in seconds (mirrors cinematic-hero.css delays). */
export const INTRO_TIMELINE = [
  { id: 'depth', start: 0, end: 3 },
  { id: 'globe-illumination', start: 3, end: 5 },
  { id: 'logo-title', start: 5, end: 8 },
  { id: 'cta-settle', start: 8, end: 10 },
] as const;
export const INTRO_DURATION_S = 9.6;
let seenInThisPageSession = false;
function introSeen(): boolean {
  if (seenInThisPageSession) return true;
  try { return window.sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
}
function markIntroSeen() {
  seenInThisPageSession = true;
  try { window.sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* in-memory fallback still prevents SPA navigation replays */ }
}

/**
 * Phase-one cinematic hero for TOMI.
 * Founder-supplied portrait and flag photographs over the supplied desert artwork.
 * People are never warped, recoloured or animated — only the backdrop and
 * surrounding light layers move. No documentary provenance is implied by the artwork.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const media = (file: string) => `${BASE}/media/tomi-intro/${file}`;

/** Extension point for the future 60-second introduction (not active yet). */
export type CinematicPhaseId =
  | 'volcanoes'
  | 'resilience'
  | 'desert'
  | 'riders'
  | 'dubai'
  | 'globe-bearer'
  | 'globe-transition'
  | 'universe'
  | 'logo'
  | 'navigation';

export const CINEMATIC_SEQUENCE: { id: CinematicPhaseId; ready: boolean }[] = [
  { id: 'volcanoes', ready: false },
  { id: 'resilience', ready: false },
  { id: 'desert', ready: false },
  { id: 'riders', ready: false },
  { id: 'dubai', ready: true },
  { id: 'globe-bearer', ready: true },
  { id: 'globe-transition', ready: false },
  { id: 'universe', ready: false },
  { id: 'logo', ready: false },
  { id: 'navigation', ready: false },
];

export interface CinematicHeroProps {
  /** Which composed scene to render. Only the phase-one scene exists today. */
  phase?: Extract<CinematicPhaseId, 'globe-bearer'>;
  className?: string;
  /** Future approved local Goma/Nyiragongo asset, in public/media/tomi-intro.
   * Omit until supplied: no invented volcano image or broken request.
   */
  originAsset?: { file: string; alt: string; width: number; height: number };
}

export default function CinematicHero({ phase = 'globe-bearer', className = '', originAsset }: CinematicHeroProps) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  // 10s intro timeline: depth 0-3s, globe light 3-5s, logo/title 5-8s, CTAs settle 8-10s.
  const [intro, setIntro] = useState(() => typeof window !== 'undefined' && !introSeen() && !reduced);
  const finishIntro = () => { markIntroSeen(); setIntro(false); };

  useEffect(() => {
    if (intro || reduced) markIntroSeen(); // a reduced-motion visit also counts as an introduction
  }, [intro, reduced]);
  useEffect(() => { if (reduced && intro) setIntro(false); }, [reduced, intro]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const still = paused || reduced;

  return (
    <section
      className={`tch ${className}`}
      data-phase={phase}
      data-paused={still ? 'true' : 'false'}
      data-intro={intro ? 'play' : 'done'}
      aria-labelledby="tch-title"
      data-testid="section-cinematic-hero"
    >
      {/* Layer 0 — Founder-supplied artwork (not a documentary photograph): desert dunes,
          sun, Dubai skyline and supplied teal/gold motifs. Kuba provenance not established. */}
      <div className="tch-bg" aria-hidden="true">
        <img
          src={media('desert-dubai-1024.webp')}
          srcSet={`${media('desert-dubai-640.webp')} 640w, ${media('desert-dubai-1024.webp')} 1024w`}
          sizes="100vw"
          width={1024}
          height={683}
          alt=""
          fetchPriority="high"
        />
      </div>
      {/* Reserved origin layer. No volcano is claimed or rendered without an approved asset. */}
      {originAsset && (
        <figure className="tch-origin" data-testid="img-hero-origin">
          <img
            src={media(originAsset.file)}
            alt={originAsset.alt}
            width={originAsset.width}
            height={originAsset.height}
            decoding="async"
          />
        </figure>
      )}
      {/* Symbolic ember light, not a depiction of an eruption or a Goma landscape. */}
      <div className="tch-origin-energy" aria-hidden="true" />
      <div className="tch-light" aria-hidden="true" />
      <div className="tch-scrim" aria-hidden="true" />

      {/* Layer 2 — foreground: the globe bearer */}
      <figure className="tch-bearer" data-testid="img-hero-globe-bearer">
        <img
          src={media('globe-bearer-479.webp')}
          srcSet={`${media('globe-bearer-360.webp')} 360w, ${media('globe-bearer-479.webp')} 479w`}
          sizes="(min-width: 768px) 360px, 72vw"
          width={479}
          height={1024}
          alt="TOMI model in black and gold holding a golden globe, a symbol of global unity"
          fetchPriority="high"
        />
        <span className="tch-globe-light" aria-hidden="true">
          <svg className="tch-globe-connections" viewBox="0 0 100 100" focusable="false">
            <ellipse cx="50" cy="50" rx="42" ry="17" transform="rotate(-22 50 50)" />
            <path d="M18 55 Q43 25 83 44" />
          </svg>
        </span>
      </figure>

      {/* Layer 3 — minimal typography */}
      <div className="tch-copy">
        <img
          src={officialLogo}
          width={640}
          height={336}
          alt="THE ONE MOVEMENT INTERNATIONAL official logo"
          className="tch-logo"
          decoding="async"
          data-testid="img-hero-official-logo"
        />
        <p className="tch-kicker">Eastern DR Congo &middot; Goma &rarr; Dubai</p>
        <h1 id="tch-title" className="tch-title" data-testid="text-hero-title">
          <span>The One Movement</span>
          <span className="tch-title-intl">International</span>
        </h1>
        <span className="tch-rule" aria-hidden="true" />
        <p className="tch-motto">
          <strong>We Are One</strong>
          <span>For Peace &amp; Unity</span>
        </p>
        <div
          className="tch-actions"
          onAnimationEnd={(e) => { if (e.target === e.currentTarget && intro) finishIntro(); }}
        >
          <Link href="/join" className="tch-btn tch-btn--solid" data-testid="link-hero-join">
            Join the Movement
          </Link>
          <Link href="/ecosystem" className="tch-btn tch-btn--ghost" data-testid="link-hero-ecosystem">
            Explore the Ecosystem
          </Link>
        </div>
        {/* Layer 1 — official flag, deliberately subordinate */}
        <figure className="tch-flag" data-testid="img-hero-flag">
          <img
            src={media('flag-dubai-640.webp')}
            width={640}
            height={427}
            alt="The official THE ONE MOVEMENT INTERNATIONAL flag, We Are One, before the Dubai skyline"
            decoding="async"
          />
          <figcaption>Official movement flag</figcaption>
        </figure>
      </div>

      <div className="tch-grain" aria-hidden="true" />

      {intro && (
        <button
          type="button"
          onClick={finishIntro}
          className="tch-skip"
          data-testid="button-skip-intro"
        >
          Skip intro
        </button>
      )}

      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Resume atmospheric motion' : 'Pause atmospheric motion'}
          className="tch-toggle"
          data-testid="button-toggle-hero-motion"
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      )}
    </section>
  );
}
