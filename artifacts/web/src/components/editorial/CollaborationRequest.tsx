import { useState } from 'react';
import { useAuth } from '@clerk/react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; reference: string }
  | { kind: 'auth' }
  | { kind: 'membership' }
  | { kind: 'error'; message: string };

const MIN = 40;
const MAX = 2000;

/**
 * Professional introduction request. POST /api/professional/introductions.
 * Uses cookie credentials (same session as other authenticated calls).
 * Nothing here guarantees delivery, a reply, or contact with the person.
 */
export default function CollaborationRequest({ targetSlug, targetName }: { targetSlug: string; targetName: string }) {
  const { getToken } = useAuth();
  const [message, setMessage] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const len = message.trim().length;
  const tooShort = len > 0 && len < MIN;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (len < MIN || len > MAX) return;
    setState({ kind: 'sending' });
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/professional/introductions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ targetSlug, message: message.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { reference?: string; id?: string | number; error?: string; message?: string } | null;
      if (res.status === 401) return setState({ kind: 'auth' });
      if (res.status === 402 || res.status === 403) return setState({ kind: 'membership' });
      if (!res.ok) return setState({ kind: 'error', message: data?.error || data?.message || 'The request could not be recorded. Please try again.' });
      const reference = data?.reference ?? (data?.id != null ? String(data.id) : '');
      if (!reference) return setState({ kind: 'error', message: 'The server did not return a reference. Your request may not have been recorded.' });
      setState({ kind: 'done', reference });
      setMessage('');
    } catch {
      setState({ kind: 'error', message: 'Network error. Your message is preserved below; please retry.' });
    }
  }

  if (state.kind === 'done') {
    return (
      <div className="border border-gold-500/50 bg-ivory-50 p-7" data-testid="status-introduction-recorded">
        <p className="text-eyebrow text-gold-600">REQUEST RECORDED</p>
        <p className="mt-3 font-display text-2xl text-ink-900">Reference <span className="font-mono text-lagoon-600" data-testid="text-introduction-reference">{state.reference}</span></p>
        <p className="mt-3 text-sm leading-relaxed text-ink-800">Your introduction request regarding {targetName} has been recorded for review by the TOMI team. This is not a confirmation that the message has been delivered to, read by, or accepted by the nominee or their representatives.</p>
        <button type="button" className="mt-5 text-xs uppercase tracking-[0.18em] text-gold-600 underline-offset-4 hover:underline" onClick={() => setState({ kind: 'idle' })} data-testid="button-new-introduction">Write another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-sand-300 bg-ivory-50 p-7" data-testid="form-introduction">
      <p className="text-eyebrow text-gold-600">PROFESSIONAL COLLABORATION</p>
      <h3 className="mt-3 font-display text-2xl text-ink-900">Request an introduction</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">For verified members with an active monthly membership. TOMI reviews each request; there is no guarantee of forwarding, reply or meeting.</p>
      <label htmlFor="intro-message" className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-ink-800">Your proposal</label>
      <textarea
        id="intro-message"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
        rows={6}
        placeholder={`Who you are, what you propose to ${targetName}'s team, and why it fits the Movement.`}
        className="mt-2 w-full resize-y border border-sand-300 bg-ivory-100 p-4 text-sm text-ink-900 outline-none transition-colors focus:border-gold-500"
        aria-invalid={tooShort}
        data-testid="input-introduction-message"
      />
      <div className="mt-1 flex justify-between text-[11px] text-ink-700">
        <span className={tooShort ? 'text-coral-500' : ''}>{tooShort ? `At least ${MIN} characters.` : ' '}</span>
        <span>{len}/{MAX}</span>
      </div>

      {state.kind === 'auth' && (
        <p className="mt-4 border-l-2 border-coral-500 pl-3 text-sm text-ink-800" data-testid="status-introduction-auth">Please <Link href="/sign-in" className="underline">sign in</Link> with a verified account. Your text stays here.</p>
      )}
      {state.kind === 'membership' && (
        <p className="mt-4 border-l-2 border-coral-500 pl-3 text-sm text-ink-800" data-testid="status-introduction-membership">Introductions require an active monthly membership. <Link href="/member/membership" className="underline">View membership</Link>. Your text stays here.</p>
      )}
      {state.kind === 'error' && (
        <p className="mt-4 border-l-2 border-coral-500 pl-3 text-sm text-ink-800" role="alert" data-testid="status-introduction-error">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="mt-6" disabled={len < MIN || state.kind === 'sending'} data-testid="button-submit-introduction">
        {state.kind === 'sending' ? 'RECORDING…' : state.kind === 'error' ? 'RETRY' : 'SUBMIT REQUEST'}
      </Button>
    </form>
  );
}
