import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

/** 52 unique supplied Instagram handles (duplicates removed, tracking params stripped). */
const HANDLES = ['leen_mohd98','esranurturker','shaikha.albader','louai.alaswad','fahadriazzz','majidmax_music','zainab_ghazi','kareem_afghani','umarhayat1993','anperr','nizarals9','dr.reem.englishista.official','__wed30','douniabomba','mayarukayia','soniamajeed','asmaalsawafiri','mayakarim369','sara.hussam7','batool.fayed','aliceveglio','annokawara','stargirl_pariss','deesakrr','erikahausser','eric.fit_','shkh_hanif','fatimazahraromane','ashwaq_alhuseini','alexander.almaaroufi','sallycakeaway','mariam.ghayadd','bhav.xo','eva_bitty','_aya.aref','janisa_js','shahdbouchra','sonyostha','dorsa___lifestyle','knaraburceva','sr_05.08','yuliiasahal','andreaib_2006','blankarigau','mayahmedd_official','marvol7angel','milenaarabelo','mahita_jo_jo_','abbas_saj','valeria_tigers_','mahtabmoradii_99','shookshy.shaymaa'];
const STEP = 16;

export default function PeaceVoices() {
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(STEP);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^@/, '');
    return t ? HANDLES.filter((h) => h.includes(t)) : HANDLES;
  }, [q]);
  const visible = q ? filtered : filtered.slice(0, shown);

  return (
    <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby="peace-voices-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-gold-400">PEACE &amp; UNITY VOICES</p>
            <h2 id="peace-voices-heading" className="mt-3 text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              52 VOICES LENT TO PEACE.
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-ivory-200">
              Influencers and ambassadors who lent their voices to the peace and unity message of The One Fashion Week International. Their support does not confirm attendance at the upcoming event.
            </p>
          </div>
          <div className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a handle" aria-label="Search a handle" data-testid="input-voice-search"
              className="h-11 w-full border border-gold-500/40 bg-lagoon-800 pl-9 pr-3 text-sm text-ivory-100 placeholder:text-ivory-300/60 focus:border-gold-400 focus:outline-none" />
          </div>
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.16em] text-ivory-300" aria-live="polite" data-testid="text-voice-count">
          {visible.length} / {filtered.length}
        </p>
        {filtered.length === 0 ? (
          <p className="mt-6 text-sm text-ivory-200">No handle matches this search. <button type="button" className="min-h-11 text-gold-400 underline" onClick={() => setQ('')}>Clear search</button></p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: 'hsl(188 66% 22%)' }}>
            {visible.map((h) => (
              <li key={h} className="bg-lagoon-900">
                <a href={`https://www.instagram.com/${h}/`} target="_blank" rel="noopener noreferrer nofollow" translate="no" data-testid={`link-voice-${h}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-sm text-ivory-100 hover:bg-lagoon-800 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                  <span className="truncate">@{h}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-gold-500" aria-hidden="true">Instagram ↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {!q && shown < filtered.length && (
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setShown((s) => s + STEP)} data-testid="button-voices-more" className="min-h-11 border border-gold-500 px-5 text-xs uppercase tracking-[0.16em] text-gold-400 hover:bg-gold-500/10">Show more voices</button>
            <button type="button" onClick={() => setShown(HANDLES.length)} data-testid="button-voices-all" className="min-h-11 px-5 text-xs uppercase tracking-[0.16em] text-ivory-200 underline">Show all 52</button>
          </div>
        )}
      </div>
    </section>
  );
}
