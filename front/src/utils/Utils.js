import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import api from '../api/api';
import texts from '../texts/texts.json';

export async function getSchedulingWeek(date) {
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
}

export async function getSchedulingFreeform(date) {
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
}

export function checkColor(paivat, paiva) {
  const rataStatus = paivat[paiva].rangeSupervision;
  let colorFromBackEnd = 'blue';

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
    colorFromBackEnd = '#f2f0eb';
  }
  return colorFromBackEnd;
}

export function viewChanger() {
  const { viewChanger } = texts; // eslint-disable-line
  const fin = localStorage.getItem('language');
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
        <div>{viewChanger.Month[fin]}</div>
      </Link>,
    );
    table.push(
      <Link key="week" className="link" to={`/weekview/${time}`}>
        <div>{viewChanger.Week[fin]}</div>
      </Link>,
    );
    table.push(
      <Link key="day" className="link" to={`/dayview/${time}`}>
        <div>{viewChanger.Day[fin]}</div>
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
        <div>{viewChanger.Month[fin]}</div>
      </Link>,
    );
    table.push(
      <Link
        className="link"
        key="2"
        to={`/weekview/${time.format('YYYY-MM-DD')}`}
      >
        <div>{viewChanger.Week[fin]}</div>
      </Link>,
    );
    table.push(
      <Link
        className="link"
        key="3"
        to={`/dayview/${time.format('YYYY-MM-DD')}`}
      >
        <div>{viewChanger.Day[fin]}</div>
      </Link>,
    );
    return table;
  }
}

export function jumpToCurrent() {
  const { viewChanger } = texts; // eslint-disable-line
  const fin = localStorage.getItem('language');

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
        <div>{viewChanger.JumpToCurrent[fin]}</div>
      </Link>
    );
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function dayToString(i) {
  let lang = 'fi'; // fallback
  if (localStorage.getItem('language') === '0') {
    lang = 'fi';
  } else if (localStorage.getItem('language') === '1') {
    lang = 'en';
  }
  moment.locale(lang);
  // en/fi have different numbers for start date
  if (lang === 'fi') i -= 1; // eslint-disable-line
  const dayString = moment().weekday(i).format('dddd');
  // first letter only to uppercase
  return dayString.charAt(0).toUpperCase() + dayString.slice(1);
}

export function monthToString(i) {
  let lang = 'fi'; // fallback
  if (localStorage.getItem('language') === '0') {
    lang = 'fi';
  } else if (localStorage.getItem('language') === '1') {
    lang = 'en';
  }
  moment.locale(lang);
  return moment().month(i).format('MMMM');
}

/*
  Validates the login token (in cookies)

  return: boolean, is token valid (true = yes)
*/
export async function validateLogin() {
  try {
    const res = await api.validateLogin();
    return true;
  } catch (err) {
    return false;
  }
}

// on success true
// else returns string trying to explain what broke
// requires reservation and schedule to exist
export async function updateRangeSupervision(
  rsId,
  srsId,
  rangeStatus,
  rsScheduled,
  supervisor,
) {
  if (rsId === null || srsId === null)
    throw new Error('reservation or schedule missing');

  // only closed is different from the 6 states
  if (rangeStatus === 'closed') {
    try {
      await api.patchReservation(rsId, { available: 'false' });
      return true;
    } catch (err) {
      throw new Error('reservation update failed');
    }
  }

  // no range supervision exists
  if (!rsScheduled) {
    try {
      await api.patchReservation(rsId, { available: 'true' });
    } catch (err) {
      throw new Error('not scheduled reserv fail');
    }

    try {
      await api.addRangeSupervision(srsId, rangeStatus, supervisor);
      return true;
    } catch (err) {
      throw new Error('not scheduled superv fail');
    }
  }

  // range suprevision exists, update supervision
  try {
    await api.patchReservation(rsId, { available: 'true' });
  } catch (err) {
    throw new Error('scheduled reserv fail');
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
    throw new Error('scheduled superv fail');
  }
}
