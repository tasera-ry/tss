import classNames from 'classnames';
import { useEffect, useState } from 'react';
import api from '../api/api';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { StyledEngineProvider } from '@mui/material/styles';

import { useLingui } from '@lingui/react/macro';
import { dateToString } from '../utils/dateUtils';
import RaffleDatePicker from './RaffleDatePicker';
import SupervisionAmountsTable from './SupervisionAmountsTable';
import SupervisionResultsTable from './SupervisionResultsTable';
import SupervisorsTable from './SupervisorsTable';
import css from './raffle.module.scss';
import { useQuery, useQueryClient } from 'react-query';
import { TableLegends } from '@/lib/components/TableLegends';
import RaffleAnalytics from './RaffleAnalytics';


const classes = classNames.bind(css);

const supervisionAmounts = (raffleResults, supervisors) => {
  const userMap = new Map();

  supervisors.forEach(({ name, raffle }) => {
    if (raffle) userMap.set(name, 0);
  });

  return raffleResults.reduce((acc, result) => {
    const prevAmount = acc.get(result.name);
    return acc.set(result.name, prevAmount + 1);
  }, userMap);
};

export default function Raffle() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [supervisorsOpen, setSupervisorsOpen] = useState(true);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [raffleResults, setRaffleResults] = useState([]);
  const [raffleResultAmounts, setRaffleResultAmounts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    page: true,
    table: false,
    raffle: false,
    save: false,
  });
  const [toast, setToast] = useState({
    open: false,
    msg: '',
    severity: 'success',
  });

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.getMembers();
      res.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      return res;
    },
    onSuccess: (data) => {
      setSupervisors(data);
      setIsLoading({ ...isLoading, page: false });
    },
    onError: (error) => {
      setToast({
        open: true,
        msg: t`Could not load associations`,
        severity: 'error',
      });
      window.location.href = '/';
    },
  });

  useEffect(() => {
    if (raffleResults.length > 0) {
      const amounts = supervisionAmounts(raffleResults, supervisors);
      setRaffleResultAmounts(
        Array.from(amounts, ([name, amount]) => ({ name, amount })),
      );
    } else setRaffleResultAmounts([]);
  }, [raffleResults, supervisors]);

  const handleSubmitUser = async (user_id, data) => {
    if (data.members < 0 || data.associations < 0) {
      setToast({
        open: true,
        msg: t`Values cannot be negative`,
        severity: 'error',
      });
      return;
    }
    setIsLoading({ ...isLoading, table: true });
    try {
      await api.patchMembers(user_id, data);

      const updatedSupervisors = supervisors.map((user) => {
        if (user.user_id !== user_id) return user;
        return { ...user, ...data };
      });
      setToast({
        open: true,
        msg: t`Organization updated`,
        severity: 'success',
      });
      setSupervisors(updatedSupervisors);
    } catch (err) {
      setToast({
        open: true,
        msg: t`Association update failed`,
        severity: 'error',
      });
    } finally {
      setIsLoading({ ...isLoading, table: false });
    }
  };

  const handleSubmitRaffle = async () => {
    setIsLoading({ ...isLoading, raffle: true });
    const raffleDates = selectedDays.map((date) => dateToString(date));
    try {
      const results = await api.raffleSupervisors(raffleDates);
      const sortedResults = results.raffle.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
      setRaffleResults(sortedResults);
    } catch (err) {
      setToast({
        open: true,
        msg: t`The execution of the raffle failed`,
        severity: 'error',
      });
    } finally {
      setIsLoading({ ...isLoading, raffle: false });
    }
  };

  const handleSubmitResults = async () => {
    setIsLoading({ ...isLoading, save: true });
    // only association id (= user_id), range_id and date are needed
    const results = raffleResults.map(({ user_id, range_id, date }) => ({
      association_id: user_id,
      range_id,
      date,
    }));
    try {
      await api.saveRaffledSupervisors(results);

      setToast({
        open: true,
        msg: t`Results saved`,
        severity: 'success',
      });
      setSelectedDays([]);
      setRaffleResults([]);
      queryClient.invalidateQueries('schedulingFreeform');
    } catch (err) {
      setToast({
        open: true,
        msg: t`The saving of the results failed`,
        severity: 'error',
      });
    } finally {
      setIsLoading({ ...isLoading, save: false });
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  if (isLoading.page) return null;
  return (
    <StyledEngineProvider injectFirst>
      <div className={classes(css.members)}>
        <h1>{t`Raffle supervisors`}</h1>
        <div className={classes(css.tableHeader)}>
          {t`Associations`}
          <IconButton onClick={() => setSupervisorsOpen(!supervisorsOpen)}>
            {supervisorsOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </IconButton>
        </div>
        {supervisorsOpen ? (
          <SupervisorsTable
            associations={supervisors}
            onSubmitUser={handleSubmitUser}
            isLoading={isLoading.table}
          />
        ) : (
          <div className={classes(css.divider)} />
        )}
        {supervisors.length !== 0 && (
          <div className={classes(css.raffleForm)}>
            <h2>{t`Choose dates for the raffle`}</h2>
            <RaffleDatePicker
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
            />
            <div style={{ padding : '10px' }}>
            <TableLegends showAdditionalInfo={false} />
            </div>
            <div className={classes(css.submitContainer)}>
              {!isLoading.raffle ? (
                <Button
                  variant="contained"
                  className={classes(css.acceptButton)}
                  disabled={selectedDays.length === 0}
                  onClick={handleSubmitRaffle}
                >
                  {t`Raffle supervisors`}
                </Button>
              ) : (
                <CircularProgress />
              )}
            </div>
          </div>
        )}
        {raffleResults.length > 0 && (
          <>
            <h2>{t`Raffle results`}</h2>
            <div className={classes(css.raffleResults)}>
              <SupervisionResultsTable
                results={raffleResults}
                setResults={setRaffleResults}
                supervisors={supervisors.filter(({ raffle }) => raffle)}
              />
              {raffleResultAmounts.length > 0 && (
                <SupervisionAmountsTable amounts={raffleResultAmounts} />
              )}
            </div>
            {!isLoading.save ? (
              <Button
                variant="contained"
                className={classes(css.acceptButton)}
                disabled={selectedDays.length === 0}
                onClick={handleSubmitResults}
              >
                {t`Save results`}
              </Button>
            ) : (
              <CircularProgress />
            )}
          </>
        )}
        <RaffleAnalytics />
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={toast.severity}
          >
            {toast.msg}!
          </MuiAlert>
        </Snackbar>
      </div>
    </StyledEngineProvider>
  );
}