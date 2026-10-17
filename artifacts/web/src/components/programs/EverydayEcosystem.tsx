import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, BookOpen, MessageSquare, UserCog, Handshake } from 'lucide-react';
import { PROGRAMME_TOPICS, programmeTopicIds } from '@/lib/programme-learning';

type Topic = (typeof PROGRAMME_TOPICS)[number];

/** Classify how a topic's content should be read, from its tags. */
function register(t: Topic): { label: string; note: string } | null {
  const tags = t.tags.map((x) => x.toLowerCase());
  const has = (...k: string[]) => k.some((x) => tags.some((tag) => tag.includes(x)));
  if (has('myth', 'fiction', 'literature', 'speculative')) return { label: 'Myth & fiction', note: 'Stories and imagined worlds, read as culture rather than historical fact.' };
  if (has('medic', 'health')) return { label: 'General education', note: 'General knowledge only. Not medical advice; consult a qualified professional.' };
  if (has('mining', 'resource', 'material', 'invest', 'finance')) return { label: 'General education', note: 'General knowledge only. Not investment, legal or technical advice.' };
  if (has('history', 'antiquity', 'heritage', 'science')) return { label: 'Fact & history', note: 'Grounded in sourced research. Check the source for detail.' };
  return null;
}

const STEPS = [
  { icon: MessageSquare, h: 'Ask or share in the feed', p: 'Post a question or a short lesson with its source. Existing member rules and publishing eligibility apply.', href: '/member', cta: 'Open the member feed', id: 'feed' },
  { icon: UserCog, h: 'Say what you offer', p: 'Add your expertise, what you offer and what you are looking for to your profile, and choose its visibility.', href: '/member/settings', cta: 'Edit profile settings', id: 'settings' },
  { icon: Handshake, h: 'Meet with consent', p: 'Find people by craft, ask before any introduction, then message from their profile. Contact details are never shown publicly.', href: '/member/people', cta: 'Find people', id: 'people' },
] as const;

export default function EverydayEcosystem({ programmeSlug }: { programmeSlug: string }) {
  const ordered = useMemo(() => {
    const rel = programmeTopicIds(programmeSlug);
    const first = rel.map((id) => PROGRAMME_TOPICS.find((t) => t.id === id)).filter(Boolean) as Topic[];
    const rest = PROGRAMME_TOPICS.filter((t) => !rel.includes(t.id));
    return { first, rest };
  }, [programmeSlug]);
  const [activeId, setActiveId] = useState<string>(() => ordered.first[0]?.id ?? PROGRAMME_TOPICS[0]?.id ?? '');
  const active = PROGRAMME_TOPICS.find((t) => t.id === activeId) ?? PROGRAMME_TOPICS[0];
  if (!active) return null;
  const reg = register(active);
  const hid = `everyday-${programmeSlug}`;

  const renderChip = (t: Topic) => (
    <button
      key={t.id} aria-controls="everyday-topic-panel"
      type="button" onClick={() => setActiveId(t.id)} aria-pressed={t.id === active.id} data-testid={`button-topic-${t.id}`}
      className={`min-h-10 shrink-0 border px-3 text-left text-[0.7rem] uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${t.id === active.id ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-lagoon-700 text-ivory-200 hover:border-gold-500 hover:text-gold-400'}`}
    >{t.title}</button>
  );

  return (
    <section id="everyday" className="scroll-mt-40 py-16 md:py-20" style={{ backgroundColor: 'hsl(187 67% 12%)' }} aria-labelledby={hid}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-eyebrow text-gold-400">Between editions · every day</p>
            <h2 id={hid} className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[0.98] text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
              CULTURE. SCIENCE. <span style={{ color: 'hsl(43 80% 73%)' }}>CREATION.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ivory-200 md:col-span-5">
            For learners, students, educators, artists, scientists and organisations. Pick a subject, read a free external source, bring a question to the community. The event is where these exchanges meet in person.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ivory-300">Closest to this programme</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Topics related to this programme">
            {ordered.first.map(renderChip)}
          </div>
          {ordered.rest.length > 0 && (
            <details className="mt-3 group">
              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center text-[0.7rem] uppercase tracking-[0.14em] text-gold-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" data-testid="button-topics-more">
                Explore other fields ({ordered.rest.length})
              </summary>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Topics from other fields">
                {ordered.rest.map(renderChip)}
              </div>
            </details>
          )}
        </div>

        <article id="everyday-topic-panel" className="mt-8 grid gap-px border border-lagoon-700 bg-lagoon-700 lg:grid-cols-12" aria-live="polite" data-testid={`card-topic-${active.id}`}>
          <div className="bg-ivory-100 p-6 md:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {reg && <span className="border border-lagoon-900 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-lagoon-900" data-testid="text-topic-register">{reg.label}</span>}
              {active.tags.slice(0, 4).map((tag) => <span key={tag} className="text-[0.6rem] uppercase tracking-[0.16em] text-ink-700">{tag}</span>)}
            </div>
            <h3 className="mt-4 font-display text-2xl leading-tight text-ink-900 md:text-3xl">{active.title}</h3>
            <p className="mt-4 leading-relaxed text-ink-800">{active.intro}</p>
            {reg && <p className="mt-3 text-xs italic text-ink-700">{reg.note}</p>}
            <p className="mt-6 border-l-2 border-gold-500 pl-4 font-display text-lg leading-snug text-ink-900">{active.question}</p>
          </div>
          <div className="flex flex-col bg-ivory-50 p-6 md:p-8 lg:col-span-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gold-600">Today's prompts</p>
            <ol className="mt-3 space-y-3">
              {active.prompts.map((p, i) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink-800"><span className="font-display text-gold-600">{i + 1}</span>{p}</li>
              ))}
            </ol>
            <a href={active.resource.url} target="_blank" rel="noopener noreferrer" data-testid={`link-resource-${active.id}`}
              className="group mt-6 flex items-start gap-3 border border-sand-300 bg-ivory-100 p-4 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-900" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{active.resource.title}</span>
                <span className="block text-xs text-ink-700">{active.resource.publisher} · {active.resource.format}</span>
                <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.16em] text-ink-700">External source · opens in a new tab · not a TOMI course</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </article>

        <div className="mt-8 border-l-2 border-gold-500 pl-5 text-sm leading-relaxed text-ivory-200">
          <p className="font-display text-xl text-gold-400">Before, during and beyond the event</p>
          <p className="mt-2">Before: exchange ideas, explain what you offer and ask what others need. In person: proposed showcases, exhibitions, demonstrations and conversations on identity, knowledge, creation and fiction bring these connections together. Afterwards: share what you learned and keep collaborating.</p>
          <p className="mt-2 text-xs text-ivory-300">The programme below describes this edition’s intended experience. Activities, participants, access and timing depend on the confirmed programme; these learning topics are not an announced event timetable.</p>
        </div>
        <ol className="mt-8 grid gap-px border border-lagoon-700 bg-lagoon-700 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, h, p, href, cta, id }) => (
            <li key={id} className="flex flex-col p-5" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
              <Icon className="h-4 w-4 text-gold-400" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg text-ivory-100">{h}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ivory-300">{p}</p>
              <Link href={href} data-testid={`link-everyday-${id}`} className="mt-4 inline-flex min-h-10 items-center self-start text-[0.7rem] font-semibold uppercase tracking-wider text-gold-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">{cta}</Link>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-ivory-300">
            Respect differences, attribute sources, ask for consent. Questions and disagreement are welcome; harassment, threats and misinformation are not. Posts follow existing member rules, eligibility and privacy settings.
          </p>
          <Link href="/join?intent=knowledge-hub#institutional-inquiry" data-testid="link-everyday-educator" className="inline-flex min-h-11 shrink-0 items-center border border-gold-500/70 px-5 text-[0.7rem] font-semibold uppercase tracking-wider text-gold-400 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
            Teach or contribute knowledge
          </Link>
        </div>
      </div>
    </section>
  );
}
