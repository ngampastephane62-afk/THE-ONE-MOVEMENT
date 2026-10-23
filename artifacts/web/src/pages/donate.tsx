import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ExternalLink, GraduationCap } from 'lucide-react';
import HumanitarianFilms from '@/components/HumanitarianFilms';
import EditorialFilm from '@/components/EditorialFilm';
import GoldThread from '@/components/GoldThread';
import HumanitarianGallery from '@/components/humanitarian/HumanitarianGallery';
import { CheckoutPanel, OfferForm, PaymentReturn, useConfig, useReturnParams } from '@/components/humanitarian/shared';
import './donate.css';

const GROUPS = ['Displaced children', 'Orphans', 'People with disabilities', 'People with albinism', 'Women survivors of rape'];
const SOURCES = [
  { r: 'Gaza', o: 'UN OCHA · occupied Palestinian territory', u: 'https://www.unocha.org/occupied-palestinian-territory' },
  { r: 'Goma and Bukavu, eastern DRC', o: 'UNHCR · DR Congo emergency (main verifying source)', u: 'https://www.unhcr.org/emergencies/dr-congo-emergency' },
  { r: 'Ukraine', o: 'UN OCHA · Ukraine', u: 'https://www.unocha.org/ukraine' },
  { r: 'Global overview', o: 'UN OCHA', u: 'https://www.unocha.org/' },
];

const OBSERVED = '.hum-mask, .hum-chapter, .hum-curtain, .hum-film-chapter, .hum-gallery, .hum-thread';

/** Arms scroll motion only when JS runs and motion is allowed; everything stays visible otherwise. */
function useHumanitarianMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('hum-armed');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    el.querySelectorAll(OBSERVED).forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return root;
}

function Num({ n, children, light = false }: { n: string; children: React.ReactNode; light?: boolean }) {
  return <p className={`hum-chapter text-eyebrow ${light ? 'text-gold-400' : 'text-gold-600'}`}><span className="font-mono">{n}</span> · {children}</p>;
}

export default function Donate() {
  const { sessionId, cancelled } = useReturnParams();
  const cfg = useConfig();
  const root = useHumanitarianMotion();
  return (
    <div ref={root} id="top" className="hum-page bg-ivory-100">
      <Helmet><title>Humanitarian Action — TOMI Fund | The One Movement International</title><meta name="description" content="Support the TOMI humanitarian fund. Watch previous humanitarian action and films from eastern Congo, donate whenever you choose, or offer goods and logistics." /></Helmet>
      <PaymentReturn sessionId={sessionId} cancelled={cancelled} />

      {/* 01 HERO */}
      <section className="tomi-aurora-surface text-ivory-100" aria-labelledby="hero-title">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-32">
          <p className="hum-hero-fade text-eyebrow text-gold-400" style={{ ['--d' as string]: '0ms' }}>HUMANITARIAN ACTION · TOMI FUND</p>
          <h1 id="hero-title" className="mt-6 text-display-xl" data-testid="text-hero-title">
            <span className="hum-hero-line"><span style={{ ['--d' as string]: '200ms' }}>ONE FUND.</span></span>
            <span className="hum-hero-line text-gold-400"><span style={{ ['--d' as string]: '520ms' }}>WHERE THE NEED IS.</span></span>
          </h1>
          <div className="hum-hero-fade" style={{ ['--d' as string]: '900ms' }}><GoldThread className="mt-10" length="200px" node /></div>
          <p className="hum-hero-fade mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200" style={{ ['--d' as string]: '1050ms' }}>
            TOMI allocates its humanitarian fund according to urgency, not to a pre-chosen project.{' '}
            {cfg.data?.available && !cfg.data.testMode
              ? `Online donations are collected by ${cfg.data.collector}.`
              : cfg.data?.available && cfg.data.testMode
                ? 'This preview accepts test payments only. No real donation is collected.'
                : 'Online donations are not yet open. Explore our work or offer goods and logistics.'}
          </p>
          <div className="hum-hero-fade mt-10 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '1250ms' }}>
            <a href="#give" className="inline-flex min-h-12 items-center justify-center bg-gold-500 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100" data-testid="link-jump-give">Donate</a>
            <a href="#offer" className="inline-flex min-h-12 items-center justify-center border border-ivory-100/40 px-6 text-sm font-semibold uppercase tracking-[0.16em] text-ivory-100 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="link-jump-offer">Offer goods or logistics</a>
          </div>
        </div>
      </section>

      {/* 02 COMMITMENT */}
      <section className="py-section-lg" aria-labelledby="commitment-title">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Num n="02">OUR HUMANITARIAN COMMITMENT</Num>
            <GraduationCap className="mt-6 h-8 w-8 text-lagoon-600" aria-hidden />
            <h2 id="commitment-title" className="mt-4 text-display-md text-ink-900"><span className="hum-mask"><span>Schools and children's centres.</span></span></h2>
            <p className="hum-chapter mt-5 leading-relaxed text-ink-800" style={{ ['--d' as string]: '150ms' }}>TOMI's present aim is to build schools and children's centres that make education possible for those most often left out of it. These are aspirations the fund works toward, not schools already completed.</p>
          </div>
          <ul className="divide-y divide-sand-300 border-y border-sand-300 lg:col-span-6 lg:col-start-7">
            {GROUPS.map((g, i) => (
              <li key={g} className="hum-chapter flex items-baseline gap-5 py-4" style={{ ['--d' as string]: `${i * 90}ms` }}><span className="font-mono text-xs text-gold-600">0{i + 1}</span><span className="font-display text-lg text-ink-900 sm:text-xl">{g}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 PREVIOUS DONATIONS */}
      <section className="bg-ivory-50 py-section-lg" aria-labelledby="previous-title">
        <div className="mx-auto max-w-5xl px-6">
          <Num n="03">PREVIOUS HUMANITARIAN DONATIONS</Num>
          <h2 id="previous-title" className="mt-4 text-display-lg text-ink-900"><span className="hum-mask"><span>HUMANITARIAN ACTION IN EASTERN CONGO</span></span></h2>
          <p className="hum-chapter mt-4 font-mono text-xs tracking-[0.18em] text-lagoon-700" style={{ ['--d' as string]: '150ms' }}>GOMA · NORTH KIVU · DEMOCRATIC REPUBLIC OF THE CONGO</p>
          <p className="hum-chapter mt-5 max-w-2xl leading-relaxed text-ink-800" style={{ ['--d' as string]: '250ms' }}>Previous humanitarian assistance by The One Movement International, supporting people displaced by conflict in eastern Democratic Republic of the Congo.</p>
          <div className="hum-thread mt-8" aria-hidden><span /></div>
          <div className="hum-curtain mt-8 text-ink-800" style={{ ['--d' as string]: '200ms' }}>
            <EditorialFilm
              name="goma-donation"
              testId="film-goma-donation"
              label="Assistance to people displaced by war in Goma"
              caption="After the fifth edition of The One Movement, assistance was brought to people displaced by war in Goma, North Kivu, Democratic Republic of the Congo, in collaboration with UNHCR. Context supplied by the Founder."
              credit="Archive record of a past action — not an active fundraising appeal. UNHCR does not operate or endorse the current TOMI Fund."
            />
          </div>
        </div>
      </section>

      {/* 04 FILMS */}
      <div className="bg-lagoon-900">
        <div className="mx-auto max-w-5xl px-6 pt-12"><Num n="04" light>FILMS</Num></div>
        <HumanitarianFilms cinematic />
        <p className="mx-auto max-w-5xl px-6 pb-12 text-xs leading-relaxed text-ivory-300">Neither the Panzi Foundation nor FONAREV operates, receives or endorses donations made on this page.</p>
      </div>

      {/* 05 DONATION FORM */}
      <section id="give" className="scroll-mt-20 py-section-lg" aria-labelledby="give-title">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Num n="05">DONATE</Num>
            <h2 id="give-title" className="mt-4 text-display-md text-ink-900"><span className="hum-mask"><span>SUPPORT THE TOMI FUND.</span></span></h2>
            <p className="hum-chapter mt-3 font-display text-lg tracking-wide text-lagoon-700" style={{ ['--d' as string]: '150ms' }}>YOUR GENEROSITY CAN MAKE A DIFFERENCE.</p>
            <p className="hum-chapter mt-5 leading-relaxed text-ink-800" style={{ ['--d' as string]: '250ms' }}>Make a voluntary contribution to support the humanitarian mission of The One Movement International. Donations can be made whenever you choose.</p>
            <ul className="hum-chapter mt-6 space-y-2 border-l border-gold-500/60 pl-4 text-sm leading-relaxed text-ink-800" style={{ ['--d' as string]: '350ms' }}>
              <li>Each donation is a separate payment. No recurring charge will be made.</li>
              <li>Secure card payment through Stripe. TOMI never sees your card details.</li>
              <li>No earmarking and no tax-deduction receipt is claimed.</li>
              <li>Humanitarian films stay free. Donations never buy certification or ecosystem access.</li>
            </ul>
            <Link href="/the-one-documentary" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-documentary">About the documentary archive</Link>
          </div>
          <div className="min-w-0 lg:col-span-7"><CheckoutPanel kind="donation" /></div>
        </div>
      </section>

      {/* 06 GALLERY */}
      <HumanitarianGallery />

      {/* 07 OFFER */}
      <section id="offer" className="scroll-mt-20 border-t border-sand-300 py-section-lg" aria-labelledby="offer-title">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Num n="07">OFFER GOODS OR LOGISTICS</Num>
            <h2 id="offer-title" className="mt-4 text-display-md text-ink-900"><span className="hum-mask"><span>Goods, equipment, logistics.</span></span></h2>
            <p className="hum-chapter mt-5 leading-relaxed text-ink-800" style={{ ['--d' as string]: '150ms' }}>Tell us what you can provide. The team reviews each offer against current needs and replies by email. Nothing should be shipped before delivery is coordinated.</p>
          </div>
          <div className="min-w-0 lg:col-span-7"><OfferForm /></div>
        </div>
      </section>

      {/* 08 TRANSPARENCY */}
      <section className="bg-ivory-50 py-section-lg" aria-labelledby="sources-title">
        <div className="mx-auto max-w-6xl px-6">
          <Num n="08">TRANSPARENCY AND ADDITIONAL INFORMATION</Num>
          <h2 id="sources-title" className="mt-4 text-display-md text-ink-900"><span className="hum-mask"><span>Read the situation from the source.</span></span></h2>
          <p className="hum-chapter mt-4 max-w-3xl text-sm leading-relaxed text-ink-800">Donations are collected by {cfg.data?.collector ?? 'The One Movement International'} and allocated by TOMI according to need. The links below are context only. The agencies listed do not endorse TOMI, are not partners of this fund, and do not receive or process donations made on this page.</p>
          <ul className="mt-8 grid gap-px bg-sand-300 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.u} className="bg-ivory-100">
                <a href={s.u} target="_blank" rel="noreferrer" className="group flex h-full min-h-11 items-start justify-between gap-4 p-6 hover:bg-ivory-50" data-testid={`link-source-${s.r.split(' ')[0].toLowerCase()}`}>
                  <span><span className="block font-display text-lg text-ink-900 sm:text-xl">{s.r}</span><span className="mt-1 block text-sm text-ink-700">{s.o}</span></span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-gold-600 transition-transform group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
