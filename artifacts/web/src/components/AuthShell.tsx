import type { ReactNode } from 'react';
import logoSrc from '@/assets/media/home/tomi-peace-logo.webp';
import WavingFlag from '@/components/ecosystem/WavingFlag';

export default function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="eco-hero min-h-[100dvh]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-2">
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
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}

export function GoogleNote() {
  return (
    <p className="max-w-[25rem] rounded-2xl border border-gold-500/30 bg-lagoon-900/60 px-4 py-3 text-xs leading-relaxed text-ivory-200" data-testid="text-google-guidance">
      When a Continue with Google button is shown above, using it avoids the email-code login. Google, or a security check on a new device, may still ask you to confirm it is you.
    </p>
  );
}
