import { SignIn } from '@clerk/react';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignInPage() {
  return (
    <AuthShell eyebrow="MEMBER SIGN IN" title="WELCOME BACK.">
      <Helmet><title>SIGN IN — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance />
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/member`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
