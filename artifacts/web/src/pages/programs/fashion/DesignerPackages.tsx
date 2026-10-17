import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { DESIGNER_PACKAGES, getDesignerApplicationPath } from '@/lib/fashion-participation';

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(amount);

/** The shared package catalogue defines all amounts in cents. */
function priceLabel(amount: number, currency: string) {
  return money(amount / 100, currency);
}

export default function DesignerPackages({ onEnquire }: { onEnquire: () => void }) {
  const { isSignedIn } = useAuth();
  return (
    <div className="mt-10" data-testid="designer-packages">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-gold-600">Designer selection packages · Membership Kit</p>
          <h4 className="mt-2 font-display text-2xl text-ink-900">Compare the five annual designer packages</h4>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-ink-700">
          One annual payment covering 12 months. No automatic renewal. A free account is separate and does not include a package.
        </p>
      </div>

      <div className="mt-6 -mx-6 overflow-x-auto px-6 pb-2">
        <ol className="grid min-w-[860px] grid-cols-5 gap-px bg-sand-300 border border-sand-300">
          {DESIGNER_PACKAGES.map((p, i) => (
            <li key={p.slug} className={`flex flex-col p-5 ${i === 4 ? 'bg-lagoon-900 text-ivory-100' : 'bg-ivory-50 text-ink-900'}`} data-testid={`card-package-${p.slug}`}>
              <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${i === 4 ? 'text-gold-400' : 'text-gold-600'}`}>Tier {String(i + 1).padStart(2, '0')}</p>
              <h5 className="mt-2 font-display text-xl">{p.name}</h5>
              <p className="mt-3 font-display text-3xl" data-testid={`text-price-${p.slug}`}>{priceLabel(p.amount, p.currency)}</p>
              <p className={`text-xs ${i === 4 ? 'text-ivory-300' : 'text-ink-700'}`}>per year · {p.durationMonths} months · single payment</p>
              <dl className={`mt-5 space-y-3 text-xs leading-snug ${i === 4 ? 'text-ivory-200' : 'text-ink-800'}`}>
                {([['Runway', p.runwayLooks], ['VIP passes', p.vipPasses], ['Exhibition', p.exhibition], ['Travel', p.travel]] as const).map(([k, v]) => (
                  <div key={k}><dt className="uppercase tracking-[0.14em] opacity-70 text-[0.6rem]">{k}</dt><dd className="mt-0.5">{v}</dd></div>
                ))}
              </dl>
              <ul className={`mt-5 space-y-1.5 text-xs leading-snug ${i === 4 ? 'text-ivory-200' : 'text-ink-800'}`}>
                {p.benefits.map((b) => <li key={b} className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold-500" />{b}</li>)}
              </ul>
              <p className={`mt-4 text-[0.7rem] italic leading-snug ${i === 4 ? 'text-ivory-300' : 'text-ink-700'}`}>{p.conditions}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={isSignedIn ? getDesignerApplicationPath(p.slug)! : `/sign-in?fashionPackage=${encodeURIComponent(p.slug)}`}
                  data-testid={`link-apply-${p.slug}`}
                  className={`inline-flex min-h-11 w-full items-center justify-center px-3 text-center text-[0.7rem] font-semibold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${i === 4 ? 'bg-gold-500 text-ink-900 hover:bg-gold-400' : 'border border-lagoon-900 text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100'}`}
                >
                  Apply for selection
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-l-2 border-gold-500 bg-ivory-200/60 p-4">
        <p className="flex-1 min-w-[16rem] text-xs leading-relaxed text-ink-800">
          Applications are reviewed by the team. If accepted, you receive a written agreement; payment is requested only after approval and only where secure payment is configured. Signing in is required.
        </p>
        <button type="button" onClick={onEnquire} data-testid="button-designer-enquiry" className="min-h-11 border border-lagoon-900 px-4 text-xs font-semibold uppercase tracking-wider text-lagoon-900 hover:bg-lagoon-900 hover:text-ivory-100">
          Not sure yet? Send an enquiry
        </button>
      </div>
    </div>
  );
}
