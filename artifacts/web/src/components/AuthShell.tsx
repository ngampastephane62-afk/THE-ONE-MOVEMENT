import type { ReactNode } from 'react';
import { Link } from 'wouter';
import logoSrc from '@/assets/media/home/tomi-peace-logo.webp';
import WavingFlag from '@/components/ecosystem/WavingFlag';

export default function AuthShell({ eyebrow, title, children, variant }: { eyebrow: string; title: string; children: ReactNode; variant?: 'signup' }) {
  if (variant === 'signup') return <SignUpShell eyebrow={eyebrow} title={title}>{children}</SignUpShell>;
  return (
    <div className="eco-hero min-h-[100dvh]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-8 sm:px-6 sm:py-14 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="flex items-center gap-4">
            <img src={logoSrc} alt="" className="h-14 w-14 rounded-full object-cover eco-breathe" />
            <WavingFlag className="w-28" />
          </div>
          <p className="mt-8 text-eyebrow text-gold-400">{eyebrow}</p>
          <h1 className="mt-3 text-display-lg text-ivory-100">{title}</h1>
          <p className="mt-5 max-w-md text-ivory-200 leading-relaxed">Your private space across seventeen sectors: tailored programmes, official knowledge, saved bookmarks and an optional public profile. Sign in with a verified account. After sign-in you land straight in the feed; your profile can be completed whenever you like. No paid tiers.</p>
          <p className="mt-6 text-sm text-gold-400/80">WE ARE ONE · <span lang="ar">نحن واحد</span></p>
        </div>
        <div className="flex min-w-0 justify-center">{children}</div>
      </div>
    </div>
  );
}

export function EmailGuidance({ signingUp = false }: { signingUp?: boolean }) {
  return (
    <div className="w-full rounded-2xl border border-gold-500/30 bg-lagoon-900/60 px-4 py-3 text-sm leading-relaxed text-ivory-200" data-testid="text-email-guidance">
      <p className="font-semibold text-ivory-50">Use your own email address.</p>
      <p className="mt-1 text-xs">iCloud, Outlook, Yahoo, Gmail or your work email — no Google account required.</p>
      {signingUp ? (
        <p className="mt-2 text-xs">Create your free account below, then verify your email using the message sent to your inbox. Google is optional.</p>
      ) : (
        <p className="mt-2 text-xs">Use the email you registered with. First visit?{' '}
          <Link href="/sign-up" className="font-semibold text-gold-400 underline underline-offset-2" data-testid="link-email-create-account">Create a free account</Link> before signing in.
        </p>
      )}
    </div>
  );
}

const PERKS = [
  ['A personal page', 'Your cover, your layout, your story. Not a settings form.'],
  ['Seventeen sectors', 'Creative work, business and institutions in one network.'],
  ['Follow, post, message', 'Build real connections with verified members.'],
] as const;

function SignUpShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="eco-hero min-h-[100dvh]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 py-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="TOMI" className="h-11 w-11 rounded-full object-cover eco-breathe lg:h-14 lg:w-14" />
            <WavingFlag className="w-20 lg:w-28" />
          </div>
          <p className="mt-6 text-eyebrow text-gold-400 lg:mt-8">{eyebrow}</p>
          <h1 className="mt-2 text-3xl leading-tight text-ivory-100 font-display lg:mt-3 lg:text-display-lg">{title}</h1>
          <p className="mt-3 inline-flex items-center rounded-full border border-gold-500/50 bg-gold-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-400" data-testid="text-free-membership">Membership is free. No paid tiers, no card.</p>
          <ul className="mt-5 hidden gap-3 sm:grid">
            {PERKS.map(([t, b]) => (
              <li key={t} className="flex gap-3 border-l border-gold-500/40 pl-3">
                <span><span className="block text-sm font-semibold text-ivory-100">{t}</span><span className="block text-sm text-ivory-200/85">{b}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ivory-200/85 sm:hidden">A personal page, seventeen sectors and verified members, all free.</p>
          <p className="mt-4 text-xs text-ivory-200/70">After verification you land straight in the feed. Your profile is optional and can be completed whenever you like.</p>
        </div>
        <div className="flex min-w-0 justify-center">{children}</div>
      </div>
    </div>
  );
}
