import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import BroadcastFilms from '@/components/editorial/BroadcastFilms';
import { historyLogo } from '@/lib/partner-history';

const media = (name: string) => `${import.meta.env.BASE_URL}api/documentary/media/${name}`;

const SOURCES = {
  multichoice: 'https://www.canalplusgroup.com/en/mandatoryoffermultichoice/multichoice-post-72',
  scale: 'https://www.canalplusgroup.com/uploads/Canal_PR_13_Oct25_77a5d40405.pdf',
  netflix: 'https://www.canalplusgroup.com/en/press/press-159',
};

const THEMES = [
  { no: 'I', title: 'Cinema & series', body: 'Films and series, including through the STUDIOCANAL film and television studio.' },
  { no: 'II', title: 'Sport', body: 'Live sport, including SuperSport within MultiChoice.' },
  { no: 'III', title: 'Documentaries & African stories', body: 'Documentaries and local stories made for African audiences.' },
];

const BRANDS = ['DStv', 'GOtv', 'Showmax', 'M-Net', 'SuperSport'];

function SourceLink({ href, children, testid }: { href: string; children: string; testid: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" data-testid={testid}
      className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-lagoon-700 underline underline-offset-4 hover:text-gold-700">
      <span>{children}</span><ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export default function BroadcastOverview() {
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      if (id === 'broadcast-distribution' || id === 'canal-profile') {
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
      }
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  return (
    <section id="broadcast-distribution" className="scroll-mt-24 border-b border-sand-300 py-section-lg" aria-labelledby="documentary-broadcast-heading" data-testid="section-broadcast-distribution">
      <div className="mx-auto max-w-6xl px-6">
        {/* Masthead */}
        <header className="border-y-4 border-double border-ink-900 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-eyebrow text-gold-700">BROADCAST & DISTRIBUTION</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-700">The broadcast file · TOMI archive</p>
          </div>
          <h2 id="documentary-broadcast-heading" className="mt-3 font-display text-[clamp(2.2rem,6vw,4.75rem)] uppercase leading-[0.92] text-ink-900">On screen, across Africa.</h2>
          <p className="mt-3 max-w-3xl text-sm italic leading-relaxed text-ink-700">From a Goma runway on international television to the broadcasters named by the Founder: the media relationships behind the documentary journey.</p>
        </header>

        <BroadcastFilms embedded />

        {/* CANAL+ feature */}
        <article id="canal-profile" className="mt-16 scroll-mt-24 border-t-2 border-ink-900 pt-8" data-testid="documentary-canal-plus">
          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-ink-900 px-5 py-4"><img src={media('canal-logo.png')} alt="CANAL+ logo" className="h-8 w-auto sm:h-10" loading="lazy" data-testid="img-documentary-canal-logo" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">Feature · Broadcaster profile</p>
              <h3 className="mt-1 font-display text-3xl uppercase leading-tight text-ink-900 sm:text-4xl">CANAL+, from Paris to Johannesburg.</h3>
            </div>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="text-[15px] leading-relaxed text-ink-800 lg:col-span-7 sm:columns-2 sm:gap-8">
              <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-gold-700">CANAL+ is a global media and entertainment group working across production, broadcasting, distribution and aggregation.</p>
              <p className="mt-4">On 22 September 2025, CANAL+ announced effective control of MultiChoice, owner of DStv, GOtv, Showmax, M-Net and SuperSport.</p>
              <p className="mt-4">MultiChoice brings an anglophone and lusophone African footprint that complements the group’s francophone base.</p>
              <SourceLink href={SOURCES.multichoice} testid="link-source-canal-multichoice">CANAL+ · MultiChoice update</SourceLink>
            </div>

            <aside className="lg:col-span-5" data-testid="canal-scale">
              <div className="grid grid-cols-2 border border-ink-900">
                <div className="border-r border-ink-900 p-5">
                  <p className="font-display text-5xl leading-none text-ink-900" data-testid="text-canal-subscribers">40M</p>
                  <p className="mt-2 text-xs leading-snug text-ink-700">combined subscribers</p>
                </div>
                <div className="p-5">
                  <p className="font-display text-5xl leading-none text-ink-900" data-testid="text-canal-countries">70+</p>
                  <p className="mt-2 text-xs leading-snug text-ink-700">countries</p>
                </div>
                <div className="col-span-2 border-t border-ink-900 bg-ivory-50 p-4">
                  <p className="text-xs leading-relaxed text-ink-700">Group scale reported by CANAL+ on 13 October 2025, with 17,000 employees. These are group figures, not TOMI viewers or a live audience count.</p>
                </div>
              </div>
              <SourceLink href={SOURCES.scale} testid="link-source-canal-scale">CANAL+ release · 13 October 2025</SourceLink>
            </aside>
          </div>

          {/* Themes */}
          <div className="mt-10 grid border-y border-sand-300 md:grid-cols-3" data-testid="canal-themes">
            {THEMES.map((t, i) => (
              <div key={t.no} className={`py-6 md:px-6 ${i > 0 ? 'border-t border-sand-300 md:border-l md:border-t-0' : 'md:pl-0'}`} data-testid={`canal-theme-${i}`}>
                <p className="font-display text-2xl text-gold-600">{t.no}</p>
                <h4 className="mt-2 font-display text-xl text-ink-900">{t.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-800">{t.body}</p>
              </div>
            ))}
          </div>

          {/* DStv & Netflix */}
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div data-testid="canal-dstv">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">Acquisition · MultiChoice</p>
              <h4 className="mt-2 font-display text-2xl text-ink-900">DStv joins the CANAL+ family.</h4>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="MultiChoice brands">
                {BRANDS.map((b) => <li key={b} className="border border-ink-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">{b}</li>)}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-ink-800">Through MultiChoice, the group reaches DStv and GOtv households in anglophone and lusophone Africa.</p>
            </div>
            <div className="border-l-4 border-gold-500 pl-6" data-testid="canal-netflix">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">Distribution · Netflix</p>
              <h4 className="mt-2 font-display text-2xl text-ink-900">Netflix inside CANAL+ offers.</h4>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">On 6 June 2025, CANAL+ extended its 2019 Netflix distribution partnership in France and Poland to 24 sub-Saharan African countries, with eligible bundles from July 2025 in francophone Africa.</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">The same release reported 400+ live channels, including 28 produced for African audiences.</p>
              <p className="mt-3 text-xs leading-relaxed text-ink-700">Netflix remains independent: this is access within CANAL+ subscriptions, not an acquisition of Netflix and not a TOMI commission.</p>
              <SourceLink href={SOURCES.netflix} testid="link-source-canal-netflix">CANAL+ release · 6 June 2025</SourceLink>
            </div>
          </div>
          <a href="https://www.canalplusgroup.com/en/group" target="_blank" rel="noreferrer" className="mt-6 inline-block py-2 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-canal-official">About CANAL+ · Official website</a>
        </article>

        {/* Africa24 */}
        <article className="mt-16 grid gap-6 border-t-2 border-ink-900 pt-8 md:grid-cols-12" data-testid="documentary-africa24">
          <div className="md:col-span-3">
            <div className="inline-flex border border-sand-300 bg-ivory-50 p-4">
              <img src={historyLogo(37)} alt="Africa24 logo" className="h-12 w-auto" loading="lazy" data-testid="img-documentary-africa24-logo" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
            </div>
          </div>
          <div className="md:col-span-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">Broadcaster profile · Pan-African news</p>
            <h3 className="mt-2 font-display text-2xl text-ink-900">Africa 24 TV</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-800">A pan-African news broadcaster covering African current affairs around the clock, with an African editorial perspective. The Africa24 group also offers English-language, cultural and sports channels.</p>
            <a href="https://africa24group.com/" target="_blank" rel="noreferrer" className="mt-4 inline-block py-2 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-africa24-official">About Africa24 · Official website</a>
          </div>
        </article>
      </div>
    </section>
  );
}
