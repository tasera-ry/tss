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

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import Button from '@material-ui/core/Button';

import axios from 'axios';

// Translation
import data from '../texts/texts.json';

let lang = 'fi';
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}

moment.locale(lang);
const { statistics } = data;
const fin = localStorage.getItem('language');

const Statistics = () => {
  const [date, setDate] = useState(new Date());

  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [monthOptions, setMonthOptions] = useState({});
  const [monthSeries, setMonthSeries] = useState([]);

  const [dayOptions, setDayOptions] = useState({});
  const [daySeries, setDaySeries] = useState([]);
  const [dailyUsers, setDailyUsers] = useState([]);

  const [dayNumber, setDayNumber] = useState([]);

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
      setDailyUsers(dayResult);
      setMonthlyUsers(monthResult);
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    // Count monthly visitors
    let day = 1;
    let dayArray = [];
    monthlyUsers.forEach((user) => { // eslint-disable-line
      dayArray = dayArray.concat(day);
      day += 1;
    });
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
    // Count daily visitors
    let track = 1;
    let visitorArray = [];
    dailyUsers.forEach((user) => { // eslint-disable-line
      visitorArray = visitorArray.concat(track);
      track += 1;
    });
    // Options for the day chart
    setDayOptions({
      chart: { id: 'dayChart' },
      xaxis: {
        categories: visitorArray,
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
    setDaySeries([{
      name: 'visitors',
      data: dailyUsers,
    }]);
  }, [dailyUsers]);

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
    if (event !== undefined && event.type !== undefined && event.type === 'submit') {
      event.preventDefault();
    }
  };

  const countMonthlyVisitors = () => {
    let total = 0;
    monthlyUsers.forEach((day) => {
      total += day;
    });
    return total;
  };

  const handleDatePickChange = (newDate) => {
    const newDateObject = new Date(newDate);
    setDate(newDateObject);
    continueWithDate();
  };

  if (monthlyUsers?.length > 0) {
    const total = countMonthlyVisitors();

    return (
      <div className="container">
        {/* Section for selecting date */}
        <div className="firstSection">
          <form onSubmit={continueWithDate}>
            { /* Datepicker */}
            <MuiPickersUtilsProvider
              utils={MomentUtils}
              locale={lang}
            >
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

        {/* Header with arrows */}
        <Grid class="date-header">
          <div
            className="hoverHand arrow-left"
            onClick={previousDayClick}
          />
          <h1 className="headerText">
            {date.toLocaleDateString('fi-FI')}
          </h1>
          <div
            className="hoverHand arrow-right"
            onClick={nextDayClick}
          />
        </Grid>
        {/* Charts */}
        <div className="row">
          <div className="mixed-chart">
            {/* Labels */}
            <h2>{statistics.Day[fin]}</h2>
            <h3>
              {`${statistics.Total[fin]} ${date.toLocaleDateString('fi-FI')}: ${monthlyUsers[dayNumber - 1]}`}
            </h3>
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
              {`${statistics.Total[fin]} ${(date.getMonth() + 1)}/${date.getFullYear()}: ${total}`}
            </h3>
            <div className="line">
              <Chart
                options={monthOptions}
                series={monthSeries}
                type="line"
                width="700"
                height="400"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (<div />);
};

async function getMonthlyVisitors(firstDate, lastDate) {
  const query = `api/daterange/freeform/${firstDate}/${lastDate}`;
  const response = await axios.get(query);
  if (response) {
    // Form an array including the visitors of a certain month and return it
    let visitors = [];
    response.data.forEach((supervision) => {
      if (!supervision?.scheduleId) {
        visitors = visitors.concat(0);
      } else {
        let trackVisitors = 0;
        supervision.tracks.forEach((track) => {
          trackVisitors += track.scheduled.visitors;
        });
        visitors = visitors.concat(trackVisitors);
      }
    });
    return visitors;
  }
  return [];
}

async function getDailyVisitors(date) {
  const query = `api/daterange/freeform/${date}/${date}`;
  const response = await axios.get(query);
  if (response) {
    // Form an array including the visitors of a certain day and return it
    let visitors = [];
    response.data.forEach((supervision) => {
      if (!supervision?.scheduleId) {
        visitors = visitors.concat(0);
      } else {
        supervision.tracks.forEach((track) => {
          visitors = visitors.concat(track.scheduled.visitors);
        });
      }
    });
    return visitors;
  }
  return [];
}

export default Statistics;
