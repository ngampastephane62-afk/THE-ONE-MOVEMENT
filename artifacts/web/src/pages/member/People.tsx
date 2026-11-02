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
  const { me, base } = useMe();
  const { run, pending } = useAct();
  const search = useSearch();
  const initialQ = (new URLSearchParams(search).get('q') ?? '').trim().slice(0, 100);
  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  useEffect(() => { setInput(initialQ); setQ(initialQ); }, [initialQ]);
  const [sector, setSector] = useState('');
  const [onlyFollowing, setOnlyFollowing] = useState(false);
  const [country, setCountry] = useState('');
  const [profession, setProfession] = useState('');
  const [recentOnly, setRecentOnly] = useState(false);
  const [suggestedOnly, setSuggestedOnly] = useState(false);
  const [category, setCategory] = useState('');
  const [actionError, setActionError] = useState('');
  const [newMemberUpdates, setNewMemberUpdates] = useState('none');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tomi-new-member-updates-${me.id}`);
      setNewMemberUpdates(saved && ['sectors', 'suggested', 'all'].includes(saved) ? saved : 'none');
    } catch { setNewMemberUpdates('none'); }
  }, [me.id]);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setQ(input.trim()), 350); return () => window.clearTimeout(t.current); }, [input]);
  const params = { ...(q ? { q } : {}), ...(sector ? { sector } : {}) };
  const s = useGetNetworkState(params, { query: { queryKey: getGetNetworkStateQueryKey(params), refetchOnMount: 'always', refetchInterval: 60_000 } });
  const members = (s.data?.members ?? []).filter((m) => m.enabled && !m.suspended && !m.blocked);
  const countries = [...new Set(members.map((m) => m.country?.trim()).filter((x): x is string => !!x))].sort();
  const professions = [...new Set(members.map((m) => m.profession?.trim()).filter((x): x is string => !!x))].sort();
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sharedInterest = (m: (typeof members)[number]) => m.sectors.some((slug) => base.myActiveSectors.some((mine) => mine === slug));
  const recentMembers = members.filter((m) => m.id !== me.id && Date.parse(m.joinedAt) >= recentCutoff)
    .filter((m) => newMemberUpdates === 'all' || (newMemberUpdates === 'sectors' && sharedInterest(m)) || (newMemberUpdates === 'suggested' && sharedInterest(m) && !m.followed))
    .slice(0, 5);
  const list = members
    .filter((m) => m.id !== me.id && (!onlyFollowing || m.followed))
    .filter((m) => !country || m.country === country)
    .filter((m) => !profession || m.profession === profession)
    .filter((m) => !recentOnly || Date.parse(m.joinedAt) >= recentCutoff)
    .filter((m) => !suggestedOnly || (!m.followed && sharedInterest(m)))
    .filter((m) => !category || (category === 'organization' ? !!m.organization : !!m.profession))
    .sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt));

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <MemberIdentityStrip label="People" />
      <Chapter index="02" eyebrow="DISCOVER" title="People" lede="Discover members who chose to appear in People. Follow across all sectors; completing your profile or choosing a sector is not required to browse." />
      <nav className="flex flex-wrap gap-2 text-xs" aria-label="People discovery">
        <button className="rounded-full border border-sand-300 px-3 py-2" onClick={() => { setOnlyFollowing(false); setRecentOnly(false); setSuggestedOnly(false); setSector(''); setCountry(''); setProfession(''); setCategory(''); setInput(''); }}>All members</button>
        <Link className="rounded-full border border-sand-300 px-3 py-2" href={`/member/profile/${me.id}/followers`}>Followers ({me.followers})</Link>
        <button aria-pressed={recentOnly} className="rounded-full border border-sand-300 px-3 py-2" onClick={() => { setRecentOnly(!recentOnly); setSuggestedOnly(false); setOnlyFollowing(false); }}>New to the Movement</button>
        <button aria-pressed={suggestedOnly} className="rounded-full border border-sand-300 px-3 py-2" onClick={() => { setSuggestedOnly(!suggestedOnly); setRecentOnly(false); setOnlyFollowing(false); }}>Suggested connections</button>
      </nav>
      {suggestedOnly && <p className="text-xs text-ink-700">Suggestions use shared public sectors, not your private contacts or inferred relationships.</p>}
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
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs font-semibold text-ink-700">Country
          <select className={`${field} mt-1`} value={country} onChange={(e) => setCountry(e.target.value)} data-testid="filter-country">
            <option value="">All countries</option>{countries.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-700">Profession / category
          <select className={`${field} mt-1`} value={profession} onChange={(e) => setProfession(e.target.value)} data-testid="filter-profession">
            <option value="">All professions</option>{professions.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="flex items-end gap-2 rounded-xl border border-sand-200 bg-ivory-50 px-3 py-2 text-xs text-ink-700">
          <input type="checkbox" checked={recentOnly} onChange={(e) => setRecentOnly(e.target.checked)} data-testid="filter-recent" />
          Joined in the last 30 days
        </label>
      </div>
      <label className="text-xs font-semibold text-ink-700">Member category
        <select className={`${field} mt-1`} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All members</option><option value="organization">Organization shared</option><option value="professional">Profession shared</option>
        </select>
      </label>
      <section className="rounded-2xl border border-sand-200 bg-ivory-50 p-3" aria-label="New member updates">
        <label className="text-sm font-semibold text-ink-800">
          Quiet new-member updates
          <select className={`${field} mt-2`} value={newMemberUpdates} onChange={(e) => {
            const mode = e.target.value;
            setNewMemberUpdates(mode);
            try { localStorage.setItem(`tomi-new-member-updates-${me.id}`, mode); } catch { /* usable for this visit without storage */ }
          }} data-testid="toggle-new-member-updates">
            <option value="none">No new-member updates</option>
            <option value="sectors">People in my sectors</option>
            <option value="suggested">Suggested people with shared interests</option>
            <option value="all">All newly joined, listed members</option>
          </select>
        </label>
        <p className="mt-2 text-xs text-ink-700">Saved on this device only. This shows a quiet summary here; it sends no email or individual notifications.</p>
        {newMemberUpdates !== 'none' && <div className="mt-2 text-xs text-ink-700" data-testid="new-member-updates">
          {recentMembers.length ? `Recently joined: ${recentMembers.map((m) => m.fullName).join(' · ')}` : 'No new listed members in the last 30 days.'}
        </div>}
      </section>
      {actionError && <p role="alert" className="text-sm text-crimson-700">{actionError}</p>}
      {s.isLoading ? <Skeleton /> : s.isError ? <ErrorBox onRetry={() => s.refetch()} /> : list.length === 0 ? (
        <Empty title={q || sector || onlyFollowing || country || profession || recentOnly ? 'No match' : 'The network is just opening'} body={q || sector || onlyFollowing || country || profession || recentOnly ? 'Try another name, sector or clear your filters.' : 'As verified members join, they will appear here. Invite a peer whose work deserves to be seen.'} />
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
                  {!m.blocked && <button disabled={pending} onClick={() => { setActionError(''); run({ action: 'follow', targetId: m.id, accepted: !m.followed }).catch(() => setActionError('Following could not be updated. Please try again.')); }} className={`rounded-full px-3 py-1.5 font-semibold ${m.followed ? 'border border-sand-300 text-ink-700' : 'bg-lagoon-900 text-ivory-50'}`} data-testid={`button-follow-${m.id}`}>{m.followed ? 'Following' : 'Follow'}</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
