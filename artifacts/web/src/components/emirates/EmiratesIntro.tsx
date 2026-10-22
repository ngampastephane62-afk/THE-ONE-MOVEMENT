import { Link } from 'wouter';
import { ArrowDown } from 'lucide-react';
import EmiratesHero from '@/components/editorial/EmiratesHero';
import GoldThread from '@/components/GoldThread';
import { EMIRATES_FORM_HREF } from '@/lib/emirates-experience';
import { useEmiratesMotion } from './use-emirates-motion';

/** Chapter 01 — the approved hero, with refined English / transliteration / Arabic choreography. */
export default function EmiratesIntro() {
  const { paused } = useEmiratesMotion();
  return (
    <EmiratesHero externalPaused={paused} pauseOffscreen>
      <div className="mx-auto w-full max-w-6xl px-6 pt-32">
        <p className="text-eyebrow text-gold-400 animate-cinematic-1">01 · THANKS EMIRATES · A TOMI INITIATIVE</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,10.5vw,8.25rem)] leading-[0.9] tracking-[-0.02em] text-ivory-100" style={{ textWrap: 'balance' }} data-testid="text-hero-title">
          <span className="em-mask"><span className="em-intro-line" style={{ ['--d' as string]: '120ms' }}>THANK YOU,</span></span>
          <span className="em-mask"><span className="em-intro-line text-gold-400" style={{ ['--d' as string]: '240ms' }}>EMIRATES.</span></span>
        </h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-10">
          <p className="em-mask font-display text-[clamp(1.25rem,3.2vw,2.25rem)] tracking-[0.18em] text-ivory-200" data-testid="text-hero-shukran">
            <span className="em-intro-line" style={{ ['--d' as string]: '400ms' }}>SHUKRAN EMIRATES.</span>
          </p>
          <p lang="ar" dir="rtl" className="em-ar em-mask text-[clamp(1.9rem,5vw,3.6rem)] font-semibold leading-[1.35] text-gold-400" data-testid="text-hero-arabic">
            <span className="em-intro-ar-line" style={{ ['--d' as string]: '540ms' }}>شكراً الإمارات</span>
          </p>
        </div>
        <div className="em-mask mt-4"><p className="em-intro-line font-display text-lg tracking-[0.24em] text-ivory-200" style={{ ['--d' as string]: '700ms' }}>WE ARE ONE.</p></div>
        <div className="em-intro-copy">
          <GoldThread className="mt-8" length="240px" node />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-200">One country. Many stories. Many cultures. One human connection. Citizens, residents and people anywhere in the world are invited to say, in their own words, what the Emirates has meant to them.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={EMIRATES_FORM_HREF} className="em-focus inline-flex min-h-12 items-center bg-gold-500 px-7 text-sm font-semibold tracking-[0.14em] text-ink-900 transition-colors hover:bg-gold-400" data-testid="link-share-story">SHARE YOUR STORY</Link>
            <a href="#em-federation" className="em-focus inline-flex min-h-12 items-center gap-2 border border-ivory-200/40 px-6 text-sm font-semibold tracking-[0.14em] text-ivory-100 hover:border-ivory-100" data-testid="link-discover-federation">DISCOVER THE SEVEN EMIRATES <ArrowDown className="h-4 w-4" aria-hidden /></a>
          </div>
        </div>
      </div>
    </EmiratesHero>
  );
}
