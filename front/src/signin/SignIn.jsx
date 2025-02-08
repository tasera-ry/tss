import React, { useState } from 'react';
import classNames from 'classnames';

// Material UI components
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import colors from '../colors.module.scss';
import api from '../api/api';
import translations from '../texts/texts.json';
import css from './SignIn.module.scss';

const classes = classNames.bind(css);

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

  document.body.style = `background: ${colors.blackTint20};`;

  const setInfo = async (user) => {
    setCookie('username', user.name, { sameSite: true, secure });
    setCookie('role', user.role, { sameSite: true, secure });
    setCookie('id', user.id, { sameSite: true, secure });
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
  );
};

export default SignIn;
