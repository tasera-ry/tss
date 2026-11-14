import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useHistory, useParams } from 'react-router-dom';
import 'moment/locale/fi';
import 'moment/locale/sv';
import { Trans, useLingui } from '@lingui/react/macro';

import api from '@/api/api';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import type { DaySchedule } from '@/types';
import { JumpToCurrent } from '@/utils/Utils';

import css from './MonthView.module.scss';

const classes = classNames.bind(css);

type RangeSupervision =
  | 'present'
  | 'confirmed'
  | 'not confirmed'
  | 'absent'
  | 'closed';

export interface MonthDay {
  date: string; // YYYY-MM-DD
  rangeSupervision: RangeSupervision;
  arrivingAt?: string | null;
}

export interface MonthWeek {
  week: number;
  days: MonthDay[];
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
    rangeSupervision: day.rangeSupervision as RangeSupervision,
    arrivingAt,
  };
}

interface StatusConfig {
  key: RangeSupervision;
  className: string;
  label: string;
  legendLabel: string;
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
        legendLabel: t`Range officer present`,
        icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
      },
      confirmed: {
        key: 'confirmed',
        className: css.statusConfirmed,
        label: t`Range officer confirmed`,
        legendLabel: t`Range officer confirmed, estimated time of arrival`,
        icon: <AccessTimeIcon className={css.statusIcon} />,
      },
      'not confirmed': {
        key: 'not confirmed',
        className: css.statusNotConfirmed,
        label: t`Range officer predefined, not confirmed`,
        legendLabel: t`Range officer predefined, not confirmed`,
        icon: <HelpOutlineIcon className={css.statusIcon} />,
      },
      absent: {
        key: 'absent',
        className: css.statusAbsent,
        label: t`Range officer undefined`,
        legendLabel: t`Range officer undefined`,
        icon: <RemoveCircleOutlineIcon className={css.statusIcon} />,
      },
      closed: {
        key: 'closed',
        className: css.statusClosed,
        label: t`Range closed`,
        legendLabel: t`Range closed`,
        icon: <HighlightOffIcon className={css.statusIcon} />,
      },
    };
    return configs;
  }, [t]);
}

const LEGEND_ORDER: RangeSupervision[] = [
  'present',
  'confirmed',
  'not confirmed',
  'absent',
  'closed',
];

const formatTime = (time?: string | null) =>
  time ? moment(time, ['HH:mm:ss', 'HH:mm']).format('H.mm') : '';

const HAS_OFFICER: RangeSupervision[] = [
  'present',
  'confirmed',
  'not confirmed',
];

interface MonthviewProps {
  weeks?: MonthWeek[];
}

export function Monthview({ weeks }: MonthviewProps) {
  const history = useHistory();
  const { date: dateParam } = useParams<{ date: string }>();
  const isDesktop = useMediaQuery('(min-width:768px)');

  const targetDate = useMemo(
    () => dateParam ?? moment().format('YYYY-MM-DD'),
    [dateParam],
  );

  const [selectedDate, setSelectedDate] = useState<string>(targetDate);

  useEffect(() => {
    setSelectedDate(targetDate);
  }, [targetDate]);

  const monthKey = moment(targetDate).format('YYYY-MM');

  const {
    data: apiWeeks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['monthview', monthKey],
    enabled: !weeks,
    queryFn: async (): Promise<MonthWeek[]> => {
      const { first, last } = calendarRange(targetDate);
      const data = (await api.getSchedulingFreeform(
        first.format('YYYY-MM-DD'),
        last.format('YYYY-MM-DD'),
      )) as DaySchedule[];
      return groupIntoWeeks(data.map(toMonthDay));
    },
  });

  const skeletonWeeks = useMemo(
    () => buildSkeletonWeeks(targetDate),
    [targetDate],
  );
  const data = weeks ?? apiWeeks;

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

  const handleDayClick = (date: string) => {
    if (isDesktop) {
      history.push(`/dayview/${date}`);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div>
      <InfoBox />

      <div className={classes(css.monthContainer)}>
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
          onPrevious={() => goToMonth(-1)}
          onNext={() => goToMonth(1)}
          type="month"
        />
        <WeekRange weeks={data ?? skeletonWeeks} />

        {data ? (
          <Calendar
            weeks={data}
            targetDate={targetDate}
            selectedDate={isDesktop ? undefined : selectedDate}
            isDesktop={isDesktop}
            onDayClick={handleDayClick}
          />
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

        {!isDesktop && (
          <div className={classes(css.mobileOnly)}>
            {selectedDay && <SelectedDayCard day={selectedDay} />}
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

  return (
    <p className={classes(css.weekRange)}>
      {t`Weeks ${firstWeek}–${lastWeek}`}
    </p>
  );
}

interface CalendarProps {
  weeks: MonthWeek[];
  targetDate: string;
  selectedDate?: string;
  isDesktop: boolean;
  onDayClick: (date: string) => void;
}

function Calendar({
  weeks,
  targetDate,
  selectedDate,
  isDesktop,
  onDayClick,
}: CalendarProps) {
  const { t } = useLingui();
  const weekdays = [t`Mon`, t`Tue`, t`Wed`, t`Thu`, t`Fri`, t`Sat`, t`Sun`];
  const weekCount = weeks.length;

  return (
    <section className={classes(css.calendarCard)}>
      <p className={classes(css.caption)}>
        {t`${weekCount} weeks · select a day to see the tracks`}
      </p>
      <div className={classes(css.calendar)}>
        <div className={classes(css.headerCell)}>
          <Trans>Wk</Trans>
        </div>
        {weekdays.map((day) => (
          <div key={day} className={classes(css.headerCell)}>
            {day}
          </div>
        ))}

        {weeks.map((week) => (
          <WeekRow
            key={week.days[0]?.date ?? week.week}
            week={week}
            targetDate={targetDate}
            selectedDate={selectedDate}
            isDesktop={isDesktop}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </section>
  );
}

function WeekRow({
  week,
  targetDate,
  selectedDate,
  isDesktop,
  onDayClick,
}: { week: MonthWeek } & Omit<CalendarProps, 'weeks'>) {
  return (
    <>
      <div className={classes(css.weekNumber)}>{week.week}</div>
      {week.days.map((day) => (
        <DayCell
          key={day.date}
          day={day}
          inCurrentMonth={moment(day.date).isSame(targetDate, 'month')}
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
  inCurrentMonth: boolean;
  selected: boolean;
  isDesktop: boolean;
  onClick: () => void;
}

function ArrivalText({ day }: { day: MonthDay }) {
  const { t } = useLingui();
  if (day.rangeSupervision !== 'confirmed') return null;

  const time = formatTime(day.arrivingAt);
  return (
    <span className={classes(css.timeText)}>
      {time ? t`Estimate ${time}` : t`Arrival time unknown`}
    </span>
  );
}

function DayCell({
  day,
  inCurrentMonth,
  selected,
  isDesktop,
  onClick,
}: DayCellProps) {
  const statuses = useStatusConfigs();
  const status = statuses[day.rangeSupervision] ?? statuses.absent;

  const date = useMemo(() => moment(day.date), [day.date]);
  const isToday = date.isSame(moment(), 'day');
  const dayLabel = inCurrentMonth ? date.format('D') : date.format('D.M.');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${date.format('D.M.')} ${status.label}`}
      aria-current={isToday ? 'date' : undefined}
      className={classes(
        css.dayCell,
        inCurrentMonth ? status.className : css.otherMonth,
        isToday && css.today,
        selected && css.selected,
      )}
    >
      <span className={classes(css.cellTop)}>
        <span className={classes(css.dayNumber)}>{dayLabel}</span>
        {isDesktop && isToday && (
          <span className={classes(css.todayBadge)}>
            <Trans>TODAY</Trans>
          </span>
        )}
        {inCurrentMonth && isDesktop && (
          <span className={classes(css.cellTopIcon)}>{status.icon}</span>
        )}
      </span>

      {inCurrentMonth &&
        (isDesktop ? (
          <span className={classes(css.cellBody)}>
            <span className={classes(css.statusText)}>{status.label}</span>
            <ArrivalText day={day} />
          </span>
        ) : (
          <>
            <span className={classes(css.cellCenter)}>{status.icon}</span>
            {isToday && (
              <span className={classes(css.todayMini)}>
                <Trans>TODAY</Trans>
              </span>
            )}
          </>
        ))}
    </button>
  );
}

function SelectedDayCard({ day }: { day: MonthDay }) {
  const { t, i18n } = useLingui();
  const statuses = useStatusConfigs();
  const status = statuses[day.rangeSupervision] ?? statuses.absent;

  const weekday = new Intl.DateTimeFormat(i18n.locale, {
    weekday: 'long',
  }).format(new Date(day.date));
  const title = `${weekday} ${moment(day.date).format('D.M.YYYY')}`;
  const isToday = moment(day.date).isSame(moment(), 'day');
  const time = formatTime(day.arrivingAt);

  return (
    <div className={classes(css.detailCard)}>
      <div className={classes(css.detailHeader)}>
        <h3 className={classes(css.detailTitle)}>
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </h3>
        {isToday && (
          <span className={classes(css.todayBadge)}>
            <Trans>TODAY</Trans>
          </span>
        )}
      </div>
      <div className={classes(css.detailStatus)}>
        <span className={classes(css.legendSwatch, status.className)}>
          {status.icon}
        </span>
        <span>{status.label}</span>
      </div>
      {HAS_OFFICER.includes(day.rangeSupervision) && (
        <p className={classes(css.detailArrival)}>
          <AccessTimeIcon className={css.legendIcon} />
          {time ? t`Estimated arrival ${time}` : t`Arrival time unknown`}
        </p>
      )}
      <Link to={`/dayview/${day.date}`} className={classes(css.openButton)}>
        <Trans>Open day view</Trans>
      </Link>
    </div>
  );
}

function Legend() {
  const statuses = useStatusConfigs();

  return (
    <div className={classes(css.legendCard)}>
      <h3 className={classes(css.legendTitle)}>
        <Trans>Legend</Trans>
      </h3>
      <ul className={classes(css.legendList)}>
        {LEGEND_ORDER.map((key) => (
          <li key={key} className={classes(css.legendItem)}>
            <span
              className={classes(css.legendSwatch, statuses[key].className)}
            >
              {statuses[key].icon}
            </span>
            <span>{statuses[key].legendLabel}</span>
          </li>
        ))}
        <li className={classes(css.legendItem)}>
          <span className={classes(css.legendSwatch, css.otherMonth)} />
          <span>
            <Trans>Day of the previous or next month</Trans>
          </span>
        </li>
      </ul>
    </div>
  );
}

function groupIntoWeeks(days: MonthDay[]): MonthWeek[] {
  const byWeek = new Map<string, MonthDay[]>();
  for (const day of days) {
    const key = moment(day.date).startOf('isoWeek').format('YYYY-MM-DD');
    const bucket = byWeek.get(key);
    if (bucket) bucket.push(day);
    else byWeek.set(key, [day]);
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monday, weekDays]) => ({
      week: moment(monday).isoWeek(),
      days: weekDays.sort((a, b) => a.date.localeCompare(b.date)),
    }));
}

function calendarRange(targetDate: string) {
  return {
    first: moment(targetDate).startOf('month').startOf('isoWeek'),
    last: moment(targetDate).endOf('month').endOf('isoWeek'),
  };
}

function buildSkeletonWeeks(targetDate: string): MonthWeek[] {
  const { first, last } = calendarRange(targetDate);
  const days: MonthDay[] = [];
  for (
    const d = first.clone();
    d.isSameOrBefore(last, 'day');
    d.add(1, 'day')
  ) {
    days.push({
      date: d.format('YYYY-MM-DD'),
      rangeSupervision: 'absent',
    });
  }
  return groupIntoWeeks(days);
}
