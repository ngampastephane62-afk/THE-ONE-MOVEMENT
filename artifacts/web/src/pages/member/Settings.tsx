import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/react';
import { Link } from 'wouter';
import { Camera, Eye, ImageIcon, Loader2 } from 'lucide-react';
import ProfileHero, { appearanceOf } from '@/components/network/ProfileHero';
import { useGetMemberProfile, getGetMemberProfileQueryKey, type MemberProfileInput } from '@workspace/api-client-react';
import { ACCEPT_IMG, ErrorBox, Skeleton, btn, card, useAct, useUploads } from '@/components/network/kit';
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
  const [tab, setTab] = useState<'profile' | 'workspace'>('profile');
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<MemberProfileInput | null>(null);
  const [formKey, setFormKey] = useState(0);
  const q = useGetMemberProfile({ query: { queryKey: getGetMemberProfileQueryKey() } });
  const src = draft ?? q.data?.profile ?? null;
  const ap = appearanceOf(src);
  const preview = { ...me, ...(draft ? { fullName: draft.fullName || me.fullName, profession: draft.profession, organization: draft.organization, country: draft.country, website: draft.website } : {}) };
  const dirty = !!draft && !!q.data?.profile && (['profileLayout', 'coverPosition', 'postsLayout', 'fullName', 'profession', 'organization', 'country', 'website', 'bio', 'offering', 'lookingFor', 'sectors', 'isPublic', 'publicMedia'] as const).some((k) => k in appearanceKeys ? appearanceOf(draft)[appearanceKeys[k as keyof typeof appearanceKeys]] !== appearanceOf(q.data!.profile)[appearanceKeys[k as keyof typeof appearanceKeys]] : JSON.stringify(draft[k]) !== JSON.stringify(q.data!.profile![k]));

  return (
    <div className="flex flex-col gap-4 px-3 pt-4 md:px-0 md:pt-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-eyebrow text-gold-700">SETTINGS</p>
          <h1 className="font-display text-2xl text-ink-900">Customize your page</h1>
          <p className="mt-1 text-sm text-ink-700">Free for every member. Changes preview live below and apply once you save.</p>
        </div>
        <Link href={`/member/profile/${me.id}`} className={btn} data-testid="link-view-my-profile"><Eye className="h-3.5 w-3.5" />View my profile</Link>
      </div>
      <div className="relative">
        <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-sand-400"><span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-coral-500' : 'bg-lagoon-600'}`} />{dirty ? 'Preview, unsaved changes' : 'Preview of your page'}</p>
        <div className="overflow-hidden rounded-3xl ring-1 ring-sand-200">
          <ProfileHero m={preview} layout={ap.layout} coverPosition={ap.pos} compact coverTools={<MediaPicker kind="cover" />} avatarTools={<MediaPicker kind="avatar" />}
            stats={<><span><b>{me.followers}</b> followers</span><span><b>{me.following}</b> following</span></>} />
        </div>
        <p className="mt-2 text-xs text-sand-400">Photo and cover save as soon as they finish uploading. Use the focal point slider to choose which part of your cover stays visible.</p>
      </div>
      <div className="flex gap-1 rounded-full bg-ivory-200 p-1" role="tablist">
        {([['profile', 'Page & visibility'], ['workspace', 'Workspace bookmarks']] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 rounded-full px-3 py-1.5 text-xs ${tab === id ? 'bg-ivory-50 font-semibold text-lagoon-900 shadow-sm' : 'text-ink-700'}`} data-testid={`tab-settings-${id}`}>{l}</button>
        ))}
      </div>
      {q.isLoading ? <Skeleton rows={2} /> : q.isError ? <ErrorBox onRetry={() => q.refetch()} /> : !q.data?.profile ? <ErrorBox onRetry={() => q.refetch()} msg="Profile not found." /> : tab === 'profile' ? (
        <div className={`${card} p-5 sm:p-7`}>
          <p className="mb-5 text-sm text-ink-700">These details appear on your network page for signed-in members. The public-directory switch below controls only the public website.</p>
          {saved && <p className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-lagoon-600/10 p-2 text-sm text-lagoon-700" role="status">Page saved. <Link href={`/member/profile/${me.id}`} className="font-semibold underline" data-testid="link-view-saved">See it live</Link></p>}
          <ProfileForm key={formKey} appearance initial={q.data.profile} defaultName={user?.fullName ?? ''} onDraft={(d) => { setDraft(d); }}
            onCancel={dirty ? () => { setDraft(null); setSaved(false); setFormKey((k) => k + 1); } : undefined}
            onDone={() => { setSaved(true); setDraft(null); }} />
        </div>
      ) : <Workspace profile={q.data.profile} onEdit={() => setTab('profile')} />}
    </div>
  );
}

const appearanceKeys = { profileLayout: 'layout', coverPosition: 'pos', postsLayout: 'posts' } as const;
