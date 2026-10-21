import { SignIn, useAuth } from '@clerk/react';
import { Redirect, useSearch } from 'wouter';
import { Helmet } from 'react-helmet-async';
import AuthShell, { EmailGuidance } from '@/components/AuthShell';
import { basePath } from '@/lib/clerk';
import { getDesignerApplicationPath } from '@/lib/fashion-participation';
import { gratitudeIntent, gratitudeMemberPath } from '@/lib/gratitude-intent';

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const search = useSearch();
  const packageSlug = new URLSearchParams(search).get('fashionPackage');
  const intent = gratitudeIntent(search, 'gratitudeIntent');
  const applicationPath = getDesignerApplicationPath(packageSlug);
  const destination = applicationPath ?? (intent ? gratitudeMemberPath(intent) : '/member');
  const packageQuery = applicationPath ? `?fashionPackage=${encodeURIComponent(packageSlug!)}` : '';
  if (isLoaded && isSignedIn) return <Redirect to={destination} replace />;
  return (
    <AuthShell eyebrow="MEMBER SIGN IN" title="WELCOME BACK.">
      <Helmet>
        <title>SIGN IN — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="description" content="Sign in to your TOMI member space to manage your profile, saved programmes and network participation." />
        <meta property="og:title" content="Sign in — The One Movement International" />
        <meta property="og:description" content="Return to your member profile and ecosystem workspace." />
      </Helmet>
      <div className="flex w-full min-w-0 max-w-[440px] flex-col items-center gap-4">
        <EmailGuidance />
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up${packageQuery}`} forceRedirectUrl={`${basePath}${destination}`} appearance={{ options: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' } }} />
      </div>
    </AuthShell>
  );
}
