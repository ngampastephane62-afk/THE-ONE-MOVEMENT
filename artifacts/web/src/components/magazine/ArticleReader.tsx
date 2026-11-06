import { useState } from 'react';
import { ART, ARTICLES, COVERS, type Article, type Block, type Chapter } from './editorial-data';
import PhotoActions from '@/components/editorial/PhotoActions';
import MediaActions from '@/components/editorial/MediaActions';
import { canonicalMediaSource } from '@/lib/media-share';

const ACCENT = {
  pink: { text: 'text-[hsl(338_70%_42%)]', rule: 'bg-[hsl(338_70%_52%)]', soft: 'bg-[hsl(338_60%_96%)]', border: 'border-[hsl(338_70%_52%)]', band: 'bg-[hsl(338_45%_93%)]' },
  gold: { text: 'text-gold-600', rule: 'bg-gold-500', soft: 'bg-ivory-50', border: 'border-gold-500', band: 'bg-ivory-200' },
  night: { text: 'text-gold-600', rule: 'bg-gold-500', soft: 'bg-ivory-50', border: 'border-gold-500', band: 'bg-lagoon-900' },
} as const;
type Tone = (typeof ACCENT)[keyof typeof ACCENT];

function Art({ n, alt, className = '' }: { n: number; alt: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className={`flex min-h-48 items-end bg-lagoon-900 p-5 text-xs text-ivory-200 ${className}`}>{alt}</div>;
  return <img src={ART(n)} alt={alt} loading="lazy" onError={() => setOk(false)} className={`block h-auto w-full bg-ivory-200 object-contain ${className}`} />;
}

function BlockView({ b, tone }: { b: Block; tone: Tone }) {
  switch (b.t) {
    case 'p': return <p className={b.lead ? 'text-[1.2rem] leading-[1.7] text-ink-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-gold-600' : 'text-[1.05rem] leading-[1.8] text-ink-800'}>{b.text}</p>;
    case 'h': return <h4 className={`pt-4 font-display text-2xl uppercase tracking-wide ${tone.text}`}>{b.text}</h4>;
    case 'quote': return (
      <blockquote className={`my-4 border-l-2 ${tone.border} py-1 pl-5 md:-ml-8 md:pl-7`}>
        <p className="font-display text-2xl italic leading-snug text-ink-900 md:text-[1.85rem]">{b.text}</p>
        {b.by && <footer className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-700">{b.by}</footer>}
      </blockquote>
    );
    case 'list': return (
      <div className={`${tone.soft} px-5 py-4`}>
        {b.title && <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${tone.text}`}>{b.title}</p>}
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-display text-lg text-ink-900">{b.items.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
    );
    case 'callout': return (
      <aside className={`mt-6 border ${tone.border} ${tone.soft} p-5 md:p-6`}>
        <p className={`font-display text-xl ${tone.text}`}>{b.title}</p>
        {b.text.map((t) => <p key={t} className="mt-3 text-[0.98rem] leading-relaxed text-ink-800">{t}</p>)}
      </aside>
    );
  }
}

function ChapterView({ c, tone, index, total }: { c: Chapter; tone: Tone; index: number; total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <section id={c.id} tabIndex={-1} className="outline-none scroll-mt-28 border-t border-ink-900/10 pt-10 first:border-t-0 first:pt-0" data-testid={`chapter-${c.id}`}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <button type="button" onClick={() => setOpen(true)} className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" aria-label={`Open the original magazine page: ${c.title}`} data-testid={`button-open-page-${c.id}`}>
              <Art n={c.art} alt={c.artAlt} className="shadow-[0_24px_50px_-24px_hsl(187_67%_12%/0.55)] transition-transform duration-500 group-hover:-translate-y-1" />
              <span className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700"><span>Original page {c.page !== '—' ? c.page : ''}</span><span className="underline underline-offset-4 group-hover:text-lagoon-700">View full page</span></span>
            </button>
            {c.caption?.map((t) => <p key={t} className="mt-3 border-l border-ink-900/20 pl-3 text-xs italic leading-relaxed text-ink-700">{t}</p>)}
            <PhotoActions source={ART(c.art)} title={`Tropik Magazine page: ${c.title}`} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.text}`}>Chapter {index + 1} of {total} · {c.kicker}</p>
          <h3 className="mt-3 font-display text-4xl leading-[0.95] text-ink-900 md:text-6xl">{c.title}</h3>
          {c.deck && <p className="mt-3 font-display text-xl italic text-ink-700 md:text-2xl">{c.deck}</p>}
          <div className={`my-7 h-px w-16 ${tone.rule}`} />
          <div className="max-w-[38rem] space-y-5">{c.blocks.map((b, i) => <BlockView key={i} b={b} tone={tone} />)}</div>
        </div>
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={c.title} className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/90 p-3" onClick={() => setOpen(false)}>
          <button type="button" className="absolute right-4 top-4 border border-ivory-200/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-50" onClick={() => setOpen(false)} data-testid="button-close-page">Close</button>
          <img src={ART(c.art)} alt={c.artAlt} className="max-h-[70dvh] w-auto max-w-full object-contain sm:max-h-[78dvh]" onClick={(e) => e.stopPropagation()} />
          <div className="absolute inset-x-0 bottom-0 max-h-[30dvh] overflow-y-auto border-t border-ivory-100/15 bg-ink-900/95 px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <MediaActions source={canonicalMediaSource(ART(c.art))} title={`Tropik Magazine page: ${c.title}`} tone="dark" compact />
          </div>
        </div>
      )}
    </section>
  );
}

function ArticleView({ a, n }: { a: Article; n: number }) {
  const tone = ACCENT[a.accent];
  const night = a.accent === 'night';
  return (
    <article id={a.slug} className="scroll-mt-24" data-testid={`article-${a.slug}`}>
      <header className={`relative overflow-hidden ${night ? 'bg-lagoon-900 text-ivory-50' : tone.band + ' text-ink-900'}`}>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${night ? 'text-gold-400' : tone.text}`}>Story {String(n).padStart(2, '0')} · {a.edition}</p>
            <h2 className="mt-5 font-display text-[clamp(3rem,11vw,8rem)] uppercase leading-[0.85]" translate="no">{a.name}</h2>
            <p className={`mt-6 max-w-2xl font-display text-2xl leading-snug md:text-3xl ${night ? 'text-ivory-100' : 'text-ink-800'}`}>{a.headline}</p>
          </div>
          <div className="flex flex-col justify-end md:col-span-4">
            <p className={`border-l-2 pl-4 font-display text-lg italic ${night ? 'border-gold-500 text-ivory-200' : `${tone.border} text-ink-700`}`}>{a.deck}</p>
            <p className={`mt-4 text-[10px] uppercase tracking-[0.24em] ${night ? 'text-ivory-300' : 'text-ink-700'}`}>{a.tags}</p>
          </div>
        </div>
      </header>
      {a.slug === 'carine-nanikian' && (
        <div className="mx-auto max-w-7xl px-6 pt-10">
          <figure className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-5"><Art n={10} alt="Tropik Magazine opening page: Carine Nanikian in a treatment chair, captioned I am not my cancer. I am Carine." /><PhotoActions source={ART(10)} title="Tropik Magazine opening page · Carine Nanikian" /></div>
            <figcaption className="md:col-span-7 md:pb-6">
              <p className="font-display text-4xl italic leading-tight text-ink-900 md:text-5xl">“I am not my cancer. <span className={tone.text}>I am Carine.</span>”</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-ink-700">Real stories · Stronger women</p>
            </figcaption>
          </figure>
        </div>
      )}
      {a.health && (
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <p className={`border ${tone.border} bg-ivory-50 px-4 py-3 text-xs leading-relaxed text-ink-800`} data-testid="text-health-note">
            <strong className="font-semibold">A personal story.</strong> This feature is Carine’s first-person account as published in Tropik Magazine. It is not medical advice. For your own health, speak with a qualified healthcare professional.
          </p>
        </div>
      )}
      <div className="mx-auto max-w-7xl space-y-14 px-6 py-14 md:py-20">
        {a.chapters.map((c, i) => <ChapterView key={c.id} c={c} tone={tone} index={i} total={a.chapters.length} />)}
      </div>
    </article>
  );
}

export function StoriesIndex() {
  return (
    <nav aria-label="Stories in this issue" className="grid gap-px bg-ink-900/15 md:grid-cols-3">
      {ARTICLES.map((a, i) => (
        <a key={a.slug} href={`#${a.slug}`} className="group flex gap-4 bg-ivory-100 p-5 transition-colors hover:bg-ivory-50" data-testid={`link-story-${a.slug}`}>
          <span className="font-display text-4xl text-gold-500">{String(i + 1).padStart(2, '0')}</span>
          <span>
            <span className="block font-display text-xl text-ink-900 group-hover:text-lagoon-700" translate="no">{a.name}</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-700">{a.deck}</span>
          </span>
        </a>
      ))}
    </nav>
  );
}

export function Articles() {
  return <div>{ARTICLES.map((a, i) => <ArticleView key={a.slug} a={a} n={i + 1} />)}</div>;
}

export function CoverWall() {
  return (
    <section id="covers" className="scroll-mt-24 bg-lagoon-900 py-16 text-ivory-50 md:py-24" aria-labelledby="covers-heading" data-testid="section-covers">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-gold-400">THE COVERS</p>
            <h2 id="covers-heading" className="mt-3 font-display text-4xl md:text-6xl">Faces of the issue.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ivory-200">Cover portraits from Tropik. Some faces appear here on the cover alone.</p>
        </div>
      </div>
      <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:mx-auto md:max-w-7xl md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-7 lg:gap-4">
        {COVERS.map((c) => (
          <li key={c.n} className="w-[62vw] shrink-0 snap-start md:w-auto" data-testid={`cover-${c.n}`}>
            <Art n={c.n} alt={`Tropik Magazine cover featuring ${c.name}`} />
            <p className="mt-3 font-display text-lg" translate="no">{c.name}</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400">{c.note}</p>
            <PhotoActions source={ART(c.n)} title={`Tropik Magazine cover · ${c.name}`} tone="dark" />
          </li>
        ))}
      </ul>
    </section>
  );
}
