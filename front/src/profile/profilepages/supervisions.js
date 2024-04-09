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
  const [supervisions, setSupervisions] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [rangeOfficer, setRangeOfficer] = useState(null);
  const [arrivalTime, setArrivalTime] = useState('');
  const [officerAnchorEl, setOfficerAnchorEl] = useState(null);

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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOfficerClick = (event) => {
    setOfficerAnchorEl(event.currentTarget);
  };

  // Handle range officer selection
  const handleOfficerSelect = (officer) => {
    setRangeOfficer(officer);
    setOfficerAnchorEl(null);
  };

  const handleTimeChange = (event) => {
    // TODO: Better error handling, atm no error messages are shown
    const parsedTime = moment(event.target.value, 'HH:mm', true);

    if (parsedTime.isValid()) {
      setArrivalTime(parsedTime.format('HH:mm'));
    }
  };

  return (
    <div className={classes(css.title)}>
      <Typography component="h1" variant="h5">
        Upcoming supervisions
      </Typography>

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
            supervisions.map((supervision) => (
              <TableRow key={supervision.id}>
                <TableCell>{supervision.date}</TableCell>

                {/* Range supervisor status selection */}
                <TableCell>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleClick}
                  >
                    {supervision.range_supervisor}
                  </Button>
                  <Menu
                    open={Boolean(anchorEl)}
                    keepMounted
                    anchorEl={anchorEl}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleClose}>
                      {sv.Present[lang]}
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      {sv.Confirmed[lang]}
                    </MenuItem>
                    <MenuItem onClick={handleClose}>{sv.Absent[lang]}</MenuItem>
                  </Menu>
                </TableCell>

                {/* Range officer selection menu */}
                <TableCell>
                  <div>
                    <Button
                      onClick={handleOfficerClick}
                      variant="outlined"
                      size="small"
                    >
                      Select rangeofficer
                    </Button>
                    <Menu
                      open={Boolean(officerAnchorEl)}
                      anchorEl={officerAnchorEl}
                      onClose={handleOfficerSelect}
                      keepMounted
                    >
                      <MenuItem
                        onClick={() => handleOfficerSelect(null)}
                        data-info=""
                      >
                        {sv.NoOfficer[lang]}
                      </MenuItem>
                      {rangeofficerList.map((officer) => (
                        <MenuItem
                          key={officer.id}
                          onClick={() => handleOfficerSelect(officer)}
                          data-info={officer.name}
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
                      value={arrivalTime}
                      onChange={handleTimeChange}
                    />
                  </div>
                </TableCell>

                {/* Set button */}
                <TableCell>
                  <Button type="submit" fullWidth variant="contained">
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
