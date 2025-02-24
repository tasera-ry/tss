import ReactDOM from 'react-dom';
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { App } from './App';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from 'react-query';
import moment from 'moment';
import { LinguiProvider } from './i18n';

moment.locale('fi', {
  week: {
      dow: 6
  }
});

// TO DO: Move this to scss if possible.

const theme = createTheme({
  palette: {
    primary: {
      main: '#4D4D4D',
    },
  },
});

const queryClient = new QueryClient()

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <LinguiProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CookiesProvider>
            <App />
          </CookiesProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </LinguiProvider>
  </StyledEngineProvider>,
  document.getElementById('root')
); 
