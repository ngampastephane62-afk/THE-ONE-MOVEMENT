import { useEffect, useRef } from 'react';
import NativeVideo from '@/components/editorial/NativeVideo';

const media = (name: string) => `${import.meta.env.BASE_URL}api/documentary/media/${name}`;

const TEASERS = [
  { no: '01', w: 480, h: 848, aspect: 'aspect-[480/848]', duration: '1 min 16 s', iso: 'PT1M16S' },
  { no: '02', w: 1280, h: 720, aspect: 'aspect-video', duration: '7 s', iso: 'PT7S' },
  { no: '03', w: 1280, h: 678, aspect: 'aspect-[1280/678]', duration: '29 s', iso: 'PT29S' },
  { no: '04', w: 720, h: 1280, aspect: 'aspect-[9/16]', duration: '1 min 1 s', iso: 'PT1M1S' },
];

export default function DocumentaryTeasers() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const go = () => {
      if (window.location.hash === '#documentary-teasers') {
        requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  const pauseOthers = (current: HTMLVideoElement) => {
    root.current?.querySelectorAll('video').forEach((v) => { if (v !== current && !v.paused) v.pause(); });
  };

  return (
    <section ref={root} id="documentary-teasers" aria-labelledby="documentary-teasers-heading" className="mt-12 scroll-mt-24 border-y-2 border-ink-900 py-8" data-testid="section-documentary-teasers">
      <div className="grid gap-8 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="text-eyebrow text-gold-700">THE ONE DOCUMENTAIRE</p>
          <h3 id="documentary-teasers-heading" className="mt-3 font-display text-3xl leading-tight text-ink-900">Documentaries and magazines, since the first edition.</h3>
          <div className="mt-5 h-px w-16 bg-gold-500" aria-hidden />
          <p className="mt-5 font-display text-lg italic leading-snug text-lagoon-800">Since its first edition, The One Movement has produced documentaries and magazines.</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">Four excerpts from The One Documentaire, supplied by the Founder. They are teasers from the Movement’s documentary and magazine history, not the complete film.</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink-500">Excerpts · Founder archive · Sound on</p>
        </header>
        <ol className="grid items-start gap-6 sm:grid-cols-2 lg:col-span-8">
          {TEASERS.map((t) => (
            <li key={t.no} className="flex flex-col" data-testid={`card-documentary-teaser-${t.no}`}>
              <div className="flex items-baseline justify-between border-b border-ink-900 pb-1.5">
                <span className="font-display text-sm text-ink-900">Excerpt {t.no}</span>
                <time dateTime={t.iso} className="font-mono text-[11px] text-ink-600" data-testid={`text-teaser-duration-${t.no}`}>{t.duration}</time>
              </div>
              <div className={`mt-2 bg-ink-900 ${t.w > t.h ? '' : 'mx-auto w-full max-w-[280px]'}`}>
                <div className={`${t.aspect} w-full`}>
                  <NativeVideo
                    width={t.w}
                    height={t.h}
                    preload="metadata"
                    poster={media(`documentary-teaser-${t.no}.webp`)}
                    aria-label={`The One Documentaire — excerpt ${t.no}, ${t.duration}`}
                    onPlay={(e) => pauseOthers(e.currentTarget)}
                    className="!h-full !max-h-none bg-ink-900"
                    data-testid={`video-documentary-teaser-${t.no}`}
                  >
                    <source src={media(`documentary-teaser-${t.no}.mp4`)} type="video/mp4" />
                  </NativeVideo>
                </div>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-ink-500">The One Documentaire · excerpt</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
