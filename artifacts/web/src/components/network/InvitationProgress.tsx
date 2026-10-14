import { useRef, useState } from 'react';
import { Check, Copy, Lock, Share2, Unlock } from 'lucide-react';
import type { NetworkGrowth } from '@workspace/api-client-react';
import { inviteUrl } from '@/lib/network-invitations';
import { btn, btnGhost, card } from './kit';

export default function InvitationProgress({ growth, founder, compact }: { growth: NetworkGrowth | null; founder?: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (founder) {
    return <div className={`${card} p-4 text-sm text-ink-700`} data-testid="growth-founder"><Unlock className="mr-1 inline h-4 w-4 text-gold-700" />As founder, you can publish without invitations.</div>;
  }
  if (!growth) {
    return <div className={`${card} p-4 text-sm text-ink-700`} data-testid="growth-unavailable">Your invitation link appears once your member profile is complete.</div>;
  }
  const link = inviteUrl(growth.inviteCode);
  const req = growth.requiredInvites || 11;
  const n = Math.min(growth.qualifiedInvites, req);
  const pct = Math.round((n / req) * 100);

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(link);
      setCopied('ok');
    } catch {
      setCopied('fail');
      inputRef.current?.select();
    }
  }
  async function share() {
    try { await navigator.share({ title: 'Join me on the TOMI network', text: 'Artists, business and humanitarian professionals meet here. Join with my invitation:', url: link }); }
    catch { /* user cancelled */ }
  }
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <section className={`${card} overflow-hidden`} data-testid="panel-growth">
      <div className="bg-lagoon-900 p-5 text-ivory-100">
        <p className="text-eyebrow text-gold-400">{growth.canPost ? 'PUBLISHING UNLOCKED' : 'FREE MEMBERSHIP'}</p>
        <p className="mt-1 font-display text-xl">{growth.canPost ? 'You can publish to the network' : `Invite ${req} people to unlock publishing`}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="font-display text-4xl text-gold-400" data-testid="text-growth-count">{n}<span className="text-lg text-ivory-300">/{req}</span></span>
          <span className="text-xs text-ivory-300">recruited followers</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory-100/15" role="progressbar" aria-valuemin={0} aria-valuemax={req} aria-valuenow={n} aria-label="Invitation progress">
          <div className="h-full origin-left rounded-full bg-gold-500 transition-transform duration-700" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        {!compact && (
          <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-ink-700">
            {!growth.canPost && <p><Lock className="mr-1 inline h-3.5 w-3.5 text-gold-700" />Free members can already follow, like, comment and request conversations. Publishing posts opens when {req} people you invited are following you.</p>}
            <p>An invitation counts when someone opens your link, creates a new verified account (less than 24 hours old) and accepts your invitation, which makes them follow you. Each account can be credited once.</p>
            <p>The count reflects invited members who currently follow you and are active. If one unfollows or is suspended, the count goes down{growth.canPost ? ' and publishing may lock again' : ''}. Packages and events do not replace this step.</p>
          </div>
        )}
        <label htmlFor="invite-link" className="text-xs font-semibold text-ink-900">Your invitation link</label>
        <input id="invite-link" ref={inputRef} readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-xl border border-sand-300 bg-ivory-100 px-3 py-2 font-mono text-xs text-ink-800" data-testid="input-invite-link" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={copy} data-testid="button-copy-invite">{copied === 'ok' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied === 'ok' ? 'Copied' : 'Copy link'}</button>
          {canShare && <button type="button" className={btnGhost} onClick={share} data-testid="button-share-invite"><Share2 className="h-3.5 w-3.5" />Share</button>}
        </div>
        {copied === 'fail' && <p className="text-xs text-crimson-700" role="alert">Copy failed in this browser. The link above is selected; copy it manually.</p>}
      </div>
    </section>
  );
}
