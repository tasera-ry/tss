import React, { useState } from 'react';
import classNames from 'classnames';

// Material UI components
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import colors from '../colors.module.scss';

import ResetPasswordForm from './ResetPasswordForm';
import api from '../api/api';
import translations from '../texts/texts.json';
import css from './ResetPassword.module.scss';

const classes = classNames.bind(css);

const ResetPassword = () => {
  const lang = localStorage.getItem('language');
  const { resetPW } = translations;

  const [showForm, setShowForm] = useState(true);
  const [showNullError, setShowNullError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  document.body.style = `background: ${colors.cream10};`;

  const reset = async (email) => {
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

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes(css.paper)}>
        {showForm && (
          <ResetPasswordForm
            showNullError={showNullError}
            showError={showError}
            isWaiting={isWaiting}
            onSubmit={reset}
          />
        )}

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
