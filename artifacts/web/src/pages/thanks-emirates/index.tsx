import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Pause, Play } from 'lucide-react';
import CulturalStory from '@/components/editorial/CulturalStory';
import EmiratesIntro from '@/components/emirates/EmiratesIntro';
import FederationChapter from '@/components/emirates/FederationChapter';
import LeadershipChapter from '@/components/emirates/LeadershipChapter';
import { EmiratesConnectionChapter } from '@/components/emirates/EmiratesStoryChapter';
import HumanStoryChapter from '@/components/emirates/HumanStoryChapter';
import JourneyChapter from '@/components/emirates/JourneyChapter';
import GlobalExplorer from '@/components/emirates/GlobalExplorer';
import EmiratesResources from '@/components/emirates/EmiratesResources';
import { EmiratesMotionContext } from '@/components/emirates/use-emirates-motion';
import '@/components/emirates/emirates.css';

export default function ThanksEmirates() {
  const [paused, setPaused] = useState(false);
  const [emirate, setEmirate] = useState(0);
  const toggle = useCallback(() => setPaused((p) => !p), []);
  const motion = useMemo(() => ({ paused, toggle }), [paused, toggle]);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id.startsWith('em-')) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <EmiratesMotionContext.Provider value={motion}>
      <div className="em bg-ivory-100" data-paused={paused ? 'true' : 'false'}>
        <Helmet>
          <title>Thanks Emirates — Thank You, Emirates. We Are One. | TOMI</title>
          <meta name="description" content="A TOMI initiative of gratitude, coexistence and human connection. Everyone, worldwide, is invited to share an authentic story about the UAE." />
          <meta property="og:title" content="Thanks Emirates — Thank You, Emirates. We Are One." />
        </Helmet>

        <EmiratesIntro />
        <FederationChapter index={emirate} onSelect={setEmirate} />
        <LeadershipChapter index={emirate} onSelect={setEmirate} />
        <CulturalStory preset="emirates" />
        <EmiratesConnectionChapter />
        <GlobalExplorer />
        <HumanStoryChapter />
        <JourneyChapter />
        <EmiratesResources />

        <section className="bg-lagoon-900 py-section-lg text-center text-ivory-100">
          <div className="mx-auto max-w-3xl px-6">
            <p className="font-display text-2xl leading-relaxed text-ivory-200">One story can inspire another. One person can connect another. One country can inspire the world.</p>
            <p className="mt-6 text-display-md text-gold-400">THANK YOU, EMIRATES. WE ARE ONE.</p>
            <p lang="ar" dir="rtl" className="em-ar mt-3 text-2xl text-gold-200">شكراً الإمارات</p>
            <p className="mt-6 text-xs text-ivory-300">A TOMI initiative. No governmental endorsement, patronage or Emirates airline sponsorship is implied.</p>
          </div>
        </section>

        <button type="button" onClick={toggle} aria-pressed={paused}
          className="em-focus fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 border border-gold-500/50 bg-lagoon-900/85 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400 backdrop-blur"
          data-testid="button-page-motion">
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
          {paused ? 'Play page motion' : 'Pause page motion'}
        </button>
      </div>
    </EmiratesMotionContext.Provider>
  );
}
