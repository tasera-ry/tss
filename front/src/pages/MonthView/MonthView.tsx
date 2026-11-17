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
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';
import 'moment/locale/fi';
import 'moment/locale/sv';
import { Trans, useLingui } from '@lingui/react/macro';

import api from '@/api/api';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import type { DaySchedule } from '@/types';

import css from './MonthView.module.scss';

const RANGE_SUPERVISIONS = [
  'present',
  'confirmed',
  'not confirmed',
  'absent',
  'closed',
] as const;

type RangeSupervision = (typeof RANGE_SUPERVISIONS)[number];

export interface MonthDay {
  date: string; // YYYY-MM-DD
  rangeSupervision: RangeSupervision;
  arrivingAt?: string | null;
}

export interface MonthWeek {
  week: number;
  days: MonthDay[];
}

function isRangeSupervision(value: unknown): value is RangeSupervision {
  return RANGE_SUPERVISIONS.includes(value as RangeSupervision);
}

export function toMonthDay(day: DaySchedule): MonthDay {
  const tracks = day.tracks ?? [];
  // The API repeats the scheduled supervision's arrival time on every track row.
  const arrivingAt =
    day.arriving_at ??
    tracks.find((tr) => tr.scheduled?.arriving_at != null)?.scheduled
      .arriving_at ??
    null;
  return {
    date: day.date,
    rangeSupervision: isRangeSupervision(day.rangeSupervision)
      ? day.rangeSupervision
      : 'absent',
    arrivingAt,
  };
}

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

const ARRIVAL_SHOWN: RangeSupervision[] = ['confirmed', 'not confirmed'];

function useFormatTime() {
  const { i18n } = useLingui();
  return (time?: string | null) => {
    if (!time) return '';
    const parsed = moment(time, ['HH:mm:ss', 'HH:mm'], true);
    if (!parsed.isValid()) return '';
    return new Intl.DateTimeFormat(i18n.locale, {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(parsed.toDate());
  };
}

const SWIPE_MIN_DISTANCE = 50;

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

  const [selectedDate, setSelectedDate] = useState(targetDate);

  useEffect(() => {
    setSelectedDate(targetDate);
  }, [targetDate]);

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
            targetDate={targetDate}
            today={today}
            selectedDate={isDesktop ? undefined : selectedDate}
            isDesktop={isDesktop}
            onDayClick={setSelectedDate}
            onSwipe={goToMonth}
          />
        )}

        {!isDesktop && (
          <div className={css.mobileOnly}>
            {selectedDay && <SelectedDayCard day={selectedDay} today={today} />}
            <Legend />
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
  targetDate: string;
  today: string;
  selectedDate?: string;
  isDesktop: boolean;
  onDayClick: (date: string) => void;
  onSwipe: (delta: 1 | -1) => void;
}

function Calendar({
  weeks,
  loading,
  targetDate,
  today,
  selectedDate,
  isDesktop,
  onDayClick,
  onSwipe,
}: CalendarProps) {
  const { t } = useLingui();
  const statuses = useStatusConfigs();
  const gridRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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
    if (cell) {
      event.preventDefault();
      cell.focus();
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 2) {
      onSwipe(dx < 0 ? 1 : -1);
    }
  };

  return (
    <section
      className={css.calendarCard}
      aria-busy={loading}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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

function ArrivalText({ day }: { day: MonthDay }) {
  const { t } = useLingui();
  const formatTime = useFormatTime();
  if (day.rangeSupervision !== 'confirmed') return null;

  const time = formatTime(day.arrivingAt);
  return (
    <span className={css.timeText}>
      {time ? t`Estimate ${time}` : t`Arrival time unknown`}
    </span>
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
  const formatTime = useFormatTime();

  const date = moment(day.date);
  const dayLabel = inCurrentMonth ? date.format('D') : date.format('D.M.');
  const shownStatus = inCurrentMonth ? status : null;
  const time = formatTime(day.arrivingAt);

  const ariaLabel = [
    i18n.date(date.toDate(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    isToday && t`Today`,
    shownStatus?.label,
    shownStatus &&
      day.rangeSupervision === 'confirmed' &&
      (time ? t`Estimate ${time}` : t`Arrival time unknown`),
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
            <ArrivalText day={day} />
          </span>
        ) : (
          <span className={css.cellCenter}>{shownStatus.icon}</span>
        ))}
      {!isDesktop && isToday && inCurrentMonth && (
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

function SelectedDayCard({ day, today }: { day: MonthDay; today: string }) {
  const { t, i18n } = useLingui();
  const statuses = useStatusConfigs();
  const formatTime = useFormatTime();
  const status = statuses[day.rangeSupervision];

  const date = moment(day.date);
  const weekday = i18n.date(date.toDate(), { weekday: 'long' });
  const title = `${weekday} ${date.format('D.M.YYYY')}`;
  const time = formatTime(day.arrivingAt);

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

function Legend() {
  const statuses = useStatusConfigs();

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

function calendarRange(monthKey: string) {
  const month = moment(monthKey, 'YYYY-MM');
  return {
    first: month.clone().startOf('month').startOf('isoWeek'),
    last: month.clone().endOf('month').endOf('isoWeek'),
  };
}

/** Every day of the visible range, so a day missing from the API cannot shift the grid. */
function buildCalendar(monthKey: string, days: MonthDay[] = []): MonthWeek[] {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const { first, last } = calendarRange(monthKey);
  const weeks: MonthWeek[] = [];

  for (
    const d = first.clone();
    d.isSameOrBefore(last, 'day');
    d.add(1, 'day')
  ) {
    const date = d.format('YYYY-MM-DD');
    if (d.isoWeekday() === 1) weeks.push({ week: d.isoWeek(), days: [] });
    weeks[weeks.length - 1].days.push(
      byDate.get(date) ?? { date, rangeSupervision: 'absent' },
    );
  }
  return weeks;
}
