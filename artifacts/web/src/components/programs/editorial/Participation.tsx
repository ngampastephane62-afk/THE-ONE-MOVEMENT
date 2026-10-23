import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { inquiryHref, type ProgrammeTheme } from '@/lib/programme-editorial';

export type Opp = { key: string; name: string; benefit: string; href: string };
export type Role = 'speaker' | 'exhibitor' | 'media' | 'partner' | 'sponsor' | 'collaborator';
export const ALL_ROLES: Role[] = ['speaker', 'exhibitor', 'media', 'partner', 'sponsor', 'collaborator'];

const ROLE_COPY: Record<Role, { name: string; benefit: string; partnership?: 'partner' | 'sponsor' | 'collaborator' }> = {
  speaker: { name: 'Speaker', benefit: 'Share expertise and ideas with an international community. Applications are reviewed; only confirmed speakers are announced.' },
  exhibitor: { name: 'Exhibitor', benefit: 'Present your products, services or creative work and meet relevant visitors and collaborators.' },
  media: { name: 'Media', benefit: 'Editorial access, interviews and coordinated coverage. Media partners keep their editorial independence.' },
  partner: { name: 'Partner', benefit: 'A long-term institutional or organisational collaboration with the programme.', partnership: 'partner' },
  sponsor: { name: 'Sponsor', benefit: 'Support the programme with agreed visibility. Sponsorship never influences selection or recognition.', partnership: 'sponsor' },
  collaborator: { name: 'Collaborator', benefit: 'Creative, cultural or community collaborations shaped together with TOMI.', partnership: 'collaborator' },
};

/** Opportunities from the Founder-managed role list (all roles when not configured). Fees are never shown. */
export function useOpportunities(programme: string, roles?: Role[] | null, exclude: Role[] = []): Opp[] {
  const list = (roles ?? ALL_ROLES).filter((r) => !exclude.includes(r));
  return list.map((r) => {
    const c = ROLE_COPY[r];
    return { key: r, name: c.name, benefit: c.benefit, href: c.partnership ? inquiryHref.partnership(programme, c.partnership) : inquiryHref.service(programme, r) };
  });
}

/** Expandable accordion of tailored opportunities. Only one open at a time keeps the screen calm. */
export function OpportunityList({ items, theme, dark = false }: { items: Opp[]; theme: ProgrammeTheme; dark?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const line = dark ? 'hsl(40 40% 94% / 0.16)' : 'hsl(30 15% 50% / 0.25)';
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.accent }}>TAILORED OPPORTUNITIES. AVAILABLE ON INQUIRY.</p>
      <ul className="mt-5 border-t" style={{ borderColor: line }}>
        {items.map((o, i) => {
          const isOpen = open === o.key;
          const panel = `opp-panel-${o.key}`;
          return (
            <li key={o.key} className="border-b" style={{ borderColor: line }}>
              <button type="button" aria-expanded={isOpen} aria-controls={panel} onClick={() => setOpen(isOpen ? null : o.key)}
                className="group flex min-h-14 w-full items-center gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2" style={{ ['--tw-ring-color' as string]: theme.accent }}
                data-testid={`button-opportunity-${o.key}`}>
                <span className="w-7 font-mono text-[11px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-lg tracking-[0.02em] sm:text-xl" style={{ fontFamily: 'var(--font-display)' }}>{o.name}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div id={panel} hidden={!isOpen} className="pb-5 pl-11">
                <p className="max-w-xl text-sm leading-relaxed opacity-80">{o.benefit}</p>
                <Link href={o.href} className="mt-4 inline-flex min-h-11 items-center gap-2 border-b text-xs font-semibold uppercase tracking-[0.18em]" style={{ borderColor: theme.accent, color: dark ? theme.accent : undefined }} data-testid={`link-opportunity-${o.key}`}>
                  Start inquiry <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
