import { PROGRAMS, type Program } from '@/lib/programs-data';
import { SECTORS, type Sector } from '@/lib/sectors-data';
import { ECOSYSTEM_RESOURCES, type EcosystemResource } from '@/lib/ecosystem-resources';

export function programsForSector(sector: Sector): Program[] {
  const names = sector.relatedPrograms.map((n) => n.toUpperCase());
  return PROGRAMS.filter((p) => names.includes(p.name.toUpperCase()));
}

export function resourcesForSector(slug: string): EcosystemResource[] {
  return ECOSYSTEM_RESOURCES.filter((r) => r.sectors.includes(slug));
}

export function programsForSectors(slugs: string[]): Program[] {
  const set = new Set<string>();
  slugs.forEach((s) => {
    const sec = SECTORS.find((x) => x.slug === s);
    if (sec) programsForSector(sec).forEach((p) => set.add(p.slug));
  });
  return PROGRAMS.filter((p) => set.has(p.slug));
}

export function resourcesForSectors(slugs: string[]): EcosystemResource[] {
  return ECOSYSTEM_RESOURCES.filter((r) => r.sectors.some((s) => slugs.includes(s)));
}

export function sectorName(slug: string): string {
  return SECTORS.find((s) => s.slug === slug)?.name ?? slug;
}

export const programItemId = (slug: string) => `program:${slug}`;
export const resourceItemId = (id: string) => `resource:${id}`;

export function formatChecked(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
