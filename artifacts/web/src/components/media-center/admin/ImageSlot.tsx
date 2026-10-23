import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageOff, RotateCcw } from 'lucide-react';
import { UploadTray, btnGhost, type useUploads } from '@/components/network/kit';
import { checkMediaImage, MEDIA_IMG_TYPES } from '@/lib/media-center';

type U = ReturnType<typeof useUploads>;

/** One image slot (cover or logo). Retained upload stays until removed or replaced. */
export default function ImageSlot({ name, u, value, original, originalUrl, onChange, disabled }: {
  name: string; u: U; value: string | null; original: string | null; originalUrl: string | null;
  onChange: (id: string | null) => void; disabled?: boolean;
}) {
  const [err, setErr] = useState('');
  const cb = useRef(onChange); cb.current = onChange;
  const doneId = u.ids[0] ?? null;
  useEffect(() => { if (doneId) cb.current(doneId); }, [doneId]);
  const doneFile = u.items.find((x) => x.status === 'done')?.file ?? null;
  const localUrl = useMemo(() => (doneFile ? URL.createObjectURL(doneFile) : null), [doneFile]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  const preview = value && value === doneId ? localUrl : value && value === original ? originalUrl : null;
  const guarded: U = {
    ...u,
    add: (files) => {
      const list = Array.from(files);
      const bad = list.map(checkMediaImage).find(Boolean);
      if (bad) { setErr(bad); return; }
      setErr(''); u.clear(); u.add(list.slice(0, 1));
    },
    full: false,
  };
  const slug = name.toLowerCase();

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-sand-200 bg-ivory-100 p-3" data-testid={`slot-${slug}`}>
      <p className="text-xs font-semibold text-ink-900">{name}</p>
      <div className={`grid place-items-center overflow-hidden rounded-xl border border-dashed border-sand-300 bg-ivory-50 ${slug === 'logo' ? 'h-24' : 'aspect-[16/10]'}`}>
        {preview ? <img src={preview} alt={`${name} preview`} className={slug === 'logo' ? 'max-h-20 max-w-[80%] object-contain' : 'h-full w-full object-cover'} />
          : value ? <span className="px-3 text-center text-xs text-ink-700">Image retained. Preview available after reload.</span>
          : <span className="flex flex-col items-center gap-1 text-xs text-sand-400"><ImageOff className="h-5 w-5" />No {slug}</span>}
      </div>
      {err && <p className="text-xs text-crimson-700" role="alert">{err}</p>}
      <fieldset disabled={disabled} className="flex flex-wrap items-center gap-2">
        <UploadTray u={guarded} accept={MEDIA_IMG_TYPES.join(',')} label={value ? `Replace ${slug}` : `Upload ${slug}`} testId={`media-${slug}`} />
        {value && <button type="button" className={btnGhost} onClick={() => { u.clear(); onChange(null); }} data-testid={`button-remove-${slug}`}>Remove</button>}
        {original && value !== original && <button type="button" className={btnGhost} onClick={() => { u.clear(); onChange(original); }} data-testid={`button-restore-${slug}`}><RotateCcw className="h-3.5 w-3.5" />Keep previous</button>}
      </fieldset>
      <p className="text-[11px] text-ink-700">PNG, JPEG or WEBP, 5 MB maximum. Uploaded privately; visible publicly only once published.</p>
    </div>
  );
}
