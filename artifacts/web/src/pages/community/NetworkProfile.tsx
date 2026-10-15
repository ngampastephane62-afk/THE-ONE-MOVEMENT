import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'wouter';
import { Show } from '@clerk/react';
import ProfileHero, { appearanceOf } from '@/components/network/ProfileHero';
import { useGetPublicNetworkProfile, getGetPublicNetworkProfileQueryKey } from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { ErrorBox, Skeleton, errStatus } from '@/components/network/kit';
import { storePendingFollow } from '@/lib/network-invitations';

const cta = 'inline-flex items-center gap-2 bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:bg-lagoon-800';

export default function NetworkProfilePage() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const ok = Number.isInteger(pid) && pid > 0;
  const q = useGetPublicNetworkProfile(pid, { query: { enabled: ok, retry: false, queryKey: getGetPublicNetworkProfileQueryKey(pid) } });

  const wrap = (body: ReactNode) => (
    <div className="min-h-[70dvh] bg-ivory-100 px-0 py-10 sm:px-4 sm:py-16">
      <div className="mx-auto max-w-4xl">{body}</div>
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
  const ap = appearanceOf(p);
  const shown = p.publicMedia === false ? { ...p, avatarUrl: null, coverUrl: null } : p;
  const first = p.fullName.split(' ')[0];

  return wrap(
    <article data-testid={`public-profile-${p.id}`}>
      <Helmet><title>{`${p.fullName} — TOMI NETWORK`}</title></Helmet>
      <ProfileHero m={shown} layout={ap.layout} coverPosition={ap.pos}
        stats={p.enabled ? <span><b>{p.followers}</b> followers</span> : undefined} />
      <div className="mt-4 border-y border-sand-200 bg-ivory-50 px-5 pb-8 pt-2 sm:rounded-3xl sm:border sm:px-8">
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
