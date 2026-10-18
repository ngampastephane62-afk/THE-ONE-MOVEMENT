import { useRef, useState } from 'react';
import { Check, Copy, Share2, Unlock } from 'lucide-react';
import type { NetworkGrowth } from '@workspace/api-client-react';
import { inviteUrl } from '@/lib/network-invitations';
import { btn, btnGhost, card } from './kit';

export default function InvitationProgress({ growth, founder, compact }: { growth: NetworkGrowth | null; founder?: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (founder) {
    return <div className={`${card} p-4 text-sm text-ink-700`} data-testid="growth-founder"><Unlock className="mr-1 inline h-4 w-4 text-gold-700" />Founder accounts can publish without referrals.</div>;
  }
  if (!growth) {
    return <div className={`${card} p-4 text-sm text-ink-700`} data-testid="growth-unavailable">Your invitation link appears once your member profile is complete.</div>;
  }
  const link = inviteUrl(growth.inviteCode);

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
        <p className="text-eyebrow text-gold-400">GROW YOUR COMMUNITY</p>
        <p className="mt-1 font-display text-xl">Invite people to connect with you</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="font-display text-4xl text-gold-400" data-testid="text-growth-count">{growth.qualifiedInvites}</span>
          <span className="text-xs text-ivory-300">verified referral followers · invitations are optional</span>
        </div>
        <p className="mt-2 text-xs text-ivory-200" data-testid="text-growth-status">{growth.canPost ? 'Ordinary posting is open for you. No invitations are required.' : 'Activate your verified membership to publish ordinary posts. No invitations are required.'}</p>
      </div>
      <div className="flex flex-col gap-3 p-5">
        {!compact && (
          <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-ink-700">
            <p>Your account is free and editable now. Ordinary posts do not require invitations or a subscription. Business posts and reels retain their existing ten-referral requirement and need an active <a href="/member/membership" className="font-semibold text-lagoon-700 underline">membership</a>.</p>
            <p>An invitation counts when someone opens your link, creates a new verified account (less than 24 hours old) and accepts your invitation, which makes them follow you. Each account can be credited once.</p>
            <p>The count reflects invited members who currently follow you and are active. Only real, currently active followers count; the number is never estimated. Packages, events, humanitarian films and donations are separate.</p>
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
