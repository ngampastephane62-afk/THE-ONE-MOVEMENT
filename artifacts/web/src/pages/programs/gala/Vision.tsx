import { Eyebrow, GeoBand, display } from './Pattern';
import stillLife from '@/assets/media/programs/ecosystem-knowledge-still-life.jpg';
import cabinet from '@/assets/media/programs/ecosystem-cabinet-of-cultures.jpg';

export default function GalaVision() {
  return (
    <section className="bg-ivory-100 py-24 md:py-32" aria-labelledby="vision-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <Eyebrow>Our vision</Eyebrow>
          <h2 id="vision-heading" className="mt-6 text-[clamp(2.2rem,5.5vw,4.2rem)] leading-[0.95] text-ink-900" style={display}>EVERY NATION HAS A STORY TO SHARE.</h2>
          <GeoBand className="mt-8 max-w-[180px]" />
          <p className="mt-8 text-lg leading-relaxed text-ink-800">Heritage. Myth and science. Craft, music and medicine. Resources, media and trade. Every country carries all of them.</p>
          <p className="mt-4 leading-relaxed text-ink-700">The Gala opens a shared space where countries and communities present who they are, learn from one another, build relationships and explore collaboration.</p>
        </div>
        <div className="relative md:col-span-6 md:col-start-7">
          <figure className="ml-auto w-[82%]">
            <img src={stillLife} alt="Illustration: woven textiles, a stringed instrument, a statue fragment, scientific instruments and mineral specimens arranged as a still life" loading="lazy" width={1024} height={1024} className="aspect-[4/3] w-full object-cover" />
            <figcaption className="mt-2 text-[11px] text-ink-700">Concept illustration · not an event photograph</figcaption>
          </figure>
          <figure className="-mt-24 w-[46%] border-[6px] border-ivory-100 md:-mt-32">
            <img src={cabinet} alt="Illustration: gallery niches holding a mask, a globe, a stethoscope, a microphone, a dress form and a drum" loading="lazy" width={1024} height={1024} className="aspect-[3/4] w-full object-cover" />
            <figcaption className="bg-ivory-100 pt-2 text-[11px] text-ink-700">Concept illustration · objects are imagined</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
