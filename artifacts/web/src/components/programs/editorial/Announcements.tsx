import type { ProgramEditorial } from '@workspace/api-client-react';
import { ANNOUNCEMENT_DEFAULT, type ProgrammeTheme } from '@/lib/programme-editorial';
import { MaskLine, Rise, useInView } from './motion';

/**
 * Confirmed announcements, always last. Date and venue appear only when the Founder
 * has marked event details as confirmed; otherwise the official coming-soon message.
 */
export default function Announcements({ theme, n = '09', editorial, note }: { theme: ProgrammeTheme; n?: string; editorial?: ProgramEditorial; note?: string }) {
  const [ref, shown] = useInView<HTMLElement>(0.25);
  const confirmed = !!editorial?.eventDetailsConfirmed;
  const facts = confirmed ? [
    editorial?.eventDate ? { label: 'Date', value: editorial.eventDate } : null,
    editorial?.venue?.trim() ? { label: 'Venue', value: editorial.venue } : null,
  ].filter((x): x is { label: string; value: string } => !!x) : [];
  const message = editorial?.announcement?.trim();
  return (
    <section ref={ref} id="announcements" aria-labelledby="announcements-heading" className="py-20 sm:py-24" style={{ backgroundColor: theme.paper, color: theme.ink }} data-testid="section-announcements">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.3em] opacity-60">{n} · OFFICIAL ANNOUNCEMENTS</p>
        <h2 id="announcements-heading" className="mt-6 text-[clamp(1.6rem,5vw,3rem)] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {facts.length ? <MaskLine shown={shown}>CONFIRMED DETAILS.</MaskLine> : <><MaskLine shown={shown}>OFFICIAL ANNOUNCEMENT</MaskLine><MaskLine shown={shown} delay={120}>COMING SOON.</MaskLine></>}
        </h2>
        {facts.length > 0 && (
          <dl className="mx-auto mt-10 grid max-w-2xl gap-px text-left sm:grid-cols-2" style={{ backgroundColor: 'hsl(30 15% 50% / 0.25)' }} data-testid="list-confirmed-details">
            {facts.map((f) => (
              <div key={f.label} className="p-5" style={{ backgroundColor: theme.paper }}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-60">{f.label}</dt>
                <dd className="mt-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <Rise shown={shown} delay={260} as="p" className="mx-auto mt-6 max-w-xl whitespace-pre-line leading-relaxed opacity-80">{message || (facts.length ? '' : ANNOUNCEMENT_DEFAULT.body)}</Rise>
        {note && <p className="mx-auto mt-6 max-w-xl text-sm opacity-70">{note}</p>}
        <span aria-hidden="true" className="mx-auto mt-10 block h-px w-24" style={{ backgroundColor: theme.accent }} />
      </div>
    </section>
  );
}
