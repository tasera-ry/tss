import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Moment for date management
import moment from 'moment';
import api from '../api/api';
import {
  getSchedulingWeek,
  jumpToCurrent,
  getLanguage,
} from '../utils/Utils';
import exclamation from '@/assets/Info.png';
import Infoboxes from '../infoboxes/Infoboxes';
import InfoBox from '../infoBox/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';

// Translation
import texts from '../texts/texts.json';
import css from './Weekview.module.scss';

const classes = classNames.bind(css);

const { weekdayShorthand, week } = texts;
const fin = localStorage.getItem('language');
const lang = getLanguage();

const Weekview = (props) => {
  const [state, setState] = useState('loading');
  const [date, setDate] = useState(new Date());
  const [weekNro, setWeekNro] = useState(0);
  const [dayNro, setDayNro] = useState(0);
  const [yearNro, setYearNro] = useState(0);
  const [paivat, setPaivat] = useState(undefined);
  const [refresh, setRefresh] = useState(false);
  const [path, setPath] = useState('/');

  // Updates week to current when page loads
  useEffect(() => {
    getWeek();
    getYear();
    setRefresh(true);
  }, []);

  // Re-renders the component and fetches new data when the logo to frontpage is clicked on weekview
  /* eslint-disable-next-line */
  useEffect(() => {
    if (props.history.location.pathname != path) {
      setState('loading');
      getWeek();
      getYear();
      setRefresh(true);
      setPath(props.history.location.pathname);
    }
  }, [props]);

  // fetch data and refresh view
  useEffect(() => {
    if (refresh) {
      update();
      setRefresh(false);
    }
  }, [refresh]);

  // Changes week number state to previous one
  const previousWeekClick = (e) => {
    setState('loading');
    setPath(props.history.location.pathname);

    e.preventDefault();

    let newDay;

    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      let paramYear = urlParamDateSplit[0];
      let paramMonth = urlParamDateSplit[1];
      let paramDay = urlParamDateSplit[2];

      // if day between 1 and 9, adds zero to front for formatting purposes
      paramDay = paramDay.length == 1 ? '0' + paramDay : paramDay;

      // if month between 1 and 9, adds zero to front for formatting purposes
      paramMonth = paramMonth.length == 1 ? '0' + paramMonth : paramMonth;

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );

      newDay = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      newDay = moment(dayNro, 'YYYYMMDD');
    }

    newDay.subtract(1, 'week');

    const newWeek = newDay.week();

    try {
      const correctDay = new Date(date.getDate() - 7);
      props.history.replace(
        `/weekview/${moment(newDay, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      const weekNumber = moment(dayNro, 'YYYYMMDD').week();

      // Week logic cuz you can't go negative
      const newYear = weekNumber === 1 ? yearNro - 1 : yearNro;

      setDate(correctDay);
      setDayNro(newDay);
      setWeekNro(newWeek);
      setYearNro(newYear);
      setRefresh(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Changes week number state to next one
  const nextWeekClick = (e) => {
    setState('loading');
    setPath(props.history.location.pathname);

    e.preventDefault();

    let newDay;

    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      let paramYear = urlParamDateSplit[0];
      let paramMonth = urlParamDateSplit[1];
      let paramDay = urlParamDateSplit[2];

      // if day between 1 and 9, adds zero to front for formatting purposes
      paramDay = paramDay.length == 1 ? '0' + paramDay : paramDay;

      // if month between 1 and 9, adds zero to front for formatting purposes
      paramMonth = paramMonth.length == 1 ? '0' + paramMonth : paramMonth;

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );

      newDay = moment(paramDateCorrect, 'YYYYMMDD');
    } catch {
      newDay = moment(dayNro, 'YYYYMMDD');
    }

    newDay.add(1, 'week');
    const newWeek = newDay.week();

    try {
      const correctDay = new Date(date.getDate() + 7);
      props.history.replace(
        `/weekview/${moment(newDay, 'YYYYMMDD')
          .add(1, 'day')
          .toISOString()
          .substring(0, 10)}`,
      );

      // Week logic cuz there's no 53 weeks
      const newYear = newWeek === 1 ? yearNro + 1 : yearNro;

      setDate(correctDay);
      setDayNro(newDay);
      setWeekNro(newWeek);
      setYearNro(newYear);
      setRefresh(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Function for parsing current week number
  const getWeek = () => {
    const date1 = new Date();
    date1.setHours(0, 0, 0, 0);
    date1.setDate(date1.getDate() + 3 - ((date1.getDay() + 6) % 7)); // eslint-disable-line
    const week1 = new Date(date1.getFullYear(), 0, 4);
    const current =
      1 +
      Math.round(
        ((date1.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      ); // eslint-disable-line

    // Count correct weeknumber from URL
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');
      const weeknumber = moment(urlParamDate, 'YYYYMMDD').week();

      let paramDay = urlParamDateSplit[2].split('T')[0];
      let paramMonth = urlParamDateSplit[1];
      let paramYear = urlParamDateSplit[0];

      // if day between 1 and 9, adds zero to front for formatting purposes
      paramDay = paramDay.length == 1 ? '0' + paramDay : paramDay;

      // if month between 1 and 9, adds zero to front for formatting purposes
      paramMonth = paramMonth.length == 1 ? '0' + paramMonth : paramMonth;

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYY-MM-DD',
      );

      if (Number.isNaN(weeknumber)) {
        // eslint-disable-line
        setWeekNro(current);
        props.history.replace('/weekview/');
      } else {
        setWeekNro(weeknumber);
        setDate(paramDateCorrect);
      }
    } catch {
      setWeekNro(current);
      props.history.replace('/weekview/');
    }

    return current;
  };

  // Creates 7 columns for days
  const createWeekDay = () => {
    const table = [];
    let correctDay;
    let linkki;
    let dayNumber;

    if (paivat === undefined) {
      return;
    }

    for (let j = 0; j < 7; j += 1) {
      correctDay = paivat[j].date;
      linkki = `/dayview/${correctDay}`;

      dayNumber = j.toString();

      table.push(
        <Link key={dayNumber} className="link" to={linkki}>
          <p id="weekDay">
            {lang === 'en'
              ? weekdayShorthand[dayNumber][1]
              : lang === 'swe'
              ? weekdayShorthand[dayNumber][2]
              : weekdayShorthand[dayNumber][0]}
          </p>
        </Link>,
      );
    }

    return table; // eslint-disable-line
  };

  // Creates 7 columns for days
  const createDate = () => {
    const table = [];

    if (paivat === undefined) {
      return;
    }

    let oikeePaiva;
    let fixed;
    let newDate;
    let linkki;

    for (let j = 0; j < 7; j += 1) {
      oikeePaiva = paivat[j].date;
      fixed = oikeePaiva.split('-');
      newDate = `${fixed[2]}.${fixed[1]}.`;

      linkki = `/dayview/${oikeePaiva}`;
      table.push(
        <Link key={j} className="link" to={linkki}>
          <p style={{ fontSize: 'medium' }}>{newDate}</p>
        </Link>,
      );
    }

    return table; // eslint-disable-line
  };

  // Creates 7 columns for päävalvoja info, colored boxes
  const createColorInfo = () => {
    // If color blue, something is wrong
    let colorFromBackEnd = 'blue';
    const table = [];

    if (paivat === undefined) {
      return;
    }

    let rataStatus;
    let oikeePaiva;
    let linkki;
    let info;
    let arrivalTime;

    for (let j = 0; j < 7; j += 1) {
      // Set color
      rataStatus = paivat[j].rangeSupervision;

      if (rataStatus === 'present') {
        colorFromBackEnd = '#658f60';
      } else if (rataStatus === 'confirmed') {
        colorFromBackEnd = '#b2d9ad';
      } else if (rataStatus === 'not confirmed') {
        colorFromBackEnd = '#95d5db';
      } else if (rataStatus === 'en route') {
        colorFromBackEnd = '#f2c66d';
      } else if (rataStatus === 'closed') {
        colorFromBackEnd = '#c97b7b';
      } else if (rataStatus === 'absent') {
        colorFromBackEnd = '#f2f2f2';
      }

      oikeePaiva = paivat[j].date;
      info = false;
      arrivalTime = null;

      if (paivat[j].tracks) {
        // eslint-disable-next-line
        paivat[j].tracks.forEach((track) => {
          if (track.notice !== null && track.notice !== '') {
            info = true;
          }
        });
      }

      if (paivat[j].arriving_at !== null && rataStatus !== 'present') {
        info = true;
        arrivalTime = moment(paivat[j].arriving_at, 'HH:mm:ss').format('HH:mm');
      }

      linkki = `/dayview/${oikeePaiva}`;
      table.push(
        <Link
          key={j}
          style={{ backgroundColor: `${colorFromBackEnd}` }}
          className="link"
          to={linkki}
        >
          <p className={classes(css.infoBox)}>
            {arrivalTime && (
              <div className={classes(css.arrivalTime)}>ETA {arrivalTime}</div>
            )}
            {info ? (
              <img
                className={classes(css.exclamation2)}
                src={exclamation}
                alt={week.Notice[fin]}
              />
            ) : (
              <br />
            )}
          </p>
        </Link>,
      );
    }
    return table; // eslint-disable-line
  };

  const getYear = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    setYearNro(yyyy);
    return yyyy;
  };

  const update = () => {
    const requestSchedulingDate = async () => {
      try {
        const data = await api.getSchedulingDate(date);
        setDate(new Date(data.date));
      } catch (err) {
        console.error('getting info failed');
      }
    };

    requestSchedulingDate();

    let testi2;
    if (dayNro === 0) {
      let today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();

      today = `${yyyy}-${mm}-${dd}`;

      const testi = moment(yyyy + mm + dd, 'YYYYMMDD');

      setDayNro(testi);

      testi2 = testi.format('YYYY-MM-DD');
    } else {
      testi2 = dayNro.format('YYYY-MM-DD');
    }

    let date1 = testi2;

    const date2 = new Date();
    date2.setHours(0, 0, 0, 0);
    date2.setDate(date2.getDate() + 3 - ((date2.getDay() + 6) % 7)); // eslint-disable-line
    const week1 = new Date(date2.getFullYear(), 0, 4);
    const current =
      1 +
      Math.round(
        ((date2.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      ); // eslint-disable-line

    // Count correct weeknumber from URL
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const weeknumber = moment(urlParamDate, 'YYYYMMDD').week();

      let paramDay = urlParamDateSplit[2];
      let paramMonth = urlParamDateSplit[1];
      let paramYear = urlParamDateSplit[0];

      // if day between 1 and 9, adds zero to front for formatting purposes
      paramDay = paramDay.length == 1 ? '0' + paramDay : paramDay;

      // if month between 1 and 9, adds zero to front for formatting purposes
      paramMonth = paramMonth.length == 1 ? '0' + paramMonth : paramMonth;

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      ).toDate();

      if (Number.isNaN(weeknumber)) {
        // eslint-disable-line
        setWeekNro(current);
        const now = moment().format();
        props.history.replace(`/weekview/${now.substring(0, 10)}`);
      } else {
        setWeekNro(weeknumber);
        setDate(paramDateCorrect);
        setYearNro(paramYear);

        date1 = paramDateCorrect;
      }
    } catch {
      setWeekNro(current);
      props.history.replace('/weekview/');
    }

    const requestSchedulingWeek = async () => {
      const response = await getSchedulingWeek(date1);

      if (response) {
        setPaivat(response.week);
        setState('ready');
      } else console.error('getting info failed');
    };

    requestSchedulingWeek();
  };

  //const fin = localStorage.getItem('language'); // eslint-disable-line
  //const { week } = texts; // eslint-disable-line

  return (
    <div>
      <InfoBox />
      <div className={classes(css.container)}>
        <Grid className={classes(css.dateHeader)}>
          <div
            className={classes(css.hoverHand, css.arrowLeft)}
            onClick={previousWeekClick}
          />
          <h1 className={classes(css.dateHeaderText)}>
            {' '}
            {`${week.Week[fin]} ${weekNro}, ${yearNro}`}
          </h1>
          {/* Month if needed: {monthToString(date.getMonth())} */}
          <div
            className={classes(css.hoverHand, css.arrowRight)}
            onClick={nextWeekClick}
          />
        </Grid>
        <div className={classes(css.bigContainer)}>
          <div className={classes(css.viewChanger)}>
            <div className={classes(css.viewChangerCurrent)}>
              {jumpToCurrent()}
            </div>
            <div className={classes(css.viewChangerContainer)}>
              <ViewChanger />
            </div>
          </div>

          {/* Date boxes */}
          <Grid className={classes(css.flexContainer2)}>{createWeekDay()}</Grid>

          {/* Date boxes */}
          <Grid className={classes(css.flexContainer2)}>
            {state !== 'ready' ? '' : createDate()}
          </Grid>

          {/* Colored boxes for dates */}
          {state !== 'ready' ? (
            <div className={classes(css.progress)}>
              <CircularProgress disableShrink />
            </div>
          ) : (
            <Grid className={classes(css.flexContainer)}>
              {createColorInfo()}
            </Grid>
          )}
        </div>
      </div>

      {/* Infoboxes */}
      <Infoboxes />
    </div>
  );
};

export default Weekview;
