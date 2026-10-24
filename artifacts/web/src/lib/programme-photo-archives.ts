export interface ProgrammeArchivePhoto {
  id: string;
  src: string;
  w: number;
  h: number;
  alt: string;
  caption?: string;
}

function archive(prefix: string, rows: { w: number; h: number; alt: string }[]): ProgrammeArchivePhoto[] {
  return rows.map((p, i) => {
    const id = `${prefix}-0${i + 1}`;
    return { ...p, id, src: `${import.meta.env.BASE_URL}api/editorial-portraits/${id}.webp` };
  });
}

// Supplied order; no dates, identities, endorsements or partnerships inferred.
export const FASHION_NIGHT_PHOTOS = archive('fashion-night-archive', [
  { w: 1170, h: 1455, alt: 'Woman wearing a white gown, with long copper-coloured hair' },
  { w: 4160, h: 6240, alt: 'Man wearing a black cape and hat on a fashion runway' },
  { w: 4150, h: 6228, alt: 'Man speaking on stage in a dark outfit with a patterned cape' },
  { w: 2624, h: 3936, alt: 'Man with a feathered headpiece speaking into a microphone' },
  { w: 4912, h: 7360, alt: 'Models walking the runway in patterned fashion designs' },
  { w: 4912, h: 7360, alt: 'Model on the runway wearing a long ivory gown' },
  { w: 1708, h: 2560, alt: 'Model on the runway wearing a woven top and flowing brown skirt' },
]);

export const SUMMIT_ENCOUNTER_PHOTOS = archive('summit-encounters', [
  { w: 1284, h: 963, alt: 'Two people posing together at an indoor gathering' },
  { w: 2910, h: 2425, alt: 'Two men shaking hands in front of a wooden reception wall' },
  { w: 3178, h: 3022, alt: 'Two men shaking hands beside a flag' },
  { w: 3024, h: 4032, alt: 'A man and a woman shaking hands in a reception area' },
  { w: 3024, h: 4032, alt: 'Two men shaking hands in front of the Dubai News Center sign' },
  { w: 2516, h: 3355, alt: 'Two men shaking hands beneath three framed portraits' },
  { w: 2889, h: 3183, alt: 'Two people standing between the UAE and Democratic Republic of the Congo flags' },
  { w: 2560, h: 1708, alt: 'Two people posing together in an office' },
]);
