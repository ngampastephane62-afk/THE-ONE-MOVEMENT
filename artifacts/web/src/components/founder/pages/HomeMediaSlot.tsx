import { useEffect, useRef } from 'react';
import { ImagePlus, RotateCw, Trash2 } from 'lucide-react';
import type { HomeMedia } from '@workspace/shared';
import { useUploads, btnGhost, field } from '@/components/network/kit';
import type { MediaDef } from '@/lib/home-editorial';

const ACCEPT = { image: 'image/jpeg,image/png,image/webp', video: 'video/mp4,video/webm,video/quicktime' };

export default function HomeMediaSlot({ def, value, previewSrc, onChange, onBusy, idBase }: {
  def: MediaDef; value: HomeMedia | undefined; previewSrc: string | null;
  /** localFile: the just-uploaded file, so the editor can preview it locally before the draft is saved. */
  onChange: (m: HomeMedia | null, localFile?: File) => void; onBusy: (b: boolean) => void; idBase: string;
}) {
  const u = useUploads(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
  const onBusyRef = useRef(onBusy); onBusyRef.current = onBusy;
  const valueRef = useRef(value); valueRef.current = value;
  const item = u.items[0];

  useEffect(() => { onBusyRef.current(u.busy); }, [u.busy]);
  useEffect(() => {
    if (item?.status === 'done' && item.id) {
      const prev = valueRef.current;
      const kind: 'image' | 'video' = item.file.type.startsWith('video/') ? 'video' : 'image';
      onChangeRef.current({
        key: def.key, uploadId: item.id, kind, url: null,
        alt: prev?.alt ?? '', credit: prev?.credit ?? '', rightsConfirmed: false,
      }, item.file);
      u.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.status, item?.id, def.key]);

  const accept = def.kinds.map((k) => ACCEPT[k]).join(',');
  const set = (p: Partial<HomeMedia>) => value && onChange({ ...value, ...p });

  return (
    <div className="rounded-xl border border-sand-200 bg-ivory-100/60 p-3" data-testid={`media-slot-${def.key}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink-900">{def.label}</p>
        <p className="text-[11px] text-ink-700">{def.kinds.includes('video') ? (def.kinds.includes('image') ? 'Image ou video' : 'Video') : 'Image'} · {def.note}</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[9rem_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-sand-300 bg-ivory-50">
          {value && previewSrc ? (value.kind === 'video'
            ? <video src={previewSrc} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            : <img src={previewSrc} alt="" className="h-full w-full object-cover" />)
            : <span className="absolute inset-0 grid place-items-center px-2 text-center text-[11px] text-ink-700">Media source d'origine</span>}
          {item && item.status !== 'done' && (
            <div className="absolute inset-x-0 bottom-0 bg-lagoon-900/85 p-1.5 text-[11px] text-ivory-100" role="status">
              {item.status === 'error' ? (item.error ?? 'Echec') : `Envoi ${item.progress}%`}
              <span className="mt-1 block h-1 rounded bg-ivory-100/20"><span className="block h-1 rounded bg-gold-400" style={{ width: `${item.progress}%` }} /></span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept={accept} className="sr-only" id={`${idBase}-file`} onChange={(e) => { if (e.target.files?.length) { u.clear(); u.add(e.target.files); } e.target.value = ''; }} />
            <button type="button" className={`${btnGhost} min-h-11`} onClick={() => inputRef.current?.click()} disabled={u.busy} data-testid={`button-upload-${def.key}`}>
              <ImagePlus className="h-3.5 w-3.5" />{value ? 'Remplacer' : 'Televerser'}
            </button>
            {item?.status === 'error' && <button type="button" className={`${btnGhost} min-h-11`} onClick={() => u.retry(item.key)}><RotateCw className="h-3.5 w-3.5" />Reessayer</button>}
            {value && (
              <button type="button" className={`${btnGhost} min-h-11 hover:border-coral-500`} onClick={() => { if (window.confirm('Retirer ce media et revenir au media d\'origine ?')) onChange(null); }} data-testid={`button-remove-media-${def.key}`}>
                <Trash2 className="h-3.5 w-3.5" />Retirer
              </button>
            )}
          </div>
          {value && (
            <>
              {value.kind === 'video' && /^reel-\d+$/.test(def.key) && (
                <label className="text-xs font-semibold text-ink-800">Titre du reel <span className="font-normal text-ink-700">(affiche et utilise pour le partage)</span>
                  <input className={`${field} mt-1`} value={value.alt} maxLength={240} onChange={(e) => set({ alt: e.target.value })} placeholder="Ex. Fashion Week Goma, defile de cloture" data-testid={`input-reel-title-${def.key}`} />
                </label>
              )}
              {value.kind === 'image' && (
                <label className="text-xs font-semibold text-ink-800">Texte alternatif <span className="font-normal text-ink-700">(obligatoire pour publier)</span>
                  <input className={`${field} mt-1`} value={value.alt} maxLength={240} onChange={(e) => set({ alt: e.target.value })} placeholder="Decrivez ce que montre l'image" />
                </label>
              )}
              <label className="text-xs font-semibold text-ink-800">Credit <span className="font-normal text-ink-700">(obligatoire pour publier)</span>
                <input className={`${field} mt-1`} value={value.credit} maxLength={160} onChange={(e) => set({ credit: e.target.value })} placeholder="Ex. Archive du Fondateur / TOMI" />
              </label>
              <label className="flex min-h-11 items-start gap-2 text-xs text-ink-800">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(187_67%_12%)]" checked={value.rightsConfirmed} onChange={(e) => set({ rightsConfirmed: e.target.checked })} />
                Je confirme que TOMI detient les droits de publication de ce media et l'accord des personnes visibles.
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
