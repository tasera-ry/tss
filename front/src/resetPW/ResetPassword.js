import React, { useState } from 'react';

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

const ResetPassword = () => {
  const classes = useStyles();
  const fin = localStorage.getItem('language');
  const { resetPW } = data;

  const [showForm, setShowForm] = useState(true);
  const [email, setEmail] = useState('');
  const [showNullError, setShowNullError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  document.body.style = 'background: #eae7dc;';

  const reset = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    
    if (email === '') {
      setShowNullError(true);
      setShowError(false);
      setIsWaiting(false);
    } else {
      try {
        const response = await axios.post('api/reset', { email });
        if (response.data === 'recovery email sent') {
          setEmailSent(true);
          setShowForm(false);
          setShowNullError(false);
          setShowError(false);
        }
      } catch (error) {
        if (error.response.data === 'email not in db') {
          setShowError(true);
          setShowNullError(false);
          setEmailSent(false);
          setIsWaiting(false);
        }
      }
    }
  };

  const displayNullError = () => (
    <div>
      <Typography
        align="center"
        style={{ color: '#c23a3a' }}
      >
        {resetPW.NullErr[fin]}
      </Typography>
    </div>
  );

  const displayError = () => (
    <div>
      <Typography
        align="center"
        style={{ color: '#c23a3a' }}
      >
        {resetPW.InvErr[fin]}
      </Typography>
    </div>
  );

  const displayButton = () => (
    <Button
      onClick={reset}
      type="submit"
      fullWidth
      variant="contained"
      style={{ backgroundColor: '#5f77a1' }}
    >
      {resetPW.ResetBtn[fin]}
    </Button>
  );

  const displayForm = () => (
    <Typography component="h3" variant="h5" align="center">
      {resetPW.ResetPassword[fin]}

      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label={resetPW.eMail[fin]}
          name="email"
          autoComplete={resetPW.eMail[fin]}
          autoFocus
          value={email}
          error={showNullError || showError}
          onInput={(e) => setEmail(e.target.value)}
          style={textStyle}
          inputProps={{
            'data-testid': 'emailField',
          }}
        />

        {showNullError && (
          displayNullError()
        )}

        {showError && (
          displayError()
        )}

        {!isWaiting && (
          displayButton()
        )}
      </form>
    </Typography>
  );

  const displayEmailSent = () => (
    <div>
      <Typography
        component="h3"
        variant="h5"
        align="center"
        style={{ color: '#047a00' }}
      >
        {resetPW.Sent[fin]}
      </Typography>
    </div>
  );

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>

        {showForm && (
          displayForm()
        )}

        {emailSent && (
          displayEmailSent()
        )}

      </div>
    </Container>
  );
};

export default ResetPassword;
