import classNames from 'classnames';
import { useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Material UI components
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useLingui } from '@lingui/react/macro';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import api from '../api/api';
import colors from '../colors.module.scss';
import css from './SignIn.module.scss';

const classes = classNames.bind(css);

/* Returns a component for signing in to the frontend */
const SignIn = () => {
  const { t } = useLingui();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mistake, setMistake] = useState(false);
  const history = useHistory();
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
            {t`Sign In`}
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
            label={t`Username`}
            autoComplete={t`Username`}
            value={name}
            error={mistake}
            onInput={(e) => setName(e.target.value)}
            className={classes(css.text)}
            slotProps={{
              htmlInput: {
                'data-testid': 'nameField',
              },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password"
            name="password"
            label={t`Password`}
            type="password"
            autoComplete="current-password"
            value={password}
            error={mistake}
            onInput={(e) => setPassword(e.target.value)}
            className={classes(css.text)}
            slotProps={{
              htmlInput: {
                'data-testid': 'passwordField',
              },
            }}
          />
          {mistake && (
            <Typography align="center" className={classes(css.error)}>
              {t`Wrong username or password`}
            </Typography>
          )}
          <Button
            onClick={login}
            fullWidth
            variant="contained"
            className={classes(css.submitButton, css.acceptButton)}
          >
            {t`Log in`}
          </Button>
          <Button
            onClick={() => history.push('/signin/reset-password')}
            fullWidth
            className={classes(css.secondaryButton)}
          >
            {t`Forgot password?`}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default SignIn;
