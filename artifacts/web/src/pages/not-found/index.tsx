import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <HeroSurface glowOrigin="bottom-center" minHeight="100dvh">
        <div className="mx-auto w-full max-w-2xl px-6 py-24 flex flex-col items-center text-center">

          {/* Eyebrow */}
          <p className="text-eyebrow text-gold-400 tracking-widest mb-8">
            404 — PAGE NOT FOUND
          </p>

          {/* Display headline */}
          <h1
            className="text-display-xl text-ivory-100 uppercase leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            THIS PATH DOES NOT EXIST — YET.
          </h1>

          {/* GoldThread motif */}
          <div className="flex justify-center mt-8 w-full">
            <GoldThread length="180px" node />
          </div>

          {/* Supporting copy */}
          <p className="mt-8 text-ivory-200 text-lg leading-relaxed max-w-lg">
            The page you are looking for could not be found. It may have moved,
            or it may not exist yet as the Movement grows.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              RETURN HOME
            </Link>
            <Link
              href="/our-vision"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-gold-500/60 text-ivory-100 hover:bg-gold-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              EXPLORE THE MOVEMENT
            </Link>
          </div>

          {/* Bilingual signature */}
          <p className="mt-16 text-xs text-ivory-400 tracking-[0.3em] uppercase select-none">
            WE ARE ONE —{' '}
            <span lang="ar" dir="rtl" className="font-normal not-italic">
              نحن واحد
            </span>
          </p>

        </div>
      </HeroSurface>
    </>
  );
}
