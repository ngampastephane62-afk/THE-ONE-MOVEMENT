import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Ban, Check, ChevronDown, ChevronUp, Clock, Flag, Loader2, RotateCw, Send, X } from 'lucide-react';
import { getNetworkState, type NetworkState } from '@workspace/api-client-react';
import ReportDialog, { type ReportTarget } from '@/components/network/ReportDialog';
import { Avatar, Badges, Empty, ErrorBox, STATE_PREFIX, Skeleton, ago, btn, btnGhost, card, field, useAct } from '@/components/network/kit';
import { useMe } from './ctx';
import { errMsg } from './proHooks';
import Chapter from '@/components/editorial/Chapter';
import AdministrativeServiceInbox from '@/components/network/AdministrativeServiceInbox';
import { CallLaunch, CallNotice } from '@/components/network/DirectCalls';

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const tid = id ? Number(id) : undefined;
  const { me } = useMe();
  const { run, pending } = useAct();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const text = tid ? drafts[tid] ?? '' : '';
  const setDraft = (threadId: number, value: string) => setDrafts((d) => ({ ...d, [threadId]: value }));
  const [err, setErr] = useState('');
  const [report, setReport] = useState<ReportTarget | null>(null);
  const [blocked, setBlocked] = useState<{ threadId: number; memberId: number } | null>(null);
  const blockedHere = blocked?.threadId === tid;
  const poll = () => (typeof document !== 'undefined' && document.visibilityState === 'visible' ? 15000 : false) as number | false;
  // Inbox pages: member-scoped key under STATE_PREFIX so existing mutation invalidation refetches every loaded page.
  const inbox = useInfiniteQuery({
    queryKey: [...STATE_PREFIX, 'messages-inbox', me.id] as const,
    queryFn: ({ pageParam, signal }) => getNetworkState(pageParam ? { threadBefore: pageParam } : undefined, { signal }),
    initialPageParam: 0 as number,
    getNextPageParam: (last: NetworkState) => last.nextThreadCursor ?? undefined,
    refetchInterval: poll,
  });
  // Selected conversation: distinct per member and per thread, so no other chat's messages can render during navigation.
  const conv = useInfiniteQuery({
    queryKey: [...STATE_PREFIX, 'messages-thread', me.id, tid ?? 0] as const,
    queryFn: ({ pageParam, signal }) => getNetworkState({ thread: tid as number, ...(pageParam ? { messageBefore: pageParam } : {}) }, { signal }),
    initialPageParam: 0 as number,
    getNextPageParam: (last: NetworkState) => last.nextMessageCursor ?? undefined,
    enabled: !!tid && !blockedHere,
    refetchInterval: poll,
  });
  const q = inbox;
  const threads = useMemo(() => {
    const seen = new Set<number>(); const out: NetworkState['threads'] = [];
    for (const pg of inbox.data?.pages ?? []) for (const x of pg.threads) if (!seen.has(x.id)) { seen.add(x.id); out.push(x); }
    return out;
  }, [inbox.data]);
  const t = blockedHere || !tid ? undefined : conv.data?.pages[0]?.threads.find((x) => x.id === tid) ?? threads.find((x) => x.id === tid);
  const msgs = useMemo(() => {
    if (blockedHere || !tid) return [];
    const seen = new Set<number>(); const out: NetworkState['messages'] = [];
    for (const pg of [...(conv.data?.pages ?? [])].reverse()) for (const m of pg.messages) if (!seen.has(m.id)) { seen.add(m.id); out.push(m); }
    return out.sort((a, b) => (a.createdAt === b.createdAt ? a.id - b.id : a.createdAt < b.createdAt ? -1 : 1));
  }, [conv.data, blockedHere, tid]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ height: number; top: number } | null>(null);
  const lastSeen = useRef<string>('');
  const lastOpenThread = useRef<number | undefined>(undefined);
  const wasNearBottom = useRef(true);
  const readFor = useRef<string>('');

  useEffect(() => { setErr(''); }, [tid]);
  useLayoutEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (anchor.current) { el.scrollTop = anchor.current.top + (el.scrollHeight - anchor.current.height); anchor.current = null; }
    const latest = msgs[msgs.length - 1];
    const key = `${tid}:${latest?.id ?? 0}`;
    if (lastSeen.current !== key) {
      if (lastOpenThread.current !== tid || wasNearBottom.current || latest?.senderId === me.id) el.scrollTop = el.scrollHeight;
      lastSeen.current = key;
      lastOpenThread.current = tid;
    }
  }, [msgs, tid]);
  const loadOlder = () => {
    const el = scrollRef.current;
    if (el) anchor.current = { height: el.scrollHeight, top: el.scrollTop };
    conv.fetchNextPage().catch(() => { anchor.current = null; });
  };
  useEffect(() => {
    if (!t || (t.requestedByMe && !t.accepted) || t.unread === 0) return;
    const key = `${t.id}:${msgs.at(-1)?.id ?? 0}`;
    if (readFor.current === key) return;
    readFor.current = key;
    run({ action: 'message.read', id: t.id }).catch(() => { readFor.current = ''; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t?.id, t?.unread, t?.accepted, msgs.length]);

  const incoming = threads.filter((x) => !x.accepted && !x.requestedByMe && !x.declined);
  const rest = threads.filter((x) => !incoming.includes(x));
  const doAct = (p: Promise<unknown>, ok?: () => void) => { setErr(''); p.then(() => ok?.()).catch((error) => setErr(errMsg(error, 'The action failed. Your text is kept — try again.'))); };

  const Row = ({ x }: { x: (typeof threads)[number] }) => (
    <Link href={`/member/messages/${x.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${x.id === tid ? 'bg-lagoon-900/10' : 'hover:bg-ivory-200'}`} data-testid={`thread-${x.id}`}>
      <Avatar m={x.other} size={42} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2"><span data-no-translate className={`truncate text-sm ${x.unread ? 'font-bold text-ink-900' : 'font-semibold text-ink-800'}`}>{x.other.fullName}</span><span className="shrink-0 text-[11px] text-sand-400">{ago(x.updatedAt)}</span></span>
        <span className="flex items-center gap-2">
          <span className="truncate text-xs text-sand-400">{x.declined ? (x.requestedByMe ? 'Request declined' : 'You declined — can still accept') : x.lastMessage ? <span data-no-translate>{x.lastMessage}</span> : (!x.accepted ? (x.requestedByMe ? 'First message sent' : 'New message request') : 'Conversation open')}</span>
          {x.unread > 0 && <span className="ml-auto rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-ink-900">{x.unread}</span>}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="flex gap-4 md:h-[calc(100dvh-7rem)]">
      <aside className={`${tid ? 'hidden md:flex' : 'flex'} w-full flex-col gap-2 overflow-y-auto px-2 pt-4 md:w-80 md:shrink-0 md:px-0 md:pt-0`}>
        <Chapter index="03" eyebrow="CONNECT" title="Messages" className="mx-2" />
        <AdministrativeServiceInbox />
        <p className="px-2 text-xs text-ink-700" data-testid="text-free-messaging">Ordinary messaging is free across all 17 sectors, without daily contact quotas or a pending-request limit. Send a first message immediately. The recipient can reply to open the conversation, accept, decline, block or report. Short-term security protections still apply. TOMI-organized professional introductions remain a separate service.</p>
        {q.isLoading ? <Skeleton rows={3} /> : q.isError && !q.data ? <ErrorBox onRetry={() => q.refetch()} /> : threads.length === 0 ? (
          <Empty title="No conversations yet" body="Visit a member profile and send a first message. They can reply, accept or decline."><Link href="/member/people" className={btnGhost}>Find people</Link></Empty>
        ) : (<>
          {incoming.length > 0 && <><p className="mt-2 px-2 text-eyebrow text-coral-600">REQUESTS · {incoming.length}</p>{incoming.map((x) => <Row key={x.id} x={x} />)}</>}
          {rest.length > 0 && <><p className="mt-2 px-2 text-eyebrow text-gold-700">INBOX</p>{rest.map((x) => <Row key={x.id} x={x} />)}</>}
          {inbox.hasNextPage && <button type="button" className={`${btnGhost} mx-2 my-2`} disabled={inbox.isFetchingNextPage} aria-busy={inbox.isFetchingNextPage} onClick={() => inbox.fetchNextPage()} data-testid="button-load-more-threads">{inbox.isFetchingNextPage ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading conversations…</> : <><ChevronDown className="h-3.5 w-3.5" />Load more conversations</>}</button>}
          {inbox.isFetchNextPageError && <p className="px-2 text-xs text-crimson-700" role="alert">More conversations could not be loaded. <button type="button" className="font-semibold underline" onClick={() => inbox.fetchNextPage()}>Try again</button></p>}
        </>)}
      </aside>

      <section className={`${tid ? 'flex' : 'hidden md:flex'} ${card} min-h-[calc(100dvh-8.5rem)] flex-1 flex-col overflow-hidden rounded-none md:min-h-0 md:rounded-2xl`}>
        {!tid ? <div className="tomi-weave flex flex-1 items-center justify-center p-6"><div className="max-w-xs text-center"><p className="font-display text-lg tracking-[0.06em] text-ink-900">Every conversation begins with consent.</p><div className="mx-auto my-3 h-px w-12 bg-gold-500" aria-hidden="true" /><p className="text-sm text-sand-400">Select a conversation.</p></div></div>
          : blockedHere && blocked ? <div className="m-auto flex flex-col items-start gap-3 p-6" data-testid="status-thread-blocked">
            <p className="text-sm text-ink-800">Member blocked. Communication remains disabled. You can still report this member without unblocking them.</p>
            <button type="button" className={btnGhost} onClick={() => setReport({ memberId: blocked.memberId })} data-testid="button-report-blocked-member"><Flag className="h-4 w-4" />Report member</button>
            <Link href="/member/messages" className={btnGhost}>Back to inbox</Link>
          </div>
          : conv.isLoading ? <div className="p-4"><Skeleton rows={2} /></div>
          : conv.isError && !conv.data ? <div className="m-auto p-6"><ErrorBox onRetry={() => conv.refetch()} /></div>
          : !t ? <div className="m-auto p-6"><Empty title="Conversation not found" body="It may have been declined or the member blocked contact."><Link href="/member/messages" className={btnGhost}>Back to inbox</Link></Empty></div>
          : (<>
            <header className="flex items-center gap-3 border-b border-sand-200 px-3 py-3">
              <Link href="/member/messages" className="rounded-full p-1.5 md:hidden" aria-label="Back to inbox"><ArrowLeft className="h-5 w-5" /></Link>
              <Link href={`/member/profile/${t.other.id}`} className="flex min-w-0 flex-1 items-center gap-2"><Avatar m={t.other} size={36} /><span className="min-w-0"><span data-no-translate className="block truncate text-sm font-semibold text-ink-900">{t.other.fullName}</span><Badges m={t.other} compact /></span></Link>
              <button onClick={() => setReport({ memberId: t.other.id })} className="rounded-full p-2 text-sand-400 hover:text-crimson-700" aria-label="Report member" data-testid="button-report-thread"><Flag className="h-4 w-4" /></button>
              <button type="button" disabled={pending} onClick={() => {
                if (confirm(`Block ${t.other.fullName}? Communication will stop. You can still report this member.`)) {
                  const target = { threadId: t.id, memberId: t.other.id };
                  doAct(run({ action: 'block', targetId: target.memberId, accepted: true }), () => { setBlocked(target); setDraft(target.threadId, ''); });
                }
              }} className="rounded-full p-2 text-sand-400 hover:text-crimson-700 disabled:opacity-50" aria-label="Block member" data-testid="button-block-thread"><Ban className="h-4 w-4" /></button>
            </header>
            {t.accepted && !t.declined && <CallNotice />}
            <div ref={scrollRef} onScroll={(e) => {
              const el = e.currentTarget;
              wasNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
            }} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-ivory-100/60 p-4" aria-live="polite">
              {conv.hasNextPage ? <button type="button" className={`${btnGhost} self-center bg-ivory-50`} disabled={conv.isFetchingNextPage} aria-busy={conv.isFetchingNextPage} onClick={loadOlder} data-testid="button-load-older-messages">{conv.isFetchingNextPage ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading older messages…</> : <><ChevronUp className="h-3.5 w-3.5" />Load older messages</>}</button>
                : msgs.length > 0 && <p className="self-center text-[10px] uppercase tracking-[0.18em] text-sand-400" data-testid="text-conversation-start">Beginning of conversation</p>}
              {conv.isFetchNextPageError && <p className="self-center text-xs text-crimson-700" role="alert">Older messages could not be loaded. <button type="button" className="inline-flex items-center gap-1 font-semibold underline" onClick={loadOlder}><RotateCw className="h-3 w-3" />Try again</button></p>}
              {msgs.length === 0 && <p className="m-auto text-xs text-sand-400">No messages yet.</p>}
              {msgs.map((m) => {
                const own = m.senderId === me.id;
                return (
                  <div key={m.id} className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm ${own ? 'self-end rounded-br-md bg-lagoon-900 text-ivory-50' : 'self-start rounded-bl-md bg-ivory-50 text-ink-900 shadow-sm'}`} data-testid={`message-${m.id}`}>
                    <p className="whitespace-pre-wrap break-words" data-no-translate translate="no">{m.text}</p>
                    <p className={`mt-0.5 text-right text-[10px] ${own ? 'text-ivory-300' : 'text-sand-400'}`}>{ago(m.createdAt)}{own && (m.read ? ' · Read' : ' · Sent')}</p>
                  </div>
                );
              })}
            </div>
            {err && <p className="px-4 pt-2 text-xs text-crimson-700" role="alert">{err}</p>}
            {!t.accepted && t.declined && t.requestedByMe ? (
              <div className="border-t border-sand-200 p-4 text-sm text-ink-700" data-testid="status-declined">{t.other.fullName.split(' ')[0]} declined this request. Messaging is closed; please respect their choice.</div>
            ) : !t.accepted && t.requestedByMe ? (
              <div className="flex items-center gap-2 border-t border-sand-200 p-4 text-sm text-ink-700" data-testid="status-pending"><Clock className="h-4 w-4 text-gold-600" /><span>First message sent. You can continue when <span data-no-translate>{t.other.fullName.split(' ')[0]}</span> replies or accepts.</span></div>
            ) : !t.accepted ? (
              <div className="flex flex-col gap-3 border-t border-sand-200 p-4">
                <p className="text-sm text-ink-800" data-testid={t.declined ? 'status-declined' : undefined}>{t.declined ? <>You declined <b data-no-translate>{t.other.fullName}</b>'s request. You can still accept it if you change your mind.</> : <><b data-no-translate>{t.other.fullName}</b> sent you a first message. Reply below to accept automatically, or choose an action.</>}</p>
                <div className="flex gap-2">
                  <button className={btn} disabled={pending} onClick={() => doAct(run({ action: 'thread.accept', id: t.id }))} data-testid="button-accept-thread"><Check className="h-4 w-4" />Accept</button>
                  {!t.declined && <button className={btnGhost} disabled={pending} onClick={() => doAct(run({ action: 'thread.decline', id: t.id }))} data-testid="button-decline-thread"><X className="h-4 w-4" />Decline</button>}
                </div>
              </div>
            ) : null}
            {!t.declined && (t.accepted || !t.requestedByMe) && (
              <form className="flex items-end gap-2 border-t border-sand-200 p-3" onSubmit={(e) => {
                e.preventDefault();
                const threadId = t.id; const sent = (drafts[threadId] ?? '').trim();
                if (!sent || pending) return;
                doAct(run({ action: 'message.send', id: threadId, text: sent }), () => setDrafts((d) => ((d[threadId] ?? '').trim() === sent ? { ...d, [threadId]: '' } : d)));
              }}>
                <label htmlFor="msg" className="sr-only">Message</label>
                <textarea id="msg" key={t.id} rows={1} className={`${field} max-h-32 min-h-[42px] resize-none rounded-2xl`} value={text} maxLength={3000} onChange={(e) => setDraft(t.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder={t.accepted ? 'Write a message' : 'Reply and accept the conversation'} data-testid="input-message" />
                <button className={`${btn} h-[42px] w-[42px] shrink-0 px-0`} disabled={pending || !text.trim()} aria-label="Send" data-testid="button-send-message">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
              </form>
            )}
          </>)}
      </section>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
