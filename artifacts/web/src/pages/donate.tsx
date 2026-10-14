import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { HandHeart, Hourglass, RotateCw, ShieldCheck, Users } from 'lucide-react';
import { useGetDonationCampaign } from '@workspace/api-client-react';
import HumanitarianFilms from '@/components/HumanitarianFilms';

const PROPOSED = ['Panzi Foundation', 'Juhudi', 'MONUSCO', 'UNICEF', 'UNHCR'];

export default function Donate() {
  const q = useGetDonationCampaign();
  const c = q.data;
  return (
    <>
      <Helmet><title>HUMANITARIAN ACTION — THE ONE MOVEMENT INTERNATIONAL</title><meta name="description" content="TOMI humanitarian campaign readiness for eastern DRC and ways to engage today." /></Helmet>
      <section className="tomi-aurora-surface text-ivory-100">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-eyebrow text-gold-400">HUMANITARIAN ACTION</p>
          {q.isLoading ? <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-ivory-100/10" /> : <h1 className="mt-3 text-display-lg" data-testid="text-campaign-title">{c?.title ?? 'Humanitarian campaign'}</h1>}
          {c && <p className="mt-6 max-w-2xl leading-relaxed text-ivory-300">{c.description}</p>}
        </div>
      </section>

      <HumanitarianFilms />

      <section className="mx-auto max-w-5xl px-6 pt-14" aria-labelledby="routes-title">
        <h2 id="routes-title" className="text-display-md text-ink-900">Two separate giving routes — not enabled on this site</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="border border-gold-500/40 bg-ivory-50 p-6" data-testid="status-panzi-route">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700"><Hourglass className="h-4 w-4" />Direct to Panzi · awaiting approval</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">Once the Panzi Foundation gives its approval, this page will direct you to Panzi’s own official donation page. Your gift would then be received and processed by Panzi, not by TOMI.</p>
            <p className="mt-3 text-xs leading-relaxed text-ink-700">Panzi’s approval and the official destination have not yet been confirmed for this site. Panzi’s film names the campaign address panzi.org/endthewar; it is mentioned here for reference only and is not yet a TOMI-confirmed donation link.</p>
          </div>
          <div className="border border-sand-200 bg-ivory-50 p-6" data-testid="status-tomi-route">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon-700"><Hourglass className="h-4 w-4" />Collected by TOMI · inactive</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">A TOMI-run collection is separate, and its status is shown below. It stays closed until a specific campaign, its beneficiary and the required authorization are confirmed.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        {q.isError ? (
          <div className="flex items-center gap-3 border border-crimson-700/30 bg-crimson-700/5 p-5" role="alert">
            <p className="text-sm text-crimson-700">Campaign status could not be loaded.</p>
            <button onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 bg-lagoon-900 px-4 py-2 text-xs uppercase tracking-wider text-ivory-100"><RotateCw className="h-3.5 w-3.5" />Retry</button>
          </div>
        ) : q.isLoading ? <div className="h-40 animate-pulse bg-ivory-200" /> : c && (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="border border-gold-500/40 bg-ivory-50 p-7" data-testid="status-campaign">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700"><Hourglass className="h-4 w-4" />{c.active ? 'Collection open' : 'Not collecting donations yet'}</p>
              <p className="mt-3 leading-relaxed text-ink-800">{c.reason}</p>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-eyebrow text-gold-700">COLLECTOR</dt><dd className="mt-1 text-ink-900">{c.collector}</dd></div>
                <div><dt className="text-eyebrow text-gold-700">BENEFICIARY</dt><dd className="mt-1 text-ink-900">{c.beneficiary ?? 'Not yet fixed — selected per emergency before any collection'}</dd></div>
              </dl>
              <p className="mt-6 text-xs leading-relaxed text-ink-700">Donations are intentionally inactive until a specific campaign, its beneficiary and the required authorization are confirmed. We publish no totals or impact figures before real funds exist.</p>
            </div>
            <div className="flex flex-col gap-4 bg-lagoon-900 p-7 text-ivory-200">
              <p className="text-eyebrow text-gold-400">COLLABORATIONS IDENTIFIED BY THE FOUNDER</p>
              <p className="text-sm">For emergencies in eastern DRC, the Founder has identified organizations such as:</p>
              <ul className="flex flex-wrap gap-2">{PROPOSED.map((p) => <li key={p} className="border border-gold-500/40 px-2.5 py-1 text-xs">{p}</li>)}</ul>
              <p className="text-xs text-ivory-300">They are not automatically parties to, or recipients of, every campaign. Each organization's participation is confirmed for a specific campaign before any collection opens. No contract, endorsement or tax receipt is claimed here.</p>
            </div>
          </div>
        )}

        <h2 className="mt-16 text-display-md text-ink-900">Engage now, without giving money</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <Link href="/sign-up" className="group border border-sand-200 bg-ivory-50 p-6 hover:border-gold-500" data-testid="link-donate-join">
            <Users className="h-5 w-5 text-lagoon-600" /><p className="mt-3 font-display text-lg text-ink-900">Join the member network</p>
            <p className="mt-1 text-sm text-ink-700">Free account. Meet NGO workers, health and humanitarian professionals, present your field work and open conversations.</p>
          </Link>
          <Link href="/member/certifications" className="border border-sand-200 bg-ivory-50 p-6 hover:border-gold-500" data-testid="link-donate-cert">
            <ShieldCheck className="h-5 w-5 text-lagoon-600" /><p className="mt-3 font-display text-ink-900">Apply as partner</p><p className="mt-1 text-sm text-ink-700">NGOs and sponsors can request reviewed official status.</p>
          </Link>
          <Link href="/ecosystem" className="border border-sand-200 bg-ivory-50 p-6 hover:border-gold-500">
            <HandHeart className="h-5 w-5 text-lagoon-600" /><p className="mt-3 font-display text-ink-900">Humanitarian sectors</p><p className="mt-1 text-sm text-ink-700">Explore humanitarian action, health care and NGO pathways.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
