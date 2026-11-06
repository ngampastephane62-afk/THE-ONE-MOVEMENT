import { useState, type ReactNode } from 'react';
import { ART, ARTICLES, COVERS } from '../editorial-data';

export type MagPage = { key: string; label: string; section: string; chapter?: string; art?: number; node: ReactNode };

function PageImg({ n, alt }: { n: number; alt: string }) {
  const [ok, setOk] = useState(true);
  return ok
    ? <img src={ART(n)} alt={alt} draggable={false} className="h-full w-full select-none object-contain" onError={() => setOk(false)} />
    : <div className="flex h-full w-full items-end p-6 text-xs text-ink-700">{alt}</div>;
}

const Folio = ({ n, right }: { n: number; right?: boolean }) => (
  <span className={`absolute bottom-3 ${right ? 'right-4' : 'left-4'} text-[9px] uppercase tracking-[0.3em] text-ink-700/70`}>Tropik · {String(n).padStart(2, '0')}</span>
);

function Contents({ go }: { go: (page: number) => void }) {
  const items = [
    { name: 'Carine Nanikian', deck: 'Her story. Her courage. Her hope.', page: 2 },
    { name: 'Rozina Negusei', deck: 'Building bridges between Africa, business and global influence.', page: 5 },
    { name: 'Reischca Kazumba', deck: 'Afro-contemporary elegance, Dubai 2026.', page: 9 },
    { name: 'The covers', deck: 'Faces from Tropik.', page: 11 },
  ];
  return (
    <div className="flex h-full flex-col bg-[hsl(40_38%_95%)] p-[7%]">
      <p className="text-[clamp(8px,1vw,11px)] font-semibold uppercase tracking-[0.3em] text-gold-600">Editorial selection</p>
      <h3 className="mt-2 font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.85] text-ink-900">In this<br /><span className="italic">selection</span></h3>
      <ol className="mt-auto divide-y divide-ink-900/15 border-y border-ink-900/15">
        {items.map((it) => (
          <li key={it.name}>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(it.page); }} className="flex w-full items-baseline gap-3 py-[3%] text-left hover:text-lagoon-700" data-testid={`button-contents-${it.page}`}>
              <span className="font-display text-[clamp(1rem,2vw,1.6rem)] text-gold-600">{String(it.page + 1).padStart(2, '0')}</span>
              <span><span className="block font-display text-[clamp(0.95rem,1.8vw,1.35rem)] text-ink-900" translate="no">{it.name}</span><span className="block text-[clamp(9px,1vw,12px)] text-ink-700">{it.deck}</span></span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[clamp(8px,0.9vw,10px)] uppercase tracking-[0.25em] text-ink-700">African stories. Global perspectives.</p>
    </div>
  );
}

function CoversPage() {
  const rest = COVERS.filter((c) => ![12, 13, 14].includes(c.n));
  return (
    <div className="flex h-full flex-col bg-lagoon-900 p-[6%] text-ivory-50">
      <p className="text-[clamp(8px,1vw,11px)] font-semibold uppercase tracking-[0.3em] text-gold-400">The covers</p>
      <h3 className="mt-1 font-display text-[clamp(1.6rem,3.6vw,3rem)] leading-none">Faces of Tropik</h3>
      <div className="mt-[5%] grid flex-1 grid-cols-3 content-start gap-[3%]">
        {rest.map((c) => (
          <figure key={c.n}>
            <img src={ART(c.n)} alt={`Tropik Magazine cover featuring ${c.name}`} draggable={false} className="aspect-[3/4] w-full object-contain" loading="lazy" />
            <figcaption className="mt-1 truncate text-[clamp(8px,1vw,11px)] text-ivory-200" translate="no">{c.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function BackCover() {
  return (
    <div className="flex h-full flex-col justify-between bg-ink-900 p-[8%] text-ivory-50">
      <p className="font-display text-[clamp(2rem,5vw,4rem)] leading-none text-gold-400">TROPIK</p>
      <div>
        <p className="font-display text-[clamp(1.5rem,3.4vw,2.8rem)] italic leading-tight">Be global.</p>
        <p className="mt-3 max-w-[80%] text-[clamp(10px,1.1vw,13px)] leading-relaxed text-ivory-200">Fashion. Culture. Business. Influence. Published by Tropik Agency FZ LLC, Dubai.</p>
      </div>
      <p className="text-[clamp(8px,0.9vw,10px)] uppercase tracking-[0.3em] text-ivory-300" translate="no">TropikAgency.com · @tropikagencecom</p>
    </div>
  );
}

export function buildPages(go: (page: number) => void): MagPage[] {
  const [carine, rozina, reischca] = ARTICLES;
  const art = (key: string, n: number, alt: string, section: string, chapter?: string): MagPage => ({ key, label: alt, section, chapter, art: n, node: <PageImg n={n} alt={alt} /> });
  const ch = (a: typeof carine, i: number) => a.chapters[i];
  return [
    art('cover', 12, 'Cover: Carine Nanikian, October Pink 2026', 'Cover'),
    { key: 'contents', label: 'Contents', section: 'Contents', node: <Contents go={go} /> },
    art('carine-open', 10, 'Carine Nanikian opening page: I am not my cancer. I am Carine.', 'Carine', 'carine-her-story'),
    art('carine-02', ch(carine, 0).art, ch(carine, 0).artAlt, 'Carine', 'carine-her-story'),
    art('carine-04', ch(carine, 1).art, ch(carine, 1).artAlt, 'Carine', 'carine-stronger'),
    art('rozina-cover', 14, 'Cover: Rozina Negusei', 'Rozina'),
    art('rozina-02', ch(rozina, 0).art, ch(rozina, 0).artAlt, 'Rozina', 'rozina-leadership'),
    art('rozina-03', ch(rozina, 1).art, ch(rozina, 1).artAlt, 'Rozina', 'rozina-partnerships'),
    art('rozina-05', ch(rozina, 2).art, ch(rozina, 2).artAlt, 'Rozina', 'rozina-giving-back'),
    art('reischca-cover', 13, 'Cover: Reischca Kazumba', 'Reischca'),
    art('reischca-page', ch(reischca, 0).art, ch(reischca, 0).artAlt, 'Reischca', 'reischca-designer'),
    { key: 'covers', label: 'The covers', section: 'Covers', node: <CoversPage /> },
    { key: 'back', label: 'Back cover', section: 'Back', node: <BackCover /> },
  ].map((p, i) => ({ ...p, node: <div className="relative h-full w-full">{p.node}{i > 0 && p.key !== 'back' && <Folio n={i + 1} right={i % 2 === 0} />}</div> }));
}

export const CHAPTER_TITLES: Record<string, string> = Object.fromEntries(ARTICLES.flatMap((a) => a.chapters.map((c) => [c.id, `${a.name}: ${c.title}`])));
