import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import Reveal from '@/components/Reveal';

export default function Documentary() {
  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>The One Documentary — People, cultures, journeys | TOMI</title>
        <meta name="description" content="A documentary following the people, cultures, stories and encounters of The One Movement. A Dubai production is in development." />
        <meta property="og:title" content="The One Documentary" />
        <meta property="og:description" content="People, cultures, journeys and encounters. Dubai production in development." />
      </Helmet>

      <HeroSurface glowOrigin="bottom-center" minHeight="80vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 animate-cinematic-1">DOCUMENTARY</p>
          <h1 className="mt-6 text-display-xl text-ivory-100">
            <span className="block animate-cinematic-1">THE ONE</span>
            <span className="block animate-cinematic-2 text-gold-400">DOCUMENTARY</span>
          </h1>
          <div className="animate-cinematic-3">
            <GoldThread className="mt-10" length="240px" node />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200">
              A film that follows people, cultures, stories and journeys: the encounters that happen when different worlds meet.
            </p>
          </div>
        </div>
      </HeroSurface>

      <section className="py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="text-eyebrow text-gold-600">NEW PROJECT · DUBAI</p>
            <h2 className="mt-4 text-display-md text-ink-900">A DUBAI PRODUCTION, IN DEVELOPMENT.</h2>
            <p className="mt-6 inline-block border border-lagoon-600/40 bg-lagoon-600/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-lagoon-700" data-testid="status-documentary">
              In development — planned CANAL+ distribution subject to confirmation
            </p>
            <p className="mt-6 text-lg leading-relaxed text-ink-800">
              The next documentary is announced as a Dubai production, following the people and encounters behind the Movement.
              Distribution arrangements and broadcast dates will be announced once confirmed.
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5 lg:col-start-8 border-l border-sand-300 pl-8">
            <p className="text-eyebrow text-gold-600">PREVIOUS DOCUMENTARY</p>
            <p className="mt-4 leading-relaxed text-ink-800">A previous documentary about the Movement was broadcast via CANAL+ and TV5MONDE. Any distribution of the future project remains subject to confirmation.</p>
            <div className="mt-6 flex flex-col gap-2 text-sm font-semibold">
              <a href="https://www.canalplus.com/" target="_blank" rel="noreferrer" className="text-lagoon-600 underline underline-offset-4" data-testid="link-canalplus">canalplus.com</a>
              <Link href="/media" className="text-lagoon-600 underline underline-offset-4" data-testid="link-media-coverage">Previous coverage context on Media</Link>
            </div>
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
