import { Trans, useLingui } from '@lingui/react/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import classNames from 'classnames';
import moment from 'moment';
import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import type { DaySchedule } from '@/types';
import { JumpToCurrent, getSchedulingWeek } from '@/utils/Utils';

import css from './WeekView.module.scss';

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

type StatusConfigs = Record<RangeSupervision, StatusConfig>;

function useStatusConfigs(): StatusConfigs {
  const { t } = useLingui();

  return useMemo(() => {
    const configs: StatusConfigs = {
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

const timeFormatters = new Map<string, Intl.DateTimeFormat>();

function formatTime(time: string | null | undefined, locale: string) {
  if (!time) return '';
  const parsed = moment(time, ['HH:mm:ss', 'HH:mm'], true);
  if (!parsed.isValid()) return '';

  let formatter = timeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    timeFormatters.set(locale, formatter);
  }
  return formatter.format(parsed.toDate());
}

const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

function formatWeekday(date: Date, locale: string) {
  let formatter = weekdayFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    weekdayFormatters.set(locale, formatter);
  }
  const weekday = formatter.format(date);
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

function weekDates(targetDate: string) {
  const first = moment(targetDate).startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) =>
    first.clone().add(i, 'day').format('YYYY-MM-DD'),
  );
}

function getArrivingAt(day: DaySchedule) {
  // The API repeats the scheduled supervision's arrival time on every track row.
  return (
    day.arriving_at ??
    (day.tracks ?? []).find((tr) => tr.scheduled?.arriving_at != null)
      ?.scheduled.arriving_at ??
    null
  );
}

async function fetchWeek(targetDate: string): Promise<DaySchedule[]> {
  try {
    const { week } = await getSchedulingWeek(targetDate);
    return week ?? [];
  } catch (error) {
    // The API answers 404 rather than an empty list when no day in the range has a schedule.
    if (isNotFound(error)) return [];
    throw error;
  }
}

function isNotFound(error: unknown) {
  return (
    (error as { response?: { status?: number } } | null)?.response?.status ===
    404
  );
}

function parseDateParam(dateParam?: string) {
  if (!dateParam) return null;
  const parsed = moment(dateParam, 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

export const Weekview = () => {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date?: string }>();

  const today = moment().format('YYYY-MM-DD');
  const validDateParam = parseDateParam(dateParam);
  const targetDate = validDateParam ?? today;

  useEffect(() => {
    if (dateParam && !validDateParam) {
      history.replace(`/weekview/${today}`);
    }
  }, [dateParam, validDateParam, history, today]);

  const { data, isError, refetch } = useQuery({
    queryKey: ['weekview', moment(targetDate).startOf('isoWeek').format()],
    queryFn: () => fetchWeek(targetDate),
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

      <div className={css.weekContainer}>
        <div className={css.toolbar}>
          <div className={css.todayButton}>
            <JumpToCurrent />
          </div>
          <div className={css.viewTabs}>
            <ViewChanger />
          </div>
        </div>

        <DateHeader
          targetDate={targetDate}
          onPrevious={() => goToWeek(-1)}
          onNext={() => goToWeek(1)}
          type="week"
        />

        {isError && !data ? (
          <div className={css.statusMessage} role="alert">
            <p>
              <Trans>
                Could not load the schedule. Please try again later.
              </Trans>
            </p>
            <button
              type="button"
              className={css.retryButton}
              onClick={() => refetch()}
            >
              <Trans>Try again</Trans>
            </button>
          </div>
        ) : (
          <WeekCalendar days={data} targetDate={targetDate} />
        )}
      </div>
    </div>
  );
};

export default Weekview;

function WeekCalendar({
  days,
  targetDate,
}: { days?: DaySchedule[]; targetDate: string }) {
  const { t } = useLingui();
  const statuses = useStatusConfigs();
  const dates = weekDates(targetDate);
  const byDate = useMemo(
    () => new Map((days ?? []).map((day) => [day.date, day])),
    [days],
  );
  const dayCount = dates.length;

  return (
    <section className={css.weekCard} aria-busy={!days}>
      <p className={css.caption}>
        {t`${dayCount} days · select a day to see the tracks`}
      </p>
      <ol className={css.dayList}>
        {dates.map((date) => (
          <DayItem
            key={date}
            date={date}
            day={byDate.get(date)}
            loading={!days}
            statuses={statuses}
          />
        ))}
      </ol>
    </section>
  );
}

interface DayItemProps {
  date: string;
  day?: DaySchedule;
  loading: boolean;
  statuses: StatusConfigs;
}

function DayItem({ date: dateString, day, loading, statuses }: DayItemProps) {
  const { t, i18n } = useLingui();

  const date = moment(dateString);
  const isToday = date.isSame(moment(), 'day');
  const isPast = date.isBefore(moment(), 'day');

  const weekdayLabel = formatWeekday(date.toDate(), i18n.locale);
  const dateLabel = date.format('D.M.YYYY');

  const todayMarker = isToday && (
    <span className={css.todayMarker} aria-hidden="true">
      <Trans>TODAY</Trans>
    </span>
  );

  if (loading) {
    return (
      <li className={css.dayItem}>
        {todayMarker}
        <div
          className={classNames(css.dayCard, css.pending, isToday && css.today)}
        >
          <span className={css.dayHead}>
            <span className={css.weekdayRow}>
              <span className={css.weekday}>{weekdayLabel}</span>
            </span>
            <span className={css.date}>{dateLabel}</span>
          </span>
          <span className={classNames(css.dayStatus, css.loading)} />
        </div>
      </li>
    );
  }

  const status =
    statuses[day?.rangeSupervision as RangeSupervision] ?? statuses.absent;

  const hasNotice = (day?.tracks ?? []).some(
    (track) => track.notice != null && track.notice !== '',
  );

  const time = day ? formatTime(getArrivingAt(day), i18n.locale) : '';
  const arrival =
    status.key === 'confirmed'
      ? time
        ? t`Estimate ${time}`
        : t`Arrival time unknown`
      : null;
  const noticeLabel = t`Track has additional information`;

  const ariaLabel = [
    `${weekdayLabel} ${dateLabel}`,
    isToday && t`Today`,
    status.label,
    arrival,
    hasNotice && noticeLabel,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <li className={css.dayItem}>
      {todayMarker}
      <Link
        to={`/dayview/${dateString}`}
        aria-current={isToday ? 'date' : undefined}
        aria-label={ariaLabel}
        className={classNames(
          css.dayCard,
          isToday && css.today,
          isPast && css.past,
        )}
      >
        <span className={classNames(css.dayHead, hasNotice && css.hasNotice)}>
          <span className={css.weekdayRow}>
            <span className={css.weekday}>{weekdayLabel}</span>
            {hasNotice && (
              <InfoOutlinedIcon
                className={css.noticeIcon}
                titleAccess={noticeLabel}
              />
            )}
          </span>
          <span className={css.date}>{dateLabel}</span>
        </span>
        <span className={classNames(css.dayStatus, status.className)}>
          {status.icon}
          <span className={css.statusText}>
            <span>{status.label}</span>
            {arrival && <span className={css.timeText}>{arrival}</span>}
          </span>
        </span>
      </Link>
    </li>
  );
}
