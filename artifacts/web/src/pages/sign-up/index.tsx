import { SignUp } from '@clerk/react';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignUpPage() {
  return (
    <AuthShell variant="signup" eyebrow="JOIN TOMI, FREE" title="One world. Your page in it.">
      <Helmet><title>CREATE ACCOUNT — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance signingUp />
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/member`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
