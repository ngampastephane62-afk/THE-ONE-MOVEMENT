import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export interface ConfirmSpec {
  title: string;
  verb: string;
  targetName: string;
  targetId: string;
  reasonLabel: string;
  danger?: boolean;
  /** Key used to keep the draft per action + target, so a failure never loses text. */
  draftKey: string;
}

const drafts = new Map<string, string>();

/** Accessible confirmation: reason >= 10 chars + explicit confirm. Drafts survive errors and polls. */
export default function ConfirmActionDialog({ spec, pending, error, onCancel, onConfirm }: {
  spec: ConfirmSpec | null; pending: boolean; error: string; onCancel: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [ack, setAck] = useState(false);
  const keyRef = useRef('');
  useEffect(() => {
    if (spec && keyRef.current !== spec.draftKey) { keyRef.current = spec.draftKey; setReason(drafts.get(spec.draftKey) ?? ''); setAck(false); }
    if (!spec) keyRef.current = '';
  }, [spec]);
  const ok = reason.trim().length >= 10 && reason.length <= 3000 && ack && !pending;
  return (
    <Dialog open={!!spec} onOpenChange={(o) => { if (!o && !pending) onCancel(); }}>
      <DialogContent className="max-w-lg rounded-3xl border-sand-200 bg-ivory-50" data-testid="dialog-confirm-action">
        {spec && (
          <form onSubmit={(e) => { e.preventDefault(); if (ok) onConfirm(reason.trim()); }} className="flex flex-col gap-4">
            <div>
              <p className="text-eyebrow text-gold-700">CONFIRMATION REQUIRED</p>
              <DialogTitle className="mt-1 font-display text-xl text-ink-900">{spec.title}</DialogTitle>
              <DialogDescription className="mt-2 text-sm text-ink-700">
                Target: <strong className="text-ink-900" data-testid="text-confirm-target">{spec.targetName}</strong>
                <span className="mt-0.5 block break-all font-mono text-xs" data-testid="text-confirm-target-id">ID {spec.targetId}</span>
              </DialogDescription>
            </div>
            <div>
              <label htmlFor="confirm-reason" className="text-xs font-semibold text-ink-800">{spec.reasonLabel} <span className="font-normal text-ink-700">(at least 10 characters)</span></label>
              <textarea id="confirm-reason" rows={4} maxLength={3000} value={reason} onChange={(e) => { setReason(e.target.value); drafts.set(spec.draftKey, e.target.value); }} aria-describedby="confirm-reason-count" className="mt-1 w-full rounded-xl border border-sand-300 bg-ivory-100 px-3 py-2 text-sm focus:border-lagoon-600 focus:outline-none focus:ring-2 focus:ring-lagoon-600/20" data-testid="input-confirm-reason" />
              <p id="confirm-reason-count" className={`text-[11px] ${reason.trim().length >= 10 ? 'text-ink-700' : 'text-coral-600'}`}>{reason.trim().length}/10 minimum · {reason.length}/3000</p>
            </div>
            <label className="flex items-start gap-2 text-xs text-ink-800">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 accent-[#c49a4a]" data-testid="checkbox-confirm-ack" />
              <span>I confirm I want to {spec.verb} for {spec.targetName}. This is recorded in the audit log.</span>
            </label>
            {error && <p role="alert" className="rounded-xl border border-crimson-700/30 bg-ivory-100 p-3 text-xs text-crimson-700" data-testid="error-confirm-action">{error} Your text is kept.</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" disabled={pending} onClick={onCancel} className="rounded-full border border-sand-300 px-4 py-2 text-xs font-semibold text-ink-800 disabled:opacity-50" data-testid="button-cancel-action">Cancel</button>
              <button type="submit" disabled={!ok} className={`rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40 ${spec.danger ? 'bg-crimson-700 text-ivory-50' : 'bg-lagoon-900 text-gold-400'}`} data-testid="button-confirm-action">{pending ? 'Working…' : `Confirm: ${spec.verb}`}</button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const clearDraft = (key: string) => drafts.delete(key);
