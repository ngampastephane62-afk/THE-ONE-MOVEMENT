import { useRef, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import type { Sector } from '@/lib/sectors-data';
import { sectorDestination } from './sector-location';

type Status = 'idle' | 'shared' | 'cancelled' | 'copied' | 'error' | 'manual';

/** Clean public URL: current origin + artifact base + allowlisted destination. No query tracking carried over. */
export function sectorShareUrl(slug: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${base}${sectorDestination(slug)}`;
}

const MESSAGES: Record<Status, string> = {
  idle: '',
  shared: 'Shared. Thank you for opening the door to someone.',
  cancelled: 'Sharing cancelled. Nothing was sent.',
  copied: 'Link copied to your clipboard.',
  error: 'Sharing failed. You can copy the link below instead.',
  manual: 'Copying is not available here. Select the link below and copy it manually.',
};

export default function SectorShare({ sector }: { sector: Sector }) {
  const [status, setStatus] = useState<Status>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const url = sectorShareUrl(sector.slug);
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('manual');
      requestAnimationFrame(() => inputRef.current?.select());
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: `${sector.name} · TOMI`, text: `${sector.name}: ${sector.descriptor}. Free to belong.`, url });
      setStatus('shared');
    } catch (e) {
      setStatus(e instanceof DOMException && e.name === 'AbortError' ? 'cancelled' : 'error');
    }
  };

  const showField = status === 'manual' || status === 'error';
  return (
    <div className="sw-share" data-testid={`share-sector-${sector.slug}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] uppercase tracking-[0.16em] text-gold-500">Share this world</span>
        {canNative && (
          <button type="button" onClick={share} className="sw-btn" data-testid="button-share-sector">
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share
          </button>
        )}
        <button type="button" onClick={copy} className="sw-btn" data-testid="button-copy-sector-link">
          {status === 'copied' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {status === 'copied' ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p className="mt-2 min-h-[1rem] text-[11px] text-ivory-300" role="status" aria-live="polite" data-testid="status-share-sector">{MESSAGES[status]}</p>
      {showField && (
        <input
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`Link to the ${sector.name} sector`}
          data-testid="input-sector-share-url"
          className="mt-1 w-full select-all border border-lagoon-600 bg-lagoon-800 px-3 py-2 font-mono text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
        />
      )}
    </div>
  );
}
