import { SignIn } from '@clerk/react';
import { Helmet } from 'react-helmet-async';
import AuthShell from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';

export default function SignInPage() {
  return (
    <AuthShell eyebrow="MEMBER SIGN IN" title="WELCOME BACK.">
      <Helmet><title>SIGN IN — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/member`} />
    </AuthShell>
  );
}
