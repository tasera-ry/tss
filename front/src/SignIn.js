import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Link, useHistory} from 'react-router-dom';
import Nav from './Nav';
import axios from 'axios'
import * as data from './texts/texts.json'

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
  const {signin} = data;
  const fin = localStorage.getItem("language");
  
  const login = (e) => {
    e.preventDefault();

    let response = axios.post('api/sign', {
      name: name,
      password: password
    }).then(response => {
      setInfo(response.data);
    }).catch(error => {
      HandleError(error)
    })
  }

  function RedirectToWeekview(){
    window.location.href="/"
  }

  async function setInfo(data) {
    localStorage.setItem("taseraUserName", name);
    localStorage.setItem("token", data);
    
    const config = {
      headers: { Authorization: `Bearer ${data}` }
    };
    
    let query = "/api/user?name=" + name;
    let response = await axios.get(query, config);
    let role = await response.data[0].role;
    localStorage.setItem("role", role);

    RedirectToWeekview()
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
      {signin.SignIn[fin]}
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={signin.Name[fin]}
            name="username"
            autoComplete={signin.Name[fin]}
            autoFocus
            value={name}
            error={mistake}
            onInput={e => setName(e.target.value)}
            style={{color:'#5f77a1'}}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={signin.Password[fin]}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            error={mistake}
            helperText={mistake ? signin.Helper[fin] : ''}
            onInput={e => setPassword(e.target.value)}
          />

            <Button
              onClick={login}
              type="submit"
              fullWidth
              variant="contained"
              style={{backgroundColor:'#5f77a1'}}>
              {signin.LogIn[fin]}
            </Button>

          &nbsp;
          
            <Button
              onClick={() => history.goBack()}
              type="submit"
              fullWidth
              style={{color:'#5f77a1'}}>
              {signin.Back[fin]}
            </Button>

        </form>
      </div>
    </Container>
  )
}

export default SignIn
