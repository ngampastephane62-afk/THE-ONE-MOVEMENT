import { Helmet } from 'react-helmet-async';
import BrandPhotoActions from '@/components/editorial/BrandPhotoActions';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import EditorialFilm from '@/components/EditorialFilm';
import Reveal from '@/components/Reveal';
import PhotoSlot from '@/components/PhotoSlot';

const PILLARS = [
  { n: '01', t: 'Humanitarian', d: 'Standing beside people in moments of hardship, and turning gatherings into concrete gestures of care.' },
  { n: '02', t: 'Diplomatic', d: 'Creating space for ambassadors, institutions and leaders to meet, listen and build trust across borders.' },
  { n: '03', t: 'Cultural', d: 'Fashion, music, art and heritage as a shared language that lets different worlds recognise each other.' },
  { n: '04', t: 'Business & Investment', d: 'Connecting entrepreneurs, investors and markets so encounters can grow into lasting opportunity.' },
  { n: '05', t: 'Media', d: 'Carrying stories beyond the room, so voices from every continent reach a wider audience.' },
  { n: '06', t: 'Partnerships', d: 'Working with institutions and organisations who share the conviction that collaboration builds peace.' },
];

export default function OurVision() {
  return (
    <div className="tomi-vision-editorial">
      <Helmet>
        <title>Our Vision — Different worlds. One shared vision. | TOMI</title>
        <meta name="description" content="The One Movement International is an international platform for connection, collaboration, peace and opportunity, travelling across countries and continents." />
        <meta property="og:title" content="Our Vision — Different worlds. One shared vision." />
        <meta property="og:description" content="An international movement connecting people, cultures, institutions and opportunities. Not a single event." />
      </Helmet>

      <HeroSurface glowOrigin="behind" minHeight="88vh">
        <div className="mx-auto w-full max-w-6xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 mb-8 animate-cinematic-1">OUR VISION</p>
          <h1 className="text-display-xl text-ivory-100 max-w-5xl" style={{ textWrap: 'balance' }}>
            <span className="block animate-cinematic-1">DIFFERENT WORLDS.</span>
            <span className="block animate-cinematic-2 text-gold-400">ONE SHARED VISION.</span>
          </h1>
          <div className="animate-cinematic-3">
            <GoldThread className="mt-10" length="260px" node />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory-200">
              The One Movement International is an international platform for connection, collaboration,
              peace and opportunity. It is not a single event. It is a movement that travels.
            </p>
          </div>
          <PhotoSlot filename="vision-hero.jpg" alt="Creative community gathered for a casting" className="mt-12 aspect-[21/9] w-full" priority />
          <BrandPhotoActions filename="vision-hero.jpg" title="Creative community gathered for a casting" tone="dark" />
        </div>
      </HeroSurface>


      {/* A MOVEMENT THAT TRAVELS */}
      <section className="bg-ivory-100 py-section-xl">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow="A MOVEMENT THAT TRAVELS" heading="FROM ONE CONTINENT TO THE NEXT" thread size="lg" surface="light" />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7 space-y-6 text-lg leading-relaxed text-ink-800">
            <p>
              Across countries and continents, the Movement convenes people, institutions and ideas. Each
              stop brings together those who rarely share a room: creators and diplomats, entrepreneurs and
              community leaders, local voices and international partners.
            </p>
            <p>
              What remains after each gathering matters most: new relationships, new collaborations, and the
              quiet conviction that our differences can become a common strength.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-12">
            <div className="grid items-start gap-6 sm:grid-cols-3">
              {[
                { filename: 'vision-bukavu.jpg', alt: 'Fashion Week runway', caption: 'Fashion Week archive · a movement born in Bukavu' },
                { filename: 'vision-culture-peace.jpg', alt: 'Cultural performance', caption: 'Cultural expression · Founder archive' },
                { filename: 'vision-global-community.jpg', alt: 'Community outreach', caption: 'Community outreach · Founder archive' },
              ].map((photo) => (
                <figure key={photo.filename}>
                  <PhotoSlot filename={photo.filename} alt={photo.alt} className="aspect-[4/5] w-full" objectPosition="center 25%" />
                  <figcaption className="mt-3 text-xs leading-relaxed text-ink-700">{photo.caption}</figcaption>
                  <BrandPhotoActions filename={photo.filename} title={photo.caption} />
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SIX PILLARS */}
      <section className="bg-lagoon-900 py-section-xl text-ivory-100" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-400">SIX PILLARS</p>
            <h2 id="pillars-heading" className="mt-4 max-w-3xl text-display-lg">ONE MOVEMENT, MANY WAYS TO CONNECT.</h2>
          </Reveal>
          <ol className="mt-16 border-t border-gold-500/25">
            {PILLARS.map((p, i) => (
              <li key={p.n} className="border-b border-gold-500/25" data-testid={`pillar-${p.n}`}>
                <Reveal delay={i * 70} className="group grid gap-3 py-8 sm:grid-cols-12 sm:items-baseline">
                  <span className="font-mono text-xs text-gold-500 sm:col-span-1">{p.n}</span>
                  <h3 className="font-display text-2xl tracking-wide text-ivory-100 transition-colors group-hover:text-gold-400 sm:col-span-4">{p.t}</h3>
                  <p className="leading-relaxed text-ivory-300 sm:col-span-7">{p.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* HUMANITARIAN FILM */}
      <section className="bg-ivory-50 py-section-xl" aria-labelledby="humanitarian-heading">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-600">HUMANITARIAN PILLAR · ARCHIVE FILM</p>
            <h2 id="humanitarian-heading" className="mt-4 text-display-md text-ink-900">WHEN A GATHERING BECOMES A GESTURE.</h2>
          </Reveal>
          <Reveal delay={120} className="mt-10 text-ink-800">
            <EditorialFilm
              name="goma-donation"
              testId="film-goma-donation"
              label="Assistance to people displaced by war in Goma"
              caption="After the fifth edition of The One Movement, assistance was brought to people displaced by war in Goma, North Kivu, Democratic Republic of the Congo, in collaboration with UNHCR. Context supplied by the Founder."
              credit="Archive record of a past action — not an active fundraising appeal"
            />
          </Reveal>
        </div>
      </section>

      {/* CURRENT INITIATIVES */}
      <section className="bg-ivory-100 py-section-lg border-t border-sand-200">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><p className="text-eyebrow text-gold-600">THE VISION, IN MOTION</p></Reveal>
          <div className="mt-8 grid gap-px bg-sand-200 md:grid-cols-2">
            {[
              { href: '/thanks-emirates', k: 'Campaign', t: 'Thanks Emirates', d: 'Personal stories of gratitude, coexistence and opportunity.' },
              { href: '/the-one-documentary', k: 'Film', t: 'The One Documentary', d: 'People, cultures and journeys, following the Movement.' },
            ].map((x, i) => (
              <Reveal key={x.href} delay={i * 90} className="bg-ivory-50">
                <Link href={x.href} className="group flex h-full items-start justify-between gap-6 p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-vision-${x.href.slice(1)}`}>
                  <span>
                    <span className="text-eyebrow text-lagoon-600">{x.k}</span>
                    <span className="mt-2 block font-display text-2xl text-ink-900">{x.t}</span>
                    <span className="mt-2 block text-sm text-ink-700">{x.d}</span>
                  </span>
                  <ArrowUpRight className="h-6 w-6 shrink-0 text-gold-600 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HeroSurface minHeight="50vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <Reveal>
            <h2 className="text-display-lg text-ivory-100">
              THE MOVEMENT IS OPEN.<br />
              <span className="text-gold-400">THE WORLD IS INVITED.</span>
            </h2>
            <GoldThread className="mt-8 mx-auto" length="240px" node />
          </Reveal>
          <Reveal delay={100} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join"><Button size="xl" variant="default">JOIN THE MOVEMENT</Button></Link>
            <Link href="/ecosystem"><Button size="xl" variant="gold-outline">EXPLORE THE ECOSYSTEM</Button></Link>
          </Reveal>
        </div>
      </HeroSurface>
    </div>
  );
}
