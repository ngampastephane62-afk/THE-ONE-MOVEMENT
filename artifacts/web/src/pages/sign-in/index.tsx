import { SignIn, useAuth } from '@clerk/react';
import { Redirect } from 'wouter';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Redirect to="/member" replace />;
  return (
    <AuthShell eyebrow="MEMBER SIGN IN" title="WELCOME BACK.">
      <Helmet><title>SIGN IN — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance />
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/member`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
