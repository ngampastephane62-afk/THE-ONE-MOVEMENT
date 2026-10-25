import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useRecordSiteVisit } from '@workspace/api-client-react';

const KEY = 'tomi-visit-consent';
const SID = 'tomi-visit-session';
const TTL = 90 * 24 * 60 * 60 * 1000;
const OPEN_EVENT = 'tomi:open-visit-consent';
type Choice = 'accepted' | 'refused' | null;

function readChoice(): Choice {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { c?: string; at?: number };
    if (!v.at || Date.now() - v.at > TTL || (v.c !== 'accepted' && v.c !== 'refused')) { localStorage.removeItem(KEY); return null; }
    return v.c;
  } catch { return null; }
}
const excluded = (loc: string) => /^\/(member|sign-in|sign-up)(\/|$)/.test(loc);

export function openVisitConsent() { window.dispatchEvent(new Event(OPEN_EVENT)); }

/** Opt-in, first-party, anonymous daily visit counter. Nothing is created or sent before acceptance. */
export default function VisitConsent() {
  const [loc] = useLocation();
  const [choice, setChoice] = useState<Choice>(() => readChoice());
  const [open, setOpen] = useState(false);
  const record = useRecordSiteVisit({ mutation: { retry: false } });
  const mutateRef = useRef(record.mutate);
  mutateRef.current = record.mutate;
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, h);
    return () => window.removeEventListener(OPEN_EVENT, h);
  }, []);

  useEffect(() => {
    if (choice !== 'accepted' || excluded(loc) || lastSent.current === loc) return;
    lastSent.current = loc;
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(SID);
      if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SID, id); }
    } catch { return; }
    mutateRef.current({ data: { sessionId: id, consent: true } }, { onError: () => { /* best effort, never retried */ } });
  }, [choice, loc]);

  const decide = (c: 'accepted' | 'refused') => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ c, at: Date.now() }));
      if (c === 'refused') sessionStorage.removeItem(SID);
    } catch { /* storage unavailable: choice applies to this page only */ }
    if (c === 'refused') lastSent.current = null;
    setChoice(c);
    setOpen(false);
  };

  if (excluded(loc) || (choice && !open)) return null;
  return (
    <section aria-labelledby="visit-consent-title" className="border-t border-gold-500/25 bg-ivory-50" data-testid="panel-visit-consent">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 id="visit-consent-title" className="text-sm font-semibold text-ink-900">Help us count visits?</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-700">If you accept, this browser tab sends an anonymous random session number when you open a public page, so we can count daily visits. No page address, name, email or advertising tracker. Kept 90 days. {choice && <span data-testid="text-visit-consent-current">Current choice: {choice === 'accepted' ? 'accepted' : 'refused'}.</span>}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => decide('refused')} className="rounded-full border border-sand-300 px-4 py-2 text-xs font-semibold text-ink-800 hover:border-lagoon-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-visit-refuse">Refuse</button>
          <button type="button" onClick={() => decide('accepted')} className="rounded-full bg-lagoon-900 px-4 py-2 text-xs font-semibold text-gold-400 hover:bg-lagoon-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="button-visit-accept">Accept</button>
        </div>
      </div>
    </section>
  );
}
