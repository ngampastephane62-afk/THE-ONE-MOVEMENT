import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, BadgeCheck, BookOpen, Building2, Compass, Handshake, Lock, MessageSquare, Newspaper, Users } from 'lucide-react';
import { useGetProfessionalState, getGetProfessionalStateQueryKey } from '@workspace/api-client-react';
import { ErrorBox, errStatus, card } from '@/components/network/kit';
import EcosystemNews from '@/components/network/EcosystemNews';
import { useMe } from './ctx';
import Chapter from '@/components/editorial/Chapter';

type Need = 'free' | 'paid' | 'business';
type Svc = { id: string; href: string; need: Need; icon: typeof Users; en: [string, string]; fr: [string, string] };

const SERVICES: Svc[] = [
  { id: 'feed', href: '/member', need: 'free', icon: Newspaper, en: ['Member feed', 'Read the network. Activate your membership to publish ordinary posts, with no invitations required.'], fr: ['Fil des membres', 'Lisez le réseau. Activez votre participation pour publier normalement, sans invitation obligatoire.'] },
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

  // A paid-services lookup must not hide free discovery or infer a paid entitlement.
  const checked = !!q.data && !q.isError;
  const m = checked ? q.data?.membership : undefined;
  const active = !!m?.active;
  const founder = !!me.founder;
  const paid = founder || active;
  const biz = founder || (active && m?.tier === 'business');
  const open = (n: Need) => n === 'free' || (n === 'paid' ? paid : biz);
  const status = founder ? t('Founder access', 'Accès fondateur')
    : !checked ? t('Professional access not verified', 'Accès professionnel non vérifié')
    : active ? (m!.tier === 'business' ? 'Business / Sponsor' : 'Professional') : t('Free member', 'Membre gratuit');

  return (
    <div className="flex flex-col gap-5 px-3 pt-4 md:px-0 md:pt-0" data-testid="page-ecosystem">
      <div translate="no">
        <Chapter eyebrow={t('TOMI ECOSYSTEM', 'ÉCOSYSTÈME TOMI')}
          title={t('Everything open to you', 'Tout ce qui vous est ouvert')}
          aside={<span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon-900 px-3 py-1.5 text-xs font-semibold text-ivory-100" data-testid="status-ecosystem-tier">
            <BadgeCheck className="h-3.5 w-3.5 text-gold-400" />{status}{m && !active && !founder ? ` · ${m.status}` : ''}
          </span>} />
      </div>

      {q.isLoading && <p role="status" className="text-sm text-ink-700" data-testid="status-ecosystem-loading">{t('Checking professional services. Free services remain available.', 'Vérification des services professionnels. Les services gratuits restent accessibles.')}</p>}
      {(q.isError || (!q.isLoading && !q.data)) && <ErrorBox onRetry={() => q.refetch()} msg={`${t('Professional services could not be checked. Free services remain available.', 'Les services professionnels n’ont pas pu être vérifiés. Les services gratuits restent accessibles.')}${errStatus(q.error) ? ` (HTTP ${errStatus(q.error)})` : ''}`} />}
      <EcosystemNews limit={2} />
      <Link translate="no" href="/ecosystem" className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-lagoon-900 px-4 text-xs font-semibold text-gold-400" data-testid="link-explore-public">{t('Explore the public ecosystem — you stay signed in', 'Explorer l’écosystème public — vous restez connecté')}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
      <div translate="no" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const ok = open(s.need);
          const [title, body] = fr ? s.fr : s.en;
          const Icon = s.icon;
          const tag = s.need === 'free' ? t('Free', 'Gratuit') : s.need === 'paid' ? 'Professional · Business' : 'Business';
          return (
            <Link key={s.id} href={ok ? s.href : '/member/membership'} className={`${card} tomi-service group flex flex-col gap-2 p-4 ${ok ? '' : 'opacity-80'}`} data-testid={`link-service-${s.id}`}>
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
        {t('During community trials, updates, Business posts and reels require no invitations or subscription. Verify your email and activate the network to publish. Specialized paid services retain their existing access controls. Payment does not replace licence approval or identity certification.', 'Pendant les essais communautaires, les publications, les publications Business et les Reels ne nécessitent ni invitation ni abonnement. Vérifiez votre adresse e-mail et activez le réseau pour publier. Les services payants spécialisés conservent leurs contrôles d’accès. Le paiement ne remplace ni l’approbation de licence ni la certification d’identité.')}
      </p>
    </div>
  );
}
