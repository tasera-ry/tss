import { useState, useEffect } from 'react';

import Alert from '@mui/lab/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import {
  checkSupervisorReservations,
} from '../../../upcomingsupervisions/LoggedIn';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { t } from '@lingui/core/macro';

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
              {t`CHECK`}
          </Button>
        </Link>
      }
    >
      {t`You have unconfirmed range officer reservations!`}
    </Alert>
  );
};
