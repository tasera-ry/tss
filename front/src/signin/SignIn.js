import React, { useState } from 'react';

// Material UI components
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Call handling to backend
import axios from 'axios';

// Translations
import data from '../texts/texts.json';

/*
  Signin is the component for signing in to the frontend
*/
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const textStyle = {
  backgroundColor: '#fcfbf7',
  borderRadius: 4,
};

const SignIn = () => {
  const classes = useStyles();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mistake, setMistake] = useState(false);
  const history = useHistory();
  const { signin } = data;
  const fin = localStorage.getItem('language');
  const [cookies, setCookie] = useCookies(['username', 'role']); // eslint-disable-line
  const secure = window.location.protocol === 'https:';

  document.body.style = 'background: #eae7dc;';
  function RedirectToWeekview() {
    window.location.href = '/';
  }
  async function setInfo(user) {
    // eslint-disable-line
    setCookie('username', user.name, { sameSite: true, secure });
    setCookie('role', user.role, { sameSite: true, secure });
    // TODO: try to be SPA and remove this refresh
    RedirectToWeekview();
  }

  const HandleError = (error) => {
    setMistake(true);
    // message contains all errors, might be useful
    let message = ''; // eslint-disable-line
    if (error.response.status === 400) {
      for (let i = 0; i < error.response.data.errors.length; i += 1) {
        const { param } = error.response.data.errors[i];
        const { msg } = error.response.data.errors[i];
        message += `${param} ${msg}\n`;
      }
    }
    if (error.response.status === 401) {
      message = error.response.data; // eslint-disable-line
    }
  };

  const login = (e) => {
    e.preventDefault();

    axios
      .post('api/sign', {
        name,
        password,
        secure,
      })
      .then((resp) => {
        setInfo(resp.data);
      })
      .catch((error) => {
        HandleError(error);
      });
  };

  function backToPrev() {
    history.goBack();
  }

  function forgot() {
    const path = '/signin/reset-password';
    history.push(path);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {signin.SignIn[fin]}
        </Typography>

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={signin.Name[fin]}
            name="username"
            autoComplete={signin.Name[fin]}
            autoFocus
            value={name}
            error={mistake}
            onInput={(e) => setName(e.target.value)}
            style={textStyle}
            inputProps={{
              'data-testid': 'nameField',
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={signin.Password[fin]}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            error={mistake}
            onInput={(e) => setPassword(e.target.value)}
            style={textStyle}
            inputProps={{
              'data-testid': 'passwordField',
            }}
          />
          {mistake ? (
            <Typography align="center" style={{ color: '#c23a3a' }}>
              {signin.Helper[fin]}
            </Typography>
          ) : (
            ''
          )}
          <Button
            onClick={login}
            type="submit"
            fullWidth
            variant="contained"
            style={{ backgroundColor: '#5f77a1' }}
          >
            {signin.LogIn[fin]}
          </Button>
          &nbsp;
          <Button
            onClick={() => backToPrev()}
            fullWidth
            style={{ color: '#5f77a1' }}
          >
            {signin.Back[fin]}
          </Button>
          &nbsp;
          <Button
            onClick={() => forgot()}
            fullWidth
            style={{ color: '#5f77a1' }}
          >
            {signin.ForgotPassword[fin]}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default SignIn;
