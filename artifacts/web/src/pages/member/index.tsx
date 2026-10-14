import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Redirect } from 'wouter';
import { Show, useAuth, useUser, useClerk } from '@clerk/react';
import { LogOut, RotateCw } from 'lucide-react';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { basePath } from '@/lib/clerk';
import ProfileForm from './ProfileForm';
import Workspace from './Workspace';

function MemberContent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [editing, setEditing] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useGetMemberProfile({
    query: { enabled: !!isSignedIn, queryKey: getGetMemberProfileQueryKey() },
  });
  const profile = data?.profile ?? null;
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="min-h-[80dvh] bg-ivory-100">
      <div className="border-b border-gold-500/25 bg-lagoon-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-xs text-ivory-300">
          <span data-testid="text-account-email">Signed in{email ? ` as ${email}` : ''}</span>
          <button type="button" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-signout" className="inline-flex items-center gap-1.5 uppercase tracking-wider text-ivory-100 hover:text-gold-400">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <div className="h-10 w-2/3 animate-pulse bg-ivory-200" /><div className="h-5 w-1/3 animate-pulse bg-ivory-200" />
            <div className="mt-6 grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse bg-ivory-200" />)}</div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-3 border border-crimson-700/30 bg-crimson-700/5 p-6" role="alert">
            <p className="text-sm text-crimson-700">Your member space could not be loaded.</p>
            <button type="button" onClick={() => refetch()} disabled={isFetching} data-testid="button-retry-profile" className="inline-flex items-center gap-2 bg-lagoon-900 px-4 py-2 text-xs uppercase tracking-wider text-ivory-100 disabled:opacity-60">
              <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Try again
            </button>
          </div>
        ) : !profile || editing ? (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-eyebrow text-gold-700">{profile ? 'EDIT PROFILE' : 'WELCOME'}</p>
              <h1 className="mt-2 text-display-md text-ink-900">{profile ? 'Keep your space current' : 'Set up your member space'}</h1>
              <p className="mt-4 text-sm leading-relaxed text-ink-700">Name, role and at least one sector are all we need to tailor programmes and official resources to you. Everything else is optional. Your profile stays private unless you choose otherwise.</p>
            </div>
            <div className="lg:col-span-8 border border-sand-200 bg-ivory-50 p-6 sm:p-8">
              <ProfileForm initial={profile} defaultName={user?.fullName ?? ''} onDone={() => setEditing(false)} onCancel={profile ? () => setEditing(false) : undefined} />
            </div>
          </div>
        ) : (
          <Workspace profile={profile} onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  );
}

export default function MemberPage() {
  return (
    <>
      <Helmet><title>MEMBER SPACE — THE ONE MOVEMENT INTERNATIONAL</title><meta name="robots" content="noindex" /></Helmet>
      <Show when="signed-in"><MemberContent /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}
