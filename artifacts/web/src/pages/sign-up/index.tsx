import { SignUp } from '@clerk/react';
import { Helmet } from 'react-helmet-async';
import AuthShell, { GoogleNote } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignUpPage() {
  return (
    <AuthShell eyebrow="CREATE YOUR MEMBER SPACE" title="ONE WORLD. YOUR PLACE IN IT.">
      <Helmet><title>CREATE ACCOUNT — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex flex-col items-center gap-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/member`} appearance={{ options: { socialButtonsPlacement: 'top', socialButtonsVariant: 'blockButton' } }} />
      <GoogleNote /></div>
    </AuthShell>
  );
}
