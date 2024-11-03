import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import classNames from 'classnames';
import colors from '../colors.module.scss';

// Date management
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/lab/Alert';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { getLanguage, incrementOrDecrementDate } from '../utils/Utils';
import api from '../api/api';
import translations from '../texts/texts.json';
import VisitorLogging from '../VisitorLogging/VisitorLogging';
import css from './Statistics.module.scss';

const classes = classNames.bind(css);

const lang = getLanguage();
moment.locale(lang);
const { statistics } = translations;
const fin = localStorage.getItem('language');

const getChart = (id, categories) => ({
  chart: { id },
  xaxis: {
    categories,
    title: {
      text:
        id === 'monthChart'
          ? statistics.DayLabel[fin]
          : statistics.TrackLabel[fin],
      style: {
        fontSize: '14px',
      },
    },
  },
  yaxis: {
    title: {
      text: statistics.VisitorLabel[fin],
      style: {
        fontSize: '14px',
      },
    },
  },
  // charts have same options except for the month chart
  ...(id === 'monthChart'
    ? {
        stroke: {
          curve: 'smooth',
          colors: [colors.green],
        },
      }
    : {
        fill: {
          colors: [colors.green],
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '16px',
          },
          background: {
            enabled: true,
            foreColor: colors.black,
          },
        },
      }),
});

const Statistics = () => {
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);

  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [monthOptions, setMonthOptions] = useState({});
  const [monthSeries, setMonthSeries] = useState([]);

  const [monthlyTrackUsers, setMonthlyTrackUsers] = useState([]);
  const [monthlyTrackOptions, setMonthlyTrackOptions] = useState({});
  const [monthlyTrackSeries, setMonthlyTrackSeries] = useState([]);

  const [dayOptions, setDayOptions] = useState({});
  const [daySeries, setDaySeries] = useState([]);
  const [dailyUsers, setDailyUsers] = useState([]);

  const [dayNumber, setDayNumber] = useState([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState('success');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const firstDate = moment(date).startOf('month').format('YYYY-MM-DD');
    const lastDate = moment(date).endOf('month').format('YYYY-MM-DD');
    const singleDay = moment(date).format('YYYY-MM-DD');

    // dayNum is used as an index in monthlyUsers[] to define the total visitors of a day
    const dayNumberSplit = singleDay.split('-');
    const dayNum = dayNumberSplit[2];
    setDayNumber(dayNum.startsWith('0') ? dayNum.substring(1) : dayNum);

    const fetchData = async () => {
      const monthResult = await getMonthlyVisitors(firstDate, lastDate);
      const dayResult = await getDailyVisitors(singleDay);
      const monthlyTrackResult = await getMonthlyTrackVisitors(
        firstDate,
        lastDate,
      );
      setDailyUsers(dayResult);
      setMonthlyUsers(monthResult);
      setMonthlyTrackUsers(monthlyTrackResult);
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    // Count monthly visitors
    const dayArray = Array.from(
      { length: monthlyUsers.length },
      (_, i) => i + 1,
    );

    setMonthOptions(getChart('monthChart', dayArray));
    setMonthSeries([{ name: 'visitors', data: monthlyUsers }]);
  }, [monthlyUsers]);

  useEffect(() => {
    // Get the short_descriptions of each track in order to use them as a label
    const firstDate = moment(date).startOf('month').format('YYYY-MM-DD');
    const lastDate = moment(date).endOf('month').format('YYYY-MM-DD');
    const labelArray = getShortDescriptions(firstDate, lastDate);
    labelArray.then((result) => setDayOptions(getChart('dayChart', result)));
    setDaySeries([
      {
        name: 'visitors',
        data: dailyUsers,
      },
    ]);
  }, [dailyUsers, date]);

  useEffect(() => {
    // Get the short_descriptions of each track in order to use them as a label
    const firstDate = moment(date).startOf('month').format('YYYY-MM-DD');
    const lastDate = moment(date).endOf('month').format('YYYY-MM-DD');
    const labelArray = getShortDescriptions(firstDate, lastDate);

    labelArray.then((result) =>
      setMonthlyTrackOptions(getChart('monthlyTrackChart', result)),
    );
    setMonthlyTrackSeries([
      {
        name: 'visitors',
        data: monthlyTrackUsers,
      },
    ]);
  }, [monthlyTrackUsers, date]);

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  const continueWithDate = (event) => {
    if (event?.event.type?.event.type === 'submit') event.preventDefault();
  };

  if (monthlyUsers?.length <= 0) return <div />;
  const totalUsers = monthlyUsers.reduce((a, b) => a + b, 0);

  return (
    <div className={classes(css.container)}>
      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={(_, reason) => handleSnackbarClose(reason)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={(_, reason) => handleSnackbarClose(reason)}
          severity={toastSeverity}
        >
          {toastMessage}!
        </MuiAlert>
      </Snackbar>
      {/* Section for selecting date */}
      <div className={classes(css.firstSection)}>
        <form onSubmit={continueWithDate}>
          {/* Datepicker */}
          <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={lang}>
            <DatePicker
              closeOnSelect
              margin="normal"
              label={statistics.DayChoose[fin]}
              value={moment(date)}
              onChange={(newDate) => setDate(newDate)}
              onAccept={(newDate) => {
                setDate(new Date(newDate));
                continueWithDate();
              }}
              inputFormat="DD.MM.YYYY"
              renderInput={(params) => <TextField {...params} />}
              showTodayButton
            />
          </LocalizationProvider>
        </form>
      </div>
      <hr />
      <div className={classes(css.buttonContainer)}>
        <Button
          className={classes(css.openModal)}
          onClick={() => setModalOpen(true)}
          style={{backgroundColor: '#d1ccc2'}}
          variant="contained"
        >
          {statistics.OpenLogging[fin]}
        </Button>
      </div>
      <Modal
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <VisitorLogging
          handleClose={() => setModalOpen(false)}
          setToastSeverity={setToastSeverity}
          setToastMessage={setToastMessage}
          setToastOpen={setToastOpen}
        />
      </Modal>
      {/* Header with arrows */}
      <Grid className={classes(css.dateHeader)}>
        <div
          className={classes(css.arrowLeft)}
          onClick={() => setDate(incrementOrDecrementDate(date, -1))}
        />
        <h1 className={classes(css.headerText)}>
          {date.toLocaleDateString('fi-FI')}
        </h1>
        <div
          className={classes(css.arrowRight)}
          onClick={() => setDate(incrementOrDecrementDate(date, 1))}
        />
      </Grid>
      {/* Charts */}
      <div className={classes(css.charts)}>
        {/* Labels */}
        <h2>{statistics.Day[fin]}</h2>
        <h3>
          {`${statistics.Total[fin]} ${date.toLocaleDateString('fi-FI')}: ${
            monthlyUsers[dayNumber - 1]
          }`}
        </h3>
        <h3>{statistics.DayChartHeader[fin]}</h3>
        <Chart
          options={dayOptions}
          series={daySeries}
          type="bar"
          width="700"
          height="400"
        />
        {/* Labels */}
        <h2>{statistics.Month[fin]}</h2>
        <h3>
          {`${statistics.Total[fin]} ${
            date.getMonth() + 1
          }/${date.getFullYear()}: ${totalUsers}`}
        </h3>
        <h3>{statistics.MonthChart1Header[fin]}</h3>
        <Chart
          options={monthOptions}
          series={monthSeries}
          type="line"
          width="700"
          height="400"
        />
        <h3>{statistics.MonthChart2Header[fin]}</h3>
        <Chart
          options={monthlyTrackOptions}
          series={monthlyTrackSeries}
          type="bar"
          width="700"
          height="400"
        />
      </div>
    </div>
  );
};

const getMonthlyVisitors = async (firstDate, lastDate) => {
  try {
    const data = await api.getSchedulingFreeform(firstDate, lastDate);
    const visitors = [];

    data.forEach(({ scheduleId, tracks }) => {
      if (!scheduleId) visitors.push(0);
      else
        visitors.push(
          tracks.reduce(
            (total, { scheduled }) => total + scheduled.visitors,
            0,
          ),
        );
    });
    return visitors;
  } catch (err) {
    return [];
  }
};

const getDailyVisitors = async (date) => {
  try {
    const data = await api.getSchedulingFreeform(date, date);
    // Form an array including the visitors of a certain day and return it
    const visitors = [];

    data.forEach(({ scheduleId, tracks }) => {
      if (!scheduleId) visitors.push(0);
      else tracks.forEach(({ scheduled }) => visitors.push(scheduled.visitors));
    });
    return visitors;
  } catch (err) {
    return [];
  }
};

async function getMonthlyTrackVisitors(firstDate, lastDate) {
  try {
    const data = await api.getSchedulingFreeform(firstDate, lastDate);
    // Form an array including the visitors of a certain track per month and return it
    const visitors = [];

    data.forEach(({ scheduleId, tracks }) => {
      if (!scheduleId) return;

      tracks.forEach(({ id, scheduled }) => {
        if (visitors.length !== 7)
          visitors.splice(id - 1, 1, scheduled.visitors);
        else {
          const trackPerMonthVisitors = visitors[id - 1];
          const trackVisitors = scheduled.visitors + trackPerMonthVisitors;
          visitors.splice(id - 1, 1, trackVisitors);
        }
      });
    });
    return visitors;
  } catch (err) {
    return [];
  }
}

async function getShortDescriptions(firstDate, lastDate) {
  try {
    const data = await api.getSchedulingFreeform(firstDate, lastDate);
    // Form an array including the short_descriptions of each track
    const descriptions = [];

    for (const supervision of data) {
      if (!supervision?.scheduleId) continue;
      supervision.tracks.forEach(({ short_description }) =>
        descriptions.push(short_description),
      );
      return descriptions;
    }
    return [];
  } catch (err) {
    return [];
  }
}

export default Statistics;
