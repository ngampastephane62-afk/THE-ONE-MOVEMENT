import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';

const STEPS = [
  { n: '01', t: 'Sign in', d: 'Create or open your free TOMI member account.' },
  { n: '02', t: 'Verify your email', d: 'Only verified accounts can enter the member network.' },
  { n: '03', t: 'Activate the network', d: 'An explicit choice that makes your name visible to signed-in members.' },
  { n: '04', t: 'Share your story', d: 'Submit a written testimony, a short video with a caption, or both.' },
];

export default function ThanksEmirates() {
  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>Thanks Emirates — Thank You, Emirates. We Are One. | TOMI</title>
        <meta name="description" content="A TOMI community campaign inviting citizens, residents and people worldwide to share authentic personal stories of gratitude, coexistence and opportunity in the UAE." />
        <meta property="og:title" content="Thanks Emirates — Thank You, Emirates. We Are One." />
        <meta property="og:description" content="Share your personal story of gratitude and coexistence. Free participation through a TOMI member account." />
      </Helmet>

      <HeroSurface glowOrigin="behind" minHeight="82vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">COMMUNITY CAMPAIGN · #THANKSEMIRATES</p>
          <h1 className="mt-6 text-display-xl text-ivory-100" style={{ textWrap: 'balance' }}>
            <span className="block animate-cinematic-1">THANK YOU,</span>
            <span className="block animate-cinematic-2 text-gold-400">EMIRATES.</span>
          </h1>
          <p className="mt-6 font-display text-xl tracking-[0.2em] text-ivory-200 animate-cinematic-3">WE ARE ONE.</p>
          <div className="animate-cinematic-3">
            <GoldThread className="mt-10" length="240px" node />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200">
              Citizens, residents and people around the world are invited to tell, in their own words, what the
              United Arab Emirates has meant to them: gratitude, coexistence, opportunity.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/member/thanks-emirates" data-testid="link-share-story"><Button size="xl">SHARE YOUR STORY</Button></Link>
            </div>
          </div>
        </div>
      </HeroSurface>

      <section className="py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-eyebrow text-gold-600">THE TARGET</p>
            <p className="mt-4 font-display text-[clamp(5rem,16vw,10rem)] leading-none text-lagoon-600" data-testid="text-target">300</p>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-ink-700">stories — a target, not a total reached</p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7 space-y-6 text-lg leading-relaxed text-ink-800">
            <p>Every story here is personal and authentic. There are no scripts and no testimonials written on anyone's behalf.</p>
            <p>The One Movement International provides the ecosystem: a member space where these stories can be gathered and shared. This is a TOMI initiative; no governmental endorsement or Emirates airline sponsorship is implied.</p>
            <p className="text-base text-ink-700">One country. Many stories. Many cultures. One human connection. The first chapter aims to bring together 300 voices, each speaking from their own experience.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-xl text-ivory-100" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-400">HOW TO TAKE PART · FREE</p>
            <h2 id="how-heading" className="mt-4 text-display-lg">FOUR STEPS. NO PAYMENT.</h2>
          </Reveal>
          <ol className="mt-14 grid gap-px bg-gold-500/20 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className="bg-lagoon-900">
                <Reveal delay={i * 80} className="h-full p-7">
                  <span className="font-mono text-xs text-gold-500">{s.n}</span>
                  <h3 className="mt-4 font-display text-xl text-ivory-100">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-300">{s.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="mt-12 border-l-2 border-gold-500 pl-5 text-sm leading-relaxed text-ivory-200">
            Submitted stories are visible to signed-in TOMI members. They are not automatically published on the public website,
            not sent to any broadcaster, and do not lead to any official or governmental award.
          </Reveal>
          <div className="mt-10">
            <Link href="/member/thanks-emirates" data-testid="link-share-story-bottom"><Button size="xl">OPEN THE CAMPAIGN FORM</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
