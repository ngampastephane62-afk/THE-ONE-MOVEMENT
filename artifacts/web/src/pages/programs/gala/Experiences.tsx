import { Link } from 'wouter';
import hall from '@/assets/media/programs/gala-concept-pavilion.jpg';
import forumImg from '@/assets/media/programs/gala-partner-meeting.webp';
import { Eyebrow, GeoBand, display } from './Pattern';

type Exp = { letter: string; title: string; line: string; img: string; srcSet?: string; alt: string; caption: string; tone: string; action: React.ReactNode };

export default function GalaExperiences() {
  const items: Exp[] = [
    { letter: 'A', title: 'THE WORLD PAVILIONS', line: 'Discover cultures, traditions, businesses, creative talent and innovation.', img: hall, alt: 'Concept pavilion display of textiles and crafts', caption: 'Concept visual', tone: 'bg-lagoon-800',
      action: <a href="#world-pavilions" className="link-gala">Walk the pavilions</a> },
    { letter: 'B', title: 'THE DIPLOMATIC & BUSINESS FORUM', line: 'Dialogue, networking and potential collaboration between institutions, organisations, entrepreneurs and business leaders.', img: forumImg, alt: 'Institutional partner meeting', caption: 'Institutional partner meeting · Founder archive, not a Gala session', tone: 'bg-[hsl(162_45%_16%)]',
      action: <Link href="/partners" className="link-gala">See our partners</Link> },
    { letter: 'C', title: 'THE GRAND CULTURAL GALA', line: 'Music, dance, artistic expression and performance celebrating cultural diversity, subject to the confirmed programme.', img: '/brand-photos/founder/cultural-performance-800.webp', srcSet: '/brand-photos/founder/cultural-performance-800.webp 800w, /brand-photos/founder/cultural-performance.webp 2000w', alt: 'Cultural performance on stage', caption: 'Cultural performance · Founder archive', tone: 'bg-lagoon-900',
      action: <a href="#cultural-experience" className="link-gala">The cultural experience</a> },
  ];
  return (
    <section id="experience" className="scroll-mt-20 bg-ivory-50" aria-labelledby="experience-heading">
      <style>{`.link-gala{display:inline-flex;min-height:44px;align-items:center;border-bottom:1px solid hsl(43 80% 73%);color:hsl(43 80% 73%);font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;font-weight:600}.link-gala:hover{color:hsl(38 57% 94%)}.link-gala:focus-visible{outline:2px solid hsl(43 80% 73%);outline-offset:4px}`}</style>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Eyebrow>Three core experiences</Eyebrow>
        <h2 id="experience-heading" className="mt-6 max-w-3xl text-[clamp(2rem,5vw,3.6rem)] leading-[0.95] text-ink-900" style={display}>ONE ROOF. THREE WAYS TO MEET THE WORLD.</h2>
      </div>
      {items.map((e, i) => (
        <article key={e.letter} className={`${e.tone} text-ivory-100`}>
          <div className={`mx-auto grid max-w-7xl md:grid-cols-2 md:items-stretch ${i % 2 ? 'md:[&>figure]:order-2' : ''}`}>
            <figure className="relative">
              <img src={e.img} srcSet={e.srcSet} sizes="(min-width:768px) 50vw, 100vw" alt={e.alt} loading="lazy" className="h-full max-h-[620px] min-h-[320px] w-full object-cover" />
              <figcaption className="absolute bottom-3 left-3 bg-ink-900/75 px-2 py-1 text-[11px] text-ivory-200">{e.caption}</figcaption>
            </figure>
            <div className="flex flex-col justify-center px-6 py-14 md:px-14">
              <span className="text-[5rem] leading-none text-gold-500/40" style={display} aria-hidden="true">{e.letter}</span>
              <h3 className="mt-2 text-[clamp(1.7rem,3.6vw,2.8rem)] leading-tight" style={display}>{e.title}</h3>
              <GeoBand className="mt-6 max-w-[140px]" />
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory-200">{e.line}</p>
              <div className="mt-8">{e.action}</div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
