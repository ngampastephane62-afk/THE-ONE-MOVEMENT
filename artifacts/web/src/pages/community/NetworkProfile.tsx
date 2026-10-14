import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { Show } from '@clerk/react';
import { ExternalLink, MapPin } from 'lucide-react';
import { useGetPublicNetworkProfile, getGetPublicNetworkProfileQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { Avatar, Badges, ErrorBox, Skeleton, errStatus } from '@/components/network/kit';
import { storePendingFollow } from '@/lib/network-invitations';

const cta = 'inline-flex items-center gap-2 bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:bg-lagoon-800';

export default function NetworkProfilePage() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const ok = Number.isInteger(pid) && pid > 0;
  const q = useGetPublicNetworkProfile(pid, { query: { enabled: ok, retry: false, queryKey: getGetPublicNetworkProfileQueryKey(pid) } });

  const wrap = (body: ReactNode) => (
    <div className="min-h-[70dvh] bg-ivory-100 px-0 py-10 sm:px-4 sm:py-16">
      <div className="mx-auto max-w-3xl">{body}</div>
    </div>
  );

  if (ok && q.isLoading) return wrap(<div className="px-4"><Skeleton rows={2} /></div>);
  if (!ok || (q.isError && errStatus(q.error) === 404)) {
    return wrap(
      <div className="mx-4 border border-dashed border-gold-500/50 bg-ivory-50 p-8 text-center" data-testid="profile-not-public">
        <Helmet><title>Profile not available — TOMI</title><meta name="robots" content="noindex" /></Helmet>
        <p className="font-display text-xl text-ink-900">This profile is not public</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">The member may not have joined the network yet, may keep their profile private, or the link may be wrong.</p>
        <Link href="/ecosystem" className={`${cta} mt-5`} data-testid="link-back-directory">Browse the directory</Link>
      </div>,
    );
  }
  if (q.isError || !q.data) return wrap(<div className="px-4"><ErrorBox onRetry={() => q.refetch()} msg="This profile could not be loaded." /></div>);
  const p = q.data.profile;
  const sectors = SECTORS.filter((s) => (p.sectors as string[]).includes(s.slug));
  const first = p.fullName.split(' ')[0];

  return wrap(
    <article className="overflow-hidden border-y border-sand-200 bg-ivory-50 sm:border" data-testid={`public-profile-${p.id}`}>
      <Helmet><title>{`${p.fullName} — TOMI NETWORK`}</title></Helmet>
      <div className="h-40 bg-lagoon-800 sm:h-56" style={p.coverUrl ? { backgroundImage: `url(${p.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: 'radial-gradient(ellipse at 80% 20%, hsl(39 52% 54% / 0.35), transparent 60%), linear-gradient(135deg, hsl(187 67% 12%), hsl(189 74% 28%))' }} />
      <div className="px-5 pb-8 sm:px-8">
        <div className="-mt-12 w-fit rounded-full bg-ivory-50 p-1"><Avatar m={p} size={96} /></div>
        <h1 className="mt-3 font-display text-3xl text-ink-900" data-testid="text-public-name">{p.fullName}</h1>
        <div className="mt-1"><Badges m={p} /></div>
        <p className="mt-1 text-ink-700">{[p.profession, p.organization].filter(Boolean).join(' · ')}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sand-400">
          {p.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.country}</span>}
          {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-lagoon-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" />{p.website.replace(/^https?:\/\//, '')}</a>}
          {p.enabled && <span><b className="text-ink-900">{p.followers}</b> followers</span>}
        </div>
        {p.bio && <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">{p.bio}</p>}
        {(p.offering || p.lookingFor) && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {p.offering && <div className="bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">OFFERS</p><p className="mt-1 text-sm text-ink-800">{p.offering}</p></div>}
            {p.lookingFor && <div className="bg-ivory-100 p-3"><p className="text-eyebrow text-gold-700">LOOKING FOR</p><p className="mt-1 text-sm text-ink-800">{p.lookingFor}</p></div>}
          </div>
        )}
        {sectors.length > 0 && <div className="mt-5 flex flex-wrap gap-1.5">{sectors.map((s) => <span key={s.slug} className="bg-lagoon-900 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-400">{s.name}</span>)}</div>}
        <div className="mt-8 border-t border-sand-200 pt-6">
          {!p.enabled ? (
            <div data-testid="profile-not-active">
              <p className="text-sm text-ink-700">{first} chose to make this profile public, but has not joined the member network yet, so following and messaging are not available for now.</p>
              <Show when="signed-out"><Link href="/sign-up" className={`${cta} mt-4`} data-testid="link-profile-join-generic">Join the TOMI network</Link></Show>
              <Show when="signed-in"><Link href="/member" className={`${cta} mt-4`} data-testid="link-profile-network-home">Go to the network</Link></Show>
            </div>
          ) : (<>
          <p className="text-sm text-ink-700">Posts and conversations are visible to signed-in network members only.</p>
          <Show when="signed-out">
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/sign-up" onClick={() => storePendingFollow(p.id, p.fullName)} className={cta} data-testid="link-profile-join">Join to follow {first}</Link>
              <Link href="/sign-in" onClick={() => storePendingFollow(p.id, p.fullName)} className="inline-flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-lagoon-700 hover:text-gold-700" data-testid="link-profile-signin">Sign in</Link>
            </div>
            <p className="mt-2 text-xs text-sand-400">After you join, we will offer to follow {first}. Nothing happens automatically.</p>
          </Show>
          <Show when="signed-in">
            <Link href={`/member/profile/${p.id}`} className={`${cta} mt-4`} data-testid="link-profile-open">Open in the network</Link>
          </Show>
          </>)}
        </div>
      </div>
    </article>,
  );
}
