import React from 'react';

import moment from 'moment';
import axios from 'axios';
import { Link } from 'react-router-dom';

import texts from '../texts/texts.json';

export async function getSchedulingDate(date) {
  try {
    const response = await fetch(`/api/datesupreme/${moment(date).format('YYYY-MM-DD')}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getSchedulingWeek(date) {
  try {
    const weekNum = moment(date, 'YYYY-MM-DD').isoWeek();
    const begin = moment(date, 'YYYY-MM-DD').startOf('isoWeek');
    const end = moment(date, 'YYYY-MM-DD').endOf('isoWeek');

    const current = moment(begin);
    moment.prototype.add.bind(current, 1, 'day');

    const resp = await axios.get(`/api/daterange/week/${moment(begin).format('YYYY-MM-DD')}`);

    /*
    const week = await Promise.all(lodash.times(7, (i) => {
      const request = getSchedulingDate(current);
      next();
      return request;
    }));
    */

    return {
      weekNum,
      weekBegin: begin.format('YYYY-MM-DD'),
      weekEnd: end.format('YYYY-MM-DD'),
      week: resp.data,
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
    const longrange = await axios.get(`/api/daterange/freeform/${moment(begin).format('YYYY-MM-DD')}/${moment(end).format('YYYY-MM-DD')}`);
    return {
      month: longrange.data,
    };
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
  const { viewChanger } = texts;  // eslint-disable-line
  const fin = localStorage.getItem('language');

  try {
    const table = [];
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[5];

    const urlParamDateSplit = urlParamDate.split('-');

    const paramDay = urlParamDateSplit[2].split('T')[0];
    const paramMonth = urlParamDateSplit[1];
    const paramYear = urlParamDateSplit[0];

    const time = moment(`${paramYear}-${paramMonth}-${paramDay}`, 'YYYY-MM-DD');

    table.push(
      <Link class="link" to={`/monthView/${time.format('YYYY-MM-DD')}`}>
        <div>
          {viewChanger.Month[fin]}
        </div>
      </Link>,
    );
    table.push(
      <Link class="link" to={`/weekView/${time.format('YYYY-MM-DD')}`}>
        <div>
          {viewChanger.Week[fin]}
        </div>
      </Link>,
    );
    table.push(
      <Link class="link" to={`/dayView/${time.format('YYYY-MM-DD')}`}>
        <div>
          {viewChanger.Day[fin]}
        </div>
      </Link>,
    );
    return table;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function jumpToCurrent() {
  const { viewChanger } = texts;  // eslint-disable-line
  const fin = localStorage.getItem('language');

  try {
    const table = [];
    const fullUrl = window.location.href.split('/');
    const urlParamDate = fullUrl[4];

    const date = new Date();

    table.push(
      <Link class="link" to={`/${urlParamDate}/${moment(date, 'YYYY-MM-DD').toISOString().substring(0, 10)}`}>
        <div>
          {viewChanger.JumpToCurrent[fin]}
        </div>
      </Link>,
    );
    return table;
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
  let response;
  try {
    response = await fetch('/api/validate', {
      method: 'GET',
    });
  } catch (error) {
    return false;
  }

  if (response && response.status && response.status === 200) {
    return true;
  }

  return false;
}

// on success true
// else returns string trying to explain what broke
// requires reservation and schedule to exist
export async function rangeSupervision(rsId, srsId, rangeStatus, rsScheduled, supervisor) {
  try {
    if (rsId !== null && srsId !== null) {
      // only closed is different from the 6 states
      if (rangeStatus !== 'closed') {
        // range supervision exists
        if (rsScheduled) {
          // changing supervision force reservation open
          await fetch(`/api/reservation/${rsId}`, {
            method: 'PUT',
            body: JSON.stringify({ available: true }),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            .then((status) => {
              if (!status.ok) throw new Error('scheduled reserv fail');
            });

          // update supervision
          await fetch(`/api/range-supervision/${srsId}`, {
            method: 'PUT',
            body: JSON.stringify({ range_supervisor: rangeStatus, supervisor }),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            .then((status) => {
              if (!status.ok) throw new Error('scheduled superv fail');
            });
        } else { // no supervision exists
          // changing supervision force reservation open
          await fetch(`/api/reservation/${rsId}`, {
            method: 'PUT',
            body: JSON.stringify({ available: true }),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            .then((status) => {
              if (!status.ok) throw new Error('not scheduled reserv fail');
            });

          // add new supervision
          await fetch('/api/range-supervision', {
            method: 'POST',
            body: JSON.stringify({
              scheduled_range_supervision_id: srsId,
              range_supervisor: rangeStatus,
              supervisor,
            }),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            .then((status) => {
              if (!status.ok) throw new Error('not scheduled superv fail');
            });
        }
      } else {
        // range closed update reservation
        await fetch(`/api/reservation/${rsId}`, {
          method: 'PUT',
          body: JSON.stringify({ available: 'false' }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
          .then((status) => {
            if (!status.ok) throw new Error('reservation update failed');
          });
      }
    } else throw new Error('reservation or schedule missing');
  } catch (e) {
    return `general range supervision failure: ${e}`;
  }
  return true;
}
