import React, { useState } from 'react';
import classNames from 'classnames';
import api from '../../api/api';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import translations from '../../texts/texts.json';
import css from './ChangePassword.module.scss';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { rangeofficerSettings } = translations;

export default function RangeOfficers() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('added rangeofficer', username, password);

    // TODO: add api call where range officer user is created
    // add the range officer to the association table
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        {rangeofficerSettings.title[lang]}
      </Typography>

      <form
        className={rangeofficerSettings.title[lang]}
        noValidate
        onSubmit={handleSubmit}
      >
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          name="username"
          value={username}
          type="text"
          label={rangeofficerSettings.username[lang]}
          onInput={(e) => setUsername(e.target.value)}
          className={classes(css.textField)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="password"
          name="password"
          value={password}
          type="password"
          label={rangeofficerSettings.password[lang]}
          onInput={(e) => setPassword(e.target.value)}
          className={classes(css.textField)}
        />
        <Button type="submit" fullWidth variant="contained">
          {rangeofficerSettings.confirm[lang]}
        </Button>
      </form>
    </div>
  );
}
