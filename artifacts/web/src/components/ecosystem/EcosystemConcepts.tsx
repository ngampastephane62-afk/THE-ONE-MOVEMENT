import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowRight, BookOpen, KeyRound, Palette } from 'lucide-react';
import '@/styles/worlds.css';
import OneKey from './exhibition/OneKey';
import { useStage } from './exhibition/useStage';

export const ONE_KEY_POSSIBILITIES = [
  'Enhanced guided experiences',
  'Professional service requests',
  'Optional learning experiences',
  'Partner service benefits',
  'Advanced professional tools',
  'Clearly defined commercial services',
];

export interface ConnectedBrand { id: string; name: string; role: string; href?: string; status: string }

/** Only confirmed internal routes are linked. OYE has no destination yet and stays a labelled concept. */
export const CONNECTED_BRANDS: ConnectedBrand[] = [
  { id: 'the-one-movement', name: 'The One Movement', role: 'The movement and its seventeen worlds', href: '/our-vision', status: 'On this site' },
  { id: 'tropik-agency', name: 'Tropik Agency', role: 'Agency behind the magazine and media kit', href: '/tropik-magazine', status: 'Presented on the magazine page' },
  { id: 'tropik-magazine', name: 'Tropik Magazine', role: 'Editorial publication', href: '/tropik-magazine', status: 'On this site' },
  { id: 'oye', name: 'OYE', role: 'Future navigation concept', status: 'Planned. No page or service yet.' },
];

export default function EcosystemConcepts() {
  const { ref, attrs } = useStage<HTMLDivElement>();
  return (
    <section aria-label="Future concepts and connected brands" className="bg-ivory-100 pb-16">
      <div ref={ref} {...attrs} className="x-onekey py-20 text-ivory-100 lg:py-28" data-testid="section-one-key">
        <div className="x-content mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
          <div className="x-onekey-art x-rise relative lg:col-span-6" aria-hidden="true">
            <div className="x-keyspin relative px-4 py-16"><OneKey className="mx-auto w-full max-w-lg" /></div>
          </div>
          <div className="lg:col-span-6">
            <p className="x-track text-eyebrow text-gold-400">Future concept · not available yet</p>
            <h2 className="mt-3 text-display-lg">
              <span className="x-line"><span style={{ '--d': '120ms' } as CSSProperties}>THE ONE KEY.</span></span>
            </h2>
            <p className="x-fade mt-2 font-display text-sm tracking-[0.18em] text-gold-400" style={{ '--d': '320ms' } as CSSProperties}>ONE KEY. INFINITE POSSIBILITIES.</p>
            <p className="x-fade mt-5 max-w-xl text-sm leading-relaxed text-ivory-200" style={{ '--d': '460ms' } as CSSProperties}>An optional key being considered for additional services in the future. Free belonging, public information, ordinary community participation and exploring the seventeen worlds never require it. It is not available today and has no price, payment or subscription. Any future paid service would be described separately before anyone chose it.</p>
            <ul className="x-stagger mt-6 grid gap-x-6 gap-y-3 border-t border-gold-500/20 pt-6 sm:grid-cols-2">
              {ONE_KEY_POSSIBILITIES.map((p, i) => <li key={p} style={{ '--d': `${560 + i * 90}ms` } as CSSProperties} className="flex items-center gap-2 text-sm text-ivory-200"><KeyRound className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" /> {p}</li>)}
            </ul>
            <p className="x-fade mt-5 text-xs text-ivory-300" style={{ '--d': '1100ms' } as CSSProperties}>It will never promise meetings, investment, contracts, government access, institutional influence or media publication.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="border border-lagoon-600/40 bg-lagoon-900 p-6 text-ivory-100 md:p-8" data-testid="section-creative-space">
            <Palette className="h-6 w-6 text-gold-400" aria-hidden="true" />
            <p className="mt-4 text-eyebrow text-gold-400">Concept · early-access enquiry</p>
            <h3 className="mt-2 text-display-md">THE ONE CREATIVE SPACE</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory-300">A future space for artists and graphic designers to contribute work about their countries, cultures, communities, disciplines and personal perspectives. It is not open yet. Future submissions will require rights checks and editorial approval before publication; nothing is published automatically. For now, describe your practice on your existing member profile or send a general enquiry. This is not a creative-file upload form.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/join#institutional-inquiry" className="sw-cta" data-testid="link-creative-space-enquiry">Send a general enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/member" className="sw-link" data-testid="link-creative-space-profile">Open my member space</Link>
            </div>
          </div>
          <div className="border border-sand-200 bg-ivory-50 p-6 md:p-8" data-testid="section-connected-brands">
            <BookOpen className="h-6 w-6 text-lagoon-600" aria-hidden="true" />
            <p className="mt-4 text-eyebrow text-gold-700">Connected brands</p>
            <h3 className="mt-2 text-display-md text-ink-900">ONE FAMILY, SEPARATE IDENTITIES</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">Distinct brands, voices and commercial journeys. No shared legal ownership is asserted and no payment flows are combined. Only pages that already exist on this site are linked.</p>
            <ul className="mt-5 space-y-2">
              {CONNECTED_BRANDS.map((b) => {
                const body = <span><span className="block font-display text-sm tracking-[0.08em] text-ink-900">{b.name}</span><span className="block text-xs text-ink-700">{b.role}</span><span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-gold-700">{b.status}</span></span>;
                return (
                  <li key={b.id}>
                    {b.href ? (
                      <Link href={b.href} className="flex min-h-[44px] items-center justify-between border border-sand-200 px-4 py-3 hover:border-gold-500" data-testid={`link-brand-${b.id}`}>
                        {body}<ArrowRight className="h-4 w-4 text-gold-600" aria-hidden="true" />
                      </Link>
                    ) : (
                      <div className="flex min-h-[44px] items-center border border-dashed border-sand-300 px-4 py-3" data-testid={`text-brand-${b.id}`}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
