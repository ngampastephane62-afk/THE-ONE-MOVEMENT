import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { Search, Globe, RotateCw } from 'lucide-react';
import { useGetEcosystemMembers, type PublicMember } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { sectorName } from '@/lib/ecosystem-match';
import { DIRECTORY_SECTOR_EVENT } from './directory-navigation';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch { return null; }
}

function MemberCard({ m }: { m: PublicMember }) {
  const { isSignedIn } = useAuth();
  const [photoFailed, setPhotoFailed] = useState(false);
  const site = m.website ? safeUrl(m.website) : null;
  const profileHref = isSignedIn && m.enabled ? `/member/profile/${m.id}` : `/community/members/${m.id}`;
  return (
    <article className="flex flex-col gap-3 border border-sand-200 bg-ivory-50 p-5" data-testid={`card-member-${m.id}`}>
      <Link href={profileHref} className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-member-identity-${m.id}`}>
        {m.avatarUrl && !photoFailed ? (
          <img src={`${import.meta.env.BASE_URL}${m.avatarUrl.replace(/^\//, '')}`} alt="" loading="lazy" onError={() => setPhotoFailed(true)} className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lagoon-900 font-display text-sm text-gold-400" aria-hidden="true">{initials(m.fullName)}</span>}
        <div className="min-w-0">
          <h3 className="truncate font-display text-base text-ink-900">{m.fullName}</h3>
          <p className="truncate text-xs text-ink-700">{[m.profession, m.organization, m.country].filter(Boolean).join(' · ')}</p>
        </div>
      </Link>
      {m.bio && <p className="text-sm leading-relaxed text-ink-700 line-clamp-3">{m.bio}</p>}
      {m.offering && <p className="text-xs text-ink-700"><span className="font-semibold text-lagoon-600">Offers: </span>{m.offering}</p>}
      {m.lookingFor && <p className="text-xs text-ink-700"><span className="font-semibold text-lagoon-600">Looking for: </span>{m.lookingFor}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {m.sectors.map((s) => <span key={s} className="bg-ivory-200 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-700">{sectorName(s)}</span>)}
      </div>
      <Link href={profileHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-lagoon-700 hover:text-gold-700" data-testid={`link-member-profile-${m.id}`}>View profile · Follow · Message</Link>
      {site && (
        <a href={site} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-xs font-semibold text-lagoon-600 hover:text-gold-700" data-testid={`link-member-site-${m.id}`}>
          <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Website
        </a>
      )}
    </article>
  );
}

export default function MemberDirectory() {
  const { data, isLoading, isError, refetch, isFetching } = useGetEcosystemMembers({ query: { refetchInterval: 30000 } });
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const members = data?.members;
  useEffect(() => {
    const on = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (!SECTORS.some((s) => s.slug === slug)) return;
      setSector(slug);
      const el = document.getElementById('directory');
      el?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      el?.querySelector<HTMLElement>('select')?.focus({ preventScroll: true });
    };
    window.addEventListener(DIRECTORY_SECTOR_EVENT, on);
    return () => window.removeEventListener(DIRECTORY_SECTOR_EVENT, on);
  }, []);

  const filtered = useMemo(() => {
    const list = members ?? [];
    const query = q.trim().toLowerCase();
    return list.filter((m) => {
      if (sector && !m.sectors.includes(sector as PublicMember['sectors'][number])) return false;
      if (!query) return true;
      return [m.fullName, m.profession, m.organization, m.country, m.bio, m.offering, m.lookingFor].join(' ').toLowerCase().includes(query);
    });
  }, [members, q, sector]);

  return (
    <section id="directory" className="scroll-mt-20 bg-ivory-100 py-section-md border-t border-sand-200" aria-labelledby="directory-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-700">COMMUNITY DIRECTORY</p>
            <h2 id="directory-title" className="mt-2 text-display-md text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>PEOPLE WHO CHOSE TO BE FOUND</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700">
              Every profile here was written by the member and made public by them. Profiles are self-described and are not endorsements, verification or partnership claims by TOMI.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400" aria-hidden="true" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members" aria-label="Search members" data-testid="input-member-search"
                className="w-full border border-sand-300 bg-ivory-50 py-2.5 pl-9 pr-3 text-sm focus:border-lagoon-600 focus:outline-none" />
            </div>
            <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by sector" data-testid="select-member-sector"
              className="border border-sand-300 bg-ivory-50 px-3 py-2.5 text-sm focus:border-lagoon-600 focus:outline-none">
              <option value="">All sectors</option>
              {SECTORS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading members">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 animate-pulse bg-ivory-200" />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3 border border-crimson-700/30 bg-crimson-700/5 p-6" role="alert">
              <p className="text-sm text-crimson-700">The directory could not be loaded right now.</p>
              <button type="button" onClick={() => refetch()} disabled={isFetching} data-testid="button-retry-directory"
                className="inline-flex items-center gap-2 bg-lagoon-900 px-4 py-2 text-xs uppercase tracking-wider text-ivory-100 disabled:opacity-60">
                <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Try again
              </button>
            </div>
          ) : !members?.length ? (
            <div className="grid gap-4 border border-dashed border-gold-500/50 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-display text-lg text-ink-900">No public profiles yet.</p>
                <p className="mt-1 text-sm text-ink-700">The directory starts empty and grows only when members opt in. Yours could be the first.</p>
              </div>
              <Link href="/member" data-testid="link-directory-create" className="inline-flex justify-center bg-gold-500 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Create your member space</Link>
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => <MemberCard key={m.id} m={m} />)}
            </div>
          ) : (
            <p className="text-sm text-ink-700">No public members match these filters. <button type="button" className="text-lagoon-600 underline" onClick={() => { setQ(''); setSector(''); }}>Clear filters</button></p>
          )}
        </div>
      </div>
    </section>
  );
}
