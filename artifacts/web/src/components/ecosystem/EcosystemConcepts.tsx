import { Link } from 'wouter';
import { ArrowRight, BookOpen, KeyRound, Palette } from 'lucide-react';
import '@/styles/worlds.css';

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

function KeyMark() {
  return (
    <svg viewBox="0 0 160 160" className="ok-key h-40 w-40" aria-hidden="true">
      <circle cx="56" cy="80" r="34" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="56" cy="80" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M90 80 H150 M130 80 V98 M144 80 V92" fill="none" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 17 }, (_, i) => { const a = (i / 17) * Math.PI * 2; return <circle key={i} cx={56 + Math.cos(a) * 46} cy={80 + Math.sin(a) * 46} r="1.8" fill="currentColor" className="wm-pulse" style={{ animationDelay: `${i * 120}ms` }} />; })}
    </svg>
  );
}

export default function EcosystemConcepts() {
  return (
    <section aria-label="Future concepts and connected brands" className="bg-ivory-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 border border-sand-200 bg-ivory-50 p-6 md:grid-cols-[auto_1fr] md:p-10" data-testid="section-one-key">
          <KeyMark />
          <div>
            <p className="text-eyebrow text-gold-700">Future concept · not available yet</p>
            <h2 className="mt-2 text-display-md text-ink-900">THE ONE KEY</h2>
            <p className="mt-1 font-display text-sm tracking-[0.14em] text-lagoon-600">ONE KEY. INFINITE POSSIBILITIES.</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-700">An optional key being considered for additional services in the future. Free belonging, public information, ordinary community participation and exploring the seventeen worlds never require it. It is not available today and has no price, payment or subscription. Any future paid service would be described separately before anyone chose it.</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {ONE_KEY_POSSIBILITIES.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-ink-800"><KeyRound className="h-4 w-4 text-gold-600" aria-hidden="true" /> {p}</li>)}
            </ul>
            <p className="mt-4 text-xs text-ink-700">It will never promise meetings, investment, contracts, government access, institutional influence or media publication.</p>
          </div>
        </div>

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
