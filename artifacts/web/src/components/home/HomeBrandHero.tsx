import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';
import logo from '@/assets/media/home/tomi-peace-logo.webp';
import flag from '@/assets/media/home/tomi-peace-flag.webp';
import './home-experience.css';

const STRIPS = 14;

export default function HomeBrandHero() {
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
    <section className="tomi-brand-hero relative overflow-hidden" data-paused={still ? 'true' : 'false'}>
      <div className="tomi-flag-stage" aria-hidden="true">
        <div className="tomi-flag-float">
          {Array.from({ length: STRIPS }, (_, i) => (
            <span
              key={i}
              className="tomi-flag-strip"
              style={{
                backgroundImage: `url(${flag})`,
                left: `${(i * 100) / STRIPS}%`,
                width: `calc(${100 / STRIPS}% + 1px)`,
                backgroundPosition: `${(i * 100) / (STRIPS - 1)}% center`,
                backgroundSize: `${STRIPS * 100}% 100%`,
                animationDelay: `${-i * 0.42}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="tomi-brand-veil pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="tomi-hero-edition relative z-10 mx-auto max-w-7xl px-6 pt-6" aria-hidden="true">
        <span>01 / THE INTRODUCTION</span>
        <span>DR CONGO → THE WORLD</span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-6 py-section-md">
        <p className="text-eyebrow text-gold-400 animate-fade-in">GLOBAL CONNECTION ECOSYSTEM</p>
        <h1 className="mt-6 animate-cinematic-1">
          <span className="sr-only">The One Movement International — For Peace &amp; Unity. We Are One.</span>
          <img
            src={logo}
            alt=""
            width={1024}
            height={355}
            fetchPriority="high"
            loading="eager"
            className="tomi-brand-logo"
            data-testid="img-brand-logo"
          />
        </h1>
        <GoldThread className="mt-8" length="280px" node />

        <Reveal className="mt-10 max-w-2xl">
          <p className="text-xl leading-relaxed text-ivory-100 sm:text-2xl">
            A global movement bringing creatives, entrepreneurs, institutions and
            changemakers together through programs, dialogue and development collaboration.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/join" data-testid="link-hero-join">
            <Button size="lg">JOIN THE MOVEMENT</Button>
          </Link>
          <Link href="/ecosystem" data-testid="link-hero-ecosystem">
            <Button size="lg" variant="gold-outline">EXPLORE THE ECOSYSTEM</Button>
          </Link>
        </Reveal>
      </div>

      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Resume flag animation' : 'Pause flag animation'}
          className="tomi-motion-toggle"
          data-testid="button-toggle-flag-motion"
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
        </button>
      )}
    </section>
  );
}
