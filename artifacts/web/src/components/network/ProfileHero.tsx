import type { CSSProperties, ReactNode } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import type { NetworkMember } from '@workspace/api-client-react';
import { Avatar, Badges } from './kit';
import { SOCIAL_PROFILES, normalizeSocialProfile, type SocialProfileField } from '@workspace/shared';

export type ProfileLayout = 'immersive' | 'centered' | 'editorial';
export type PostsLayout = 'grid' | 'list';

export const LAYOUTS: { id: ProfileLayout; name: string; note: string }[] = [
  { id: 'immersive', name: 'Immersive', note: 'Your cover fills the page, identity set over it.' },
  { id: 'centered', name: 'Centered', note: 'A portrait-first card floating on your cover.' },
  { id: 'editorial', name: 'Editorial', note: 'Magazine split: words on paper, image beside.' },
];

export function appearanceOf(m: { profileLayout?: string; coverPosition?: number; postsLayout?: string } | null | undefined) {
  const layout = (['immersive', 'centered', 'editorial'] as const).find((l) => l === m?.profileLayout) ?? 'immersive';
  const pos = typeof m?.coverPosition === 'number' && Number.isFinite(m.coverPosition) ? Math.min(100, Math.max(0, Math.round(m.coverPosition))) : 50;
  const posts: PostsLayout = m?.postsLayout === 'list' ? 'list' : 'grid';
  return { layout, pos, posts };
}

type HeroMember = Pick<NetworkMember, 'fullName' | 'avatarUrl' | 'coverUrl' | 'profession' | 'organization' | 'country' | 'website'> & Partial<Pick<NetworkMember, 'badges' | 'founder' | 'id' | 'enabled' | 'followers' | 'following' | 'followed' | 'blocked' | 'suspended' | SocialProfileField>>;

const FALLBACK = 'radial-gradient(ellipse at 78% 18%, hsl(39 52% 54% / 0.42), transparent 58%), radial-gradient(ellipse at 10% 90%, hsl(189 74% 28% / 0.7), transparent 60%), linear-gradient(140deg, hsl(187 67% 10%), hsl(189 70% 22%))';

function coverStyle(url: string | null, pos: number): CSSProperties {
  return url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: `50% ${pos}%` } : { backgroundImage: FALLBACK };
}

interface Props {
  m: HeroMember;
  layout: ProfileLayout;
  coverPosition: number;
  actions?: ReactNode;
  stats?: ReactNode;
  coverTools?: ReactNode;
  avatarTools?: ReactNode;
  compact?: boolean;
}

function Meta({ m, dark }: { m: HeroMember; dark: boolean }) {
  const sub = [m.profession, m.organization].filter(Boolean).join(' · ');
  return (
    <>
      {m.badges && <div className="mt-2"><Badges m={m as NetworkMember} /></div>}
      {sub && <p className={`mt-1.5 text-[15px] ${dark ? 'text-ivory-100/90' : 'text-ink-700'}`} data-testid="text-profile-role">{sub}</p>}
      {(m.country || m.website) && (
        <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${dark ? 'text-ivory-200/85' : 'text-sand-400'}`}>
          {m.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.country}</span>}
          {m.website && <a href={m.website} target="_blank" rel="noopener noreferrer nofollow" className={`inline-flex items-center gap-1 hover:underline ${dark ? 'text-gold-400' : 'text-lagoon-600'}`} data-testid="link-profile-website"><ExternalLink className="h-3.5 w-3.5" />{m.website.replace(/^https?:\/\//, '')}</a>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {SOCIAL_PROFILES.map(({ field, name }) => {
          let href = '';
          try { href = normalizeSocialProfile(field, m[field] ?? ''); } catch { return null; }
          return href ? <a key={field} href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${dark ? 'border-ivory-100/30 text-ivory-100 hover:border-gold-400' : 'border-sand-300 text-lagoon-700 hover:border-lagoon-600'}`} data-testid={`link-profile-${field}`} aria-label={`${m.fullName} — ${name}`}>{name}<ExternalLink className="h-3 w-3" /></a> : null;
        })}
      </div>
    </>
  );
}

export default function ProfileHero({ m, layout, coverPosition, actions, stats, coverTools, avatarTools, compact }: Props) {
  const bg = coverStyle(m.coverUrl, coverPosition);
  const av = compact ? 76 : 104;

  if (layout === 'centered') {
    return (
      <section className="relative overflow-hidden sm:rounded-3xl" data-testid="profile-hero-centered">
        <div className="absolute inset-0 scale-105" style={bg} aria-hidden />
        <div className="absolute inset-0 bg-lagoon-900/35" aria-hidden />
        {coverTools && <div className="absolute right-3 top-3 z-10">{coverTools}</div>}
        <div className={`relative flex justify-center px-4 ${compact ? 'py-8' : 'py-14 sm:py-20'}`}>
          <div className="w-full max-w-md rounded-[28px] border border-ivory-50/40 bg-ivory-50/85 p-6 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto -mt-1 w-fit rounded-full bg-ivory-50 p-1 ring-2 ring-gold-500/60"><Avatar m={m} size={av} /></div>
            {avatarTools && <div className="mt-2 flex justify-center">{avatarTools}</div>}
            <h1 className="mt-3 font-display text-2xl text-ink-900 sm:text-3xl" data-testid="text-profile-name">{m.fullName}</h1>
            <div className="flex flex-col items-center"><Meta m={m} dark={false} /></div>
            {stats && <div className="mt-3 flex justify-center gap-5 text-sm text-ink-700">{stats}</div>}
            {actions && <div className="mt-4 flex flex-wrap justify-center gap-2">{actions}</div>}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'editorial') {
    return (
      <section className="relative overflow-hidden bg-ivory-50 sm:rounded-3xl sm:border sm:border-sand-200" data-testid="profile-hero-editorial">
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          <div className={`relative order-1 md:order-2 ${compact ? 'h-40 md:h-auto' : 'h-56 md:h-auto md:min-h-[380px]'}`} style={bg}>
            <div className="absolute inset-0 bg-gradient-to-t from-ivory-50 via-transparent to-transparent md:bg-gradient-to-r md:from-ivory-50 md:via-ivory-50/10" aria-hidden />
            {coverTools && <div className="absolute right-3 top-3 z-10">{coverTools}</div>}
          </div>
          <div className={`relative order-2 flex flex-col justify-end px-5 pb-6 md:order-1 md:px-8 ${compact ? 'pt-2 md:py-6' : 'pt-2 md:py-10'}`}>
            <p className="text-eyebrow text-gold-700">TOMI MEMBER</p>
            <div className="mt-3 flex items-end gap-3">
              <div className="rounded-2xl bg-ivory-50 p-1 shadow-md"><Avatar m={m} size={compact ? 60 : 76} /></div>
              {avatarTools}
            </div>
            <h1 className={`mt-4 font-display leading-[1.02] text-ink-900 ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`} data-testid="text-profile-name">{m.fullName}</h1>
            <div className="mt-1 h-px w-16 bg-gold-500" aria-hidden />
            <Meta m={m} dark={false} />
            {stats && <div className="mt-3 flex gap-5 text-sm text-ink-700">{stats}</div>}
            {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden sm:rounded-3xl ${compact ? 'min-h-[300px]' : 'min-h-[440px] sm:min-h-[480px]'} flex flex-col justify-end`} style={bg} data-testid="profile-hero-immersive">
      <div className="absolute inset-0 bg-gradient-to-t from-lagoon-900 via-lagoon-900/55 to-lagoon-900/0" aria-hidden />
      {coverTools && <div className="absolute right-3 top-3 z-10">{coverTools}</div>}
      <div className="relative px-5 pb-6 pt-24 sm:px-8 sm:pb-8">
        <div className="flex items-end gap-3">
          <div className="rounded-full bg-ivory-50/90 p-1 ring-2 ring-gold-500/70"><Avatar m={m} size={av} /></div>
          {avatarTools}
        </div>
        <h1 className={`mt-4 font-display text-ivory-50 drop-shadow ${compact ? 'text-3xl' : 'text-3xl sm:text-5xl'}`} data-testid="text-profile-name">{m.fullName}</h1>
        <Meta m={m} dark />
        {stats && <div className="mt-3 flex gap-5 text-sm text-ivory-200 [&_b]:text-ivory-50">{stats}</div>}
        {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export const onCoverBtn = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-ivory-50/40 bg-ivory-50/15 px-4 py-2 text-xs font-semibold text-ivory-50 backdrop-blur hover:bg-ivory-50/25 disabled:opacity-50';
