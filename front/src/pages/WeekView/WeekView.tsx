import classNames from 'classnames';
import { useCallback, useMemo } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import { Link, useHistory, useParams } from 'react-router-dom';

import exclamation from '@/assets/Info.png';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { JumpToCurrent, getSchedulingWeek } from '@/utils/Utils';
import moment from 'moment';
import { TableLegends } from '../../TableLegends/TableLegends';

import { DateHeader } from '@/lib/components/DateHeader';
import type { DaySchedule } from '@/types';
import { Weekday } from '@/utils/dateUtils';
import { useLingui } from '@lingui/react/macro';
import { useQuery } from 'react-query';
import css from './WeekView.module.scss';

const classes = classNames.bind(css);

export const Weekview = () => {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();

  const targetDate = useMemo(() => {
    return dateParam ?? moment().format('YYYY-MM-DD');
  }, [dateParam]);

  const { data } = useQuery({
    queryKey: ['weekview', targetDate],
    queryFn: () => getSchedulingWeek(targetDate),
  });

  const previousWeekClick = useCallback(() => {
    history.push(
      `/weekview/${moment(targetDate).subtract(1, 'week').format('YYYY-MM-DD')}`,
    );
  }, [targetDate, history.push]);

  const nextWeekClick = useCallback(() => {
    history.push(
      `/weekview/${moment(targetDate).add(1, 'week').format('YYYY-MM-DD')}`,
    );
  }, [targetDate, history.push]);

  return (
    <div>
      <InfoBox />
      <div className={classes(css.container)}>
        <DateHeader
          targetDate={targetDate}
          onPrevious={previousWeekClick}
          onNext={nextWeekClick}
          type="week"
        />
        <div className={classes(css.bigContainer)}>
          <div className={classes(css.viewChanger)}>
            <JumpToCurrent />
            <ViewChanger />
          </div>
          {!data ? (
            <div className={classes(css.progress)}>
              <CircularProgress disableShrink />
            </div>
          ) : (
            <>
              <CalenderHeader days={data.week} />
              <CalenderBody days={data.week} />
            </>
          )}
        </div>
      </div>
      <TableLegends />
    </div>
  );
};

function CalenderHeader({ days }: { days: DaySchedule[] }) {
  const { t } = useLingui();
  const weekdays = useMemo(() => {
    if (!days) return [];
    return Array.from({ length: 7 }, (_, i) => {
      return {
        dayNumber: i,
        link: `/dayview/${days[i]?.date}`,
      };
    });
  }, [days]);

  return (
    <div className="grid grid-cols-7 justify-center bg-black-tint-70 border-[3px] border-black-tint-70 rounded-t-sm pt-2">
      {weekdays.map((day) => (
        <Link
          key={day.dayNumber}
          to={day.link}
          className="flex flex-col gap-1 items-center justify-center text-white"
        >
          <span>
            <Weekday date={days[day.dayNumber]?.date} weekday="short" />
          </span>
          <span id="weekDay">
            {moment(days[day.dayNumber]?.date).format('DD.MM')}
          </span>
        </Link>
      ))}
    </div>
  );
}

function CalenderBody({ days }: { days: DaySchedule[] }) {
  return (
    <div className="grid grid-cols-7 bg-[#4d4d4d] rounded-b p-[2px]">
      {days.map((day) => (
        <CalenderCell key={day.date} day={day} />
      ))}
    </div>
  );
}

function CalenderCell({ day }: { day: DaySchedule }) {
  const { t } = useLingui();
  const color = useMemo(() => {
    switch (day.rangeSupervision) {
      case 'present':
        return '#658f60';
      case 'confirmed':
        return '#b2d9ad';
      case 'not confirmed':
        return '#95d5db';
      case 'en route':
        return '#f2c66d';
      case 'closed':
        return '#c97b7b';
      case 'absent':
        return '#f2f2f2';
      default:
        return '#f2f2f2';
    }
  }, [day.rangeSupervision]);

  const trackNotice = useMemo(() => {
    return day.tracks.some(
      (track) => track.notice !== null && track.notice !== '',
    );
  }, [day.tracks]);

  const arrivalTime = useMemo(() => {
    const track = day.tracks.find(
      (track) => track.scheduled.arriving_at !== null,
    );
    if (track) {
      return moment(track.scheduled.arriving_at, 'HH:mm:ss').format('HH:mm');
    }
    return null;
  }, [day.tracks]);

  return (
    <Link
      className="h-[125px] rounded-[3px] m-[3px]"
      style={{ backgroundColor: color }}
      to={`/dayview/${day.date}`}
    >
      <p className={classes(css.infoBox)}>
        {arrivalTime && (
          <div className={classes(css.arrivalTime)}>ETA {arrivalTime}</div>
        )}
        {trackNotice ? (
          <img
            className={classes(css.exclamation2)}
            src={exclamation}
            alt={t`Track has additional information`}
          />
        ) : (
          <br />
        )}
      </p>
    </Link>
  );
}
