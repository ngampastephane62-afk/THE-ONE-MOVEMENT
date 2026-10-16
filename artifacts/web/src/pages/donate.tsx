import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ExternalLink, GraduationCap, Package, Truck, Wrench, Banknote } from 'lucide-react';
import HumanitarianFilms from '@/components/HumanitarianFilms';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';
import { CheckoutPanel, OfferForm, PaymentReturn, useConfig, useReturnParams } from '@/components/humanitarian/shared';

const GROUPS = ['Displaced children', 'Orphans', 'People with disabilities', 'People with albinism', 'Women survivors of rape'];
const FORMS = [
  { i: Banknote, t: 'Money', d: 'One-time card payment in USD or AED, collected by TOMI.' },
  { i: Package, t: 'Goods', d: 'School supplies, clothing, hygiene and essentials.' },
  { i: Wrench, t: 'Equipment', d: 'Furniture, computers, medical or building equipment.' },
  { i: Truck, t: 'Logistics', d: 'Transport, storage, customs and field support.' },
];
const SOURCES = [
  { r: 'Gaza', o: 'UN OCHA · occupied Palestinian territory', u: 'https://www.unocha.org/occupied-palestinian-territory' },
  { r: 'Goma and Bukavu, eastern DRC', o: 'UNHCR · DR Congo emergency (main verifying source)', u: 'https://www.unhcr.org/emergencies/dr-congo-emergency' },
  { r: 'Ukraine', o: 'UN OCHA · Ukraine', u: 'https://www.unocha.org/ukraine' },
  { r: 'Global overview', o: 'UN OCHA', u: 'https://www.unocha.org/' },
];

export default function Donate() {
  const { sessionId, cancelled } = useReturnParams();
  const cfg = useConfig();
  return (
    <div className="bg-ivory-100">
      <Helmet><title>Humanitarian Action — TOMI Humanitarian Fund | The One Movement International</title><meta name="description" content="Support the TOMI humanitarian fund with money, goods, equipment or logistics. Current priority: education for displaced and vulnerable children and survivors." /></Helmet>
      <PaymentReturn sessionId={sessionId} cancelled={cancelled} />

      <section className="tomi-aurora-surface text-ivory-100">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">HUMANITARIAN ACTION · TOMI FUND</p>
          <h1 className="mt-5 text-display-xl animate-cinematic-2" style={{ textWrap: 'balance' }}>ONE FUND.<span className="block text-gold-400">WHERE THE NEED IS.</span></h1>
          <GoldThread className="mt-10" length="200px" node />
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200 animate-cinematic-3">
            Contributions are collected by {cfg.data?.collector ?? 'The One Movement International'}. TOMI decides how the fund is allocated, according to the emergency at hand. You give to the fund, not to a pre-chosen project.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#give" className="bg-gold-500 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-ink-900 hover:bg-gold-400" data-testid="link-jump-give">Give money</a>
            <a href="#offer" className="border border-ivory-100/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-ivory-100 hover:border-gold-400" data-testid="link-jump-offer">Offer goods or logistics</a>
          </div>
        </div>
      </section>

      <section className="py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <GraduationCap className="h-8 w-8 text-lagoon-600" />
            <p className="mt-4 text-eyebrow text-gold-600">CURRENT PRIORITY</p>
            <h2 className="mt-3 text-display-md text-ink-900">Schools and children's centres.</h2>
            <p className="mt-5 leading-relaxed text-ink-800">TOMI's present aim is to build schools and children's centres that make education possible for those most often left out of it. These are aspirations the fund works toward, not schools already completed.</p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <ul className="divide-y divide-sand-300 border-y border-sand-300">
              {GROUPS.map((g, i) => (
                <li key={g} className="flex items-baseline gap-5 py-4"><span className="font-mono text-xs text-gold-600">0{i + 1}</span><span className="font-display text-xl text-ink-900">{g}</span></li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-lg text-ivory-100">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-400">FOUR WAYS TO HELP</p>
          <div className="mt-8 grid gap-px bg-gold-500/20 sm:grid-cols-2 lg:grid-cols-4">
            {FORMS.map(({ i: I, t, d }) => (
              <div key={t} className="bg-lagoon-900 p-7"><I className="h-5 w-5 text-gold-400" /><h3 className="mt-4 font-display text-xl">{t}</h3><p className="mt-2 text-sm text-ivory-300">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="give" className="scroll-mt-20 py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">GIVE MONEY</p>
            <h2 className="mt-3 text-display-md text-ink-900">A single, one-time gift.</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-800">
              <li>Collected by The One Movement International through Stripe.</li>
              <li>No earmarking: TOMI allocates according to emergency.</li>
              <li>No recurring charge. No tax-deduction receipt is claimed.</li>
              <li>Humanitarian films are free for everyone. Donations never buy certification, publication rights or professional ecosystem access.</li>
            </ul>
            <Link href="/the-one-documentary" className="mt-6 inline-block text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-documentary">About the documentary archive</Link>
          </div>
          <div className="lg:col-span-7"><CheckoutPanel kind="donation" /></div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-20 border-t border-sand-300 py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">OFFER IN KIND</p>
            <h2 className="mt-3 text-display-md text-ink-900">Goods, equipment, logistics.</h2>
            <p className="mt-5 leading-relaxed text-ink-800">Tell us what you can provide. The team reviews each offer against current needs and replies by email. Nothing should be shipped before delivery is coordinated.</p>
          </div>
          <div className="lg:col-span-7"><OfferForm /></div>
        </div>
      </section>

      <div className="bg-lagoon-900 pt-4">
        <div className="mx-auto max-w-5xl px-6 pt-14 text-ivory-100">
          <p className="text-eyebrow text-gold-400">TOMI'S PAST HUMANITARIAN FILMS</p>
          <p className="mt-3 max-w-2xl text-sm text-ivory-300">Films from TOMI's earlier humanitarian work, each shown with its own source credit.</p>
        </div>
        <HumanitarianFilms />
      </div>

      <section className="py-section-lg">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-600">OFFICIAL CRISIS INFORMATION</p>
          <h2 className="mt-3 text-display-md text-ink-900">Read the situation from the source.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-800">These links are context only, so you can follow each crisis through official humanitarian reporting. The agencies listed do not endorse TOMI, are not partners of this fund, and do not receive or process the donations made on this page.</p>
          <ul className="mt-8 grid gap-px bg-sand-300 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.u} className="bg-ivory-100">
                <a href={s.u} target="_blank" rel="noreferrer" className="group flex h-full items-start justify-between gap-4 p-6 hover:bg-ivory-50" data-testid={`link-source-${s.r.split(' ')[0].toLowerCase()}`}>
                  <span><span className="block font-display text-xl text-ink-900">{s.r}</span><span className="mt-1 block text-sm text-ink-700">{s.o}</span></span>
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
