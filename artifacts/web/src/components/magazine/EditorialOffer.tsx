import { Link } from 'wouter';
import { ArrowUpRight, Instagram, Facebook, Newspaper, BookOpen } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { SOCIAL, KIT_FIGURES, KIT_FIGURES_SOURCE, WEBSITE_READERS } from './social-sources';

const STAGES = [
  { n: 'I', icon: Newspaper, title: 'An editorial article', where: 'TOMI News', text: 'Your story, edited and published as an article in the ecosystem News — readable, searchable and shareable.' },
  { n: 'II', icon: Instagram, title: 'Relay on social', where: 'Tropik Instagram and Facebook', text: 'The editorial team relays selected stories to the Tropik community on its official pages.' },
  { n: 'III', icon: BookOpen, title: 'An inside page in print', where: 'Tropik Magazine', text: 'Where the Founder accepts it, one inside page of the printed magazine — under conditions agreed in writing.' },
];

export function SocialLinks({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const base = tone === 'dark' ? 'border-ivory-50/20 text-ivory-50 hover:border-gold-400' : 'border-ink-900/20 text-ink-900 hover:border-lagoon-600';
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SOCIAL.map((c) => {
        const Icon = c.id === 'instagram' ? Instagram : Facebook;
        return c.url ? (
          <a key={c.id} href={c.url} target="_blank" rel="noreferrer noopener" className={`group flex items-center justify-between gap-4 border px-5 py-4 transition ${base}`} data-testid={`link-social-${c.id}`}>
            <span className="flex items-center gap-3"><Icon className="h-5 w-5" aria-hidden="true" /><span><span className="block text-[10px] uppercase tracking-[0.25em] opacity-70">Tropik on {c.name}</span><span className="block font-display text-xl" translate="no">{c.handle}</span></span></span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        ) : (
          <div key={c.id} className={`flex items-center gap-3 border border-dashed px-5 py-4 opacity-70 ${tone === 'dark' ? 'border-ivory-50/20 text-ivory-200' : 'border-ink-900/20 text-ink-700'}`} data-testid={`text-social-${c.id}-soon`}>
            <Icon className="h-5 w-5" aria-hidden="true" /><span><span className="block text-[10px] uppercase tracking-[0.25em]">Tropik on {c.name}</span><span className="block text-sm">Official page link coming soon</span></span>
          </div>
        );
      })}
    </div>
  );
}

export default function EditorialOffer() {
  return (
    <section id="visibility" className="scroll-mt-20 bg-ivory-100" aria-labelledby="offer-heading" data-testid="section-editorial-offer">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="text-eyebrow text-gold-600">ONE STORY · THREE STAGES</p>
          <h2 id="offer-heading" className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] text-ink-900">From an article to the printed page.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-800">Tropik tells stories across the places people actually read: the ecosystem News, the Tropik social pages, and the printed magazine.</p>
        </Reveal>
        <ol className="mt-14 grid gap-px bg-ink-900/15 md:grid-cols-3">
          {STAGES.map((st, i) => (
            <Reveal key={st.n} delay={i * 110}>
              <li className="flex h-full flex-col bg-ivory-100 p-7">
                <div className="flex items-center justify-between"><span className="font-display text-5xl text-gold-500">{st.n}</span><st.icon className="h-5 w-5 text-lagoon-700" aria-hidden="true" /></div>
                <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-700">{st.where}</p>
                <h3 className="mt-1 font-display text-3xl text-ink-900">{st.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-ink-800">{st.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-ink-700">Editorial selection applies at every stage. Social relay is chosen by the editorial team; audience varies by story and is not guaranteed per article.</p>

        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-eyebrow text-gold-600">REACH</p>
            <dl className="mt-5 grid grid-cols-2 gap-px bg-ink-900/15">
              {KIT_FIGURES.map((f) => <div key={f.label} className="bg-ivory-100 p-5"><dd className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-none text-lagoon-900" translate="no">{f.value}</dd><dt className="mt-2 text-xs uppercase tracking-[0.15em] text-ink-700">{f.label}</dt></div>)}
              {WEBSITE_READERS && <div className="col-span-2 bg-ivory-50 p-5" data-testid="text-website-readers"><dd className="font-display text-4xl text-lagoon-900" translate="no">{WEBSITE_READERS.total}</dd><dt className="mt-1 text-xs uppercase tracking-[0.15em] text-ink-700">Website readers · {WEBSITE_READERS.period} · {WEBSITE_READERS.source}</dt></div>}
            </dl>
            <p className="mt-3 text-xs text-ink-700" data-testid="text-figures-source">{KIT_FIGURES_SOURCE}</p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">FOLLOW TROPIK</p>
            <p className="mt-5 leading-relaxed text-ink-800">See the stories, covers and events on the official Tropik pages — the public audience the editorial relay speaks to.</p>
            <div className="mt-6"><SocialLinks tone="light" /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tropik-magazine/contribute" className="inline-flex items-center bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-50 hover:bg-lagoon-900" data-testid="link-offer-contribute">Propose your story</Link>
              <Link href="/news" className="inline-flex items-center border border-ink-900/30 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 hover:border-lagoon-600" data-testid="link-offer-news">Read the News</Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
