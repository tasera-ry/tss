import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import '../App.css';
import './Statistics.css';

// Date management
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import api from '../api/api';
import translations from '../texts/texts.json';
import VisitorLogging from '../VisitorLogging/VisitorLogging';

let lang = 'fi';
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}

moment.locale(lang);
const { statistics } = translations;
const fin = localStorage.getItem('language');

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
    let dayNum = dayNumberSplit[2];
    dayNum = dayNum.startsWith('0') ? dayNum.substring(1) : dayNum;
    setDayNumber(dayNum);

    const fetchData = async () => {
      const monthResult = await getMonthlyVisitors(firstDate, lastDate); // eslint-disable-line
      const dayResult = await getDailyVisitors(singleDay); // eslint-disable-line
      /* eslint-disable-next-line */
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

    // Options for the month chart
    setMonthOptions({
      chart: { id: 'monthChart' },
      xaxis: {
        categories: dayArray,
        title: {
          text: statistics.DayLabel[fin],
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
      stroke: {
        curve: 'smooth',
        colors: ['#658f60'],
      },
    });
    setMonthSeries([{ name: 'visitors', data: monthlyUsers }]);
  }, [monthlyUsers]);

  useEffect(() => {
    // Get the short_descriptions of each track in order to use them as a label
    const firstDate = moment(date).startOf('month').format('YYYY-MM-DD');
    const lastDate = moment(date).endOf('month').format('YYYY-MM-DD');
    const labelArray = getShortDescriptions(firstDate, lastDate); // eslint-disable-line
    labelArray.then((result) => {
      // Options for the day chart
      setDayOptions({
        chart: { id: 'dayChart' },
        xaxis: {
          categories: result,
          title: {
            text: statistics.TrackLabel[fin],
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
        fill: {
          colors: ['#658f60'],
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '16px',
          },
          background: {
            enabled: true,
            foreColor: '#000000',
          },
        },
      });
    });
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
    const labelArray = getShortDescriptions(firstDate, lastDate); // eslint-disable-line

    labelArray.then((result) => {
      // Options for the day chart
      setMonthlyTrackOptions({
        chart: { id: 'monthlyTrackChart' },
        xaxis: {
          categories: result,
          title: {
            text: statistics.TrackLabel[fin],
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
        fill: {
          colors: ['#658f60'],
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '16px',
          },
          background: {
            enabled: true,
            foreColor: '#000000',
          },
        },
      });
    });
    setMonthlyTrackSeries([
      {
        name: 'visitors',
        data: monthlyTrackUsers,
      },
    ]);
  }, [monthlyTrackUsers, date]);

  const Alert = (props) => (
    <MuiAlert elevation={6} variant="filled" {...props} />
  );

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  };

  const previousDayClick = () => {
    const newDate = new Date(date.setDate(date.getDate() - 1));
    setDate(newDate);
  };

  const nextDayClick = () => {
    const newDate = new Date(date.setDate(date.getDate() + 1));
    setDate(newDate);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const continueWithDate = (event) => {
    if (event?.event.type?.event.type === 'submit') {
      event.preventDefault();
    }
  };

  const countMonthlyVisitors = () => monthlyUsers.reduce((a, b) => a + b, 0);

  const handleDatePickChange = (newDate) => {
    const newDateObject = new Date(newDate);
    setDate(newDateObject);
    continueWithDate();
  };

  if (monthlyUsers?.length > 0) {
    const total = countMonthlyVisitors();

    return (
      <div className="container">
        <Snackbar
          open={toastOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={toastSeverity}>
            {toastMessage}!
          </Alert>
        </Snackbar>
        {/* Section for selecting date */}
        <div className="firstSection">
          <form onSubmit={continueWithDate}>
            {/* Datepicker */}
            <MuiPickersUtilsProvider utils={MomentUtils} locale={lang}>
              <KeyboardDatePicker
                autoOk
                margin="normal"
                name="date"
                label={statistics.DayChoose[fin]}
                value={date}
                onChange={(newDate) => handleDateChange(newDate)}
                onAccept={handleDatePickChange}
                format="DD.MM.YYYY"
                showTodayButton
              />
            </MuiPickersUtilsProvider>
          </form>
        </div>
        <hr />
        <div className="buttonContainer">
          <Button
            className="openModal"
            onClick={() => setModalOpen(true)}
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
        <Grid class="date-header">
          <div className="hoverHand arrow-left" onClick={previousDayClick} />
          <h1 className="headerText">{date.toLocaleDateString('fi-FI')}</h1>
          <div className="hoverHand arrow-right" onClick={nextDayClick} />
        </Grid>
        {/* Charts */}
        <div className="row">
          <div className="mixed-chart">
            {/* Labels */}
            <h2>{statistics.Day[fin]}</h2>
            <h3>
              {`${statistics.Total[fin]} ${date.toLocaleDateString('fi-FI')}: ${
                monthlyUsers[dayNumber - 1]
              }`}
            </h3>
            <h3>{statistics.DayChartHeader[fin]}</h3>
            <div className="bar">
              <Chart
                options={dayOptions}
                series={daySeries}
                type="bar"
                width="700"
                height="400"
              />
            </div>
            {/* Labels */}
            <h2>{statistics.Month[fin]}</h2>
            <h3>
              {`${statistics.Total[fin]} ${
                date.getMonth() + 1
              }/${date.getFullYear()}: ${total}`}
            </h3>
            <h3>{statistics.MonthChart1Header[fin]}</h3>
            <div className="line">
              <Chart
                options={monthOptions}
                series={monthSeries}
                type="line"
                width="700"
                height="400"
              />
            </div>
            <h3>{statistics.MonthChart2Header[fin]}</h3>
            <div className="bar">
              <Chart
                options={monthlyTrackOptions}
                series={monthlyTrackSeries}
                type="bar"
                width="700"
                height="400"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <div />;
};

async function getMonthlyVisitors(firstDate, lastDate) {
  try {
    const data = await api.getSchedulingFreeform(firstDate, lastDate);
    const visitors = [];

    for (const supervision of data) {
      if (!supervision?.scheduleId) {
        visitors.push(0);
      } else {
        let trackVisitors = 0;
        for (const track of supervision.tracks) {
          trackVisitors += track.scheduled.visitors;
        }
        visitors.push(trackVisitors);
      }
    }

    return visitors;
  } catch (err) {
    return [];
  }
}

const getDailyVisitors = async (date) => {
  try {
    const data = await api.getSchedulingFreeform(date, date);
    // Form an array including the visitors of a certain day and return it
    const visitors = [];

    for (const supervision of data) {
      if (!supervision?.scheduleId) {
        visitors.push(0);
      } else {
        for (const track of supervision.tracks) {
          visitors.push(track.scheduled.visitors);
        }
      }
    }

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

    for (const supervision of data) {
      if (!supervision?.scheduleId) {
        // I think there should be something
      } else {
        let trackVisitors = 0;
        let trackPerMonthVisitors = 0;
        for (const track of supervision.tracks) {
          if (visitors.length === 7) {
            trackPerMonthVisitors = visitors[track.id - 1];
            trackVisitors = track.scheduled.visitors + trackPerMonthVisitors;
            visitors.splice(track.id - 1, 1, trackVisitors);
          } else {
            trackVisitors = track.scheduled.visitors;
            visitors.splice(track.id - 1, 1, trackVisitors);
          }
        }
      }
    }

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
      if (supervision?.scheduleId)
        for (const track of supervision.tracks) {
          const description = track.short_description;
          descriptions.push(description);
        }
    }

    // TODO: find out why an empty array is returned?
    return [];
  } catch (err) {
    return [];
  }
}

export default Statistics;
