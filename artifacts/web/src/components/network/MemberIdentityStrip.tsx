/** Presentational identity strip for member spaces. No data, no actions. */
export default function MemberIdentityStrip({ label }: { label: string }) {
  return (
    <div className="mx-3 flex items-center gap-3 overflow-hidden border-y border-gold-500/30 bg-ivory-50 px-3 py-2 md:mx-0" data-testid={`strip-member-identity-${label.toLowerCase().replace(/\W+/g, '-')}`} aria-hidden="true">
      <span className="font-display text-[11px] tracking-[0.22em] text-lagoon-700">TOMI</span>
      <span className="h-px flex-1 bg-gradient-to-r from-gold-500/60 via-lagoon-500/30 to-transparent" />
      <span className="flex gap-1">{Array.from({ length: 17 }, (_, i) => <span key={i} className={`h-1.5 w-1.5 rotate-45 ${i % 3 === 0 ? 'bg-gold-500' : 'bg-lagoon-500/40'}`} />)}</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-ink-700">{label}</span>
    </div>
  );
}
