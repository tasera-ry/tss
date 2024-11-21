import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

// Material UI components
import { Link } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

// Moment for date management
import moment from 'moment';
import {
  viewChanger,
  jumpToCurrent,
  getSchedulingFreeform,
  checkColor,
} from '../utils/Utils';
import Infoboxes from '../infoboxes/Infoboxes';
import InfoBox from '../infoBox/InfoBox';
// Translation
import texts from '../texts/texts.json';
import css from './Monthview.module.scss';

const classes = classNames.bind(css);

const smallInfoIcon = require('../logo/Small-info.png');

const { weekdayShorthand, month } = texts; // eslint-disable-line
const fin = localStorage.getItem('language');

function Monthview(props)  {

  const [state, setState] = useState('loading');
  const [yearNro, setYearNro] = useState(0);
  const [monthNro, setMonthNro] = useState(0);
  const [daysTable, setDaysTable] = useState(undefined);

  const getYear = () => {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      if (paramYear.length === 4) {
        setYearNro(paramYear);
        return paramYear;
      }
    } catch {
      console.log('Error getting year from url');
    }
    const today = new Date(Date.now());
    const yyyy = today.getFullYear();
    setYearNro(yyyy);
    return yyyy;
  };

  const getMonth = () => {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];

      const urlParamDateSplit = urlParamDate.split('-');

      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      if (paramMonth.length === 2) {
        setMonthNro(paramMonth);
        return paramMonth;
      }
    } catch {
      console.log('Error getting month from url');
    }
    const today = new Date(Date.now());
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    setMonthNro(mm);
    return mm;
  };

  useEffect(() => {
    update();
    getYear();
    getMonth();
  }, [props]);

  const createWeekDay = () => {
    const table = [];
    let dayNumber;

    const fin = localStorage.getItem('language'); // eslint-disable-line
    const { month } = texts; // eslint-disable-line

    for (let j = 0; j < 8; j += 1) {
      dayNumber = j.toString();

      if (dayNumber === '0') {
        table.push(
          <div key="weekLabel" className={classes(css.weekNumber)}>
            {month.weekNumber[fin]}
          </div>,
        );
      } else {
        table.push(
          <div key={`weekDayLabel-${dayNumber}`}>
            {weekdayShorthand[dayNumber - 1][fin]}
          </div>,
        );
      }
    }

    return table;
  };

  const createMonthTable = () => {
    const requestSchedulingFreeform = async (date) => {
      const response = await getSchedulingFreeform(date);

      if (response) {
        setState('ready');
        setDaysTable(response.month);
      } else console.error('getting info failed');
    };

    const table = [];
    if (yearNro === 0) {
      return false;
    }

    let help = 0;
    const days = moment(
      `${yearNro}-${monthNro}`,
      'YYYY-MM',
    ).daysInMonth();
    const startDay = moment(
      `${yearNro}-${monthNro}-1`,
      'YYYY-MM-DD',
    );
    let firstMon = moment(
      `${yearNro}-${monthNro}-1`,
      'YYYY-MM-DD',
    );
    let info = false;

    const addDate = (target, isCurrent) => {
      const colorFromBackEnd = checkColor(daysTable, help);
      if (daysTable[help].tracks) {
        daysTable[help].tracks.forEach((track) => {
          if (track.notice !== null && track.notice !== '') {
            info = true;
          }
        });
      }
      help += 1;
      table.push(
        <Link
          key={`${isCurrent}-${firstMon.format('YYYY-MM-DD')}`}
          style={{ backgroundColor: `${colorFromBackEnd}` }}
          className={`${isCurrent}`}
          to={`/dayview/${firstMon.format('YYYY-MM-DD')}`}
        >
          {info ? (
            <div className={classes(css.monthviewDayImg)}>
              {target.date()}
              <img
                className={classes(css.MonthviewInfo)}
                src={smallInfoIcon}
                alt={month.Notice[fin]}
              />
            </div>
          ) : (
            <div className={classes(css.monthviewDayText)}>{target.date()}</div>
          )}
        </Link>,
      );
      target.add(1, 'days');
      info = false;
    };

    // safety loop incase of errors in name detection due to wrong locale, e.g. Sweden
    let safetyLoop = 0;

    while (
      firstMon.format('ddd') !== 'Mon' &&
      firstMon.format('ddd') !== 'ma' &&
      firstMon.format('ddd') !== 'mån'
    ) {
      firstMon = firstMon.subtract(1, 'days');
      if (safetyLoop > 7) {
        break;
      }
      safetyLoop += 1;
    }
    safetyLoop = 0;

    if(daysTable === undefined){
      requestSchedulingFreeform(firstMon.format('YYYY-MM-DD'));
      return false;
    }
    if(daysTable[0].date !== firstMon.format('YYYY-MM-DD')){
      requestSchedulingFreeform(firstMon.format('YYYY-MM-DD'));
    }

    // Check what is first monday and add days from that to start of month
    while (firstMon.format('ddd') !== startDay.format('ddd')) {
      addDate(firstMon, 'link notCurMonth');
    }

    // add days belonging to the month
    while (firstMon.format('D') < days) {
      addDate(firstMon, 'link');
    }

    addDate(firstMon, 'link');

    // add days until we get to end of week
    while (
      firstMon.format('ddd') !== 'Mon' &&
      firstMon.format('ddd') !== 'ma' &&
      firstMon.format('ddd') !== 'mån'
    ) {
      console.log(firstMon.format('ddd'))
      addDate(firstMon, 'link notCurMonth');
    }

    return table;
  };

  const createWeekNumber = () => {
    const table = [];
    const days = moment(
      `${yearNro}-${monthNro}`,
      'YYYY-MM',
    ).daysInMonth();
    let startWeek = moment(
      `${yearNro}-${monthNro}-1`,
      'YYYY-MM-DD',
    ).isoWeek();
    const startHelp = moment(
      `${yearNro}-${monthNro}-1`,
      'YYYY-MM-DD',
    );
    const endWeek = moment(
      `${yearNro}-${monthNro}-${days}`,
      'YYYY-MM-DD',
    ).isoWeek();
    const link = moment(
      `${yearNro}-${monthNro}-1`,
      'YYYY-MM-DD',
    );

    if (yearNro === 0) {
      return false;
    }

    while (startHelp.isoWeek() !== endWeek) {
      table.push(
        <Link
          key={startWeek}
          className="link"
          to={`/weekview/${link.format('YYYY-MM-DD')}`}
        >
          <div>{startWeek}</div>
        </Link>,
      );
      link.add(1, 'weeks');
      startHelp.add(1, 'weeks');
      startWeek = startHelp.isoWeek();
    }

    table.push(
      <Link
        key={startWeek}
        className="link"
        to={`/weekview/${link.format('YYYY-MM-DD')}`}
      >
        <div>{startWeek}</div>
      </Link>,
    );

    return table;
  };

  const previousMonthClick = (e) => {
    
    setState('loading');

    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.subtract(1, 'month');
      props.history.replace(
        `/monthview/${paramDateCorrect.toISOString().substring(0, 10)}`,
      ); // eslint-disable-line
      setMonthNro(paramMonth);
      setYearNro(paramYear);
      update();
    } catch (err) {
      console.error(err);
      update();
    }
  };

  const nextMonthClick = (e) => {

    setState('loading');

    e.preventDefault();
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');
      const paramDay = urlParamDateSplit[2];

      const paramDateCorrect = moment(
        paramYear + paramMonth + paramDay,
        'YYYYMMDD',
      );
      paramDateCorrect.add(1, 'days');
      paramDateCorrect.add(1, 'month');
      props.history.replace(
        `/monthview/${paramDateCorrect.toISOString().substring(0, 10)}`,
      ); // eslint-disable-line
      setMonthNro(paramMonth);
      setYearNro(paramYear);
      update();
    } catch (err) {
      console.error(err);
      update();
    }
  };

  const update = () => {
    try {
      const fullUrl = window.location.href.split('/');
      const urlParamDate = fullUrl[5];
      const urlParamDateSplit = urlParamDate.split('-');

      const paramYear = urlParamDateSplit[0];
      const paramMonth = urlParamDateSplit[1].padStart(2, '0');

      if (
        paramMonth === monthNro &&
        paramYear === yearNro
      ) {
        setState('ready');
      }
      if (
        (paramMonth !== monthNro && monthNro !== 0) ||
        (paramYear !== 0 && paramYear !== yearNro)
      ) {
        setMonthNro(paramMonth);
        setYearNro(paramYear);
      }
    } catch (err) {
      const date = new Date(Date.now());
      const paramMonth = String(date.getMonth() + 1).padStart(2, '0');
      setMonthNro(paramMonth);
      setYearNro(date.getYear());
      console.error(err);
      props.history.replace(
        `/Monthview/${date.toISOString().substring(0, 10)}`,
      );
    }
  }

  const fin = localStorage.getItem('language'); // eslint-disable-line
  const { month } = texts; // eslint-disable-line
  const monthTable = createMonthTable();
  return (
    <div>
      <InfoBox />
      {state !== 'ready' ? (
        <div className={classes(css.progress)}>
          <CircularProgress size="25vw" disableShrink />
        </div>
      ) : (
        <div>
          <div className={classes(css.dateHeaderM)}>
            <div
              className={classes(css.hoverHand, css.arrowLeft)}
              onClick={previousMonthClick}
              data-testid="previousMonth"
            />
            <h1 className={classes(css.dateHeaderText)}>
              {`${month[monthNro][fin]},`} {yearNro}
            </h1>
            <div
              className={classes(css.hoverHand, css.arrowRight)}
              onClick={nextMonthClick}
              data-testid="nextMonth"
            />
          </div>

          <div className={classes(css.monthContainer)}>
            <div className={classes(css.viewChanger)}>
              <div className={classes(css.viewChangerCurrent)}>
                {jumpToCurrent()}
              </div>
              <div className={classes(css.viewChangerContainer)}>
                {viewChanger()}
              </div>
            </div>
            
            <div className={classes(css.weekdays)}>
              {createWeekDay()}
            </div>
            
            <div className={classes(css.weekNumber)}>
              {createWeekNumber()}
            </div>
            
            <div className={classes(css.monthDays)}>{monthTable}</div>
          
          </div>
          <Infoboxes />
        </div>
      )}
    </div>
  );
}

export default Monthview;
