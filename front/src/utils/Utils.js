import React from 'react';
import moment from 'moment';
import 'moment/locale/sv';
import { Link } from 'react-router-dom';
import api from '../api/api';
import texts from '../texts/texts.json';
import colors from '../colors.module.scss';

export const dateToString = (d) => {
  const month = d.getMonth() + 1;
  const date = d.getDate();
  
  return `${d.getFullYear()}-${month < 10 ? '0' : ''}${month}-${date < 10 ? '0' : ''}${date}`;
}
/**
 * Increments or decrements the date by the param amount
 * @param {Date} date The date to be incemented or decremented
 * @param {number} amountOfDays The amount of days to increment or decrement.
 * Give a negative number for decrement.
 * @returns {Date} new date
 */
export const incrementOrDecrementDate = (date, amountOfDays) =>
  new Date(date.setDate(date.getDate() + amountOfDays));

export const getSchedulingWeek = async (date) => {
  try {
    const weekNum = moment(date, 'YYYY-MM-DD').isoWeek();
    const begin = moment(date, 'YYYY-MM-DD').startOf('isoWeek');
    const end = moment(date, 'YYYY-MM-DD').endOf('isoWeek');

    const current = moment(begin);
    moment.prototype.add.bind(current, 1, 'day');

    const week = await api.getSchedulingWeek(begin);

    return {
      weekNum,
      weekBegin: begin.format('YYYY-MM-DD'),
      weekEnd: end.format('YYYY-MM-DD'),
      week,
    };
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const getSchedulingFreeform = async (date) => {
  try {
    const begin = moment(date, 'YYYY-MM-DD');
    const end = moment(date, 'YYYY-MM-DD');
    end.add(45, 'days');
    const month = await api.getSchedulingFreeform(begin, end);

    return { month };
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const checkColor = (days, oneDay) => {
  const { rangeSupervision: trackStatus } = days[oneDay];

  switch (trackStatus) {
    case 'present':
      return colors.green;
    case 'confirmed':
      return colors.greenLight;
    case 'not confirmed':
      return colors.turquoise;
    case 'en route':
      return colors.orange;
    case 'closed':
      return colors.redLight;
    case 'absent':
      return colors.blackTint05;
    default:
      return 'blue';
  }
};

export const viewChanger = () => {
  const { viewChanger } = texts; // eslint-disable-line
  const lang = localStorage.getItem('language');
  const table = [];

  try {
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[5];

    // When first access to '/' (no params in URL)
    let paramDay = '';
    let paramMonth = '';
    let paramYear = '';
    if (urlParamDate) {
      const urlParamDateSplit = urlParamDate.split('-');
      [paramYear, paramMonth, paramDay] = urlParamDateSplit;
      [paramDay] = paramDay.split('T');
    } else {
      throw 'No valid URL'; // eslint-disable-line
    }

    const time = `${paramYear}-${paramMonth}-${paramDay}`;

    table.push(
      <Link key="month" className="link" to={`/monthview/${time}`}>
        <div>{viewChanger.Month[lang]}</div>
      </Link>,
    );
    table.push(
      <Link key="week" className="link" to={`/weekview/${time}`}>
        <div>{viewChanger.Week[lang]}</div>
      </Link>,
    );
    table.push(
      <Link key="day" className="link" to={`/dayview/${time}`}>
        <div>{viewChanger.Day[lang]}</div>
      </Link>,
    );
    return table;
  } catch (err) {
    console.error(err);
    const date = new Date(Date.now());
    const time = moment(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      'YYYY-MM-DD',
    );
    table.push(
      <Link
        className="link"
        key="1"
        to={`/monthview/${time.format('YYYY-MM-DD')}`}
      >
        <div>{viewChanger.Month[lang]}</div>
      </Link>,
    );
    table.push(
      <Link
        className="link"
        key="2"
        to={`/weekview/${time.format('YYYY-MM-DD')}`}
      >
        <div>{viewChanger.Week[lang]}</div>
      </Link>,
    );
    table.push(
      <Link
        className="link"
        key="3"
        to={`/dayview/${time.format('YYYY-MM-DD')}`}
      >
        <div>{viewChanger.Day[lang]}</div>
      </Link>,
    );
    return table;
  }
};

export const jumpToCurrent = () => {
  const { viewChanger } = texts; // eslint-disable-line
  const lang = localStorage.getItem('language');

  try {
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[4];
    const date = new Date(Date.now());
    return (
      <Link
        className="link"
        data-testid="jumpToCur"
        to={`/${urlParamDate}/${moment(date, 'YYYY-MM-DD')
          .toISOString()
          .substring(0, 10)}`}
      >
        <div>{viewChanger.JumpToCurrent[lang]}</div>
      </Link>
    );
  } catch (err) {
    console.error(err);
    return false;
  }
};

// english, swedish and finnish are supported
export const getLanguage = () => {
  if (localStorage.getItem('language') === '1') return 'en';
  else if (localStorage.getItem('language') === '2') return 'sv';
  return 'fi';
};

export const dayToString = (i) => {
  const lang = getLanguage();
  console.log(lang)
  moment.locale(lang);
  // en has different number for start date compared to fi and swe
  if (lang !== 'en') i -= 1; // eslint-disable-line
  const dayString = moment().weekday(i).format('dddd');
  console.log(dayString)
  // first letter only to uppercase
  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
};

export const monthToString = (i) => {
  const lang = getLanguage();
  moment.locale(lang);
  return moment().month(i).format('MMMM');
};

/*
  Validates the login token (in cookies)

  return: boolean, is token valid (true = yes)
*/
export const validateLogin = async () => {
  try {
    await api.validateLogin();
    return true;
  } catch (err) {
    return false;
  }
};

// on success true
// else returns string trying to explain what broke
// requires reservation and schedule to exist
export const updateRangeSupervision = async (
  rsId,
  srsId,
  rangeStatus,
  rsScheduled,
  supervisor,
) => {
  const failureText = 'general range supervision failure: Error: ';
  if (rsId === null || srsId === null)
    return failureText + 'reservation or schedule missing';

  // only closed is different from the 6 states
  if (rangeStatus === 'closed') {
    try {
      await api.patchReservation(rsId, { available: 'false' });
      return true;
    } catch (err) {
      return failureText + 'reservation update failed';
    }
  }

  // no range supervision exists, add new supervision
  if (!rsScheduled) {
    try {
      await api.patchReservation(rsId, { available: 'true' });
    } catch (err) {
      return failureText + 'not scheduled reserv fail';
    }

    try {
      await api.addRangeSupervision(srsId, rangeStatus, supervisor);
      return true;
    } catch (err) {
      return failureText + 'not scheduled superv fail';
    }
  }

  // range suprevision exists, update supervision
  try {
    await api.patchReservation(rsId, { available: 'true' });
  } catch (err) {
    return failureText + 'scheduled reserv fail';
  }

  try {
    await api.patchRangeSupervision(
      srsId,
      supervisor
        ? { range_supervisor: rangeStatus, supervisor }
        : { range_supervisor: rangeStatus },
    );
    return true;
  } catch (err) {
    return failureText + 'scheduled superv fail';
  }
};
