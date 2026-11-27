import moment from 'moment';

import type { DaySchedule } from '@/types';

export const RANGE_SUPERVISIONS = [
  'present',
  'confirmed',
  'not confirmed',
  'absent',
  'closed',
] as const;

export type RangeSupervision = (typeof RANGE_SUPERVISIONS)[number];

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

export function calendarRange(monthKey: string) {
  const month = moment(monthKey, 'YYYY-MM');
  return {
    first: month.clone().startOf('month').startOf('isoWeek'),
    last: month.clone().endOf('month').endOf('isoWeek'),
  };
}

/** Every day of the visible range, so a day missing from the API cannot shift the grid. */
export function buildCalendar(
  monthKey: string,
  days: MonthDay[] = [],
): MonthWeek[] {
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
