import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRunGratitudeAction, type GratitudeAction, type GratitudeCampaign } from '@workspace/api-client-react';

/** Every gratitude query key starts with /api/gratitude. */
export const isGratitudeKey = (key: readonly unknown[]) => typeof key[0] === 'string' && (key[0] as string).startsWith('/api/gratitude');

export function useInvalidateGratitude() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ predicate: (q) => isGratitudeKey(q.queryKey) });
}

export function useGratitudeAct() {
  const invalidate = useInvalidateGratitude();
  const m = useRunGratitudeAction();
  return {
    pending: m.isPending,
    run: async (data: GratitudeAction) => {
      const r = await m.mutateAsync({ data });
      await invalidate();
      return r as unknown as { id?: number };
    },
  };
}

/** Server media paths are API-relative; prefix with the artifact base like existing editorial helpers. */
export function mediaSrc(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//.test(url) || url.startsWith('blob:')) return url;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export const STATUS: Record<string, { label: string; tone: string; note: string }> = {
  draft: { label: 'Draft', tone: 'bg-ivory-200 text-ink-800', note: 'Only you can see this. Edit freely, then submit for review.' },
  pending_review: { label: 'In review', tone: 'bg-gold-500/15 text-gold-700', note: 'The Founder reviews every story personally. Nothing is public yet.' },
  published: { label: 'Published', tone: 'bg-lagoon-900 text-gold-400', note: 'Public in the campaign. Editing returns it to a private draft that needs a new review.' },
  rejected: { label: 'Not accepted', tone: 'bg-crimson-700/10 text-crimson-700', note: 'Read the reason, revise and submit again if you wish.' },
  hidden: { label: 'Hidden', tone: 'bg-sand-200 text-ink-800', note: 'Removed from public view by moderation.' },
  archived: { label: 'Archived', tone: 'bg-sand-200 text-ink-700', note: 'Withdrawn by you. Not public.' },
};

export type IdentityKey = 'global' | 'emirates' | 'africa' | 'usa' | 'europe';
/** Original visual treatments. They describe a campaign look, never an official subsidiary. */
export const IDENTITIES: Record<IdentityKey, { label: string; note: string; bg: string; accent: string; pattern: string }> = {
  global: { label: 'Global', note: 'Meridian lines and open horizon', bg: 'hsl(187 67% 12%)', accent: 'hsl(42 62% 56%)', pattern: 'repeating-linear-gradient(90deg, hsl(42 62% 56% / .09) 0 1px, transparent 1px 64px), repeating-linear-gradient(0deg, hsl(42 62% 56% / .06) 0 1px, transparent 1px 64px)' },
  emirates: { label: 'Emirates', note: 'Desert dune bands and lattice light', bg: 'hsl(178 45% 16%)', accent: 'hsl(38 70% 60%)', pattern: 'repeating-linear-gradient(45deg, hsl(38 70% 60% / .08) 0 2px, transparent 2px 22px), repeating-linear-gradient(-45deg, hsl(38 70% 60% / .08) 0 2px, transparent 2px 22px)' },
  africa: { label: 'Africa', note: 'Woven stepped geometry and warm earth', bg: 'hsl(160 40% 14%)', accent: 'hsl(30 72% 58%)', pattern: 'repeating-linear-gradient(90deg, hsl(30 72% 58% / .1) 0 8px, transparent 8px 24px), repeating-linear-gradient(0deg, transparent 0 18px, hsl(30 72% 58% / .08) 18px 22px)' },
  usa: { label: 'USA', note: 'Wide plains rhythm and quilted stripes', bg: 'hsl(200 45% 15%)', accent: 'hsl(44 66% 62%)', pattern: 'repeating-linear-gradient(0deg, hsl(44 66% 62% / .08) 0 3px, transparent 3px 26px)' },
  europe: { label: 'Europe', note: 'Arcaded rhythm and stone-and-river tones', bg: 'hsl(195 35% 18%)', accent: 'hsl(46 58% 64%)', pattern: 'radial-gradient(circle at 50% 100%, transparent 0 14px, hsl(46 58% 64% / .1) 14px 15px, transparent 15px) 0 0 / 36px 30px' },
};

export function identityOf(c?: Pick<GratitudeCampaign, 'identity'> | null): IdentityKey {
  const s = (c?.identity as { style?: unknown } | undefined)?.style;
  return typeof s === 'string' && s in IDENTITIES ? (s as IdentityKey) : 'global';
}

export function errMsg(e: unknown, fallback = 'Something went wrong. Please try again.') {
  const anyE = e as { data?: { error?: string; message?: string }; message?: string; status?: number };
  if (anyE?.status === 409) return 'This story changed elsewhere. It has been refreshed; review and try again.';
  return anyE?.data?.error || anyE?.data?.message || fallback;
}

export const fmt = (n: number) => new Intl.NumberFormat().format(n);

/** Locally hosted 80px flag images (public/flags, sourced from flagcdn.com, public-domain flag artwork). */
export const flagSrc = (code: string) => `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/flags/${code.toLowerCase()}.png`;

export function Flag({ code, name, className = 'h-4 w-6' }: { code?: string | null; name?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!code) return null;
  if (failed) return <span className={`inline-grid place-items-center border border-sand-300 bg-ivory-200 text-[9px] font-semibold text-ink-800 ${className}`} role="img" aria-label={`Flag of ${name || code}`}>{code.toUpperCase()}</span>;
  return <img src={flagSrc(code)} alt={`Flag of ${name || code}`} loading="lazy" onError={() => setFailed(true)} className={`inline-block object-contain ${className}`} data-testid={`img-flag-${code}`} />;
}

/** Evenly sampled across the full alphabetical country list, so no nation is singled out. */
export function sampleFlags(codes: string[], n: number) {
  const sorted = [...codes].sort();
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  return Array.from({ length: n }, (_, i) => sorted[Math.floor(i * step)]);
}

export function FlagField({ codes, count = 28, className = '' }: { codes: string[]; count?: number; className?: string }) {
  const picks = sampleFlags(codes, count);
  return (
    <div className={`ttw-flagfield ${className}`} aria-hidden>
      <div className="ttw-flagfield-row">{[...picks, ...picks].map((c, i) => <img key={i} src={flagSrc(c)} alt="" loading="lazy" decoding="async" width={40} height={27} onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />)}</div>
    </div>
  );
}
