import { Trans, useLingui } from '@lingui/react/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
import moment from 'moment';
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';

import api from '@/api/api';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import type { DaySchedule } from '@/types';

import css from './MonthView.module.scss';
import {
  type MonthDay,
  type MonthWeek,
  RANGE_SUPERVISIONS,
  type RangeSupervision,
  buildCalendar,
  calendarRange,
  toMonthDay,
} from './monthViewData';

interface StatusConfig {
  className: string;
  label: string;
  legendLabel: string;
  icon: JSX.Element;
}

type StatusConfigs = Record<RangeSupervision, StatusConfig>;

function useStatusConfigs(): StatusConfigs {
  const { t } = useLingui();

  return useMemo(
    () => ({
      present: {
        className: css.statusPresent,
        label: t`Range officer present`,
        legendLabel: t`Range officer present`,
        icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
      },
      confirmed: {
        className: css.statusConfirmed,
        label: t`Range officer confirmed`,
        legendLabel: t`Range officer confirmed, estimated time of arrival`,
        icon: <AccessTimeIcon className={css.statusIcon} />,
      },
      'not confirmed': {
        className: css.statusNotConfirmed,
        label: t`Range officer predefined, not confirmed`,
        legendLabel: t`Range officer predefined, not confirmed`,
        icon: <HelpOutlineIcon className={css.statusIcon} />,
      },
      absent: {
        className: css.statusAbsent,
        label: t`Range officer undefined`,
        legendLabel: t`Range officer undefined`,
        icon: <RemoveCircleOutlineIcon className={css.statusIcon} />,
      },
      closed: {
        className: css.statusClosed,
        label: t`Range closed`,
        legendLabel: t`Range closed`,
        icon: <HighlightOffIcon className={css.statusIcon} />,
      },
    }),
    [t],
  );
}

/** The legend ties the arrival estimate to the confirmed state only. */
function showsArrival(supervision: RangeSupervision) {
  return supervision === 'confirmed';
}

const ARRIVAL_SHOWN: RangeSupervision[] = ['confirmed', 'not confirmed'];

const timeFormatters = new Map<string, Intl.DateTimeFormat>();

/** One formatter per locale, shared by every cell. */
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

const ARROW_KEY_DAYS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

function monthQueryKey(monthKey: string) {
  return ['monthview', monthKey];
}

async function fetchMonth(monthKey: string): Promise<MonthWeek[]> {
  const { first, last } = calendarRange(monthKey);
  const data = (await api.getSchedulingFreeform(
    first.format('YYYY-MM-DD'),
    last.format('YYYY-MM-DD'),
  )) as DaySchedule[];
  return buildCalendar(monthKey, data.map(toMonthDay));
}

function parseDateParam(dateParam?: string) {
  if (!dateParam) return null;
  const parsed = moment(dateParam, 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

export function Monthview() {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { date: dateParam } = useParams<{ date?: string }>();
  const isDesktop = useMediaQuery('(min-width:768px)', { noSsr: true });

  const today = moment().format('YYYY-MM-DD');
  const validDateParam = parseDateParam(dateParam);
  const targetDate = validDateParam ?? today;
  const monthKey = moment(targetDate).format('YYYY-MM');

  useEffect(() => {
    if (dateParam && !validDateParam) {
      history.replace(`/monthview/${today}`);
    }
  }, [dateParam, validDateParam, history, today]);

  // A selection belongs to the URL date it was made on; a new URL date resets it.
  const [selection, setSelection] = useState({
    targetDate,
    date: targetDate,
  });
  const selectedDate =
    selection.targetDate === targetDate ? selection.date : targetDate;
  const selectDate = (date: string) => setSelection({ targetDate, date });

  const statuses = useStatusConfigs();

  const { data, isError, refetch } = useQuery({
    queryKey: monthQueryKey(monthKey),
    queryFn: () => fetchMonth(monthKey),
  });

  useEffect(() => {
    for (const delta of [-1, 1]) {
      const adjacent = moment(monthKey, 'YYYY-MM')
        .add(delta, 'month')
        .format('YYYY-MM');
      queryClient.prefetchQuery(monthQueryKey(adjacent), () =>
        fetchMonth(adjacent),
      );
    }
  }, [monthKey, queryClient]);

  const skeletonWeeks = useMemo(() => buildCalendar(monthKey), [monthKey]);
  const weeks = data ?? skeletonWeeks;

  const goToMonth = (delta: 1 | -1) =>
    history.push(
      `/monthview/${moment(targetDate)
        .add(delta, 'month')
        .format('YYYY-MM-DD')}`,
    );

  const selectedDay = useMemo(
    () => data?.flatMap((w) => w.days).find((d) => d.date === selectedDate),
    [data, selectedDate],
  );

  return (
    <div>
      <InfoBox />

      <div className={css.monthContainer}>
        <div className={css.toolbar}>
          <div className={css.todayButton}>
            <Link
              className="bg-black-tint-70 rounded-t-lg p-2 flex justify-center items-center text-white text-lg font-bold"
              data-testid="jumpToCur"
              to={`/monthview/${today}`}
            >
              <Trans>Today</Trans>
            </Link>
          </div>
          <div className={css.viewTabs}>
            {/* ViewChanger reads the date from the URL only on mount. */}
            <ViewChanger key={targetDate} />
          </div>
        </div>

        <DateHeader
          targetDate={targetDate}
          onPrevious={() => goToMonth(-1)}
          onNext={() => goToMonth(1)}
          type="month"
        />
        <WeekRange weeks={weeks} />

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
          <Calendar
            weeks={weeks}
            loading={!data}
            statuses={statuses}
            targetDate={targetDate}
            today={today}
            selectedDate={isDesktop ? undefined : selectedDate}
            isDesktop={isDesktop}
            onDayClick={selectDate}
            onNavigate={(date) => history.push(`/monthview/${date}`)}
          />
        )}

        {!isDesktop && (
          <div className={css.mobileOnly}>
            {selectedDay && (
              <SelectedDayCard
                day={selectedDay}
                status={statuses[selectedDay.rangeSupervision]}
                today={today}
              />
            )}
            <Legend statuses={statuses} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Monthview;

function WeekRange({ weeks }: { weeks: MonthWeek[] }) {
  const { t } = useLingui();
  const firstWeek = weeks[0]?.week;
  const lastWeek = weeks[weeks.length - 1]?.week;
  if (firstWeek == null) return null;

  return <p className={css.weekRange}>{t`Weeks ${firstWeek}–${lastWeek}`}</p>;
}

interface CalendarProps {
  weeks: MonthWeek[];
  loading: boolean;
  statuses: StatusConfigs;
  targetDate: string;
  today: string;
  selectedDate?: string;
  isDesktop: boolean;
  onDayClick: (date: string) => void;
  onNavigate: (date: string) => void;
}

function Calendar({
  weeks,
  loading,
  statuses,
  targetDate,
  today,
  selectedDate,
  isDesktop,
  onDayClick,
  onNavigate,
}: CalendarProps) {
  const { t } = useLingui();
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a prefetched month changes only `weeks`
  useEffect(() => {
    if (!pendingFocus.current || loading) return;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-date="${pendingFocus.current}"]`)
      ?.focus();
    pendingFocus.current = null;
  }, [weeks, loading]);

  const weekdays = [
    [t`Mon`, t`Monday`],
    [t`Tue`, t`Tuesday`],
    [t`Wed`, t`Wednesday`],
    [t`Thu`, t`Thursday`],
    [t`Fri`, t`Friday`],
    [t`Sat`, t`Saturday`],
    [t`Sun`, t`Sunday`],
  ];
  const weekCount = weeks.length;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset = ARROW_KEY_DAYS[event.key];
    const from = (event.target as HTMLElement).dataset.date;
    if (offset == null || !from) return;

    const next = moment(from).add(offset, 'day').format('YYYY-MM-DD');
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${next}"]`,
    );
    event.preventDefault();
    if (cell) {
      cell.focus();
    } else {
      pendingFocus.current = next;
      onNavigate(next);
    }
  };

  return (
    <section className={css.calendarCard} aria-busy={loading}>
      <p className={css.caption}>
        {t`${weekCount} weeks · select a day to see the tracks`}
      </p>
      <div className={css.calendar} ref={gridRef} onKeyDown={handleKeyDown}>
        <div className={css.headerCell}>
          <abbr title={t`Week`}>
            <Trans>Wk</Trans>
          </abbr>
        </div>
        {weekdays.map(([short, long]) => (
          <div key={short} className={css.headerCell}>
            <abbr title={long}>{short}</abbr>
          </div>
        ))}

        {weeks.map((week) => (
          <WeekRow
            key={week.days[0]?.date ?? week.week}
            week={week}
            loading={loading}
            statuses={statuses}
            targetDate={targetDate}
            today={today}
            selectedDate={selectedDate}
            isDesktop={isDesktop}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </section>
  );
}

interface WeekRowProps {
  week: MonthWeek;
  loading: boolean;
  statuses: StatusConfigs;
  targetDate: string;
  today: string;
  selectedDate?: string;
  isDesktop: boolean;
  onDayClick: (date: string) => void;
}

function WeekRow({
  week,
  loading,
  statuses,
  targetDate,
  today,
  selectedDate,
  isDesktop,
  onDayClick,
}: WeekRowProps) {
  return (
    <>
      <div className={css.weekNumber}>{week.week}</div>
      {week.days.map((day) => (
        <DayCell
          key={day.date}
          day={day}
          status={loading ? null : statuses[day.rangeSupervision]}
          inCurrentMonth={moment(day.date).isSame(targetDate, 'month')}
          isToday={day.date === today}
          selected={selectedDate === day.date}
          isDesktop={isDesktop}
          onClick={() => onDayClick(day.date)}
        />
      ))}
    </>
  );
}

interface DayCellProps {
  day: MonthDay;
  status: StatusConfig | null;
  inCurrentMonth: boolean;
  isToday: boolean;
  selected: boolean;
  isDesktop: boolean;
  onClick: () => void;
}

function DayCell({
  day,
  status,
  inCurrentMonth,
  isToday,
  selected,
  isDesktop,
  onClick,
}: DayCellProps) {
  const { t, i18n } = useLingui();

  const date = moment(day.date);
  const dayLabel = inCurrentMonth
    ? date.format('D')
    : i18n.date(date.toDate(), { day: 'numeric', month: 'numeric' });
  const shownStatus = inCurrentMonth ? status : null;
  const showTodayMini = !isDesktop && isToday && inCurrentMonth;

  const time = showsArrival(day.rangeSupervision)
    ? formatTime(day.arrivingAt, i18n.locale)
    : '';
  const arrival =
    shownStatus && showsArrival(day.rangeSupervision)
      ? time
        ? t`Estimate ${time}`
        : t`Arrival time unknown`
      : null;

  const ariaLabel = [
    i18n.date(date.toDate(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    isToday && t`Today`,
    shownStatus?.label,
    arrival,
  ]
    .filter(Boolean)
    .join(', ');

  const className = classNames(
    css.dayCell,
    !inCurrentMonth && css.otherMonth,
    shownStatus?.className,
    !status && css.loading,
    isToday && css.today,
    selected && css.selected,
  );

  const content = (
    <>
      <span className={css.cellTop}>
        <span className={css.dayNumber}>{dayLabel}</span>
        {isDesktop && isToday && (
          <span className={css.todayBadge}>
            <Trans>TODAY</Trans>
          </span>
        )}
        {shownStatus && isDesktop && (
          <span className={css.cellTopIcon}>{shownStatus.icon}</span>
        )}
      </span>

      {shownStatus &&
        (isDesktop ? (
          <span className={css.cellBody}>
            <span className={css.statusText}>{shownStatus.label}</span>
            {arrival && <span className={css.timeText}>{arrival}</span>}
          </span>
        ) : (
          <span className={css.cellCenter}>
            {shownStatus.icon}
            {!showTodayMini && time && (
              <span className={css.timeTextMini}>{time}</span>
            )}
          </span>
        ))}
      {showTodayMini && (
        <span className={css.todayMini}>
          <Trans>TODAY</Trans>
        </span>
      )}
    </>
  );

  if (isDesktop && status) {
    return (
      <Link
        to={`/dayview/${day.date}`}
        data-date={day.date}
        aria-label={ariaLabel}
        aria-current={isToday ? 'date' : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!status}
      data-date={day.date}
      aria-label={ariaLabel}
      aria-current={isToday ? 'date' : undefined}
      aria-pressed={isDesktop ? undefined : selected}
      className={className}
    >
      {content}
    </button>
  );
}

interface SelectedDayCardProps {
  day: MonthDay;
  status: StatusConfig;
  today: string;
}

function SelectedDayCard({ day, status, today }: SelectedDayCardProps) {
  const { t, i18n } = useLingui();

  const date = moment(day.date);
  const title = i18n.date(date.toDate(), {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  const time = formatTime(day.arrivingAt, i18n.locale);

  return (
    <div className={css.detailCard} aria-live="polite">
      <div className={css.detailHeader}>
        <h3 className={css.detailTitle}>
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </h3>
        {day.date === today && (
          <span className={css.todayBadge}>
            <Trans>TODAY</Trans>
          </span>
        )}
      </div>
      <div className={css.detailStatus}>
        <span className={classNames(css.legendSwatch, status.className)}>
          {status.icon}
        </span>
        <span>{status.label}</span>
      </div>
      {ARRIVAL_SHOWN.includes(day.rangeSupervision) && (
        <p className={css.detailArrival}>
          <AccessTimeIcon className={css.legendIcon} />
          {time ? t`Estimated arrival ${time}` : t`Arrival time unknown`}
        </p>
      )}
      <Link to={`/dayview/${day.date}`} className={css.openButton}>
        <Trans>Open day view</Trans>
      </Link>
    </div>
  );
}

function Legend({ statuses }: { statuses: StatusConfigs }) {
  return (
    <div className={css.legendCard}>
      <h3 className={css.legendTitle}>
        <Trans>Legend</Trans>
      </h3>
      <ul className={css.legendList}>
        {RANGE_SUPERVISIONS.map((key) => (
          <li key={key} className={css.legendItem}>
            <span
              className={classNames(css.legendSwatch, statuses[key].className)}
            >
              {statuses[key].icon}
            </span>
            <span>{statuses[key].legendLabel}</span>
          </li>
        ))}
        <li className={css.legendItem}>
          <span className={classNames(css.legendSwatch, css.otherMonth)} />
          <span>
            <Trans>Day of the previous or next month</Trans>
          </span>
        </li>
      </ul>
    </div>
  );
}
