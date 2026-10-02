import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';
import ResponsiveMedia from '@/components/ResponsiveMedia';
import Reveal from '@/components/Reveal';

export default function OurVision() {
  return (
    <div className="tomi-vision-editorial">
      <Helmet>
        <title>OUR VISION — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Our vision, purpose, and global ambition. Connecting humanity, creating opportunity, and building peace." />
        <meta property="og:title" content="OUR VISION — THE ONE MOVEMENT INTERNATIONAL" />
        <link rel="canonical" href="/our-vision" />
      </Helmet>

      {/* 1. VISION HERO */}
      <HeroSurface glowOrigin="behind" minHeight="85vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-5">OUR VISION</p>
              <h1 className="text-display-xl text-ivory-100" style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}>
                <Reveal direction="up">CONNECTING <span style={{ color: 'hsl(43 80% 73%)' }}>HUMANITY.</span></Reveal>
                <Reveal direction="up" delay={100}>CREATING OPPORTUNITY.</Reveal>
                <Reveal direction="up" delay={200}>BUILDING PEACE.</Reveal>
              </h1>
              <Reveal delay={300}>
                <GoldThread className="mt-8" length="240px" node />
                <p className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-lg">
                  The One Movement International brings people, cultures, businesses and
                  institutions together. Our vision is a trusted global collaboration ecosystem
                  that expands opportunity and dialogue without borders.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <Reveal direction="left" delay={200}>
                <ResponsiveMedia
                  kind="portrait-image"
                  label="HERO MEDIA — CINEMATIC CULTURES MONTAGE"
                  purpose="Establish the global, cinematic scope of the movement."
                  className="tomi-vision-frame w-full aspect-[3/4]"
                />
              </Reveal>
            </div>
          </div>
        </div>
      </HeroSurface>

      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* 2. PURPOSE */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <SectionHeading
                eyebrow="OUR PURPOSE"
                heading="A STAGE FOR EVERY STORY"
                thread
                size="lg"
                surface="light"
              />
            </Reveal>
            <Reveal delay={100} direction="right" className="lg:col-span-6 lg:col-start-7 flex items-center">
              <div className="space-y-6 text-ink-800 leading-relaxed text-lg">
                <p>
                  We believe that every human being — of every origin, body, ability and story — deserves a place on the world's stage.
                </p>
                <p>
                  Through culture, business, diplomacy, and innovation, we build platforms where those stories can be heard. By connecting leaders, creators, and institutions, we foster collaboration that translates into tangible opportunity and a lasting peace.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. HUMAN CONNECTION */}
      <section className="py-section-lg border-t border-sand-200" style={{ backgroundColor: 'hsl(40 71% 98%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal direction="right" className="lg:col-span-5 order-2 lg:order-1">
              <PhotoSlot
                filename="vision-human-connection.jpg"
                alt=""
                imageType="Founder media required"
                purpose="A genuine moment of human connection or creative expression."
                className="tomi-vision-frame w-full aspect-square sm:aspect-[4/5] shadow-xl"
              />
            </Reveal>
            <Reveal direction="left" className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
              <p className="text-eyebrow text-gold-600 mb-4">HUMAN CONNECTION</p>
              <h2 className="text-display-lg text-ink-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                THE POWER OF <br/>MEETING.
              </h2>
              <div className="space-y-5 text-ink-800 leading-relaxed">
                <p>
                  True understanding requires contact. Whether on a runway, in a boardroom, or at a diplomatic summit, the most profound changes occur when different worlds intersect.
                </p>
                <p>
                  We engineer these intersections intentionally, ensuring that dialogue leads to action, and action leads to progress.
                </p>
              </div>
              <GoldThread className="mt-10" length="200px" node />
            </Reveal>
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* 4. GLOBAL AMBITION & FUTURE DIRECTION */}
      <section className="py-section-lg" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal className="lg:col-span-6">
              <SectionHeading
                eyebrow="GLOBAL AMBITION"
                heading="BUILDING A CONNECTED ECOSYSTEM."
                surface="dark"
                size="lg"
                thread
              />
              <div className="mt-8 space-y-6 text-ivory-200 leading-relaxed text-lg">
                <p>
                  What starts as physical programs and events is evolving into a comprehensive digital and physical network. Our ambition is to unite fifteen sectors into a single, navigable ecosystem.
                </p>
                <p>
                  Future vision: an AI-powered, trusted, all-in-one global collaboration ecosystem. It is a direction we are working toward, not a service available today.
                </p>
              </div>
              <Link href="/ecosystem" className="mt-10 inline-block">
                <Button variant="gold-outline">EXPLORE THE ECOSYSTEM</Button>
              </Link>
            </Reveal>

            <Reveal delay={150} direction="left" className="lg:col-span-5 lg:col-start-8">
              <ResponsiveMedia
                kind="portrait-image"
                label="GLOBAL ECOSYSTEM MEDIA"
                purpose="Visual representation of international reach and interconnectedness."
                className="tomi-vision-frame w-full aspect-[4/5] shadow-2xl"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* 5. CLOSING */}
      <HeroSurface minHeight="50vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <Reveal>
            <h2 className="text-display-lg text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              THE MOVEMENT IS OPEN.<br />
              <span style={{ color: 'hsl(43 80% 73%)' }}>THE WORLD IS INVITED.</span>
            </h2>
            <GoldThread className="mt-8 mx-auto" length="240px" node />
          </Reveal>
          <Reveal delay={100} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join">
              <Button size="xl" variant="default">JOIN THE MOVEMENT</Button>
            </Link>
          </Reveal>
        </div>
      </HeroSurface>
    </div>
  );
}
