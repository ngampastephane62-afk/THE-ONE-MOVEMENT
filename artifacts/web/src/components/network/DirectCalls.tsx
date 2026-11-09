import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, Mic, PhoneCall, PhoneOff, ShieldCheck, Video, X } from 'lucide-react';
import {
  useGetDirectCalls, useInviteDirectCall, useDecideDirectCall, useJoinDirectCall,
  type DirectCall, type DirectCallState, type DirectCallDecisionAction,
} from '@workspace/api-client-react';
import { useLocale } from '@/lib/locale';
import { useMe } from '@/pages/member/ctx';
import { errMsg } from '@/pages/member/proHooks';
import { STATE_PREFIX, btnGhost } from './kit';

/* ── Copy: English + French native; other languages pass through the existing text-node translator. ── */
const EN = {
  incoming: 'Private call request', audio: 'Audio call', video: 'Video call', from: 'wants to speak with you',
  accept: 'Accept', decline: 'Decline', cancel: 'Cancel request', end: 'End call', join: 'Join call', rejoin: 'Rejoin call',
  ringingOut: 'Waiting for a response', provisioning: 'Preparing a private room', active: 'Call room open',
  consent: 'Your camera and microphone stay off until you switch them on inside the call. Nothing is recorded.',
  limits: 'Pilot: two participants, rooms close after 15 minutes.', remaining: 'remaining', ringLeft: 'Ring expires in',
  disabled: 'Calls are unavailable', loadErr: 'Call status could not be loaded.', retry: 'Try again',
  callAudio: 'Start audio call', callVideo: 'Start video call', budget: 'Estimated reservations this month (not the actual bill)',
  reserved: 'reserved', committed: 'committed', left: 'estimated remaining', admission: 'admission threshold', paused: 'Admissions paused',
  ended: 'The call has ended.', closed: 'This room is closed.', close: 'Close', joining: 'Connecting…', dialog: 'Private call',
  outgoing: 'Calling', showCall: 'Show current call', status: { declined: 'Declined', missed: 'Missed', cancelled: 'Cancelled', ended: 'Ended', failed: 'Failed', uncertain: 'Status uncertain' } as Record<string, string>,
};
const FR: typeof EN = {
  incoming: 'Demande d’appel privé', audio: 'Appel audio', video: 'Appel vidéo', from: 'souhaite vous parler',
  accept: 'Accepter', decline: 'Refuser', cancel: 'Annuler la demande', end: 'Terminer l’appel', join: 'Rejoindre l’appel', rejoin: 'Rejoindre à nouveau',
  ringingOut: 'En attente de réponse', provisioning: 'Préparation d’une salle privée', active: 'Salle d’appel ouverte',
  consent: 'Votre caméra et votre micro restent coupés jusqu’à ce que vous les activiez dans l’appel. Rien n’est enregistré.',
  limits: 'Pilote : deux participants, les salles ferment après 15 minutes.', remaining: 'restantes', ringLeft: 'La sonnerie expire dans',
  disabled: 'Les appels sont indisponibles', loadErr: 'L’état des appels n’a pas pu être chargé.', retry: 'Réessayer',
  callAudio: 'Lancer un appel audio', callVideo: 'Lancer un appel vidéo', budget: 'Réservations estimées ce mois-ci (pas la facture réelle)',
  reserved: 'réservé', committed: 'engagé', left: 'restant estimé', admission: 'seuil d’admission', paused: 'Admissions suspendues',
  ended: 'L’appel est terminé.', closed: 'Cette salle est fermée.', close: 'Fermer', joining: 'Connexion…', dialog: 'Appel privé',
  outgoing: 'Appel vers', showCall: 'Afficher l’appel en cours', status: { declined: 'Refusé', missed: 'Manqué', cancelled: 'Annulé', ended: 'Terminé', failed: 'Échec', uncertain: 'État incertain' },
};
export function useCallCopy() { const { language } = useLocale(); return language === 'fr' ? { t: FR, fr: true } : { t: EN, fr: false }; }

const LIVE = ['ringing', 'provisioning', 'active', 'uncertain'];
const clock = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function useNow(on: boolean) { const [n, setN] = useState(Date.now()); useEffect(() => { if (!on) return; const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i); }, [on]); return n; }

interface Session { callId: string; mode: 'audio' | 'video' }
interface CallCtx {
  state?: DirectCallState; isLoading: boolean; isError: boolean; refetch: () => void;
  invite: (threadId: number, mode: 'audio' | 'video') => Promise<void>; inviting: boolean; error: string; setError: (s: string) => void;
  reopen: () => void;
}
const Ctx = createContext<CallCtx | null>(null);
export const useDirectCalls = () => useContext(Ctx);

export function DirectCallProvider({ children }: { children: ReactNode }) {
  const { me } = useMe();
  const { t, fr } = useCallCopy();
  const qc = useQueryClient();
  const key = useMemo(() => [...STATE_PREFIX, 'direct-calls', me.id] as const, [me.id]);
  const q = useGetDirectCalls({ query: { queryKey: key, refetchInterval: 4000 } });
  const inviteM = useInviteDirectCall();
  const decideM = useDecideDirectCall();
  const joinM = useJoinDirectCall();
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [joining, setJoining] = useState(false);
  const [notice, setNotice] = useState('');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const frameRef = useRef<DailyCall | null>(null);
  const generation = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const [loc] = useLocation();

  const refresh = useCallback(() => { qc.invalidateQueries({ queryKey: key }); }, [qc, key]);
  const teardown = useCallback(() => {
    generation.current++;
    const f = frameRef.current; frameRef.current = null;
    if (f) {
      try { f.setLocalAudio(false); f.setLocalVideo(false); } catch { /* frame may already be gone */ }
      f.leave().catch(() => undefined).finally(() => { try { f.destroy(); } catch { /* ignore */ } });
    }
    setSession(null); setJoining(false);
  }, []);
  useEffect(() => () => teardown(), [teardown]);
  useEffect(() => { teardown(); setDismissed(new Set()); setError(''); setNotice(''); }, [me.id, teardown]);
  // Navigation closes media; the call stays rejoinable by deliberate action.
  const firstLoc = useRef(loc);
  useEffect(() => { if (firstLoc.current !== loc) { firstLoc.current = loc; if (frameRef.current) teardown(); } }, [loc, teardown]);

  const calls = q.data?.calls ?? [];
  const sessionCall = session ? calls.find((c) => c.id === session.callId) : undefined;
  const now = useNow(!!session || calls.some((c) => LIVE.includes(c.status)));
  useEffect(() => {
    if (!session || !q.data) return;
    // Admission limits affect new invitations, not already reserved calls.
    const ended = !sessionCall || sessionCall.status !== 'active' || new Date(sessionCall.expiresAt).getTime() <= now;
    if (ended) { teardown(); setNotice(t.closed); }
  }, [session, sessionCall, q.data, now, teardown, t.closed]);

  const decide = async (callId: string, action: DirectCallDecisionAction) => {
    setError('');
    try { await decideM.mutateAsync({ callId, data: { action } }); refresh(); }
    catch (e) { setError(errMsg(e, 'The call action failed. Try again.')); }
  };
  const join = async (c: DirectCall) => {
    setError(''); setNotice(''); setJoining(true);
    const attempt = ++generation.current;
    try {
      const cred = await joinM.mutateAsync({ callId: c.id });
      if (attempt !== generation.current) return;
      setSession({ callId: c.id, mode: cred.mode });
      await new Promise((r) => requestAnimationFrame(r));
      if (attempt !== generation.current) return;
      if (!hostRef.current) throw new Error('Call window unavailable.');
      const frame = DailyIframe.createFrame(hostRef.current, {
        showLeaveButton: true, showFullscreenButton: false,
        iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '12px' },
      });
      frameRef.current = frame;
      frame.on('left-meeting', () => { if (frameRef.current === frame) { teardown(); decide(c.id, 'end'); } });
      frame.on('error', (ev) => { setError(ev?.errorMsg || 'The call connection failed.'); if (frameRef.current === frame) teardown(); });
      await frame.join({ url: cred.url, token: cred.token, startVideoOff: true, startAudioOff: true });
      setJoining(false);
    } catch (e) { if (attempt === generation.current) { teardown(); setError(errMsg(e, 'The call could not be joined.')); } }
  };
  const leave = (c?: DirectCall) => { const id = session?.callId ?? c?.id; teardown(); if (id) decide(id, 'end'); };

  const invite = async (threadId: number, mode: 'audio' | 'video') => {
    setError('');
    try { await inviteM.mutateAsync({ data: { threadId, mode, clientRequestId: crypto.randomUUID() } }); refresh(); }
    catch (e) { setError(errMsg(e, 'The call request could not be sent.')); throw e; }
  };

  const visible = calls.filter((c) => LIVE.includes(c.status) && !dismissed.has(c.id) && (c.initiatorId === me.id || c.recipientId === me.id));
  const focus = session ? sessionCall : visible[0];
  const busy = decideM.isPending || joining;
  const open = !!session || !!focus || !!notice;

  return (
    <Ctx.Provider value={{ state: q.data, isLoading: q.isLoading, isError: q.isError, refetch: () => q.refetch(), invite, inviting: inviteM.isPending, error, setError, reopen: () => setDismissed(new Set()) }}>
      {children}
      {open && (
        <div role="dialog" aria-modal="false" aria-labelledby="call-title" translate={fr ? 'no' : undefined} data-testid="dialog-direct-call"
          className={`fixed inset-x-2 z-50 mx-auto max-w-md animate-fade-up rounded-2xl border border-gold-500/40 bg-lagoon-900 p-4 text-ivory-100 shadow-2xl bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:bottom-6 md:right-6 md:left-auto md:inset-x-auto md:w-[26rem] ${session ? 'md:w-[36rem] md:max-w-none' : ''}`}>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold-500/50 text-gold-400">{(session?.mode ?? focus?.mode) === 'video' ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</span>
            <div className="min-w-0 flex-1">
              <p className="text-eyebrow text-gold-400">{t.dialog} · {(session?.mode ?? focus?.mode) === 'video' ? t.video : t.audio}</p>
              {focus ? (
                <p id="call-title" className="mt-0.5 text-sm">
                  {focus.recipientId === me.id && focus.status === 'ringing'
                    ? <><b data-no-translate>{focus.initiatorName}</b> {t.from}</>
                    : <>{focus.status === 'ringing' ? t.outgoing : ''} <b data-no-translate>{focus.initiatorId === me.id ? focus.recipientName : focus.initiatorName}</b></>}
                </p>
              ) : <p id="call-title" className="mt-0.5 text-sm">{notice || t.ended}</p>}
              {focus && <p className="mt-1 font-mono text-[11px] text-ivory-300" aria-live="polite" data-testid="text-call-status">
                {focus.status === 'ringing' ? <>{focus.initiatorId === me.id ? t.ringingOut : t.incoming} · {t.ringLeft} {clock(new Date(focus.ringExpiresAt).getTime() - now)}</>
                  : focus.status === 'provisioning' ? t.provisioning
                  : focus.status === 'uncertain' ? t.status.uncertain
                  : <>{t.active} · {clock(new Date(focus.expiresAt).getTime() - now)} {t.remaining}</>}
              </p>}
            </div>
            {!session && !focus && <button type="button" aria-label={t.close} className="rounded-full p-1.5 text-ivory-300 hover:text-gold-400" onClick={() => setNotice('')}><X className="h-4 w-4" /></button>}
          </div>
          <div ref={hostRef} className={session ? 'mt-3 h-[52dvh] max-h-[28rem] overflow-hidden rounded-xl bg-ink-900' : 'hidden'} data-testid="frame-direct-call">
            {joining && <p className="flex h-full items-center justify-center gap-2 text-xs text-ivory-300"><Loader2 className="h-4 w-4 animate-spin" />{t.joining}</p>}
          </div>
          {focus && !session && <p className="mt-3 flex gap-2 border-t border-gold-500/20 pt-3 text-[11px] leading-relaxed text-ivory-300"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gold-400" />{t.consent} {t.limits}</p>}
          {error && <p className="mt-2 text-xs text-coral-500" role="alert">{error}</p>}
          {focus && <div className="mt-3 flex flex-wrap gap-2">
            {focus.status === 'ringing' && focus.recipientId === me.id && <>
              <button type="button" disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" onClick={() => decide(focus.id, 'accept')} data-testid="button-call-accept"><PhoneCall className="h-3.5 w-3.5" />{t.accept}</button>
              <button type="button" disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-ivory-200/40 px-4 py-2 text-xs font-semibold hover:border-coral-500" onClick={() => decide(focus.id, 'decline')} data-testid="button-call-decline"><PhoneOff className="h-3.5 w-3.5" />{t.decline}</button>
            </>}
            {focus.status === 'ringing' && focus.initiatorId === me.id && <button type="button" disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-ivory-200/40 px-4 py-2 text-xs font-semibold hover:border-coral-500" onClick={() => decide(focus.id, 'cancel')} data-testid="button-call-cancel"><X className="h-3.5 w-3.5" />{t.cancel}</button>}
            {focus.status === 'active' && !session && <button type="button" disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50" onClick={() => join(focus)} data-testid="button-call-join">{joining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}{notice ? t.rejoin : t.join}</button>}
            {['active', 'provisioning', 'uncertain'].includes(focus.status) && <button type="button" disabled={decideM.isPending} className="inline-flex items-center gap-1.5 rounded-full bg-crimson-700 px-4 py-2 text-xs font-semibold text-ivory-50 hover:bg-crimson-800 disabled:opacity-50" onClick={() => leave(focus)} data-testid="button-call-end"><PhoneOff className="h-3.5 w-3.5" />{t.end}</button>}
            {!session && <button type="button" className="ml-auto text-[11px] text-ivory-300 underline" onClick={() => setDismissed((s) => new Set(s).add(focus.id))} data-testid="button-call-hide">{t.close}</button>}
          </div>}
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Launch controls for an accepted thread header (Messages only). */
export function CallLaunch({ threadId }: { threadId: number }) {
  const ctx = useDirectCalls();
  const { me } = useMe();
  const { t, fr } = useCallCopy();
  if (!ctx) return null;
  const s = ctx.state;
  const live = s?.calls.some((c) => c.threadId === threadId && LIVE.includes(c.status));
  const off = !s || !s.enabled || ctx.inviting || !!live;
  const title = ctx.isError ? t.loadErr : s && !s.enabled ? `${t.disabled}${s.reason ? `: ${s.reason}` : ''}` : undefined;
  const b = s?.budget;
  const usd = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="flex items-center gap-0.5" translate={fr ? 'no' : undefined}>
      <button type="button" disabled={off} title={title ?? t.callAudio} aria-label={t.callAudio} onClick={() => ctx.invite(threadId, 'audio').catch(() => undefined)} className="rounded-full p-2 text-lagoon-700 hover:bg-lagoon-900/10 disabled:opacity-40" data-testid="button-call-audio">{ctx.inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}</button>
      <button type="button" disabled={off} title={title ?? t.callVideo} aria-label={t.callVideo} onClick={() => ctx.invite(threadId, 'video').catch(() => undefined)} className="rounded-full p-2 text-lagoon-700 hover:bg-lagoon-900/10 disabled:opacity-40" data-testid="button-call-video"><Video className="h-4 w-4" /></button>
      {live && <button type="button" title={t.showCall} aria-label={t.showCall} onClick={ctx.reopen} className="rounded-full p-2 text-lagoon-700 hover:bg-lagoon-900/10" data-testid="button-call-show"><PhoneCall className="h-4 w-4" /></button>}
      {(title || ctx.error) && <span className="sr-only" role="status">{ctx.error || title}</span>}
      {me.founder && b && <span className="hidden font-mono text-[10px] text-sand-400 lg:inline" title={t.budget} data-testid="text-call-budget">{usd(b.reservedUsd + b.committedUsd)}/{usd(b.admissionLimitUsd)}{b.paused ? ` · ${t.paused}` : ''}</span>}
    </div>
  );
}

/** Inline notice row under the thread header showing disabled reason / errors / founder budget. */
export function CallNotice() {
  const ctx = useDirectCalls();
  const { me } = useMe();
  const { t, fr } = useCallCopy();
  if (!ctx) return null;
  const s = ctx.state; const b = s?.budget;
  const usd = (n: number) => `$${n.toFixed(2)}`;
  if (!ctx.error && !ctx.isError && (!s || (s.enabled && !s.reason)) && !(me.founder && b)) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-sand-200 bg-ivory-100 px-4 py-2 text-[11px] text-ink-700" translate={fr ? 'no' : undefined} data-testid="status-direct-calls">
      {ctx.isError && <span className="text-crimson-700" role="alert">{t.loadErr} <button type="button" className="font-semibold underline" onClick={ctx.refetch}>{t.retry}</button></span>}
      {s && (!s.enabled || s.reason) && <span>{!s.enabled && t.disabled}{s.reason ? <> {!s.enabled && ': '}<span>{s.reason}</span></> : '.'}</span>}
      {ctx.error && <span className="text-crimson-700" role="alert">{ctx.error} <button type="button" className={`${btnGhost} ml-1 px-2 py-0.5`} onClick={() => ctx.setError('')}>{t.close}</button></span>}
      {me.founder && b && <span className="font-mono text-sand-400">{t.budget} · {b.month}: {usd(b.reservedUsd)} {t.reserved}, {usd(b.committedUsd)} {t.committed}, {usd(b.remainingEstimatedUsd)} {t.left} · {usd(b.admissionLimitUsd)} {t.admission} / {usd(b.limitUsd)}{b.paused && <> · <b className="text-crimson-700">{t.paused}</b></>}</span>}
    </div>
  );
}
