/** The day from GET /api/datesupreme/:date, as far as the Schedules page reads it. */
export interface ApiScheduleDay {
  date: string;
  /** Hard-coded in the backend config, not read from the database. */
  rangeId: number;
  /** Null until the day has a range reservation row. */
  reservationId: number | null;
  /** Null until the day has a schedule row. */
  scheduleId: number | null;
  available: boolean | null;
  /** 'HH:MM:SS'; writes take 'HH:MM'. */
  open: string | null;
  close: string | null;
  rangeSupervisorId: number | null;
  rangeSupervision: string | null;
  arrivingAt: string | null;
  tracks: ApiTrackDay[];
}

export interface ApiTrackDay {
  id: number;
  name: string;
  description: string | null;
  /** '' when the track has no row for the day; writes must not send null. */
  notice: string | null;
  /** present | absent | closed | private_event. */
  trackSupervision: string | null;
  /** The track's row for the day, or false or missing when it has none. */
  scheduled?: object | false;
}

export interface Association {
  id: number;
  name: string;
}
