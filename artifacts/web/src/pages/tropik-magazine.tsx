import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useSearch } from 'wouter';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import Flipbook from '@/components/magazine/flipbook/Flipbook';
import EditorialOffer from '@/components/magazine/EditorialOffer';
import PrintHeritage from '@/components/magazine/PrintHeritage';
import { Articles, CoverWall } from '@/components/magazine/ArticleReader';
import MagazineLibrary from '@/components/magazine/MagazineLibrary';
import MagazineStats from '@/components/magazine/MagazineStats';
import MediaKit, { KitDownload } from '@/components/magazine/MediaKit';
import TropikArticles from '@/components/magazine/TropikArticles';

// The former 10 USD / 25 USD storefront (OrderForm, MyOrders, FounderOrders, CheckoutReturn) is retired
// from this route. Components remain in the repo for audit.
const SECTIONS = [['Open the magazine', '#reader'], ['Read in full', '#reading-room'], ['Articles', '#tropik-articles'], ['In print', '#print'], ['Visibility', '#visibility'], ['Media kit', '#media-kit']] as const;

export default function TropikMagazine() {
  const params = new URLSearchParams(useSearch());
  const legacy = params.has('format') || params.get('checkout') === 'complete' || params.get('checkout') === 'cancelled';
  const reduce = useReducedMotion();
  const [, navigate] = useLocation();
  const reading = params.get('read') === '1';
  const rawPage = params.get('page');
  const startPage = rawPage && /^\d{1,2}$/.test(rawPage) ? Math.min(12, parseInt(rawPage, 10)) : 0;
  const openBook = (p: number) => { navigate(`/tropik-magazine?read=1${p ? `&page=${p}` : ''}`); window.scrollTo({ top: 0 }); };
  const closeBook = () => { navigate('/tropik-magazine'); requestAnimationFrame(() => document.getElementById('library')?.focus()); };
  useEffect(() => { if (!reading) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented && !document.fullscreenElement && !document.querySelector('[role="dialog"]')) closeBook(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }); // eslint-disable-line react-hooks/exhaustive-deps
  const [kitOpen, setKitOpen] = useState(false);
  useEffect(() => { if (window.location.hash === '#media-kit') setKitOpen(true); }, []);

  const read = (id: string) => {
    if (reading) navigate('/tropik-magazine');
    setTimeout(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
    }, reading ? 120 : 0);
  };
  const rise = (d: number): MotionProps => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: d, ease: [0.2, 0.7, 0.2, 1] as const } });

  return (
    <div className="min-h-[100dvh] bg-ivory-100 text-ink-900">
      <Helmet>
        <title>Tropik Magazine — open the digital magazine | TOMI</title>
        <meta name="description" content="Leaf through Tropik Magazine: Carine Nanikian, Rozina Negusei and Reischca Kazumba, read in full. Print heritage, the Tropik social pages and the free 2026 media kit." />
      </Helmet>

      {legacy && (
        <div className="border-b border-gold-500/40 bg-ivory-50" role="status" data-testid="text-legacy-notice">
          <p className="mx-auto max-w-7xl px-6 py-3 text-sm text-ink-800">Reader editions are not on sale yet. Open the editorial selection below — and download the media kit, free.</p>
        </div>
      )}

      {/* The reading table */}
      <section id="reader" className="relative overflow-hidden bg-lagoon-900 text-ivory-50" aria-labelledby="mag-title">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_58%,hsl(40_60%_70%/0.22),transparent_70%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-500/40" aria-hidden="true" />
        <div className={`relative mx-auto max-w-7xl px-4 ${reading ? 'pb-10 pt-4' : 'pb-16 pt-10 md:pb-24 md:pt-14'} sm:px-6`}>
          <div className={reading ? 'sr-only' : 'flex flex-wrap items-end justify-between gap-6'}>
            <div>
              <motion.p {...rise(0)} className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-400">The digital magazine · Editorial selection</motion.p>
              <motion.h1 {...rise(0.1)} id="mag-title" className="mt-3 font-display text-[clamp(3.5rem,13vw,10rem)] leading-[0.8] tracking-tight" translate="no">TROPIK</motion.h1>
              <motion.p {...rise(0.2)} className="mt-3 font-display text-xl italic text-ivory-200 md:text-2xl">People, culture and purpose. African stories, global perspectives.</motion.p>
            </div>
            <motion.div {...rise(0.3)} className="max-w-xs text-sm leading-relaxed text-ivory-300">
              Turn the pages with the arrows, a swipe or your keyboard. Every story can also be read as text.
            </motion.div>
          </div>
          {reading ? (
            <>
            <motion.div {...(reduce ? {} : { initial: { opacity: 0, y: 40, rotateX: 10 }, animate: { opacity: 1, y: 0, rotateX: 0 }, transition: { duration: 1, ease: [0.2, 0.7, 0.2, 1] } })} className="mt-8" style={{ transformPerspective: 1600 }}>
              <Flipbook key={startPage} onRead={read} active startPage={startPage} onClose={closeBook} />
            </motion.div>
            <div className="mx-auto mt-12 max-w-3xl"><MagazineStats /></div>
            </>
          ) : (
            <div id="library" tabIndex={-1} className="mt-12 grid gap-10 outline-none lg:grid-cols-[minmax(0,1fr)_22rem] md:mt-16">
              <div>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ivory-50/15 pb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">The library</p>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">Choose a cover. Open the book.</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory-200">Three covers open the editorial selection: 13 pages, three complete stories. The other covers were supplied on their own and can be inspected, not read.</p>
                  </div>
                  <button type="button" onClick={() => openBook(0)} className="inline-flex items-center bg-gold-500 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="button-open-magazine">Open the magazine</button>
                </div>
                <MagazineLibrary onOpen={openBook} />
              </div>
              <div className="lg:sticky lg:top-16 lg:self-start"><MagazineStats /></div>
            </div>
          )}
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-ink-900/10 bg-ivory-100/95 backdrop-blur">
        <nav aria-label="On this page" className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
          {SECTIONS.map(([l, h]) => <a key={h} href={h} onClick={(e) => { if (h === '#media-kit') setKitOpen(true); if (h === '#reader' && !reading) { e.preventDefault(); openBook(0); } }} className="shrink-0 text-ink-800 hover:text-lagoon-700" data-testid={`link-section-${h.slice(1)}`}>{l}</a>)}
          <Link href="/tropik-magazine/contribute" className="ml-auto shrink-0 text-lagoon-700" data-testid="link-section-contribute">Contribute</Link>
        </nav>
      </div>

      <section id="reading-room" className="scroll-mt-12" aria-labelledby="reading-heading">
        <div className="mx-auto max-w-7xl px-6 pb-4 pt-16 md:pt-24">
          <p className="text-eyebrow text-gold-600">THE READING ROOM</p>
          <h2 id="reading-heading" className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.92]">Read in full.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ink-800">The complete text of each feature in this editorial selection, set for comfortable reading on any screen.</p>
        </div>
        <Articles />
      </section>

      <TropikArticles />

      <PrintHeritage />
      <EditorialOffer />
      <CoverWall />

      <section id="media-kit-intro" className="border-t border-ink-900/15 bg-ivory-50" aria-labelledby="kit-intro-heading">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-eyebrow text-gold-600">FOR PARTNERS</p>
            <h2 id="kit-intro-heading" className="mt-3 font-display text-4xl md:text-5xl">Media kit 2026</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-800">The platform, its reach, the editorial ecosystem and partnership opportunities. Free to read and download.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setKitOpen((o) => !o)} aria-expanded={kitOpen} aria-controls="media-kit" className="inline-flex items-center bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-50 hover:bg-lagoon-900" data-testid="button-toggle-kit">{kitOpen ? 'Close the media kit' : 'Read the media kit'}</button>
            <KitDownload compact />
          </div>
        </div>
      </section>
      {kitOpen ? <MediaKit /> : <div id="media-kit" />}

      <section className="bg-ink-900 text-ivory-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <p className="text-eyebrow text-gold-400">CONTRIBUTE</p>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">Your story, in these pages.</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ivory-200">Propose an article. The Founder reads every proposal. Accepted stories are considered for the News and the Tropik social pages, and you may reserve one inside page of the printed magazine for USD 200 — only after acceptance, with the conditions written out.</p>
          </div>
          <div className="flex items-end md:col-span-5 md:justify-end">
            <Link href="/tropik-magazine/contribute" className="inline-flex items-center bg-gold-500 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400" data-testid="link-contribute-footer">Open the contributor space</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
