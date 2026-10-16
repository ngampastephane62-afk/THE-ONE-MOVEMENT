import { Helmet } from 'react-helmet-async';
import DocumentarySequence from '@/components/editorial/DocumentarySequence';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';
import { PaymentReturn, useReturnParams } from '@/components/humanitarian/shared';

export default function Documentary() {
  const { sessionId, cancelled } = useReturnParams();
  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>The One Documentary — Films and archive | TOMI</title>
        <meta name="description" content="TOMI's documentary collection: the historical Goma film, a public Radio Okapi trailer, and a Dubai project in development." />
      </Helmet>
      <PaymentReturn sessionId={sessionId} cancelled={cancelled} />

      <HeroSurface glowOrigin="bottom-center" minHeight="70vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">DOCUMENTARY COLLECTION</p>
          <h1 className="mt-6 text-display-xl text-ivory-100"><span className="block animate-cinematic-1">THE ONE</span><span className="block animate-cinematic-2 text-gold-400">DOCUMENTARY</span></h1>
          <div className="animate-cinematic-3">
            <GoldThread className="mt-10" length="240px" node />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200">An archive of moments from the Movement's path: Goma first, Kinshasa next, Dubai in development. Supporting it supports the TOMI humanitarian fund.</p>
          </div>
        </div>
      </HeroSurface>

      <section className="py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-eyebrow text-gold-600">DOCUMENTARY COLLECTION · CONTINUOUS PLAYBACK</p>
            <h2 className="mt-3 text-display-md text-ink-900">Watch the collection.</h2>
            <p className="mt-3 text-sm text-ink-700">Goma first, then the Radio Okapi trailer. Start the first video to watch in sequence.</p>
            <div className="mt-6"><DocumentarySequence /></div>
          </Reveal>
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-gold-700">WATCH FREELY · SUPPORT VOLUNTARILY</p>
            <h2 className="mt-4 font-display text-3xl text-ink-900">Humanitarian action is not a subscription.</h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-800">A donation supports humanitarian needs, not a badge, publication rights or access to people. Professional ecosystem services are separate.</p>
            <Link href="/donate" className="mt-6 inline-block font-semibold text-lagoon-700 underline" data-testid="link-donate">Make a voluntary contribution</Link>
          </div>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-lg text-ivory-100" data-testid="documentary-edition-four">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-eyebrow text-gold-400">THE ONE MOVEMENT INTERNATIONAL · EDITION 4</p>
          <h2 className="mt-3 text-display-md">The fourth-edition documentary.</h2>
          <article className="mt-6 max-w-3xl border border-gold-500/40 bg-lagoon-800 p-6 sm:p-8" data-testid="documentary-tv5-report">
            <p className="text-eyebrow text-gold-400">TV5MONDE · REPORTAGE</p>
            <h3 className="mt-3 font-display text-xl sm:text-2xl">RD Congo : The One Fashion week, le rendez-vous Peace and Mode</h3>
            <p className="mt-3 text-sm text-ivory-200"><time dateTime="2024-02-06">6 February 2024</time> · 2 min 01 s</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory-200">A TV5MONDE report about designers from 12 countries gathering in Goma for fashion, peace and peaceful coexistence. Source supplied by the Founder for the fourth-edition archive.</p>
            <p className="mt-3 text-xs leading-relaxed text-ivory-300">Credit: TV5MONDE · N’daricaling Loppy / Amani Alimasi Joseph. Playback opens on the broadcaster’s website; it is not part of automatic playback on TOMI.</p>
            <a href="https://information.tv5monde.com/afrique/video/rd-congo-one-fashion-week-le-rendez-vous-peace-and-mode-2708092"
              target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400" data-testid="link-documentary-tv5">
              Watch the report on TV5MONDE
            </a>
          </article>
        </div>
      </section>

      <section className="py-section-lg">
        <div className="mx-auto grid max-w-6xl gap-px bg-sand-300 px-0 md:grid-cols-2">
          <Reveal className="bg-ivory-100 p-8">
            <p className="text-eyebrow text-gold-600">CHAPTER 02 · KINSHASA</p>
            <h3 className="mt-3 font-display text-2xl text-ink-900">Next in the collection.</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">Kinshasa is the next chapter planned for the archive. No film is published yet and no date is announced.</p>
          </Reveal>
          <Reveal delay={100} className="bg-ivory-100 p-8">
            <p className="text-eyebrow text-gold-600">SEPARATE PROJECT · DUBAI</p>
            <h3 className="mt-3 font-display text-2xl text-ink-900">A Dubai production, in development.</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">A distinct future project. Planned distribution is unconfirmed and no broadcaster acquisition is claimed. A previous documentary about the Movement was broadcast via CANAL+ and TV5MONDE.</p>
            <Link href="/media" className="mt-4 inline-block text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-media-coverage">Previous coverage on Media</Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-lagoon-900 py-section-lg text-center text-ivory-100">
        <Reveal className="mx-auto max-w-3xl px-6">
          <h2 className="text-display-md">PRODUCTION & DISTRIBUTION ENQUIRIES</h2>
          <p className="mt-5 text-ivory-300">Broadcasters, producers and institutions interested in the project can reach the team directly.</p>
          <Link href="/join#institutional-inquiry" className="mt-8 inline-block" data-testid="link-documentary-enquiry"><Button size="xl">SEND AN ENQUIRY</Button></Link>
        </Reveal>
      </section>
    </div>
  );
}
