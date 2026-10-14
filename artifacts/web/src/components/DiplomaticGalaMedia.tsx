import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import founderSpeaking from '@/assets/media/programs/gala-founder-speaking.webp';
import privateOffice from '@/assets/media/programs/gala-private-office.webp';
import diplomaticHandshake from '@/assets/media/programs/gala-diplomatic-handshake.webp';
import partnerMeeting from '@/assets/media/programs/gala-partner-meeting.webp';
import partnerHandshake from '@/assets/media/programs/gala-partner-handshake.webp';
import mediaDialogue from '@/assets/media/programs/gala-media-dialogue.webp';
import ambassador from '@/assets/media/programs/gala-ambassador.webp';

const slides = [
  { image: ambassador, caption: 'Meeting with the Ambassador · Founder diplomatic archive' },
  { image: privateOffice, caption: 'Private office partnership · Founder diplomatic archive' },
  { image: diplomaticHandshake, caption: 'Diplomatic partner exchange · Founder diplomatic archive' },
  { image: partnerMeeting, caption: 'Institutional partner meeting · Founder diplomatic archive' },
  { image: partnerHandshake, caption: 'Building diplomatic connections · Founder diplomatic archive' },
  { image: mediaDialogue, caption: 'Media and institutional dialogue · Founder archive' },
];

export function DiplomaticGalaPreview({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden bg-lagoon-900 ${className}`}>
      <img
        src={founderSpeaking}
        alt="The Founder speaking at a microphone with United Nations emblems behind him"
        loading="lazy"
        className="h-full w-full object-cover object-[center_35%]"
      />
    </div>
  );
}

export function DiplomaticGalaGallery() {
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!carousel) return;
    const update = () => setSelected(carousel.selectedScrollSnap());
    update();
    carousel.on('select', update);
    carousel.on('reInit', update);
    return () => {
      carousel.off('select', update);
      carousel.off('reInit', update);
    };
  }, [carousel]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Founder diplomatic meetings">
      <p className="mb-6 max-w-3xl text-ink-800">
        Meetings with ambassadors and diplomatic, institutional and private office partners.
        These photographs document the Founder’s network and exchanges, not a completed edition of the Gala.
      </p>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map(({ image, caption }, index) => (
            <figure key={image} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
              <div className="flex h-[430px] items-center justify-center bg-lagoon-900 sm:h-[560px]">
                <img src={image} alt={caption} loading="lazy" className="h-full w-full object-contain" />
              </div>
              <figcaption className="mt-3 text-sm text-ink-700">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button type="button" aria-label="Previous diplomatic photo" onClick={() => carousel?.scrollPrev()} className="flex h-11 w-11 items-center justify-center border border-gold-600 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-600"><ChevronLeft size={20} /></button>
          <button type="button" aria-label="Next diplomatic photo" onClick={() => carousel?.scrollNext()} className="flex h-11 w-11 items-center justify-center border border-gold-600 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-600"><ChevronRight size={20} /></button>
        </div>
        <div className="flex" aria-label="Choose a diplomatic photo">
          {slides.map((slide, index) => (
            <button key={slide.image} type="button" aria-label={`Show photo ${index + 1}`} aria-pressed={selected === index} onClick={() => carousel?.scrollTo(index)} className="flex h-10 w-8 items-center justify-center">
              <span className={`h-2 w-2 rounded-full ${selected === index ? 'bg-gold-600' : 'bg-ink-900/25'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DiplomaticGalaSpeakers() {
  return (
    <section className="border-t border-sand-200 bg-ivory-100 py-section-lg" aria-labelledby="gala-speakers-heading">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-eyebrow text-gold-600">DIALOGUE &amp; EXCHANGE</p>
        <h2 id="gala-speakers-heading" className="mt-4 font-display text-3xl text-ink-900">OUR SPEAKERS DURING THE EVENT</h2>
        <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
          <figure>
            <DiplomaticGalaPreview className="mx-auto aspect-[3/4] w-full max-w-sm" />
            <figcaption className="mt-3 text-sm text-ink-700">The Founder speaking · institutional engagement archive</figcaption>
          </figure>
          <div className="text-ink-800">
            <p className="leading-relaxed">
              The Gala’s speaker programme is designed to bring diplomatic voices, institutional leaders,
              NGO and humanitarian representatives, private office and business leaders into a shared
              conversation on peace, cooperation and positive impact.
            </p>
            <p className="mt-5 leading-relaxed">
              Talks and moderated exchanges will connect these perspectives with opportunities
              for dialogue and collaboration across sectors.
            </p>
            <p className="mt-6 border-l-2 border-gold-600 pl-4 text-sm">
              The confirmed speaker line-up and speaking schedule will be announced when official.
              Archive photographs do not confirm participation in the upcoming Gala.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
