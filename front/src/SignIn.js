import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import {Link, useHistory} from 'react-router-dom';
import Weekview from './Weekview';
import axios from 'axios'

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
  const [user, setUser] = useState('');
  const [mokat, setMokat] = useState('');
  const history = useHistory();
  let myStorage = window.localStorage;
  
  const login = (e) => {
    e.preventDefault();
    //console.log({name, password})

    let response = axios.post('api/sign', {
      name: name,
      password: password
    }).then(response => {
      HandleResponse(response)
      RedirectToWeekview()
    }).catch(error => {
      HandleError(error)
    })
    
  }

  const HandleResponse = response => {
    setUser(response.data)
    myStorage.setItem('token', response.data)
  }

  const RedirectToWeekview = () => {
    history.push('/')
  }

  const HandleError = error => {
    setMokat(true);

    //message contains all errors, might be useful
    let message = ''
    if(error.response.status===400) {
      for(let i=0; i<error.response.data.errors.length; i++) {
        let param = error.response.data.errors[i].param;
        let msg = error.response.data.errors[i].msg;
        message+=(`${param} ${msg}\n`);
      }
    }
    if(error.response.status===401) {
      message = error.response.data
    }
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

          {(mokat) ?
           <p style={{fontSize: 20, color: "red", textAlign: "center"}}>
             Käyttäjänimi tai salasana väärin
           </p> :
           <p></p>}

          <Link>
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

          <Link>
            <Button
              onClick={() => history.goBack()}
              type="submit"
              fullWidth
              color="primary"
              className={classes.submit}
            >
              Takaisin
            </Button>
          </Link>

        </form>
      </div>
    </Container>
  );
}
