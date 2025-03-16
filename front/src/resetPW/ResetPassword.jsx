import classNames from 'classnames';
import { useState } from 'react';

import Container from '@mui/material/Container';
// Material UI components
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';

import colors from '../colors.module.scss';

import { useLingui } from '@lingui/react/macro';
import api from '../api/api';
import css from './ResetPassword.module.scss';
import ResetPasswordForm from './ResetPasswordForm';

const classes = classNames.bind(css);

const ResetPassword = () => {
  const { t } = useLingui();

  const [showForm, setShowForm] = useState(true);
  const [showNullError, setShowNullError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  document.body.style = `background: ${colors.blackTint10};`;

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
            {t`Password reset e-mail succesfully sent!`}
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default ResetPassword;
