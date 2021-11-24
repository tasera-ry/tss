import React, { useState } from 'react';
import classNames from 'classnames';

// Material UI components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import translations from '../texts/texts.json';
import css from './ResetPassword.module.scss';

const classes = classNames.bind(css);

export const ResetPasswordForm = ({
  showNullError,
  showError,
  isWaiting,
  onSubmit,
}) => {
  const lang = localStorage.getItem('language');
  const { resetPW } = translations;

  const [email, setEmail] = useState('');

  return (
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
            onClick={(e) => {
              e.preventDefault();
              onSubmit(email);
            }}
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
};
