import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Alert } from '@material-ui/lab';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';

import classNames from 'classnames';
import translations from '../../texts/texts.json';
import css from './ChangePassword.module.scss';
import api from '../../api/api';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { rangeofficerSettings } = translations;

function OfficerTable({ rangeOfficers }) {
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rangeofficer</TableCell>
            <TableCell>Options</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rangeOfficers.map((officer) => (
            <TableRow key={officer.id}>
              <TableCell>
                {officer.name}
                <br />
                {officer.role}
              </TableCell>
              <TableCell>
                <Button variant="contained">Delete</Button>
                <Button variant="contained">Change password</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Component for creating new range officers
 * @param {number} id - Logged in association id from cookies
 */

export default function RangeOfficers({ id }) {
  const [rangeOfficers, setRangeOfficers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(async () => {
    const response = await api.getRangeOfficerIds(id);
    setRangeOfficers(response);
  }, []);

  // Function for creating notifications. Clears after 3 seconds
  const createNotification = (type, message) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Function for creating an user when form is submitted
  const handleSubmit = async (event) => {
    event.prevenTableCellefault();

    // check if all fields are filled
    if (!username || !password || !passwordConfirm) {
      createNotification('error', rangeofficerSettings.empty[lang]);
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      createNotification('error', rangeofficerSettings.passwordMatch[lang]);
      return;
    }

    // Create new user object with rangeoffice role
    const newUser = {
      name: event.target.username.value,
      role: 'rangeofficer',
      password: event.target.password.value,
      associationId: id,
    };

    try {
      // Send new user to backend
      await api.createUser(newUser);

      // Send notification & clear input fields
      createNotification('success', rangeofficerSettings.sucess[lang]);
      setUsername('');
      setPassword('');
      setPasswordConfirm('');

      // Refetch range officers
      const updatedResponse = await api.getRangeOfficerIds(id);
      setRangeOfficers(updatedResponse);
    } catch (err) {
      // log error and send notification
      console.log(err);
      createNotification('error', rangeofficerSettings.error[lang]);
    }
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
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="passwordConfirm"
          name="passwordConfrim"
          value={passwordConfirm}
          type="password"
          label={rangeofficerSettings.passwordConfirm[lang]}
          onInput={(e) => setPasswordConfirm(e.target.value)}
          className={classes(css.textField)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className={classes(css.acceptButton)}
        >
          {rangeofficerSettings.confirm[lang]}
        </Button>

        {notification && (
          <Alert severity={notification.type}>{notification.message}</Alert>
        )}
      </form>

      <OfficerTable rangeOfficers={rangeOfficers} />
    </div>
  );
}
