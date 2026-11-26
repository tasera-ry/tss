const SunCalc = require('suncalc');
const moment = require('moment-timezone');

const RANGE_LATITUDE = 61.403452453132466;
const RANGE_LONGITUDE = 23.64142961367598;
const RANGE_TIME_ZONE = 'Europe/Helsinki';

module.exports = function getSunset(dateString) {
  if (!moment(dateString, 'YYYY-MM-DD', true).isValid()) {
    throw new TypeError('Expected date in YYYY-MM-DD format');
  }

  // Use UTC noon so the requested calendar date is independent of server timezone.
  const date = new Date(`${dateString}T12:00:00Z`);
  const sunset = SunCalc.getTimes(
    date,
    RANGE_LATITUDE,
    RANGE_LONGITUDE,
  ).sunset;

  if (!Number.isFinite(sunset.getTime())) return null;

  return moment(sunset).tz(RANGE_TIME_ZONE).format('HH:mm:ss');
};