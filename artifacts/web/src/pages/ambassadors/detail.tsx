import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AMBASSADOR_NOMINEES, getAmbassadorBySlug } from '@workspace/shared';
import GoldThread from '@/components/GoldThread';
import CollaborationRequest from '@/components/editorial/CollaborationRequest';
import { posterFor } from '@/components/editorial/posters';
import WealthLabel from '@/components/editorial/WealthLabel';
import NomineeFilm from '@/components/editorial/NomineeFilm';

const PROGRAMME_HREF: Record<string, string> = { awards: '/programs/awards', summit: '/programs/summit', 'fashion-week': '/programs/fashion-week' };

export default function AmbassadorDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const person = getAmbassadorBySlug(slug);
  useEffect(() => { if (!person) navigate('/ambassadors', { replace: true }); }, [person, navigate]);
  if (!person) return null;
  const poster = posterFor(person.poster);
  const others = AMBASSADOR_NOMINEES.filter((a) => a.slug !== person.slug);

  return (
    <div className="bg-ivory-100">
      <Helmet>
        <title>{`${person.name} — Ambassador of Peace Nominee | TOMI`}</title>
        <meta name="description" content={`${person.name}: ${person.role}. Nominee for The One Awards Ambassador of Peace recognition.`} />
      </Helmet>

      <section className="relative overflow-hidden bg-lagoon-900 text-ivory-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-28 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Link href="/ambassadors" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-400" data-testid="link-back-ambassadors"><ArrowLeft className="h-3.5 w-3.5" />All nominees</Link>
            <p className="mt-10 text-eyebrow text-gold-400">AMBASSADOR OF PEACE · NOMINEE</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,9vw,6rem)] leading-[0.92] tracking-[-0.02em]" data-testid="text-ambassador-name">{person.name}</h1>
            <p className="mt-4 text-lg text-ivory-200">{person.role}</p>
            <GoldThread className="mt-8" length="200px" node />
            <ul className="mt-8 flex flex-wrap gap-2">
              {person.programmes.map((p, i) => (
                <li key={p}><Link href={PROGRAMME_HREF[p]} className="inline-block border border-gold-500/50 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-gold-400 hover:bg-gold-500/10" data-testid={`link-programme-${p}`}>{person.programmeLabels[i]}</Link></li>
              ))}
            </ul>
          </div>
          <figure className="lg:col-span-5 lg:col-start-8">
            {poster && <img src={poster.src} alt={`Official TOMI poster: ${person.name}, Ambassador of Peace nominee`} width={poster.width} height={poster.height} className="block h-auto w-full shadow-[0_30px_60px_-30px_hsl(187_67%_5%)]" />}
          </figure>
        </div>
      </section>

      <section className="py-section-lg">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            <div>
              <p className="text-eyebrow text-gold-600">PROFILE</p>
              <p className="mt-4 font-display text-2xl leading-snug text-ink-900">{person.bio}</p>
              <WealthLabel slug={person.slug} />
            </div>
            <div>
              <h2 className="mb-5 font-display text-2xl text-ink-900">Announcement film</h2>
              <NomineeFilm slug={person.slug} />
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              <div><p className="text-eyebrow text-gold-600">WORK & BUSINESS</p><ul className="mt-4 space-y-3 text-ink-800">{person.business.map((b) => <li key={b} className="border-t border-sand-300 pt-3 text-sm leading-relaxed">{b}</li>)}</ul></div>
              <div><p className="text-eyebrow text-gold-600">PUBLIC IMPACT</p><ul className="mt-4 space-y-3 text-ink-800">{person.impact.map((b) => <li key={b} className="border-t border-sand-300 pt-3 text-sm leading-relaxed">{b}</li>)}</ul></div>
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <p className="text-eyebrow text-gold-600">OFFICIAL LINKS</p>
                <ul className="mt-4 space-y-2">{person.socials.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-lagoon-600 hover:underline" data-testid={`link-social-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>{s.label}<ExternalLink className="h-3 w-3" /></a></li>)}</ul>
              </div>
              <div>
                <p className="text-eyebrow text-gold-600">SOURCES</p>
                <ul className="mt-4 space-y-2">{person.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-ink-800 hover:underline">{s.label}<ExternalLink className="h-3 w-3" /></a></li>)}</ul>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24"><CollaborationRequest targetSlug={person.slug} targetName={person.name} /></div>
          </aside>
        </div>
      </section>

      <section className="border-t border-sand-300 bg-ivory-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-eyebrow text-gold-600">OTHER NOMINEES</p>
          <ul className="mt-6 grid gap-px bg-sand-300 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}><Link href={`/ambassadors/${o.slug}`} className="block bg-ivory-50 p-5 transition-colors hover:bg-ivory-100" data-testid={`link-other-${o.slug}`}><p className="font-display text-xl text-ink-900">{o.name}</p><p className="mt-1 text-xs text-ink-700">{o.role}</p></Link></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
