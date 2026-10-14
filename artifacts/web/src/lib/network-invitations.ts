import { basePath } from '@/lib/clerk';

/** Verified production origin used for every shared/copied link. */
export const PUBLIC_SHARE_ORIGIN = 'https://theonemovementinternational.ae';

const INVITE_KEY = 'tomi.network.pendingInvite.v1';
const FOLLOW_KEY = 'tomi.network.pendingFollow.v1';
/** Pending items are kept at most 7 days in this browser. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PendingInvite { code: string; savedAt: number; expiresAt: number; owner?: string }
export interface PendingFollow { memberId: number; name: string; savedAt: number; expiresAt: number; owner?: string }

export const isInviteCode = (c: string | undefined | null): c is string => !!c && UUID_RE.test(c.trim());

export function inviteUrl(code: string) { return `${PUBLIC_SHARE_ORIGIN}${basePath}/invite/${code}`; }
export function publicProfileUrl(id: number) { return `${PUBLIC_SHARE_ORIGIN}${basePath}/community/members/${id}`; }

function read<T extends { expiresAt: number }>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as T;
    if (!v || typeof v.expiresAt !== 'number' || v.expiresAt < Date.now()) { localStorage.removeItem(key); return null; }
    return v;
  } catch { return null; }
}
function write(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ } }
function drop(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } }

/**
 * Pending items are bound to the first signed-in account that sees them, so a
 * different account using the same browser never inherits someone else's invitation.
 */
function forUser<T extends { owner?: string; expiresAt: number }>(key: string, userId: string | null | undefined): T | null {
  const v = read<T>(key);
  if (!v) return null;
  if (!userId) return v;
  if (!v.owner) { const bound = { ...v, owner: userId }; write(key, bound); return bound; }
  return v.owner === userId ? v : null;
}

export function storePendingInvite(code: string): boolean {
  if (!isInviteCode(code)) return false;
  const now = Date.now();
  const existing = read<PendingInvite>(INVITE_KEY);
  if (existing?.code === code.trim()) return true;
  write(INVITE_KEY, { code: code.trim().toLowerCase(), savedAt: now, expiresAt: now + TTL_MS } satisfies PendingInvite);
  return true;
}
export const getPendingInvite = (userId?: string | null) => forUser<PendingInvite>(INVITE_KEY, userId);
export const clearPendingInvite = () => drop(INVITE_KEY);

export function storePendingFollow(memberId: number, name: string) {
  const now = Date.now();
  write(FOLLOW_KEY, { memberId, name: name.slice(0, 100), savedAt: now, expiresAt: now + TTL_MS } satisfies PendingFollow);
}
export const getPendingFollow = (userId?: string | null) => forUser<PendingFollow>(FOLLOW_KEY, userId);
export const clearPendingFollow = () => drop(FOLLOW_KEY);
