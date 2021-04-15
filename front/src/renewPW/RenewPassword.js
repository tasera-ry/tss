import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

// Material UI components
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

// Call handling to backend
import axios from 'axios';

// Translations
import data from '../texts/texts.json';

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

const RenewPassword = (props) => {
  const classes = useStyles();
  const fin = localStorage.getItem('language');
  const { renewPW } = data;

  document.body.style = 'background: #eae7dc;';

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updated, setUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [tokenOK, setTokenOK] = useState(false);

  const history = useHistory();

  const { token } = props.match.params;
  const [tokenExpires, setTokenExpires] = useState('');

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await axios.get('api/reset', { params: { reset_token: token } });
        console.log(response.data.message);

        if (response.data.message === 'password reset link a-ok') {
          setUsername(response.data.username);
          setTokenExpires(response.data.token_expires);
          setIsLoading(false);
          setTokenOK(true);
          setError(false);
        }
      } catch (err) {
        console.log(err.response.data);
        setIsLoading(false);
        setError(true);
        setTokenOK(false);
      }
    }
    verifyToken();
  }, []);

  const redirectToReset = () => {
    const path = '/signin/reset-password';
    history.push(path);
  };

  const redirectToLogin = () => {
    const path = '/signin';
    setTimeout(() => history.push(path), 5000);
  };

  const renew = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    if (newPassword === confirmNewPassword && newPassword !== '') {
      try {
        const response = await axios.put('api/reset', {
          username, newPassword, reset_token: token, reset_token_expire: tokenExpires,
        });
        console.log(response.data);
        setUpdated(true);
        setTokenOK(false);
        redirectToLogin();
      } catch (err) {
        console.log(err.response.data);
        setIsWaiting(false);
      }
    } else {
      setMismatch(true);
      setIsWaiting(false);
      console.log('mismatch or invalid');
    }
  };

  const displayLoading = () => (
    <Typography component="h3" variant="h5" align="center">
      {renewPW.Loading[fin]}
    </Typography>
  );

  const displayError = () => (
    <Typography component="h3" variant="h5" align="center" style={{ color: '#c23a3a' }}>
      {renewPW.Error[fin]}
        &nbsp;
      <div>
        <Typography
          align="center"
          style={{ color: '#000000' }}
        >
          {renewPW.ErrorDesc[fin]}
        </Typography>
      </div>
        &nbsp;

      <Button
        onClick={redirectToReset}
        fullWidth
        variant="contained"
        style={{ backgroundColor: '#5f77a1' }}
      >
        {renewPW.ForgotPassword[fin]}
      </Button>
    </Typography>
  );

  const displayMismatch = () => (
    <div>
      <Typography
        align="center"
        style={{ color: '#c23a3a' }}
      >
        {renewPW.Mismatch[fin]}
      </Typography>
    </div>
  );

  const displayButton = () => (
    <Button
      onClick={renew}
      type="submit"
      fullWidth
      variant="contained"
      style={{ backgroundColor: '#5f77a1' }}
    >
      {renewPW.RenewBtn[fin]}
    </Button>
  );

  const displayTokenOK = () => (
    <Typography component="h3" variant="h5" align="center">
      {renewPW.RenewPassword[fin]}

      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="newPassword"
          label={renewPW.NewPassword[fin]}
          name="newPassword"
          autoComplete={renewPW.NewPassword[fin]}
          type="password"
          autoFocus
          value={newPassword}
          error={mismatch}
          onInput={(e) => setNewPassword(e.target.value)}
          style={textStyle}
          inputProps={{
            'data-testid': 'newPasswordField',
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="confirmNewPassword"
          label={renewPW.ConfirmNewPassword[fin]}
          name="confirmNewPassword"
          type="password"
          autoComplete={renewPW.ConfirmNewPassword[fin]}
          value={confirmNewPassword}
          error={mismatch}
          onInput={(e) => setConfirmNewPassword(e.target.value)}
          style={textStyle}
          inputProps={{
            'data-testid': 'confirmNewPasswordField',
          }}
        />

        {mismatch && (
          displayMismatch()
        )}

        {!isWaiting && (
          displayButton()
        )}

      </form>
    </Typography>
  );

  const displayUpdated = () => (
    <Typography component="h3" variant="h5" align="center" style={{ color: '#047a00' }}>
      {renewPW.Updated[fin]}
        &nbsp;
      <div>
        <Typography
          align="center"
          style={{ color: '#000000' }}
        >
          {renewPW.UpdatedDesc[fin]}
        </Typography>
      </div>
    </Typography>
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>

        {isLoading && (
          displayLoading()
        )}

        {error && !updated && (
          displayError()
        )}

        {tokenOK && !updated && (
          displayTokenOK()
        )}

        {updated && (
          displayUpdated()
        )}

      </div>
    </Container>
  );
};

export default RenewPassword;
