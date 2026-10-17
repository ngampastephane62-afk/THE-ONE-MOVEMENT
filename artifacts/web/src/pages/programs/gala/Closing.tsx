import { GeoBand, GeoField, display } from './Pattern';

export default function GalaClosing() {
  return (
    <section className="relative isolate overflow-hidden bg-lagoon-900 px-6 py-28 text-center text-ivory-100 md:py-40" aria-labelledby="closing-heading">
      <GeoField className="absolute inset-0 -z-10" />
      <h2 id="closing-heading" className="mx-auto max-w-5xl text-[clamp(2.2rem,6.5vw,5.2rem)] leading-[0.95]" style={display}>
        MANY NATIONS.<br />MANY CULTURES.<br /><span className="text-gold-400">ONE SHARED FUTURE.</span>
      </h2>
      <p className="mx-auto mt-8 max-w-xl text-lg text-ivory-200">A place to discover one another, celebrate our differences and explore what we can build together.</p>
      <GeoBand className="mx-auto mt-12 max-w-[220px]" opacity={0.8} />
      <p className="mt-8 text-xs font-semibold tracking-[0.3em] text-ivory-200">THE ONE MOVEMENT INTERNATIONAL</p>
      <p className="mt-3 text-2xl tracking-[0.2em] text-gold-400" style={display}>WE ARE ONE.</p>
    </section>
  );
}
