import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter as Router } from 'react-router-dom';
import { LinguiProvider } from '../i18n';

const queryClient = new QueryClient();

export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <LinguiProvider defaultLang="en">
          <Router>{children}</Router>
        </LinguiProvider>
      </QueryClientProvider>
    </CookiesProvider>
  );
}
