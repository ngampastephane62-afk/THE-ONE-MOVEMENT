import { useEffect, useRef, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { Search } from 'lucide-react';
import { useGetNetworkState, getGetNetworkStateQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { Empty, ErrorBox, PersonLine, Skeleton, field, useAct } from '@/components/network/kit';
import Chapter from '@/components/editorial/Chapter';
import { useMe } from './ctx';
import MemberIdentityStrip from '@/components/network/MemberIdentityStrip';

export default function People() {
  const { me } = useMe();
  const { run, pending } = useAct();
  const search = useSearch();
  const initialQ = (new URLSearchParams(search).get('q') ?? '').trim().slice(0, 100);
  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  useEffect(() => { setInput(initialQ); setQ(initialQ); }, [initialQ]);
  const [sector, setSector] = useState('');
  const [onlyFollowing, setOnlyFollowing] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setQ(input.trim()), 350); return () => window.clearTimeout(t.current); }, [input]);
  const params = { ...(q ? { q } : {}), ...(sector ? { sector } : {}) };
  const s = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params) } });
  const list = (s.data?.members ?? []).filter((m) => m.id !== me.id && (!onlyFollowing || m.followed));

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <MemberIdentityStrip label="People" />
      <Chapter index="02" eyebrow="DISCOVER" title="People" lede="Verified members who joined the network. Search by name, role, organization or country." />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400" />
        <label htmlFor="people-q" className="sr-only">Search members</label>
        <input id="people-q" className={`${field} rounded-full pl-9`} placeholder="Search designers, NGOs, investors…" value={input} maxLength={100} onChange={(e) => setInput(e.target.value)} data-testid="input-search-people" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setOnlyFollowing((v) => !v)} aria-pressed={onlyFollowing} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${onlyFollowing ? 'border-gold-500 bg-gold-500 font-semibold text-ink-900' : 'border-sand-300 text-ink-700'}`} data-testid="filter-following">Following ({me.following})</button>
        <button onClick={() => setSector('')} aria-pressed={!sector} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${!sector ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700'}`}>All sectors</button>
        {SECTORS.map((x) => <button key={x.slug} onClick={() => setSector(x.slug)} aria-pressed={sector === x.slug} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${sector === x.slug ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700'}`} data-testid={`filter-sector-${x.slug}`}>{x.name}</button>)}
      </div>
      {s.isLoading ? <Skeleton /> : s.isError ? <ErrorBox onRetry={() => s.refetch()} /> : list.length === 0 ? (
        <Empty title={q || sector || onlyFollowing ? 'No match' : 'The network is just opening'} body={q || sector || onlyFollowing ? 'Try another name, sector or clear your filters.' : 'As verified members join, they will appear here. Invite a peer whose work deserves to be seen.'} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((m) => (
            <li key={m.id} className="tomi-member-card relative flex flex-col gap-3 rounded-2xl p-5 before:absolute before:left-5 before:top-0 before:h-0.5 before:w-10 before:bg-gold-500" data-testid={`card-member-${m.id}`}>
              <PersonLine m={m} />
              {m.bio && <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-800" data-testid={`text-member-bio-${m.id}`}>{m.bio}</p>}
              {m.offering && <p className="line-clamp-2 text-sm text-ink-700"><span className="font-semibold text-ink-900">Offers: </span>{m.offering}</p>}
              {m.lookingFor && <p className="line-clamp-2 text-sm text-ink-700"><span className="font-semibold text-ink-900">Looking for: </span>{m.lookingFor}</p>}
              <div className="mt-auto flex items-center justify-between gap-2 text-xs text-sand-400">
                <span>{m.followers} followers</span>
                <div className="flex gap-2">
                  <Link href={`/member/profile/${m.id}`} className="rounded-full px-3 py-1.5 font-semibold text-ink-700 hover:bg-ivory-200">View & connect</Link>
                  {!m.blocked && <button disabled={pending} onClick={() => run({ action: 'follow', targetId: m.id, accepted: !m.followed }).catch(() => undefined)} className={`rounded-full px-3 py-1.5 font-semibold ${m.followed ? 'border border-sand-300 text-ink-700' : 'bg-lagoon-900 text-ivory-50'}`} data-testid={`button-follow-${m.id}`}>{m.followed ? 'Following' : 'Follow'}</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
