import classNames from 'classnames';
import { useState } from 'react';

// Material UI components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useLingui } from '@lingui/react/macro';
import { useHistory } from 'react-router-dom';
import css from './ResetPassword.module.scss';

const classes = classNames.bind(css);

const ResetPasswordForm = ({
  showNullError,
  showError,
  isWaiting,
  onSubmit,
}) => {
  const { t } = useLingui();
  const history = useHistory();

  const [email, setEmail] = useState('');

  return (
    <>
      <Typography component="h1" variant="h5" align="center">
        {t`Input your e-mail address in order to reset your password`}
      </Typography>
      <form noValidate className={classes(css.wideForm)}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label={t`E-mail`}
          name="email"
          autoComplete={t`E-mail`}
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
            {t`E-mail address is required!`}
          </Typography>
        )}

        {showError && (
          <Typography align="center" className={classes(css.error)}>
            {t`Invalid e-mail address!`}
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
            {t`Reset`}
          </Button>
        )}
      </form>
      <Button
        onClick={() => history.push('/signin')}
        fullWidth
        className={classes(css.secondaryButton)}
      >
        {t`Go back`}
      </Button>
    </>
  );
};

export default ResetPasswordForm;
