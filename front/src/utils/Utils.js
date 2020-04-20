import moment from 'moment';
import lodash from 'lodash';

export async function getSchedulingDate(date) {
  try{
    let response = await fetch("/api/datesupreme/"+moment(date).format('YYYY-MM-DD'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }catch(err){
    console.error(err);
    return false;
  }
}

export async function getSchedulingWeek(date) {
  try {
    const weekNum = moment(date, "YYYY-MM-DD").isoWeek();
    const begin = moment(date, "YYYY-MM-DD").startOf('isoWeek');
    const end = moment(date, "YYYY-MM-DD").endOf('isoWeek');

    const current = moment(begin);
    const next = moment.prototype.add.bind(current, 1, 'day');

    const week = await Promise.all(lodash.times(7, (i) => {
      const request = getSchedulingDate(current);
      next();
      return request;
    }));

    return {
      weekNum: weekNum
      , weekBegin: begin.format('YYYY-MM-DD')
      , weekEnd: end.format('YYYY-MM-DD')
      , week: week
    };
  } catch(err) {
    console.error(err);
    return false;
  }
}

export function dayToString(i) {
  if (i === 1) {
    return "Maanantai";
  }
  if (i === 2) {
    return "Tiistai";
  }
  if (i === 3) {
    return "Keskiviikko";
  }
  if (i === 4) {
    return "Torstai";
  }
  if (i === 5) {
    return "Perjantai";
  }
  if (i === 6) {
    return "Lauantai";
  }
  if (i === 0) {
    return "Sunnuntai";
  }
}

export function monthToString(i) {
  if (i === 0) {
    return "Tammikuu";
  }
  if (i === 1) {
    return "Helmikuu";
  }
  if (i === 2) {
    return "Maaliskuu";
  }
  if (i === 3) {
    return "Huhtikuu";
  }
  if (i === 4) {
    return "Toukokuu";
  }
  if (i === 5) {
    return "Kesäkuu";
  }
  if (i === 6) {
    return "Heinäkuu";
  }
  if (i === 7) {
    return "Elokuu";
  }
  if (i === 8) {
    return "Syyskuu";
  }
  if (i === 9) {
    return "Lokakuu";
  }
  if (i === 10) {
    return "Marraskuu";
  }
  if (i === 11) {
    return "Joulukuu";
  }
}
