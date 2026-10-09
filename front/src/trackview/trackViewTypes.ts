/**
 * Domain types for the redesigned track view.
 *
 * This file is the contract between frontend and backend for issues #419, #420
 * and #421. Nothing in the current `GET /api/datesupreme/:date` payload provides
 * time segments, lane counts or track-officer presence, so those parts are served
 * from `trackViewPlaceholder.ts` until the backend catches up. The shapes here are
 * what the frontend expects; the placeholder exists only to satisfy them.
 *
 * Deliberately not reusing `src/types.ts` — its `Track` types every field as
 * `null`, which only compiles because strict mode is off.
 */

/** Range officer (päävalvoja) state. Mirrors the `range_supervisor` enum. */
export type RangeOfficerState =
  | 'present'
  | 'confirmed'
  | 'not confirmed'
  | 'en route'
  | 'absent'
  | 'closed';

/**
 * Track officer (ratavalvoja) state. Mirrors the `track_supervisor` enum, with
 * 'private' added for #419. The customer confirmed on 8.10.2026 that members may
 * not enter a track without a track officer, so 'absent' means unusable rather
 * than merely unassigned.
 */
export type TrackOfficerState = 'present' | 'absent' | 'closed' | 'private';

/** What a reserved stretch of time is reserved for. */
export type SegmentStatus =
  | 'free'
  /** #419, yksityistilaisuus. Shooters present, track not open to other members. */
  | 'private'
  /** Reserved for authority use. */
  | 'official'
  /** Closed outright: maintenance, darkness, winter rules. */
  | 'closed';

/**
 * A stretch of one day on one track or section.
 *
 * `start` and `end` are minutes from midnight rather than strings, so that
 * arithmetic and sorting need no parsing. The customer asked for 15-minute input
 * granularity; display granularity is whatever the data says, so a segment may
 * end at 12.45.
 */
export interface TimeSegment {
  start: number;
  end: number;
  status: SegmentStatus;
  /** Who holds the reservation, when it belongs to a named party. */
  reservedFor?: string;
  /**
   * How many lanes this segment occupies. Omitted means the whole section.
   * Lanes within a track are interchangeable (confirmed by the customer on
   * 7.10.2026), so a reservation is a count, never a set of lane identities.
   */
  lanesUsed?: number;
}

/**
 * A separately bookable part of a track.
 *
 * Only some tracks have these: track 1 has three lohkot of 20 lanes, track 4
 * splits into marked and unmarked places. A track without sections is modelled as
 * a single unnamed section so that rendering needs no special case.
 */
export interface LaneSection {
  id: string;
  /** Empty for tracks that are not subdivided. */
  name: string;
  laneCount: number;
  segments: TimeSegment[];
}

/** Everything the redesigned track view renders for one track on one day. */
export interface TrackDetail {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  /** Free-text notice from `track_supervision.notice`. May be null in the API. */
  notice: string | null;
  officer: TrackOfficerState;
  sections: LaneSection[];
  /** Standing rules, e.g. "no shooting after dark", ".22LR only". */
  notes: string[];
}

/** The day as a whole, shared by every track on it. */
export interface TrackViewDay {
  date: string;
  /** Minutes from midnight. Null when the range is not open that day. */
  open: number | null;
  close: number | null;
  rangeOfficer: RangeOfficerState;
  /** Estimated arrival, minutes from midnight, when one has been given. */
  rangeOfficerArrivingAt: number | null;
  /** For #437. Null until the sunset integration exists. */
  sunset: number | null;
  tracks: TrackDetail[];
}

/**
 * Why a track cannot be used right now, or null when it can.
 *
 * Encodes the rule the customer stated on 8.10.2026: shooting requires a range
 * officer on site, and members may not enter a track with no track officer. The
 * backend does not enforce this today — the two statuses are independent columns
 * with no constraint between them — so the view derives it rather than trusting
 * the payload.
 */
export type UnavailableReason = 'noRangeOfficer' | 'noTrackOfficer' | null;

export function unavailableReason(
  day: Pick<TrackViewDay, 'rangeOfficer'>,
  track: Pick<TrackDetail, 'officer'>,
): UnavailableReason {
  if (day.rangeOfficer !== 'present') return 'noRangeOfficer';
  if (track.officer === 'absent') return 'noTrackOfficer';
  return null;
}
