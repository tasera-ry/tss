import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { useLingui } from '@lingui/react/macro';
import { checkSupervisorReservations } from '../../../upcomingsupervisions/LoggedIn';

export const SupervisorNotification = () => {
  const { t } = useLingui();
  const [userHasSupervisors, setUserHasSupervisors] = useState(false);

  const { username } = useLoggedInUser();

  const updateSupervisors = useCallback(async () => {
    const reservations = await checkSupervisorReservations(username);
    setUserHasSupervisors(!!reservations);
  }, [username]);

  useEffect(() => {
    updateSupervisors();
  }, [updateSupervisors]);

  if (!userHasSupervisors) return null;

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
