import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import './cinematic-hero.css';

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
  const [reduced, setReduced] = useState(false);

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
        <span className="tch-globe-light" aria-hidden="true" />
      </figure>

      {/* Layer 3 — minimal typography */}
      <div className="tch-copy">
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
        <div className="tch-actions">
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
