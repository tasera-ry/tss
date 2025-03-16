import React, { useEffect, useState } from 'react';

import { Alert } from '@mui/lab';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import api from '../../api/api';
import css from './ChangePassword.module.scss';

const classes = classNames.bind(css);

/**
 * Component for displaying range officers in a table
 * @param {array} rangeOfficers - Array of range officers
 * @param {function} handleDelete - Function for deleting a range officer
 */
function OfficerTable({ rangeOfficers, handleDelete }) {
  const { t } = useLingui();
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
            <TableCell>{t`Range officers`}</TableCell>
            <TableCell>{t`Actions`}</TableCell>
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
                  {t`Delete`}
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
            {t`Delete range officer`} {officerToDelete.name}?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>{t`Cancel`}</Button>
            <Button
              onClick={() => {
                handleDelete(officerToDelete.id);
                setOpen(false);
              }}
              className={classes(css.removeButton)}
            >
              {t`Delete`}
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
  const { t } = useLingui();
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
  }, [id]);

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
      createNotification('error', t`Fill all the text fields`);
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      createNotification('error', t`Passwords don't match`);
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
      createNotification('success', t`Range officer added successfully`);
      setUsername('');
      setPassword('');
      setPasswordConfirm('');

      // Refetch range officers
      const updatedResponse = await api.getRangeOfficers(id);
      setRangeOfficers(updatedResponse);
    } catch (err) {
      // log error and send notification
      console.log(err);
      createNotification('error', t`Range officer addition failed`);
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

      createNotification('success', t`Range officer deleted successfully`);
    } catch (err) {
      console.log(err);
      createNotification('error', t`Range officer deletion failed`);
    }
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        {t`Add new range officer`}
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
          label={t`Username`}
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
          label={t`Password`}
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
          label={t`Confirm password`}
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
          {t`Add range officer`}
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
