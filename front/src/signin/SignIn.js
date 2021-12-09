import React, { useState } from 'react';
import classNames from 'classnames';

// Material UI components
import {
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import colors from '../colors.module.scss';
import api from '../api/api';
import translations from '../texts/texts.json';
import css from './SignIn.module.scss';

const classes = classNames.bind(css);

/*
  TO DO: This same theme is used in ResetPassword.js
  -Find out if this theme can be applied to both without two separate declarations
  (without causing side-effects to other parts of the app)
*/
const theme = createMuiTheme({
  palette: {
    primary: {
      main: colors.grey,
    },
  },
});

/* Returns a component for signing in to the frontend */
const SignIn = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mistake, setMistake] = useState(false);
  const history = useHistory();
  const { signin } = translations;
  const lang = localStorage.getItem('language');
  const [cookies, setCookie] = useCookies(['username', 'role']); // eslint-disable-line
  const secure = window.location.protocol === 'https:';

  document.body.style = `background: ${colors.cream10};`;

  const setInfo = async (user) => {
    setCookie('username', user.name, { sameSite: true, secure });
    setCookie('role', user.role, { sameSite: true, secure });
    // TODO: try to be SPA and remove this refresh
    window.location.href = '/';
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const data = await api.signIn(name, password, secure);
      setInfo(data);
    } catch (err) {
      setMistake(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes(css.paper)}>
          <div className={classes(css.flexWrap)}>
            <ArrowBackIcon
              className={classes(css.arrowBackIcon)}
              onClick={() => history.push('/')}
            />
            <Typography component="h1" variant="h5">
              {signin.SignIn[lang]}
            </Typography>
          </div>
          <form noValidate className={classes(css.wideForm)}>
            <TextField
              autoFocus
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              name="username"
              label={signin.Name[lang]}
              autoComplete={signin.Name[lang]}
              value={name}
              error={mistake}
              onInput={(e) => setName(e.target.value)}
              className={classes(css.text)}
              inputProps={{
                'data-testid': 'nameField',
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              name="password"
              label={signin.Password[lang]}
              type="password"
              autoComplete="current-password"
              value={password}
              error={mistake}
              onInput={(e) => setPassword(e.target.value)}
              className={classes(css.text)}
              inputProps={{
                'data-testid': 'passwordField',
              }}
            />
            {mistake && (
            <Typography align="center" className={classes(css.error)}>
              {signin.Helper[lang]}
            </Typography>
            )}
            <Button
              onClick={login}
              fullWidth
              variant="contained"
              className={classes(css.submitButton, css.acceptButton)}
            >
              {signin.LogIn[lang]}
            </Button>
            <Button
              onClick={() => history.push('/signin/reset-password')}
              fullWidth
              className={classes(css.secondaryButton)}
            >
              {signin.ForgotPassword[lang]}
            </Button>
          </form>
        </div>
      </Container>
    </ThemeProvider>
  );
};

export default SignIn;
