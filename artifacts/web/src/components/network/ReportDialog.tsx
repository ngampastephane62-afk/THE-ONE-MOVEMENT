import { useState } from 'react';
import { btn, btnGhost, field, useAct } from './kit';

export interface ReportTarget { postId?: number; memberId?: number }

export default function ReportDialog({ target, onClose }: { target: ReportTarget | null; onClose: () => void }) {
  const { run, pending } = useAct();
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  if (!target) return null;
  const close = () => { setReason(''); setDone(false); setErr(false); onClose(); };
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-ink-900/50 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={close}>
      <div className="w-full max-w-md rounded-t-3xl bg-ivory-50 p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="report-title" className="font-display text-lg text-ink-900">{done ? 'Report received' : target.postId ? 'Report this post' : 'Report this member'}</h2>
        {done ? (
          <><p className="mt-2 text-sm text-ink-700">The TOMI moderation team will review it. You can also block this member from their profile.</p><button className={`${btn} mt-5`} onClick={close}>Close</button></>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setErr(false); run({ action: 'report', id: target.postId, targetId: target.memberId, text: reason.trim() }).then(() => setDone(true)).catch(() => setErr(true)); }}>
            <label htmlFor="report-reason" className="mt-3 block text-sm text-ink-800">What is wrong? Moderators see this reason.</label>
            <textarea id="report-reason" required minLength={3} maxLength={1000} className={`${field} mt-1 min-h-28`} value={reason} onChange={(e) => setReason(e.target.value)} data-testid="input-report-reason" />
            {err && <p className="mt-2 text-xs text-crimson-700" role="alert">The report could not be sent. Try again.</p>}
            <div className="mt-4 flex gap-2"><button className={btn} disabled={pending || reason.trim().length < 3} data-testid="button-submit-report">Send report</button><button type="button" className={btnGhost} onClick={close}>Cancel</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
