import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import api from '../api/api';

import { StylesProvider } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import translations from '../texts/texts.json';
import RaffleDatePicker from './RaffleDatePicker';
import SupervisorsTable from './SupervisorsTable';
import { dateToString, validateLogin } from '../utils/Utils';
import SupervisionResultsTable from './SupervisionResultsTable';
import SupervisionAmountsTable from './SupervisionAmountsTable';
import css from './raffle.module.scss';

const classes = classNames.bind(css);

const lang = localStorage.getItem('language');
const { nav } = translations;
const { raffle } = translations;

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

  useEffect(() => {
    (async () => {
      const logInSuccess = await validateLogin();
      if (!logInSuccess) window.location.href = '/';
      try {
        const res = await api.getMembers();
        setSupervisors(res);
      } catch (err) {
        setToast({
          open: true,
          msg: raffle.loadError[lang],
          severity: 'error',
        });
      } finally {
        setIsLoading({ ...isLoading, page: false });
      }
    })();
  }, []); // eslint-disable-line

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
      setToast({ open: true, msg: raffle.valueError[lang], severity: 'error' });
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
        msg: raffle.updateSuccess[lang],
        severity: 'success',
      });
      setSupervisors(updatedSupervisors);
    } catch (err) {
      setToast({
        open: true,
        msg: raffle.updateError[lang],
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
        msg: raffle.raffleError[lang],
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
        msg: raffle.saveSuccess[lang],
        severity: 'success',
      });
      setSelectedDays([]);
      setRaffleResults([]);
    } catch (err) {
      setToast({
        open: true,
        msg: raffle.saveError[lang],
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
    <StylesProvider injectFirst>
      <div className={classes(css.members)}>
        <h1>{nav.Raffle[lang]}</h1>
        <div className={classes(css.tableHeader)}>
          {raffle.tableTitle[lang]}
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
            <h2>{raffle.dates[lang]}</h2>
            <RaffleDatePicker
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
            />
            <div className={classes(css.submitContainer)}>
              {!isLoading.raffle ? (
                <Button
                  variant="contained"
                  className={classes(css.acceptButton)}
                  disabled={selectedDays.length === 0}
                  onClick={handleSubmitRaffle}
                >
                  {raffle.raffle[lang]}
                </Button>
              ) : (
                <CircularProgress />
              )}
            </div>
          </div>
        )}
        {raffleResults.length > 0 && (
          <>
            <h2>{raffle.results[lang]}</h2>
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
                {raffle.save[lang]}
              </Button>
            ) : (
              <CircularProgress />
            )}
          </>
        )}
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
    </StylesProvider>
  );
}
