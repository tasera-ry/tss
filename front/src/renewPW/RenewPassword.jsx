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
import css from './RenewPassword.module.scss';
import { t } from '@lingui/core/macro';

const classes = classNames.bind(css);

const RenewPassword = (props) => {
  const history = useHistory();
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
      {t`Loading user data...`}
    </Typography>
  );

  const displayError = () => (
    <Typography
      component="h3"
      variant="h5"
      align="center"
      className={classes(css.error)}
    >
      {t`Error verifying token!`}
      &nbsp;
      <Typography align="center" className={classes(css.description)}>
        {t`The link is incorrect or it has expired. Please send a new reset link!`}
      </Typography>
      &nbsp;
      <Button
        onClick={() => history.push('/signin/reset-password')}
        fullWidth
        variant="contained"
        className={classes(css.acceptButton)}
      >
        {t`Forgot password?`}
      </Button>
    </Typography>
  );

  const displayTokenOK = () => (
    <Typography component="h3" variant="h5" align="center">
      {t`Input new password`}

      <form className={classes(css.wideForm)}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="newPassword"
          label={t`New password`}
          name="newPassword"
          autoComplete={t`New password`}
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
          label={t`Confirm new password`}
          name="confirmNewPassword"
          type="password"
          autoComplete={t`Confirm new password`}
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
            {t`Passwords don't match!`}
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
            {t`Submit`}
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
      {t`Password updated succesfully!`}
      &nbsp;
      <Typography align="center" className={classes(css.description)}>
        {t`You will be redirected to the login page automatically in 5 seconds.`}
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
