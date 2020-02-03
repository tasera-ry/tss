import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Link} from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1)
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  
  //call backend login function
  const login = async () => {
    
    //TODO clear version for this
    //TODO name and pass from fields
    
    const response = await fetch('/api/login', {
      method: 'POST',
      body: new URLSearchParams({
        'name': 'test',
        'password': 'test'
      })
    });
    const body = await response.json();
    
    console.log(response);
    if (response.status !== 200) {
      throw Error(body.message) 
    }
    console.log(body);
    return body;
  };
  
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Kirjaudu sisään
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Sähköpostiosoite"
            name="email"
            autoComplete="sähköposti"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Salasana"
            type="password"
            id="password"
            autoComplete="current-password"
          />

        <Link style={{textDecoration: 'none'}} to='/'>
          <Button
            onClick={login}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Kirjaudu
          </Button>
        </Link>

          <Link to='/'>
          <Button
            type="submit"
            fullWidth
            color="primary"
            className={classes.submit}
            >
            Peruuta
            </Button>
        </Link>


        </form>
      </div>
    </Container>
  );
}