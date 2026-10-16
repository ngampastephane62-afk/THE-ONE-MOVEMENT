import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, BadgeCheck, BookOpen, Building2, Compass, Handshake, Lock, MessageSquare, Newspaper, Users } from 'lucide-react';
import { useGetProfessionalState, getGetProfessionalStateQueryKey } from '@workspace/api-client-react';
import { ErrorBox, Skeleton, card } from '@/components/network/kit';
import EcosystemNews from '@/components/network/EcosystemNews';
import { useMe } from './ctx';

type Need = 'free' | 'paid' | 'business';
type Svc = { id: string; href: string; need: Need; icon: typeof Users; en: [string, string]; fr: [string, string] };

const SERVICES: Svc[] = [
  { id: 'feed', href: '/member', need: 'free', icon: Newspaper, en: ['Member feed', 'Read the network. Posting opens with 10 verified referral followers.'], fr: ['Fil des membres', 'Lisez le réseau. La publication s’ouvre avec 10 abonnés parrainés vérifiés.'] },
  { id: 'people', href: '/member/people', need: 'free', icon: Users, en: ['People', 'Find and follow members across the network.'], fr: ['Membres', 'Trouvez et suivez les membres du réseau.'] },
  { id: 'messages', href: '/member/messages', need: 'free', icon: MessageSquare, en: ['Messages', 'Private conversations with members.'], fr: ['Messages', 'Conversations privées avec les membres.'] },
  { id: 'sectors', href: '/ecosystem', need: 'free', icon: Compass, en: ['Sector discovery', 'Public map of the TOMI ecosystem sectors.'], fr: ['Découverte des secteurs', 'Carte publique des secteurs de l’écosystème TOMI.'] },
  { id: 'resources', href: '/member/membership', need: 'paid', icon: BookOpen, en: ['Member resources', 'Networking guide and professional resources.'], fr: ['Ressources membres', 'Guide de réseautage et ressources professionnelles.'] },
  { id: 'intros', href: '/member/membership', need: 'paid', icon: Handshake, en: ['Introductions', 'Founder-reviewed introduction requests.'], fr: ['Mises en relation', 'Demandes de mise en relation examinées par le fondateur.'] },
  { id: 'business', href: '/member/business', need: 'business', icon: Building2, en: ['Company page review', 'Company page, member attestations and founder review.'], fr: ['Validation de l’entreprise', 'Page entreprise, attestations des membres et examen par le fondateur.'] },
];

function useFr() {
  const read = () => { try { return localStorage.getItem('tomi-language') === 'fr'; } catch { return document.documentElement.lang === 'fr'; } };
  const [fr, setFr] = useState(read);
  useEffect(() => {
    const o = new MutationObserver(() => setFr(read()));
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => o.disconnect();
  }, []);
  return fr;
}

export default function Ecosystem() {
  const { me } = useMe();
  const fr = useFr();
  const t = (en: string, f: string) => (fr ? f : en);
  const q = useGetProfessionalState({ query: { queryKey: getGetProfessionalStateQueryKey(), retry: false, refetchOnMount: true, refetchInterval: 120000, refetchIntervalInBackground: false } });

  if (q.isLoading) return <div className="p-3 md:p-0" data-testid="status-ecosystem-loading"><Skeleton rows={4} /></div>;
  if (q.isError || !q.data) return <div className="p-3 md:p-0"><ErrorBox onRetry={() => q.refetch()} msg={t('Your ecosystem access did not load.', 'Votre accès à l’écosystème n’a pas pu être chargé.')} /></div>;

  const m = q.data.membership;
  const active = !!m?.active;
  const founder = !!me.founder;
  const paid = founder || active;
  const biz = founder || (active && m?.tier === 'business');
  const open = (n: Need) => n === 'free' || (n === 'paid' ? paid : biz);
  const status = founder ? t('Founder access', 'Accès fondateur') : active ? (m!.tier === 'business' ? 'Business / Sponsor' : 'Professional') : t('Free member', 'Membre gratuit');

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-ecosystem">
      <header translate="no" className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-eyebrow text-gold-700">{t('TOMI ECOSYSTEM', 'ÉCOSYSTÈME TOMI')}</p>
          <h1 className="font-display text-2xl text-ink-900">{t('Everything open to you', 'Tout ce qui vous est ouvert')}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon-900 px-3 py-1.5 text-xs font-semibold text-ivory-100" data-testid="status-ecosystem-tier">
          <BadgeCheck className="h-3.5 w-3.5 text-gold-400" />{status}{m && !active && !founder ? ` · ${m.status}` : ''}
        </span>
      </header>

      <EcosystemNews limit={2} />
      <Link translate="no" href="/ecosystem" className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-gold-400" data-testid="link-explore-public">{t('Explore the public ecosystem — you stay signed in', 'Explorer l’écosystème public — vous restez connecté')}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
      <div translate="no" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const ok = open(s.need);
          const [title, body] = fr ? s.fr : s.en;
          const Icon = s.icon;
          const tag = s.need === 'free' ? t('Free', 'Gratuit') : s.need === 'paid' ? 'Professional · Business' : 'Business';
          return (
            <Link key={s.id} href={ok ? s.href : '/member/membership'} className={`${card} group flex flex-col gap-2 p-4 transition-transform hover:-translate-y-0.5 ${ok ? '' : 'opacity-80'}`} data-testid={`link-service-${s.id}`}>
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${ok ? 'text-lagoon-700' : 'text-sand-400'}`} />
                <span className="text-[10px] uppercase tracking-wider text-sand-400">{tag}</span>
              </div>
              <p className="font-semibold text-ink-900">{title}</p>
              <p className="text-xs leading-relaxed text-ink-700">{body}</p>
              <p className={`mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold ${ok ? 'text-lagoon-700' : 'text-gold-700'}`} data-testid={`status-service-${s.id}`}>
                {ok ? <>{t('Open', 'Ouvrir')}<ArrowUpRight className="h-3.5 w-3.5" /></> : <><Lock className="h-3.5 w-3.5" />{t('See membership', 'Voir l’adhésion')}</>}
              </p>
            </Link>
          );
        })}
      </div>

      <p translate="no" className="rounded-xl border border-sand-300 p-3 text-xs leading-relaxed text-ink-700" data-testid="text-ecosystem-rules">
        {t('A paid membership unlocks services only. It does not replace the 10 verified referral followers required to publish, licence approval, or identity certification.', 'Une adhésion payante débloque uniquement des services. Elle ne remplace ni les 10 abonnés parrainés vérifiés requis pour publier, ni l’approbation de licence, ni la certification d’identité.')}
      </p>
    </div>
  );
}
