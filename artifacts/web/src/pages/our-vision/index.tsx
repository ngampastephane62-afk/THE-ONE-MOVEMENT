import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import EditorialFilm from '@/components/EditorialFilm';
import Reveal from './VisionReveal';
import ConnectNetwork from './ConnectNetwork';
import ThanksWorldLive from './ThanksWorldLive';
import { FlagField } from '@/lib/gratitude';
import { COUNTRIES } from './country-data';

const FLAG_CODES = COUNTRIES.map((c) => c.code);
import '@/pages/thanks-the-world/ttw.css';
import './vision.css';

const NODES = [
  { x: 180, y: 210 }, { x: 330, y: 150 }, { x: 470, y: 260 }, { x: 560, y: 380 }, { x: 640, y: 170 },
  { x: 780, y: 240 }, { x: 900, y: 140 }, { x: 1010, y: 330 }, { x: 860, y: 470 }, { x: 420, y: 470 },
];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [5, 7], [7, 8], [3, 8], [3, 9], [0, 9], [4, 6]];

const BENEFITS = [
  { t: 'GLOBAL CONNECTION', d: 'Discover people and organisations across different sectors and regions.' },
  { t: 'PROFESSIONAL NETWORKING', d: 'Explore professional relationships and potential collaborations.' },
  { t: 'MEDIA & VISIBILITY', d: 'Discover opportunities to share stories, initiatives and creative work.' },
  { t: 'CULTURAL EXCHANGE', d: 'Connect with different communities and cultural perspectives.' },
  { t: 'PARTICIPATION', d: 'Discover TOMI programs, initiatives, events and participation opportunities.' },
  { t: 'HUMANITARIAN ENGAGEMENT', d: 'Learn about relevant humanitarian initiatives and ways to contribute.' },
];

const CELEBRATES = ['Gratitude', 'Unity', 'Cultural diversity', 'Coexistence', 'Human connection', 'Positive contributions'];

function useOffscreenPause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, paused };
}

export default function OurVision() {
  const hero = useOffscreenPause<HTMLElement>();
  const network = useOffscreenPause<HTMLElement>();

  return (
    <div className="tv tomi-vision-editorial">
      <Helmet>
        <title>Our Vision — One World. One Humanity. One Shared Future. | TOMI</title>
        <meta name="description" content="To connect the world as one — beyond borders, cultures, backgrounds and differences. TOMI stands for peace, unity, diversity, inclusion and human dignity." />
        <meta property="og:title" content="Our Vision — One World. One Humanity. One Shared Future." />
        <meta property="og:description" content="Different nations. Different cultures. Different ambitions. One shared humanity." />
      </Helmet>

      {/* 1–2. HERO with interconnection animation */}
      <section ref={hero.ref} className={`tv-hero ${hero.paused ? 'tv-paused' : ''}`} aria-labelledby="vision-hero-heading">
        <div className="tv-kuba" aria-hidden />
        <svg className="tv-map" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
          {LINKS.map(([a, b], i) => {
            const p = NODES[a], q = NODES[b];
            const mx = (p.x + q.x) / 2, my = Math.min(p.y, q.y) - 50;
            return <path key={i} className="tv-link" style={{ ['--i' as string]: i }} d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`} />;
          })}
          {NODES.map((n, i) => <circle key={i} className="tv-node" style={{ ['--i' as string]: i }} cx={n.x} cy={n.y} r="3.5" />)}
        </svg>
        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-6 py-24">
          <p className="text-eyebrow text-gold-400 mb-8">OUR VISION</p>
          <h1 id="vision-hero-heading" className="tv-rise tv-rise-h text-display-xl max-w-5xl text-ivory-100" style={{ textWrap: 'balance' }}>
            <span className="block">ONE WORLD.</span>
            <span className="block">ONE HUMANITY.</span>
            <span className="block text-gold-400">ONE SHARED FUTURE.</span>
          </h1>
          <span className="tv-sweep tv-sweep-h mt-8 w-40" aria-hidden />
          <p className="tv-rise tv-rise-m mt-8 max-w-2xl font-display text-2xl leading-snug text-ivory-100">
            “To connect the world as one — beyond borders, cultures, backgrounds and differences.”
          </p>
          <div className="tv-rise tv-rise-m mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ivory-200">
            <p>We envision a world where peace, unity, diversity and inclusion become the foundations of meaningful collaboration.</p>
            <p>We stand against discrimination, racism, hatred, violence, war and division.</p>
            <p>Through culture, diplomacy, business, innovation, media, humanitarian action and international cooperation, we bring people, communities, institutions and opportunities together.</p>
          </div>
          <span className="tv-sweep tv-sweep-m mt-8 w-24" aria-hidden />
        </div>
      </section>

      {/* Closing message */}
      <section className="relative overflow-hidden bg-ivory-100 py-section-lg">
        <div className="tv-kuba-light" aria-hidden />
        <FlagField codes={FLAG_CODES} count={32} />
        <Reveal className="relative mx-auto max-w-5xl px-6 text-center tv-from-scale">
          <p className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl" style={{ textWrap: 'balance' }}>
            “Different nations. Different cultures. Different ambitions. One shared humanity.”
          </p>
          <GoldThread className="mx-auto mt-8" length="200px" node />
          <p className="mt-8 text-eyebrow text-gold-600" data-testid="text-vision-motto">WE ARE ONE — FOR PEACE &amp; UNITY.</p>
        </Reveal>
      </section>

      {/* 4–5. HOW WE CONNECT */}
      <section ref={network.ref} className={`relative bg-lagoon-900 py-section-xl text-ivory-100 ${network.paused ? 'tv-paused' : ''}`} aria-labelledby="connect-heading">
        <div className="tv-kuba" style={{ opacity: 0.06 }} aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal className="grid gap-8 lg:grid-cols-12 tv-from-left">
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-gold-400">HOW WE CONNECT</p>
              <h2 id="connect-heading" className="mt-4 text-display-lg">Different worlds. Shared possibilities.</h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-ivory-300 lg:col-span-6 lg:col-start-7">
              <p>TOMI creates spaces where people, institutions, ideas and opportunities can connect across borders.</p>
              <p>Our approach brings together cultural, economic, diplomatic, humanitarian and social initiatives under one shared vision.</p>
            </div>
          </Reveal>
          <div className="mt-16"><ConnectNetwork /></div>
          <p className="mt-10 text-xs leading-relaxed text-ivory-300/70">These are the Movement's areas of action — distinct from the 17 ecosystem sectors and the six event programmes. They express TOMI's mission and intended areas of engagement, not government mandates, official partnerships, enforcement powers or guaranteed services.</p>
        </div>
      </section>

      {/* 7. WHAT MEMBERS CAN GAIN */}
      <section className="relative bg-ivory-100 py-section-xl" aria-labelledby="members-heading">
        <div className="tv-kuba-light" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-600">WHAT MEMBERS CAN GAIN</p>
            <h2 id="members-heading" className="mt-4 max-w-4xl text-display-lg text-ink-900">ONE NETWORK.<br />A WORLD OF POSSIBILITIES.</h2>
            <GoldThread className="mt-8" length="220px" node />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-800">Join a global community built around connection, visibility, collaboration and shared purpose.</p>
          </Reveal>
          <ol className="mt-14 grid gap-px bg-sand-200 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <li key={b.t} className="list-none bg-ivory-50 p-6 sm:p-8" data-testid={`card-benefit-${i + 1}`}>
                <Reveal delay={i * 60}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-gold-600">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl tracking-wide text-ink-900">{b.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-700">{b.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-ink-700">Explore existing programmes, editorial enquiries and member spaces. Membership opens possibilities; it does not guarantee investments, customers, introductions, certifications, media coverage or financial returns. Thanks the World stories are shared by members and published only after the Founder's review.</p>
            <Link href="/join" data-testid="link-join-members"><Button size="xl" variant="default">JOIN THE MOVEMENT</Button></Link>
          </Reveal>
        </div>
      </section>

      {/* 8. HUMANITARIAN IMPACT — original archive film preserved */}
      <section className="bg-ivory-50 py-section-xl" aria-labelledby="humanitarian-heading">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-eyebrow text-gold-600">HUMANITARIAN IMPACT</p>
            <h2 id="humanitarian-heading" className="mt-4 text-display-md text-ink-900">UNITY BECOMES MEANINGFUL THROUGH ACTION.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-800">Peace and solidarity are more than words. They become meaningful when communities come together to support human dignity and respond to humanitarian challenges.</p>
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

      {/* 9–11. THANKS THE WORLD */}
      <section id="thanks-the-world" style={{ scrollMarginTop: '96px' }} className="relative bg-lagoon-900 py-section-xl text-ivory-100" aria-labelledby="ttw-heading">
        <div className="tv-kuba" style={{ opacity: 0.05 }} aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal className="grid gap-8 lg:grid-cols-12 tv-from-left">
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400">THANKS THE WORLD · GLOBAL CAMPAIGN</p>
              <h2 id="ttw-heading" className="mt-4 text-display-lg">EVERY COUNTRY HAS A STORY.<br /><span className="text-gold-400">EVERY VOICE MATTERS.</span></h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-ivory-300 lg:col-span-6">
              <p>Across the world, people carry stories of gratitude, resilience and hope.</p>
              <p>Thanks the World is a global initiative inviting individuals to celebrate the people, communities and places that have positively shaped their journeys.</p>
              <ul className="flex flex-wrap gap-2 pt-2" aria-label="The campaign celebrates">
                {CELEBRATES.map((c) => <li key={c} className="border border-gold-500/30 px-3 py-1 text-sm text-gold-200">{c}</li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12 tv-from-right"><div id="thanks-world-campaign" style={{ scrollMarginTop: '96px' }}><ThanksWorldLive /></div></Reveal>
        </div>
      </section>

      {/* 12–13. THE VISION IN MOTION */}
      <section className="bg-ivory-100 py-section-lg border-t border-sand-200" aria-labelledby="motion-heading">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><p id="motion-heading" className="text-eyebrow text-gold-600">THE VISION IN MOTION</p></Reveal>
          <div className="mt-8 grid gap-px bg-sand-200 md:grid-cols-3">
            {[
              { href: '/thanks-the-world', k: 'Global Gratitude Campaign', t: 'THANKS THE WORLD', d: 'Members share personal stories of gratitude, published after the Founder\'s review once a campaign is active.', pat: 'M0 30 Q25 0 50 30 T100 30' },
              { href: '/thanks-emirates', k: 'UAE Gratitude Campaign', t: 'THANKS EMIRATES', d: 'A distinct campaign of personal stories of gratitude, coexistence and opportunity connected to the UAE.', pat: 'M0 50 L25 20 L50 50 L75 20 L100 50' },
              { href: '/the-one-documentary', k: 'Documentary / storytelling initiative', t: 'THE ONE DOCUMENTARY', d: 'People, cultures and journeys, following the Movement.', pat: 'M0 40 H30 M40 40 H60 M70 40 H100 M30 20 V60 M70 20 V60' },
            ].map((x, i) => (
              <Reveal key={x.href} delay={i * 90} className="bg-ivory-50">
                {x.href.startsWith('#') ? (
                  <a href={x.href} className="group flex h-full flex-col gap-5 p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-vision-${x.href.replace(/^[#/]/, '')}`}>
                  <svg viewBox="0 0 100 70" className="h-14 w-24" fill="none" stroke="hsl(42 62% 46%)" strokeWidth="1.5" aria-hidden><path d={x.pat} /></svg>
                  <span className="text-eyebrow text-lagoon-600">{x.k}</span>
                  <span className="font-display text-2xl text-ink-900">{x.t}<span className="tv-title-line mt-2" aria-hidden /></span>
                  <span className="text-sm leading-relaxed text-ink-700">{x.d}</span>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>
                </a>
                ) : (
                  <Link href={x.href} className="group flex h-full flex-col gap-5 p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid={`link-vision-${x.href.replace(/^[#/]/, '')}`}>
                  <svg viewBox="0 0 100 70" className="h-14 w-24" fill="none" stroke="hsl(42 62% 46%)" strokeWidth="1.5" aria-hidden><path d={x.pat} /></svg>
                  <span className="text-eyebrow text-lagoon-600">{x.k}</span>
                  <span className="font-display text-2xl text-ink-900">{x.t}<span className="tv-title-line mt-2" aria-hidden /></span>
                  <span className="text-sm leading-relaxed text-ink-700">{x.d}</span>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>
                </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HeroSurface minHeight="50vh" className="px-6">
        <div className="mx-auto max-w-4xl py-section-lg text-center">
          <Reveal>
            <h2 className="text-display-lg text-ivory-100">
              WE ARE ONE.<br />
              <span className="text-gold-400">FOR PEACE &amp; UNITY.</span>
            </h2>
            <GoldThread className="mt-8 mx-auto" length="240px" node />
          </Reveal>
          <Reveal delay={100} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join" data-testid="link-join-final"><Button size="xl" variant="default">JOIN THE MOVEMENT</Button></Link>
            <Link href="/ecosystem" data-testid="link-ecosystem"><Button size="xl" variant="gold-outline">EXPLORE THE ECOSYSTEM</Button></Link>
          </Reveal>
        </div>
      </HeroSurface>
    </div>
  );
}
