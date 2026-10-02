import { cn } from '@/lib/utils';
import GeometricAccent from '@/components/GeometricAccent';

interface ProgramVisionProps {
  name: string;
  tagline?: string;
  className?: string;
}

/**
 * Branded TOMI program-vision treatment for programs with no historic imagery.
 * Pure graphic: no photography, no implied history.
 */
export default function ProgramVision({ name, tagline, className }: ProgramVisionProps) {
  return (
    <div
      role="img"
      aria-label={`${name} — program vision`}
      className={cn('relative flex flex-col justify-end overflow-hidden rounded-sharp border border-gold-500/25 bg-lagoon-900 p-5', className)}
    >
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <GeometricAccent variant="gold-on-lagoon" height={400} />
      </div>
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, hsl(39 52% 54% / 0.14), transparent 70%), linear-gradient(to top, hsl(187 67% 10% / 0.95), transparent 70%)' }}
      />
      <div className="relative z-10">
        <span className="block h-px w-12 bg-gold-500/70" aria-hidden="true" />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-400">Program vision</p>
        <p className="mt-2 text-lg leading-snug text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>{name}</p>
        {tagline && <p className="mt-1 text-xs text-ivory-300">{tagline}</p>}
      </div>
    </div>
  );
}
