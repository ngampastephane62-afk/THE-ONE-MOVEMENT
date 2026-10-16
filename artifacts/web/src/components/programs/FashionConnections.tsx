import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { RotateCw } from 'lucide-react';
import { useGetEcosystemMembers, type PublicMember } from '@workspace/api-client-react';

/** Bilingual keyword sets matched against the member's own public profile text. */
const ROLES = [
  { id: 'stylists', label: 'Stylists & designers', q: 'stylist', keys: ['stylist', 'styliste', 'styling', 'designer', 'créat', 'creat', 'couturi', 'couture', 'fashion design', 'modéliste', 'tailor', 'tailleur'] },
  { id: 'models', label: 'Models', q: 'model', keys: ['model', 'modèle', 'mannequin', 'runway', 'défilé'] },
  { id: 'photographers', label: 'Photographers', q: 'photographer', keys: ['photograph', 'photo', 'videograph', 'vidéaste', 'cinematograph', 'filmmaker'] },
  { id: 'influencers', label: 'Influencers', q: 'influencer', keys: ['influenc', 'content creator', 'créateur de contenu', 'créatrice de contenu', 'blogger', 'blogueu', 'ambassador', 'ambassadeur', 'ambassadrice'] },
  { id: 'all', label: 'All professions', q: '', keys: [] as string[] },
] as const;
type RoleId = typeof ROLES[number]['id'];

const text = (m: PublicMember) => [m.profession, m.bio, m.offering, m.lookingFor, m.organization].join(' ').toLowerCase();
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export default function FashionConnections() {
  const { isSignedIn } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useGetEcosystemMembers();
  const [role, setRole] = useState<RoleId>('stylists');
  const [shown, setShown] = useState(9);
  const members = data?.members;
  const active = ROLES.find((r) => r.id === role)!;

  const matches = useMemo(() => {
    const list = members ?? [];
    if (!active.keys.length) return list;
    return list.filter((m) => { const t = text(m); return active.keys.some((k) => t.includes(k)); });
  }, [members, active]);

  const peopleHref = `/member/people${active.q ? `?q=${encodeURIComponent(active.q)}` : ''}`;

  return (
    <section className="bg-ivory-100 py-section-lg" style={{ borderTop: '1px solid hsl(36 26% 84%)' }} aria-labelledby="fashion-connections-heading">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-eyebrow text-gold-600">FASHION WEEK CONNECTIONS</p>
        <h2 id="fashion-connections-heading" className="mt-3 text-display-lg text-ink-900" style={{ fontFamily: 'var(--font-display)' }}>FIND THE PEOPLE WHO MAKE A RUNWAY.</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-800">
          Stylists, designers, models, photographers and influencers from the public member directory. Every profile here was made public by its member; appearing here does not mean participation in the 22 December 2026 edition.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by profession">
          {ROLES.map((r) => (
            <button key={r.id} type="button" role="tab" aria-selected={role === r.id} onClick={() => setRole(r.id)} data-testid={`chip-role-${r.id}`}
              className={`min-h-11 rounded-sharp border px-4 text-xs uppercase tracking-[0.14em] transition-colors ${role === r.id ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 bg-ivory-50 text-ink-800 hover:border-gold-500'}`}>
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-8" aria-live="polite">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading members">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 animate-pulse bg-ivory-200" />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3 border border-crimson-700/30 bg-crimson-700/5 p-6" role="alert">
              <p className="text-sm text-crimson-700">The directory could not be loaded right now.</p>
              <button type="button" onClick={() => refetch()} disabled={isFetching} data-testid="button-retry-connections" className="inline-flex min-h-11 items-center gap-2 bg-lagoon-900 px-4 text-xs uppercase tracking-wider text-ivory-100 disabled:opacity-60">
                <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="border border-dashed border-gold-500/50 p-8">
              <p className="font-display text-lg text-ink-900">No public profile matches this profession yet.</p>
              <p className="mt-1 text-sm text-ink-700">The directory grows only when members choose to be found. Describe your craft in your profile and make it public.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.slice(0, shown).map((m) => {
                const href = isSignedIn && m.enabled ? `/member/profile/${m.id}` : `/community/members/${m.id}`;
                return (
                  <li key={m.id}>
                    <Link href={href} data-testid={`link-connection-${m.id}`} className="flex h-full gap-3 border border-sand-200 bg-ivory-50 p-5 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lagoon-900 font-display text-sm text-gold-400" aria-hidden="true">{initials(m.fullName)}</span>
                      <span className="min-w-0" data-no-translate>
                        <span className="block truncate font-display text-base text-ink-900">{m.fullName}</span>
                        <span className="block truncate text-xs text-ink-700">{[m.profession, m.country].filter(Boolean).join(' · ')}</span>
                        {m.offering && <span className="mt-2 block text-xs text-ink-700 line-clamp-2">{m.offering}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {matches.length > shown && <button type="button" onClick={() => setShown(n => n + 9)} className="mt-5 min-h-11 border border-lagoon-900 px-5 text-sm text-lagoon-900" data-testid="button-connections-more">Show more members</button>}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {isSignedIn ? (
            <Link href={peopleHref} data-testid="link-connections-people" className="inline-flex min-h-11 items-center bg-gold-500 px-5 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Follow &amp; message in My space</Link>
          ) : (
            <>
              <Link href="/sign-in" data-testid="link-connections-signin" className="inline-flex min-h-11 items-center bg-gold-500 px-5 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-gold-400">Sign in to connect</Link>
              <Link href="/join" data-testid="link-connections-join" className="inline-flex min-h-11 items-center border border-lagoon-900 px-5 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">Join the Movement</Link>
            </>
          )}
          <p className="text-xs text-ink-700">Profiles are self-described, not verified or endorsed by TOMI.</p>
        </div>
      </div>
    </section>
  );
}
