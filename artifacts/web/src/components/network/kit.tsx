import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Loader2, Paperclip, RotateCw, ShieldCheck, Star, X } from 'lucide-react';
import {
  requestNetworkUpload, useNetworkAction, getGetMemberProfileQueryKey,
  getGetEcosystemMembersQueryKey, getGetPublicNetworkProfileQueryKey,
  type NetworkMember, type NetworkMedia, type NetworkActionInput, type MemberProfileResponse,
} from '@workspace/api-client-react';

export const STATE_PREFIX = ['/api/network/state'] as const;

export function useAct() {
  const qc = useQueryClient();
  const m = useNetworkAction({
    mutation: {
      onSuccess: (_result, variables) => {
        qc.invalidateQueries({ queryKey: STATE_PREFIX });
        qc.invalidateQueries({ queryKey: getGetMemberProfileQueryKey() });
        if (['profile.media', 'join'].includes(variables.data.action)) {
          qc.invalidateQueries({ queryKey: getGetEcosystemMembersQueryKey() });
          const memberId = qc.getQueryData<MemberProfileResponse>(getGetMemberProfileQueryKey())?.profile?.id;
          if (memberId) {
            qc.invalidateQueries({ queryKey: getGetPublicNetworkProfileQueryKey(memberId) });
          }
        }
      },
    },
  });
  return {
    run: async (data: NetworkActionInput) => {
      try { return await m.mutateAsync({ data }); }
      catch (e) {
        if (!needsJoin(e) || data.action === 'join' || data.action === 'post.view') throw e;
        const ok = window.confirm('Join the TOMI member network?\n\nActivating makes your name and network profile visible to other signed-in TOMI members. It does not publish anything to the public internet, and your public directory setting stays unchanged.\n\nPress OK to activate and continue.');
        if (!ok) throw e;
        await m.mutateAsync({ data: { action: 'join', accepted: true } });
        return m.mutateAsync({ data });
      }
    },
    pending: m.isPending,
    error: m.isError,
    reset: m.reset,
  };
}

export const JOIN_REQUIRED = 'Join the member network before taking part.';
interface ApiErrorShape { status?: number; data?: { error?: unknown } | null }
function needsJoin(e: unknown) {
  const x = e as ApiErrorShape | null;
  return x?.status === 409 && x.data?.error === JOIN_REQUIRED;
}

export function errStatus(e: unknown): number | undefined {
  return (e as { status?: number } | null)?.status;
}

export const ROLES = ['business', 'partner', 'sponsor', 'media-partner', 'official-model', 'exhibitor', 'speaker', 'designer', 'investor'] as const;
export const PROGRAMS = ['ecosystem', 'diplomatic-gala', 'summit', 'fashion-week', 'awards', 'fashion-night', 'investment-forum'] as const;
export const label = (s: string) => s.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

export function money(cents: number | null, currency: string) {
  if (cents == null) return 'Quote on request';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

export function ago(iso: string) {
  const d = new Date(iso); const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Avatar({ m, size = 40 }: { m: Pick<NetworkMember, 'fullName' | 'avatarUrl'>; size?: number }) {
  const ini = m.fullName.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return m.avatarUrl ? (
    <img src={m.avatarUrl} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover ring-1 ring-gold-500/40" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full bg-lagoon-800 font-display text-gold-400 ring-1 ring-gold-500/40" style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>
  );
}

export function Badges({ m, compact }: { m: NetworkMember; compact?: boolean }) {
  if (!m.founder && !m.badges.length) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {m.founder && <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-900" data-testid="badge-founder"><Star className="h-3 w-3" />Founder</span>}
      {m.badges.slice(0, compact ? 1 : 9).map((b) => (
        <span key={b.role + b.program} title={b.expiresAt ? `Official until ${new Date(b.expiresAt).toLocaleDateString()}` : 'Official'} className="inline-flex items-center gap-1 rounded-full border border-lagoon-600/40 bg-lagoon-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lagoon-700">
          <ShieldCheck className="h-3 w-3" />{label(b.role)} · {label(b.program)}
        </span>
      ))}
      {compact && m.badges.length > 1 && <span className="text-[10px] text-sand-400">+{m.badges.length - 1}</span>}
    </span>
  );
}

export function PersonLine({ m, sub }: { m: NetworkMember; sub?: ReactNode }) {
  return (
    <Link href={`/member/profile/${m.id}`} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-person-${m.id}`}>
      <Avatar m={m} />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5"><span className="truncate font-semibold text-ink-900">{m.fullName}</span><Badges m={m} compact /></span>
        <span className="block truncate text-xs text-sand-400">{sub ?? [m.profession, m.country].filter(Boolean).join(' · ')}</span>
      </span>
    </Link>
  );
}

export function MediaView({ media, grid = true }: { media: NetworkMedia[]; grid?: boolean }) {
  if (!media.length) return null;
  const visual = media.filter((x) => x.contentType.startsWith('image/') || x.contentType.startsWith('video/'));
  const other = media.filter((x) => !visual.includes(x));
  return (
    <div className="flex flex-col gap-2">
      {visual.length > 0 && (
        <div className={grid && visual.length > 1 ? 'grid grid-cols-2 gap-1 overflow-hidden rounded-xl' : 'overflow-hidden rounded-xl'}>
          {visual.map((x) => x.contentType.startsWith('image/')
            ? <img key={x.id} src={x.url} alt={x.filename} loading="lazy" className="max-h-[32rem] w-full bg-ivory-200 object-cover" />
            : <video key={x.id} src={x.url} controls playsInline preload="metadata" className="max-h-[36rem] w-full bg-ink-900" />)}
        </div>
      )}
      {other.map((x) => (
        <div key={x.id} className="flex flex-col gap-2 rounded-xl border border-sand-200 bg-ivory-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink-800"><FileText className="h-4 w-4 shrink-0 text-gold-600" /><span className="truncate">{x.filename}</span></span>
            <a href={x.url} download={x.filename} className="inline-flex items-center gap-1 rounded-full border border-lagoon-700 px-3 py-1 text-xs font-semibold text-lagoon-700 hover:bg-lagoon-700 hover:text-ivory-50" data-testid={`link-download-${x.id}`}><Download className="h-3.5 w-3.5" />Download</a>
          </div>
          {x.contentType.startsWith('audio/') && <audio src={x.url} controls className="w-full" />}
        </div>
      ))}
    </div>
  );
}

const IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VID = ['video/mp4', 'video/webm', 'video/quicktime'];
const AUD = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg'];
export const ACCEPT_ALL = [...IMG, ...VID, ...AUD, 'application/pdf'].join(',');
export const ACCEPT_IMG = IMG.join(',');
export const ACCEPT_EVIDENCE = [...IMG, 'application/pdf'].join(',');

function check(f: File): string | null {
  const t = f.type;
  if (VID.includes(t)) return f.size > 100 * 1024 * 1024 ? 'Videos must be 100 MB or less.' : null;
  if ([...IMG, ...AUD, 'application/pdf'].includes(t)) return f.size > 20 * 1024 * 1024 ? 'Images, audio and PDFs must be 20 MB or less.' : null;
  return 'Unsupported format. Use JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV, MP3, WAV, OGG or PDF.';
}

function put(url: string, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('Content-Type', file.type);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error(`Upload failed (${x.status})`)));
    x.onerror = () => reject(new Error('Network error during upload'));
    x.send(file);
  });
}

export interface UploadItem { key: string; file: File; progress: number; status: 'uploading' | 'done' | 'error'; error?: string; id?: string }

/** Private App Storage upload: ticket → PUT bytes → upload.complete. */
export function useUploads(max = 6) {
  const { run } = useAct();
  const [items, setItems] = useState<UploadItem[]>([]);
  const patch = (key: string, p: Partial<UploadItem>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...p } : x)));

  async function start(it: UploadItem) {
    patch(it.key, { status: 'uploading', progress: 0, error: undefined });
    try {
      const t = await requestNetworkUpload({ filename: it.file.name.slice(0, 200), contentType: it.file.type, size: it.file.size });
      await put(t.uploadUrl, it.file, (progress) => patch(it.key, { progress }));
      await run({ action: 'upload.complete', mediaIds: [t.id] });
      patch(it.key, { status: 'done', progress: 100, id: t.id });
    } catch (e) {
      patch(it.key, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed' });
    }
  }
  function add(files: FileList | File[]) {
    const list = Array.from(files).slice(0, Math.max(0, max - items.length));
    const next: UploadItem[] = list.map((file) => {
      const bad = check(file);
      return { key: `${file.name}-${file.size}-${Math.random()}`, file, progress: 0, status: bad ? 'error' : 'uploading', error: bad ?? undefined };
    });
    setItems((xs) => [...xs, ...next]);
    next.filter((n) => !n.error).forEach(start);
  }
  return {
    items, add,
    retry: (key: string) => { const it = items.find((x) => x.key === key); if (it && !check(it.file)) start(it); },
    remove: (key: string) => setItems((xs) => xs.filter((x) => x.key !== key)),
    clear: () => setItems([]),
    ids: items.filter((x) => x.status === 'done' && x.id).map((x) => x.id as string),
    busy: items.some((x) => x.status === 'uploading'),
    full: items.length >= max,
  };
}

export function UploadTray({ u, accept = ACCEPT_ALL, label: lbl = 'Attach', testId = 'upload' }: { u: ReturnType<typeof useUploads>; accept?: string; label?: string; testId?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2">
      {u.items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {u.items.map((it) => (
            <li key={it.key} className="flex items-center gap-2 rounded-lg border border-sand-200 bg-ivory-100 px-3 py-2 text-xs">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink-800">{it.file.name}</span>
                {it.status === 'uploading' && <span className="mt-1 block h-1 overflow-hidden rounded bg-sand-100"><span className="block h-full bg-lagoon-500 transition-[width]" style={{ width: `${it.progress}%` }} /></span>}
                {it.status === 'error' && <span className="block text-crimson-700" role="alert">{it.error}</span>}
                {it.status === 'done' && <span className="block text-lagoon-600">Uploaded privately</span>}
              </span>
              {it.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-lagoon-600" />}
              {it.status === 'error' && <button type="button" onClick={() => u.retry(it.key)} className="text-crimson-700" aria-label="Retry upload"><RotateCw className="h-4 w-4" /></button>}
              <button type="button" onClick={() => u.remove(it.key)} className="text-sand-400 hover:text-crimson-700" aria-label={`Remove ${it.file.name}`}><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <input ref={ref} type="file" multiple hidden accept={accept} onChange={(e) => { if (e.target.files) u.add(e.target.files); e.target.value = ''; }} data-testid={`input-${testId}`} />
      <button type="button" disabled={u.full} onClick={() => ref.current?.click()} className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-lagoon-700 hover:bg-lagoon-600/10 disabled:opacity-40" data-testid={`button-${testId}`}>
        <Paperclip className="h-4 w-4" />{lbl}
      </button>
    </div>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="flex flex-col gap-3" aria-busy="true">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ivory-200" />)}</div>;
}

export function ErrorBox({ onRetry, msg = 'This could not be loaded.' }: { onRetry: () => void; msg?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-crimson-700/30 bg-crimson-700/5 p-4" role="alert">
      <p className="text-sm text-crimson-700">{msg}</p>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full bg-lagoon-900 px-4 py-1.5 text-xs font-semibold text-ivory-100" data-testid="button-retry"><RotateCw className="h-3.5 w-3.5" />Try again</button>
    </div>
  );
}

export function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold-500/50 bg-ivory-50 p-8 text-center">
      <p className="font-display text-lg text-ink-900">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-700">{body}</p>
      {children && <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export const card = 'rounded-2xl border border-sand-200 bg-ivory-50 shadow-[0_1px_2px_hsl(30_37%_7%/0.04)]';
export const btn = 'inline-flex items-center justify-center gap-1.5 rounded-full bg-lagoon-900 px-4 py-2 text-xs font-semibold text-ivory-50 hover:bg-lagoon-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2';
export const btnGhost = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-sand-300 px-4 py-2 text-xs font-semibold text-ink-800 hover:border-lagoon-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500';
export const field = 'w-full rounded-xl border border-sand-300 bg-ivory-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-sand-400 focus:border-lagoon-600 focus:outline-none focus:ring-2 focus:ring-lagoon-600/20';
