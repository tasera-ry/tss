import api from '@/api/api';

/** The ids a day's rows have, from GET /api/datesupreme/:date. */
export interface DayIds {
  date: string;
  rangeId: number;
  reservationId: number | null;
  scheduleId: number | null;
}

const pending = new Map<string, Promise<DayIds>>();
/** Rows created here that the page's data may not show yet. */
const created = new Map<
  string,
  { reservationId: number; scheduleId?: number }
>();

/**
 * Make sure the day has its range reservation and schedule rows before a card
 * writes to it, and return their ids.
 *
 * A day with no rows is created closed (available false), with the hours the
 * old Schedules page used for an empty day (17-20). The rows are unique per
 * date, so they must be created once: a card saving while another creates
 * them waits for it, and a card saving before the page has reloaded the day
 * uses the ids created here.
 */
export function ensureDayRows(day: DayIds): Promise<DayIds> {
  if (day.reservationId !== null && day.scheduleId !== null) {
    created.delete(day.date);
    return Promise.resolve(day);
  }
  const inFlight = pending.get(day.date);
  if (inFlight) return inFlight;

  const known = created.get(day.date);
  const creating = (async () => {
    let reservationId = day.reservationId ?? known?.reservationId ?? null;
    if (reservationId === null) {
      const reservation = await api.createReservation({
        range_id: day.rangeId,
        date: day.date,
        available: false,
      });
      reservationId = reservation.id as number;
      created.set(day.date, { reservationId });
    }
    let scheduleId = day.scheduleId ?? known?.scheduleId ?? null;
    if (scheduleId === null) {
      const schedule = await api.createSchedule({
        range_reservation_id: reservationId,
        open: '17:00',
        close: '20:00',
      });
      scheduleId = schedule.id as number;
      created.set(day.date, { reservationId, scheduleId });
    }
    return { ...day, reservationId, scheduleId };
  })().finally(() => pending.delete(day.date));

  pending.set(day.date, creating);
  return creating;
}
