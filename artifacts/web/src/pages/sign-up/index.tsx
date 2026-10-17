import { SignUp, useAuth } from '@clerk/react';
import { Redirect, useSearch } from 'wouter';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';
import { useEffect } from 'react';
import { storePendingSector } from '@/lib/network-invitations';
import { getDesignerApplicationPath } from '@/lib/fashion-participation';

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const packageSlug = new URLSearchParams(useSearch()).get('fashionPackage');
  const applicationPath = getDesignerApplicationPath(packageSlug);
  const destination = applicationPath ?? '/member';
  const packageQuery = applicationPath ? `?fashionPackage=${encodeURIComponent(packageSlug!)}` : '';
  useEffect(() => {
    const sector = new URLSearchParams(window.location.search).get('sector');
    if (sector) storePendingSector(sector);
  }, []);
  if (isLoaded && isSignedIn) return <Redirect to={destination} replace />;
  return (
    <AuthShell variant="signup" eyebrow="JOIN TOMI, FREE" title="One world. Your page in it.">
      <Helmet><title>CREATE ACCOUNT — THE ONE MOVEMENT INTERNATIONAL</title></Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance signingUp />
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in${packageQuery}`} forceRedirectUrl={`${basePath}${destination}`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
