import { LayoutGrid, List } from 'lucide-react';
import type { MemberProfileInput } from '@workspace/api-client-react';
import { LAYOUTS, appearanceOf } from '@/components/network/ProfileHero';

function Mini({ id }: { id: string }) {
  const cover = 'bg-[linear-gradient(140deg,hsl(187_67%_14%),hsl(189_70%_30%))]';
  if (id === 'centered') return <div className={`relative h-16 rounded-lg ${cover}`}><div className="absolute inset-x-5 top-2 bottom-2 rounded-md bg-ivory-50/90"><div className="mx-auto mt-1.5 h-4 w-4 rounded-full bg-gold-500" /><div className="mx-auto mt-1 h-1 w-8 rounded bg-ink-800/60" /></div></div>;
  if (id === 'editorial') return <div className="grid h-16 grid-cols-2 overflow-hidden rounded-lg border border-sand-200 bg-ivory-50"><div className="flex flex-col justify-end gap-1 p-1.5"><div className="h-3 w-3 rounded bg-gold-500" /><div className="h-1.5 w-10 rounded bg-ink-800/70" /><div className="h-1 w-6 rounded bg-sand-300" /></div><div className={cover} /></div>;
  return <div className={`relative h-16 rounded-lg ${cover}`}><div className="absolute bottom-1.5 left-1.5 flex items-end gap-1"><div className="h-4 w-4 rounded-full bg-gold-500" /><div className="mb-0.5 h-1.5 w-10 rounded bg-ivory-50/90" /></div></div>;
}

export default function AppearanceControls({ v, set }: { v: MemberProfileInput; set: <K extends keyof MemberProfileInput>(k: K, val: MemberProfileInput[K]) => void }) {
  const ap = appearanceOf(v);
  return (
    <fieldset className="flex flex-col gap-5" data-testid="fieldset-appearance">
      <legend className="mb-1 text-eyebrow text-gold-700">PAGE APPEARANCE</legend>
      <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Profile layout">
        {LAYOUTS.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={ap.layout === l.id} onClick={() => set('profileLayout', l.id)} data-testid={`option-layout-${l.id}`}
            className={`rounded-2xl border p-2.5 text-left transition-colors ${ap.layout === l.id ? 'border-lagoon-900 bg-lagoon-900/5 ring-2 ring-gold-500/60' : 'border-sand-200 hover:border-lagoon-600'}`}>
            <Mini id={l.id} />
            <span className="mt-2 block text-sm font-semibold text-ink-900">{l.name}</span>
            <span className="block text-xs leading-snug text-ink-700">{l.note}</span>
          </button>
        ))}
      </div>
      <label className="text-sm text-ink-900">Cover focal point <span className="text-sand-400">({ap.pos <= 20 ? 'top' : ap.pos >= 80 ? 'bottom' : 'middle'}, {ap.pos}%)</span>
        <input type="range" min={0} max={100} step={1} value={ap.pos} onChange={(e) => set('coverPosition', Number(e.target.value))} className="mt-2 block w-full accent-[hsl(187_67%_12%)]" data-testid="input-coverPosition" />
        <span className="flex justify-between text-[10px] uppercase tracking-wider text-sand-400"><span>Top</span><span>Bottom</span></span>
      </label>
      <div>
        <p className="text-sm text-ink-900">Posts on my page</p>
        <div className="mt-2 inline-flex gap-1 rounded-full bg-ivory-200 p-1" role="radiogroup" aria-label="Posts layout">
          {([['grid', 'Gallery', LayoutGrid], ['list', 'Full list', List]] as const).map(([id, l, I]) => (
            <button key={id} type="button" role="radio" aria-checked={ap.posts === id} onClick={() => set('postsLayout', id)} data-testid={`option-posts-${id}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs ${ap.posts === id ? 'bg-ivory-50 font-semibold text-lagoon-900 shadow-sm' : 'text-ink-700'}`}><I className="h-3.5 w-3.5" />{l}</button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
