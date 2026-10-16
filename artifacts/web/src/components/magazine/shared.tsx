import { useAuth } from '@clerk/react';
import { getGetMagazineOrdersQueryKey, getGetMagazineOrderQueryKey, getGetMagazineAdminOrdersQueryKey } from '@workspace/api-client-react';

export const COVER_URL = `${import.meta.env.BASE_URL}api/magazine/cover`;
export const downloadUrl = (id: number) => `${import.meta.env.BASE_URL}api/magazine/orders/${id}/download`;

export const usd = (cents: number | null | undefined) =>
  cents == null ? null : `${(cents / 100).toFixed(2).replace(/\.00$/, '')} USD`;

export function useMagazineKeys() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const uid = userId ?? 'anon';
  return {
    userId, isLoaded, signedIn: !!isSignedIn && !!userId,
    list: [...getGetMagazineOrdersQueryKey(), uid] as const,
    detail: (id: number) => [...getGetMagazineOrderQueryKey(id), uid] as const,
    admin: [...getGetMagazineAdminOrdersQueryKey(), uid] as const,
  };
}

export const STATUS: Record<string, { label: string; tone: string }> = {
  quote_requested: { label: 'Shipping quote requested', tone: 'bg-gold-100 text-ink-900 border-gold-400' },
  quoted: { label: 'Shipping quoted · awaiting your payment', tone: 'bg-lagoon-50 text-lagoon-900 border-lagoon-600' },
  checkout_pending: { label: 'Checkout pending', tone: 'bg-ivory-200 text-ink-800 border-sand-300' },
  paid: { label: 'Paid', tone: 'bg-lagoon-900 text-ivory-50 border-lagoon-900' },
  refunded: { label: 'Refunded', tone: 'bg-ivory-200 text-ink-700 border-sand-300' },
  disputed: { label: 'Disputed', tone: 'bg-crimson-50 text-crimson-700 border-crimson-700' },
};

export function StatusPill({ status, testId }: { status: string; testId?: string }) {
  const s = STATUS[status] ?? { label: status, tone: 'bg-ivory-200 text-ink-800 border-sand-300' };
  return <span data-testid={testId} className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${s.tone}`}>{s.label}</span>;
}

export function newRequestId() {
  return (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9_-]/g, '');
}

export const inputCls = 'w-full border-0 border-b border-ink-900/25 bg-transparent px-0 py-2.5 text-[15px] text-ink-900 placeholder:text-sand-400 focus:border-lagoon-600 focus:outline-none focus:ring-0';
export const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-700';
export const primaryBtn = 'inline-flex items-center justify-center gap-2 bg-ink-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-ivory-50 transition-colors hover:bg-lagoon-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2';
export const ghostBtn = 'inline-flex items-center justify-center gap-2 border border-ink-900/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-900 transition-colors hover:border-lagoon-600 hover:text-lagoon-900 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500';
