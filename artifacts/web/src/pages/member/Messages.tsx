import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Ban, Check, Clock, Flag, Loader2, Send, X } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey } from '@workspace/api-client-react';
import ReportDialog, { type ReportTarget } from '@/components/network/ReportDialog';
import { Avatar, Badges, Empty, ErrorBox, Skeleton, ago, btn, btnGhost, card, field, useAct } from '@/components/network/kit';
import { useMe } from './ctx';
import { errMsg } from './proHooks';

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const tid = id ? Number(id) : undefined;
  const { me } = useMe();
  const { run, pending } = useAct();
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [report, setReport] = useState<ReportTarget | null>(null);
  const [blocked, setBlocked] = useState<{ threadId: number; memberId: number } | null>(null);
  const blockedHere = blocked?.threadId === tid;
  const params = tid ? { thread: tid } : {};
  const q = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params), enabled: !blockedHere, refetchInterval: 15000 } });
  const threads = q.data?.threads ?? [];
  const t = blockedHere ? undefined : threads.find((x) => x.id === tid);
  const msgs = blockedHere ? [] : q.data?.messages ?? [];
  const endRef = useRef<HTMLDivElement>(null);
  const readFor = useRef<string>('');

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, tid]);
  useEffect(() => {
    if (!t || !t.accepted || t.unread === 0) return;
    const key = `${t.id}:${msgs.length}`;
    if (readFor.current === key) return;
    readFor.current = key;
    run({ action: 'message.read', id: t.id }).catch(() => { readFor.current = ''; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t?.id, t?.unread, t?.accepted, msgs.length]);

  const incoming = threads.filter((x) => !x.accepted && !x.requestedByMe && !x.declined);
  const rest = threads.filter((x) => !incoming.includes(x));
  const doAct = (p: Promise<unknown>, ok?: () => void) => { setErr(''); p.then(() => ok?.()).catch((error) => setErr(errMsg(error, 'The action failed. Your text is kept — try again.'))); };

  const Row = ({ x }: { x: (typeof threads)[number] }) => (
    <Link href={`/member/messages/${x.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${x.id === tid ? 'bg-lagoon-900/10' : 'hover:bg-ivory-200'}`} data-testid={`thread-${x.id}`}>
      <Avatar m={x.other} size={42} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2"><span className={`truncate text-sm ${x.unread ? 'font-bold text-ink-900' : 'font-semibold text-ink-800'}`}>{x.other.fullName}</span><span className="shrink-0 text-[11px] text-sand-400">{ago(x.updatedAt)}</span></span>
        <span className="flex items-center gap-2">
          <span className="truncate text-xs text-sand-400">{x.declined ? (x.requestedByMe ? 'Request declined' : 'You declined — can still accept') : !x.accepted ? (x.requestedByMe ? 'Waiting for acceptance' : 'Wants to connect') : x.lastMessage || 'Conversation open'}</span>
          {x.unread > 0 && <span className="ml-auto rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-ink-900">{x.unread}</span>}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="flex gap-4 md:h-[calc(100dvh-7rem)]">
      <aside className={`${tid ? 'hidden md:flex' : 'flex'} w-full flex-col gap-2 overflow-y-auto px-2 pt-4 md:w-80 md:shrink-0 md:px-0 md:pt-0`}>
        <h1 className="px-2 font-display text-2xl text-ink-900">Messages</h1>
        <p className="px-2 text-xs text-ink-700" data-testid="text-free-messaging">Ordinary conversations are free and private between participants. First contacts require acceptance, with up to 5 new requests per rolling 24 hours and 10 pending outgoing requests to prevent spam. Accepted conversations have no daily message quota. Short-term security limits still apply. TOMI-organized professional introductions remain a separate service.</p>
        {q.isLoading ? <Skeleton rows={3} /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} /> : threads.length === 0 ? (
          <Empty title="No conversations yet" body="Visit a member profile and send a request to message. They choose whether to accept."><Link href="/member/people" className={btnGhost}>Find people</Link></Empty>
        ) : (<>
          {incoming.length > 0 && <><p className="mt-2 px-2 text-eyebrow text-coral-600">REQUESTS · {incoming.length}</p>{incoming.map((x) => <Row key={x.id} x={x} />)}</>}
          {rest.length > 0 && <><p className="mt-2 px-2 text-eyebrow text-gold-700">INBOX</p>{rest.map((x) => <Row key={x.id} x={x} />)}</>}
        </>)}
      </aside>

      <section className={`${tid ? 'flex' : 'hidden md:flex'} ${card} min-h-[calc(100dvh-8.5rem)] flex-1 flex-col overflow-hidden rounded-none md:min-h-0 md:rounded-2xl`}>
        {!tid ? <div className="m-auto max-w-xs p-6 text-center text-sm text-sand-400">Select a conversation.</div>
          : blockedHere && blocked ? <div className="m-auto flex flex-col items-start gap-3 p-6" data-testid="status-thread-blocked">
            <p className="text-sm text-ink-800">Member blocked. Communication remains disabled. You can still report this member without unblocking them.</p>
            <button type="button" className={btnGhost} onClick={() => setReport({ memberId: blocked.memberId })} data-testid="button-report-blocked-member"><Flag className="h-4 w-4" />Report member</button>
            <Link href="/member/messages" className={btnGhost}>Back to inbox</Link>
          </div>
          : q.isLoading ? <div className="p-4"><Skeleton rows={2} /></div>
          : !t ? <div className="m-auto p-6"><Empty title="Conversation not found" body="It may have been declined or the member blocked contact."><Link href="/member/messages" className={btnGhost}>Back to inbox</Link></Empty></div>
          : (<>
            <header className="flex items-center gap-3 border-b border-sand-200 px-3 py-3">
              <Link href="/member/messages" className="rounded-full p-1.5 md:hidden" aria-label="Back to inbox"><ArrowLeft className="h-5 w-5" /></Link>
              <Link href={`/member/profile/${t.other.id}`} className="flex min-w-0 flex-1 items-center gap-2"><Avatar m={t.other} size={36} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink-900">{t.other.fullName}</span><Badges m={t.other} compact /></span></Link>
              <button onClick={() => setReport({ memberId: t.other.id })} className="rounded-full p-2 text-sand-400 hover:text-crimson-700" aria-label="Report member" data-testid="button-report-thread"><Flag className="h-4 w-4" /></button>
              <button type="button" disabled={pending} onClick={() => {
                if (confirm(`Block ${t.other.fullName}? Communication will stop. You can still report this member.`)) {
                  const target = { threadId: t.id, memberId: t.other.id };
                  doAct(run({ action: 'block', targetId: target.memberId, accepted: true }), () => { setBlocked(target); setText(''); });
                }
              }} className="rounded-full p-2 text-sand-400 hover:text-crimson-700 disabled:opacity-50" aria-label="Block member" data-testid="button-block-thread"><Ban className="h-4 w-4" /></button>
            </header>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-ivory-100/60 p-4" aria-live="polite">
              {msgs.length === 0 && <p className="m-auto text-xs text-sand-400">No messages yet.</p>}
              {msgs.map((m) => {
                const own = m.senderId === me.id;
                return (
                  <div key={m.id} className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm ${own ? 'self-end rounded-br-md bg-lagoon-900 text-ivory-50' : 'self-start rounded-bl-md bg-ivory-50 text-ink-900 shadow-sm'}`} data-testid={`message-${m.id}`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`mt-0.5 text-right text-[10px] ${own ? 'text-ivory-300' : 'text-sand-400'}`}>{ago(m.createdAt)}{own && (m.read ? ' · Read' : ' · Sent')}</p>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            {err && <p className="px-4 pt-2 text-xs text-crimson-700" role="alert">{err}</p>}
            {!t.accepted && t.declined && t.requestedByMe ? (
              <div className="border-t border-sand-200 p-4 text-sm text-ink-700" data-testid="status-declined">{t.other.fullName.split(' ')[0]} declined this request. Messaging is closed; please respect their choice.</div>
            ) : !t.accepted && t.requestedByMe ? (
              <div className="flex items-center gap-2 border-t border-sand-200 p-4 text-sm text-ink-700" data-testid="status-pending"><Clock className="h-4 w-4 text-gold-600" />Request sent. You can write again once {t.other.fullName.split(' ')[0]} accepts.</div>
            ) : !t.accepted ? (
              <div className="flex flex-col gap-3 border-t border-sand-200 p-4">
                <p className="text-sm text-ink-800" data-testid={t.declined ? 'status-declined' : undefined}>{t.declined ? <>You declined <b>{t.other.fullName}</b>'s request. You can still accept it if you change your mind.</> : <><b>{t.other.fullName}</b> would like to start a conversation.</>} {!t.declined && ' Accepting lets you both exchange messages.'}</p>
                <div className="flex gap-2">
                  <button className={btn} disabled={pending} onClick={() => doAct(run({ action: 'thread.accept', id: t.id }))} data-testid="button-accept-thread"><Check className="h-4 w-4" />Accept</button>
                  {!t.declined && <button className={btnGhost} disabled={pending} onClick={() => doAct(run({ action: 'thread.decline', id: t.id }))} data-testid="button-decline-thread"><X className="h-4 w-4" />Decline</button>}
                </div>
              </div>
            ) : (
              <form className="flex items-end gap-2 border-t border-sand-200 p-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) doAct(run({ action: 'message.send', id: t.id, text: text.trim() }), () => setText('')); }}>
                <label htmlFor="msg" className="sr-only">Message</label>
                <textarea id="msg" rows={1} className={`${field} max-h-32 min-h-[42px] resize-none rounded-2xl`} value={text} maxLength={3000} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Write a message" data-testid="input-message" />
                <button className={`${btn} h-[42px] w-[42px] shrink-0 px-0`} disabled={pending || !text.trim()} aria-label="Send" data-testid="button-send-message">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
              </form>
            )}
          </>)}
      </section>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
