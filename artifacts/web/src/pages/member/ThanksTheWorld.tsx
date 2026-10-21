import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { AlertTriangle, Archive, Video, Eye, FilePlus2, ImagePlus, Pencil, RotateCw, Send, Trash2 } from 'lucide-react';
import {
  useGetGratitudeOptions, getGetGratitudeOptionsQueryKey, useGetMyGratitudeStories, getGetMyGratitudeStoriesQueryKey,
  getMyGratitudeStories, useRequestGratitudeUpload, useCompleteGratitudeUpload, type GratitudeStory, type GratitudeOptions,
} from '@workspace/api-client-react';
import { Empty, ErrorBox, Skeleton, btn, btnGhost, card, field } from '@/components/network/kit';
import { IdentityBand, StoryMedia } from '@/components/gratitude/Story';
import { Flag, STATUS, errMsg, identityOf, mediaSrc, useGratitudeAct, useInvalidateGratitude } from '@/lib/gratitude';
import { searchCountries, countryLabel } from '@/pages/our-vision/country-data';
import '@/pages/thanks-the-world/ttw.css';

const IMG = ['image/jpeg', 'image/png', 'image/webp'];
const VID = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_POLLS = 24;

/** Status copy that reflects whether a published story is also shown on the member's profile. */
function statusNote(s: GratitudeStory) {
  if (s.status === 'published') return s.profileEligible
    ? 'Public in the campaign feed and on your public profile. Editing returns it to review.'
    : 'Public in the campaign feed. Not shown on your profile, because your profile is not public. Editing returns it to review.';
  if (s.status === 'archived') return 'Withdrawn and not public. Open it to revise and submit again.';
  return STATUS[s.status]?.note ?? '';
}

function StatusPill({ s }: { s: string }) {
  const t = STATUS[s] ?? { label: s, tone: 'bg-ivory-200 text-ink-800' };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${t.tone}`} data-testid="status-story">{t.label}</span>;
}

/** Owner rows are only exposed through the paged "mine" list; walk it to find the exact fresh row. */
async function fetchOwnRow(id: number): Promise<GratitudeStory | null> {
  for (let page = 1; page <= 20; page++) {
    const r = await getMyGratitudeStories({ page });
    const hit = r.items.find((s) => s.id === id);
    if (hit) return hit;
    if (!r.hasMore) break;
  }
  return null;
}

export default function ThanksTheWorldMember() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const polls = useRef(0);
  // Query intent from the public CTAs (?intent=text|video). Survives the sign-in round-trip because it lives in the URL;
  // consumed exactly once, then stripped so polling/remounts never reopen or reset the editor.
  const search = useSearch();
  const [location, navigate] = useLocation();
  const urlIntent = new URLSearchParams(search).get('intent');
  const [intent, setIntent] = useState<'text' | 'video' | null>(null);
  const intentDone = useRef(false);
  const opts = useGetGratitudeOptions({ query: { queryKey: getGetGratitudeOptionsQueryKey() } });
  const mine = useGetMyGratitudeStories({ page }, {
    query: {
      queryKey: getGetMyGratitudeStoriesQueryKey({ page }),
      refetchInterval: (q) => {
        const items = q.state.data?.items ?? [];
        const waiting = items.some((s) => s.status === 'pending_review' || s.media.some((m) => m.status !== 'ready' && m.status !== 'failed'));
        if (!waiting || polls.current >= MAX_POLLS) return false;
        polls.current += 1;
        return 15000;
      },
    },
  });
  const activeCampaigns = (opts.data?.campaigns ?? []).filter((c) => c.status === 'active');
  const lead = activeCampaigns[0];
  const ready = !opts.isLoading && !mine.isLoading;
  useEffect(() => {
    if (intentDone.current || !ready || (urlIntent !== 'text' && urlIntent !== 'video')) return;
    intentDone.current = true;
    setIntent(urlIntent);
    setEditing((e) => e ?? 'new');
    navigate(location, { replace: true });
  }, [ready, urlIntent]); // eslint-disable-line react-hooks/exhaustive-deps

  if (opts.isLoading || mine.isLoading) return <div className="px-3 md:px-0"><Skeleton rows={4} /></div>;
  if (opts.isError) return <div className="px-3 md:px-0"><ErrorBox onRetry={() => opts.refetch()} /></div>;
  if (mine.isError) return <div className="px-3 md:px-0"><ErrorBox onRetry={() => mine.refetch()} msg="Your stories could not be loaded." /></div>;
  const items = mine.data!.items;
  const listed = typeof editing === 'number' ? items.find((s) => s.id === editing) ?? null : null;

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0">
      <IdentityBand id={identityOf(lead)} className="rounded-2xl p-6 text-ivory-100 sm:p-8">
        <p className="text-eyebrow text-gold-400">THANKS THE WORLD</p>
        <h1 className="mt-2 font-display text-3xl">Your gratitude stories</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory-200">{lead ? `${lead.name} is open. Write a message, upload a video or add photos, preview, then send it for the Founder's review.` : 'No campaign is active yet, so stories cannot be saved or submitted. You can write in the editor to plan your words, but nothing is stored until the Founder activates a campaign.'}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400" onClick={() => { setIntent('text'); setEditing('new'); }} data-testid="button-new-story"><FilePlus2 className="h-4 w-4" />Write a story</button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-400/70 px-5 text-sm font-semibold text-gold-200 hover:bg-gold-500/10" onClick={() => { setIntent('video'); setEditing((e) => e ?? 'new'); }} data-testid="button-new-video-story"><Video className="h-4 w-4" />Upload a video</button>
          <Link href="~/thanks-the-world" className="inline-flex min-h-11 items-center rounded-full border border-ivory-200/40 px-5 text-sm font-semibold hover:border-gold-400" data-testid="link-public-campaign">See public stories</Link>
        </div>
      </IdentityBand>

      {editing !== null && (
        <Editor key={editing} intent={intent} storyId={editing === 'new' ? null : editing} listed={listed} options={opts.data!} onClose={() => setEditing(null)} onCreated={(id) => { polls.current = 0; setEditing(id); }} onActivity={() => { polls.current = 0; }} />
      )}

      {items.length === 0 ? <Empty title="No stories yet" body="Your drafts and submissions will appear here with their review status." /> : (
        <ul className="flex flex-col gap-3">
          {items.map((s) => (
            <li key={s.id} className={`${card} flex flex-col gap-2 p-4`} data-testid={`row-my-story-${s.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex min-w-0 items-center gap-2 font-display text-lg text-ink-900"><Flag code={s.countryCode} name={s.countryName} className="h-4 w-6 shrink-0 border border-sand-200" /><span className="truncate">{s.title || 'Untitled draft'}</span></p><StatusPill s={s.status} /></div>
              <p className="text-xs text-ink-700">{s.campaignName} · {s.countryName || 'No country'} · {statusNote(s)}</p>
              {s.decisionReason && ['rejected', 'hidden'].includes(s.status) && <p className="border-l-2 border-crimson-700/50 pl-2 text-xs text-ink-800">Founder's note: {s.decisionReason}</p>}
              <div className="flex flex-wrap gap-2">
                <button className={btnGhost} onClick={() => { polls.current = 0; setEditing(s.id); }} data-testid={`button-edit-${s.id}`}><Pencil className="h-3.5 w-3.5" />{s.status === 'published' ? 'Edit (returns to review)' : s.status === 'archived' ? 'Open to revise' : 'Open'}</button>
                {s.status === 'published' && <Link href={`~/thanks-the-world?story=${s.id}`} className={btnGhost} data-testid={`link-view-public-${s.id}`}><Eye className="h-3.5 w-3.5" />View public</Link>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {(page > 1 || mine.data!.hasMore) && <div className="flex justify-center gap-3"><button className={btnGhost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className={btnGhost} disabled={!mine.data!.hasMore} onClick={() => setPage(page + 1)}>Next</button></div>}
    </div>
  );
}

type Phase = 'queued' | 'reserving' | 'uploading' | 'completing' | 'error';
interface Pending { key: string; file: File; preview: string; alt: string; progress: number; phase: Phase; error?: string; uploadId?: string; uploadUrl?: string; putDone?: boolean }
interface Fields { title: string; body: string; campaignId?: number; countryCode: string | null; theme: string | null }

const fieldsOf = (s: GratitudeStory | null, fallbackCampaign?: number): Fields => ({
  title: s?.title ?? '', body: s?.body ?? '', campaignId: s?.campaignId ?? fallbackCampaign, countryCode: s?.countryCode ?? null, theme: s?.theme ?? null,
});
const sameFields = (a: Fields, b: Fields) => a.title === b.title && a.body === b.body && a.campaignId === b.campaignId && a.countryCode === b.countryCode && a.theme === b.theme;

function Editor({ intent, storyId, listed, options, onClose, onCreated, onActivity }: { intent: 'text' | 'video' | null; storyId: number | null; listed: GratitudeStory | null; options: GratitudeOptions; onClose: () => void; onCreated: (id: number) => void; onActivity: () => void }) {
  const { run, pending } = useGratitudeAct();
  const invalidate = useInvalidateGratitude();
  const reqUpload = useRequestGratitudeUpload();
  const complete = useCompleteGratitudeUpload();
  const activeIds = useMemo(() => new Set(options.campaigns.filter((c) => c.status === 'active').map((c) => c.id)), [options.campaigns]);

  // `row` is the editor's own server snapshot; it only changes through explicit fetches below,
  // so background list polling never silently replaces the version we write against.
  const [row, setRow] = useState<GratitudeStory | null>(listed);
  const [loadingRow, setLoadingRow] = useState(storyId !== null && !listed);
  const versionRef = useRef<number>(listed?.version ?? 0);
  const baselineRef = useRef<Fields>(fieldsOf(listed, options.campaigns.find((c) => c.status === 'active')?.id));
  const [f, setF] = useState<Fields>(baselineRef.current);
  const [conflict, setConflict] = useState<GratitudeStory | null>(null);
  const [cq, setCq] = useState('');
  const [consent, setConsent] = useState(false);
  const [rights, setRights] = useState(false);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [uploads, setUploads] = useState<Pending[]>([]);
  const [alt, setAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const uploadsRef = useRef<Pending[]>([]);
  uploadsRef.current = uploads;
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const runningRef = useRef(false);
  const aliveRef = useRef(true);
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
  const codes = useMemo(() => new Set(options.countries.map((c) => c.code)), [options.countries]);
  const matches = useMemo(() => cq.trim() ? searchCountries(cq, locale).filter((c) => codes.has(c.code)).slice(0, 8) : [], [cq, locale, codes]);
  const country = options.countries.find((c) => c.code === f.countryCode);
  const campaigns = options.campaigns.filter((c) => c.status === 'active' || c.id === row?.campaignId);
  const set = (p: Partial<Fields>) => setF((x) => ({ ...x, ...p }));

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      xhrRef.current?.abort();
      uploadsRef.current.forEach((u) => URL.revokeObjectURL(u.preview));
    };
  }, []);

  const adopt = (fresh: GratitudeStory, resetText: boolean) => {
    setRow(fresh);
    versionRef.current = fresh.version;
    baselineRef.current = fieldsOf(fresh);
    if (resetText) setF(fieldsOf(fresh));
    setConflict(null);
  };
  /** Refresh the exact row. Adopt its version only if its text still matches what we last saw. */
  const refreshRow = async (id: number, opts: { force?: boolean } = {}) => {
    const fresh = await fetchOwnRow(id);
    if (!fresh || !aliveRef.current) return fresh;
    if (opts.force || sameFields(fieldsOf(fresh), baselineRef.current)) { setRow(fresh); versionRef.current = fresh.version; setConflict(null); }
    else setConflict(fresh);
    return fresh;
  };

  useEffect(() => {
    if (storyId !== null && !listed) {
      fetchOwnRow(storyId).then((fresh) => { if (fresh && aliveRef.current) adopt(fresh, true); }).finally(() => setLoadingRow(false));
    }
  }, [storyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Background polling may change status/media. Only adopt it when the text is unchanged; otherwise flag a conflict.
  useEffect(() => {
    if (!listed || !row || listed.version === versionRef.current) return;
    if (sameFields(fieldsOf(listed), baselineRef.current)) { setRow(listed); versionRef.current = listed.version; }
    else setConflict(listed);
  }, [listed]); // eslint-disable-line react-hooks/exhaustive-deps

  const story = row;
  // Video intent: bring the upload section into view; once a draft exists, focus the file chooser (opening it needs a user gesture).
  const storyReady = !!story && !loadingRow;
  useEffect(() => {
    if (intent === 'video') {
      mediaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (storyReady) document.getElementById('ttw-file-label')?.focus();
      else titleRef.current?.focus({ preventScroll: true });
    } else if (intent === 'text' && !storyReady) titleRef.current?.focus();
  }, [intent, storyReady]);
  const media = story?.media ?? [];
  const dirty = !sameFields(f, baselineRef.current);
  const campaignActive = f.campaignId !== undefined && activeIds.has(f.campaignId);
  const hasVideo = media.some((m) => m.kind === 'video') || uploads.some((u) => VID.includes(u.file.type));
  const readyVideo = media.some((m) => m.kind === 'video' && m.status === 'ready');
  const imageCount = media.filter((m) => m.kind !== 'video').length + uploads.filter((u) => IMG.includes(u.file.type)).length;
  const uploading = uploads.some((u) => u.phase !== 'error');
  const hasContent = !!f.body.trim() || readyVideo;
  const submittable = !!story && ['draft', 'rejected', 'archived'].includes(story.status);
  const canSave = !!f.title.trim() && (campaignActive || !!story) && !conflict;
  const canSubmit = submittable && campaignActive && consent && rights && !!f.title.trim() && hasContent && !uploading && !conflict && !pending;

  const say = (ok: boolean, t: string) => setMsg({ ok, t });

  const persist = async (): Promise<number | null> => {
    const r = await run({ action: 'save', id: story?.id, version: story ? versionRef.current : undefined, campaignId: f.campaignId, title: f.title.trim(), body: f.body.trim(), countryCode: f.countryCode, theme: f.theme });
    const id = story?.id ?? r?.id ?? null;
    if (!id) return null;
    const fresh = await fetchOwnRow(id);
    if (fresh && aliveRef.current) { adopt(fresh, false); setF((x) => ({ ...x, title: x.title.trim(), body: x.body.trim() })); }
    return id;
  };

  const save = async () => {
    if (story?.status === 'published' && !confirm('Saving changes removes this story from public view until the Founder approves it again. Continue?')) return;
    setMsg(null);
    try {
      const id = await persist();
      onActivity();
      say(true, 'Saved privately. Only you can see it.');
      if (!story && id) onCreated(id);
    } catch (e) { say(false, errMsg(e, 'Could not save. Check the required fields.')); if (story) refreshRow(story.id); }
  };

  const submit = async () => {
    if (!story) return;
    setMsg(null);
    try {
      if (dirty) await persist(); // never submit older saved content than what is on screen
      await run({ action: 'submit', id: story.id, version: versionRef.current, consent: true, rights: true });
      await refreshRow(story.id, { force: true });
      onActivity();
      say(true, 'Sent for review. The Founder\'s decision will appear here.');
      setConsent(false); setRights(false);
    } catch (e) { say(false, errMsg(e, 'Could not submit.')); refreshRow(story.id); }
  };

  const archive = async () => {
    if (!story || !confirm('Archive this story? It will be withdrawn and no longer public. You can reopen it later.')) return;
    try { await run({ action: 'archive', id: story.id, version: versionRef.current }); await refreshRow(story.id, { force: true }); say(true, 'Archived.'); }
    catch (e) { say(false, errMsg(e)); refreshRow(story.id); }
  };

  const removeServerMedia = async (mediaId: number) => {
    if (!story) return false;
    try { await run({ action: 'removeMedia', id: story.id, version: versionRef.current, mediaId }); await refreshRow(story.id); return true; }
    catch (e) { say(false, errMsg(e)); refreshRow(story.id); return false; }
  };

  // ---------- serialized upload queue ----------
  const patchU = (key: string, p: Partial<Pending>) => {
    uploadsRef.current = uploadsRef.current.map((x) => (x.key === key ? { ...x, ...p } : x));
    setUploads(uploadsRef.current);
  };
  const dropU = (key: string) => {
    const it = uploadsRef.current.find((x) => x.key === key);
    if (it) URL.revokeObjectURL(it.preview);
    uploadsRef.current = uploadsRef.current.filter((x) => x.key !== key);
    setUploads(uploadsRef.current);
  };

  async function processQueue() {
    if (runningRef.current || !story) return;
    runningRef.current = true;
    try {
      for (;;) {
        const it = uploadsRef.current.find((x) => x.phase === 'queued');
        if (!it || !aliveRef.current) break;
        let uploadId = it.uploadId, uploadUrl = it.uploadUrl;
        try {
          if (!uploadId || !uploadUrl) {
            patchU(it.key, { phase: 'reserving', error: undefined });
            const fresh = await refreshRow(story.id);
            if (!fresh) throw new Error('Story not found. Close and reopen it.');
            if (conflictPending(fresh)) throw new Error('This story changed elsewhere. Reload it before adding media.');
            const t = await reqUpload.mutateAsync({ data: { contributionId: story.id, version: versionRef.current, filename: it.file.name.slice(0, 200), contentType: it.file.type as 'image/jpeg', size: it.file.size, altText: it.alt || undefined } });
            versionRef.current = t.version;
            uploadId = t.id; uploadUrl = t.uploadUrl;
            patchU(it.key, { uploadId, uploadUrl });
          }
          if (!uploadsRef.current.find((x) => x.key === it.key)?.putDone) {
            patchU(it.key, { phase: 'uploading', progress: 0 });
            await new Promise<void>((resolve, reject) => {
              const x = new XMLHttpRequest();
              xhrRef.current = x;
              x.open('PUT', uploadUrl!);
              x.setRequestHeader('Content-Type', it.file.type);
              x.upload.onprogress = (e) => e.lengthComputable && patchU(it.key, { progress: Math.round((e.loaded / e.total) * 100) });
              x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error(`Upload failed (${x.status}). Retry to resume this attachment.`)));
              x.onerror = () => reject(new Error('Network error during upload. Retry to resume this attachment.'));
              x.onabort = () => reject(new Error('Upload cancelled.'));
              x.send(it.file);
            });
            xhrRef.current = null;
            patchU(it.key, { putDone: true, progress: 100 });
          }
          patchU(it.key, { phase: 'completing' });
          await complete.mutateAsync({ id: uploadId! });
          dropU(it.key);
          await refreshRow(story.id);
          onActivity();
        } catch (e) {
          xhrRef.current = null;
          if (aliveRef.current) patchU(it.key, { phase: 'error', error: errMsg(e, e instanceof Error ? e.message : 'Upload failed.') });
        }
      }
    } finally {
      runningRef.current = false;
      await invalidate();
    }
  }
  function conflictPending(fresh: GratitudeStory) { return !sameFields(fieldsOf(fresh), baselineRef.current); }

  const videoDuration = (file: File) => new Promise<number>((res) => { const v = document.createElement('video'); v.preload = 'metadata'; const u = URL.createObjectURL(file); v.onloadedmetadata = () => { URL.revokeObjectURL(u); res(v.duration); }; v.onerror = () => { URL.revokeObjectURL(u); res(0); }; v.src = u; });

  async function addFiles(files: FileList | null) {
    if (!files || !story) return;
    if (dirty) { say(false, 'Save your text changes before adding media.'); return; }
    let imgs = imageCount, vid = hasVideo;
    for (const file of Array.from(files)) {
      const isImg = IMG.includes(file.type), isVid = VID.includes(file.type);
      let error: string | undefined;
      if (!isImg && !isVid) error = 'Use JPEG, PNG or WebP photos, or an MP4, WebM or MOV video.';
      else if (isImg && file.size > 10 * 1024 * 1024) error = 'Photos must be 10 MB or less.';
      else if (isVid && file.size > 100 * 1024 * 1024) error = 'Videos must be 100 MB or less.';
      else if (isVid && (vid || imgs > 0)) error = 'A story can include one video or up to three photos, not both.';
      else if (isImg && (vid || imgs >= 3)) error = 'A story can include up to three photos, or one video.';
      else if (isVid && (await videoDuration(file)) > 180) error = 'Videos must be 3 minutes or shorter.';
      if (error) { say(false, `${file.name}: ${error}`); continue; }
      if (isImg) imgs++; else vid = true;
      const p: Pending = { key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, file, preview: URL.createObjectURL(file), alt: alt.trim(), progress: 0, phase: 'queued' };
      uploadsRef.current = [...uploadsRef.current, p];
      setUploads(uploadsRef.current);
    }
    setAlt('');
    if (fileRef.current) fileRef.current.value = '';
    processQueue();
  }

  const retryU = (key: string) => { patchU(key, { phase: 'queued', error: undefined }); processQueue(); };
  const removeU = async (u: Pending) => {
    if (u.uploadId && story) {
      // The reservation exists on the server; remove that attachment too.
      const fresh = await refreshRow(story.id, { force: false });
      const m = (fresh ?? story).media.find((x) => x.uploadId === u.uploadId);
      if (m && !(await removeServerMedia(m.id))) return;
    }
    dropU(u.key);
  };

  const close = () => {
    if (uploading && !confirm('An upload is in progress. Closing cancels it. Continue?')) return;
    if (dirty && !confirm('You have unsaved changes. Close without saving?')) return;
    onClose();
  };

  if (loadingRow) return <section className={`${card} p-5`}><Skeleton rows={3} /></section>;
  const editable = !story || ['draft', 'rejected', 'published', 'hidden', 'archived'].includes(story.status);

  return (
    <section className={`${card} p-5 sm:p-6`} aria-label="Story editor" data-testid="panel-story-editor">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-ink-900">{story ? 'Your story' : 'New story'}</h2>
        <div className="flex items-center gap-2">{story && <StatusPill s={story.status} />}<button className={btnGhost} onClick={close} data-testid="button-close-editor">Close</button></div>
      </div>
      {story && <p className="mt-1 text-xs text-ink-700">{statusNote(story)}</p>}
      {!story && !campaignActive && <p className="mt-2 border-l-2 border-gold-500 pl-2 text-xs text-gold-700" data-testid="text-no-campaign-local">No campaign is active. What you write here stays in this browser tab only and is not saved. Saving opens once the Founder activates a campaign.</p>}

      {conflict && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border border-gold-500/50 bg-gold-500/10 p-3 text-sm text-ink-800" role="alert" data-testid="panel-conflict">
          <AlertTriangle className="h-4 w-4 text-gold-700" />This story was changed elsewhere. Reload the latest version before saving; your unsaved text here will be replaced.
          <button className={btn} onClick={() => adopt(conflict, true)} data-testid="button-reload-story">Reload latest</button>
        </div>
      )}

      <div className="mt-4 flex gap-1 rounded-full bg-ivory-200 p-1 text-xs" role="tablist">
        <button role="tab" aria-selected={!preview} className={`min-h-9 flex-1 rounded-full px-3 py-1.5 ${!preview ? 'bg-ivory-50 font-semibold shadow-sm' : ''}`} onClick={() => setPreview(false)} data-testid="tab-write">Write</button>
        <button role="tab" aria-selected={preview} className={`min-h-9 flex-1 rounded-full px-3 py-1.5 ${preview ? 'bg-ivory-50 font-semibold shadow-sm' : ''}`} onClick={() => setPreview(true)} data-testid="tab-preview">Preview</button>
      </div>

      {preview ? (
        <article className="mt-4 border border-sand-200 bg-ivory-100" data-testid="story-preview">
          <StoryMedia media={media} />
          {uploads.length > 0 && <div className="grid grid-cols-3 gap-1 p-1">{uploads.map((u) => VID.includes(u.file.type) ? <video key={u.key} src={u.preview} controls className="col-span-3 w-full" /> : <img key={u.key} src={u.preview} alt={u.alt} className="aspect-square w-full object-cover" />)}</div>}
          <div className="p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-lagoon-700"><Flag code={f.countryCode} name={country?.name} className="h-6 w-9 border border-sand-200" />{country ? [country.name, country.region, country.continent].filter(Boolean).join(' · ') : 'No country selected'}</p>
            <h3 className="mt-2 font-display text-2xl text-ink-900">{f.title || 'Untitled'}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">{f.body || (readyVideo ? '' : 'Your story text will appear here.')}</p>
            {dirty && <p className="mt-3 text-xs text-gold-700">Preview includes unsaved changes.</p>}
          </div>
        </article>
      ) : (
        <div className="mt-4 grid gap-4">
          <label className="text-xs font-semibold text-ink-800">Campaign
            <select className={`${field} mt-1`} value={f.campaignId ?? ''} disabled={!editable} onChange={(e) => set({ campaignId: e.target.value ? Number(e.target.value) : undefined })} data-testid="select-campaign">
              {campaigns.length === 0 && <option value="">No active campaign yet</option>}
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}{c.status !== 'active' ? ` (${c.status})` : ''}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-ink-800">Title
            <input className={`${field} mt-1`} maxLength={160} value={f.title} disabled={!editable} ref={titleRef} onChange={(e) => set({ title: e.target.value })} data-testid="input-title" />
          </label>
          <label className="text-xs font-semibold text-ink-800">Your message <span className="font-normal text-sand-400">({f.body.length}/5000 · optional when you add a video)</span>
            <textarea className={`${field} mt-1 min-h-48`} maxLength={5000} value={f.body} disabled={!editable} onChange={(e) => set({ body: e.target.value })} data-testid="input-body" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative text-xs font-semibold text-ink-800">
              <label htmlFor="ttw-ed-country">Country your story is about (optional)</label>
              <div className="mt-1 flex items-center gap-2">
                {country && <Flag code={country.code} name={country.name} className="h-6 w-9 shrink-0 border border-sand-200" />}
                <input id="ttw-ed-country" className={field} value={cq} placeholder={country ? country.name : 'Search in any language'} disabled={!editable} onChange={(e) => setCq(e.target.value)} data-testid="input-story-country" />
              </div>
              {matches.length > 0 && <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto border border-sand-200 bg-ivory-50 shadow-lg">{matches.map((c) => { const o = options.countries.find((x) => x.code === c.code); return <li key={c.code}><button type="button" className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm font-normal hover:bg-ivory-200" onClick={() => { set({ countryCode: c.code }); setCq(''); }} data-testid={`option-story-country-${c.code}`}><Flag code={c.code} name={c.name} className="h-4 w-6 shrink-0" /><span>{countryLabel(c, locale)}<span className="block text-[11px] text-ink-700">{[o?.region, o?.continent].filter(Boolean).join(' · ')}</span></span></button></li>; })}</ul>}
              {country && <p className="mt-1 font-normal text-ink-700">{[country.region, country.continent].filter(Boolean).join(' · ')}</p>}
              {f.countryCode && editable && <button type="button" className="mt-1 min-h-9 text-xs font-normal underline" onClick={() => set({ countryCode: null })}>Clear country</button>}
              <p className="mt-1 font-normal text-sand-400">Describes your story, never a verified nationality.</p>
            </div>
            <fieldset className="text-xs font-semibold text-ink-800">
              <legend>Gratitude theme</legend>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {options.themes.map((t) => <button type="button" key={t.id} disabled={!editable} aria-pressed={f.theme === t.id} onClick={() => set({ theme: f.theme === t.id ? null : t.id })} className={`ttw-chip ${f.theme === t.id ? 'is-on' : ''}`} data-testid={`button-theme-${t.id}`}>{t.label}</button>)}
              </div>
            </fieldset>
          </div>
        </div>
      )}

      {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-lagoon-700' : 'text-crimson-700'}`} role={msg.ok ? 'status' : 'alert'} data-testid="text-editor-message">{msg.t}</p>}
      {editable && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className={btn} disabled={pending || !canSave || (!!story && !dirty)} onClick={save} data-testid="button-save-draft">{story ? 'Save changes' : 'Save private draft'}</button>
          {story && <span className="text-xs text-ink-700" data-testid="text-dirty">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>}
          {!story && !f.body.trim() && <span className="text-xs text-ink-700">Video-only story? Add a title, save, then upload your video.</span>}
        </div>
      )}

      <div ref={mediaRef} className={`mt-6 border-t pt-5 ${intent === 'video' ? 'border-gold-500' : 'border-sand-200'}`} data-testid="section-media">
        <h3 className="font-display text-lg text-ink-900">Video or photos</h3>
        <p className="mt-1 text-xs text-ink-700">One MP4, WebM or MOV video (100 MB, 3 minutes), or up to three JPEG, PNG or WebP photos (10 MB each). Choose files from your phone or computer. Recording inside the site is not available. Files upload one at a time; the server then processes them, which can take a moment.</p>
        {!story ? <p className="mt-2 text-xs text-gold-700" data-testid="text-save-before-media">{intent === 'video' ? 'To upload your video: add a title (a message is optional), choose Save private draft above, and the video chooser opens here.' : 'Save your story first to attach media.'}</p> : (
          <>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {media.map((m) => (
                <li key={m.id} className="border border-sand-200 bg-ivory-100 p-1" data-testid={`media-${m.id}`}>
                  {m.url ? (m.kind === 'video' ? <video src={mediaSrc(m.url)!} poster={mediaSrc(m.thumbnailUrl) ?? undefined} controls preload="metadata" className="w-full" aria-label={m.altText || 'Your video'} /> : <StoryMedia media={[m]} compact />) : <div className="grid aspect-[4/3] place-items-center p-2 text-center text-xs text-ink-700">{m.status === 'failed' ? 'Processing failed. Remove it and try another file.' : 'Processing on server…'}</div>}
                  <p className="mt-1 truncate text-[11px] text-ink-700">{m.kind} · {m.status}</p>
                  {editable && <button className="inline-flex min-h-11 items-center gap-1 px-1 text-[11px] text-crimson-700 underline" onClick={() => confirm('Remove this attachment?') && removeServerMedia(m.id)} disabled={pending || uploading} data-testid={`button-remove-media-${m.id}`}><Trash2 className="h-3 w-3" />Remove</button>}
                </li>
              ))}
              {uploads.map((u) => (
                <li key={u.key} className="border border-sand-200 bg-ivory-100 p-1" data-testid="upload-pending">
                  {VID.includes(u.file.type) ? <video src={u.preview} muted className="w-full" aria-label="Local preview" /> : <img src={u.preview} alt={u.alt} className="aspect-[4/3] w-full object-cover" />}
                  <p className="mt-1 text-[11px] text-ink-700" role="status">{u.phase === 'queued' ? 'Waiting…' : u.phase === 'reserving' ? 'Preparing…' : u.phase === 'uploading' ? `Uploading ${u.progress}%` : u.phase === 'completing' ? 'Processing on server…' : u.error}</p>
                  {u.phase === 'uploading' && <div className="h-1 bg-sand-200"><div className="h-1 bg-lagoon-700" style={{ width: `${u.progress}%` }} /></div>}
                  {u.phase === 'error' && <div className="flex gap-2 text-[11px]"><button className="inline-flex min-h-11 items-center gap-1 px-1 underline" onClick={() => retryU(u.key)} data-testid="button-retry-upload"><RotateCw className="h-3 w-3" />Retry</button><button className="inline-flex min-h-11 items-center px-1 text-crimson-700 underline" onClick={() => removeU(u)} data-testid="button-dismiss-upload">Remove{u.uploadId ? ' attachment' : ''}</button></div>}
                </li>
              ))}
            </ul>
            {editable && !hasVideo && imageCount < 3 && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex-1 text-xs font-semibold text-ink-800">Describe the video or image (for screen readers)
                  <input className={`${field} mt-1`} maxLength={500} value={alt} onChange={(e) => setAlt(e.target.value)} data-testid="input-alt-text" />
                </label>
                <input ref={fileRef} type="file" className="sr-only" accept={[...VID, ...IMG].join(',')} multiple onChange={(e) => addFiles(e.target.files)} id="ttw-file" disabled={!!conflict} data-testid="input-file" />
                <label htmlFor="ttw-file" id="ttw-file-label" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }} className={`${btnGhost} min-h-11 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold-500`}><ImagePlus className="h-4 w-4" />{intent === 'video' ? 'Choose your video' : 'Choose video or photos'}</label>
              </div>
            )}
          </>
        )}
      </div>

      {story && (
        <div className="mt-6 border-t border-sand-200 pt-5">
          <h3 className="font-display text-lg text-ink-900">Your public profile</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-700" data-testid="text-profile-eligible">{story.profileEligible ? 'Your profile settings allow your published stories to appear on your public profile.' : 'Your profile is not public, so your stories will not appear on it and readers cannot open it. Taking part never changes that; only you can, in your privacy settings.'} <Link href="/member/settings" className="font-semibold text-lagoon-700 underline">Privacy settings</Link></p>
        </div>
      )}

      {story && submittable && (
        <div className="mt-6 border-t border-sand-200 pt-5">
          <h3 className="font-display text-lg text-ink-900">Send for review</h3>
          <p className="mt-1 text-xs text-ink-700">{dirty ? 'Your unsaved changes will be saved first, then submitted.' : 'The Founder reads every story; no one can approve their own.'} A story needs a title and either a message or a processed video.</p>
          <label className="mt-3 flex items-start gap-2 text-sm text-ink-800"><input type="checkbox" className="mt-1 h-4 w-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="checkbox-consent" />I agree that TOMI may publish this story in the campaign if approved (consent {options.consentVersion}).</label>
          <label className="mt-2 flex items-start gap-2 text-sm text-ink-800"><input type="checkbox" className="mt-1 h-4 w-4" checked={rights} onChange={(e) => setRights(e.target.checked)} data-testid="checkbox-rights" />I created this story and hold the rights to every photo or video, including permission from people shown.</label>
          {!campaignActive && <p className="mt-2 text-xs text-gold-700">This story's campaign is not active, so it cannot be submitted right now.</p>}
          {!hasContent && <p className="mt-2 text-xs text-gold-700">Add a message, or wait until your video has finished processing.</p>}
          <button className={`${btn} mt-3 min-h-11`} disabled={!canSubmit} onClick={submit} data-testid="button-submit-story"><Send className="h-4 w-4" />{dirty ? 'Save and submit for review' : 'Submit for review'}</button>
        </div>
      )}

      {story && story.status !== 'archived' && (
        <div className="mt-6 border-t border-sand-200 pt-4"><button className={`${btnGhost} min-h-11 text-crimson-700`} disabled={pending || uploading} onClick={archive} data-testid="button-archive-story"><Archive className="h-4 w-4" />Archive story</button></div>
      )}
    </section>
  );
}
