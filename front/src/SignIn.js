import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Link} from 'react-router-dom';
import {callApi} from './utils/helper.js';

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
  
  const classes = useStyles();

  //function component hook as a quick and dirty? way to handle state
  //other end: value={name} onInput={e => setName(e.target.value)}
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const login = (e) => {
    e.preventDefault();
    console.log({name, password})
    //call backend login function
    const params = {name: name, password: password};
    callApi("POST","login",params)
      .then(res => {
        console.log(res)
        //TODO real login redirection
        window.location = "/";
      })
      .catch(err => console.log(err));

  }

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
            value={name}
            onInput={e => setName(e.target.value)}
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
            value={password}
            onInput={e => setPassword(e.target.value)}
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