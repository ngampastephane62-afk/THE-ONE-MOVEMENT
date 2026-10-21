import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useGetGratitudeOptions, getGetGratitudeOptionsQueryKey } from '@workspace/api-client-react';
import { IdentityBand } from '@/components/gratitude/Story';
import { identityOf } from '@/lib/gratitude';

/** Live campaign entry: reflects only what the Founder has actually activated. */
export default function ThanksWorldLive() {
  const q = useGetGratitudeOptions({ query: { queryKey: getGetGratitudeOptionsQueryKey(), refetchOnMount: 'always' } });
  const active = (q.data?.campaigns ?? []).filter((c) => c.status === 'active');
  const lead = active[0];
  return (
    <IdentityBand id={identityOf(lead)} className="border border-gold-500/30 p-6 sm:p-10">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end" data-testid="panel-ttw-live">
        <div className="lg:col-span-7">
          <p className="text-eyebrow text-gold-400">{lead ? 'OPEN NOW' : 'AWAITING ACTIVATION'}</p>
          <p className="mt-3 font-display text-2xl leading-snug text-ivory-100 sm:text-3xl">{q.isLoading ? 'Checking the campaign…' : lead ? lead.name : 'The campaign opens when the Founder activates it.'}</p>
          <p className="mt-3 text-sm leading-relaxed text-ivory-300">{lead ? (lead.description || 'Read published stories or share your own for review.') : 'You can write in the editor, but saving and submitting require an active campaign. Nothing becomes public until the Founder approves each submitted story.'}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
          <Link href="/thanks-the-world" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory-100" data-testid="link-ttw-explore">Explore the campaign <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/member/thanks-the-world" className="inline-flex min-h-11 items-center justify-center rounded-full border border-ivory-200/40 px-5 text-sm font-semibold text-ivory-100 hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" data-testid="link-ttw-share">Share your story</Link>
        </div>
      </div>
    </IdentityBand>
  );
}
