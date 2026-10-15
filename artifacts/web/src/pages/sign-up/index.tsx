import { SignUp, useAuth } from '@clerk/react';
import { Redirect } from 'wouter';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Redirect to="/member" replace />;
  return (
    <AuthShell variant="signup" eyebrow="JOIN TOMI, FREE" title="One world. Your page in it.">
      <Helmet><title>CREATE ACCOUNT — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance signingUp />
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/member`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
