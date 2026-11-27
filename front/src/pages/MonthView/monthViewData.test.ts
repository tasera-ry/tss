import type { DaySchedule } from '@/types';
import { buildCalendar, toMonthDay } from './monthViewData';

describe('buildCalendar', () => {
  it('fills every visible day when there is no data', () => {
    // March 2021: Mon 1.3. – Sun 4.4.
    const weeks = buildCalendar('2021-03');
    const days = weeks.flatMap((week) => week.days);

    expect(weeks.map((week) => week.week)).toEqual([9, 10, 11, 12, 13]);
    expect(days).toHaveLength(35);
    expect(days[0]).toEqual({ date: '2021-03-01', rangeSupervision: 'absent' });
    expect(days.at(-1)?.date).toBe('2021-04-04');
  });
});

describe('toMonthDay', () => {
  const base = {
    date: '2021-03-02',
    rangeSupervision: 'confirmed',
    arriving_at: null,
    tracks: [],
  };

  it('falls back to the track-level arrival time like WeekView', () => {
    const day = {
      ...base,
      tracks: [
        { notice: null, scheduled: { arriving_at: null } },
        { notice: null, scheduled: { arriving_at: '17:30:00' } },
      ],
    } as unknown as DaySchedule;

    expect(toMonthDay(day)).toEqual({
      date: '2021-03-02',
      rangeSupervision: 'confirmed',
      arrivingAt: '17:30:00',
    });
  });

  it('handles days without tracks', () => {
    expect(toMonthDay(base as unknown as DaySchedule)).toMatchObject({
      arrivingAt: null,
    });
  });

  it('treats an unknown status as undefined supervision', () => {
    expect(
      toMonthDay({
        ...base,
        rangeSupervision: 'weird',
      } as unknown as DaySchedule).rangeSupervision,
    ).toBe('absent');
  });
});
