import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Alert } from '@mui/lab';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

import classNames from 'classnames';
import translations from '../../texts/texts.json';
import css from './ChangePassword.module.scss';
import api from '../../api/api';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { rangeofficerSettings } = translations;

/**
 * Component for displaying range officers in a table
 * @param {array} rangeOfficers - Array of range officers
 * @param {function} handleDelete - Function for deleting a range officer
 */
function OfficerTable({ rangeOfficers, handleDelete }) {
  const [open, setOpen] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState(null);

  // Function for opening dialog window and setting selected officer to delete
  const handleDeleteClick = (officer) => {
    setOfficerToDelete(officer);
    setOpen(true);
  };

  // Sort range officers by name
  const sortedOfficers = rangeOfficers.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div>
      {/* Table for displaying range officers */}
      <Table data-testid="officer-table">
        <TableHead>
          <TableRow>
            <TableCell>{rangeofficerSettings.officersRow[lang]}</TableCell>
            <TableCell>{rangeofficerSettings.actionsRow[lang]}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOfficers.map((officer) => (
            <TableRow key={officer.id}>
              <TableCell>
                {officer.name}
                <br />
                {officer.role}
              </TableCell>
              <TableCell>
                <Button
                  className={classes(css.removeButton)}
                  onClick={() => handleDeleteClick(officer)}
                >
                  {rangeofficerSettings.delete[lang]}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog for confirming officer deletion */}
      {officerToDelete ? (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {rangeofficerSettings.deleteTitle[lang]} {officerToDelete.name}?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              {rangeofficerSettings.cancel[lang]}
            </Button>
            <Button
              onClick={() => {
                handleDelete(officerToDelete.id);
                setOpen(false);
              }}
              className={classes(css.removeButton)}
            >
              {rangeofficerSettings.delete[lang]}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
}

/**
 * Component for creating new range officers
 * @param {number} id - Logged in association id from cookies
 */

export default function OfficerForm({ id }) {
  const [rangeOfficers, setRangeOfficers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getRangeOfficers(id);
        setRangeOfficers(response);
      } catch (error) {
        console.error('Error fetching range officers:', error);
      }
    };

    fetchData();
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
    event.preventDefault();

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
      name: username,
      role: 'rangeofficer',
      password: password,
      associationId: id,
    };

    try {
      // Send new user to backend
      await api.createUser(newUser);

      // Send notification & clear input fields
      createNotification('success', rangeofficerSettings.success[lang]);
      setUsername('');
      setPassword('');
      setPasswordConfirm('');

      // Refetch range officers
      const updatedResponse = await api.getRangeOfficers(id);
      setRangeOfficers(updatedResponse);
    } catch (err) {
      // log error and send notification
      console.log(err);
      createNotification('error', rangeofficerSettings.error[lang]);
    }
  };

  // Function for deleting a range officer
  const handleDelete = async (removeId) => {
    try {
      await api.deleteUser(removeId);

      // Update range officers state
      setRangeOfficers((prevOfficers) =>
        prevOfficers.filter((officer) => officer.id !== removeId),
      );

      createNotification('success', rangeofficerSettings.deleteSuccess[lang]);
    } catch (err) {
      console.log(err);
      createNotification('error', rangeofficerSettings.deleteError[lang]);
    }
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        {rangeofficerSettings.title[lang]}
      </Typography>

      <form noValidate onSubmit={handleSubmit}>
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
          onChange={(e) => setUsername(e.target.value)}
          className={classes(css.textField)}
          inputProps={{
            'data-testid': 'username',
          }}
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
          onChange={(e) => setPassword(e.target.value)}
          className={classes(css.textField)}
          inputProps={{
            'data-testid': 'password',
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="passwordConfirm"
          name="passwordConfirm"
          value={passwordConfirm}
          type="password"
          label={rangeofficerSettings.passwordConfirm[lang]}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={classes(css.textField)}
          inputProps={{
            'data-testid': 'passwordConfirm',
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          className={classes(css.acceptButton)}
          data-testid="submit-button"
        >
          {rangeofficerSettings.confirm[lang]}
        </Button>
      </form>

      <br />

      {notification && (
        <Alert severity={notification.type} data-testid="alert">
          {notification.message}
        </Alert>
      )}

      <hr />

      <OfficerTable rangeOfficers={rangeOfficers} handleDelete={handleDelete} />
    </div>
  );
}
