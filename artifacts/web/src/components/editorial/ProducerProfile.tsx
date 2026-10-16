import { useEffect, useRef, useState } from 'react';
import { producerFilms, producerPortrait } from './producer-credits';

const services = ['Development', 'Casting', 'Location management', 'Production', 'Post-production'];

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2);
}

function Portrait({ src, name, className = '' }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-lagoon-800 ${className}`}>
      <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-2xl text-gold-400/50">{initials(name)}</span>
      {failed ? <span className="absolute inset-x-2 bottom-3 text-center text-xs text-ivory-200" role="status">Portrait unavailable</span> : <img src={src} alt={name} loading="lazy" decoding="async"
        onError={() => setFailed(true)}
        className="relative h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.04] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      }
    </div>
  );
}

export default function ProducerProfile() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const scrollToProfile = () => {
      if (window.location.hash === '#production-partner') section.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    scrollToProfile();
    window.addEventListener('hashchange', scrollToProfile);
    return () => window.removeEventListener('hashchange', scrollToProfile);
  }, []);
  const uniqueActors = new Set(producerFilms.flatMap((f) => f.cast.map((c) => c.name))).size;
  return (
    <section ref={section} id="production-partner" className="scroll-mt-24 bg-lagoon-900 py-section-lg text-ivory-100" aria-labelledby="production-partner-heading" data-testid="section-production-partner">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <figure className="group lg:col-span-5">
            <div className="relative border border-gold-500/40 p-2">
              <Portrait src={producerPortrait} name="Qais Qandil" className="aspect-[4/5]" />
              <span aria-hidden className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 border-b border-r border-gold-400" />
            </div>
            <figcaption className="mt-5 text-xs uppercase tracking-[0.18em] text-ivory-300">Qais Qandil · Founder, CEO & Producer</figcaption>
          </figure>
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-400">PRODUCTION PARTNER · PER THE FOUNDER</p>
            <h2 id="production-partner-heading" className="mt-4 text-display-lg">The Film Makers</h2>
            <p className="mt-2 font-display text-xl text-gold-400">Qais Qandil</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory-200" data-testid="text-producer-bio">Qais Qandil is the founder, CEO and producer of The Film Makers FZ LLC, a production company based in Abu Dhabi. According to the Founder, The Film Makers is TOMI's production partner for the new documentary production.</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Company services">
              {services.map((s) => (
                <li key={s} className="border border-gold-500/40 px-3 py-2 text-[0.6875rem] uppercase tracking-[0.12em] text-ivory-200 transition-colors hover:border-gold-400 hover:text-gold-400">{s}</li>
              ))}
            </ul>
            <dl className="mt-8 grid grid-cols-3 gap-px bg-lagoon-700 text-center">
              {[[String(producerFilms.length), 'Feature films'], [String(uniqueActors), 'Credited actors'], ['Abu Dhabi', 'Base']].map(([v, l]) => (
                <div key={l} className="bg-lagoon-900 px-3 py-4"><dt className="order-2 mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ivory-300">{l}</dt><dd className="font-display text-xl text-gold-400 sm:text-2xl">{v}</dd></div>
              ))}
            </dl>
            <a href="https://www.thefilmmakers.com/about" target="_blank" rel="noreferrer" className="mt-6 inline-block py-2 text-sm font-semibold text-gold-400 underline underline-offset-4 hover:text-ivory-100" data-testid="link-producer-about">About The Film Makers · Official website</a>
          </div>
        </div>

        <div className="mt-20 border-t border-gold-500/30 pt-10">
          <p className="text-eyebrow text-gold-400">THE FILM MAKERS · FILM PORTFOLIO</p>
          <h3 className="mt-3 text-display-md">Actors credited on its films.</h3>
          <p className="mt-3 text-xs text-ivory-300">Portraits and film credits: The Film Makers · Official portfolio.</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ivory-300">These actors are credited on films produced by The Film Makers. They are not announced participants in, or endorsers of, TOMI or its future documentary.</p>

          <div className="mt-12 space-y-16">
            {producerFilms.map((film, fi) => (
              <article key={film.title} data-testid={`film-producer-${fi}`} className="grid gap-6 lg:grid-cols-12">
                <header className="lg:col-span-3">
                  <p className="font-mono text-xs text-gold-400">{String(fi + 1).padStart(2, '0')} · {film.year}</p>
                  <h4 className="mt-2 font-display text-2xl">{film.title}</h4>
                  <p className="mt-2 text-xs text-ivory-300">{film.cast.length} credited</p>
                  <a href={film.source} target="_blank" rel="noreferrer" className="mt-3 inline-block py-1 text-xs font-semibold text-gold-400 underline underline-offset-4 hover:text-ivory-100" data-testid={`link-film-source-${fi}`}>Source · thefilmmakers.com</a>
                </header>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:col-span-9 lg:grid-cols-5">
                  {film.cast.map((c) => (
                    <li key={c.name} className="group" data-testid={`card-actor-${fi}-${c.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      <div className="border border-lagoon-700 transition-colors group-hover:border-gold-400">
                        <Portrait src={c.portrait} name={c.name} className="aspect-[3/4]" />
                      </div>
                      <p className="mt-2 text-sm text-ivory-100 transition-colors group-hover:text-gold-400">{c.name}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-14 max-w-3xl border-l border-gold-500/50 pl-4 text-xs leading-relaxed text-ivory-300">Only completed films are shown. Upcoming slate projects, their prospective casting, budgets and dates are not published here. Netflix remains an intended distribution platform, not a confirmed partner.</p>
        </div>
      </div>
    </section>
  );
}
