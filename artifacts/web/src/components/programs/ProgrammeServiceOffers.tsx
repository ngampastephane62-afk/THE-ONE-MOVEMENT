import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { getProgrammeServiceOffers } from '@workspace/shared';
import SectionHeading from '@/components/SectionHeading';

const enquiry = (programme: string, role: string, sponsor = false) =>
  `/join?intent=programme-service&program=${encodeURIComponent(programme)}&service=${encodeURIComponent(role)}${sponsor ? '&coverage=existing-sponsor' : ''}#institutional-inquiry`;

export default function ProgrammeServiceOffers({ programme }: { programme: string }) {
  const offers = getProgrammeServiceOffers(programme);
  if (offers.length === 0) return null;
  const hasPricedSpeaker = offers.some((o) => o.role === 'speaker' && o.priceUsd !== null);

  return (
    <section className="border-b border-sand-200 bg-ivory-50 py-section-md" aria-labelledby="programme-services-heading" data-testid="section-programme-services">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5" id="programme-services-heading">
            <SectionHeading eyebrow={`TAKE PART · ${offers[0].programmeName}`} heading="PROFESSIONAL SERVICES" size="md" thread />
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-ink-700 lg:col-span-7">
            <p>
              Paid participation services for professionals who want to work, present or showcase at this programme. They are activity-specific services, not a sponsorship requirement.
            </p>
            <p>
              Depending on the agreed scope, a service can include photos and video, branding, distribution of highlights, networking and potential documentary or editorial coverage. A documented written scope decides the deliverables; media partners keep their editorial independence, and coverage by or appearance on any named broadcaster is never guaranteed.
            </p>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 border-t border-sand-300 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o) => (
            <li key={o.role} className="flex flex-col border-b border-sand-300 p-5 transition-colors duration-200 hover:bg-ivory-100 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0" data-testid={`card-service-${o.role}`}>
              <h3 className="font-display text-lg text-ink-900">{o.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-700">{o.benefit}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-gold-700" data-testid={`text-service-price-${o.role}`}>
                {o.priceUsd !== null ? `USD ${o.priceUsd.toLocaleString('en-US')} · non-sponsors` : 'Tailored fee on enquiry'}
              </p>
              <Link href={enquiry(programme, o.role)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-service-enquiry-${o.role}`}>
                Enquire <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {o.role === 'speaker' && o.priceUsd !== null && (
                <Link href={enquiry(programme, 'speaker', true)} className="mt-2 text-xs text-ink-700 underline underline-offset-4 hover:text-lagoon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-service-speaker-sponsor">
                  Already a sponsor? Check what is included
                </Link>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-ink-700" data-testid="text-service-sponsor-note">
          {hasPricedSpeaker
            ? 'The listed speaker fee applies to non-sponsors. '
            : ''}
          Already a sponsor? Ask us to check what is included before paying separately — not every sponsorship tier includes every service. Every enquiry is reviewed and confirmed in a written agreement; nothing is charged online.
        </p>
      </div>
    </section>
  );
}
