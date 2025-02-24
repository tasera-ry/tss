import { QueryClient, QueryClientProvider } from "react-query";
import { LinguiProvider } from "../i18n";
import { HashRouter as Router } from 'react-router-dom';


const queryClient = new QueryClient()

export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LinguiProvider defaultLang="en">
        <Router>
          {children}
        </Router>
      </LinguiProvider>
    </QueryClientProvider>
  )
}
