import React, { useState, useEffect } from 'react';

import {
  Typography,
  Button,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import moment from 'moment';

import classNames from 'classnames';
import translations from '../../texts/texts.json';
import css from './ChangePassword.module.scss';
import api from '../../api/api';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { sv } = translations;

export default function Supervisions({ cookies }) {
  const [rangeofficerList, setRangeOfficerList] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [officerAnchorEl, setOfficerAnchorEl] = useState(null);
  const [supervisions, setSupervisions] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    console.log('use effect ');

    async function fetchData() {
      try {
        if (cookies.role === 'association') {
          // If the user in an association, get a list of their officers
          const officerResponse = await api.getRangeOfficers(cookies.id);
          const supervisionResponse = await api.getSupervisions(cookies.id);

          setRangeOfficerList(officerResponse);
          setSupervisions(supervisionResponse);
        } else if (cookies.role === 'rangeofficer') {
          // If the user is a rangeofficer, get the association they are associated with
          const associationId = await api.getAssociation(cookies.id);
          const supervisionResponse = await api.getSupervisions(associationId);

          setSupervisions(supervisionResponse);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, []);

  const createNotification = (type, message) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusSelect = (status) => {
    // Make sure that the passed status is allowed
    if (
      status === 'not confirmed' ||
      status === 'absent' ||
      status === 'confirmed'
    ) {
      // Get the row index from the anchor element
      const rowIndex = anchorEl.getAttribute('data-rowindex');

      // Update the corresponding supervision object with the selected status
      const updatedSupervisions = [...supervisions];
      updatedSupervisions[rowIndex].range_supervisor = status;
      setSupervisions(updatedSupervisions);
    }

    setAnchorEl(null);
  };

  const handleOfficerClick = (event) => {
    // Set the anchor element to the button that was clicked. Includes the row index value
    setOfficerAnchorEl(event.currentTarget);
  };

  // Handle range officer selection
  const handleOfficerSelect = (officerId) => {
    // Make sure that officer is either selected or set to null
    if (typeof officerId === 'number' || officerId === null) {
      // Get the row index from the anchor element
      const rowIndex = officerAnchorEl.getAttribute('data-rowindex');

      // Update the corresponding supervision object with the selected officer
      const updatedSupervisions = [...supervisions];
      updatedSupervisions[rowIndex].rangeofficer_id = officerId;

      // Set the updated supervision list and reset the anchor value
      setSupervisions(updatedSupervisions);
    }
    setOfficerAnchorEl(null);
  };

  const handleTimeChange = (event, rowIndex) => {
    // TODO: Better error handling, atm no error messages are shown
    const parsedTime = moment(event.target.value, 'HH:mm', true);

    if (parsedTime.isValid()) {
      // Update the arriving_at value in the corresponding supervision object
      const updatedSupervisions = [...supervisions];
      updatedSupervisions[rowIndex].arriving_at = parsedTime.format('HH:mm:ss');
      setSupervisions(updatedSupervisions);
    }
  };

  const handleSubmit = async (rowIndex) => {
    const request = {
      range_supervisor: supervisions[rowIndex].range_supervisor,
      rangeofficer_id: supervisions[rowIndex].rangeofficer_id,
      arriving_at: supervisions[rowIndex].arriving_at,
    };

    // await api.putSupervision(supervisions[rowIndex].id, request);

    console.log(request);

    createNotification(
      'success',
      `Supervision updated for ${supervisions[rowIndex].date}`,
    );
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        Upcoming supervisions
      </Typography>

      {notification && (
        <Alert severity={notification.type}>{notification.message}</Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned officer</TableCell>
            <TableCell>ETA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {supervisions &&
            supervisions.map((supervision, rowIndex) => (
              <TableRow key={supervision.id}>
                <TableCell>{supervision.date}</TableCell>

                {/* Range supervisor status selection */}
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(event) => handleStatusClick(event)}
                    data-rowindex={rowIndex}
                  >
                    {supervisions[rowIndex].range_supervisor}
                  </Button>
                  <Menu
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleStatusSelect}
                    keepMounted
                  >
                    <MenuItem
                      onClick={() => handleStatusSelect('not confirmed')}
                      style={{ color: '#b3b3b3' }}
                    >
                      {sv.Present[lang]}
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect('confirmed')}>
                      {sv.Confirmed[lang]}
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect('absent')}>
                      {sv.Absent[lang]}
                    </MenuItem>
                  </Menu>
                </TableCell>

                {/* Range officer selection menu */}
                <TableCell>
                  <div>
                    <Button
                      onClick={(event) => handleOfficerClick(event)}
                      variant="outlined"
                      size="small"
                      data-rowindex={rowIndex}
                    >
                      {rangeofficerList.find(
                        (officer) =>
                          officer.id === supervisions[rowIndex].rangeofficer_id,
                      )?.name || sv.OfficerSelect[lang]}
                    </Button>
                    <Menu
                      open={Boolean(officerAnchorEl)}
                      anchorEl={officerAnchorEl}
                      onClose={handleOfficerSelect}
                      keepMounted
                    >
                      <MenuItem onClick={() => handleOfficerSelect(null)}>
                        {sv.NoOfficer[lang]}
                      </MenuItem>
                      {rangeofficerList.map((officer) => (
                        <MenuItem
                          key={officer.id}
                          onClick={() => handleOfficerSelect(officer.id)}
                        >
                          {officer.name}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                </TableCell>

                {/* Arrival time selection */}
                <TableCell>
                  <div>
                    <TextField
                      id="time"
                      type="time"
                      value={supervision.arriving_at || ''}
                      onChange={(event) => handleTimeChange(event, rowIndex)}
                    />
                  </div>
                </TableCell>

                {/* Set button */}
                <TableCell>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={() => handleSubmit(rowIndex)}
                  >
                    Set
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
