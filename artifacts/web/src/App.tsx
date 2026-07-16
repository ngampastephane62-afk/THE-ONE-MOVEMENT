import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Layout from '@/components/Layout';
import Home from '@/pages/home';
import OurVision from '@/pages/our-vision';
import Ecosystem from '@/pages/ecosystem';
import Community from '@/pages/community';
import Programs from '@/pages/programs';
import Opportunities from '@/pages/opportunities';
import Impact from '@/pages/impact';
import Media from '@/pages/media';
import Partners from '@/pages/partners';
import JoinTheMovement from '@/pages/join';
import SignIn from '@/pages/sign-in';
import PrivacyPolicy from '@/pages/privacy-policy';
import Terms from '@/pages/terms';
import DesignSystem from '@/pages/design-system';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/our-vision" component={OurVision} />
      <Route path="/ecosystem" component={Ecosystem} />
      <Route path="/community" component={Community} />
      <Route path="/programs" component={Programs} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/impact" component={Impact} />
      <Route path="/media" component={Media} />
      <Route path="/partners" component={Partners} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
