import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import {
  useGetAdministrativeServiceMessages, getGetAdministrativeServiceMessagesQueryKey, replyToAdministrativeServiceMessage,
} from '@workspace/api-client-react';
import { errStatus } from './kit';

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const rid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/** Separate administrative channel. Hidden when no administration message exists. */
export default function AdministrativeServiceInbox() {
  const qc = useQueryClient();
  const q = useGetAdministrativeServiceMessages({ query: { queryKey: getGetAdministrativeServiceMessagesQueryKey(), refetchInterval: 30_000, retry: false } });
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const attempt = useRef<{ text: string; id: string } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [open, setOpen] = useState(true);
  const d = q.data;
  if (q.isError && !d) return (
    <div role="alert" className="mx-2 mb-4 rounded-2xl border border-crimson-700/30 bg-ivory-50 p-3 text-xs text-ink-800 md:mx-0" data-testid="error-admin-service">
      Messages from Administration TOMI could not be loaded{errStatus(q.error) ? ` (HTTP ${errStatus(q.error)})` : ''}. <button type="button" onClick={() => q.refetch()} className="font-semibold text-lagoon-700 underline" data-testid="button-retry-admin-service">Retry</button>
    </div>
  );
  if (!d || d.messages.length === 0) return null;
  const lastAdminId = d.messages.reduce((m, x) => (x.fromAdministration ? Math.max(m, x.id) : m), 0);
  async function markRead() {
    if (!lastAdminId || busy) return;
    setBusy(true); setMsg(null);
    try {
      await replyToAdministrativeServiceMessage({ readThrough: lastAdminId });
      setMsg({ ok: true, t: 'Marked as read.' });
      qc.invalidateQueries({ queryKey: getGetAdministrativeServiceMessagesQueryKey() });
    } catch (e) {
      setMsg({ ok: false, t: `Could not mark as read${errStatus(e) ? ` (HTTP ${errStatus(e)})` : ''}.` });
    } finally { setBusy(false); }
  }
  const opened = d.messages.some((m) => m.fromAdministration);

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true); setMsg(null);
    try {
      if (attempt.current?.text !== body) attempt.current = { text: body, id: rid() };
      await replyToAdministrativeServiceMessage({ text: body, requestId: attempt.current.id });
      attempt.current = null;
      setText('');
      setMsg({ ok: true, t: 'Reply sent to the administration.' });
      qc.invalidateQueries({ queryKey: getGetAdministrativeServiceMessagesQueryKey() });
    } catch (e) {
      setMsg({ ok: false, t: `Your reply could not be confirmed${errStatus(e) ? ` (HTTP ${errStatus(e)})` : ''}. Your text is kept; retrying will not duplicate it.` });
    } finally { setBusy(false); }
  }

  return (
    <section aria-labelledby="svc-title" className="mx-2 mb-4 rounded-2xl border border-gold-500/50 bg-lagoon-900 text-ivory-100 md:mx-0" data-testid="panel-admin-service">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="svc-body" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" data-testid="button-toggle-admin-service">
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold-400" /><span id="svc-title" className="text-sm font-semibold">Administration TOMI · Founder</span></span>
        {d.unread > 0 && <span className="rounded-full bg-gold-500 px-2 text-[11px] font-bold text-ink-900" data-testid="badge-admin-unread">{d.unread} new</span>}
      </button>
      {open && (
        <div id="svc-body" className="border-t border-gold-500/25 px-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <p className="text-[11px] text-ivory-300">An official service channel, separate from your personal conversations. No email is sent.</p>
            {d.unread > 0 && lastAdminId > 0 && <button type="button" disabled={busy} onClick={markRead} className="text-xs font-semibold text-gold-400 underline disabled:opacity-50" data-testid="button-admin-mark-read">Mark displayed as read</button>}
          </div>
          {q.isError && <p role="alert" className="mt-1 text-[11px] text-coral-500">Latest refresh failed. <button type="button" className="underline" onClick={() => q.refetch()}>Retry</button></p>}
          <ol className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto" aria-live="polite">
            {d.messages.map((m) => (
              <li key={m.id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.fromAdministration ? 'self-start bg-ivory-50 text-ink-900' : 'self-end bg-lagoon-700 text-ivory-50'}`} data-testid={`admin-message-${m.id}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{m.fromAdministration ? 'Administration' : 'You'}</p>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-0.5 text-right text-[10px] opacity-70">{fmt(m.createdAt)}</p>
              </li>
            ))}
          </ol>
          {opened ? (
            <form className="mt-3 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <label htmlFor="svc-reply" className="sr-only">Reply to the administration</label>
              <textarea id="svc-reply" rows={2} maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to the administration" className="w-full rounded-xl border border-gold-500/30 bg-lagoon-800 px-3 py-2 text-sm text-ivory-50 placeholder:text-ivory-300/60 focus:border-gold-400 focus:outline-none" data-testid="input-admin-reply" />
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={busy || !text.trim()} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 disabled:opacity-40" data-testid="button-admin-reply">{busy ? 'Sending…' : 'Send reply'}</button>
                {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-xs ${msg.ok ? 'text-gold-400' : 'text-coral-500'}`}>{msg.t}</p>}
              </div>
            </form>
          ) : <p className="mt-3 text-xs text-ivory-300">Replies open once the administration writes to you.</p>}
        </div>
      )}
    </section>
  );
}
