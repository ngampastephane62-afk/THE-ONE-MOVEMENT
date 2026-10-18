import { useEffect, useRef, useState, type FormEvent } from 'react';
import AppearanceControls from './AppearanceControls';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  useSaveMemberProfile,
  type MemberProfile,
  type MemberProfileInput,
  type MemberProfileInputSectorsItem,
} from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { useAuth } from '@clerk/react';
import { getPendingSector, clearPendingSector } from '@/lib/network-invitations';
import { SOCIAL_PROFILES, normalizeSocialProfile } from '@workspace/shared';
import { profileInput, reconcileProfile, synchronizeProfile } from './profile-sync';

interface Props {
  initial: MemberProfile | null;
  defaultName: string;
  onDone?: (hasNewerEdits: boolean) => void;
  onCancel?: () => void;
  appearance?: boolean;
  onDraft?: (v: MemberProfileInput) => void;
}

type Errors = Partial<Record<keyof MemberProfileInput, string>>;

function validate(v: MemberProfileInput): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Enter at least 2 characters.';
  if (v.sectors.length > 8) e.sectors = 'Choose up to 8 sectors.';
  for (const { field } of SOCIAL_PROFILES) {
    try { normalizeSocialProfile(field, v[field] ?? ''); }
    catch (error) { e[field] = (error as Error).message; }
  }
  if (v.website.trim()) {
    try {
      const u = new URL(v.website.trim());
      if (u.protocol !== 'http:' && u.protocol !== 'https:') e.website = 'Use an http:// or https:// address.';
    } catch { e.website = 'Use a full address, e.g. https://example.org'; }
  }
  return e;
}

const fieldCls = 'w-full border border-sand-300 bg-ivory-50 px-3 py-2.5 text-sm text-ink-900 focus:border-lagoon-600 focus:outline-none';

export default function ProfileForm({ initial, defaultName, onDone, onCancel, appearance, onDraft }: Props) {
  const { userId } = useAuth();
  const [pendingSector] = useState(() => getPendingSector(userId));
  const qc = useQueryClient();
  const save = useSaveMemberProfile();
  const [v, setValues] = useState<MemberProfileInput>(() => ({
    ...profileInput(initial, defaultName),
    sectors: pendingSector && !(initial?.sectors ?? []).includes(pendingSector as MemberProfileInputSectorsItem) && (initial?.sectors.length ?? 0) < 8
      ? [...(initial?.sectors ?? []), pendingSector as MemberProfileInputSectorsItem]
      : initial?.sectors ?? [],
  }));
  const latest = useRef(v);
  const saving = useRef(false);
  const [synchronizing, setSynchronizing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const setV = (update: (previous: MemberProfileInput) => MemberProfileInput) => {
    const next = update(latest.current);
    latest.current = next;
    setValues(next);
  };
  const draftRef = useRef(onDraft);
  draftRef.current = onDraft;
  useEffect(() => { draftRef.current?.(v); }, [v]);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof MemberProfileInput>(k: K, val: MemberProfileInput[K]) => setV((p) => ({ ...p, [k]: val }));
  const toggleSector = (slug: MemberProfileInputSectorsItem) =>
    set('sectors', v.sectors.includes(slug) ? v.sectors.filter((s) => s !== slug) : [...v.sectors, slug]);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (saving.current) return;
    const submitted = latest.current;
    const payload: MemberProfileInput = {
      ...submitted,
      fullName: submitted.fullName.trim(), profession: submitted.profession.trim(), organization: submitted.organization.trim(),
      country: submitted.country.trim(), bio: submitted.bio.trim(), offering: submitted.offering.trim(), lookingFor: submitted.lookingFor.trim(), website: submitted.website.trim(),
    };
    const e = validate(payload);
    setErrors(e);
    if (Object.keys(e).length) return;
    saving.current = true;
    setSynchronizing(true);
    setSyncError(false);
    save.mutate({ data: payload }, {
      onSuccess: async (res) => {
        try {
          if (!res.profile) throw new Error('Missing confirmed profile');
          await synchronizeProfile(qc, res.profile);
          const confirmed = profileInput(res.profile);
          const next = reconcileProfile(latest.current, submitted, confirmed);
          setV(() => next);
          draftRef.current?.(next);
          clearPendingSector();
          onDone?.(JSON.stringify(next) !== JSON.stringify(confirmed));
        } catch {
          setSyncError(true);
        } finally {
          saving.current = false;
          setSynchronizing(false);
        }
      },
      onError: () => { saving.current = false; setSynchronizing(false); },
    });
  }

  const err = (k: keyof MemberProfileInput) => errors[k] && <p className="mt-1 text-xs text-crimson-700" role="alert">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8" data-testid="form-member-profile">
      <p className="text-sm leading-relaxed text-ink-700" data-testid="text-profile-completion-guidance">Build your profile at your own pace: confirm your display name, add a photo from Settings, describe your profession, select sectors and write a short biography. These steps are optional for exploring TOMI; you can come back later. Saving never activates the network; visibility changes only if you choose those settings.</p>
      {appearance && <AppearanceControls v={v} set={set} />}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-eyebrow text-gold-700">THE ESSENTIALS</legend>
        <label className="text-sm text-ink-900">Display name *
          <input className={`${fieldCls} mt-1`} value={v.fullName} maxLength={100} onChange={(e) => set('fullName', e.target.value)} data-testid="input-fullName" />{err('fullName')}
          <span className="mt-1 block text-xs text-ink-700">Confirm the name you want members to see, or edit it here. Your chosen name is kept until you change it.</span>
        </label>
        <label className="text-sm text-ink-900">Profession or role <span className="text-sand-400">(optional)</span>
          <input className={`${fieldCls} mt-1`} value={v.profession} maxLength={100} placeholder="e.g. Textile designer" onChange={(e) => set('profession', e.target.value)} data-testid="input-profession" />{err('profession')}
        </label>
      </fieldset>

      <fieldset>
        <legend className="text-eyebrow text-gold-700">YOUR SECTORS <span className="normal-case tracking-normal text-sand-400">(optional, {v.sectors.length}/8)</span></legend>
        {pendingSector && <p className="mt-2 text-sm text-lagoon-700" role="status">Your sector choice is ready to review below. Select up to eight sectors, then save to confirm.</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {SECTORS.map((s) => {
            const on = v.sectors.includes(s.slug as MemberProfileInputSectorsItem);
            return (
              <button key={s.slug} type="button" aria-pressed={on} onClick={() => toggleSector(s.slug as MemberProfileInputSectorsItem)} data-testid={`toggle-sector-${s.slug}`}
                disabled={!on && v.sectors.length >= 8}
                className={`border px-3 py-2 text-xs uppercase tracking-wider transition-colors disabled:opacity-40 ${on ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-lagoon-600'}`}>
                {s.name}
              </button>
            );
          })}
        </div>
        {err('sectors')}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-eyebrow text-gold-700">OPTIONAL DETAILS</legend>
        <p className="text-sm leading-relaxed text-ink-700 sm:col-span-2">Choose what belongs on your page. All details below are optional: leave a field empty, or clear it and save, to hide it from your profile. You control public visibility and photos separately below.</p>
        <label className="text-sm text-ink-900">Organization
          <input className={`${fieldCls} mt-1`} value={v.organization} maxLength={150} onChange={(e) => set('organization', e.target.value)} data-testid="input-organization" />
        </label>
        <label className="text-sm text-ink-900">Country
          <input className={`${fieldCls} mt-1`} value={v.country} maxLength={100} onChange={(e) => set('country', e.target.value)} data-testid="input-country" />
        </label>
        <label className="text-sm text-ink-900 sm:col-span-2">Short bio
          <textarea className={`${fieldCls} mt-1 min-h-24`} value={v.bio} maxLength={1000} onChange={(e) => set('bio', e.target.value)} data-testid="input-bio" />
        </label>
        <label className="text-sm text-ink-900">What you can offer
          <textarea className={`${fieldCls} mt-1 min-h-20`} value={v.offering} maxLength={500} onChange={(e) => set('offering', e.target.value)} data-testid="input-offering" />
        </label>
        <label className="text-sm text-ink-900">What you are looking for
          <textarea className={`${fieldCls} mt-1 min-h-20`} value={v.lookingFor} maxLength={500} onChange={(e) => set('lookingFor', e.target.value)} data-testid="input-lookingFor" />
        </label>
        <label className="text-sm text-ink-900 sm:col-span-2">Website
          <input className={`${fieldCls} mt-1`} type="url" value={v.website} maxLength={500} placeholder="https://" onChange={(e) => set('website', e.target.value)} data-testid="input-website" />{err('website')}
        </label>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-eyebrow text-gold-700">SOCIAL PROFILES</legend>
        <p className="text-sm leading-relaxed text-ink-700 sm:col-span-2">Add your profile links. These links appear on your member profile and, if you make it public, on your public page. They do not connect your accounts or import posts. Clear a field and save to remove a link.</p>
        {SOCIAL_PROFILES.map(({ field, name, placeholder }) => (
          <label key={field} className="text-sm text-ink-900">{name}
            <input className={`${fieldCls} mt-1`} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" value={v[field] ?? ''} maxLength={500} placeholder={placeholder} onChange={(e) => set(field, e.target.value)} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `error-${field}` : undefined} data-testid={`input-${field}`} />
            {errors[field] && <span id={`error-${field}`} className="mt-1 block text-xs text-crimson-700" role="alert">{errors[field]}</span>}
          </label>
        ))}
      </fieldset>

      <div className="border border-gold-500/40 bg-ivory-200/50 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={v.isPublic} onChange={(e) => setV((p) => ({ ...p, isPublic: e.target.checked, publicMedia: e.target.checked ? p.publicMedia : false }))} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)]" data-testid="checkbox-isPublic" />
          <span>
            <span className="block text-sm font-semibold text-ink-900">Make my profile public (directory and shareable link)</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-700">
               Off by default. If on, anyone, including people without an account, can see your name, profession, organization, country, bio, offering, looking for, website and sectors at your public profile link. Your photo and cover remain private unless you choose the option below. Your posts, comments, messages, email and saved items are never shown publicly. Switch this off at any time and the public link stops working.
            </span>
          </span>
        </label>
        <label className="mt-3 flex cursor-pointer items-start gap-3 border-t border-gold-500/20 pt-3">
          <input type="checkbox" checked={v.publicMedia} disabled={!v.isPublic} onChange={(e) => set('publicMedia', e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)] disabled:opacity-50" data-testid="checkbox-publicMedia" />
          <span className="text-sm text-ink-800">Also show my network photo and cover to anyone visiting my public profile. This is off until I explicitly opt in.</span>
        </label>
      </div>

      {save.isError && (
        <div className="flex flex-wrap items-center gap-3 border border-crimson-700/30 bg-crimson-700/5 p-4" role="alert">
          <p className="text-sm text-crimson-700">Your profile could not be saved. Check your connection and try again.</p>
          <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-crimson-700 underline" data-testid="button-retry-save">Retry</button>
        </div>
      )}
      {syncError && <p role="alert" className="text-sm text-crimson-700">We could not confirm the updated profile view. Your draft is still here; please retry saving.</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={save.isPending || synchronizing} data-testid="button-save-profile"
          className="inline-flex items-center gap-2 bg-lagoon-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-100 hover:bg-lagoon-800 disabled:opacity-60">
          {(save.isPending || synchronizing) && <Loader2 className="h-4 w-4 animate-spin" />} {initial ? 'Save changes' : 'Save profile'}
        </button>
        {onCancel && (
          <button type="button" disabled={save.isPending || synchronizing} onClick={onCancel} data-testid="button-cancel-edit" className="px-4 py-3 text-xs uppercase tracking-wider text-ink-700 hover:text-ink-900 disabled:opacity-60">Cancel</button>
        )}
      </div>
    </form>
  );
}
