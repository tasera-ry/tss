import moment from 'moment';
import 'moment/locale/sv';
import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import api from '../api/api';
import colors from '../colors.module.scss';

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
    case 'closed':
      return colors.redLight;
    case 'absent':
      return colors.blackTint05;
    default:
      return 'blue';
  }
};

export function JumpToCurrent() {
  const fullUrl = window.location.href.split('/');
  // "/" renders the week view (App.tsx).
  const urlParamDate = fullUrl[4] || 'weekview';
  const today = new Date().toISOString().split('T')[0];
  // A route without a date shows today.
  const isToday = (fullUrl[5] || today) === today;

  // Shaped like the view tabs, but a lighter grey when on, so it never looks
  // like the active view tab.
  const baseStyle =
    'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors flex justify-center items-center';
  const activeStyle = 'bg-black-tint-20 border-black-tint-30 text-black';
  const inactiveStyle =
    'bg-white border-black-tint-20 text-grey hover:border-black-tint-40 hover:text-black';

  return (
    <Link
      className={`${baseStyle} ${isToday ? activeStyle : inactiveStyle}`}
      data-testid="jumpToCur"
      aria-current={isToday ? 'date' : undefined}
      to={`/${urlParamDate}/${today}`}
    >
      <Trans>Today</Trans>
    </Link>
  );
}

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
  association,
  arrivalTime,
) => {
  const failureText = 'general range supervision failure: Error: ';
  if (rsId === null || srsId === null)
    return `${failureText} reservation or schedule missing`;

  // only closed is different from the 6 states
  if (rangeStatus === 'closed') {
    try {
      await api.patchReservation(rsId, { available: 'false' });
      return true;
    } catch (err) {
      return `${failureText} reservation update failed`;
    }
  }

  // no range supervision exists, add new supervision
  if (!rsScheduled) {
    try {
      await api.patchReservation(rsId, { available: 'true' });
    } catch (err) {
      return `${failureText} not scheduled reserv fail`;
    }

    try {
      await api.addRangeSupervision(srsId, rangeStatus, association);
      return true;
    } catch (err) {
      return `${failureText} not scheduled superv fail`;
    }
  }

  // range suprevision exists, update supervision
  try {
    await api.patchReservation(rsId, { available: 'true' });
  } catch (err) {
    return `${failureText} scheduled reserv fail`;
  }

  try {
    await api.patchRangeSupervision(
      srsId,
      association
        ? {
            range_supervisor: rangeStatus,
            association,
            arriving_at: arrivalTime,
          }
        : { range_supervisor: rangeStatus, arriving_at: arrivalTime },
    );
    return true;
  } catch (err) {
    return `${failureText} scheduled superv fail`;
  }
};
