import classNames from 'classnames';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import useMediaQuery from '@mui/material/useMediaQuery';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Trans, useLingui } from '@lingui/react/macro';
import 'moment/locale/fi';
import 'moment/locale/sv';

import api from '@/api/api';
import { DateHeader } from '@/lib/components/DateHeader';
import { InfoBox } from '@/lib/components/InfoBox';
import { ViewChanger } from '@/lib/components/ViewChanger';
import { JumpToCurrent } from '@/utils/Utils';
import type { DaySchedule } from '@/types';

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
  open?: string; // HH:mm
  close?: string; // HH:mm
  hasInfo: boolean;
}

export interface MonthWeek {
  week: number;
  days: MonthDay[]; // 7 kpl, ma-su
}

export function toMonthDay(day: DaySchedule): MonthDay {
  return {
    date: day.date,
    rangeSupervision: day.rangeSupervision as RangeSupervision,
    open: (day as any).open,
    close: (day as any).close,
    hasInfo: day.tracks.some((tr) => tr.notice != null && tr.notice !== ''),
  };
}

interface StatusConfig {
  key: RangeSupervision;
  className: string;
  label: string;
  icon: JSX.Element;
  showTime: boolean;
}

function useStatusConfigs() {
  const { t } = useLingui();

  return useMemo(() => {
    const configs: Record<RangeSupervision, StatusConfig> = {
      present: {
        key: 'present',
        className: css.statusPresent,
        label: t`Päävalvoja paikalla`,
        icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
        showTime: true,
      },
      confirmed: {
        key: 'confirmed',
        className: css.statusConfirmed,
        label: t`Päävalvoja varmistettu`,
        icon: <CheckCircleOutlineIcon className={css.statusIcon} />,
        showTime: true,
      },
      'not confirmed': {
        key: 'not confirmed',
        className: css.statusNotConfirmed,
        label: t`Päävalvoja alustava`,
        icon: <HelpOutlineIcon className={css.statusIcon} />,
        showTime: false,
      },
      absent: {
        key: 'absent',
        className: css.statusAbsent,
        label: t`Ei päävalvojaa`,
        icon: <RemoveCircleOutlineIcon className={css.statusIcon} />,
        showTime: false,
      },
      closed: {
        key: 'closed',
        className: css.statusClosed,
        label: t`Rata suljettu`,
        icon: <HighlightOffIcon className={css.statusIcon} />,
        showTime: false,
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

const formatTime = (time?: string) =>
  time ? moment(time, 'HH:mm').format('H.mm') : '';

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

  const mockWeeks = useMemo(() => buildMockWeeks(targetDate), [targetDate]);
  const { data: apiWeeks } = useQuery({
    queryKey: ['monthview', targetDate],
    enabled: false, // pois päältä kunnes API kytketään
    queryFn: async (): Promise<MonthWeek[]> => {
      const firstDay = moment(targetDate)
        .startOf('month')
        .startOf('isoWeek')
        .format('YYYY-MM-DD');
      const lastDay = moment(targetDate)
        .endOf('month')
        .endOf('isoWeek')
        .format('YYYY-MM-DD');
      const data = (await api.getSchedulingFreeform(
        firstDay,
        lastDay,
      )) as DaySchedule[];
      return groupIntoWeeks(data.map(toMonthDay));
    },
  });

  const data = weeks ?? apiWeeks ?? mockWeeks;

  const goToMonth = (delta: 1 | -1) =>
    history.push(
      `/monthview/${moment(targetDate)
        .add(delta, 'month')
        .format('YYYY-MM-DD')}`,
    );

  const selectedDay = useMemo(
    () => data.flatMap((w) => w.days).find((d) => d.date === selectedDate),
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
      <DateHeader
        targetDate={targetDate}
        onPrevious={() => goToMonth(-1)}
        onNext={() => goToMonth(1)}
        type="month"
      />

      <div className={classes(css.monthContainer)}>
        <div className={classes(css.toolbar)}>
          <JumpToCurrent />
          <ViewChanger />
        </div>

        <Calendar
          weeks={data}
          targetDate={targetDate}
          selectedDate={isDesktop ? undefined : selectedDate}
          onDayClick={handleDayClick}
        />


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

interface CalendarProps {
  weeks: MonthWeek[];
  targetDate: string;
  selectedDate?: string;
  onDayClick: (date: string) => void;
}

function Calendar({ weeks, targetDate, selectedDate, onDayClick }: CalendarProps) {
  const { t } = useLingui();
  const weekdays = [
    t`Mon`,
    t`Tue`,
    t`Wed`,
    t`Thu`,
    t`Fri`,
    t`Sat`,
    t`Sun`,
  ];

  return (
    <div className={classes(css.calendar)} role="grid">
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
          key={week.week}
          week={week}
          targetDate={targetDate}
          selectedDate={selectedDate}
          onDayClick={onDayClick}
        />
      ))}
    </div>
  );
}

function WeekRow({
  week,
  targetDate,
  selectedDate,
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
  onClick: () => void;
}

function DayCell({ day, inCurrentMonth, selected, onClick }: DayCellProps) {
  const { t } = useLingui();
  const statuses = useStatusConfigs();
  const status = statuses[day.rangeSupervision] ?? statuses.absent;

  const date = useMemo(() => moment(day.date), [day.date]);
  const isToday = date.isSame(moment(), 'day');
  const showTime = status.showTime && day.open && day.close;

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
      <div className={classes(css.cellTop)}>
        <span className={classes(css.dayNumber)}>{date.date()}</span>
        {inCurrentMonth && status.icon}
      </div>

      {inCurrentMonth && (
        <div className={classes(css.cellBottom)}>
          {isToday && (
            <span className={classes(css.todayBadge)}>
              <Trans>TÄNÄÄN</Trans>
            </span>
          )}
          <span className={classes(css.statusText)}>{status.label}</span>
          {showTime && (
            <span className={classes(css.timeText)}>
              {formatTime(day.open)}–{formatTime(day.close)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function SelectedDayCard({ day }: { day: MonthDay }) {
  const { i18n } = useLingui();
  const statuses = useStatusConfigs();
  const status = statuses[day.rangeSupervision] ?? statuses.absent;

  const dateObj = new Date(day.date);
  
  const weekday = new Intl.DateTimeFormat(i18n.locale, { weekday: 'long' }).format(dateObj);
  const formattedDate = moment(day.date).format('D.M.YYYY');

  const title = `${weekday} ${formattedDate}`;

  return (
    <div className={classes(css.detailCard)}>
      <h3 className={classes(css.detailTitle)}>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </h3>
      <div className={classes(css.detailStatus, status.className)}>
        {status.icon}
        <span>{status.label}</span>
        {status.showTime && day.open && day.close && (
          <span>
            {formatTime(day.open)}–{formatTime(day.close)}
          </span>
        )}
      </div>
      <Link to={`/dayview/${day.date}`} className={classes(css.openButton)}>
        <Trans>Avaa päivänäkymä</Trans>
      </Link>
    </div>
  );
}

function Legend() {
  const statuses = useStatusConfigs();

  return (
    <div className={classes(css.legendCard)}>
      <h3 className={classes(css.legendTitle)}>
        <Trans>Selite</Trans>
      </h3>
      <ul className={classes(css.legendList)}>
        {LEGEND_ORDER.map((key) => (
          <li key={key} className={classes(css.legendItem)}>
            <span className={classes(css.legendSwatch, statuses[key].className)}>
              {statuses[key].icon}
            </span>
            <span>{statuses[key].label}</span>
          </li>
        ))}
        <li className={classes(css.legendItem)}>
          <span className={classes(css.legendSwatch, css.otherMonth)} />
          <span>
            <Trans>Edellisen / seuraavan kuukauden päivä</Trans>
          </span>
        </li>
        <li className={classes(css.legendItem)}>
          <span className={classes(css.legendSwatch)}>
            <InfoIcon className={css.legendIcon} />
          </span>
          <span>
            <Trans>Radalla on lisätietoja</Trans>
          </span>
        </li>
      </ul>
    </div>
  );
}

function groupIntoWeeks(days: MonthDay[]): MonthWeek[] {
  const byWeek = days.reduce<Record<string, MonthDay[]>>((acc, day) => {
    const key = moment(day.date).startOf('isoWeek').format('YYYY-MM-DD');
    (acc[key] ??= []).push(day);
    return acc;
  }, {});

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monday, weekDays]) => ({
      week: moment(monday).isoWeek(),
      days: weekDays.sort((a, b) => a.date.localeCompare(b.date)),
    }));
}

function buildMockWeeks(targetDate: string): MonthWeek[] {
  const first = moment(targetDate).startOf('month').startOf('isoWeek');
  const last = moment(targetDate).endOf('month').endOf('isoWeek');
  const pattern: RangeSupervision[] = [
    'present',
    'confirmed',
    'not confirmed',
    'absent',
    'closed',
    'confirmed',
    'absent',
  ];

  const days: MonthDay[] = [];
  for (const d = first.clone(); d.isSameOrBefore(last, 'day'); d.add(1, 'day')) {
    const i = days.length;
    days.push({
      date: d.format('YYYY-MM-DD'),
      rangeSupervision: pattern[i % pattern.length],
      open: '16:00',
      close: '20:00',
      hasInfo: i % 9 === 0,
    });
  }
  return groupIntoWeeks(days);
}