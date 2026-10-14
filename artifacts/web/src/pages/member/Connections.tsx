import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey, type GetNetworkStateConnections } from '@workspace/api-client-react';
import { Empty, ErrorBox, PersonLine, Skeleton, btn, btnGhost, card, errStatus, useAct } from '@/components/network/kit';
import { useMe } from './ctx';

const CAP = 200;

export default function Connections() {
  const { id, conn } = useParams<{ id: string; conn: string }>();
  const pid = Number(id);
  const kind: GetNetworkStateConnections = conn === 'following' ? 'following' : 'followers';
  const { me } = useMe();
  const { run, pending } = useAct();
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const params = { person: pid, connections: kind };
  const q = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params), enabled: Number.isFinite(pid), refetchInterval: 30000 } });

  const tab = (k: GetNetworkStateConnections, n?: number) => (
    <Link href={`/member/profile/${pid}/${k}`} className={`flex-1 border-b-2 py-3 text-center text-sm ${kind === k ? 'border-lagoon-900 font-semibold text-ink-900' : 'border-transparent text-sand-400 hover:text-ink-800'}`} data-testid={`tab-${k}`}>
      {n != null && <b className="mr-1">{n}</b>}{k === 'followers' ? 'Followers' : 'Following'}
    </Link>
  );

  const p = q.data?.person;
  const list = (q.data?.members ?? []).filter((m) => m.id !== p?.id);
  const toggle = (mid: number, followed: boolean) => {
    setErr(''); setBusy(mid);
    run({ action: 'follow', targetId: mid, accepted: !followed }).catch(() => setErr('That action failed. Try again.')).finally(() => setBusy(null));
  };

  return (
    <div className="flex flex-col gap-3">
      <section className={`${card} rounded-none border-x-0 sm:rounded-2xl sm:border-x`}>
        <div className="flex items-center gap-3 px-4 pt-4">
          <Link href={`/member/profile/${pid}`} className="rounded-full p-1.5 text-ink-800 hover:bg-ivory-200" aria-label="Back to profile" data-testid="link-back-profile"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="min-w-0 truncate font-display text-lg text-ink-900" data-testid="text-connections-name">{p?.fullName ?? 'Connections'}</h1>
        </div>
        <div className="mt-2 flex">{tab('followers', p?.followers)}{tab('following', p?.following)}</div>
      </section>

      <div className="px-3 md:px-0">
        {q.isLoading ? <Skeleton rows={4} />
          : q.isError ? (errStatus(q.error) === 403
            ? <Empty title="Not available" body="This list is not visible to you." />
            : <ErrorBox onRetry={() => q.refetch()} msg="This list could not be loaded." />)
          : !p ? <Empty title="Profile unavailable" body="This member may have left the network, set their profile private, been suspended, or blocked contact."><Link href="/member/people" className={btnGhost}>Back to people</Link></Empty>
          : p.blocked ? <Empty title="You blocked this member" body="Unblock them from their profile to see their connections." />
          : list.length === 0 ? <Empty title={kind === 'followers' ? 'No followers yet' : 'Not following anyone yet'} body={kind === 'followers' ? `Nobody follows ${p.id === me.id ? 'you' : p.fullName} yet.` : `${p.id === me.id ? 'You do' : `${p.fullName} does`} not follow anyone yet.`}><Link href="/member/people" className={btnGhost}>Discover people</Link></Empty>
          : (
            <ul className={`${card} divide-y divide-sand-100`} data-testid="list-connections">
              {list.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 p-3" data-testid={`row-connection-${m.id}`}>
                  <PersonLine m={m} />
                  {m.id !== me.id && !m.blocked && (
                    <button className={m.followed ? btnGhost : btn} disabled={pending && busy === m.id} onClick={() => toggle(m.id, m.followed)} data-testid={`button-follow-${m.id}`}>{m.followed ? 'Following' : 'Follow'}</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        {err && <p className="mt-2 text-xs text-crimson-700" role="alert">{err}</p>}
        {list.length >= CAP && <p className="mt-3 text-xs text-sand-400" data-testid="text-connections-cap">Showing the first {CAP} people. The full list is longer than the network can display at once.</p>}
      </div>
    </div>
  );
}
