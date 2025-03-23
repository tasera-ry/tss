export interface DaySchedule {
  available: null;
  close: null;
  date: string;
  open: null;
  rangeId: 56;
  rangeSupervision: string;
  rangeSupervisionScheduled: false;
  rangeSupervisorId: null;
  reservationId: null;
  scheduleId: null;
  arriving_at: null;
  tracks: Track[];
}

export interface Track {
  description: null;
  id: null;
  name: null;
  notice: null;
  short_description: null;
  trackSupervision: null;
  scheduled: {
    visitors: null;
    notice: null;
    scheduled_range_supervision_id: null;
    arriving_at: null;
    track_id: null;
    track_supervisor: null;
    updated_at: null;
  };
}
