import React, { useState } from 'react';
import classNames from 'classnames';
import colors from '../colors.module.scss';

// Material UI components
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import api from '../api/api';
import translations from '../texts/texts.json';
import css from './ResetPassword.module.scss';

const classes = classNames.bind(css);

const ResetPassword = () => {
  const lang = localStorage.getItem('language');
  const { resetPW } = translations;

  const [showForm, setShowForm] = useState(true);
  const [email, setEmail] = useState('');
  const [showNullError, setShowNullError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  document.body.style = `background: ${colors.cream10};`;

  const reset = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    if (email === '') {
      setShowNullError(true);
      setShowError(false);
      setIsWaiting(false);
      return;
    }
    try {
      await api.sendResetPasswordToken(email);
      setEmailSent(true);
      setShowForm(false);
      setShowNullError(false);
      setShowError(false);
    } catch (error) {
      setShowError(true);
      setShowNullError(false);
      setEmailSent(false);
      setIsWaiting(false);
    }
  };

  const displayForm = () => (
    <Typography component="h3" variant="h5" align="center">
      {resetPW.ResetPassword[lang]}

      <form noValidate className={classes(css.wideForm)}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label={resetPW.eMail[lang]}
          name="email"
          autoComplete={resetPW.eMail[lang]}
          autoFocus
          value={email}
          error={showNullError || showError}
          onInput={(e) => setEmail(e.target.value)}
          className={classes(css.text)}
          inputProps={{
            'data-testid': 'emailField',
          }}
        />

        {showNullError && (
          <Typography align="center" className={classes(css.error)}>
            {resetPW.NullErr[lang]}
          </Typography>
        )}

        {showError && (
          <Typography align="center" className={classes(css.error)}>
            {resetPW.InvErr[lang]}
          </Typography>
        )}

        {!isWaiting && (
          <Button
            onClick={reset}
            type="submit"
            fullWidth
            variant="contained"
            className={classes(css.submitButton, css.acceptButton)}
          >
            {resetPW.ResetBtn[lang]}
          </Button>
        )}
      </form>
    </Typography>
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes(css.paper)}>
        {showForm && displayForm()}

        {emailSent && (
          <Typography
            component="h3"
            variant="h5"
            align="center"
            className={classes(css.success)}
          >
            {resetPW.Sent[lang]}
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default ResetPassword;
