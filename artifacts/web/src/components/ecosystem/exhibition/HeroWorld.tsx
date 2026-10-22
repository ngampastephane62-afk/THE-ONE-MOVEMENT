const BASE = import.meta.env.BASE_URL;

/** Behind-content atmosphere: the Founder's world, slowly turning, with drifting mist planes. */
export default function HeroWorld() {
  return (
    <>
      <div className="x-decor x-hero-world" aria-hidden="true">
        <div className="x-halo two" />
        <div className="x-halo" />
        <div className="x-globe"><img src={`${BASE}images/vision/founder-world-earth.webp`} alt="" decoding="async" /></div>
      </div>
      <div className="x-decor x-mist" aria-hidden="true" />
      <div className="x-decor x-mist b" aria-hidden="true" />
      <div className="x-decor x-veil" aria-hidden="true" />
    </>
  );
}
