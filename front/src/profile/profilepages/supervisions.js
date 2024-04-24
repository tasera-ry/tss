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

/**
 * Component for displaying association supervisions in a table
 * @param {number} cookies - User cookies
 */
export default function Supervisions({ cookies }) {
  const [rangeofficerList, setRangeOfficerList] = useState(null);
  const [supervisions, setSupervisions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [officerAnchorEl, setOfficerAnchorEl] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fetch data from the API depending on the user role.
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
          const response = await api.getAssociation(cookies.id);
          const associationId = response[0].association_id;

          // Get all supervisions for the association
          const supervisionResponse = await api.getSupervisions(associationId);

          // Filter supervisions available for the range officer,
          // or ones where they have been already assigned
          const availableSupervisions = supervisionResponse.filter(
            (supervision) =>
              supervision.rangeofficer_id === null ||
              supervision.rangeofficer_id === Number(cookies.id),
          );

          setSupervisions(availableSupervisions);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, []);

  // Create a notification message
  const createNotification = (type, message) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleStatusClick = (event) => {
    // Set the anchor element to the button that was clicked. Includes the row index value
    setAnchorEl(event.currentTarget);
  };

  // TODO if status absent -> rangeofficerid null
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

  // Function to handle time change. Updates the arriving_at value in the supervision
  // object on the corresponding row
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

  // Function to handle the submit button click. Sends a PUT request to the API with the
  // updated supervision object on the corresponding row.
  const handleSubmit = async (rowIndex) => {
    let rangeofficerId = null;
    let arrivingAt = null;

    if (supervisions[rowIndex].range_supervisor === 'absent') {
      // If the status is set as absent, set the officerid and timestamp to null
      rangeofficerId = null;
      arrivingAt = null;
    } else if (
      cookies.role === 'rangeofficer' &&
      supervisions[rowIndex].range_supervisor === 'confirmed'
    ) {
      // If the user is a rangeofficer and status is confirmed, use the user id as officerid
      rangeofficerId = cookies.id;
      arrivingAt = supervisions[rowIndex].arriving_at;
    } else {
      // Otherwise use the existing values set in the form
      // (user is association, status and officer are set)
      rangeofficerId = supervisions[rowIndex].rangeofficer_id;
      arrivingAt = supervisions[rowIndex].arriving_at;
    }

    const request = {
      range_supervisor: supervisions[rowIndex].range_supervisor,
      rangeofficer_id: rangeofficerId,
      arriving_at: arrivingAt,
    };

    try {
      await api.putSupervision(supervisions[rowIndex].id, request);

      createNotification(
        'success',
        `${sv.updatedSupervision[lang]} ${supervisions[rowIndex].date}`,
      );
    } catch (error) {
      console.log(error);
      createNotification('error', sv.error[lang]);
    }
  };

  const handleReset = async (rowIndex) => {
    // Clear the supervision object on the corresponding row
    const request = {
      range_supervisor: 'not confirmed',
      rangeofficer_id: null,
      arriving_at: null,
    };

    try {
      await api.putSupervision(supervisions[rowIndex].id, request);

      // Update the supervision object with the new values
      const updatedSupervisions = [...supervisions];
      updatedSupervisions[rowIndex].range_supervisor = 'not confirmed';
      updatedSupervisions[rowIndex].arriving_at = null;
      updatedSupervisions[rowIndex].rangeofficer_id = null;
      setSupervisions(updatedSupervisions);

      createNotification(
        'success',
        `${sv.clearNotification[lang]} ${supervisions[rowIndex].date}`,
      );
    } catch (error) {
      console.log(error);
      createNotification('error', sv.error[lang]);
    }
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        {sv.Header[lang]}
      </Typography>

      {cookies.role === 'association' ? (
        <Typography variant="subtitle1">{sv.Association[lang]}</Typography>
      ) : (
        <Typography variant="subtitle1"> {sv.Rangeofficer[lang]}</Typography>
      )}

      {notification && (
        <Alert severity={notification.type}>{notification.message}</Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{sv.date[lang]}</TableCell>
            <TableCell>{sv.status[lang]}</TableCell>
            {rangeofficerList !== null && (
              <TableCell>{sv.AssignedOfficer[lang]}</TableCell>
            )}
            <TableCell>ETA</TableCell>
            <TableCell>{sv.actionsRow[lang]}</TableCell>
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

                {/* Range officer selection menu. Only showed to association users */}
                {rangeofficerList !== null && (
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
                            officer.id ===
                            supervisions[rowIndex].rangeofficer_id,
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
                )}

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

                {/* Submit button */}
                <TableCell>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className={classes(css.acceptButton)}
                    onClick={() => handleSubmit(rowIndex)}
                  >
                    {sv.setButton[lang]}
                  </Button>
                </TableCell>

                {/* Reset button */}
                <TableCell>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className={classes(css.removeButton)}
                    onClick={() => handleReset(rowIndex)}
                  >
                    {sv.resetButton[lang]}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
