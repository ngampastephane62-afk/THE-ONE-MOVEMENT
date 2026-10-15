import { Link } from 'wouter';
import { Pause, Play } from 'lucide-react';
import { Show } from '@clerk/react';
import logoSrc from '@/assets/media/home/tomi-peace-logo.webp';
import WavingFlag from './WavingFlag';
import SectorUniverse from './SectorUniverse';

interface Props {
  paused: boolean;
  onTogglePause: () => void;
  selected: string;
  onPickSector: (slug: string) => void;
}

export default function EcosystemHero({ paused, onTogglePause, selected, onPickSector }: Props) {
  return (
    <section className="eco-hero relative overflow-hidden" aria-labelledby="eco-hero-title">
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[85%] items-center opacity-20 sm:w-[65%]" aria-hidden="true">
        <WavingFlag className="w-full" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6 relative z-10">
          <div className="mb-7 opacity-60">
            <img src={logoSrc} alt="The One Movement peace emblem" className="h-14 w-14 rounded-full object-cover eco-breathe" />
          </div>
          <p className="text-eyebrow text-gold-400 mb-5">THE ECOSYSTEM · {`SEVENTEEN SECTORS`}</p>
          <h1 id="eco-hero-title" className="text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            FIND YOUR PLACE IN <span className="text-gold-400">ONE SHARED WORLD.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200">
            Artists and designers, investors and builders, care workers, NGOs and institutions.
            Choose who you are, find your sector, see the TOMI programmes that connect to it and
            the official public knowledge worth reading next.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Show when="signed-out">
              <Link href="/sign-up" data-testid="link-hero-signup" className="inline-flex items-center justify-center bg-gold-500 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900 hover:bg-gold-400">
                Create your member space
              </Link>
              <Link href="/sign-in" data-testid="link-hero-signin" className="inline-flex items-center justify-center border border-ivory-100/30 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:border-ivory-100/70">
                Sign in
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/member" data-testid="link-hero-workspace" className="inline-flex items-center justify-center bg-gold-500 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-900 hover:bg-gold-400">
                Open my workspace
              </Link>
            </Show>
            <a href="#explore" className="inline-flex items-center justify-center px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-400 hover:text-gold-500">
              Explore sectors
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <SectorUniverse selected={selected} onPick={onPickSector} />
          <button
            type="button"
            onClick={onTogglePause}
            aria-pressed={paused}
            data-testid="button-toggle-motion"
            className="absolute right-0 top-0 inline-flex items-center gap-1.5 bg-lagoon-900/85 px-3 py-2 text-[11px] uppercase tracking-wider text-ivory-100 backdrop-blur hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {paused ? 'Play motion' : 'Pause motion'}
          </button>
        </div>
      </div>
    </section>
  );
}
