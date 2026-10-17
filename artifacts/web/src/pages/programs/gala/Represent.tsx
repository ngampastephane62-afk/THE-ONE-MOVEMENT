import { forwardRef } from 'react';
import { Link } from 'wouter';
import InquiryForm from '@/pages/join/InquiryForm';
import { Eyebrow, GeoField, display } from './Pattern';

const GalaRepresent = forwardRef<HTMLHeadingElement, { category: string; onCategoryChange: (value: string) => void }>(function GalaRepresent({ category, onCategoryChange }, ref) {
  return (
    <section id="represent-country" className="relative isolate scroll-mt-16 overflow-hidden bg-lagoon-900 py-24 text-ivory-100 md:py-32" aria-labelledby="represent-heading">
      <GeoField className="absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow dark>Represent your country</Eyebrow>
          <h2 id="represent-heading" ref={ref} tabIndex={-1} className="mt-6 text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.92] outline-none" style={display}>BRING YOUR COUNTRY TO THE GALA.</h2>
          <p className="mt-6 text-lg text-ivory-200">Bring your nation's culture, talent, businesses and ideas to a shared international stage.</p>
          <ul className="mt-10 space-y-4 border-l border-gold-500/40 pl-5 text-sm text-ivory-300">
            <li>An enquiry opens a conversation. It is not a confirmed pavilion, place or booking.</li>
            <li>Official national representation is recognised only once confirmed with the relevant authority.</li>
            <li>Larger institutional partnership? <Link href="/join?intent=partnership#institutional-inquiry" className="text-gold-400 underline underline-offset-4">Use the partnership enquiry</Link>.</li>
          </ul>
        </div>
        <div className="lg:col-span-7">
          <div className="border border-gold-500/30 bg-lagoon-800/80 p-5 sm:p-8">
            <InquiryForm intent="diplomatic-gala" participationCategory={category} onParticipationCategoryChange={onCategoryChange} />
          </div>
        </div>
      </div>
    </section>
  );
});

export default GalaRepresent;
