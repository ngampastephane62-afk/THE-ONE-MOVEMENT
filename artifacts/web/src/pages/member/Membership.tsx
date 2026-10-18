import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { BadgeCheck, BookOpen, CreditCard, Loader2 } from 'lucide-react';
import { useGetProfessionalState, getGetProfessionalStateQueryKey, useGetProfessionalResource, getGetProfessionalResourceQueryKey, type ProfessionalStatePlansItem } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, errStatus } from '@/components/network/kit';
import { useMe } from './ctx';
import { errMsg, fmtDate, money, useProAct } from './proHooks';

const PERKS: Record<string, string[]> = {
  professional: ['Professional membership badge on your profile', 'Networking guide and member resources', 'Founder-reviewed introduction requests'],
  business: ['Everything in Professional', 'Company page with member attestations and founder review', 'Business and reel publishing once you have 10 verified referral followers', 'Sponsor brief'],
};
const INTRO = ['received', 'reviewing', 'introduced', 'closed'];

export default function Membership() {
  const { me } = useMe();
  const returning = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('monthly_checkout') === '1';
  const polls = useRef(0);
  const [polling, setPolling] = useState(returning);
  const q = useGetProfessionalState({ query: { queryKey: getGetProfessionalStateQueryKey(), refetchInterval: polling ? 3000 : 60000 } });
  const { run, pending } = useProAct();
  const [consent, setConsent] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [openRes, setOpenRes] = useState<string | null>(null);

  useEffect(() => {
    if (!polling || !q.dataUpdatedAt) return;
    polls.current += 1;
    if (q.data?.membership?.active || polls.current >= 15) setPolling(false);
  }, [q.dataUpdatedAt, polling, q.data?.membership?.active]);

  if (q.isLoading) return <div className="p-3 md:p-0"><Skeleton rows={4} /></div>;
  if (q.isError) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} msg="Membership details did not load." /></div>;
  const s = q.data!;
  const m = s.membership;
  const go = (p: Promise<{ url?: string }>, fallback: string) => { setErr(''); p.then((r) => { if (r.url) window.location.assign(r.url); }).catch((e) => setErr(errMsg(e, fallback))); };

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-membership">
      <header>
        <p className="text-eyebrow text-gold-700">MONTHLY MEMBERSHIP</p>
        <h1 className="font-display text-2xl text-ink-900">Work the network on purpose</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-700">Your free account stays fully editable. A paid badge shows membership only. It is not an identity check or a legal certification. Humanitarian films and donations are separate and always free to watch.</p>
      </header>
      {s.testMode && <p className="rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 text-xs text-ink-800" role="status" data-testid="text-test-mode">Real subscriptions are not enabled yet. Test checkout is closed. Your free account remains available.</p>}
      {polling && <p className="flex items-center gap-2 rounded-xl bg-lagoon-900 p-3 text-xs text-ivory-100" data-testid="status-polling"><Loader2 className="h-4 w-4 animate-spin" />Confirming your payment with our billing provider...</p>}
      {returning && !polling && !m?.active && <p className="rounded-xl border border-sand-300 p-3 text-xs text-ink-700" role="status">We have not received confirmation yet. It can take a few minutes. Refresh later; nothing is granted until billing confirms.</p>}
      {err && <p className="text-sm text-crimson-700" role="alert" data-testid="text-membership-error">{err}</p>}

      {m && (
        <section className={`${card} p-5`} data-testid="panel-current-membership">
          <div className="flex flex-wrap items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-gold-700" />
            <div className="flex-1"><p className="font-display text-lg text-ink-900">{m.tier === 'business' ? 'Business Sponsor' : 'Professional'} <span className="text-xs uppercase tracking-wider text-sand-400">{m.status}</span></p>
              <p className="text-xs text-ink-700" data-testid="text-period">{m.cancelAtPeriodEnd ? `Renewal stopped. Access until ${fmtDate(m.currentPeriodEnd)}.` : m.currentPeriodEnd ? `Renews monthly. Next renewal ${fmtDate(m.currentPeriodEnd)}.` : 'Renews monthly until you cancel.'}{m.testMode ? ' (test)' : ''}</p></div>
          </div>
          {!['pending', 'canceled', 'incomplete_expired'].includes(m.status) && !m.cancelAtPeriodEnd && <div className="mt-4 flex flex-wrap gap-2">
            <button className={btnGhost} disabled={pending} onClick={() => { if (confirm('Stop renewal? You keep access until the end of the current period.')) { setErr(''); run({ action: 'cancel', accepted: true }).catch((e) => setErr(errMsg(e, 'Cancellation failed. Try again.'))); } }} data-testid="button-cancel-membership">Cancel renewal</button>
            <button className={btnGhost} disabled={pending} onClick={() => go(run({ action: 'portal' }), 'The billing portal is not configured yet. You can still cancel here.')} data-testid="button-portal"><CreditCard className="h-3.5 w-3.5" />Billing portal</button>
          </div>}
        </section>
      )}

      {!s.available ? <Empty title="Membership checkout is not open yet" body="Billing is not configured on this server. Your free account keeps working." /> : (
        <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
          {s.plans.map((p) => <Plan key={p.slug} p={p} current={!!m?.active && m.tier === p.slug} blocked={!!m?.active} consent={consent === p.slug} onConsent={(v) => setConsent(v ? p.slug : null)} pending={pending} onCheckout={() => go(run({ action: 'checkout', tier: p.slug, accepted: true }), 'Checkout could not start. Try again.')} />)}
        </div>
      )}

      <section className={`${card} p-5`}>
        <p className="text-eyebrow text-gold-700">PUBLISHING RULES</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Ordinary posts are free after explicit network activation. No invitations or subscription are required. <Link href="/member/invite" className="font-semibold text-lagoon-700 underline">Invite friends voluntarily</Link></li>
          <li>Business posts and reels retain their existing requirement for an active subscription and 10 verified referral followers.</li>
          <li>Company review badge: Business tier, 10 unique member attestations and founder review. <Link href="/member/business" className="font-semibold text-lagoon-700 underline">Company page</Link></li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-ink-900">Member resources</h2>
        {s.resources.length === 0 ? <Empty title="No resources yet" body="Resources appear here when published." /> : s.resources.map((r) => (
          <div key={r.slug} className={`${card} p-4`} data-testid={`card-resource-${r.slug}`}>
            <div className="flex flex-wrap items-center gap-3"><BookOpen className="h-5 w-5 text-lagoon-700" /><div className="flex-1"><p className="font-semibold text-ink-900">{r.title}</p><p className="text-xs text-ink-700">{r.description}</p></div>
              <button className={btnGhost} onClick={() => setOpenRes(openRes === r.slug ? null : r.slug)} data-testid={`button-resource-${r.slug}`}>{openRes === r.slug ? 'Close' : 'Read'}</button></div>
            {openRes === r.slug && <Resource slug={r.slug} />}
          </div>
        ))}
      </section>

      {me.founder && (
        <section className={`${card} p-5`} data-testid="panel-introductions">
          <p className="text-eyebrow text-gold-700">FOUNDER QUEUE</p>
          <h2 className="font-display text-lg text-ink-900">Introduction requests</h2>
          {s.introductions.length === 0 ? <p className="mt-2 text-sm text-sand-400">No requests waiting.</p> : <ul className="mt-3 divide-y divide-sand-100">{s.introductions.map((i) => (
            <li key={i.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start" data-testid={`row-intro-${i.id}`}>
              <div className="flex-1"><p className="text-sm font-semibold text-ink-900">{i.memberName ?? 'Member'} <span className="font-normal text-sand-400">to {i.targetSlug} · {fmtDate(i.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{i.message}</p></div>
              <select className="rounded-full border border-sand-300 bg-ivory-50 px-3 py-1.5 text-xs" value={i.status} disabled={pending} onChange={(e) => { setErr(''); run({ action: 'introduction.status', id: i.id, status: e.target.value }).catch((x) => setErr(errMsg(x, 'Status update failed.'))); }} data-testid={`select-intro-${i.id}`}>{INTRO.map((v) => <option key={v} value={v}>{v}</option>)}</select>
            </li>))}</ul>}
        </section>
      )}
    </div>
  );
}

function Plan({ p, current, blocked, consent, onConsent, pending, onCheckout }: { p: ProfessionalStatePlansItem; current: boolean; blocked: boolean; consent: boolean; onConsent: (v: boolean) => void; pending: boolean; onCheckout: () => void }) {
  const dark = p.slug === 'business';
  const price = money(p.amount, p.currency);
  return (
    <article className={`rounded-3xl border p-6 ${dark ? 'border-gold-500/40 bg-lagoon-900 text-ivory-100' : 'border-sand-200 bg-ivory-50 text-ink-900'}`} data-testid={`card-plan-${p.slug}`}>
      <p className={`text-eyebrow ${dark ? 'text-gold-400' : 'text-gold-700'}`}>{p.name.toUpperCase()}</p>
      <p className="mt-2 font-display text-4xl" data-testid={`text-price-${p.slug}`}>{price}<span className="text-sm opacity-70"> / {p.interval}</span></p>
      <ul className={`mt-4 space-y-1.5 text-sm ${dark ? 'text-ivory-200' : 'text-ink-700'}`}>{(PERKS[p.slug] ?? []).map((x) => <li key={x}>- {x}</li>)}</ul>
      {current ? <p className="mt-5 text-sm font-semibold text-gold-500">Your current plan</p> : blocked ? <p className="mt-5 text-xs opacity-70">You already have an active membership. Cancel it before switching.</p> : <>
        <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} className="mt-0.5" data-testid={`checkbox-consent-${p.slug}`} />I agree to be charged {price} every {p.interval} until I cancel. I can stop renewal at any time and keep access until the period ends.</label>
        <button className={`mt-3 w-full ${dark ? 'inline-flex items-center justify-center rounded-full bg-gold-500 px-4 py-2.5 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50' : btn}`} disabled={!consent || pending} onClick={onCheckout} data-testid={`button-checkout-${p.slug}`}>Continue to secure checkout</button>
      </>}
    </article>
  );
}

function Resource({ slug }: { slug: string }) {
  const q = useGetProfessionalResource(slug, { query: { queryKey: getGetProfessionalResourceQueryKey(slug), retry: false } });
  if (q.isLoading) return <div className="mt-3"><Skeleton rows={2} /></div>;
  if (q.isError) return errStatus(q.error) === 403 || errStatus(q.error) === 402 ? <p className="mt-3 text-sm text-ink-700">This resource is for paying members.</p> : <div className="mt-3"><ErrorBox onRetry={() => q.refetch()} /></div>;
  return <div className="mt-4 space-y-3 border-t border-sand-100 pt-3">{q.data!.sections.map((x) => <div key={x.heading}><p className="font-semibold text-ink-900">{x.heading}</p><p className="whitespace-pre-wrap text-sm text-ink-700">{x.text}</p></div>)}</div>;
}
