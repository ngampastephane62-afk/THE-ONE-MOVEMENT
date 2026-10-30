import { useState } from 'react';
import { useMe } from '@/pages/member/ctx';
import { useAct } from './kit';

/** Membership and directory consent are independent; public internet settings
 * remain in the existing profile form. Never preselect a new member's consent. */
export default function DirectoryPrivacy() {
  const { base } = useMe();
  const { run, pending } = useAct();
  const [error, setError] = useState(false);
  return (
    <section className="rounded-xl border border-sand-200 bg-ivory-50 p-4" data-testid="directory-privacy">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-900">
        <input type="checkbox" checked={base.directoryVisible} disabled={pending}
          className="mt-1 h-4 w-4 shrink-0 accent-[#0d3438]" data-testid="checkbox-member-directory"
          onChange={async (event) => {
            setError(false);
            try { await run({ action: 'directory.visibility', accepted: event.target.checked }); }
            catch { setError(true); }
          }} />
        <span><strong>List my professional profile in the member directory</strong>
          <span className="mt-1 block text-xs leading-relaxed text-ink-700">Optional. When your verified basic profile is complete, signed-in members can find your name, professional details, chosen sectors and profile photos. Your country is shown only if your location setting allows it. Emails, private contacts and administrative information are never listed. You can change this choice here at any time.</span>
        </span>
      </label>
      <p className="mt-3 text-xs leading-relaxed text-ink-700">You can participate with directory listing off. Posting or connecting deliberately shares your professional identity with those members. Public internet visibility is a separate choice in Settings and remains unchanged.</p>
      {error && <p role="alert" className="mt-2 text-xs text-crimson-700">Your directory choice was not saved. Please try again.</p>}
    </section>
  );
}
