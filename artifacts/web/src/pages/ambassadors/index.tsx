import { Helmet } from 'react-helmet-async';
import { AMBASSADOR_NOMINEES } from '@workspace/shared';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import NomineeCard from '@/components/editorial/NomineeCard';
import NomineeFilm from '@/components/editorial/NomineeFilm';

export default function Ambassadors() {
  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>Ambassador of Peace Nominees — The One Awards | TOMI</title>
        <meta name="description" content="The official nominees for The One Awards Ambassador of Peace recognition, also announced for The One Summit and Fashion Week red carpet." />
      </Helmet>
      <HeroSurface glowOrigin="behind" minHeight="64vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">THE ONE AWARDS · AMBASSADOR OF PEACE</p>
          <h1 className="mt-6 text-display-xl text-ivory-100 animate-cinematic-2">THE NOMINEES.</h1>
          <GoldThread className="mt-8" length="220px" node />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200 animate-cinematic-3">Meet the Ambassador of Peace nominees for The One Awards.</p>
        </div>
      </HeroSurface>
      <section className="py-section-lg">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
            {AMBASSADOR_NOMINEES.map((p, i) => <NomineeCard key={p.slug} person={p} index={i} />)}
          </div>
          <h2 className="mb-6 mt-14 font-display text-3xl text-ink-900">Announcement films</h2>
          <div className="grid items-start gap-8 md:grid-cols-3">
            {['mohombi', 'ciara', 'nancy-isime'].map(slug => <NomineeFilm key={slug} slug={slug} />)}
          </div>
          <div className="mt-16 grid gap-px bg-sand-300 sm:grid-cols-3">
            {[
              ['The One Awards', 'Ambassador of Peace nominees.'],
              ['The One Summit', 'Announced speakers. Appearances planned.'],
              ['Fashion Week', 'Announced for the red carpet. Appearances planned.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-ivory-100 p-6"><p className="font-display text-xl text-ink-900">{t}</p><p className="mt-1 text-sm text-ink-700">{d}</p></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
