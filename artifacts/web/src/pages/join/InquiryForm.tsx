import { useState } from 'react';
import { CONSENT_TEXT, ORG_TYPE_OPTIONS } from './join-data';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface InquiryState {
  organizationName: string;
  organizationType: string;
  country: string;
  city: string;
  website: string;
  contactName: string;
  contactRole: string;
  email: string;
  message: string;
  consentAccepted: boolean;
}

const INITIAL: InquiryState = {
  organizationName: '', organizationType: '', country: '', city: '',
  website: '', contactName: '', contactRole: '', email: '', message: '',
  consentAccepted: false,
};

const MAX_LEN = {
  organizationName: 160, organizationType: 60, country: 90, city: 90,
  website: 200, contactName: 120, contactRole: 120, email: 254, message: 1000,
};

/* ── Validation ───────────────────────────────────────────────────────────── */

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isWebsiteValid(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validate(f: InquiryState): Record<string, string> {
  const e: Record<string, string> = {};
  const t = (s: string) => s.trim();

  if (!t(f.organizationName)) e.organizationName = 'Organization name is required.';
  else if (t(f.organizationName).length > MAX_LEN.organizationName) e.organizationName = 'Organization name is too long.';

  if (!f.organizationType) e.organizationType = 'Please select an organization type.';

  if (!t(f.country)) e.country = 'Country is required.';
  else if (t(f.country).length > MAX_LEN.country) e.country = 'Country name is too long.';

  if (t(f.city).length > MAX_LEN.city) e.city = 'City name is too long.';

  if (t(f.website) && !isWebsiteValid(t(f.website)))
    e.website = 'Please enter a valid website URL (must start with http:// or https://).';
  else if (t(f.website).length > MAX_LEN.website) e.website = 'Website URL is too long.';

  if (!t(f.contactName)) e.contactName = 'Contact person name is required.';
  else if (t(f.contactName).length > MAX_LEN.contactName) e.contactName = 'Name is too long.';

  if (!t(f.contactRole)) e.contactRole = 'Role is required.';
  else if (t(f.contactRole).length > MAX_LEN.contactRole) e.contactRole = 'Role is too long.';

  if (!t(f.email)) e.email = 'Email address is required.';
  else if (!isEmailValid(t(f.email))) e.email = 'Please enter a valid email address.';
  else if (t(f.email).length > MAX_LEN.email) e.email = 'Email address is too long.';

  if (!t(f.message)) e.message = 'Message is required.';
  else if (t(f.message).length > MAX_LEN.message) e.message = `Message must be at most ${MAX_LEN.message} characters.`;

  if (!f.consentAccepted) e.consentAccepted = 'You must accept the terms to continue.';

  return e;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const inputBase =
  'block w-full rounded-sm border bg-lagoon-800/30 px-4 py-3 text-sm text-ivory-100 ' +
  'placeholder:text-ivory-400/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 ' +
  'transition-colors duration-150';

const inputError = 'border-red-400 focus:ring-red-400 focus:border-red-400';
const inputNormal = 'border-lagoon-700/60';

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
        className="block text-xs font-semibold text-ivory-200 uppercase tracking-wide mb-1.5"
      >
        {label}
        {required && <span className="ml-1 text-red-400" aria-hidden="true">*</span>}
      </label>
      {children}
      <span
        id={`${id}-error`}
        role="alert"
        aria-live="polite"
        className="mt-1.5 block text-xs text-red-400 min-h-[1rem]"
      >
        {error ?? ''}
      </span>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function InquiryForm() {
  const [fields, setFields] = useState<InquiryState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');

  function setField<K extends keyof InquiryState>(key: K, value: InquiryState[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiMessage('');

    const newErrors = validate(fields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('submitting');

    try {
      const payload: Record<string, unknown> = {
        organizationName: fields.organizationName.trim(),
        organizationType: fields.organizationType,
        country: fields.country.trim(),
        contactName: fields.contactName.trim(),
        contactRole: fields.contactRole.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        consentAccepted: true,
      };
      if (fields.city.trim()) payload.city = fields.city.trim();
      if (fields.website.trim()) payload.website = fields.website.trim();

      const res = await fetch('/api/institutional-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json();
      const json = data as {
        success?: boolean;
        error?: { code?: string; message?: string; fields?: Record<string, string> };
      };

      if (res.ok && json.success) {
        setStatus('success');
        return;
      }

      if (json.error?.fields && Object.keys(json.error.fields).length > 0) {
        setErrors(json.error.fields);
        setStatus('error');
        return;
      }

      // Rate limit (429) or server error — generic message, never discloses prior count
      setApiMessage(
        res.status === 429
          ? 'Too many requests from this address. Please try again later.'
          : (json.error?.message ?? 'An unexpected error occurred. Please try again.'),
      );
      setStatus('error');
    } catch {
      setApiMessage('Unable to reach the server. Please check your connection and try again.');
      setStatus('error');
    }
  }

  // Success state — replaces form
  if (status === 'success') {
    return (
      <div
        className="text-center flex flex-col items-center gap-5 rounded-sm -mx-8 -my-8 px-8 py-14 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, hsl(187 55% 14%) 0%, hsl(187 50% 18%) 100%)',
          borderTop: '3px solid hsl(43 80% 60%)',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-gold-400 text-eyebrow">INQUIRY RECEIVED</p>
        <h3
          className="text-display-md font-display text-ivory-100"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          YOUR INQUIRY HAS BEEN RECEIVED.
        </h3>
        <p className="text-ivory-200 leading-relaxed max-w-md">
          Our team will contact you directly.
        </p>
      </div>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);
  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Institutional inquiry form">
      {/* Error summary */}
      {hasErrors && (
        <div
          role="alert"
          className="mb-8 rounded-sm border border-red-500/50 bg-red-900/20 p-5"
        >
          <p className="text-sm font-semibold text-red-300 mb-2">
            Please correct the following:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(errors)
              .filter(Boolean)
              .map((msg, i) => (
                <li key={i} className="text-sm text-red-300">{msg}</li>
              ))}
          </ul>
        </div>
      )}

      {apiMessage && (
        <div role="alert" aria-live="polite" className="mb-8 rounded-sm border border-amber-500/30 bg-amber-900/20 p-4">
          <p className="text-sm text-amber-300">{apiMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Organization */}
        <fieldset className="space-y-5">
          <legend className="text-xs font-semibold text-ivory-300 uppercase tracking-widest mb-4 pb-2 border-b border-lagoon-700/50 w-full">
            Organization
          </legend>

          <Field id="inq-orgName" label="Organization Name" error={errors.organizationName} required>
            <input
              id="inq-orgName"
              type="text"
              maxLength={MAX_LEN.organizationName}
              value={fields.organizationName}
              onChange={(e) => setField('organizationName', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.organizationName}
              aria-describedby="inq-orgName-error"
              className={`${inputBase} ${errors.organizationName ? inputError : inputNormal}`}
              placeholder="Full legal name"
            />
          </Field>

          <Field id="inq-orgType" label="Organization Type" error={errors.organizationType} required>
            <select
              id="inq-orgType"
              value={fields.organizationType}
              onChange={(e) => setField('organizationType', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.organizationType}
              aria-describedby="inq-orgType-error"
              className={[
                inputBase,
                'appearance-none cursor-pointer',
                errors.organizationType ? inputError : inputNormal,
              ].join(' ')}
            >
              <option value="">Select type</option>
              {ORG_TYPE_OPTIONS.map(({ slug, label }) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="inq-country" label="Country" error={errors.country} required>
              <input
                id="inq-country"
                type="text"
                maxLength={MAX_LEN.country}
                value={fields.country}
                onChange={(e) => setField('country', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.country}
                aria-describedby="inq-country-error"
                className={`${inputBase} ${errors.country ? inputError : inputNormal}`}
                placeholder="Country"
              />
            </Field>

            <Field id="inq-city" label="City" error={errors.city}>
              <input
                id="inq-city"
                type="text"
                maxLength={MAX_LEN.city}
                value={fields.city}
                onChange={(e) => setField('city', e.target.value)}
                aria-invalid={!!errors.city}
                aria-describedby="inq-city-error"
                className={`${inputBase} ${errors.city ? inputError : inputNormal}`}
                placeholder="City (optional)"
              />
            </Field>
          </div>

          <Field id="inq-website" label="Website" error={errors.website}>
            <input
              id="inq-website"
              type="url"
              maxLength={MAX_LEN.website}
              value={fields.website}
              onChange={(e) => setField('website', e.target.value)}
              aria-invalid={!!errors.website}
              aria-describedby="inq-website-error"
              className={`${inputBase} ${errors.website ? inputError : inputNormal}`}
              placeholder="https://your-organization.org (optional)"
            />
          </Field>
        </fieldset>

        {/* Contact person */}
        <fieldset className="space-y-5">
          <legend className="text-xs font-semibold text-ivory-300 uppercase tracking-widest mb-4 pb-2 border-b border-lagoon-700/50 w-full">
            Contact Person
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="inq-contactName" label="Full Name" error={errors.contactName} required>
              <input
                id="inq-contactName"
                type="text"
                maxLength={MAX_LEN.contactName}
                value={fields.contactName}
                onChange={(e) => setField('contactName', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.contactName}
                aria-describedby="inq-contactName-error"
                className={`${inputBase} ${errors.contactName ? inputError : inputNormal}`}
                placeholder="Contact person's name"
              />
            </Field>

            <Field id="inq-contactRole" label="Role / Title" error={errors.contactRole} required>
              <input
                id="inq-contactRole"
                type="text"
                maxLength={MAX_LEN.contactRole}
                value={fields.contactRole}
                onChange={(e) => setField('contactRole', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.contactRole}
                aria-describedby="inq-contactRole-error"
                className={`${inputBase} ${errors.contactRole ? inputError : inputNormal}`}
                placeholder="Position or title"
              />
            </Field>
          </div>

          <Field id="inq-email" label="Email Address" error={errors.email} required>
            <input
              id="inq-email"
              type="email"
              maxLength={MAX_LEN.email}
              value={fields.email}
              onChange={(e) => setField('email', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby="inq-email-error"
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              placeholder="contact@organization.org"
            />
          </Field>
        </fieldset>

        {/* Message */}
        <Field
          id="inq-message"
          label={`Message (${fields.message.length} / ${MAX_LEN.message})`}
          error={errors.message}
          required
        >
          <textarea
            id="inq-message"
            rows={5}
            maxLength={MAX_LEN.message}
            value={fields.message}
            onChange={(e) => setField('message', e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby="inq-message-error"
            className={[
              inputBase,
              'resize-none',
              errors.message ? inputError : inputNormal,
            ].join(' ')}
            placeholder="Tell us about your organization and how you would like to engage with the Movement."
          />
        </Field>

        {/* Consent */}
        <fieldset>
          <legend className="text-xs font-semibold text-ivory-300 uppercase tracking-widest mb-4 pb-2 border-b border-lagoon-700/50 w-full">
            Consent <span className="text-red-400" aria-hidden="true">*</span>
          </legend>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              id="inq-consent"
              type="checkbox"
              checked={fields.consentAccepted}
              onChange={(e) => setField('consentAccepted', e.target.checked)}
              aria-required="true"
              aria-invalid={!!errors.consentAccepted}
              aria-describedby="inq-consent-error"
              className="mt-0.5 h-4 w-4 rounded-sm border-lagoon-600 text-gold-500 focus:ring-gold-400 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-ivory-200 leading-relaxed">
              {CONSENT_TEXT}
            </span>
          </label>

          {errors.consentAccepted && (
            <p id="inq-consent-error" role="alert" className="mt-2 text-xs text-red-400">
              {errors.consentAccepted}
            </p>
          )}

          <p className="mt-4 text-xs text-ivory-400/70 leading-relaxed">
            We collect only what we need. You can request deletion of your information at any time.{' '}
            <a href="/privacy-policy" className="underline hover:text-ivory-200 transition-colors">
              Privacy Policy
            </a>
          </p>
        </fieldset>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              'w-full sm:w-auto min-w-[14rem] inline-flex items-center justify-center',
              'rounded-sm px-8 py-4 text-sm font-semibold tracking-wide',
              'border border-gold-500 text-gold-400 bg-transparent',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
              isSubmitting
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-gold-500/10',
            ].join(' ')}
          >
            {isSubmitting ? 'Sending…' : 'SEND INQUIRY'}
          </button>
        </div>
      </div>
    </form>
  );
}
