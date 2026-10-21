import { useContext, useState } from 'react';
import { MeCtx } from '@/pages/member/ctx';
import { useGetFounderGratitudeStory, getGetFounderGratitudeStoryQueryKey, useGetFounderGratitude, getGetFounderGratitudeQueryKey, type GratitudeCampaign, type GratitudeStory, type GratitudeActionIdentity, type GratitudeActionCampaignStatus, type GratitudeActionDecision } from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, field } from '@/components/network/kit';
import { IdentityBand, StoryMedia } from '@/components/gratitude/Story';
import { IDENTITIES, STATUS, errMsg, identityOf, useGratitudeAct, type IdentityKey } from '@/lib/gratitude';

const DECISIONS: Record<string, GratitudeActionDecision[]> = {
  pending_review: ['publish', 'reject'],
  published: ['hide', 'feature', 'unfeature'],
  hidden: ['restore'],
  rejected: [],
};

function CampaignForm({ c, campaigns, onDone }: { c?: GratitudeCampaign; campaigns: GratitudeCampaign[]; onDone: () => void }) {
  const { run, pending } = useGratitudeAct();
  const [name, setName] = useState(c?.name ?? '');
  const [slug, setSlug] = useState(c?.slug ?? '');
  const [description, setDescription] = useState(c?.description ?? '');
  const [status, setStatus] = useState<GratitudeActionCampaignStatus>((c?.status as GratitudeActionCampaignStatus) ?? 'draft');
  const [identity, setIdentity] = useState<IdentityKey>(identityOf(c));
  const [parentId, setParentId] = useState<number | null>(c?.parentId ?? null);
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    if (status === 'active' && c?.status !== 'active' && !confirm('Activating opens this campaign publicly and lets members submit stories. Continue?')) return;
    setErr(null);
    run({ action: 'campaign', id: c?.id, parentId, name: name.trim(), slug: slug.trim(), description: description.trim(), campaignStatus: status, identity: identity as GratitudeActionIdentity }).then(onDone).catch((e) => setErr(errMsg(e)));
  };
  return (
    <div className="grid gap-3" data-testid={`form-campaign-${c?.id ?? 'new'}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-800">Name<input className={`${field} mt-1`} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} data-testid="input-campaign-name" /></label>
        <label className="text-xs font-semibold text-ink-800">Slug<input className={`${field} mt-1`} maxLength={120} value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} data-testid="input-campaign-slug" /></label>
      </div>
      <label className="text-xs font-semibold text-ink-800">Description<textarea className={`${field} mt-1 min-h-20`} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-campaign-description" /></label>
      <label className="text-xs font-semibold text-ink-800">Status
        <select className={`${field} mt-1`} value={status} onChange={(e) => setStatus(e.target.value as GratitudeActionCampaignStatus)} data-testid="select-campaign-status">{['draft', 'active', 'paused', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </label>
      <label className="text-xs font-semibold text-ink-800">Umbrella campaign (optional)
        <select className={`${field} mt-1`} value={parentId ?? ''} onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)} data-testid="select-campaign-parent">
          <option value="">Independent / umbrella</option>
          {campaigns.filter(p => p.id !== c?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <fieldset>
        <legend className="text-xs font-semibold text-ink-800">Visual identity</legend>
        <p className="text-[11px] text-ink-700">Original design treatments only. They do not represent official national or regional bodies.</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(IDENTITIES) as IdentityKey[]).map((k) => (
            <button type="button" key={k} onClick={() => setIdentity(k)} aria-pressed={identity === k} className={`overflow-hidden rounded-xl border-2 text-left ${identity === k ? 'border-gold-500' : 'border-transparent'}`} data-testid={`button-identity-${k}`}>
              <IdentityBand id={k} className="h-14" />
              <span className="block px-2 py-1 text-xs font-semibold text-ink-900">{IDENTITIES[k].label}</span>
              <span className="block px-2 pb-1 text-[10px] text-ink-700">{IDENTITIES[k].note}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {err && <p className="text-xs text-crimson-700" role="alert">{err}</p>}
      <div className="flex gap-2"><button className={btn} disabled={pending || !name.trim() || !slug.trim()} onClick={save} data-testid="button-save-campaign">Save campaign</button><button className={btnGhost} onClick={onDone}>Cancel</button></div>
    </div>
  );
}

function Review({ s: listRow }: { s: GratitudeStory }) {
  const detail = useGetFounderGratitudeStory(listRow.id, { query: { queryKey: getGetFounderGratitudeStoryQueryKey(listRow.id), refetchOnMount: 'always' } });
  const s = detail.data ?? listRow;
  const me = useContext(MeCtx)?.me;
  const own = !!me && me.id === s.authorId;
  const { run, pending } = useGratitudeAct();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const decide = (decision: GratitudeActionDecision) => {
    if (reason.trim().length < 3) { setErr('A reason is required.'); return; }
    setErr(null);
    run({ action: 'moderate', id: s.id, version: s.version, decision, reason: reason.trim() }).then(() => setReason('')).catch((e) => setErr(errMsg(e)));
  };
  const options = (DECISIONS[s.status] ?? []).filter((d) => !(d === 'feature' && s.featured) && !(d === 'unfeature' && !s.featured));
  return (
    <li className={`${card} overflow-hidden`} data-testid={`admin-story-${s.id}`}>
      <StoryMedia media={s.media} />
      <div className="p-4">
        <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700" data-testid={`story-analytics-${s.id}`}>
          <span>{s.views} member views</span><span>{s.likes} likes</span>
          <span>{s.commentCount} visible replies</span><span>{s.shareIntents} share actions</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-ink-700">{s.authorName} · {s.campaignName} · {s.countryName || 'No country'}{s.updatedAt ? ` · ${new Date(s.updatedAt).toLocaleString()}` : ''}</p><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS[s.status]?.tone ?? ''}`}>{STATUS[s.status]?.label ?? s.status}{s.featured ? ' · Featured' : ''}</span></div>
        <h3 className="mt-2 font-display text-lg text-ink-900">{s.title}</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{s.body}</p>
        {s.media.some((m) => m.status !== 'ready') && <p className="mt-2 text-xs text-gold-700">Some media is still processing or failed: {s.media.map((m) => m.status).join(', ')}</p>}
        {s.comments.length > 0 && (
          <details className="mt-3 text-sm"><summary className="cursor-pointer text-xs font-semibold text-lagoon-700">Replies ({s.comments.length})</summary>
            <ul className="mt-2 flex flex-col gap-2">{s.comments.map((c) => (
              <li key={c.id} className="border-l-2 border-sand-200 pl-2"><p className="text-xs text-ink-700">{c.authorName}</p><p className="text-sm">{c.body}</p>
                <button className="min-h-11 text-xs text-crimson-700 underline" disabled={pending || reason.trim().length < 3 || c.body === '[removed]'} onClick={() => run({ action: 'moderateComment', id: s.id, commentId: c.id, accepted: !c.hidden, reason: reason.trim() }).catch((e) => setErr(errMsg(e)))} data-testid={`button-hide-comment-${c.id}`}>{c.hidden ? 'Restore reply' : 'Hide reply'} (uses reason below)</button></li>
            ))}</ul>
          </details>
        )}
        {own && <p className="mt-3 border-l-2 border-gold-500 pl-2 text-xs text-gold-700" data-testid={`text-own-story-${s.id}`}>This is your own story. Founders cannot approve, feature or restore their own contributions; decisions are read-only here.</p>}
        {detail.isError && <p className="mt-2 text-xs text-crimson-700">Full review detail could not load. <button className="underline" onClick={() => detail.refetch()}>Retry</button></p>}
        {!own && options.length > 0 && (
          <div className="mt-3 border-t border-sand-200 pt-3">
            <label className="text-xs font-semibold text-ink-800">Decision reason (required, shown to the member)<textarea className={`${field} mt-1 min-h-14`} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} data-testid={`input-decision-${s.id}`} /></label>
            {err && <p className="text-xs text-crimson-700" role="alert">{err}</p>}
            <div className="mt-2 flex flex-wrap gap-2">{options.map((d) => <button key={d} className={d === 'publish' || d === 'restore' ? btn : btnGhost} disabled={pending} onClick={() => decide(d)} data-testid={`button-${d}-${s.id}`}>{d[0].toUpperCase() + d.slice(1)}</button>)}</div>
          </div>
        )}
      </div>
    </li>
  );
}

function ReportItem({ r }: { r: { id: number; contributionId: number; commentId?: number | null; reason: string } }) {
  const { run, pending } = useGratitudeAct();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const ok = reason.trim().length >= 3;
  return (
    <li className={`${card} p-4`} data-testid={`gratitude-report-${r.id}`}>
      <p className="text-xs text-ink-700">Story #{r.contributionId}{r.commentId ? ` · reply #${r.commentId}` : ''}</p>
      <p className="mt-1 text-sm text-ink-900">{r.reason}</p>
      <label className="mt-2 block text-xs text-ink-800">Resolution reason (required)<textarea className={`${field} mt-1 min-h-12`} value={reason} maxLength={2000} onChange={(e) => setReason(e.target.value)} /></label>
      {err && <p className="text-xs text-crimson-700" role="alert">{err}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {r.commentId && <button className={btnGhost} disabled={pending || !ok} onClick={() => run({ action: 'moderateComment', id: r.contributionId, commentId: r.commentId!, accepted: true, reason: reason.trim() }).catch((e) => setErr(errMsg(e)))} data-testid={`button-report-hide-comment-${r.id}`}>Hide reply</button>}
        <button className={btn} disabled={pending || !ok} onClick={() => run({ action: 'resolveReport', id: r.id, reason: reason.trim() }).catch((e) => setErr(errMsg(e)))} data-testid={`button-resolve-gratitude-${r.id}`}>Resolve</button>
      </div>
    </li>
  );
}

export default function FounderGratitudeAdmin() {
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<number | 'new' | null>(null);
  const q = useGetFounderGratitude({ page }, { query: { queryKey: getGetFounderGratitudeQueryKey({ page }), refetchOnMount: 'always' } });
  if (q.isLoading) return <Skeleton rows={4} />;
  if (q.isError) return <ErrorBox onRetry={() => q.refetch()} />;
  const { campaigns, items, reports, hasMore } = q.data!;
  return (
    <div className="flex flex-col gap-6" data-testid="panel-founder-gratitude">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl text-ink-900">Thanks the World campaigns</h2><button className={btn} onClick={() => setEdit('new')} data-testid="button-new-campaign">New campaign</button></div>
        <p className="mt-1 text-xs text-ink-700">Nothing is public until you activate a campaign. You cannot approve your own stories.</p>
        {edit === 'new' && <div className={`${card} mt-3 p-4`}><CampaignForm campaigns={campaigns} onDone={() => setEdit(null)} /></div>}
        {campaigns.length === 0 && edit !== 'new' ? <div className="mt-3"><Empty title="No campaigns" body="Create a campaign, choose its identity and activate it when ready." /></div> : (
          <ul className="mt-3 flex flex-col gap-3">{campaigns.map((c) => (
            <li key={c.id} className={`${card} overflow-hidden`} data-testid={`row-campaign-${c.id}`}>
              <IdentityBand id={identityOf(c)} className="px-4 py-3 text-ivory-100"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-display text-lg">{c.name}</span><span className="rounded-full bg-ivory-50/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase">{c.status}</span></div></IdentityBand>
              <div className="p-4">{edit === c.id ? <CampaignForm c={c} campaigns={campaigns} onDone={() => setEdit(null)} /> : <><p className="text-sm text-ink-800">{c.description || 'No description.'}</p><button className={`${btnGhost} mt-2`} onClick={() => setEdit(c.id)} data-testid={`button-edit-campaign-${c.id}`}>Edit</button></>}</div>
            </li>
          ))}</ul>
        )}
      </section>
      <section>
        <h2 className="font-display text-xl text-ink-900">Stories (latest updated)</h2>
        {items.length === 0 ? <div className="mt-3"><Empty title="Nothing to review" body="Submitted stories appear here." /></div> : <ul className="mt-3 flex flex-col gap-3">{items.map((s) => <Review key={`${s.id}-${s.version}`} s={s} />)}</ul>}
        {(page > 1 || hasMore) && <div className="mt-3 flex justify-center gap-3"><button className={btnGhost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className={btnGhost} disabled={!hasMore} onClick={() => setPage(page + 1)}>Next</button></div>}
      </section>
      <section>
        <h2 className="font-display text-xl text-ink-900">Reports ({reports.length})</h2>
        {reports.length === 0 ? <div className="mt-3"><Empty title="No open reports" body="Member reports about stories and replies appear here." /></div> : <ul className="mt-3 flex flex-col gap-3">{reports.map((r) => <ReportItem key={r.id} r={r} />)}</ul>}
      </section>
    </div>
  );
}
