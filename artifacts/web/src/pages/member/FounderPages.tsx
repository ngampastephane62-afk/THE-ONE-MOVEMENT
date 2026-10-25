import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Monitor, PencilLine, Plus, RotateCcw, Smartphone, Trash2, Undo2 } from 'lucide-react';
import { defaultHomeEditorial, type HomeEditorial, type HomeMedia, type HomeSection, type HomeSectionKey } from '@workspace/shared';
import {
  useGetFounderHomeEditorial, getGetFounderHomeEditorialQueryKey, useSaveHomeEditorial, getGetHomeEditorialQueryKey,
} from '@workspace/api-client-react';
import { ErrorBox, Skeleton, btn, btnGhost, card, errStatus, field } from '@/components/network/kit';
import HomeMediaSlot from '@/components/founder/pages/HomeMediaSlot';
import { HomeExperienceView } from '@/pages/home/HomeExperience';
import { AUTO_HREF, DEFAULT_TYPES, HOME_LINK_TARGETS, HOME_REGISTRY, homeAssetUrl, newSection, normalizeDoc, presentationOf, publishIssues, type MediaResolver } from '@/lib/home-editorial';
import { useLeaveGuard } from '@/components/founder/pages/useLeaveGuard';
import { useMe } from './ctx';

const LEAVE = 'Vous avez des modifications non enregistrees. Quitter sans enregistrer ?';
const WAIT_MSG = 'Un televersement ou un enregistrement est en cours. Quitter quand meme ? Il pourrait etre perdu.';
const same = (a: HomeEditorial, b: HomeEditorial) => JSON.stringify(a.sections) === JSON.stringify(b.sections);

const CHOICES = {
  layout: [['original', 'Origine'], ['stack', 'Empile'], ['media-left', 'Media a gauche'], ['media-right', 'Media a droite']],
  theme: [['original', 'Origine'], ['ivory', 'Ivoire'], ['lagoon', 'Lagon']],
  alignment: [['left', 'Gauche'], ['center', 'Centre']],
  spacing: [['compact', 'Compact'], ['normal', 'Normal'], ['large', 'Ample']],
} as const;
const CHOICE_LABEL = { layout: 'Mise en page', theme: 'Couleurs', alignment: 'Alignement', spacing: 'Espacement' } as const;

function Segmented<K extends keyof typeof CHOICES>({ k, value, onChange, allowed, disabledNote }: { k: K; value: string; onChange: (v: string) => void; allowed: readonly string[]; disabledNote?: string }) {
  const opts = CHOICES[k].filter(([v]) => allowed.includes(v));
  if (opts.length < 2) return null;
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-semibold text-ink-800">{CHOICE_LABEL[k]}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {opts.map(([v, l]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)} disabled={!!disabledNote && v !== 'original' && value !== v}
            className={`min-h-11 rounded-full px-3.5 text-xs font-semibold transition-colors disabled:opacity-40 ${value === v ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-800 hover:border-lagoon-600'}`}
            data-testid={`choice-${k}-${v}`}>{l}</button>
        ))}
      </div>
      {disabledNote && <p className="mt-1 text-[11px] text-ink-700">{disabledNote}</p>}
    </fieldset>
  );
}

function SectionEditor({ s, onChange, onBusy, resolve }: { s: HomeSection; onChange: (s: HomeSection, localFile?: { uploadId: string; file: File }) => void; onBusy: (key: string, b: boolean) => void; resolve: MediaResolver }) {
  const def = HOME_REGISTRY[s.type];
  const pres = presentationOf(s.type);
  const needs = def.layoutNeedsMedia && !s.media.some((m) => m.key === def.layoutNeedsMedia) ? 'Ajoutez le visuel complementaire pour activer les mises en page avec colonne media.' : undefined;
  const setField = (k: string, v: string) => onChange({ ...s, fields: { ...s.fields, [k]: v } });
  const resetField = (k: string) => { const f = { ...s.fields }; delete f[k]; onChange({ ...s, fields: f }); };
  const setMedia = (key: string, m: HomeMedia | null, file?: File) => {
    const media = [...s.media.filter((x) => x.key !== key), ...(m ? [m] : [])];
    const layout = !m && def.layoutNeedsMedia === key ? 'original' : s.layout;
    onChange({ ...s, media, layout }, m && file ? { uploadId: m.uploadId, file } : undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-eyebrow text-gold-700">{s.type === 'custom' ? 'SECTION PERSONNALISEE' : 'SECTION D\'ORIGINE'}</p>
        <h2 className="mt-1 font-display text-xl text-ink-900">{def.label}</h2>
        <p className="mt-1 text-sm text-ink-700">{def.note}</p>
      </div>

      <section aria-labelledby={`txt-${s.id}`} className="flex flex-col gap-3">
        <h3 id={`txt-${s.id}`} className="text-xs font-bold uppercase tracking-[0.16em] text-lagoon-700">Textes et liens</h3>
        {def.fields.map((f) => {
          const raw = s.fields[f.key];
          const changed = raw !== undefined && raw !== f.def;
          const id = `f-${s.id}-${f.key}`;
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={id} className="text-xs font-semibold text-ink-800">{f.label}{changed && <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] text-gold-700">modifie</span>}</label>
                {changed && s.type !== 'custom' && <button type="button" onClick={() => resetField(f.key)} className="inline-flex min-h-9 items-center gap-1 text-[11px] text-lagoon-700 underline underline-offset-2"><Undo2 className="h-3 w-3" />Texte d'origine</button>}
              </div>
              {f.kind === 'link' ? (
                <select id={id} className={`${field} mt-1 min-h-11`} value={raw ?? f.def} onChange={(e) => setField(f.key, e.target.value)}>
                  {f.auto && <option value={AUTO_HREF}>Automatique : Join the Movement / My Space selon la connexion</option>}
                  {HOME_LINK_TARGETS.map((l) => <option key={l.href} value={l.href}>{l.label} ({l.href})</option>)}
                </select>
              ) : f.kind === 'text' ? (
                <textarea id={id} className={`${field} mt-1 min-h-28`} maxLength={f.max} value={raw ?? f.def} placeholder={f.def} onChange={(e) => setField(f.key, e.target.value)} />
              ) : (
                <input id={id} className={`${field} mt-1 min-h-11`} maxLength={f.max} value={raw ?? f.def} placeholder={f.def} onChange={(e) => setField(f.key, e.target.value)} />
              )}
            </div>
          );
        })}
        {(s.type === 'universe' || s.type === 'programmes') && (
          <p className="rounded-xl border border-lagoon-600/30 bg-lagoon-600/5 p-3 text-xs text-ink-800">
            {s.type === 'universe' ? 'Les 17 secteurs sont lus depuis les donnees canoniques et ne sont pas modifiables ici.' : 'Les noms, dates et medias des programmes viennent de Programs & Events.'}{' '}
            {s.type === 'programmes' && <Link href="/member/founder/programs" className="font-semibold text-lagoon-700 underline">Ouvrir Programs & Events</Link>}
          </p>
        )}
      </section>

      <section aria-labelledby={`med-${s.id}`} className="flex flex-col gap-3">
        <h3 id={`med-${s.id}`} className="text-xs font-bold uppercase tracking-[0.16em] text-lagoon-700">Medias</h3>
        {def.media.map((m) => (
          <HomeMediaSlot key={m.key} idBase={`${s.id}-${m.key}`} def={m} value={s.media.find((x) => x.key === m.key)} previewSrc={(() => { const v = s.media.find((x) => x.key === m.key); return v ? resolve(v) : null; })()} onChange={(v, file) => setMedia(m.key, v, file)} onBusy={(b) => onBusy(`${s.id}:${m.key}`, b)} />
        ))}
      </section>

      <section aria-labelledby={`pres-${s.id}`} className="flex flex-col gap-4">
        <h3 id={`pres-${s.id}`} className="text-xs font-bold uppercase tracking-[0.16em] text-lagoon-700">Presentation</h3>
        <Segmented k="layout" allowed={pres.layout} disabledNote={needs} value={s.layout} onChange={(v) => onChange({ ...s, layout: v as HomeSection['layout'] })} />
        <Segmented k="theme" allowed={pres.theme} value={s.theme} onChange={(v) => onChange({ ...s, theme: v as HomeSection['theme'] })} />
        <Segmented k="alignment" allowed={pres.alignment} value={s.alignment} onChange={(v) => onChange({ ...s, alignment: v as HomeSection['alignment'] })} />
        <Segmented k="spacing" allowed={pres.spacing} value={s.spacing} onChange={(v) => onChange({ ...s, spacing: v as HomeSection['spacing'] })} />
        {s.type !== 'custom' && (
          <button type="button" className={`${btnGhost} min-h-11 self-start`} onClick={() => onChange({ ...s, layout: 'original', theme: 'original', alignment: 'left', spacing: 'normal' })}>
            <RotateCcw className="h-3.5 w-3.5" />Presentation d'origine
          </button>
        )}
      </section>
    </div>
  );
}

function Editor({ initial, onReload }: { initial: HomeEditorial; onReload: () => Promise<unknown> }) {
  const qc = useQueryClient();
  const save = useSaveHomeEditorial();
  const [base, setBase] = useState<HomeEditorial>(initial);
  const [draft, setDraft] = useState<HomeEditorial>(initial);
  const [sel, setSel] = useState<string>(initial.sections[0]?.id ?? '');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err' | 'conflict'; text: string } | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const busy = Object.values(busyKeys).some(Boolean) || save.isPending;
  const dirty = !same(draft, base);
  const dirtyRef = useRef(false); dirtyRef.current = dirty || busy;
  const issues = useMemo(() => publishIssues(draft), [draft]);
  useLeaveGuard(dirtyRef, busy ? WAIT_MSG : LEAVE);

  /** Unsaved uploads preview from local object URLs; saved references use the protected home endpoint. */
  const [local, setLocal] = useState<Record<string, string>>({});
  const localRef = useRef(local); localRef.current = local;
  useEffect(() => () => { Object.values(localRef.current).forEach((u) => URL.revokeObjectURL(u)); }, []);
  const addLocal = (id: string, file: File) => setLocal((x) => (x[id] ? x : { ...x, [id]: URL.createObjectURL(file) }));
  const savedIds = useMemo(() => new Set(base.sections.flatMap((x) => x.media.map((m) => m.uploadId))), [base]);
  const resolveMedia: MediaResolver = (m) => local[m.uploadId] ?? (savedIds.has(m.uploadId) ? homeAssetUrl(m.uploadId) : `${import.meta.env.BASE_URL}api/network/media/${encodeURIComponent(m.uploadId)}`);


  const sections = draft.sections;
  const current = sections.find((x) => x.id === sel) ?? sections[0];
  const setSections = (next: HomeSection[]) => setDraft((d) => ({ ...d, sections: next }));
  const update = (s: HomeSection) => setDraft((d) => ({ ...d, sections: d.sections.map((x) => (x.id === s.id ? s : x)) }));
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= sections.length) return; const n = [...sections]; [n[i], n[j]] = [n[j], n[i]]; setSections(n); };
  const remove = (s: HomeSection) => {
    if (!window.confirm(`Supprimer « ${HOME_REGISTRY[s.type].label} » du brouillon ?${s.type !== 'custom' ? ' Vous pourrez la restaurer avec ses valeurs d\'origine.' : ' Son contenu sera perdu.'}`)) return;
    const n = sections.filter((x) => x.id !== s.id); setSections(n); if (sel === s.id) setSel(n[0]?.id ?? '');
  };
  const missing = DEFAULT_TYPES.filter((t) => !sections.some((s) => s.type === t));
  const add = (type: HomeSectionKey) => {
    const s = newSection(type);
    const at = type === 'custom' ? Math.max(0, sections.findIndex((x) => x.id === current?.id) + 1) : Math.min(DEFAULT_TYPES.indexOf(type as typeof DEFAULT_TYPES[number]), sections.length);
    const n = [...sections]; n.splice(at, 0, s); setSections(n); setSel(s.id); setTab('edit');
  };
  const resetAll = () => {
    if (!window.confirm('Remplacer tout le brouillon par la page d\'accueil d\'origine ? Textes, medias, sections personnalisees et presentation seront retires du brouillon. Rien n\'est publie avant confirmation.')) return;
    const d = defaultHomeEditorial(); setSections(d.sections); setSel(d.sections[0].id);
  };
  const discard = () => { if (window.confirm('Abandonner les modifications non enregistrees ?')) { setDraft(base); } };

  const submit = (status: 'draft' | 'published') => {
    setMsg(null);
    save.mutate({ data: { expectedUpdatedAt: base.updatedAt, content: { ...draft, status } } }, {
      onSuccess: (res) => {
        const doc = normalizeDoc(res);
        setBase(doc); setDraft(doc); setConfirmPublish(false);
        qc.setQueryData(getGetFounderHomeEditorialQueryKey(), doc);
        qc.invalidateQueries({ queryKey: getGetHomeEditorialQueryKey() });
        setMsg({ tone: 'ok', text: status === 'published' ? 'Publie. La page d\'accueil publique est a jour.' : 'Brouillon enregistre. Il reste prive jusqu\'a publication.' });
      },
      onError: (e) => {
        setConfirmPublish(false);
        const st = errStatus(e);
        if (st === 409) setMsg({ tone: 'conflict', text: 'Conflit : la page a ete modifiee ailleurs depuis votre chargement. Votre brouillon est conserve ici, rien n\'a ete ecrase.' });
        else setMsg({ tone: 'err', text: st === 400 || st === 422 ? 'Le contenu a ete refuse par le serveur. Verifiez les medias et les champs, puis reessayez.' : 'Enregistrement impossible. Votre brouillon est conserve ; reessayez.' });
      },
    });
  };
  const reloadServer = async () => {
    if (dirty && !window.confirm('Recharger la version du serveur ? Vos modifications locales seront perdues.')) return;
    dirtyRef.current = false; await onReload();
  };

  const state = dirty ? { label: 'Modifications non enregistrees', cls: 'bg-coral-500/15 text-coral-500 border-coral-500/40' }
    : base.status === 'draft' ? { label: 'Brouillon enregistre, non publie', cls: 'bg-gold-500/15 text-gold-700 border-gold-500/40' }
      : { label: 'Publie, a jour', cls: 'bg-lagoon-600/10 text-lagoon-700 border-lagoon-600/40' };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className={`${card} sticky top-[6.9rem] z-30 flex flex-wrap items-center gap-2 p-3 md:top-20`} data-testid="bar-home-editor">
        <span className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold ${state.cls}`} role="status" aria-live="polite" data-testid="status-home-editor">{state.label}</span>
        {base.updatedAt && <span className="hidden text-[11px] text-ink-700 sm:inline">Revision {new Date(base.updatedAt).toLocaleString('fr-FR')}</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {dirty && <button type="button" className={`${btnGhost} min-h-11`} onClick={discard} disabled={busy}>Annuler</button>}
          <button type="button" className={`${btnGhost} min-h-11`} onClick={() => submit('draft')} disabled={busy || !dirty} data-testid="button-save-home-draft">{save.isPending ? 'Enregistrement...' : 'Enregistrer le brouillon'}</button>
          <button type="button" className={`${btn} min-h-11`} onClick={() => setConfirmPublish(true)} disabled={busy || (!dirty && base.status === 'published')} data-testid="button-publish-home">Publier...</button>
        </div>
        {msg && (
          <div className={`basis-full rounded-xl p-3 text-xs ${msg.tone === 'ok' ? 'bg-lagoon-600/10 text-lagoon-700' : 'bg-coral-500/10 text-ink-900'}`} role={msg.tone === 'ok' ? 'status' : 'alert'}>
            {msg.text}
            {msg.tone === 'conflict' && <button type="button" onClick={reloadServer} className="ml-2 font-semibold underline">Recharger la version du serveur</button>}
          </div>
        )}
      </div>

      <div role="tablist" aria-label="Mode" className="flex gap-2">
        {([['edit', 'Modifier', PencilLine], ['preview', 'Apercu en direct', Eye]] as const).map(([v, l, I]) => (
          <button key={v} role="tab" type="button" aria-selected={tab === v} onClick={() => setTab(v)} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold ${tab === v ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300 text-ink-800'}`} data-testid={`tab-home-${v}`}>
            <I className="h-3.5 w-3.5" />{l}
          </button>
        ))}
      </div>

      {tab === 'edit' ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[17rem_1fr]">
          <nav aria-label="Sections de la page d'accueil" className={`${card} h-fit p-3`}>
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-700">Ordre des sections</p>
            <ol className="mt-2 flex flex-col gap-1.5">
              {sections.map((s, i) => (
                <li key={s.id} className={`rounded-xl border ${s.id === current?.id ? 'border-lagoon-700 bg-lagoon-900/5' : 'border-sand-200'} ${s.enabled ? '' : 'opacity-60'}`}>
                  <button type="button" onClick={() => setSel(s.id)} aria-current={s.id === current?.id ? 'true' : undefined} className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm" data-testid={`select-section-${s.id}`}>
                    <span className="font-mono text-[11px] text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">{s.type === 'custom' ? (s.fields.heading || HOME_REGISTRY.custom.label) : HOME_REGISTRY[s.type].label}</span>
                    {!s.enabled && <span className="text-[10px] uppercase text-ink-700">masquee</span>}
                  </button>
                  <div className="flex border-t border-sand-200">
                    <button type="button" aria-label={`Monter ${HOME_REGISTRY[s.type].label}`} disabled={i === 0} onClick={() => move(i, -1)} className="grid min-h-11 flex-1 place-items-center text-ink-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Descendre ${HOME_REGISTRY[s.type].label}`} disabled={i === sections.length - 1} onClick={() => move(i, 1)} className="grid min-h-11 flex-1 place-items-center border-x border-sand-200 text-ink-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" aria-pressed={!s.enabled} aria-label={s.enabled ? `Masquer ${HOME_REGISTRY[s.type].label}` : `Afficher ${HOME_REGISTRY[s.type].label}`} onClick={() => update({ ...s, enabled: !s.enabled })} className="grid min-h-11 flex-1 place-items-center border-r border-sand-200 text-ink-800">{s.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button type="button" aria-label={`Supprimer ${HOME_REGISTRY[s.type].label}`} onClick={() => remove(s)} className="grid min-h-11 flex-1 place-items-center text-coral-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" className={`${btn} mt-3 min-h-11 w-full`} onClick={() => add('custom')} data-testid="button-add-custom-section"><Plus className="h-3.5 w-3.5" />Section personnalisee</button>
            {missing.length > 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-sand-300 p-2">
                <p className="px-1 text-[11px] text-ink-700">Sections d'origine retirees</p>
                {missing.map((t) => (
                  <button key={t} type="button" className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-xs font-semibold text-lagoon-700 hover:bg-ivory-200" onClick={() => add(t)} data-testid={`button-restore-${t}`}>
                    <RotateCcw className="h-3.5 w-3.5" />Restaurer {HOME_REGISTRY[t].label}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-700 underline underline-offset-2" onClick={resetAll} data-testid="button-reset-home">Revenir a la page d'origine</button>
          </nav>
          <div className={`${card} min-w-0 p-4 sm:p-6`}>
            {current ? <SectionEditor key={current.id} s={current} resolve={resolveMedia} onChange={(next, lf) => { if (lf) addLocal(lf.uploadId, lf.file); update(next); }} onBusy={(k, b) => setBusyKeys((x) => (x[k] === b ? x : { ...x, [k]: b }))} />
              : <p className="text-sm text-ink-700">Aucune section. Restaurez une section d'origine ou ajoutez une section personnalisee.</p>}
          </div>
        </div>
      ) : (
        <div className={`${card} min-w-0 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-sand-200 p-3">
            <p className="text-xs text-ink-700">Apercu local du brouillon actuel, y compris les modifications non enregistrees. Rendu par la vraie page d'accueil.</p>
            <div className="ml-auto flex gap-1.5">
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} className={`grid h-11 w-11 place-items-center rounded-full ${device === 'desktop' ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300'}`} aria-label="Apercu bureau"><Monitor className="h-4 w-4" /></button>
              <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} className={`grid h-11 w-11 place-items-center rounded-full ${device === 'mobile' ? 'bg-lagoon-900 text-gold-400' : 'border border-sand-300'}`} aria-label="Apercu mobile"><Smartphone className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="bg-sand-200/40 p-2 sm:p-4">
            <div className={`mx-auto max-h-[78vh] overflow-auto rounded-lg bg-ivory-100 shadow-xl ${device === 'mobile' ? 'max-w-[390px]' : 'w-full'}`} aria-label="Apercu de la page d'accueil" data-testid="preview-home">
              <HomeExperienceView doc={draft} preview resolveMedia={resolveMedia} />
            </div>
          </div>
        </div>
      )}

      {confirmPublish && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink-900/50 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="pub-h">
          <div className="w-full max-w-lg rounded-t-3xl bg-ivory-50 p-6 shadow-2xl sm:rounded-3xl">
            <p className="text-eyebrow text-gold-700">CONFIRMATION</p>
            <h2 id="pub-h" className="mt-1 font-display text-xl text-ink-900">Publier sur la page d'accueil publique ?</h2>
            {issues.length ? (
              <>
                <p className="mt-2 text-sm text-ink-800">Publication bloquee. Corrigez d'abord :</p>
                <ul className="mt-2 max-h-60 list-disc overflow-auto pl-5 text-sm text-coral-500">
                  {issues.map((x, i) => <li key={i}><button type="button" className="text-left underline" onClick={() => { setSel(x.sectionId); setTab('edit'); setConfirmPublish(false); }}>{x.message}</button></li>)}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-800">Les visiteurs verront cette version des {sections.filter((s) => s.enabled).length} sections visibles. Le brouillon est enregistre et publie en une seule operation.</p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" className={`${btnGhost} min-h-11`} onClick={() => setConfirmPublish(false)} autoFocus>Annuler</button>
              <button type="button" className={`${btn} min-h-11`} onClick={() => submit('published')} disabled={!!issues.length || busy} data-testid="button-confirm-publish-home">{save.isPending ? 'Publication...' : 'Publier maintenant'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FounderPages() {
  const { me } = useMe();
  const [k, setK] = useState(0);
  const q = useGetFounderHomeEditorial({ query: { queryKey: getGetFounderHomeEditorialQueryKey(), enabled: !!me?.founder, refetchOnWindowFocus: false, staleTime: Infinity } });
  if (!me?.founder) return <Redirect to="/member" replace />;
  const reload = async () => { await q.refetch(); setK((x) => x + 1); };

  return (
    <div className="flex min-w-0 flex-col gap-5 px-3 pt-4 [overflow-wrap:anywhere] md:px-0 md:pt-0" data-testid="page-founder-pages">
      <Helmet><title>Pages · Accueil — TOMI</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="rounded-3xl bg-lagoon-900 p-5 text-ivory-100 sm:p-7">
        <Link href="/member/founder" className="inline-flex min-h-11 items-center text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-pages-back-founder">Retour a l'espace Fondateur</Link>
        <p className="mt-2 text-eyebrow text-gold-400">FONDATEUR · PAGES · ACCUEIL</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.03em] text-ivory-50 sm:text-3xl">Modifier la page d'accueil</h1>
        <div className="mt-3 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-200">Textes, medias, liens, ordre des sections et presentation. Enregistrer garde le brouillon prive ; Publier met a jour la page publique apres confirmation. Seule la page d'accueil est modifiable ici pour le moment.</p>
        <Link href="~/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-gold-400 underline underline-offset-4" data-testid="link-home-public"><ExternalLink className="h-3.5 w-3.5" />Voir la page publique</Link>
      </header>
      {q.isLoading ? <Skeleton rows={6} />
        : q.isError || !q.data ? <ErrorBox onRetry={() => q.refetch()} msg="Le contenu de la page d'accueil n'a pas pu etre charge." />
          : <Editor key={k} initial={normalizeDoc(q.data)} onReload={reload} />}
    </div>
  );
}
