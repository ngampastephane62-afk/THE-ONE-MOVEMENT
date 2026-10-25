import { useState, type FormEvent } from 'react';
import { useProfileReadiness, ReadinessLock } from '@/components/network/readiness';
import { Link } from 'wouter';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAct, useUploads, UploadTray, card, btn, btnGhost, field } from '@/components/network/kit';
import { useMe } from './ctx';

const PREFIX = '#ThanksEmirates — Thank You, Emirates. We Are One.\n\n';
const MIN = 20;

export default function ThanksEmiratesForm() {
  const { me } = useMe();
  const { run, pending } = useAct();
  const ready = useProfileReadiness();
  const u = useUploads(1);
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<number | null>(null);

  const t = text.trim();
  const hasVideo = u.ids.length > 0;
  const videoTypeOk = u.items.every((x) => x.file.type.startsWith('video/'));
  const uploadsOk = !u.busy && videoTypeOk && u.items.every((x) => x.status === 'done');
  const meaningful = t.length >= MIN || hasVideo;
  const canSubmit = meaningful && consent && uploadsOk && !pending && ready.complete;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    try {
      const r = await run({ action: 'post.create', kind: 'post', text: PREFIX + t, mediaIds: u.ids });
      if (!r?.id) throw new Error('no id');
      setDoneId(r.id);
      setText(''); setConsent(false); u.clear();
    } catch {
      setErr('Your story was not submitted. Your draft is kept; please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <header className="overflow-hidden rounded-2xl bg-lagoon-900 p-6 text-ivory-100">
        <p className="text-eyebrow text-gold-400">#THANKSEMIRATES</p>
        <h1 className="mt-1 font-display text-2xl">Thank You, Emirates. We Are One.</h1>
        <p className="mt-2 text-sm leading-relaxed text-ivory-300">Share a personal story of gratitude, coexistence or opportunity. Free. Written testimony, a video with a caption, or both.</p>
      </header>

      {doneId != null && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-lagoon-600/40 bg-lagoon-600/5 p-4" role="status" data-testid="status-submitted">
          <CheckCircle2 className="h-5 w-5 text-lagoon-600" />
          <p className="flex-1 text-sm text-ink-800">Thank you. Your story was shared with the member network (post #{doneId}).</p>
          <Link href={`/member/profile/${me.id}`} className={btn} data-testid="link-own-profile">View on my profile</Link>
          <Link href="/member" className={btnGhost} data-testid="link-feed">Open feed</Link>
        </div>
      )}

      {!me.enabled && (
        <div className="rounded-2xl border border-gold-500/40 bg-ivory-50 p-4 text-sm text-ink-800" data-testid="notice-activate">
          Your network is not activated yet. When you submit, you will be asked to confirm activation explicitly, which makes your name visible to signed-in members only.
        </div>
      )}

      <form onSubmit={submit} className={`${card} flex flex-col gap-4 p-5`}>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-900">
          Your testimony
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={4900} className={field} placeholder="In your own words..." data-testid="input-testimony" />
          <span className="text-xs font-normal text-sand-400">{hasVideo ? 'Add a short caption for your video.' : `At least ${MIN} characters, or attach a video.`}</span>
        </label>
        <div>
          <p className="mb-1 text-sm font-semibold text-ink-900">Video (optional, one file, up to 100 MB)</p>
          <UploadTray u={u} accept="video/*" label="Attach a video" testId="upload-video" />
          {!videoTypeOk && <p className="mt-2 text-xs text-crimson-700" role="alert">Please remove this attachment and choose a video. You can also submit a written testimony without an attachment.</p>}
        </div>
        <label className="flex items-start gap-3 text-sm text-ink-800">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-lagoon-600" data-testid="checkbox-consent" />
          <span>I agree that my story will be visible to signed-in TOMI members. I understand it is not automatically published on the public website and is not sent to any broadcaster.</span>
        </label>
        {err && <p className="text-sm text-crimson-700" role="alert" data-testid="text-error">{err}</p>}
        <ReadinessLock action="submit your story" />
        <button type="submit" disabled={!canSubmit} className={`${btn} w-fit`} data-testid="button-submit-story">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}Share my story
        </button>
      </form>
    </div>
  );
}
