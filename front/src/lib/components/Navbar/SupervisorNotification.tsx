import { useState, useEffect } from 'react';

import Alert from '@mui/lab/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import {
  checkSupervisorReservations,
} from '../../../upcomingsupervisions/LoggedIn';
import translations from '../../../texts/texts.json';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';

const { banner } = translations;

export const SupervisorNotification = () => {
  const lang = localStorage.getItem('language');
  const [userHasSupervisors, setUserHasSupervisors] = useState(false);

  const { username } = useLoggedInUser();

  const updateSupervisors = async () => {
    const reservations = await checkSupervisorReservations(username);
    setUserHasSupervisors(!!reservations);
  };

  useEffect(() => {
    updateSupervisors();
  }, []);

  if (!userHasSupervisors) return null

  return (
    <Alert
      severity="warning"
      variant="filled"
      action={
        <Link to="/profile/supervisions">
          <Button color="inherit" size="small">
              {banner.Check[lang]}
          </Button>
        </Link>
      }
    >
      {banner.Notification[lang]}
    </Alert>
  );
};
