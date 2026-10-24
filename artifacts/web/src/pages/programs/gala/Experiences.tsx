import { Link } from 'wouter';
import SectionHeading from '@/components/SectionHeading';
import Reveal from '@/components/Reveal';
import { GeoBand, display } from './Pattern';

type Exp = { letter: string; title: string; line: string; action: React.ReactNode };

/** Three core experiences, mission-first. No archive photographs here: event images belong to confirmed editions. */
export default function GalaExperiences() {
  const items: Exp[] = [
    { letter: 'A', title: 'CULTURE', line: 'Communities present living traditions, arts and craft from their own countries and continents.',
      action: <a href="#cultural-experience" className="link-gala">The cultural experience</a> },
    { letter: 'B', title: 'DIALOGUE', line: 'Institutions, organisations and entrepreneurs meet for exchange and potential collaboration.',
      action: <a href="#world-pavilions" className="link-gala">The pavilions</a> },
    { letter: 'C', title: 'PEACE', line: 'A shared commitment to peaceful coexistence, expressed through performance and connection.',
      action: <Link href="/partners" className="link-gala">Our network</Link> },
  ];
  return (
    <section id="experience" className="scroll-mt-20 bg-lagoon-900 text-ivory-100" aria-labelledby="experience-heading">
      <style>{`.link-gala{display:inline-flex;min-height:44px;align-items:center;border-bottom:1px solid hsl(43 80% 73%);color:hsl(43 80% 73%);font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;font-weight:600}.link-gala:hover{color:hsl(38 57% 94%)}.link-gala:focus-visible{outline:2px solid hsl(43 80% 73%);outline-offset:4px}`}</style>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <SectionHeading id="experience-heading" eyebrow="Mission" heading={'CULTURE. DIPLOMACY.\nDIALOGUE. PEACE.'} surface="dark" thread />
        <ol className="mt-12 grid gap-px bg-lagoon-700/50 md:grid-cols-3">
          {items.map((e, i) => (
            <li key={e.letter} className="bg-lagoon-900">
              <Reveal delay={i * 110} className="flex h-full flex-col p-6 md:p-8">
                <span className="text-[3.5rem] leading-none text-gold-500/40" style={display} aria-hidden="true">{e.letter}</span>
                <h3 className="mt-2 text-2xl leading-tight" style={display}>{e.title}</h3>
                <GeoBand className="mt-4 max-w-[120px]" />
                <p className="mt-4 leading-relaxed text-ivory-200">{e.line}</p>
                <div className="mt-auto pt-6">{e.action}</div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
