import React, { useState, useEffect } from 'react';

import Alert from '@mui/lab/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import { withCookies } from 'react-cookie';
// function for checking whether we should show banner
// DialogWindow for supervisors to confirm their supervisions
import {
  checkSupervisorReservations,
  DialogWindow,
} from '../upcomingsupervisions/LoggedIn';
import translations from '../texts/texts.json';

const { banner } = translations;

const SupervisorNotification = ({
  username,
  loggingOut,
  setLoggingOut,
  checkSupervisions,
  setCheckSupervisions,
}) => {
  const lang = localStorage.getItem('language');
  const [userHasSupervisors, setUserHasSupervisors] = useState(false);
  const [supervisionsOpen, setSupervisionsOpen] = useState(false);

  const updateSupervisors = async () => {
    const reservations = await checkSupervisorReservations(username);
    setUserHasSupervisors(!!reservations);
  };

  useEffect(() => {
    updateSupervisors();
  }, []);

  useEffect(() => {
    if (loggingOut) {
      setUserHasSupervisors(false);
      setLoggingOut(false);
    } else if (checkSupervisions) {
      updateSupervisors();
      setCheckSupervisions(false);
    }
  }, [loggingOut, checkSupervisions, setCheckSupervisions, setLoggingOut]);

  return (
    <div>
      {userHasSupervisors && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Link to="/profile/supervisions">
              <Button color="inherit" size="small">
                <Link to="/profile/supervisions" style={{ color: 'white' }}>
                  {banner.Check[lang]}
                </Link>
              </Button>
            </Link>
          }
          onClick={() => setSupervisionsOpen(true)}
        >
          {banner.Notification[lang]}
        </Alert>
      )}
    </div>
  );
};

export default withCookies(SupervisorNotification);
