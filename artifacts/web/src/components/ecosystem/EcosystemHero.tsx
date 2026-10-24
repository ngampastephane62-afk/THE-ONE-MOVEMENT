import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import { Show } from '@clerk/react';
import SectorUniverse from './SectorUniverse';
import HeroWorld from './exhibition/HeroWorld';
import OneKey from './exhibition/OneKey';
import { KubaSectionDivider } from '@/components/kuba/KubaPatterns';
import { useStage } from './exhibition/useStage';

interface Props {
  paused: boolean;
  onTogglePause: () => void;
  motionLocked?: boolean;
  selected: string;
  onPickSector: (slug: string) => void;
}

const d = (ms: number) => ({ '--d': `${ms}ms` } as CSSProperties);

export default function EcosystemHero({ paused, onTogglePause, motionLocked = false, selected, onPickSector }: Props) {
  const { ref, attrs } = useStage<HTMLElement>();
  return (
    <section ref={ref} {...attrs} className="x-hero" aria-labelledby="eco-hero-title">
      <HeroWorld />
      <div className="tomi-hero-watermark" aria-hidden="true" />
      <div className="x-content mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-20 lg:grid-cols-12 lg:pb-24 lg:pt-28">
        <div className="lg:col-span-6">
          <p className="x-track text-eyebrow text-gold-400" style={d(250)}>
            The Ecosystem <span className="mx-2 text-gold-500/60">·</span> Seventeen sectors
          </p>
          <h1 id="eco-hero-title" className="mt-6 text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="x-line"><span style={d(550)}>FIND YOUR PLACE</span></span>
            <span className="x-line"><span style={d(760)}>IN ONE SHARED</span></span>
            <span className="x-line"><span style={d(970)}><em className="x-world-word">WORLD.</em></span></span>
          </h1>
          <KubaSectionDivider palette="gold" animated className="mt-7 max-w-[15rem] opacity-90" />
          <p className="x-fade mt-5 max-w-xl text-lg leading-relaxed text-ivory-200" style={d(1350)}>
            Artists and designers, investors and builders, care workers, NGOs and institutions.
          </p>
          <p className="x-fade mt-2 max-w-xl text-base leading-relaxed text-ivory-300" style={d(1520)}>
            Wherever you come from and whatever you do, walk through seventeen worlds, find the TOMI programmes connected to yours and the official public knowledge worth reading next.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Show when="signed-out">
              <Link href="/sign-in" data-testid="link-hero-signin" className="x-fade x-btn x-btn-gold" style={d(1750)}>
                <OneKey className="x-btn-key h-3 w-8" /> Open my workspace
              </Link>
              <Link href="/sign-up" data-testid="link-hero-signup" className="x-fade x-btn x-btn-ghost" style={d(1850)}>
                Create your free member space
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/member" data-testid="link-hero-workspace" className="x-fade x-btn x-btn-gold" style={d(1750)}>
                <OneKey className="x-btn-key h-3 w-8" /> Open my workspace
              </Link>
            </Show>
            <a href="#explore" data-testid="link-hero-explore" className="x-fade x-btn text-gold-400 hover:text-ivory-100" style={d(1950)}>
              Explore sectors
            </a>
          </div>
          <div className="x-fade mt-14 hidden lg:block" style={d(2300)} aria-hidden="true">
            <span className="x-scrollcue"><i /> Scroll to enter</span>
          </div>
        </div>

        <div className="x-rise relative lg:col-span-6" style={d(900)}>
          <SectorUniverse selected={selected} onPick={onPickSector} />
          <button
            type="button"
            onClick={onTogglePause}
            disabled={motionLocked}
            title={motionLocked ? 'Motion is reduced by your system settings' : undefined}
            aria-pressed={paused}
            data-testid="button-toggle-motion"
            className="absolute right-0 top-0 z-10 inline-flex min-h-[40px] items-center gap-1.5 bg-lagoon-900/85 px-3 py-2 text-[11px] uppercase tracking-wider text-ivory-100 backdrop-blur hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {motionLocked ? 'Motion reduced' : paused ? 'Play motion' : 'Pause motion'}
          </button>
        </div>
      </div>
    </section>
  );
}
