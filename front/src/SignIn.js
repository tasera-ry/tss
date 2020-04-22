import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Link, useHistory} from 'react-router-dom';
import App from './App';
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

const SignIn = () => {
  
  const classes = useStyles();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState('');
  const [mistake, setMistake] = useState(false);
  const history = useHistory();
  
  const login = (e) => {
    e.preventDefault();
    console.log({name, password})

    let response = axios.post('api/sign', {
      name: name,
      password: password
    }).then(response => {
      RedirectToWeekview(response.data)
    }).catch(error => {
      HandleError(error)
    })
    
  }

  function RedirectToWeekview(data){
    localStorage.setItem("taseraUserName", name);
    localStorage.setItem("token", data);
    history.push('/');
  }

  const HandleError = error => {
    setMistake(true);
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
            error={mistake}
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
            error={mistake}
            helperText={mistake ? 'Väärä käyttäjänimi tai salasana' : ''}
            onInput={e => setPassword(e.target.value)}
          />

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
  )
}

export default SignIn
