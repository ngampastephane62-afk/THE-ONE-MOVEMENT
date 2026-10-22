/** Verified Commons photo credits and Founder-supplied artwork; see public/images/emirates/LICENSES.md. */
const base = import.meta.env.BASE_URL;

export interface EmMedia { src: string; alt: string; credit: string; href?: string; licence?: boolean }

export const SHARED_VISION: EmMedia = {
  src: `${base}images/emirates/shared-vision.webp`,
  alt: 'The Abu Dhabi skyline seen across the water',
  credit: 'Wadiia (2014), Wikimedia Commons',
  href: 'https://commons.wikimedia.org/wiki/File:Abu_dhabi_skylines_2014.jpg',
  licence: true,
};
export const AL_FAHIDI: EmMedia = {
  src: `${base}images/emirates/al-fahidi.webp`,
  alt: 'Wind towers of the Al Fahidi Historical Neighbourhood in Dubai, with an aircraft overhead',
  credit: 'Delta.jpg, Wikimedia Commons',
  href: 'https://commons.wikimedia.org/wiki/File:Al_Fahidi_Historical_Neighbourhood,_Dubai.jpg',
  licence: true,
};
export const WORLD_GOLD: EmMedia = {
  src: `${base}images/vision/founder-world-gold.webp`,
  alt: 'World map rendered in points of gold light',
  credit: 'World artwork supplied by the TOMI Founder',
};
export const WORLD_EARTH: EmMedia = {
  src: `${base}images/vision/founder-world-earth.webp`,
  alt: 'Illuminated world map with connection lines at dusk',
  credit: 'World artwork supplied by the TOMI Founder',
};

/** Points on the 1000x667 gold world artwork. */
export const UAE_ON_WORLD = { x: 609, y: 355 };
export const WORLD_HUBS = [
  { k: 'europe', x: 520, y: 232 },
  { k: 'west-africa', x: 440, y: 340 },
  { k: 'east-africa', x: 552, y: 470 },
  { k: 'south-asia', x: 690, y: 352 },
  { k: 'east-asia', x: 800, y: 270 },
  { k: 'oceania', x: 815, y: 480 },
  { k: 'americas', x: 282, y: 296 },
  { k: 'south-america', x: 330, y: 452 },
];
/** Arc from the UAE to a hub, lifted proportionally to distance. */
export function arc(to: { x: number; y: number }, from = UAE_ON_WORLD) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  return `M${from.x} ${from.y} Q${mx} ${my - d * 0.32} ${to.x} ${to.y}`;
}

export function MediaCredit({ m, tone = 'light' }: { m: EmMedia; tone?: 'light' | 'dark' }) {
  const cls = tone === 'dark' ? 'text-ivory-300/80' : 'text-ink-700';
  return <p className={`mt-2 text-[10px] uppercase tracking-[0.16em] ${cls}`} data-testid="text-media-credit">
    {m.href ? <a href={m.href} target="_blank" rel="noopener noreferrer" className="em-focus underline">{m.credit}</a> : m.credit}
    {m.licence && <> · <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener noreferrer" className="em-focus underline">CC BY-SA 4.0</a> · resized, WebP, framed for display</>}
  </p>;
}
