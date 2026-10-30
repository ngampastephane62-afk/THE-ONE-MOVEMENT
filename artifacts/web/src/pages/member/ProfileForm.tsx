import { useEffect, useRef, useState, type FormEvent } from 'react';
import AppearanceControls from './AppearanceControls';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  useSaveMemberProfile,
  type MemberProfile,
  type MemberProfileInput,
  type MemberProfileInputSectorsItem,
  type MemberProfileInputActiveSectorsItem,
} from '@workspace/api-client-react';
import { SECTORS } from '@/lib/sectors-data';
import { useAuth, useUser } from '@clerk/react';
import { MAX_PROFILE_SECTORS, recommendSectors } from '@/lib/sector-recommendations';
import { getPendingSector, clearPendingSector } from '@/lib/network-invitations';
import { SOCIAL_PROFILES, normalizeSocialProfile, ACTIVE_SECTOR_LIMIT, activeSectorIssue } from '@workspace/shared';
import { profileInput, reconcileProfile, synchronizeProfile } from './profile-sync';

interface Props {
  initial: MemberProfile | null;
  defaultName: string;
  onDone?: (hasNewerEdits: boolean) => void;
  onCancel?: () => void;
  appearance?: boolean;
  onDraft?: (v: MemberProfileInput) => void;
  /** First-time / completion setup: requires the existing fullName, profession, country and sectors fields. */
  onboarding?: boolean;
}

type Errors = Partial<Record<keyof MemberProfileInput, string>>;

function validate(v: MemberProfileInput, onboarding = false): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Enter at least 2 characters.';
  if (v.sectors.length > MAX_PROFILE_SECTORS) e.sectors = `Choose up to ${MAX_PROFILE_SECTORS} sectors.`;
  const issue = activeSectorIssue({ mainSector: v.mainSector, activeSectors: v.activeSectors });
  if (issue) e.activeSectors = issue;
  if (onboarding) {
    if (!v.mainSector && !v.activeSectors?.length && !v.sectors.length) e.mainSector = 'Choose your primary sector.';
    if (v.profession.trim().length < 2) e.profession = 'Add your profession or role.';
    if (v.country.trim().length < 2) e.country = 'Add your country.';
  }
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

export default function ProfileForm({ initial, defaultName, onDone, onCancel, appearance, onDraft, onboarding = false }: Props) {
  const { userId } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const [savedAt, setSavedAt] = useState<number | null>(null);
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
  type Active = MemberProfileInputActiveSectorsItem;
  const [replaceFor, setReplaceFor] = useState<Active | null>(null);
  const chooseMain = (slug: Active | '') => {
    setReplaceFor(null);
    if (!slug) return;
    const active = latest.current.activeSectors;
    if (!active) return setV((p) => ({ ...p, mainSector: slug, activeSectors: [slug] }));
    if (active.includes(slug)) return setV((p) => ({ ...p, mainSector: slug }));
    if (active.length < ACTIVE_SECTOR_LIMIT) return setV((p) => ({ ...p, mainSector: slug, activeSectors: [slug, ...active] }));
    setReplaceFor(slug); // explicit decision required; nothing is dropped silently
  };
  const replaceActive = (out: Active) => {
    if (!replaceFor) return;
    const nextMain = replaceFor;
    setV((p) => ({ ...p, mainSector: nextMain, activeSectors: [nextMain, ...(p.activeSectors ?? []).filter((a) => a !== out && a !== nextMain)] }));
    setReplaceFor(null);
  };
  const toggleActive = (slug: Active) => setV((p) => {
    const a = p.activeSectors ?? [];
    if (slug === p.mainSector) return p;
    return { ...p, activeSectors: a.includes(slug) ? a.filter((x) => x !== slug) : a.length < ACTIVE_SECTOR_LIMIT ? [...a, slug] : a };
  });
  const toggleSector = (slug: MemberProfileInputSectorsItem) =>
    set('sectors', v.sectors.includes(slug) ? v.sectors.filter((s) => s !== slug) : [...v.sectors, slug]);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (saving.current) return;
    const submitted = latest.current;
    const payload: MemberProfileInput = {
      ...submitted,
      fullName: submitted.fullName.trim(), profession: submitted.profession.trim(), organization: submitted.organization.trim(),
      cityRegion: (submitted.cityRegion ?? '').trim(), organizationType: (submitted.organizationType ?? '').trim(),
      contactName: (submitted.contactName ?? '').trim(), otherProfessionalActivity: (submitted.otherProfessionalActivity ?? '').trim(),
      country: submitted.country.trim(), bio: submitted.bio.trim(), offering: submitted.offering.trim(), lookingFor: submitted.lookingFor.trim(), website: submitted.website.trim(),
    };
    const e = validate(payload, onboarding);
    setErrors(e);
    if (Object.keys(e).length) return;
    saving.current = true;
    setSynchronizing(true);
    setSyncError(false);
    setSavedAt(null);
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
          setSavedAt(Date.now());
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

  const suggestions = recommendSectors(v.profession, v.sectors);
  const req = (label: string) => onboarding ? <>{label} <span className="text-crimson-700" aria-hidden="true">*</span></> : <>{label} <span className="text-sand-400">(optional)</span></>;
  const err = (k: keyof MemberProfileInput) => errors[k] && <p className="mt-1 text-xs text-crimson-700" role="alert">{errors[k]}</p>;

  const isOrg = v.accountType === 'organization';
  const vis = v.locationVisibility ?? 'hidden';
  const location = (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2" data-testid="group-location">
      <label className="text-sm text-ink-900">City or region <span className="text-sand-400">(optional)</span>
        <input className={`${fieldCls} mt-1`} value={v.cityRegion ?? ''} maxLength={120} placeholder="e.g. Abu Dhabi" onChange={(e) => set('cityRegion', e.target.value)} data-testid="input-cityRegion" />
      </label>
      <fieldset className="text-sm text-ink-900">
        <legend>Who can see my location</legend>
        <div className="mt-1 grid gap-1" role="radiogroup">
          {([['hidden', 'Hidden (default)'], ['country', 'Country only'], ['country_city', 'Country and city or region']] as const).map(([val, lab]) => (
            <label key={val} className="flex min-h-[36px] cursor-pointer items-center gap-2">
              <input type="radio" name="locationVisibility" checked={vis === val} onChange={() => set('locationVisibility', val)} className="accent-[hsl(187_67%_12%)]" data-testid={`radio-location-${val}`} /> {lab}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs leading-relaxed text-ink-700 sm:col-span-2">You always see your saved location here. Other members, and your public page if you make it public, see only what this setting allows.</p>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8" data-testid="form-member-profile">
      {onboarding ? <p className="text-sm leading-relaxed text-ink-700" data-testid="text-profile-completion-guidance">Just four essentials: name, profession or member identity, country and primary sector. After email verification, saving these opens free community participation automatically—no activation button, payment or Founder approval. Add a photo, biography, company and extra sectors later in Settings. Directory listing remains your choice.</p> :
      <p className="text-sm leading-relaxed text-ink-700" data-testid="text-profile-completion-guidance">Update your professional profile at your own pace. A verified basic profile opens ordinary free community participation automatically. Directory listing and public internet visibility remain separate choices.</p>}
      {appearance && <AppearanceControls v={v} set={set} />}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-eyebrow text-gold-700">THE ESSENTIALS</legend>
        {!onboarding && <fieldset className="sm:col-span-2" aria-invalid={!!errors.accountType}>
          <legend className="text-sm text-ink-900">{onboarding ? req('Account type') : 'Account type'}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
            {([['individual', 'Individual'], ['organization', 'Organization']] as const).map(([val, lab]) => (
              <button key={val} type="button" role="radio" aria-checked={v.accountType === val} onClick={() => set('accountType', val)} data-testid={`radio-accountType-${val}`}
                className={`min-h-[44px] border px-4 text-xs uppercase tracking-wider ${v.accountType === val ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-lagoon-600'}`}>{lab}</button>
            ))}
          </div>
          {!v.accountType && !onboarding && <p className="mt-1 text-xs text-ink-700">Not set yet. You can leave this unchanged and still save other details.</p>}
          {err('accountType')}
        </fieldset>}
        <label className="text-sm text-ink-900">{isOrg ? 'Organization display name *' : 'Display name *'}
          <input className={`${fieldCls} mt-1`} value={v.fullName} maxLength={100} onChange={(e) => set('fullName', e.target.value)} data-testid="input-fullName" />{err('fullName')}
          <span className="mt-1 block text-xs text-ink-700">Confirm the name you want members to see, or edit it here. Your chosen name is kept until you change it.</span>
        </label>
        <label className="text-sm text-ink-900">{req('Profession or role')}
          <input className={`${fieldCls} mt-1`} value={v.profession} maxLength={100} placeholder="e.g. Textile designer" onChange={(e) => set('profession', e.target.value)} data-testid="input-profession" aria-invalid={!!errors.profession} />{err('profession')}
        </label>
        {!onboarding && isOrg && <>
          <label className="text-sm text-ink-900">{onboarding ? req('Organization type') : 'Organization type'}
            <input className={`${fieldCls} mt-1`} value={v.organizationType ?? ''} maxLength={100} placeholder="e.g. Foundation, studio, embassy" onChange={(e) => set('organizationType', e.target.value)} data-testid="input-organizationType" aria-invalid={!!errors.organizationType} />{err('organizationType')}
          </label>
          <label className="text-sm text-ink-900">{onboarding ? req('Contact person') : 'Contact person'} <span className="text-sand-400">(private)</span>
            <input className={`${fieldCls} mt-1`} value={v.contactName ?? ''} maxLength={100} onChange={(e) => set('contactName', e.target.value)} data-testid="input-contactName" aria-invalid={!!errors.contactName} />{err('contactName')}
            <span className="mt-1 block text-xs text-ink-700">Kept private. Never shown on your profile or public page.</span>
          </label>
        </>}
        {onboarding && <label className="text-sm text-ink-900">{req('Country')}
          <input className={`${fieldCls} mt-1`} value={v.country} maxLength={100} placeholder="e.g. United Arab Emirates" onChange={(e) => set('country', e.target.value)} data-testid="input-country" aria-invalid={!!errors.country} />{err('country')}
        </label>}
        {email && <div className="text-sm text-ink-900">Account email
          <p className="mt-1 border border-sand-200 bg-ivory-200/60 px-3 py-2.5 text-sm text-ink-700" data-testid="text-account-email">{email}</p>
          <span className="mt-1 block text-xs text-ink-700">From your sign-in account. Change it in account settings, not here.</span>
        </div>}
      </fieldset>

      <fieldset data-testid="group-active-sectors">
        <legend className="text-eyebrow text-gold-700">{onboarding ? 'PRIMARY SECTOR' : 'PRIMARY AND ACTIVE SECTORS'}</legend>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{onboarding ? 'Choose one sector to start. You can add more later. A saved legacy sector already counts toward your basic profile.' : `Choose one primary sector, then up to ${ACTIVE_SECTOR_LIMIT - 1} more active sectors from the same seventeen.`}</p>
        <label className="mt-3 block max-w-sm text-sm text-ink-900">{onboarding ? req('Primary sector') : 'Primary sector'}
          <select className={`${fieldCls} mt-1`} value={v.mainSector ?? ''} onChange={(e) => chooseMain(e.target.value as Active | '')} data-testid="select-mainSector">
            <option value="" disabled={v.mainSector != null}>Choose a sector</option>
            {SECTORS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </label>
        {replaceFor && (
          <div className="mt-3 border border-gold-500/60 bg-gold-500/10 p-3" role="alert" data-testid="panel-replace-active">
            <p className="text-sm text-ink-900">You already have {ACTIVE_SECTOR_LIMIT} active sectors. To make {SECTORS.find((s) => s.slug === replaceFor)?.name} primary, choose which one it replaces:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(v.activeSectors ?? []).map((a) => (
                <button key={a} type="button" onClick={() => replaceActive(a)} className="min-h-[40px] border border-lagoon-900 px-3 text-xs uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-gold-400" data-testid={`button-replace-${a}`}>Replace {SECTORS.find((s) => s.slug === a)?.name}</button>
              ))}
              <button type="button" onClick={() => setReplaceFor(null)} className="min-h-[40px] px-3 text-xs uppercase tracking-wider text-ink-700" data-testid="button-replace-cancel">Keep current</button>
            </div>
          </div>
        )}
        {v.mainSector && !onboarding && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SECTORS.map((s) => {
              const slug = s.slug as Active;
              const on = (v.activeSectors ?? []).includes(slug);
              const main = v.mainSector === slug;
              return (
                <button key={s.slug} type="button" aria-pressed={on} disabled={main || (!on && (v.activeSectors?.length ?? 0) >= ACTIVE_SECTOR_LIMIT)} onClick={() => toggleActive(slug)} data-testid={`toggle-active-${s.slug}`}
                  className={`border px-3 py-2 text-xs uppercase tracking-wider disabled:cursor-default ${main ? 'border-gold-600 bg-gold-500 text-ink-900' : on ? 'border-lagoon-900 bg-lagoon-900 text-gold-400' : 'border-sand-300 text-ink-700 hover:border-lagoon-600 disabled:opacity-40'}`}>
                  {s.name}{main && ' · primary'}
                </button>
              );
            })}
          </div>
        )}
        {err('mainSector')}{err('activeSectors')}
      </fieldset>

      {!onboarding && <>
      <fieldset>
        <legend className="text-eyebrow text-gold-700">YOUR INTERESTS <span className="normal-case tracking-normal text-sand-400">(optional, {v.sectors.length}/{MAX_PROFILE_SECTORS} maximum)</span></legend>
        <p className="mt-2 text-xs text-ink-700">Interests you saved earlier are kept as they are. They do not change your active sectors and nothing is joined automatically.</p>
        {pendingSector && <p className="mt-2 text-sm text-lagoon-700" role="status">Your sector choice is ready to review below. Select up to eight interests, then save to confirm.</p>}
        {suggestions.length > 0 && v.sectors.length < MAX_PROFILE_SECTORS && (
          <div className="mt-3 border-l-2 border-gold-500/60 pl-3" data-testid="panel-sector-suggestions">
            <p className="text-xs text-ink-700">Suggested from what you have entered. Nothing is added unless you select it.</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {suggestions.map(({ sector, reason }) => (
                <li key={sector.slug}>
                  <button type="button" onClick={() => toggleSector(sector.slug as MemberProfileInputSectorsItem)} title={reason} className="border border-dashed border-gold-500 px-3 py-1.5 text-xs uppercase tracking-wider text-gold-700 hover:bg-gold-500/10" data-testid={`button-suggest-sector-${sector.slug}`}>
                    + {sector.name}<span className="sr-only"> — {reason}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {SECTORS.map((s) => {
            const on = v.sectors.includes(s.slug as MemberProfileInputSectorsItem);
            return (
              <button key={s.slug} type="button" aria-pressed={on} onClick={() => toggleSector(s.slug as MemberProfileInputSectorsItem)} data-testid={`toggle-sector-${s.slug}`}
                disabled={!on && v.sectors.length >= MAX_PROFILE_SECTORS}
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
        {!onboarding && <label className="text-sm text-ink-900">Country
          <input className={`${fieldCls} mt-1`} value={v.country} maxLength={100} onChange={(e) => set('country', e.target.value)} data-testid="input-country" />
        </label>}
        {!onboarding && location}
        <label className="text-sm text-ink-900 sm:col-span-2">Other professional activity <span className="text-sand-400">(private)</span>
          <textarea className={`${fieldCls} mt-1 min-h-16`} value={v.otherProfessionalActivity ?? ''} maxLength={300} onChange={(e) => set('otherProfessionalActivity', e.target.value)} data-testid="input-otherProfessionalActivity" />
          <span className="mt-1 block text-xs text-ink-700">Helps TOMI understand your work. Not shown on your profile or public page.</span>
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
               Off by default. If on, anyone, including people without an account, can see your name, profession, organization, bio, offering, looking for, website and sectors at your public profile link. Your country and city appear only as your location setting allows, and your contact person, other professional activity and email are never shown. Your photo and cover are a separate choice below; public page and photos are switched independently. Your posts, comments, messages, email and saved items are never shown publicly. Switch this off at any time and the public link stops working.
            </span>
          </span>
        </label>
        <label className="mt-3 flex cursor-pointer items-start gap-3 border-t border-gold-500/20 pt-3">
          <input type="checkbox" checked={v.publicMedia} disabled={!v.isPublic} onChange={(e) => set('publicMedia', e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(187_67%_12%)] disabled:opacity-50" data-testid="checkbox-publicMedia" />
          <span className="text-sm text-ink-800">Also show my network photo and cover to anyone visiting my public profile. This is off until I explicitly opt in.</span>
        </label>
      </div>

      </>}
      {onboarding && <p className="text-xs text-ink-700">Your existing optional details and privacy choices are preserved. You can edit them in Settings after joining.</p>}
      {save.isError && (
        <div className="flex flex-wrap items-center gap-3 border border-crimson-700/30 bg-crimson-700/5 p-4" role="alert">
          <p className="text-sm text-crimson-700">Your profile could not be saved. Check your connection and try again.</p>
          <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-crimson-700 underline" data-testid="button-retry-save">Retry</button>
        </div>
      )}
      {syncError && <p role="alert" className="text-sm text-crimson-700">We could not confirm the updated profile view. Your draft is still here; please retry saving.</p>}

      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-crimson-700" data-testid="status-profile-errors">Please complete the highlighted fields before saving.</p>}
      {savedAt && !save.isPending && !synchronizing && !syncError && <p role="status" className="inline-flex items-center gap-2 text-sm text-lagoon-700" data-testid="status-profile-saved"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Profile saved and confirmed.</p>}
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
