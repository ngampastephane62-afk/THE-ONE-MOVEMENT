import { defaultHomeEditorial, type HomeEditorial, type HomeMedia, type HomeSection, type HomeSectionKey } from '@workspace/shared';

/** Safe internal destinations for editable homepage links. No free-form URLs. */
export const HOME_LINK_TARGETS = [
  { href: '/ecosystem', label: 'Ecosystem' },
  { href: '/ecosystem#discover', label: 'Ecosystem: discovery' },
  { href: '/programs', label: 'Programs' },
  { href: '/programs/fashion-week', label: 'Fashion Week' },
  { href: '/programs/awards', label: 'The One Awards' },
  { href: '/programs/summit', label: 'The One Summit' },
  { href: '/community', label: 'Community' },
  { href: '/ambassadors', label: 'Ambassadors' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/news', label: 'News' },
  { href: '/media', label: 'Media' },
  { href: '/partners', label: 'Partners' },
  { href: '/join', label: 'Join the Movement' },
  { href: '/donate', label: 'Humanitarian action' },
] as const;
const SAFE_HREFS = new Set<string>(HOME_LINK_TARGETS.map((l) => l.href));

export type FieldKind = 'line' | 'text' | 'link';
export interface FieldDef { key: string; label: string; kind: FieldKind; def: string; max: number; auto?: boolean }
export type Presentation = { layout: HomeSection['layout'][]; theme: HomeSection['theme'][]; alignment: HomeSection['alignment'][]; spacing: HomeSection['spacing'][] };
export interface MediaDef { key: string; label: string; kinds: ('image' | 'video')[]; note: string }
export interface SectionDef {
  type: HomeSectionKey; label: string; note: string; fields: FieldDef[]; media: MediaDef[];
  /** Presentation choices this section really supports. Missing = all. */
  presentation?: Partial<Presentation>;
  /** Layouts other than 'original' need this media slot filled to have a visible column. */
  layoutNeedsMedia?: string;
}
export const AUTO_HREF = 'auto';
const ALL: Presentation = { layout: ['original', 'stack', 'media-left', 'media-right'], theme: ['original', 'ivory', 'lagoon'], alignment: ['left', 'center'], spacing: ['compact', 'normal', 'large'] };
export const presentationOf = (t: HomeSectionKey): Presentation => ({ ...ALL, ...HOME_REGISTRY[t].presentation });

const L = (key: string, label: string, def: string, max = 140): FieldDef => ({ key, label, kind: 'line', def, max });
const T = (key: string, label: string, def: string, max = 900): FieldDef => ({ key, label, kind: 'text', def, max });
const H = (key: string, label: string, def: string, auto = false): FieldDef => ({ key, label, kind: 'link', def, max: 80, auto });

/** Registry of named, editable homepage fields. Defaults mirror the shipped source copy exactly. */
export const HOME_REGISTRY: Record<HomeSectionKey, SectionDef> = {
  hero: {
    type: 'hero', label: 'Ouverture (hero)', note: "Ouverture cinematographique : devise, logo officiel et appels a l'action.",
    fields: [
      L('mottoStrong', 'Devise, ligne 1', 'We Are One', 40),
      L('mottoSub', 'Devise, ligne 2', 'For Peace & Unity', 60),
      H('primaryHref', 'Bouton principal, destination', AUTO_HREF, true),
      L('primaryLabel', 'Bouton principal, libelle (si destination fixe)', 'Join the Movement', 50),
      L('secondaryLabel', 'Lien secondaire, libelle', 'Explore the Ecosystem', 50),
      H('secondaryHref', 'Lien secondaire, destination', '/ecosystem'),
    ],
    media: [
      { key: 'background', label: 'Image de fond', kinds: ['image'], note: 'Remplace le decor desert et Dubai.' },
      { key: 'bearer', label: 'Figure au premier plan', kinds: ['image'], note: 'Remplace le porteur du globe.' },
    ],
    presentation: { layout: ['original'], theme: ['original', 'lagoon'], alignment: ['left'] },
  },
  universe: {
    type: 'universe', label: 'The One Universe', note: 'Les 17 secteurs restent dynamiques et canoniques ; seul le cadre editorial change.',
    fields: [
      L('eyebrow', 'Surtitre', '17 SECTORS. ONE ECOSYSTEM.'), L('heading', 'Titre', 'THE ONE UNIVERSE'),
      L('ctaLabel', 'Bouton, libelle', 'EXPLORE THE ECOSYSTEM', 50), H('ctaHref', 'Bouton, destination', '/ecosystem'),
      L('linkLabel', 'Lien, libelle', 'What are you looking for in the world?'), H('linkHref', 'Lien, destination', '/ecosystem#discover'),
    ],
    media: [{ key: 'feature', label: 'Visuel complementaire', kinds: ['image', 'video'], note: 'Optionnel, affiche avec le titre.' }],
  },
  programmes: {
    type: 'programmes', label: 'Programmes officiels', note: 'Les faits des programmes (noms, dates, medias) restent geres dans Programs & Events.',
    fields: [L('eyebrow', 'Surtitre', 'OFFICIAL PROGRAMS'), L('heading', 'Titre', 'WHERE THE MOVEMENT MEETS'), L('allLabel', 'Lien, libelle', 'All programs', 40), H('allHref', 'Lien, destination', '/programs')],
    media: [{ key: 'feature', label: 'Visuel complementaire', kinds: ['image', 'video'], note: 'Optionnel, affiche avec le titre.' }],
    layoutNeedsMedia: 'feature',
  },
  movement: {
    type: 'movement', label: 'Le Mouvement', note: 'Explication courte et film vertical.',
    fields: [
      L('eyebrow', 'Surtitre', 'WHAT IS THE ONE MOVEMENT?'), L('heading', 'Titre', 'A MOVEMENT TO JOIN. A VISION TO BUILD.'),
      T('body', 'Texte', 'Born from a fashion initiative for peace in the Democratic Republic of Congo, TOMI connects people and institutions through real programs today while building toward a wider global collaboration ecosystem.'),
    ],
    media: [{ key: 'reel', label: 'Film du mouvement', kinds: ['video', 'image'], note: 'Remplace le reel vertical.' }],
  },
  origin: {
    type: 'origin', label: "L'origine", note: 'Fashion Week, le point de depart.',
    fields: [
      L('eyebrow', 'Surtitre', 'THE MOVEMENT IN ACTION'), L('heading', 'Titre', 'WHERE THE STORY BEGAN'),
      L('kicker', 'Accroche', 'FIVE EDITIONS COMPLETED · SIXTH IN DUBAI'), L('title', 'Sous-titre', 'THE ONE FASHION WEEK INTERNATIONAL'),
      T('body', 'Texte', 'Fashion carried a message of peace from Bukavu to Goma and Kinshasa. Five editions are complete. The sixth, the first in Dubai, takes place on 22 December 2026.'),
      L('ctaLabel', 'Bouton, libelle', 'DISCOVER THE STORY', 50), H('ctaHref', 'Bouton, destination', '/programs/fashion-week'),
    ],
    media: [{ key: 'feature', label: 'Media principal', kinds: ['image', 'video'], note: 'Remplace la bande de reels.' }],
  },
  archive: {
    type: 'archive', label: 'Archive du Fondateur', note: 'Connexions a travers les mondes.',
    fields: [
      L('eyebrow', 'Surtitre', 'MOVEMENT IN ACTION'), L('heading', 'Titre', 'CONNECTIONS ACROSS WORLDS.'),
      T('body', 'Texte', 'Communities, institutions and culture connected through one network, shown through the Founder archive.', 400),
      L('tag', 'Mention', 'Founder archive / partner network', 80),
    ],
    media: [{ key: 'feature', label: 'Media principal', kinds: ['image', 'video'], note: 'Remplace le carrousel archive.' }],
  },
  paths: {
    type: 'paths', label: 'Chemins', note: 'Trois entrees vers des pages publiques reelles.',
    fields: [
      L('eyebrow', 'Surtitre', 'PEOPLE & POSSIBILITIES'), L('heading', 'Titre', 'A shared mission. Your own way in.'),
      T('lede', 'Introduction', 'Artists, creators, professionals and changemakers — different experiences, connected by a common purpose.', 400),
      H('p1Href', 'Chemin 1, destination', '/community'),
      L('p1Title', 'Chemin 1, titre', 'Meet the community', 60), T('p1Text', 'Chemin 1, texte', 'Discover the members who have chosen to share their profiles. Every person decides what to make public.', 300),
      H('p2Href', 'Chemin 2, destination', '/ambassadors'),
      L('p2Title', 'Chemin 2, titre', 'Discover the voices', 60), T('p2Text', 'Chemin 2, texte', 'Explore the people and stories presented by TOMI, with their individual roles and recognition clearly identified.', 300),
      H('p3Href', 'Chemin 3, destination', '/opportunities'),
      L('p3Title', 'Chemin 3, titre', 'Find your contribution', 60), T('p3Text', 'Chemin 3, texte', 'Explore existing ways to take part, collaborate and bring your work into the movement.', 300),
    ],
    media: [{ key: 'feature', label: 'Visuel complementaire', kinds: ['image', 'video'], note: 'Optionnel, affiche avec le titre.' }],
    layoutNeedsMedia: 'feature',
  },
  join: {
    type: 'join', label: 'Rejoindre', note: 'Conclusion et appel a rejoindre.',
    fields: [
      L('eyebrow', 'Surtitre', 'THE NEXT CONNECTION'), L('heading', 'Titre', 'YOUR PLACE IN THE MOVEMENT STARTS HERE.'),
      T('body', 'Texte', "You don't just join a platform. You become part of a global mission. The public website introduces TOMI. Participation begins with an expression of interest and a real conversation.", 500),
      H('primaryHref', 'Bouton principal, destination', AUTO_HREF, true),
      L('primaryLabel', 'Bouton principal, libelle (si destination fixe)', 'Join the Movement', 50),
    ],
    presentation: { layout: ['original'], alignment: ['left'] },
    media: [{ key: 'background', label: 'Image de fond', kinds: ['image'], note: 'Optionnelle, sous le motif.' }],
  },
  custom: {
    type: 'custom', label: 'Section personnalisee', note: 'Bloc editorial libre : texte, media et lien interne.',
    fields: [
      L('eyebrow', 'Surtitre', 'TOMI'), L('heading', 'Titre', 'A NEW CHAPTER'),
      T('body', 'Texte', ''), L('linkLabel', 'Lien, libelle', '', 50), H('linkHref', 'Lien, destination', '/programs'),
    ],
    media: [{ key: 'feature', label: 'Media', kinds: ['image', 'video'], note: 'Image ou video.' }],
  },
};

export const DEFAULT_TYPES = (['hero', 'universe', 'programmes', 'movement', 'origin', 'archive', 'paths', 'join'] as const);

/** Protected asset endpoint, base-path safe. Upload IDs are kept; URLs are always derived. */
export const homeAssetUrl = (uploadId: string) => `${import.meta.env.BASE_URL}api/home-editorial/assets/${encodeURIComponent(uploadId)}`;

export type MediaResolver = (m: HomeMedia) => string;
/** Public and saved-draft source: always the protected home endpoint, never a stored raw URL. */
export const savedResolver: MediaResolver = (m) => homeAssetUrl(m.uploadId);

export interface SectionView {
  section: HomeSection;
  /** Value of a field: the Founder's value when the key is present (even empty), else the source default. */
  t: (key: string) => string;
  /** Founder value when the key is present and differs from the source default (empty string = deliberately cleared). */
  ov: (key: string) => string | null;
  href: (key: string) => string;
  m: (key: string) => (HomeMedia & { src: string }) | null;
}

export function viewOf(section: HomeSection, resolve: MediaResolver = savedResolver): SectionView {
  const def = HOME_REGISTRY[section.type];
  const fd = (k: string) => def.fields.find((f) => f.key === k);
  const d = (k: string) => fd(k)?.def ?? '';
  const has = (k: string) => !!section.fields && Object.prototype.hasOwnProperty.call(section.fields, k) && typeof section.fields[k] === 'string';
  const ov = (k: string) => (has(k) && section.fields[k] !== d(k) ? section.fields[k] : null);
  return {
    section,
    ov,
    t: (k) => ov(k) ?? d(k),
    href: (k) => {
      const v = ov(k) ?? d(k);
      if (v === AUTO_HREF && fd(k)?.auto) return AUTO_HREF;
      return SAFE_HREFS.has(v) ? v : d(k);
    },
    m: (k) => {
      const x = section.media?.find((mm) => mm.key === k && mm.uploadId);
      return x ? { ...x, src: resolve(x) } : null;
    },
  };
}

export const defaultView = (type: HomeSectionKey) => viewOf({ id: type, type, enabled: true, layout: 'original', theme: 'original', alignment: 'left', spacing: 'normal', fields: {}, media: [] });

export const isOriginalPresentation = (s: HomeSection) => s.layout === 'original' && s.theme === 'original' && s.alignment === 'left' && s.spacing === 'normal';

export function normalizeDoc(doc: HomeEditorial | null | undefined): HomeEditorial {
  if (!doc || !Array.isArray(doc.sections)) return defaultHomeEditorial();
  return doc;
}

export function newSection(type: HomeSectionKey): HomeSection {
  const id = type === 'custom' ? `custom-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}` : type;
  return { id, type, enabled: true, layout: type === 'custom' ? 'stack' : 'original', theme: type === 'custom' ? 'ivory' : 'original', alignment: 'left', spacing: 'normal', fields: {}, media: [] };
}

export interface Issue { sectionId: string; message: string }
/** Publishing requires rights, credit and (for images) alt text on every media item. */
export function publishIssues(doc: HomeEditorial): Issue[] {
  const out: Issue[] = [];
  for (const s of doc.sections) {
    if (!s.enabled) continue;
    const label = HOME_REGISTRY[s.type].label;
    for (const m of s.media) {
      const slot = HOME_REGISTRY[s.type].media.find((x) => x.key === m.key)?.label ?? m.key;
      if (!m.rightsConfirmed) out.push({ sectionId: s.id, message: `${label} · ${slot} : droits non confirmes.` });
      if (!m.credit.trim()) out.push({ sectionId: s.id, message: `${label} · ${slot} : credit manquant.` });
      if (m.kind === 'image' && !m.alt.trim()) out.push({ sectionId: s.id, message: `${label} · ${slot} : texte alternatif manquant.` });
    }
    if (s.type === 'custom' && !(s.fields.heading ?? '').trim() && !(s.fields.body ?? '').trim()) out.push({ sectionId: s.id, message: `${label} : ajoutez au moins un titre ou un texte.` });
  }
  return out;
}
