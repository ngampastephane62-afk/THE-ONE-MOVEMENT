import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { useGetMemberProfile, getGetMemberProfileQueryKey } from '@workspace/api-client-react';
import { ACCEPT_IMG, Avatar, ErrorBox, STATE_PREFIX, Skeleton, card, useAct, useUploads } from '@/components/network/kit';
import ProfileForm from './ProfileForm';
import Workspace from './Workspace';
import { useMe } from './ctx';

function MediaPicker({ kind }: { kind: 'avatar' | 'cover' }) {
  const u = useUploads(1);
  const { run } = useAct();
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'' | 'saving' | 'err'>('');
  const done = u.items[0]?.status === 'done' ? u.items[0].id : undefined;
  const failed = u.items[0]?.status === 'error' ? u.items[0].error : undefined;
  useEffect(() => {
    if (!done) return;
    setState('saving');
    run({ action: 'profile.media', kind, mediaIds: [done] }).then(() => { setState(''); u.clear(); }).catch(() => setState('err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const busy = u.busy || state === 'saving';
  return (
    <div className="flex flex-col gap-1">
      <input ref={ref} hidden type="file" accept={ACCEPT_IMG} onChange={(e) => { u.clear(); if (e.target.files) u.add(e.target.files); e.target.value = ''; }} data-testid={`input-${kind}`} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50/90 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow hover:bg-ivory-50 disabled:opacity-60" data-testid={`button-${kind}`}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : kind === 'avatar' ? <Camera className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
        {busy ? `${u.items[0]?.progress ?? 0}%` : kind === 'avatar' ? 'Change photo' : 'Change cover'}
      </button>
      {(failed || state === 'err') && <span className="rounded bg-ivory-50 px-2 text-xs text-crimson-700" role="alert">{failed ?? 'Could not save.'} {done && <button className="underline" onClick={() => { setState('saving'); run({ action: 'profile.media', kind, mediaIds: [done] }).then(() => { setState(''); u.clear(); }).catch(() => setState('err')); }}>Retry</button>}</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { me } = useMe();
  const { user } = useUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'workspace'>('profile');
  const [saved, setSaved] = useState(false);
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <section className={`${card} overflow-hidden`}>
        <div className="relative h-32 bg-lagoon-800 sm:h-40" style={me.coverUrl ? { backgroundImage: `url(${me.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <div className="absolute right-3 top-3"><MediaPicker kind="cover" /></div>
        </div>
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="-mt-10 rounded-full bg-ivory-50 p-1"><Avatar m={me} size={84} /></div>
          <MediaPicker kind="avatar" />
        </div>
      </section>
      <div className="flex gap-1 rounded-full bg-ivory-200 p-1" role="tablist">
        {([['profile', 'Profile & visibility'], ['workspace', 'Workspace bookmarks']] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 rounded-full px-3 py-1.5 text-xs ${tab === id ? 'bg-ivory-50 font-semibold text-lagoon-900 shadow-sm' : 'text-ink-700'}`} data-testid={`tab-settings-${id}`}>{l}</button>
        ))}
      </div>
      {q.isLoading ? <Skeleton rows={2} /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} /> : !q.data?.profile ? <ErrorBox onRetry={() => q.refetch()} msg="Profile not found." /> : tab === 'profile' ? (
        <div className={`${card} p-5 sm:p-7`}>
          <p className="mb-5 text-sm text-ink-700">These details appear on your network profile for signed-in members. The public-directory switch below controls only the public website.</p>
          {saved && <p className="mb-4 rounded-lg bg-lagoon-600/10 p-2 text-sm text-lagoon-700" role="status">Profile saved.</p>}
          <ProfileForm initial={q.data.profile} defaultName={user?.fullName ?? ''} onDone={() => { setSaved(true); qc.invalidateQueries({ queryKey: STATE_PREFIX }); }} />
        </div>
      ) : <Workspace profile={q.data.profile} onEdit={() => setTab('profile')} />}
    </div>
  );
}
