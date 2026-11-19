import api from '@/api/api';

/** The ids a day's rows have, from GET /api/datesupreme/:date. */
export interface DayIds {
  date: string;
  rangeId: number;
  reservationId: number | null;
  scheduleId: number | null;
}

const pending = new Map<string, Promise<DayIds>>();

/**
 * Make sure the day has its range reservation and schedule rows before a card
 * writes to it, and return their ids.
 *
 * A day with no rows is created closed (available false), with the hours the
 * old Schedules page used for an empty day (17-20). The rows are unique per
 * date, so two cards saving at once must not both create them: the second
 * waits for the first.
 */
export function ensureDayRows(day: DayIds): Promise<DayIds> {
  if (day.reservationId !== null && day.scheduleId !== null) {
    return Promise.resolve(day);
  }
  const inFlight = pending.get(day.date);
  if (inFlight) return inFlight;

  const created = (async () => {
    let reservationId = day.reservationId;
    if (reservationId === null) {
      const reservation = await api.createReservation({
        range_id: day.rangeId,
        date: day.date,
        available: false,
      });
      reservationId = reservation.id;
    }
    let scheduleId = day.scheduleId;
    if (scheduleId === null) {
      const schedule = await api.createSchedule({
        range_reservation_id: reservationId,
        open: '17:00',
        close: '20:00',
      });
      scheduleId = schedule.id;
    }
    return { ...day, reservationId, scheduleId };
  })().finally(() => pending.delete(day.date));

  pending.set(day.date, created);
  return created;
}
