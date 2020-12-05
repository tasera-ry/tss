import React, { useState, useEffect } from 'react';
import Chart from "react-apexcharts";
import '../App.css';
import './Statistics.css';

// Date management
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/fi';

// Material UI components
import Grid from '@material-ui/core/Grid';

// Utils
import { dayToString, getSchedulingDate } from '../utils/Utils';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import Button from '@material-ui/core/Button';

import axios from 'axios';

import '../App.css';

// Translation
import data from '../texts/texts.json';

let lang = 'fi'; // fallback
if (localStorage.getItem('language') === '0') {
  lang = 'fi';
} else if (localStorage.getItem('language') === '1') {
  lang = 'en';
}
moment.locale(lang);

const Statistics = () => {
  const [ date, setDate] = useState(new Date());

  const [ monthlyUsers, setMonthlyUsers] = useState([]);
  const [ monthOptions, setMonthOptions] = useState({});
  const [ monthSeries, setMonthSeries] = useState([]);

  const [ dayOptions, setDayOptions] = useState({});
  const [ daySeries, setDaySeries] = useState([]);
  const [ dailyUsers, setDailyUsers] = useState([]);

  const [ dayNumber, setDayNumber] = useState([]);

  useEffect( () => {
    const firstDate = moment(date).startOf("month").format("YYYY-MM-DD");
    const lastDate = moment(date).endOf("month").format("YYYY-MM-DD");
    const singleDay = moment(date).format("YYYY-MM-DD");

    const dayNumberSplit = singleDay.split('-');
    let dayNum = dayNumberSplit[2];
    dayNum = dayNum.startsWith("0") ? dayNum.substring(1) : dayNum;
    setDayNumber(dayNum);

    const fetchData = async () => {
      const result = await getVisitors(firstDate, lastDate);
      const result2 = await getDailyVisitors(singleDay);
      console.log(result2);
      setDailyUsers(result2);
      setMonthlyUsers(result);
    }
    fetchData();

  },[date])

  useEffect( () => {
    let day = 1;
    let dayArray = [];
    monthlyUsers.forEach((user) => {
      dayArray = dayArray.concat(day);
      day += 1;
    });
    console.log(dayArray);
    setMonthOptions({chart:{id:"monthChart"}, xaxis: {categories:dayArray}});
    setMonthSeries([{name:"visitors", data:monthlyUsers}]);
  
  }, [monthlyUsers])

  useEffect( () => {
    let track = 1;
    let visitorArray = [];
    dailyUsers.forEach((user) => {
      visitorArray = visitorArray.concat(track);
      track += 1;
    });
    console.log("visitorArray: ", visitorArray);
    setDayOptions({chart:{id:"dayChart"}, xaxis: {categories:visitorArray}});
    setDaySeries([{name:"visitors", data:dailyUsers}]);
  
  }, [dailyUsers])

  const previousDayClick = () => {
    console.log("date aluksi:", date);
    const newDate = new Date(date);

    date.setDate(newDate.getDate() - 1);
    console.log("date jälkeen:", date);
  };

  const nextDayClick = () => {
    console.log("date aluksi:", date);
    const newDate = new Date(date);

    date.setDate(newDate.getDate() + 1);
    console.log("date jälkeen:", date);
  };

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    setDate(newDate);
  };

  const continueWithDate = (event) => {
    if (event !== undefined && event.type !== undefined && event.type === 'submit') {
      event.preventDefault();
    }
  }

  const countMonthlyVisitors = () => {
    let total = 0;
    monthlyUsers.forEach((day) => {
      total = total + day;
    });
    return total;
  }


  const handleDatePickChange = (date) => {
    const newDate = new Date(date);
    setDate(newDate);
    continueWithDate();
  };

  if (monthlyUsers?.length > 0) {
    //console.log(monthSeries);
    //console.log(monthOptions);

    const { sched } = data;
    const fin = localStorage.getItem('language');

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
              label={sched.Day[fin]}
              value={date}
              onChange={(date) => handleDateChange(date)}
              onAccept={handleDatePickChange}
              format="DD.MM.YYYY"
              showTodayButton
            />
          </MuiPickersUtilsProvider>
          <div className="continue">
            <Button type="submit" variant="contained" style={{ backgroundColor: '#d1ccc2' }}>{sched.Day[fin]}</Button>
          </div>
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
          <h2>Tämä päivä</h2>
          <h3>Yhteensä kävijöitä {date.toLocaleDateString('fi-FI')}: {monthlyUsers[dayNumber - 1]}</h3>
          <div classname="bar">
            <Chart
                options={dayOptions}
                series={daySeries}
                type="bar"
                width="600"
            />
            </div>
              <h2>Tämä kuukausi</h2>
              <h3>Yhteensä kävijöitä{(date.getMonth()+1)}/{date.getFullYear()}: {total}</h3>
            <div className="line">
            <Chart
                options={monthOptions}
                series={monthSeries}
                type="line"
                width="600"
            />
            </div>
        </div>
      </div>
    </div>
    )
  }
  return (<div></div>);
}

async function getVisitors(firstDate, lastDate) {
  
  const query = `api/daterange/freeform/${firstDate}/${lastDate}`;
  const response = await axios.get(query);
  if (response) {
    let visitors = [];
    response.data.forEach(supervision => {
      if (!supervision?.scheduleId) {
        visitors = visitors.concat(0);
      } else {
        let trackVisitors = 0;
        supervision.tracks.forEach (track => {
          trackVisitors += track.scheduled.visitors;
        })
        visitors = visitors.concat(trackVisitors);
      }
    })
    console.log(visitors);
    return visitors;
  }
}

async function getDailyVisitors(date) {
  
  const query = `api/daterange/freeform/${date}/${date}`;
  const response = await axios.get(query);
  if (response) {
    let visitors = [];
    response.data.forEach(supervision => {
      if (!supervision?.scheduleId) {
        visitors = visitors.concat(0);
      } else {
        supervision.tracks.forEach (track => {
          visitors = visitors.concat(track.scheduled.visitors);
        })
      }
    })
    console.log(visitors);
    return visitors;
  }
}

export default Statistics;