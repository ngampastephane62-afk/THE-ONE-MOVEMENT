import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { UAE_CABINET, UAE_BILLIONAIRES, type EmiratesPerson } from '@/lib/emirates-directory';
import PersonPortrait, { PortraitActions, PortraitCredit } from '@/components/editorial/PersonPortrait';

/* Preserved authored content from the earlier page, now in closed native disclosures. */
const PRINCIPLES = [
  ['Unity', 'Difference held together rather than dissolved.'], ['Coexistence', 'Living alongside as a daily practice.'], ['Dialogue', 'Conversation before conclusion.'],
  ['Cultural diplomacy', 'Culture as the language institutions share.'], ['Human dignity', 'The measure against which every initiative is judged.'], ['Cooperation', 'International work done jointly, not in parallel.'],
  ['Peace', 'The purpose behind the convening.'], ['Innovation', 'New models tested, not merely discussed.'], ['Investment', 'Capital placed where it creates opportunity.'],
  ['Humanitarian action', 'Convening turned toward social good.'], ['Global connection', 'Relationships that outlast a single edition.'],
];
const PLATFORMS = ['The One Summit', 'Diplomatic Gala', 'Investment Forum', 'Fashion Week', 'The One Awards · The One Hour', 'Digital platform', 'Media & broadcast'];
const PROFILES = ['Entrepreneurs', 'Artists', 'Designers', 'Models', 'Creators', 'Media personalities', 'Young leaders', 'Investors', 'Professionals', 'Residents', 'Cultural figures', 'Community leaders'];
const FORMATS = [
  ['Written testimony', 'Your account, in your own words and your own language.'], ['Short video', 'Recorded by you, with a caption. Unscripted.'],
  ['Portrait card', 'Image, name, country and one line in your words. A concept for the campaign.'], ['Editorial feature', 'Possible later through media relationships; not guaranteed.'],
];
const AMBASSADORS = [
  ['Global Ambassador', 'Represents the initiative internationally.'], ['Youth Ambassador', 'Brings the next generation into the conversation.'], ['Cultural Ambassador', 'Expresses it through art, design, music and heritage.'],
  ['Humanitarian Ambassador', 'Connects it to social and humanitarian projects.'], ['Community Ambassador', 'Builds participation in a city, nationality or network.'], ['Innovation Ambassador', 'Carries the ideas and innovation dimension.'],
  ['International Partner', 'Institutions engaging with the initiative formally.'],
];
const PHASES = [
  { n: '01', t: 'Social campaign', d: 'Stories recorded and shared by real members.', live: true }, { n: '02', t: 'Global storytelling movement', d: 'Participation beyond the Emirates into international markets.' },
  { n: '03', t: 'Digital community', d: 'A dedicated section inside the TOMI application, in development.' }, { n: '04', t: 'Ambassador & recognition programme', d: 'Sustained contribution recognised and profiled.' },
  { n: '05', t: 'Humanitarian & innovation initiatives', d: 'Community energy directed toward projects and ideas.' }, { n: '06', t: 'Global digital humanitarian ecosystem', d: 'Supporting thinkers, innovators and social entrepreneurs; advancing intercultural understanding.' },
];
const ILLUSTRATIVE = [['I built my career here.', 'Entrepreneur · Africa'], ['I was given room to build.', 'Founder · Europe'], ['Forty nationalities, one street.', 'Long-term resident'], ['Ambition is not a nationality.', 'Professional · Asia']];

function Res({ id, title, note, children, onOpen }: { id: string; title: string; note: string; children: ReactNode; onOpen?: () => void }) {
  return (
    <details className="em-res border-t border-sand-300" data-testid={`resource-${id}`} onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) onOpen?.(); }}>
      <summary className="em-focus flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4" data-testid={`summary-resource-${id}`}>
        <span><span className="block font-display text-xl text-ink-900 sm:text-2xl">{title}</span><span className="text-xs text-ink-700">{note}</span></span>
        <Plus className="em-res-plus h-5 w-5 shrink-0 text-gold-600" aria-hidden />
      </summary>
      <div className="pb-10 pt-2">{children}</div>
    </details>
  );
}

function Person({ p }: { p: EmiratesPerson }) {
  return (
    <li className="flex gap-4 border border-sand-300 bg-ivory-100 p-4" data-testid={`emirates-person-${p.slug}`}>
      <PersonPortrait slug={p.slug} name={p.name} contain className="h-28 w-20 shrink-0 overflow-hidden bg-lagoon-900" />
      <div className="min-w-0">
        <p className="font-display text-lg leading-tight text-ink-900">{p.name}</p>
        <p className="mt-1 text-xs text-ink-700">{p.role}</p>
        {p.wealth && <p className="mt-2 text-xs text-ink-800"><span className="font-display text-lg text-lagoon-900" data-no-translate>US${p.wealth} billion</span> · {p.family ? 'Family estimate' : 'Estimate'} · unaudited</p>}
        <a href={p.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-lagoon-700 underline">{p.wealth ? 'Forbes Middle East · 2026 edition' : 'UAE Cabinet · listed member'}</a>
        <PortraitCredit slug={p.slug} />
        <PortraitActions slug={p.slug} name={p.name} />
      </div>
    </li>
  );
}

/** Chapter 08 — secondary resources. Heavy lists mount only after the visitor opens them. */
export default function EmiratesResources() {
  const [cab, setCab] = useState(false);
  const [rich, setRich] = useState(false);
  return (
    <section aria-labelledby="em-res-h" className="bg-ivory-50 py-section-lg">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-eyebrow text-gold-600">08 · ADDITIONAL INFORMATION</p>
        <h2 id="em-res-h" className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">Resources, for those who want more.</h2>
        <div className="mt-8 border-b border-sand-300">
          <Res id="idea" title="The idea" note="A campaign ends. A movement continues.">
            <div className="space-y-4 leading-relaxed text-ink-800">
              <p>Thank You, Emirates is not a campaign attached to TOMI from outside. It is one expression of the Movement's founding philosophy: people of different nationalities, cultures and backgrounds can meet, understand one another and build together.</p>
              <p>The One Movement provides the ecosystem; the initiative tells the human story. Success stories, a global community, an ideas platform, humanitarian initiatives and digital humanitarian diplomacy all have a place here.</p>
            </div>
          </Res>
          <Res id="roots" title="Roots · seven platforms" note="It stands inside the ecosystem.">
            <p className="text-ink-800">The initiative draws on TOMI's seven signature platforms rather than duplicating any of them. Five editions were delivered across the DRC, Nigeria and the Great Lakes region before the Emirates chapter opened.</p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">{PLATFORMS.map((p, i) => <li key={p} className="text-sm text-ink-900"><span className="mr-2 font-mono text-xs text-gold-600">0{i + 1}</span>{p}</li>)}</ol>
            <p className="mt-4 font-display text-lg text-lagoon-600">Thank You, Emirates: one movement within it.</p>
          </Res>
          <Res id="principles" title="Why we are one" note="Eleven principles, one conviction.">
            <ol className="grid gap-x-8 sm:grid-cols-2">{PRINCIPLES.map(([t, d], i) => <li key={t} className="border-t border-sand-300 py-3" data-testid={`principle-${i + 1}`}><span className="font-mono text-xs text-gold-600">{String(i + 1).padStart(2, '0')}</span> <span className="font-display text-lg text-ink-900">{t}</span><p className="text-sm text-ink-700">{d}</p></li>)}</ol>
          </Res>
          <Res id="real-stories" title="Real stories only" note="Your words. Your language. Unscripted. Includes illustrative samples.">
            <p className="leading-relaxed text-ink-800">Every story is an authentic account by the person who lived it. TOMI does not write on anyone's behalf. Everyone, anywhere in the world, is welcome.</p>
            <p className="mt-5 text-eyebrow text-gold-600">SUGGESTED STRUCTURE</p>
            <p className="mt-2 border-l-2 border-gold-500 pl-4 italic text-ink-800">My name is [name]. I come from [country]. The Emirates gave me [experience]. For me, this country represents [value]. Today I want to say: thank you, Emirates. We are one.</p>
            <p className="mt-6 text-eyebrow text-ink-700">ILLUSTRATIVE ONLY · NOT REAL TESTIMONIALS</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">{ILLUSTRATIVE.map(([q, w]) => <li key={q} className="border border-dashed border-sand-300 p-4"><p className="font-display text-lg text-ink-900/70">"{q}"</p><p className="mt-1 text-xs uppercase tracking-wider text-ink-700">{w}</p></li>)}</ul>
            <p className="mt-3 text-xs text-ink-700">These sample lines were written to show the tone of the initiative. They are not quotations from real participants.</p>
            <p className="mt-6 text-eyebrow text-gold-600">WHO TAKES PART</p>
            <ul className="mt-3 flex flex-wrap gap-2">{PROFILES.map((p) => <li key={p} className="border border-sand-300 px-3 py-1 text-xs text-ink-800">{p}</li>)}</ul>
          </Res>
          <Res id="pilot" title="The pilot" note="300 stories in about 15 days: target not achieved.">
            <p className="font-display text-6xl leading-none text-lagoon-600" data-testid="text-target">300</p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-ink-700">stories in about 15 days</p>
            <p className="mt-5 border-l-2 border-coral-500 pl-4 text-lg text-ink-800" data-testid="text-pilot-status">The first activation set a target of 300 stories in approximately 15 days. That target was not achieved. Story submissions remain open to members.</p>
            <p className="mt-4 text-ink-800">The pilot was planned in four moves: foundation, first wave, expansion beyond the Emirates, and consolidation. Three hundred was always a target, not a guaranteed number.</p>
            <p className="mt-3 text-sm text-ink-700">No official Emirati institutional account or hashtag is assumed. Any tagging would follow communication protocol and approval.</p>
          </Res>
          <Res id="formats" title="Content formats & visibility" note="What you can submit, and who can see it.">
            <div className="grid gap-5 sm:grid-cols-2">{FORMATS.map(([t, d]) => <div key={t} className="border-t border-gold-500/40 pt-3"><p className="font-display text-lg text-ink-900">{t}</p><p className="text-sm text-ink-700">{d}</p></div>)}</div>
            <p className="mt-6 border-l-2 border-gold-500 pl-4 text-sm leading-relaxed text-ink-800">Submitted stories are visible to signed-in TOMI members. They are not automatically published publicly, not sent to any broadcaster, and lead to no official or governmental award. Media relationships named in the concept are not confirmed commissioning or distribution agreements.</p>
          </Res>
          <Res id="ambassadors" title="Ambassadors & recognition · concept" note="Future concepts, none confirmed.">
            <ul className="grid gap-x-8 sm:grid-cols-2">{AMBASSADORS.map(([t, d]) => <li key={t} className="border-t border-sand-300 py-3"><p className="font-display text-lg text-ink-900">{t}</p><p className="text-sm text-ink-700">{d}</p></li>)}</ul>
            <p className="mt-5 border-l-2 border-gold-500 pl-4 text-sm text-ink-800">Any recognition would be issued by TOMI as "Recognition within the Thank You, Emirates initiative under The One Movement International". It is not a governmental award and carries no official status.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div><p className="text-eyebrow text-gold-600">NOVEMBER · CONCEPT</p><p className="mt-2 font-display text-xl text-ink-900">A recognition ceremony, proposed.</p><p className="mt-2 text-sm text-ink-800">The concept proposes a recognition moment within a TOMI activity in November, in Dubai. No date, venue, event or patronage is confirmed.</p></div>
              <div><p className="text-eyebrow text-gold-600">EXPANSION · PROPOSED</p><p className="mt-2 font-display text-xl text-ink-900">Dubai / New York / London / Global</p><p className="mt-2 text-sm text-ink-800">Dubai as the starting point; New York and London as proposed next cities; further cities only by partnership and mandate. None of these is confirmed.</p></div>
            </div>
          </Res>
          <Res id="roadmap" title="Roadmap · six phases" note="From a campaign to a humanitarian ecosystem.">
            <ol className="border-l border-sand-300">{PHASES.map((p) => (
              <li key={p.n} className="relative py-3 pl-6" data-testid={`phase-${p.n}`}>
                <span className={`absolute -left-[5px] top-5 h-2.5 w-2.5 rounded-full ${p.live ? 'bg-lagoon-600' : 'border border-sand-400 bg-ivory-50'}`} />
                <p className="flex flex-wrap items-center gap-3"><span className="font-mono text-xs text-gold-600">{p.n}</span><span className="font-display text-lg text-ink-900">{p.t}</span><span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.live ? 'bg-lagoon-600 text-ivory-50' : 'border border-sand-300 text-ink-700'}`}>{p.live ? 'Active: member story submissions' : 'Future phase'}</span></p>
                <p className="text-sm text-ink-700">{p.d}</p>
              </li>))}</ol>
          </Res>
          <Res id="partnership" title="Partnership pathways" note="What could be built together.">
            <p className="text-sm leading-relaxed text-ink-800">Institutions, media, creators and organisations can open a conversation. These are aspirations for discussion, not guaranteed outcomes. The initiative aims at positive storytelling and community engagement; it does not claim governmental, diplomatic or official results.</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div><p className="font-display text-lg text-ink-900">In place</p><ul className="mt-2 space-y-1 text-sm text-ink-800"><li>Seven operating platforms</li><li>Media and creator network</li><li>Five delivered editions</li><li>Member story submissions</li></ul></div>
              <div><p className="font-display text-lg text-ink-900">To build</p><ul className="mt-2 space-y-1 text-sm text-ink-800"><li>Co-created campaign identity</li><li>November recognition moment</li><li>Humanitarian and innovation alignment</li><li>Dedicated app section</li></ul></div>
            </div>
            <Link href="/join#institutional-inquiry" className="em-focus mt-6 inline-flex min-h-11 items-center border border-lagoon-600 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon-700 hover:bg-ivory-100" data-testid="link-partnership-enquiry">Start a conversation</Link>
          </Res>
          <Res id="cabinet" title="The federal government" note={`All ${UAE_CABINET.length} members · editorial snapshot dated 16 October 2026, not re-verified in this release`} onOpen={() => setCab(true)}>
            {cab && <ul className="grid gap-3 sm:grid-cols-2" data-testid="list-cabinet">{UAE_CABINET.map((p) => <Person key={p.slug} p={p} />)}</ul>}
          </Res>
          <Res id="enterprise" title="Emirati enterprise" note="UAE entries in Forbes Middle East, The World's Richest Arabs 2026" onOpen={() => setRich(true)}>
            {rich && <ul className="grid gap-3 sm:grid-cols-2" data-testid="list-billionaires">{UAE_BILLIONAIRES.map((p) => <Person key={p.slug} p={p} />)}</ul>}
          </Res>
          <Res id="sources" title="Sources & credits" note="Data, portraits and artwork.">
            <ul className="space-y-2 text-sm text-ink-800">
              <li>Rulers' names and titles: <a className="text-lagoon-700 underline" href="https://uaecabinet.ae/en/federal-supreme-council" target="_blank" rel="noopener noreferrer">UAE Cabinet, Federal Supreme Council</a>.</li>
              <li>Emirate introductions: <a className="text-lagoon-700 underline" href="https://u.ae/en/about-the-uae/the-seven-emirates" target="_blank" rel="noopener noreferrer">UAE Government portal</a>.</li>
              <li>Federal government (snapshot dated 16 October 2026): <a className="text-lagoon-700 underline" href="https://uaecabinet.ae/en/cabinet-members" target="_blank" rel="noopener noreferrer">UAE Cabinet, cabinet members</a>.</li>
              <li>Wealth estimates: Forbes Middle East, 2026 edition. Estimates, unaudited.</li>
              <li>Portraits come from mixed sources; each photo credit names its own. Not all are government images.</li>
              <li>Dubai dunes artwork supplied by The One Movement. Emirate silhouettes and maps on this page are stylised schematics.</li>
              <li>Thanks World regions are an editorial impact directory, not active campaigns.</li>
            </ul>
          </Res>
        </div>
      </div>
    </section>
  );
}
