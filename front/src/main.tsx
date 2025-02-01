import React from 'react';
import ReactDOM from 'react-dom';
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles'
import { App } from './App';
import { CookiesProvider } from 'react-cookie';

// TO DO: Move this to scss if possible.

const theme = createTheme({
  palette: {
    primary: {
      main: '#4D4D4D',
    },
  },
});

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById('root')
); 
