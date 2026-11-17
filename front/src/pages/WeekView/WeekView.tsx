import { Trans, useLingui } from '@lingui/react/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import moment from 'moment';
import { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import type { DaySchedule } from '@/types';
import { JumpToCurrent, getSchedulingWeek } from '@/utils/Utils';

import css from './WeekView.module.scss';

const classes = classNames.bind(css);

type RangeSupervision =
  | 'present'
  | 'confirmed'
  | 'not confirmed'
  | 'absent'
  | 'closed';

interface StatusConfig {
  key: RangeSupervision;
  className: string;
  label: string;
  icon: JSX.Element;
}

function useStatusConfigs() {
  const { t } = useLingui();

  return useMemo(() => {
    const configs: Record<RangeSupervision, StatusConfig> = {
      present: {
        key: 'present',
        className: css.statusPresent,
        label: t`Range officer present`,
        icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
      },
      confirmed: {
        key: 'confirmed',
        className: css.statusConfirmed,
        label: t`Range officer confirmed`,
        icon: <AccessTimeIcon className={css.statusIcon} />,
      },
      'not confirmed': {
        key: 'not confirmed',
        className: css.statusNotConfirmed,
        label: t`Range officer predefined, not confirmed`,
        icon: <HelpOutlineIcon className={css.statusIcon} />,
      },
      absent: {
        key: 'absent',
        className: css.statusAbsent,
        label: t`Range officer undefined`,
        icon: <RemoveCircleOutlineIcon className={css.statusIcon} />,
      },
      closed: {
        key: 'closed',
        className: css.statusClosed,
        label: t`Range closed`,
        icon: <HighlightOffIcon className={css.statusIcon} />,
      },
    };
    return configs;
  }, [t]);
}

const formatTime = (time?: string | null) =>
  time ? moment(time, ['HH:mm:ss', 'HH:mm']).format('H.mm') : '';

function getArrivingAt(day: DaySchedule) {
  // The API repeats the scheduled supervision's arrival time on every track row.
  return (
    day.arriving_at ??
    (day.tracks ?? []).find((tr) => tr.scheduled?.arriving_at != null)
      ?.scheduled.arriving_at ??
    null
  );
}

export const Weekview = () => {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();

  const targetDate = useMemo(
    () => dateParam ?? moment().format('YYYY-MM-DD'),
    [dateParam],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['weekview', moment(targetDate).startOf('isoWeek').format()],
    queryFn: () => getSchedulingWeek(targetDate),
  });

  const goToWeek = useCallback(
    (delta: 1 | -1) =>
      history.push(
        `/weekview/${moment(targetDate).add(delta, 'week').format('YYYY-MM-DD')}`,
      ),
    [targetDate, history],
  );

  return (
    <div>
      <InfoBox />

      <div className={classes(css.weekContainer)}>
        <div className={classes(css.toolbar)}>
          <div className={classes(css.todayButton)}>
            <JumpToCurrent />
          </div>
          <div className={classes(css.viewTabs)}>
            <ViewChanger />
          </div>
        </div>

        <DateHeader
          targetDate={targetDate}
          onPrevious={() => goToWeek(-1)}
          onNext={() => goToWeek(1)}
          type="week"
        />
        <p className={classes(css.dateRange)}>{formatWeekRange(targetDate)}</p>

        {data?.week ? (
          <WeekCalendar days={data.week} />
        ) : (
          <div className={classes(css.statusMessage)}>
            {isError ? (
              <Trans>
                Could not load the schedule. Please try again later.
              </Trans>
            ) : (
              isLoading && <CircularProgress disableShrink />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Weekview;

/** "12.–18.10.2026", or "28.9.–4.10.2026" when the week spans two months. */
export function formatWeekRange(targetDate: string) {
  const first = moment(targetDate).startOf('isoWeek');
  const last = moment(targetDate).endOf('isoWeek');
  if (!first.isSame(last, 'year')) {
    return `${first.format('D.M.YYYY')}–${last.format('D.M.YYYY')}`;
  }
  if (!first.isSame(last, 'month')) {
    return `${first.format('D.M.')}–${last.format('D.M.YYYY')}`;
  }
  return `${first.format('D.')}–${last.format('D.M.YYYY')}`;
}

function WeekCalendar({ days }: { days: DaySchedule[] }) {
  const { t } = useLingui();
  const dayCount = days.length;

  return (
    <section className={classes(css.weekCard)}>
      <p className={classes(css.caption)}>
        {t`${dayCount} days · select a day to see the tracks`}
      </p>
      <ol className={classes(css.dayList)}>
        {days.map((day) => (
          <DayItem key={day.date} day={day} />
        ))}
      </ol>
    </section>
  );
}

function DayItem({ day }: { day: DaySchedule }) {
  const { t, i18n } = useLingui();
  const statuses = useStatusConfigs();
  const status =
    statuses[day.rangeSupervision as RangeSupervision] ?? statuses.absent;

  const date = moment(day.date);
  const isToday = date.isSame(moment(), 'day');
  const isPast = date.isBefore(moment(), 'day');

  const weekday = new Intl.DateTimeFormat(i18n.locale, {
    weekday: 'long',
  }).format(new Date(day.date));
  const weekdayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const hasNotice = (day.tracks ?? []).some(
    (track) => track.notice != null && track.notice !== '',
  );

  const time = formatTime(getArrivingAt(day));

  return (
    <li className={classes(css.dayItem)}>
      {isToday && (
        <span className={classes(css.todayMarker)} aria-hidden="true">
          <Trans>TODAY</Trans>
        </span>
      )}
      <Link
        to={`/dayview/${day.date}`}
        aria-current={isToday ? 'date' : undefined}
        aria-label={`${weekdayLabel} ${date.format('D.M.YYYY')} ${status.label}`}
        className={classes(
          css.dayCard,
          isToday && css.today,
          isPast && css.past,
        )}
      >
        <span className={classes(css.dayHead, hasNotice && css.hasNotice)}>
          <span className={classes(css.weekdayRow)}>
            <span className={classes(css.weekday)}>{weekdayLabel}</span>
            {hasNotice && (
              <InfoOutlinedIcon
                className={classes(css.noticeIcon)}
                titleAccess={t`Track has additional information`}
              />
            )}
          </span>
          <span className={classes(css.date)}>{date.format('DD.MM.YYYY')}</span>
        </span>
        <span className={classes(css.dayStatus, status.className)}>
          {status.icon}
          <span className={classes(css.statusText)}>
            <span>{status.label}</span>
            {status.key === 'confirmed' && (
              <span className={classes(css.timeText)}>
                {time ? t`Estimate ${time}` : t`Arrival time unknown`}
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}
