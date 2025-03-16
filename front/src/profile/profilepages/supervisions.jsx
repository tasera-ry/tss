import { useEffect, useState } from 'react';

import { Alert } from '@mui/lab';
import {
  Button,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import moment from 'moment';

import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import api from '../../api/api';
import css from './ChangePassword.module.scss';
const classes = classNames.bind(css);

/**
 * Component for displaying association supervisions in a table
 * @param {number} cookies - User cookies
 */
export default function Supervisions({ cookies }) {
  const { t } = useLingui();
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
  }, [cookies.role, cookies.id]);

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
        `${t`Supervision updated for`} ${supervisions[rowIndex].date}`,
      );
    } catch (error) {
      console.log(error);
      createNotification('error', t`Something went wrong`);
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
        `${t`Supervision cleared for`} ${supervisions[rowIndex].date}`,
      );
    } catch (error) {
      console.log(error);
      createNotification('error', t`Something went wrong`);
    }
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        {t`Confirm supervisions`}
      </Typography>

      {cookies.role === 'association' ? (
        <Typography variant="subtitle1">
          {t`Association's upcoming supervisions`}
        </Typography>
      ) : (
        <Typography variant="subtitle1">
          {t`Your association's free supervisions. If the status is confirmed, the association has set the shift for you`}
        </Typography>
      )}

      {notification && (
        <Alert severity={notification.type}>{notification.message}</Alert>
      )}

      <Table data-testid="supervisions-table">
        <TableHead>
          <TableRow>
            <TableCell>{t`Date`}</TableCell>
            <TableCell>{t`Status`}</TableCell>
            {rangeofficerList !== null && (
              <TableCell>{t`Assigned officer`}</TableCell>
            )}
            <TableCell>ETA</TableCell>
            <TableCell>{t`Actions`}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {supervisions?.map((supervision, rowIndex) => (
              <TableRow key={supervision.id} data-testid="supervisions-row">
                <TableCell>{supervision.date}</TableCell>

                {/* Range supervisor status selection */}
                <TableCell data-testid="status-cell">
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
                      {t`Confirm date`}
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect('confirmed')}>
                      {t`Confirmed`}
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect('absent')}>
                      {t`Absent`}
                    </MenuItem>
                  </Menu>
                </TableCell>

                {/* Range officer selection menu. Only showed to association users */}
                {rangeofficerList !== null && (
                  <TableCell data-testid="officer-cell">
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
                        )?.name || t`Select officer`}
                      </Button>
                      <Menu
                        open={Boolean(officerAnchorEl)}
                        anchorEl={officerAnchorEl}
                        onClose={handleOfficerSelect}
                        keepMounted
                      >
                        <MenuItem onClick={() => handleOfficerSelect(null)}>
                          {t`No selection`}
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
                <TableCell data-testid="time-cell">
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
                <TableCell data-testid="actions-cell">
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className={classes(css.acceptButton)}
                    onClick={() => handleSubmit(rowIndex)}
                    data-testid="submit-button"
                  >
                    {t`Set`}
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
                    data-testid="reset-button"
                  >
                    {t`Reset`}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
