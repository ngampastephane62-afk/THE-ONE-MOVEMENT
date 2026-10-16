import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateMagazineSubmission, useUpdateMagazineSubmission, useWithdrawMagazineSubmission, useReviewMagazineSubmission,
  useCheckoutMagazineOrder, useGetMagazineAdminSubmissions, useGetMagazineOrder,
  getGetMagazineSubmissionsQueryKey, getGetMagazineAdminSubmissionsQueryKey, getGetMagazineOrderQueryKey,
  type MagazineConfig, type MagazineSubmission,
} from '@workspace/api-client-react';
import { inputCls, labelCls, primaryBtn, ghostBtn, newRequestId } from './shared';

export function useSubmissionKeys() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const uid = userId ?? 'anon';
  return {
    isLoaded, signedIn: !!isSignedIn && !!userId,
    own: [...getGetMagazineSubmissionsQueryKey(), uid] as const,
    admin: [...getGetMagazineAdminSubmissionsQueryKey(), uid] as const,
    order: (id: number) => [...getGetMagazineOrderQueryKey(id), uid] as const,
  };
}

function useInvalidate() {
  const qc = useQueryClient();
  const k = useSubmissionKeys();
  return () => { qc.invalidateQueries({ queryKey: k.own }); qc.invalidateQueries({ queryKey: k.admin }); };
}

export const errMsg = (e: unknown, fallback: string) => {
  const d = (e as { data?: { error?: string; message?: string } } | null)?.data;
  return d?.error || d?.message || fallback;
};

export const EDITABLE = ['submitted', 'declined', 'approved'];
export const FEATURE_STATUS: Record<string, { label: string; tone: string; text: string }> = {
  submitted: { label: 'Under review', tone: 'border-gold-500 bg-ivory-50 text-ink-900', text: 'The Founder will read your proposal. No payment is possible yet.' },
  approved: { label: 'Accepted · awaiting your decision', tone: 'border-lagoon-600 bg-lagoon-50 text-lagoon-900', text: 'Read the Founder’s conditions below. You may pay USD 200 only if you accept them.' },
  declined: { label: 'Declined', tone: 'border-crimson-700 bg-crimson-50 text-crimson-700', text: 'You may revise and resubmit. Editing sends it back for review.' },
  withdrawn: { label: 'Withdrawn', tone: 'border-sand-300 bg-ivory-200 text-ink-700', text: 'You withdrew this proposal. No payment was taken.' },
  checkout_pending: { label: 'Checkout opened · not yet paid', tone: 'border-sand-300 bg-ivory-200 text-ink-800', text: 'Payment has not been confirmed. You can resume checkout.' },
  paid: { label: 'Paid · page reserved', tone: 'border-lagoon-900 bg-lagoon-900 text-ivory-50', text: 'Payment verified. Publication follows the edition conditions in the Founder’s note — payment does not publish anything automatically.' },
  refunded: { label: 'Refunded', tone: 'border-sand-300 bg-ivory-200 text-ink-700', text: 'This reservation was refunded.' },
  disputed: { label: 'Payment disputed', tone: 'border-crimson-700 bg-crimson-50 text-crimson-700', text: 'This payment is under dispute with the card provider.' },
};
export function FeatureStatus({ status, id }: { status: string; id: number }) {
  const s = FEATURE_STATUS[status] ?? { label: status, tone: 'border-sand-300 bg-ivory-200 text-ink-800', text: '' };
  return <span data-testid={`status-proposal-${id}`} className={`inline-flex border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${s.tone}`}>{s.label}</span>;
}

type Fields = { fullName: string; title: string; body: string; photoUrl: string };
const EMPTY: Fields = { fullName: '', title: '', body: '', photoUrl: '' };

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  const n = f.fullName.trim(), t = f.title.trim(), b = f.body.trim(), p = f.photoUrl.trim();
  if (n.length < 2 || n.length > 120) e.fullName = 'Name must be 2 to 120 characters.';
  if (t.length < 5 || t.length > 180) e.title = 'Title must be 5 to 180 characters.';
  if (b.length < 100 || b.length > 20000) e.body = 'Article must be 100 to 20,000 characters.';
  if (p) { try { const u = new URL(p); if (u.protocol !== 'https:') throw 0; } catch { e.photoUrl = 'Use a full https:// link.'; } if (p.length > 2000) e.photoUrl = 'Link is too long (2,000 max).'; }
  return e;
}

export function ProposalForm({ editing, onDone }: { editing: MagazineSubmission | null; onDone: () => void }) {
  const invalidate = useInvalidate();
  const create = useCreateMagazineSubmission();
  const update = useUpdateMagazineSubmission();
  const [f, setF] = useState<Fields>(editing ? { fullName: editing.fullName, title: editing.title, body: editing.body, photoUrl: editing.photoUrl ?? '' } : EMPTY);
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const attempt = useRef<{ sig: string; id: string } | null>(null);
  const errors = validate(f);
  const pending = create.isPending || update.isPending;
  const set = (k: keyof Fields) => (v: string) => { setF((o) => ({ ...o, [k]: v })); setSaved(''); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault(); setTouched(true); setError('');
    if (Object.keys(errors).length || !accepted) return;
    const payload = { fullName: f.fullName.trim(), title: f.title.trim(), body: f.body.trim(), ...(f.photoUrl.trim() ? { photoUrl: f.photoUrl.trim() } : {}), accepted: true as const };
    const sig = JSON.stringify([editing?.id ?? 0, payload]);
    if (!attempt.current || attempt.current.sig !== sig) attempt.current = { sig, id: newRequestId() };
    const requestId = attempt.current.id;
    if (editing) {
      update.mutate({ id: editing.id, data: { ...payload, requestId, expectedUpdatedAt: editing.updatedAt } }, {
        onSuccess: () => { attempt.current = null; invalidate(); onDone(); },
        onError: (e) => { setError(errMsg(e, 'Your changes could not be saved. They are still here — try again.')); invalidate(); },
      });
    } else {
      create.mutate({ data: { ...payload, requestId } }, {
        onSuccess: () => { attempt.current = null; setF(EMPTY); setAccepted(false); setTouched(false); setSaved('Proposal received. It now waits for the Founder’s review — you can follow it below.'); invalidate(); },
        onError: (e) => setError(errMsg(e, 'The proposal could not be saved. Your text is kept — retrying will not create a duplicate.')),
      });
    }
  };

  const Err = ({ k }: { k: keyof Fields }) => touched && errors[k] ? <p className="mt-1 text-xs text-crimson-700" role="alert">{errors[k]}</p> : null;
  return (
    <form onSubmit={submit} noValidate className="space-y-7" data-testid="form-proposal">
      {editing && <p className="border-l-2 border-gold-500 bg-ivory-50 px-4 py-3 text-sm text-ink-800" data-testid="text-editing-note">Editing “{editing.title}”. Saving sends it back to review{editing.order.status === 'approved' ? ' and cancels the current acceptance' : ''}.</p>}
      <div className="grid gap-7 md:grid-cols-2">
        <label className="block"><span className={labelCls}>Full name</span><input className={inputCls} value={f.fullName} maxLength={120} onChange={(e) => set('fullName')(e.target.value)} autoComplete="name" data-testid="input-full-name" /><Err k="fullName" /></label>
        <label className="block"><span className={labelCls}>Photo or press-folder link (optional)</span><input className={inputCls} value={f.photoUrl} maxLength={2000} inputMode="url" placeholder="https://" onChange={(e) => set('photoUrl')(e.target.value)} data-testid="input-photo-url" /><Err k="photoUrl" /></label>
      </div>
      <label className="block"><span className={labelCls}>Article title</span><input className={`${inputCls} font-display text-2xl`} value={f.title} maxLength={180} onChange={(e) => set('title')(e.target.value)} data-testid="input-title" /><Err k="title" /></label>
      <label className="block">
        <span className="flex justify-between"><span className={labelCls}>Your article</span><span className="text-[11px] text-ink-700" data-testid="text-body-count">{f.body.trim().length.toLocaleString()} / 20,000</span></span>
        <textarea className="mt-2 min-h-[16rem] w-full border border-ink-900/20 bg-ivory-50 p-4 text-[15px] leading-relaxed text-ink-900 focus:border-lagoon-600 focus:outline-none" value={f.body} maxLength={20000} onChange={(e) => set('body')(e.target.value)} placeholder="Tell the story you want on the page — at least 100 characters." data-testid="input-body" />
        <Err k="body" />
      </label>
      <p className="text-xs text-ink-700">No file upload here: share photos through a link you control. The editorial team may adapt length and layout to fit one page.</p>
      <label className="flex items-start gap-3 text-sm text-ink-800">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_22%)]" data-testid="checkbox-accept-terms" />
        <span>I understand this is a proposal for one inside page, reviewed by the Founder. Nothing is charged now. If accepted, I will see the edition and publication conditions and decide whether to pay USD 200. I have read the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.</span>
      </label>
      {touched && !accepted && <p className="text-xs text-crimson-700" role="alert">Please confirm the terms.</p>}
      {error && <p role="alert" className="border border-crimson-700/30 bg-crimson-50 p-3 text-sm text-crimson-700" data-testid="text-form-error">{error}</p>}
      {saved && <p role="status" className="border border-lagoon-600/30 bg-lagoon-50 p-3 text-sm text-lagoon-900" data-testid="text-form-saved">{saved}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={primaryBtn} disabled={pending} data-testid="button-submit-proposal">{pending ? 'Saving…' : editing ? 'Save and resubmit' : 'Send proposal for review'}</button>
        {editing && <button type="button" className={ghostBtn} onClick={onDone} data-testid="button-cancel-edit">Cancel editing</button>}
      </div>
    </form>
  );
}

function PayBlock({ s, config }: { s: MagazineSubmission; config: MagazineConfig | undefined }) {
  const checkout = useCheckoutMagazineOrder();
  const invalidate = useInvalidate();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  if (!['approved', 'checkout_pending'].includes(s.order.status)) return null;
  const open = !!config?.available;
  return (
    <div className="mt-5 border border-lagoon-600/40 bg-lagoon-50 p-4" data-testid={`pay-${s.id}`}>
      <p className="text-sm text-lagoon-900"><strong>Total: USD 200</strong> for one inside page, under the conditions written by the Founder above. No PDF is delivered for this payment.</p>
      {!open ? <p className="mt-2 text-sm text-ink-800" data-testid={`text-checkout-closed-${s.id}`}>Payment is not open right now{config?.reason ? ` (${config.reason})` : ''}. Your accepted proposal is kept.</p> : (
        <>
          <label className="mt-3 flex items-start gap-3 text-sm text-ink-800"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-4 w-4" data-testid={`checkbox-accept-total-${s.id}`} /><span>I accept the USD 200 total and the edition and publication conditions in the Founder’s note.</span></label>
          {config?.testMode && <p className="mt-2 text-xs text-ink-700">Test mode: no real money moves and a test payment reserves nothing.</p>}
          <button type="button" className={`${primaryBtn} mt-3`} disabled={!ok || checkout.isPending} data-testid={`button-pay-${s.id}`}
            onClick={() => { setErr(''); checkout.mutate({ id: s.order.id, data: { accepted: true, expectedTotal: 20000 } }, { onSuccess: (r) => { window.location.assign(r.url); }, onError: (e) => { setErr(errMsg(e, 'Checkout could not open. Please try again.')); invalidate(); } }); }}>
            {checkout.isPending ? 'Opening checkout…' : s.order.status === 'checkout_pending' ? 'Resume checkout · USD 200' : 'Pay USD 200'}
          </button>
        </>
      )}
      {err && <p role="alert" className="mt-2 text-sm text-crimson-700">{err}</p>}
    </div>
  );
}

function ProposalCard({ s, config, onEdit }: { s: MagazineSubmission; config: MagazineConfig | undefined; onEdit: () => void }) {
  const withdraw = useWithdrawMagazineSubmission();
  const invalidate = useInvalidate();
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  const [more, setMore] = useState(false);
  const st = s.order.status;
  const editable = EDITABLE.includes(st);
  return (
    <li className="border border-ink-900/15 bg-ivory-50 p-5 md:p-6" data-testid={`card-proposal-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><FeatureStatus status={st} id={s.id} /><span className="text-[11px] text-ink-700">Updated {new Date(s.updatedAt).toLocaleDateString()}</span></div>
      <h3 className="mt-3 font-display text-2xl text-ink-900" data-no-translate>{s.title}</h3>
      <p className="mt-1 text-sm text-ink-700">{FEATURE_STATUS[st]?.text}</p>
      <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-800 ${more ? '' : 'line-clamp-3'}`} data-no-translate>{s.body}</p>
      <button type="button" className="mt-1 text-xs font-semibold text-lagoon-700 underline" onClick={() => setMore(!more)} data-testid={`button-toggle-body-${s.id}`}>{more ? 'Show less' : 'Read all'}</button>
      {s.reviewNote && <div className="mt-4 border-l-2 border-gold-500 pl-4"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600">Founder’s note</p><p className="mt-1 whitespace-pre-line text-sm text-ink-900" data-no-translate data-testid={`text-review-note-${s.id}`}>{s.reviewNote}</p></div>}
      <PayBlock s={s} config={config} />
      {editable && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink-900/10 pt-4">
          <button type="button" className={ghostBtn} onClick={onEdit} data-testid={`button-edit-${s.id}`}>Edit</button>
          {!confirm ? <button type="button" className="text-xs font-semibold uppercase tracking-[0.18em] text-crimson-700" onClick={() => setConfirm(true)} data-testid={`button-withdraw-${s.id}`}>Withdraw</button> : (
            <span className="flex flex-wrap items-center gap-3 text-sm text-ink-800">Withdraw this proposal? It cannot be undone.
              <button type="button" className="bg-crimson-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ivory-50 disabled:opacity-50" disabled={withdraw.isPending} onClick={() => withdraw.mutate({ id: s.id }, { onSuccess: () => { setConfirm(false); invalidate(); }, onError: (e) => { setErr(errMsg(e, 'Could not withdraw. Please try again.')); invalidate(); } })} data-testid={`button-confirm-withdraw-${s.id}`}>{withdraw.isPending ? 'Withdrawing…' : 'Yes, withdraw'}</button>
              <button type="button" className="text-xs underline" onClick={() => setConfirm(false)} data-testid={`button-keep-${s.id}`}>Keep it</button>
            </span>
          )}
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-sm text-crimson-700">{err}</p>}
    </li>
  );
}

export function MyProposals({ list, config, onEdit }: { list: MagazineSubmission[]; config: MagazineConfig | undefined; onEdit: (s: MagazineSubmission) => void }) {
  if (!list.length) return (
    <div className="border border-dashed border-ink-900/25 p-8 text-center" data-testid="empty-proposals">
      <p className="font-display text-2xl text-ink-900">No proposals yet.</p>
      <p className="mt-2 text-sm text-ink-700">When you send one, it will stay here — through review, acceptance and payment.</p>
    </div>
  );
  return <ul className="space-y-4">{list.map((s) => <ProposalCard key={s.id} s={s} config={config} onEdit={() => onEdit(s)} />)}</ul>;
}

function ReviewCard({ s }: { s: MagazineSubmission }) {
  const review = useReviewMagazineSubmission();
  const invalidate = useInvalidate();
  const [note, setNote] = useState(s.reviewNote ?? '');
  const [err, setErr] = useState('');
  const canReview = EDITABLE.includes(s.order.status);
  const decide = (decision: 'approved' | 'declined') => {
    setErr('');
    if (note.trim().length < 5) { setErr('Write a note of at least 5 characters. For acceptance, state the edition and publication conditions.'); return; }
    review.mutate({ id: s.id, data: { decision, note: note.trim(), expectedUpdatedAt: s.updatedAt } }, { onSuccess: () => invalidate(), onError: (e) => { setErr(errMsg(e, 'The decision could not be saved. The proposal may have changed — refresh and retry.')); invalidate(); } });
  };
  return (
    <li className="border border-ink-900/15 bg-ivory-50 p-5" data-testid={`card-review-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><FeatureStatus status={s.order.status} id={s.id} /><span className="text-[11px] text-ink-700">#{s.id} · {new Date(s.updatedAt).toLocaleString()}</span></div>
      <h3 className="mt-3 font-display text-2xl" data-no-translate>{s.title}</h3>
      <dl className="mt-2 grid gap-1 text-sm text-ink-800 sm:grid-cols-2" data-no-translate>
        <div><dt className="inline text-ink-700">Name: </dt><dd className="inline">{s.fullName}</dd></div>
        <div><dt className="inline text-ink-700">Email: </dt><dd className="inline"><a href={`mailto:${s.order.email}`} className="underline">{s.order.email}</a></dd></div>
        {s.photoUrl && <div className="sm:col-span-2"><dt className="inline text-ink-700">Link: </dt><dd className="inline break-all"><a href={s.photoUrl} target="_blank" rel="noreferrer noopener" className="underline">{s.photoUrl}</a></dd></div>}
      </dl>
      <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-lagoon-700">Read the full article</summary><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-900" data-no-translate>{s.body}</p></details>
      {canReview ? (
        <div className="mt-4 border-t border-ink-900/10 pt-4">
          <label className="block"><span className={labelCls}>Note to the contributor (edition, publication conditions)</span>
            <textarea value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} className="mt-2 min-h-[6rem] w-full border border-ink-900/20 bg-ivory-100 p-3 text-sm focus:border-lagoon-600 focus:outline-none" data-testid={`input-review-note-${s.id}`} /></label>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} disabled={review.isPending} onClick={() => decide('approved')} data-testid={`button-approve-${s.id}`}>Accept with these conditions</button>
            <button type="button" className={ghostBtn} disabled={review.isPending} onClick={() => decide('declined')} data-testid={`button-decline-${s.id}`}>Decline</button>
          </div>
          <p className="mt-2 text-xs text-ink-700">Payment status comes only from Stripe; it cannot be set here.</p>
        </div>
      ) : s.reviewNote ? <p className="mt-3 border-l-2 border-gold-500 pl-3 text-sm text-ink-800" data-no-translate>{s.reviewNote}</p> : null}
      {err && <p role="alert" className="mt-2 text-sm text-crimson-700">{err}</p>}
    </li>
  );
}

export function FounderReview() {
  const k = useSubmissionKeys();
  const q = useGetMagazineAdminSubmissions({ query: { enabled: k.signedIn, queryKey: k.admin } });
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const list = (q.data ?? []).filter((s) => filter === 'all' || ['submitted', 'approved', 'checkout_pending'].includes(s.order.status));
  return (
    <section id="founder-review" className="scroll-mt-24 border-t-2 border-ink-900 pt-10" data-testid="section-founder-review">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-eyebrow text-gold-600">FOUNDER ONLY</p><h2 className="mt-2 font-display text-4xl">Proposals to review</h2></div>
        <div className="flex gap-2 text-xs">
          {(['open', 'all'] as const).map((v) => <button key={v} type="button" onClick={() => setFilter(v)} className={`border px-3 py-1.5 font-semibold uppercase tracking-[0.15em] ${filter === v ? 'border-ink-900 bg-ink-900 text-ivory-50' : 'border-ink-900/25'}`} data-testid={`button-filter-${v}`}>{v === 'open' ? 'Open' : 'All'}</button>)}
        </div>
      </div>
      <div className="mt-6">
        {q.isLoading ? <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-32 animate-pulse bg-ivory-200" />)}</div>
          : q.isError ? <div role="alert" className="flex items-center justify-between border border-crimson-700/30 p-4 text-sm text-crimson-700">Proposals could not be loaded.<button className={ghostBtn} onClick={() => q.refetch()} data-testid="button-retry-admin">Retry</button></div>
          : !list.length ? <p className="border border-dashed border-ink-900/25 p-6 text-sm text-ink-700" data-testid="empty-review">Nothing waiting here.</p>
          : <ul className="space-y-4">{list.map((s) => <ReviewCard key={`${s.id}-${s.updatedAt}`} s={s} />)}</ul>}
      </div>
    </section>
  );
}

export function FeatureReturn({ orderId, kind, onRefresh }: { orderId: number; kind: string; onRefresh: () => void }) {
  const k = useSubmissionKeys();
  const q = useGetMagazineOrder(orderId, { query: { enabled: k.signedIn && orderId > 0 && kind === 'complete', queryKey: k.order(orderId) } });
  const status = q.data?.status;
  return (
    <div className="border border-ink-900/20 bg-ivory-50 p-5" role="status" data-testid="section-feature-return">
      <p className="text-eyebrow text-gold-600">{kind === 'cancelled' ? 'CHECKOUT CANCELLED' : 'BACK FROM CHECKOUT'}</p>
      {kind === 'cancelled' ? <p className="mt-2 text-sm text-ink-800">No payment was taken. Your accepted proposal is kept below.</p>
        : q.isLoading ? <p className="mt-2 text-sm text-ink-800">Verifying your payment with the server…</p>
        : q.isError || !q.data ? <p className="mt-2 text-sm text-crimson-700">We could not verify this payment yet.</p>
        : status === 'paid' ? <p className="mt-2 text-sm text-ink-900" data-testid="text-feature-paid">Payment verified: your inside page is reserved. Publication follows the edition conditions in the Founder’s note — it is not automatic, and no PDF is delivered for this payment.</p>
        : <p className="mt-2 text-sm text-ink-800" data-testid="text-feature-pending">Payment is not confirmed yet ({FEATURE_STATUS[status ?? '']?.label ?? status}). Confirmation can take a moment.</p>}
      {kind === 'complete' && status !== 'paid' && <button type="button" className={`${ghostBtn} mt-3`} disabled={q.isFetching} onClick={() => { q.refetch(); onRefresh(); }} data-testid="button-check-again">{q.isFetching ? 'Checking…' : 'Check again'}</button>}
    </div>
  );
}
