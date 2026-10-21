import { useGetGratitudeStories, getGetGratitudeStoriesQueryKey } from '@workspace/api-client-react';
import { StoryCard } from '@/components/gratitude/Story';

/** Shows only stories the server projects publicly for this author; privacy is enforced server-side. */
export default function ProfileGratitude({ memberId }: { memberId: number }) {
  const params = { author: memberId, sort: 'recent' as const, page: 1 };
  const q = useGetGratitudeStories(params, { query: { queryKey: getGetGratitudeStoriesQueryKey(params), refetchOnMount: 'always', retry: false } });
  const items = (q.data?.items ?? []).filter((s) => s.status === 'published' && s.profileEligible && s.authorId === memberId);
  if (!items.length) return null;
  return (
    <section className="mt-8 border-t border-sand-200 pt-6" aria-labelledby="profile-gratitude-h" data-testid="section-profile-gratitude">
      <p className="text-eyebrow text-gold-700">THANKS THE WORLD</p>
      <h2 id="profile-gratitude-h" className="mt-1 font-display text-xl text-ink-900">Stories of gratitude</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">{items.slice(0, 4).map((s) => <li key={s.id}><StoryCard s={s} href={`/thanks-the-world?story=${s.id}`} /></li>)}</ul>
    </section>
  );
}
