import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Eye, EyeOff, X } from 'lucide-react';
import {
  useToggleMemberSavedItem,
  getGetMemberProfileQueryKey,
  type MemberProfile,
} from '@workspace/api-client-react';
import { PROGRAMS } from '@/lib/programs-data';
import { ECOSYSTEM_RESOURCES } from '@/lib/ecosystem-resources';
import { SECTORS } from '@/lib/sectors-data';
import {
  programsForSectors, resourcesForSectors, programItemId, resourceItemId,
} from '@/lib/ecosystem-match';
import ProgrammeLink from '@/components/ecosystem/ProgrammeLink';
import ResourceCard from '@/components/ecosystem/ResourceCard';

export default function Workspace({ profile, onEdit }: { profile: MemberProfile; onEdit: () => void }) {
  const qc = useQueryClient();
  const toggle = useToggleMemberSavedItem();
  const saved = new Set(profile.savedItems);
  function flip(itemId: string) {
    if (toggle.isPending) return;
    toggle.mutate({ data: { itemId, saved: !saved.has(itemId) } }, {
      onSuccess: (res) => qc.setQueryData(getGetMemberProfileQueryKey(), res),
    });
  }

  const sectors = SECTORS.filter((s) => profile.sectors.includes(s.slug as MemberProfile['sectors'][number]));
  const programs = sectors.length ? programsForSectors(profile.sectors) : PROGRAMS;
  const resources = sectors.length ? resourcesForSectors(profile.sectors) : ECOSYSTEM_RESOURCES;
  const savedPrograms = PROGRAMS.filter((p) => saved.has(programItemId(p.slug)));
  const savedResources = ECOSYSTEM_RESOURCES.filter((r) => saved.has(resourceItemId(r.id)));

  return (
    <div className="flex flex-col gap-12">
      <header className="grid gap-6 border-b border-sand-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-eyebrow text-gold-700">DISCOVERY & BOOKMARKS</p>
          <h1 className="mt-2 text-display-lg text-ink-900" data-testid="text-member-name">{profile.fullName}</h1>
          <p className="mt-2 text-ink-700">{[profile.profession, profile.organization, profile.country].filter(Boolean).join(' · ')}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sectors.map((s) => <span key={s.slug} className="bg-lagoon-900 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-400">{s.name}</span>)}
          </div>
          <p className="mt-3 text-sm text-ink-700" data-testid="text-discovery-basis">{sectors.length ? 'These links use only the sectors you saved in your profile, not your browsing activity. They do not limit what you can explore.' : 'No sectors selected. Browse the general programme and resource catalogue below, or explore all 17 sectors. Adding sectors to your profile is optional.'}</p>
          <Link href="/member/people" className="mt-3 inline-flex text-sm font-semibold text-lagoon-700 underline" data-testid="link-workspace-people">Discover people</Link>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <span className={`inline-flex items-center gap-1.5 text-xs ${profile.isPublic ? 'text-lagoon-600' : 'text-sand-400'}`} data-testid="status-visibility">
            {profile.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {profile.isPublic ? 'Visible in the public directory' : 'Private — not in the directory'}
          </span>
          <button type="button" onClick={onEdit} data-testid="button-edit-profile" className="inline-flex items-center gap-2 border border-lagoon-900 px-4 py-2.5 text-xs uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">
            <Pencil className="h-3.5 w-3.5" /> Edit profile & visibility
          </button>
        </div>
      </header>

      {toggle.isError && (
        <div className="flex items-center gap-3 border border-crimson-700/30 bg-crimson-700/5 p-4" role="alert">
          <p className="text-sm text-crimson-700">That bookmark could not be updated.</p>
          {toggle.variables && <button type="button" onClick={() => toggle.variables && flip(toggle.variables.data.itemId)} className="text-xs font-semibold uppercase underline text-crimson-700" data-testid="button-retry-bookmark">Retry</button>}
        </div>
      )}

      <section aria-labelledby="saved-title">
        <h2 id="saved-title" className="font-display text-xl text-ink-900">Saved</h2>
        {savedPrograms.length + savedResources.length === 0 ? (
          <p className="mt-3 border border-dashed border-sand-300 p-6 text-sm text-ink-700">Nothing saved yet. Use the bookmark on any programme or resource below and it will stay here between visits.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand-200 border border-sand-200 bg-ivory-50">
            {[...savedPrograms.map((p) => ({ id: programItemId(p.slug), label: p.name, kind: 'Programme', href: `/programs/${p.slug}`, ext: false })),
              ...savedResources.map((r) => ({ id: resourceItemId(r.id), label: r.title, kind: r.organization, href: r.url, ext: true }))].map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3" data-testid={`row-saved-${it.id}`}>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gold-700">{it.kind}</p>
                  {it.ext
                    ? <a href={it.href} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-ink-900 hover:text-lagoon-600">{it.label}</a>
                    : <Link href={it.href} className="block truncate text-sm text-ink-900 hover:text-lagoon-600">{it.label}</Link>}
                </div>
                <button type="button" onClick={() => flip(it.id)} disabled={toggle.isPending} aria-label={`Remove ${it.label}`} data-testid={`button-remove-${it.id}`} className="p-1.5 text-sand-400 hover:text-crimson-700 disabled:opacity-40">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rec-prog-title">
        <h2 id="rec-prog-title" className="font-display text-xl text-ink-900">{sectors.length ? 'Programmes connected to your sectors' : 'Explore programmes'}</h2>
        <p className="mt-1 text-xs text-sand-400">Existing programme information, not an admission offer. Saving a programme does not register you or guarantee a place.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {programs.map((p) => (
            <ProgrammeLink key={p.slug} program={p} saved={saved.has(programItemId(p.slug))} saving={toggle.isPending} onToggleSave={() => flip(programItemId(p.slug))} />
          ))}
        </div>
      </section>

      <section aria-labelledby="rec-res-title">
        <h2 id="rec-res-title" className="font-display text-xl text-ink-900">{sectors.length ? 'Resources connected to your sectors' : 'Explore public knowledge resources'}</h2>
        <p className="mt-1 text-xs text-sand-400">Curated official public pages. Listing does not imply partnership with TOMI.</p>
        {resources.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} saved={saved.has(resourceItemId(r.id))} saving={toggle.isPending} onToggleSave={() => flip(resourceItemId(r.id))} />
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-ink-700">No curated resources match your sectors yet. You can still explore every sector below.</p>}
      </section>

      <section className="grid gap-4 border-t border-sand-200 pt-8 sm:grid-cols-2">
        <Link href="/ecosystem" className="border border-sand-200 bg-ivory-50 p-5 hover:border-gold-500" data-testid="link-workspace-ecosystem">
          <p className="font-display text-ink-900">Explore all 17 sectors</p><p className="mt-1 text-sm text-ink-700">Browse the community directory and the full ecosystem, beyond your saved sectors.</p>
        </Link>
        <Link href="/join" className="border border-sand-200 bg-ivory-50 p-5 hover:border-gold-500" data-testid="link-workspace-join">
          <p className="font-display text-ink-900">Representing an organization?</p><p className="mt-1 text-sm text-ink-700">Use the institutional enquiry pathway.</p>
        </Link>
      </section>
    </div>
  );
}
