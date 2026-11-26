import { Trans, useLingui } from '@lingui/react/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import classNames from 'classnames';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { useTrackName } from '@/trackview/useTrackName';
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
  // The API returns every day of the week, with or without a schedule.
  const { week } = await getSchedulingWeek(targetDate);
  return week ?? [];
}

function parseDateParam(dateParam?: string) {
  if (!dateParam) return null;
  const parsed = moment(dateParam, 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

// Today's date, updated at midnight and when the tab becomes visible again,
// so a page left open overnight moves the TODAY marker.
function useToday() {
  const [today, setToday] = useState(() => moment().format('YYYY-MM-DD'));

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-arms the midnight timer each time the day changes
  useEffect(() => {
    const update = () => setToday(moment().format('YYYY-MM-DD'));
    const msToMidnight =
      moment().add(1, 'day').startOf('day').diff(moment()) + 1000;
    const timer = setTimeout(update, msToMidnight);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [today]);

  return today;
}

export const Weekview = () => {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date?: string }>();

  const today = useToday();
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
          <JumpToCurrent />
          <ViewChanger />
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
          <WeekCalendar days={data} targetDate={targetDate} today={today} />
        )}
      </div>
    </div>
  );
};

export default Weekview;

function WeekCalendar({
  days,
  targetDate,
  today,
}: { days?: DaySchedule[]; targetDate: string; today: string }) {
  const { t } = useLingui();
  const statuses = useStatusConfigs();
  const dates = weekDates(targetDate);
  const byDate = useMemo(
    () => new Map((days ?? []).map((day) => [day.date, day])),
    [days],
  );

  return (
    <section className={css.weekCard} aria-busy={!days}>
      {/* Kept in the layout but hidden while loading: the cards can't be selected yet. */}
      <p
        className={classNames(css.caption, !days && css.captionHidden)}
        aria-hidden={!days || undefined}
      >
        {t`7 days · select a day to see the tracks`}
      </p>
      <ol className={css.dayList}>
        {dates.map((date) => (
          <DayItem
            key={date}
            date={date}
            day={byDate.get(date)}
            loading={!days}
            today={today}
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
  today: string;
  statuses: StatusConfigs;
}

function DayItem({
  date: dateString,
  day,
  loading,
  today,
  statuses,
}: DayItemProps) {
  const { t, i18n } = useLingui();
  const [noticesOpen, setNoticesOpen] = useState(false);

  const date = moment(dateString);
  const isToday = dateString === today;
  const isPast = dateString < today;

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

  const notices = (day?.tracks ?? []).filter(
    (track) => track.notice != null && track.notice !== '',
  );
  const hasNotice = notices.length > 0;

  const time = day ? formatTime(getArrivingAt(day), i18n.locale) : '';
  const arrival =
    status.key === 'confirmed'
      ? time
        ? t`Estimate ${time}`
        : t`Arrival time unknown`
      : null;
  const ariaLabel = [
    `${weekdayLabel} ${dateLabel}`,
    isToday && t`Today`,
    status.label,
    arrival,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <li className={css.dayItem}>
      {todayMarker}
      {/* The notice button sits over the card, outside its link: a button
          cannot be inside a link. */}
      <div className={css.cardWrap}>
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
        {hasNotice && (
          <button
            type="button"
            className={css.noticeButton}
            aria-label={`${t`Notices for the day`}, ${weekdayLabel} ${dateLabel}`}
            aria-haspopup="dialog"
            onClick={() => setNoticesOpen(true)}
          >
            <InfoOutlinedIcon className={css.noticeIcon} />
          </button>
        )}
      </div>
      {noticesOpen && (
        <NoticesDialog
          title={`${weekdayLabel} ${dateLabel}`}
          tracks={notices}
          onClose={() => setNoticesOpen(false)}
        />
      )}
    </li>
  );
}

/**
 * Every track notice of one day in one place. The notices belong to tracks,
 * two levels down (day view, then track view); members asked from the week
 * view should not have to open each track to find them.
 */
function NoticesDialog({
  title,
  tracks,
  onClose,
}: {
  title: string;
  tracks: DaySchedule['tracks'];
  onClose: () => void;
}) {
  const { t } = useLingui();
  const trackName = useTrackName();
  const titleId = `notices-${title.replace(/\W+/g, '-')}`;

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId} className={css.noticesTitle}>
        {t`Notices for the day`}
        <span className={css.noticesDate}>{title}</span>
      </DialogTitle>
      <DialogContent>
        <ul className={css.noticesList}>
          {tracks.map((track) => (
            <li key={String(track.id)}>
              <h3 className={css.noticeTrack}>
                {trackName(String(track.name))}
              </h3>
              <p className={css.noticeText}>{track.notice}</p>
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <button type="button" className={css.closeButton} onClick={onClose}>
          {t`Close`}
        </button>
      </DialogActions>
    </Dialog>
  );
}
