import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { basePath, stripBase, clerkAppearance, clerkLocalization } from '@/lib/clerk';
import Layout from '@/components/Layout';
import Home from '@/pages/home';
import OurVision from '@/pages/our-vision';
import Ecosystem from '@/pages/ecosystem';
import Community from '@/pages/community';
import NetworkProfile from '@/pages/community/NetworkProfile';
import Invitation from '@/pages/community/Invitation';
import Programs from '@/pages/programs';
import ProgramDetail from '@/pages/programs/detail';
import Opportunities from '@/pages/opportunities';
import Impact from '@/pages/impact';
import Media from '@/pages/media';
import News from '@/pages/news';
import NewsDetail from '@/pages/news/detail';
import Partners from '@/pages/partners';
import PartnerDetail from '@/pages/partners/detail';
import JoinTheMovement from '@/pages/join';
import SignIn from '@/pages/sign-in';
import SignUp from '@/pages/sign-up';
import Member from '@/pages/member';
import Donate from '@/pages/donate';
import PrivacyPolicy from '@/pages/privacy-policy';
import Terms from '@/pages/terms';
import DesignSystem from '@/pages/design-system';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/member" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}
const PUBLIC_ORIGIN = 'https://digital-asset-vault-ngampastephane6.replit.app';

function SiteMetadata() {
  const [location] = useLocation();
  const pathname = location.split(/[?#]/, 1)[0] || '/';
  const pageUrl = new URL(pathname, PUBLIC_ORIGIN).toString();
  const socialImageUrl = new URL('/og-image.svg', PUBLIC_ORIGIN).toString();

  return (
    <Helmet>
      <link rel="canonical" href={pageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={socialImageUrl} />
      <meta name="twitter:image" content={socialImageUrl} />
    </Helmet>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/our-vision" component={OurVision} />
      <Route path="/ecosystem" component={Ecosystem} />
      <Route path="/community" component={Community} />
      <Route path="/community/members/:id" component={NetworkProfile} />
      <Route path="/invite/:code" component={Invitation} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/:slug" component={ProgramDetail} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/impact" component={Impact} />
      <Route path="/media" component={Media} />
      <Route path="/news" component={News} />
      <Route path="/news/:slug" component={NewsDetail} />
      <Route path="/partners" component={Partners} />
      <Route path="/partners/:slug" component={PartnerDetail} />
      <Route path="/join" component={JoinTheMovement} />
      <Route path="/sign-in/*?" component={SignIn} />
      <Route path="/sign-up/*?" component={SignUp} />
      <Route path="/member/*?" component={Member} />
      <Route path="/user-portal"><Redirect to="/member" replace /></Route>
      <Route path="/donate" component={Donate} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/design-system" component={DesignSystem} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Shell() {
  const [location] = useLocation();
  if (location === '/member' || location.startsWith('/member/')) return <Router />;
  return (
    <Layout>
      <Router />
    </Layout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={`${basePath}/member`}
      signUpFallbackRedirectUrl={`${basePath}/member`}
      signInForceRedirectUrl={`${basePath}/member`}
      signUpForceRedirectUrl={`${basePath}/member`}
      afterSignOutUrl={basePath || '/'}
      localization={clerkLocalization}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Shell />
          <SiteMetadata />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </HelmetProvider>
  );
}

export default App;
