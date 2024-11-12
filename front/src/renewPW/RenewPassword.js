import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import colors from '../colors.module.scss';

// Material UI components
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import api from '../api/api';
import translations from '../texts/texts.json';
import css from './RenewPassword.module.scss';

const classes = classNames.bind(css);

const RenewPassword = (props) => {
  const lang = localStorage.getItem('language');
  const history = useHistory();
  const { renewPW } = translations;
  const { token } = props.match.params;

  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updated, setUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [tokenOK, setTokenOK] = useState(false);
  const [tokenExpires, setTokenExpires] = useState('');

  document.body.style = `background: ${colors.blackTint10};`;

  useEffect(() => {
    (async () => {
      try {
        const data = await api.resetPassword(token);

        if (data.message === 'password reset link a-ok') {
          setUsername(data.username);
          setTokenExpires(data.token_expires);
          setIsLoading(false);
          setTokenOK(true);
          setError(false);
        }
      } catch (err) {
        setIsLoading(false);
        setError(true);
        setTokenOK(false);
      }
    })();
  }, [token]);

  const renew = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    if (newPassword !== confirmNewPassword || newPassword === '') {
      setMismatch(true);
      setIsWaiting(false);
      return;
    }

    try {
      await api.renewPassword(username, newPassword, token, tokenExpires);
      setUpdated(true);
      setTokenOK(false);
      setTimeout(() => history.push('/signin'), 5000);
    } catch (err) {
      setIsWaiting(false);
    }
  };

  const displayLoading = () => (
    <Typography component="h3" variant="h5" align="center">
      {renewPW.Loading[lang]}
    </Typography>
  );

  const displayError = () => (
    <Typography
      component="h3"
      variant="h5"
      align="center"
      className={classes(css.error)}
    >
      {renewPW.Error[lang]}
      &nbsp;
      <Typography align="center" className={classes(css.description)}>
        {renewPW.ErrorDesc[lang]}
      </Typography>
      &nbsp;
      <Button
        onClick={() => history.push('/signin/reset-password')}
        fullWidth
        variant="contained"
        className={classes(css.acceptButton)}
      >
        {renewPW.ForgotPassword[lang]}
      </Button>
    </Typography>
  );

  const displayTokenOK = () => (
    <Typography component="h3" variant="h5" align="center">
      {renewPW.RenewPassword[lang]}

      <form className={classes(css.wideForm)}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="newPassword"
          label={renewPW.NewPassword[lang]}
          name="newPassword"
          autoComplete={renewPW.NewPassword[lang]}
          type="password"
          autoFocus
          value={newPassword}
          error={mismatch}
          onInput={(e) => setNewPassword(e.target.value)}
          className={classes(css.text)}
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
          label={renewPW.ConfirmNewPassword[lang]}
          name="confirmNewPassword"
          type="password"
          autoComplete={renewPW.ConfirmNewPassword[lang]}
          value={confirmNewPassword}
          error={mismatch}
          onInput={(e) => setConfirmNewPassword(e.target.value)}
          className={classes(css.text)}
          inputProps={{
            'data-testid': 'confirmNewPasswordField',
          }}
        />

        {mismatch && (
          <Typography align="center" className={classes(css.error)}>
            {renewPW.Mismatch[lang]}
          </Typography>
        )}

        {!isWaiting && (
          <Button
            onClick={renew}
            type="submit"
            fullWidth
            variant="contained"
            className={classes(css.submitButton, css.acceptButton)}
          >
            {renewPW.RenewBtn[lang]}
          </Button>
        )}
      </form>
    </Typography>
  );

  const displayUpdated = () => (
    <Typography
      component="h3"
      variant="h5"
      align="center"
      className={classes(css.success)}
    >
      {renewPW.Updated[lang]}
      &nbsp;
      <Typography align="center" className={classes(css.description)}>
        {renewPW.UpdatedDesc[lang]}
      </Typography>
    </Typography>
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes(css.paper)}>
        {isLoading && displayLoading()}

        {error && !updated && displayError()}

        {tokenOK && !updated && displayTokenOK()}

        {updated && displayUpdated()}
      </div>
    </Container>
  );
};

export default RenewPassword;
