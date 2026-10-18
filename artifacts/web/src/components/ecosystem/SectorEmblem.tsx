import {
  Briefcase, Building2, Clapperboard, Cpu, Footprints, GraduationCap, HandHeart,
  HeartHandshake, Landmark, Lightbulb, Music, Newspaper, Palette, Plane, Shirt,
  Stethoscope, TrendingUp, type LucideIcon,
} from 'lucide-react';

/** The same editorial symbols in the universe and its sector gateways. */
export const SECTOR_ICONS: Record<string, LucideIcon> = {
  fashion: Shirt, music: Music, dance: Footprints, film: Clapperboard, art: Palette,
  business: Briefcase, investment: TrendingUp, tourism: Plane, diplomacy: Landmark,
  innovation: Lightbulb, technology: Cpu, ngos: HandHeart, media: Newspaper,
  education: GraduationCap, 'real-estate': Building2, 'health-care': Stethoscope,
  'humanitarian-action': HeartHandshake,
};

export default function SectorEmblem({ slug }: { slug: string }) {
  const Icon = SECTOR_ICONS[slug] ?? Lightbulb;
  return <Icon className="tomi-gateway-emblem" aria-hidden="true" strokeWidth={1.25} />;
}
