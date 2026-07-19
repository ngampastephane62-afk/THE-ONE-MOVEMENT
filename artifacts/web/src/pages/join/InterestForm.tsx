import { useState, useRef, useEffect } from 'react';
import { PROGRAMS } from '@/lib/programs-data';
import { SECTORS } from '@/lib/sectors-data';
import ChipSelect from './ChipSelect';
import SelectableProgramCard from './SelectableProgramCard';
import SuccessPanel from './SuccessPanel';
import {
  CONSENT_TEXT,
  getCategoriesForGroup,
  GROUP_LABELS,
} from './join-data';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface FormState {
  fullName: string;
  email: string;
  country: string;
  city: string;
  joiningAs: string;
  audienceGroup: string;
  category: string;
  organizationName: string;
  contactRole: string;
  lookingFor: string;
  notifyOpportunities: boolean;
  consentAccepted: boolean;
  primarySector: string;   // '' = unset (key omitted from payload); non-empty = selected
  sectorSlugs: string[];
  programSlugs: string[];
}

const INITIAL: FormState = {
  fullName: '', email: '', country: '', city: '',
  joiningAs: '', audienceGroup: '', category: '',
  organizationName: '', contactRole: '', lookingFor: '',
  notifyOpportunities: false, consentAccepted: false,
  primarySector: '', sectorSlugs: [], programSlugs: [],
};

const MAX_LEN = {
  fullName: 120, email: 254, country: 90, city: 90,
  organizationName: 160, contactRole: 120, lookingFor: 300,
};

const JOINABLE_GROUPS = ['creative-cultural', 'business-innovation', 'community-impact'] as const;

/* ── Validation ───────────────────────────────────────────────────────────── */

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  const t = (s: string) => s.trim();

  if (!t(f.fullName)) e.fullName = 'Full name is required.';
  else if (t(f.fullName).length > MAX_LEN.fullName) e.fullName = `Full name must be at most ${MAX_LEN.fullName} characters.`;

  if (!t(f.email)) e.email = 'Email address is required.';
  else if (!isEmailValid(t(f.email))) e.email = 'Please enter a valid email address.';
  else if (t(f.email).length > MAX_LEN.email) e.email = 'Email address is too long.';

  if (!t(f.country)) e.country = 'Country is required.';
  else if (t(f.country).length > MAX_LEN.country) e.country = 'Country name is too long.';

  if (t(f.city).length > MAX_LEN.city) e.city = 'City name is too long.';

  if (!f.joiningAs) e.joiningAs = 'Please select how you are joining.';

  if (!f.audienceGroup) e.audienceGroup = 'Please select your path.';

  if (!f.category) e.category = 'Please select your category.';

  if (f.joiningAs === 'organization') {
    if (!t(f.organizationName)) e.organizationName = 'Organization name is required.';
    else if (t(f.organizationName).length > MAX_LEN.organizationName) e.organizationName = 'Organization name is too long.';
    if (!t(f.contactRole)) e.contactRole = 'Your role is required.';
    else if (t(f.contactRole).length > MAX_LEN.contactRole) e.contactRole = 'Role is too long.';
  }

  if (t(f.lookingFor).length > MAX_LEN.lookingFor) e.lookingFor = `Maximum ${MAX_LEN.lookingFor} characters.`;

  if (!f.consentAccepted) e.consentAccepted = 'You must accept the terms to continue.';

  return e;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const inputBase =
  'block w-full rounded-sm border bg-white px-4 py-3 text-sm text-ink-900 ' +
  'placeholder:text-sand-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-lagoon-400 focus:border-lagoon-400 ' +
  'transition-colors duration-150';

const inputError =
  'border-red-400 focus:ring-red-400 focus:border-red-400';

const inputNormal = 'border-sand-300';

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5"
      >
        {label}
        {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
      </label>
      {children}
      <span
        id={`${id}-error`}
        role="alert"
        aria-live="polite"
        className="mt-1.5 block text-xs text-red-700 min-h-[1rem]"
      >
        {error ?? ''}
      </span>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface InterestFormProps {
  /** Audience group pre-selected from PathCard; updates when path changes */
  preselectedGroup: string;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function InterestForm({ preselectedGroup }: InterestFormProps) {
  const [fields, setFields] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');
  const [successStatus, setSuccessStatus] = useState<'received' | 'updated'>('received');

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // Pre-select audience group when PathCard changes
  useEffect(() => {
    if (preselectedGroup) {
      setFields((prev) => ({ ...prev, audienceGroup: preselectedGroup, category: '' }));
      setErrors((prev) => ({ ...prev, audienceGroup: '', category: '' }));
    }
  }, [preselectedGroup]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function setGroup(group: string) {
    setFields((prev) => ({ ...prev, audienceGroup: group, category: '' }));
    setErrors((prev) => ({ ...prev, audienceGroup: '', category: '' }));
  }

  function setJoiningAs(value: string) {
    setFields((prev) => ({
      ...prev,
      joiningAs: value,
      organizationName: '',
      contactRole: '',
    }));
    setErrors((prev) => ({ ...prev, joiningAs: '', organizationName: '', contactRole: '' }));
  }

  /**
   * Toggle a primary sector selection.
   * - If slug is already primary → clears it (sets to '').
   * - If slug is new → sets it AND silently removes it from sectorSlugs
   *   (client-side guard that mirrors the server's duplicate-rejection rule).
   */
  function setPrimarySector(slug: string) {
    const isToggleOff = fields.primarySector === slug;
    const newPrimary = isToggleOff ? '' : slug;
    setFields((prev) => ({
      ...prev,
      primarySector: newPrimary,
      sectorSlugs: isToggleOff
        ? prev.sectorSlugs
        : prev.sectorSlugs.filter((s) => s !== slug),
    }));
    if (errors.primarySector) setErrors((prev) => ({ ...prev, primarySector: '' }));
  }

  /**
   * Keyboard navigation for the primary sector radiogroup (roving tabindex).
   * Arrow keys move DOM focus; Enter/Space toggles selection on the focused item.
   */
  function handlePrimaryRadioKeyDown(e: React.KeyboardEvent, idx: number) {
    const total = SECTORS.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % total;
      const radios = radioGroupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      radios?.[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + total) % total;
      const radios = radioGroupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      radios?.[prevIdx]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPrimarySector(SECTORS[idx].slug);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiMessage('');

    const newErrors = validate(fields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setStatus('submitting');

    try {
      const payload: Record<string, unknown> = {
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        country: fields.country.trim(),
        joiningAs: fields.joiningAs,
        audienceGroup: fields.audienceGroup,
        category: fields.category,
        consentAccepted: true,
        notifyOpportunities: fields.notifyOpportunities,
      };
      if (fields.city.trim()) payload.city = fields.city.trim();
      if (fields.joiningAs === 'organization') {
        payload.organizationName = fields.organizationName.trim();
        payload.contactRole = fields.contactRole.trim();
      }
      // primarySector: only include key when non-empty (empty = omit = server keeps existing value)
      if (fields.primarySector) payload.primarySector = fields.primarySector;
      if (fields.sectorSlugs.length > 0) payload.sectorSlugs = fields.sectorSlugs;
      if (fields.programSlugs.length > 0) payload.programSlugs = fields.programSlugs;
      if (fields.lookingFor.trim()) payload.lookingFor = fields.lookingFor.trim();

      const res = await fetch('/api/join-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json();
      const json = data as {
        success?: boolean;
        status?: string;
        submissionId?: number;
        error?: { code?: string; message?: string; fields?: Record<string, string> };
      };

      if (res.ok && json.success) {
        setSuccessStatus(
          json.status === 'updated' ? 'updated' : 'received',
        );
        setStatus('success');
        return;
      }

      if (json.error?.fields && Object.keys(json.error.fields).length > 0) {
        setErrors(json.error.fields);
        setStatus('error');
        requestAnimationFrame(() => errorSummaryRef.current?.focus());
        return;
      }

      setApiMessage(
        json.error?.message ?? 'An unexpected error occurred. Please try again.',
      );
      setStatus('error');
    } catch {
      setApiMessage('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  }

  // Show success panel after confirmed backend response
  if (status === 'success') {
    return <SuccessPanel submissionStatus={successStatus} />;
  }

  const isOrg = fields.joiningAs === 'organization';
  const categoryOptions = fields.audienceGroup
    ? getCategoriesForGroup(fields.audienceGroup)
    : [];

  // Exclude the primary sector from the additional-sectors ChipSelect options
  const sectorOptions = SECTORS
    .filter((s) => s.slug !== fields.primarySector)
    .map((s) => ({ slug: s.slug, label: s.name }));

  // Roving tabindex: the selected radio (or first if none) is in the tab sequence
  const primaryRadioIdx = SECTORS.findIndex((s) => s.slug === fields.primarySector);
  const activeRadioIdx = primaryRadioIdx >= 0 ? primaryRadioIdx : 0;

  const hasErrors = Object.values(errors).some(Boolean);
  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Expression of interest form">
      {/* ── Error summary ──────────────────────────────────────────────── */}
      {hasErrors && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-8 rounded-sm border border-red-300 bg-red-50 p-5 focus:outline-none"
        >
          <p className="text-sm font-semibold text-red-700 mb-2">
            Please correct the following before submitting:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(errors)
              .filter(Boolean)
              .map((msg, i) => (
                <li key={i} className="text-sm text-red-700">
                  {msg}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ── API-level message (rate limit / server error) ────────────── */}
      {apiMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-8 rounded-sm border border-amber-300 bg-amber-50 p-4"
        >
          <p className="text-sm text-amber-800">{apiMessage}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* ── Personal information ─────────────────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Your Information
          </legend>

          <Field id="fullName-input" label="Full Name" error={errors.fullName} required>
            <input
              id="fullName-input"
              type="text"
              name="fullName"
              autoComplete="name"
              maxLength={MAX_LEN.fullName}
              value={fields.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.fullName}
              aria-describedby="fullName-input-error"
              className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
              placeholder="Your full name"
            />
          </Field>

          <Field id="email-input" label="Email Address" error={errors.email} required>
            <input
              id="email-input"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={MAX_LEN.email}
              value={fields.email}
              onChange={(e) => setField('email', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby="email-input-error"
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              placeholder="your@email.com"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="country-input" label="Country" error={errors.country} required>
              <input
                id="country-input"
                type="text"
                name="country"
                autoComplete="country-name"
                maxLength={MAX_LEN.country}
                value={fields.country}
                onChange={(e) => setField('country', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.country}
                aria-describedby="country-input-error"
                className={`${inputBase} ${errors.country ? inputError : inputNormal}`}
                placeholder="Country"
              />
            </Field>

            <Field id="city-input" label="City" error={errors.city}>
              <input
                id="city-input"
                type="text"
                name="city"
                autoComplete="address-level2"
                maxLength={MAX_LEN.city}
                value={fields.city}
                onChange={(e) => setField('city', e.target.value)}
                aria-invalid={!!errors.city}
                aria-describedby="city-input-error"
                className={`${inputBase} ${errors.city ? inputError : inputNormal}`}
                placeholder="City (optional)"
              />
            </Field>
          </div>
        </fieldset>

        {/* ── Joining As ────────────────────────────────────────────── */}
        <fieldset>
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Joining As <span className="text-red-600" aria-hidden="true">*</span>
          </legend>

          <div className="flex gap-3" role="group" aria-label="Select how you are joining">
            {[
              { value: 'individual', label: 'Individual' },
              { value: 'organization', label: 'Organization' },
            ].map(({ value, label }) => {
              const pressed = fields.joiningAs === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setJoiningAs(value)}
                  className={[
                    'flex-1 py-3 px-4 rounded-sm text-sm font-semibold tracking-wide transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-400 focus-visible:ring-offset-1',
                    pressed
                      ? 'border border-lagoon-500 bg-lagoon-500/10 text-lagoon-700'
                      : 'border border-sand-300 text-ink-600 hover:border-lagoon-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.joiningAs && (
            <p role="alert" className="mt-1.5 text-xs text-red-700">
              {errors.joiningAs}
            </p>
          )}
        </fieldset>

        {/* ── Path & Category ───────────────────────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Your Path & Category <span className="text-red-600" aria-hidden="true">*</span>
          </legend>

          {/* Audience group selection */}
          <div>
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">
              Path <span className="text-red-600" aria-hidden="true">*</span>
            </p>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              role="group"
              aria-label="Select your path"
            >
              {JOINABLE_GROUPS.map((group) => {
                const pressed = fields.audienceGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setGroup(group)}
                    className={[
                      'py-3 px-4 rounded-sm text-xs font-semibold tracking-wide text-left transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-400 focus-visible:ring-offset-1',
                      pressed
                        ? 'border border-lagoon-500 bg-lagoon-500/10 text-lagoon-700'
                        : 'border border-sand-300 text-ink-600 hover:border-lagoon-400',
                    ].join(' ')}
                  >
                    {GROUP_LABELS[group]}
                  </button>
                );
              })}
            </div>
            {errors.audienceGroup && (
              <p role="alert" className="mt-1.5 text-xs text-red-700">
                {errors.audienceGroup}
              </p>
            )}
          </div>

          {/* Category */}
          <Field id="category-select" label="Category" error={errors.category} required>
            <select
              id="category-select"
              name="category"
              disabled={!fields.audienceGroup}
              value={fields.category}
              onChange={(e) => setField('category', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.category}
              aria-describedby="category-select-error"
              className={[
                inputBase,
                errors.category ? inputError : inputNormal,
                'appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              <option value="">
                {fields.audienceGroup ? 'Select your category' : 'Select a path first'}
              </option>
              {categoryOptions.map(({ slug, label }) => (
                <option key={slug} value={slug}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        {/* ── Organization details (conditional) ────────────────────── */}
        {isOrg && (
          <fieldset className="space-y-5">
            <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
              Organization Details
            </legend>

            <Field id="orgName-input" label="Organization Name" error={errors.organizationName} required>
              <input
                id="orgName-input"
                type="text"
                name="organizationName"
                maxLength={MAX_LEN.organizationName}
                value={fields.organizationName}
                onChange={(e) => setField('organizationName', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.organizationName}
                aria-describedby="orgName-input-error"
                className={`${inputBase} ${errors.organizationName ? inputError : inputNormal}`}
                placeholder="Full legal name of your organization"
              />
            </Field>

            <Field id="contactRole-input" label="Your Role" error={errors.contactRole} required>
              <input
                id="contactRole-input"
                type="text"
                name="contactRole"
                maxLength={MAX_LEN.contactRole}
                value={fields.contactRole}
                onChange={(e) => setField('contactRole', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.contactRole}
                aria-describedby="contactRole-input-error"
                className={`${inputBase} ${errors.contactRole ? inputError : inputNormal}`}
                placeholder="Your position or title"
              />
            </Field>
          </fieldset>
        )}

        {/* ── Sector Interests ─────────────────────────────────────── */}
        <fieldset>
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Sector Interests <span className="text-ink-400 font-normal normal-case">(optional)</span>
          </legend>

          {/* PRIMARY SECTOR — single-select radiogroup (identity, not filter) */}
          <div className="mb-7">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
                  Primary Sector
                </p>
                <p className="text-xs text-ink-400 mt-0.5">
                  Optional — Select the sector that best defines you
                </p>
              </div>
              {fields.primarySector && (
                <button
                  type="button"
                  onClick={() => setPrimarySector(fields.primarySector)}
                  className={[
                    'shrink-0 text-xs text-ink-400 underline hover:text-ink-600 transition-colors mt-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-400 rounded-sm',
                  ].join(' ')}
                  aria-label="Clear primary sector selection"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={radioGroupRef}
              role="radiogroup"
              aria-label="Primary sector — select one that best defines you"
              aria-describedby={errors.primarySector ? 'primarySector-error' : undefined}
              className="flex flex-wrap gap-2"
            >
              {SECTORS.map((sector, idx) => {
                const isSelected = fields.primarySector === sector.slug;
                return (
                  <button
                    key={sector.slug}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={idx === activeRadioIdx ? 0 : -1}
                    onKeyDown={(e) => handlePrimaryRadioKeyDown(e, idx)}
                    onClick={() => setPrimarySector(sector.slug)}
                    className={[
                      'min-h-[44px] px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1',
                      isSelected
                        ? 'border border-gold-500 bg-gold-500/10 text-gold-900'
                        : 'border border-sand-300 text-ink-600 hover:border-gold-400 hover:text-ink-800',
                    ].join(' ')}
                  >
                    {sector.name}
                  </button>
                );
              })}
            </div>

            {errors.primarySector && (
              <p
                id="primarySector-error"
                role="alert"
                aria-live="polite"
                className="mt-1.5 text-xs text-red-700"
              >
                {errors.primarySector}
              </p>
            )}
          </div>

          {/* ADDITIONAL SECTORS — multi-select chips (up to 5, minus primary) */}
          <div>
            <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-0.5">
              Additional Sectors of Interest
            </p>
            <p className="text-xs text-ink-400 mb-3">
              Optional — Up to 5 additional
            </p>
            <ChipSelect
              id="sector-chips"
              options={sectorOptions}
              selected={fields.sectorSlugs}
              max={5}
              onChange={(next) => setField('sectorSlugs', next)}
            />
            {errors.sectorSlugs && (
              <p
                id="sectorSlugs-error"
                role="alert"
                aria-live="polite"
                className="mt-1.5 text-xs text-red-700"
              >
                {errors.sectorSlugs}
              </p>
            )}
          </div>
        </fieldset>

        {/* ── Program interests ─────────────────────────────────────── */}
        <fieldset>
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Program Interests <span className="text-ink-400 font-normal normal-case">(optional)</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROGRAMS.map((program) => (
              <SelectableProgramCard
                key={program.slug}
                program={program}
                isSelected={fields.programSlugs.includes(program.slug)}
                onToggle={(slug) => {
                  const next = fields.programSlugs.includes(slug)
                    ? fields.programSlugs.filter((s) => s !== slug)
                    : [...fields.programSlugs, slug];
                  setField('programSlugs', next);
                }}
              />
            ))}
          </div>
        </fieldset>

        {/* ── Additional ────────────────────────────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Additional <span className="text-ink-400 font-normal normal-case">(optional)</span>
          </legend>

          {/* Notify me */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="notify-checkbox"
              type="checkbox"
              checked={fields.notifyOpportunities}
              onChange={(e) => setField('notifyOpportunities', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-sm border-sand-300 text-lagoon-500 focus:ring-lagoon-400 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-ink-700 leading-snug">
              Notify me when the Opportunities Hub opens.
            </span>
          </label>

          {/* Looking For */}
          <Field
            id="lookingFor-textarea"
            label={`What are you looking for? (${fields.lookingFor.length} / ${MAX_LEN.lookingFor})`}
            error={errors.lookingFor}
          >
            <textarea
              id="lookingFor-textarea"
              name="lookingFor"
              rows={4}
              maxLength={MAX_LEN.lookingFor}
              value={fields.lookingFor}
              onChange={(e) => setField('lookingFor', e.target.value)}
              aria-invalid={!!errors.lookingFor}
              aria-describedby="lookingFor-textarea-error"
              className={[
                inputBase,
                'resize-none',
                errors.lookingFor ? inputError : inputNormal,
              ].join(' ')}
              placeholder="Tell us what you are looking for in the Movement — collaborations, opportunities, connections, visibility…"
            />
          </Field>
        </fieldset>

        {/* ── Consent ───────────────────────────────────────────────── */}
        <fieldset>
          <legend className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 pb-2 border-b border-sand-200 w-full">
            Consent <span className="text-red-600" aria-hidden="true">*</span>
          </legend>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={fields.consentAccepted}
              onChange={(e) => {
                setField('consentAccepted', e.target.checked);
              }}
              aria-required="true"
              aria-invalid={!!errors.consentAccepted}
              aria-describedby="consent-error"
              className="mt-0.5 h-4 w-4 rounded-sm border-sand-300 text-lagoon-500 focus:ring-lagoon-400 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-ink-700 leading-relaxed">
              {CONSENT_TEXT}
            </span>
          </label>

          {errors.consentAccepted && (
            <p id="consent-error" role="alert" className="mt-2 text-xs text-red-700">
              {errors.consentAccepted}
            </p>
          )}

          <p className="mt-4 text-xs text-sand-400 leading-relaxed">
            We collect only what we need. You can request deletion of your information at any time.{' '}
            <a href="/privacy-policy" className="underline hover:text-ink-600 transition-colors">
              Privacy Policy
            </a>
          </p>
        </fieldset>

        {/* ── Submit ────────────────────────────────────────────────── */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className={[
              'w-full sm:w-auto min-w-[14rem] inline-flex items-center justify-center',
              'rounded-sm px-8 py-4 text-sm font-semibold tracking-wide',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
              isSubmitting
                ? 'opacity-60 cursor-not-allowed bg-gold-500 text-ink-900 border border-gold-600'
                : 'bg-gold-500 text-ink-900 border border-gold-600 hover:bg-gold-400 active:bg-gold-600',
            ].join(' ')}
          >
            {isSubmitting ? 'Submitting…' : 'EXPRESS YOUR INTEREST'}
          </button>
        </div>
      </div>
    </form>
  );
}
