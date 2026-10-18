import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

export interface StoryStage { period: string; place: string; text: string; status?: 'held' | 'in-development' }

/** Verified stages, restated from the homepage timeline and documentary page copy. */
export const DRC_ORIGIN_STAGES: StoryStage[] = [
  { period: '2019', place: 'Bukavu, DRC', text: 'The One Fashion Week is born in Bukavu, Democratic Republic of Congo.', status: 'held' },
  { period: '2019\u20132022', place: 'Bukavu, DRC', text: 'Three editions in Bukavu carry a message of peace through fashion.', status: 'held' },
  { period: '2024', place: 'Goma, DRC', text: 'Goma hosts the fourth edition.', status: 'held' },
  { period: '2025', place: 'Kinshasa, DRC', text: 'Kinshasa hosts the fifth edition under the theme Peace and Unity.', status: 'held' },
  { period: 'Next', place: 'Dubai, UAE', text: 'A separate Dubai documentary production is in development, subject to final confirmation.', status: 'in-development' },
];

export const STORY_PRESETS = {
  world: { eyebrow: 'Thank you world · Thanks Africa', title: 'Many cultures, each with its own voice', intro: 'Global connection starts with listening to the histories, creative practices and contemporary ambitions of each community. Africa is not one story; the Democratic Republic of Congo holds a particular place in the movement\u2019s origins.' },
  emirates: { eyebrow: 'Shukran Emirates · cultural discovery', title: 'Heritage and the contemporary city', intro: 'Discover the United Arab Emirates through architecture, Arabic design traditions, hospitality and innovation. These editorial themes are an invitation to learn, not a claim of government endorsement.' },
  documentary: { eyebrow: '10 YEARS ONE RECORD · verified stages', title: 'Goma first, Kinshasa next, Dubai in development', intro: 'The movement\u2019s documentary journey sits within its wider history. The dated editions below come from the existing timeline; they are not film release dates. Kinshasa footage is not published here, and Dubai remains a separate future project.' },
} as const;

export const CULTURAL_LENSES = {
  world: [
    { title: 'Thanks Africa', text: 'Explore the continent through its many living cultures: textile craft, music, literature, architecture and contemporary creative and scientific work.', href: '/thanks-world#africa', action: 'Explore the Africa directory' },
    { title: 'Congolese origins', text: 'Bukavu, Goma and Kinshasa are part of the movement’s history. Meet this story through its documented editions and freely accessible archive, without reducing the DRC to conflict.', href: '/the-one-documentary', action: 'Discover the documentary journey' },
    { title: 'A global conversation', text: 'Culture grows through exchange, not a single image of a country. Explore creative worlds and the people who choose to participate.', href: '/ecosystem?sector=art#explore', action: 'Enter the Art world' },
  ],
  emirates: [
    { title: 'Architecture and Arabic design', text: 'Courtyards, shaded spaces, geometric ornament and calligraphic traditions offer starting points for exploring heritage alongside contemporary architecture.', href: '/ecosystem?sector=real-estate#explore', action: 'Explore architecture' },
    { title: 'Hospitality and cultural exchange', text: 'A welcome, a shared table and stories across languages invite personal perspectives on life in the Emirates. Participation here does not confer institutional recognition.', href: '/member/thanks-emirates', action: 'Share your perspective in the member space' },
    { title: 'Innovation and cooperation', text: 'Look at the relationship between creative enterprise, technology and economic development. Discover the existing worlds without assuming a government or corporate affiliation.', href: '/ecosystem?sector=innovation#explore', action: 'Enter the Innovation world' },
  ],
} as const;

function Pattern() {
  // Original geometric band, inspired by woven textile rhythm. Decorative.
  return (
    <svg viewBox="0 0 240 24" className="h-6 w-full text-gold-500" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 20} 12 L${i * 20 + 10} 2 L${i * 20 + 20} 12 L${i * 20 + 10} 22 Z`} fill="none" stroke="currentColor" strokeWidth="1" opacity={i % 2 ? 0.5 : 0.9} />)}
    </svg>
  );
}

export default function CulturalStory({ preset, stages = DRC_ORIGIN_STAGES }: { preset: keyof typeof STORY_PRESETS; stages?: StoryStage[] }) {
  const p = STORY_PRESETS[preset];
  return (
    <section className="bg-ivory-50 py-section-lg" aria-labelledby={`story-${preset}`} data-testid={`section-cultural-story-${preset}`}>
      <div className="mx-auto max-w-7xl px-6">
        <Pattern />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="text-eyebrow text-gold-700">{p.eyebrow}</p>
            <h2 id={`story-${preset}`} className="mt-3 text-display-md text-ink-900">{p.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">{p.intro}</p>
            <p className="mt-4 text-xs text-ink-700">Pattern above is an original illustration.</p>
            <Link href="/the-one-documentary" className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid={`link-story-documentary-${preset}`}>The One Documentary <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </Reveal>
          {preset === 'documentary' ? <ol className="relative lg:col-span-8 border-l border-gold-500/50 pl-6" aria-label="Movement journey">
            {stages.map((s, i) => (
              <li key={`${s.period}-${i}`} className="relative pb-8 last:pb-0" data-testid={`story-stage-${preset}-${i}`}>
                <span className={`absolute -left-[31px] top-1 h-3 w-3 rotate-45 border ${s.status === 'in-development' ? 'border-coral-500 bg-ivory-50' : 'border-gold-600 bg-gold-500'}`} aria-hidden="true" />
                <Reveal delay={i * 70}>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700">{s.period} · {s.place}{s.status === 'in-development' ? ' · in development' : ''}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-800">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol> : <div className="grid gap-4 lg:col-span-8">
            {CULTURAL_LENSES[preset].map(lens => (
              <article key={lens.title} className="border border-sand-300 border-l-gold-500 bg-ivory-100 p-5">
                <h3 className="font-display text-lg text-ink-900">{lens.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{lens.text}</p>
                <Link href={lens.href} className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-lagoon-700 underline underline-offset-4">{lens.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
            ))}
          </div>}
        </div>
      </div>
    </section>
  );
}
