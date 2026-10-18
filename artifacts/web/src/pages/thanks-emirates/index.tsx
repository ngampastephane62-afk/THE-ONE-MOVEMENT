import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import EmiratesHero from '@/components/editorial/EmiratesHero';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';
import EmiratesDirectory from '@/components/editorial/EmiratesDirectory';
import CulturalStory from '@/components/editorial/CulturalStory';

const PRINCIPLES = [
  ['Unity', 'Difference held together rather than dissolved.'],
  ['Coexistence', 'Living alongside as a daily practice.'],
  ['Dialogue', 'Conversation before conclusion.'],
  ['Cultural diplomacy', 'Culture as the language institutions share.'],
  ['Human dignity', 'The measure against which every initiative is judged.'],
  ['Cooperation', 'International work done jointly, not in parallel.'],
  ['Peace', 'The purpose behind the convening.'],
  ['Innovation', 'New models tested, not merely discussed.'],
  ['Investment', 'Capital placed where it creates opportunity.'],
  ['Humanitarian action', 'Convening turned toward social good.'],
  ['Global connection', 'Relationships that outlast a single edition.'],
];
const PLATFORMS = ['The One Summit', 'Diplomatic Gala', 'Investment Forum', 'Fashion Week', 'The One Awards · The One Hour', 'Digital platform', 'Media & broadcast'];
const PROFILES = ['Entrepreneurs', 'Artists', 'Designers', 'Models', 'Creators', 'Media personalities', 'Young leaders', 'Investors', 'Professionals', 'Residents', 'Cultural figures', 'Community leaders'];
const STEPS = [
  { n: '01', t: 'Sign in', d: 'Create or open your free TOMI member account.' },
  { n: '02', t: 'Verify your email', d: 'Only verified accounts can enter the member network.' },
  { n: '03', t: 'Activate the network', d: 'An explicit choice that makes your name visible to signed-in members.' },
  { n: '04', t: 'Share your story', d: 'Submit a written testimony, a short video with a caption, or both.' },
];
const FORMATS = [
  ['Written testimony', 'Your account, in your own words and your own language.'],
  ['Short video', 'Recorded by you, with a caption. Unscripted.'],
  ['Portrait card', 'Image, name, country and one line in your words. A concept for the campaign.'],
  ['Editorial feature', 'Possible later through media relationships; not guaranteed.'],
];
const AMBASSADORS = [
  ['Global Ambassador', 'Represents the initiative internationally.'],
  ['Youth Ambassador', 'Brings the next generation into the conversation.'],
  ['Cultural Ambassador', 'Expresses it through art, design, music and heritage.'],
  ['Humanitarian Ambassador', 'Connects it to social and humanitarian projects.'],
  ['Community Ambassador', 'Builds participation in a city, nationality or network.'],
  ['Innovation Ambassador', 'Carries the ideas and innovation dimension.'],
  ['International Partner', 'Institutions engaging with the initiative formally.'],
];
const PHASES = [
  { n: '01', t: 'Social campaign', d: 'Stories recorded and shared by real members.', live: true },
  { n: '02', t: 'Global storytelling movement', d: 'Participation beyond the Emirates into international markets.' },
  { n: '03', t: 'Digital community', d: 'A dedicated section inside the TOMI application, in development.' },
  { n: '04', t: 'Ambassador & recognition programme', d: 'Sustained contribution recognised and profiled.' },
  { n: '05', t: 'Humanitarian & innovation initiatives', d: 'Community energy directed toward projects and ideas.' },
  { n: '06', t: 'Global digital humanitarian ecosystem', d: 'Supporting thinkers, innovators and social entrepreneurs; advancing intercultural understanding.' },
];
const ILLUSTRATIVE = [
  ['I built my career here.', 'Entrepreneur · Africa'],
  ['I was given room to build.', 'Founder · Europe'],
  ['Forty nationalities, one street.', 'Long-term resident'],
  ['Ambition is not a nationality.', 'Professional · Asia'],
];

export default function ThanksEmirates() {
  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>Thanks Emirates — Thank You, Emirates. We Are One. | TOMI</title>
        <meta name="description" content="A TOMI initiative of gratitude, coexistence and human connection. Everyone, worldwide, is invited to share an authentic story about the UAE." />
        <meta property="og:title" content="Thanks Emirates — Thank You, Emirates. We Are One." />
      </Helmet>

      <EmiratesHero>
        <div className="mx-auto w-full max-w-6xl px-6 pt-32">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">A TOMI INITIATIVE · #THANKSEMIRATES</p>
          <h1 className="mt-6 font-display text-[clamp(3.25rem,11vw,8.5rem)] leading-[0.9] tracking-[-0.02em] text-ivory-100" style={{ textWrap: 'balance' }}>
            <span className="block animate-cinematic-1">THANK YOU,</span><span className="block animate-cinematic-2 text-gold-400">EMIRATES.</span>
          </h1>
          <p className="mt-6 font-display text-xl tracking-[0.2em] text-ivory-200 animate-cinematic-3">WE ARE ONE.</p>
          <div className="animate-cinematic-3">
            <GoldThread className="mt-10" length="240px" node />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200">One country. Many stories. Many cultures. One human connection. Citizens, residents and people anywhere in the world are invited to say, in their own words, what the Emirates has meant to them.</p>
            <div className="mt-10"><Link href="/member/thanks-emirates" data-testid="link-share-story"><Button size="xl">SHARE YOUR STORY</Button></Link></div>
          </div>
        </div>
      </EmiratesHero>

      <EmiratesDirectory />
      <section className="py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">THE IDEA</p>
            <h2 className="mt-4 text-display-md text-ink-900">A campaign ends. A movement continues.</h2>
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-lg leading-relaxed text-ink-800 lg:col-span-6 lg:col-start-7">
            <p>Thank You, Emirates is not a campaign attached to TOMI from outside. It is one expression of the Movement's founding philosophy: people of different nationalities, cultures and backgrounds can meet, understand one another and build together.</p>
            <p>The One Movement provides the ecosystem; the initiative tells the human story. Success stories, a global community, an ideas platform, humanitarian initiatives and digital humanitarian diplomacy all have a place here.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-xl text-ivory-100">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-400">ROOTS · SEVEN PLATFORMS</p>
          <h2 className="mt-4 text-display-lg">IT STANDS INSIDE THE ECOSYSTEM.</h2>
          <p className="mt-5 max-w-2xl text-ivory-300">The initiative draws on TOMI's seven signature platforms rather than duplicating any of them. Five editions were delivered across the DRC, Nigeria and the Great Lakes region before the Emirates chapter opened.</p>
          <ol className="mt-12 grid gap-px bg-gold-500/20 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORMS.map((p, i) => (
              <li key={p} className="bg-lagoon-900 p-6"><span className="font-mono text-xs text-gold-500">0{i + 1}</span><p className="mt-3 font-display text-lg">{p}</p></li>
            ))}
            <li className="flex items-end bg-gold-500 p-6 text-ink-900"><p className="font-display text-lg">Thank You, Emirates: one movement within it.</p></li>
          </ol>
        </div>
      </section>

      <section className="py-section-xl">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><p className="text-eyebrow text-gold-600">WHY WE ARE ONE</p><h2 className="mt-4 text-display-lg text-ink-900">Eleven principles, one conviction.</h2></Reveal>
          <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map(([t, d], i) => (
              <li key={t} className="border-t border-sand-300 py-6" data-testid={`principle-${i + 1}`}>
                <span className="font-mono text-xs text-gold-600">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-2xl text-ink-900">{t}</h3>
                <p className="mt-1 text-sm text-ink-700">{d}</p>
              </li>
            ))}
            <li className="flex items-center border-t border-gold-500 py-6"><p className="font-display text-4xl text-lagoon-600">We are one.</p></li>
          </ol>
        </div>
      </section>

      <section className="border-y border-sand-300 bg-ivory-50 py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">REAL STORIES ONLY</p>
            <h2 className="mt-4 text-display-md text-ink-900">Your words. Your language. Unscripted.</h2>
            <p className="mt-5 leading-relaxed text-ink-800">Every story is an authentic account by the person who lived it. TOMI does not write on anyone's behalf. Everyone, anywhere in the world, is welcome.</p>
            <p className="mt-6 text-eyebrow text-gold-600">SUGGESTED STRUCTURE</p>
            <p className="mt-2 border-l-2 border-gold-500 pl-4 italic text-ink-800">My name is [name]. I come from [country]. The Emirates gave me [experience]. For me, this country represents [value]. Today I want to say: thank you, Emirates. We are one.</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-eyebrow text-ink-700">ILLUSTRATIVE ONLY · NOT REAL TESTIMONIALS</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ILLUSTRATIVE.map(([q, w]) => (
                <li key={q} className="border border-dashed border-sand-300 p-5"><p className="font-display text-xl text-ink-900/70">"{q}"</p><p className="mt-2 text-xs uppercase tracking-wider text-ink-700">{w}</p></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-700">These sample lines were written to show the tone of the initiative. They are not quotations from real participants.</p>
            <p className="mt-8 text-eyebrow text-gold-600">WHO TAKES PART</p>
            <ul className="mt-3 flex flex-wrap gap-2">{PROFILES.map((p) => <li key={p} className="border border-sand-300 px-3 py-1 text-xs text-ink-800">{p}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">THE PILOT</p>
            <p className="mt-4 font-display text-[clamp(5rem,16vw,10rem)] leading-none text-lagoon-600" data-testid="text-target">300</p>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-ink-700">stories in about 15 days</p>
          </Reveal>
          <Reveal delay={120} className="space-y-5 leading-relaxed text-ink-800 lg:col-span-6 lg:col-start-7">
            <p className="border-l-2 border-coral-500 pl-4 text-lg" data-testid="text-pilot-status">The first activation set a target of 300 stories in approximately 15 days. That target was not achieved. Story submissions remain open to members.</p>
            <p>The pilot was planned in four moves: foundation, first wave, expansion beyond the Emirates, and consolidation. Three hundred was always a target, not a guaranteed number.</p>
            <p className="text-sm text-ink-700">No official Emirati institutional account or hashtag is assumed. Any tagging would follow communication protocol and approval.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-xl text-ivory-100" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-400">HOW TO TAKE PART · FREE</p>
          <h2 id="how-heading" className="mt-4 text-display-lg">FOUR STEPS. NO PAYMENT.</h2>
          <ol className="mt-12 grid gap-px bg-gold-500/20 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => <li key={s.n} className="bg-lagoon-900 p-7"><span className="font-mono text-xs text-gold-500">{s.n}</span><h3 className="mt-4 font-display text-xl">{s.t}</h3><p className="mt-2 text-sm text-ivory-300">{s.d}</p></li>)}
          </ol>
          <p className="mt-14 text-eyebrow text-gold-400">CONTENT FORMATS</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map(([t, d]) => <div key={t} className="border-t border-gold-500/40 pt-4"><p className="font-display text-lg">{t}</p><p className="mt-1 text-sm text-ivory-300">{d}</p></div>)}
          </div>
          <p className="mt-12 border-l-2 border-gold-500 pl-5 text-sm leading-relaxed text-ivory-200">Submitted stories are visible to signed-in TOMI members. They are not automatically published publicly, not sent to any broadcaster, and lead to no official or governmental award. Media relationships named in the concept are not confirmed commissioning or distribution agreements.</p>
          <div className="mt-10"><Link href="/member/thanks-emirates" data-testid="link-share-story-bottom"><Button size="xl">OPEN THE STORY FORM</Button></Link></div>
        </div>
      </section>

      <section className="py-section-xl">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-600">AMBASSADORS & RECOGNITION · CONCEPT</p>
          <h2 className="mt-4 text-display-md text-ink-900">Those who carry the story forward.</h2>
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {AMBASSADORS.map(([t, d]) => <li key={t} className="border-t border-sand-300 py-5"><p className="font-display text-xl text-ink-900">{t}</p><p className="mt-1 text-sm text-ink-700">{d}</p></li>)}
          </ul>
          <p className="mt-8 max-w-3xl border-l-2 border-gold-500 pl-4 text-sm leading-relaxed text-ink-800">Any recognition would be issued by TOMI as "Recognition within the Thank You, Emirates initiative under The One Movement International". It is not a governmental award and carries no official status.</p>
          <div className="mt-14 grid gap-px bg-sand-300 md:grid-cols-2">
            <div className="bg-ivory-100 p-8">
              <p className="text-eyebrow text-gold-600">NOVEMBER · CONCEPT</p>
              <h3 className="mt-3 font-display text-2xl text-ink-900">A recognition ceremony, proposed.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">The concept proposes a recognition moment within a TOMI activity in November, in Dubai. No date, venue, event or patronage is confirmed.</p>
            </div>
            <div className="bg-ivory-100 p-8">
              <p className="text-eyebrow text-gold-600">EXPANSION · PROPOSED</p>
              <p className="mt-3 font-display text-2xl text-ink-900">Dubai <span className="text-gold-600">/</span> New York <span className="text-gold-600">/</span> London <span className="text-gold-600">/</span> Global</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">Dubai as the starting point; New York and London as proposed next cities; further cities only by partnership and mandate. None of these is confirmed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-section-xl">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-600">ROADMAP · SIX PHASES</p>
          <h2 className="mt-4 text-display-md text-ink-900">From a campaign to a humanitarian ecosystem.</h2>
          <ol className="mt-10 border-l border-sand-300">
            {PHASES.map((p) => (
              <li key={p.n} className="relative py-5 pl-8" data-testid={`phase-${p.n}`}>
                <span className={`absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full ${p.live ? 'bg-lagoon-600' : 'border border-sand-400 bg-ivory-50'}`} />
                <p className="flex flex-wrap items-center gap-3"><span className="font-mono text-xs text-gold-600">{p.n}</span><span className="font-display text-xl text-ink-900">{p.t}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.live ? 'bg-lagoon-600 text-ivory-50' : 'border border-sand-300 text-ink-700'}`}>{p.live ? 'Active: member story submissions' : 'Future phase'}</span></p>
                <p className="mt-1 text-sm text-ink-700">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">PARTNERSHIP PATHWAYS</p>
            <h2 className="mt-4 text-display-md text-ink-900">What could be built together.</h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-800">Institutions, media, creators and organisations can open a conversation. These are aspirations for discussion, not guaranteed outcomes. The initiative aims at positive storytelling and community engagement; it does not claim governmental, diplomatic or official results.</p>
            <Link href="/join#institutional-inquiry" className="mt-8 inline-block" data-testid="link-partnership-enquiry"><Button size="lg">START A CONVERSATION</Button></Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            <div><p className="font-display text-lg text-ink-900">In place</p><ul className="mt-3 space-y-2 text-sm text-ink-800"><li>Seven operating platforms</li><li>Media and creator network</li><li>Five delivered editions</li><li>Member story submissions</li></ul></div>
            <div><p className="font-display text-lg text-ink-900">To build</p><ul className="mt-3 space-y-2 text-sm text-ink-800"><li>Co-created campaign identity</li><li>November recognition moment</li><li>Humanitarian and innovation alignment</li><li>Dedicated app section</li></ul></div>
          </div>
        </div>
      </section>

      <section className="border-t border-sand-300 bg-ivory-50 py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="text-eyebrow text-gold-600">THANKS WORLD · REGIONAL DIRECTORY</p>
            <h2 className="mt-4 text-display-md text-ink-900">The same gratitude, in other regions.</h2>
          </div>
          <ul className="grid gap-px bg-sand-300 sm:grid-cols-2 md:col-span-6">
            <li><Link href="/thanks-world#africa" className="block bg-ivory-50 p-6 transition-colors hover:bg-ivory-100" data-testid="link-thanks-africa"><p className="font-display text-2xl text-ink-900">Thanks Africa</p><p className="mt-1 text-xs uppercase tracking-wider text-gold-600">Impact directory</p></Link></li>
            <li><Link href="/thanks-world#usa" className="block bg-ivory-50 p-6 transition-colors hover:bg-ivory-100" data-testid="link-thanks-usa"><p className="font-display text-2xl text-ink-900">Thanks USA</p><p className="mt-1 text-xs uppercase tracking-wider text-gold-600">Impact directory</p></Link></li>
          </ul>
        </div>
      </section>

      <CulturalStory preset="emirates" />
      <section className="bg-lagoon-900 py-section-lg text-center text-ivory-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-display text-2xl leading-relaxed text-ivory-200">One story can inspire another. One person can connect another. One country can inspire the world.</p>
          <p className="mt-6 text-display-md text-gold-400">THANK YOU, EMIRATES. WE ARE ONE.</p>
          <p className="mt-6 text-xs text-ivory-300">A TOMI initiative. No governmental endorsement, patronage or Emirates airline sponsorship is implied.</p>
        </div>
      </section>
    </div>
  );
}
