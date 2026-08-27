import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import Home from '@/pages/home';
import OurVision from '@/pages/our-vision';
import Ecosystem from '@/pages/ecosystem';
import Community from '@/pages/community';
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
import PrivacyPolicy from '@/pages/privacy-policy';
import Terms from '@/pages/terms';
import DesignSystem from '@/pages/design-system';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
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
      <Route path="/" component={Home} />
      <Route path="/our-vision" component={OurVision} />
      <Route path="/ecosystem" component={Ecosystem} />
      <Route path="/community" component={Community} />
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
      <Route path="/sign-in" component={SignIn} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/design-system" component={DesignSystem} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Layout>
              <Router />
            </Layout>
            <SiteMetadata />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
