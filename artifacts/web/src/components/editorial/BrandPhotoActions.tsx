import { useEffect, useState } from 'react';
import PhotoActions from './PhotoActions';
import PhotoSetActions from './PhotoSetActions';

/**
 * Reactions for a /brand-photos/<filename> image rendered via PhotoSlot.
 * Only appears once the real file has loaded, so empty placeholders never get
 * buttons. Place it as a sibling after the PhotoSlot.
 */
export default function BrandPhotoActions({ filename, title, tone = 'light', className }: { filename: string; title: string; tone?: 'light' | 'dark'; className?: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOk(true);
    img.onerror = () => setOk(false);
    img.src = `${import.meta.env.BASE_URL}brand-photos/${filename}`;
    return () => { img.onload = null; img.onerror = null; };
  }, [filename]);
  return ok ? <PhotoActions source={`/brand-photos/${filename}`} title={title} tone={tone} className={className} /> : null;
}

/** Filenames under /brand-photos that actually load (placeholders excluded). */
export function useLoadedBrandPhotos(filenames: string[]) {
  const key = filenames.join('|');
  const [loaded, setLoaded] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    const names = key ? key.split('|') : [];
    Promise.all(names.map((f) => new Promise<string | null>((res) => {
      const img = new Image();
      img.onload = () => res(f); img.onerror = () => res(null);
      img.src = `${import.meta.env.BASE_URL}brand-photos/${f}`;
    }))).then((r) => { if (live) setLoaded(r.filter((x): x is string => !!x)); });
    return () => { live = false; };
  }, [key]);
  return loaded;
}

/** Chooser + reactions for a composed set of /brand-photos images (mosaics). */
export function BrandPhotoSetActions({ filenames, alts = [], tone = 'light', className, onInteract }: { filenames: string[]; alts?: string[]; tone?: 'light' | 'dark'; className?: string; onInteract?: () => void }) {
  const loaded = useLoadedBrandPhotos(filenames);
  if (!loaded.length) return null;
  const items = loaded.map((f) => ({ src: `/brand-photos/${f}`, title: alts[filenames.indexOf(f)] || 'Founder archive photograph' }));
  return <PhotoSetActions items={items} tone={tone} className={className} onInteract={onInteract} />;
}
