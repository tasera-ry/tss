/**
 * Placeholder data layer for the redesigned track view.
 *
 * PURPOSE: everything the redesign needs that the backend does not yet provide is
 * invented here, in one file, behind the types in `trackViewTypes.ts`. Real fields
 * from `GET /api/datesupreme/:date` are mapped through untouched. Sections, lane
 * counts and part-day reservations (#420, #421; B1–B5) are real too, from
 * `GET /api/track-section` and `GET /api/track-reservation?date=`.
 *
 * ============================================================================
 * BACKEND WORK NEEDED — what is left. Each item is tagged where it is faked,
 * so `grep -rn "BACKEND(" src/trackview` finds every site. When an item lands,
 * replace the tagged code with the real field and delete the tag; when all
 * have landed, delete this file.
 *
 *   B7  `track.requires_range_officer` (boolean, default true). False only for
 *       track 6, which may open without a range officer (Pasi Autio,
 *       12.10.2026). Faked by list position in NO_RANGE_OFFICER_NEEDED.
 *   B8  Standing rules per track ("Vain .22LR", "Ei ammuntaa pimeällä"), as
 *       data an admin can edit, with a way to translate it. Faked as Finnish
 *       strings in TRACK_NOTES.
 *   B9  (#437) The sunset time for the date. Not shown until it exists
 *       (PR #465); a fixed placeholder would have reached production.
 *   B10 The supervisor rule enforced on write: "track officer present" must
 *       not be settable while the range officer is away, except on tracks
 *       with requires_range_officer = false. Today nothing stops the
 *       combination, so the view derives availability itself; see
 *       unavailableReason() in trackViewTypes.ts. This is the one item that is
 *       not purely additive.
 * ============================================================================
 *
 * Nothing here writes. The view is read-only; creating reservations is an admin
 * task and belongs in the scheduling view.
 */

import type {
  LaneSection,
  RangeOfficerState,
  SegmentStatus,
  TimeSegment,
  TrackDetail,
  TrackOfficerState,
  TrackViewDay,
} from './trackViewTypes';

/** One row of `GET /api/track-section`. */
export interface ApiSection {
  id: number;
  track_id: number;
  /** Display order within the track, from 1. */
  position: number;
  lane_count: number;
  /**
   * Where a lohko sits, e.g. "Vasemmanpuoleisin". A track that is not
   * subdivided has one section, named after the track.
   */
  name: string;
  description: string | null;
}

/** One row of `GET /api/track-reservation?date=`. */
export interface ApiReservation {
  id: number;
  track_section_id: number;
  /** Null for authority use, which no association holds. */
  association_id: number | null;
  association_name: string | null;
  type: 'private_event' | 'official' | 'closed';
  /** 'HH:MM:SS'. */
  start_time: string;
  end_time: string;
  lanes_used: number;
  description: string | null;
}

/** Shape of one track in the current `datesupreme` payload. Untyped upstream. */
interface ApiTrack {
  id: number;
  name: string;
  description: string | null;
  short_description: string | null;
  notice: string | null;
  trackSupervision: string | null;
}

interface ApiDay {
  date: string;
  open: string | null;
  close: string | null;
  rangeSupervision: string | null;
  arrivingAt: string | null;
  tracks: ApiTrack[];
}

/** 'HH:MM:SS' or 'HH:MM' to minutes from midnight. */
export function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(':');
  const hours = Number(h);
  const mins = Number(m);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  return hours * 60 + mins;
}

/** Minutes from midnight to the Finnish 'HH.MM' the customer specified. */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

/**
 * PLACEHOLDER. Standing rules per track, from the customer 7.10.2026.
 * Keyed by position in the track list because the database has nowhere to keep
 * them yet. Replace with real data; do not extend this table.
 *
 * BACKEND(B8): notes.
 */
const TRACK_NOTES: string[][] = [
  [],
  [],
  [],
  ['Soveltuu myös toiminnalliseen ammuntaan (SRA, IPSC, IDPA, CAS).'],
  // Pasi Autio, review 10/2026: open on winter weekdays too, while it is light.
  // Track 6 shares the rule; the customer's specs gave both the same note.
  [
    'Ei ammuntaa pimeällä. Talvikaudella rata on käytössä vain valoisaan aikaan.',
  ],
  [
    'Vain .22LR.',
    'Ei ammuntaa pimeällä. Talvikaudella rata on käytössä vain valoisaan aikaan.',
  ],
  ['Ensisijainen toiminnallisen ammunnan rata (SRA, IPSC, IDPA, CAS).'],
];

/**
 * PLACEHOLDER. Which tracks may be used without a range officer on site.
 *
 * Only track 6, the 50 m .22LR range, by position in the list. Pasi Autio,
 * 12.10.2026. The backend should carry this as a column on the track, because
 * keying it to a position breaks the moment tracks are reordered.
 *
 * BACKEND(B7): track.requires_range_officer.
 */
const NO_RANGE_OFFICER_NEEDED = new Set([5]);

/** The existing `track_supervisor` enum maps straight onto the new type. */
function toTrackOfficer(value: string | null): TrackOfficerState {
  switch (value) {
    case 'present':
    case 'closed':
      return value;
    // #419, added to the enum in #451.
    case 'private_event':
      return 'private';
    default:
      return 'absent';
  }
}

function toRangeOfficer(value: string | null): RangeOfficerState {
  switch (value) {
    case 'present':
    case 'confirmed':
    case 'not confirmed':
    case 'closed':
      return value;
    default:
      return 'absent';
  }
}

const RESERVATION_STATUS: Record<ApiReservation['type'], SegmentStatus> = {
  private_event: 'private',
  official: 'official',
  closed: 'closed',
};

/** Where reservations overlap, the first of these present is shown. */
const PRECEDENCE: SegmentStatus[] = ['closed', 'official', 'private'];

/**
 * Turn one section's reservations into segments that tile the opening hours.
 *
 * Reservations may overlap, as long as their lanes fit the section; the backend
 * checks that on write. The view draws one segment at a time, so the day is cut
 * at every start and end. Where reservations overlap, their lanes are added up,
 * their holders named together, and the strongest status shown. Neighbouring
 * pieces that read the same are joined back together. Time outside the opening
 * hours is dropped.
 */
export function buildSegments(
  open: number,
  close: number,
  laneCount: number,
  reservations: ApiReservation[],
): TimeSegment[] {
  const spans = reservations
    .map((r) => ({
      start: Math.max(toMinutes(r.start_time) as number, open),
      end: Math.min(toMinutes(r.end_time) as number, close),
      status: RESERVATION_STATUS[r.type],
      lanes: r.lanes_used,
      holder: r.association_name,
    }))
    .filter((s) => s.start < s.end);

  const cuts = [
    ...new Set([open, close, ...spans.flatMap((s) => [s.start, s.end])]),
  ].sort((a, b) => a - b);

  const out: TimeSegment[] = [];
  for (let i = 1; i < cuts.length; i += 1) {
    const start = cuts[i - 1];
    const end = cuts[i];
    const active = spans.filter((s) => s.start < end && s.end > start);

    let segment: TimeSegment = { start, end, status: 'free' };
    if (active.length > 0) {
      const holders = [
        ...new Set(active.map((s) => s.holder).filter((h) => h !== null)),
      ];
      segment = {
        start,
        end,
        status: PRECEDENCE.find((p) =>
          active.some((s) => s.status === p),
        ) as SegmentStatus,
        reservedFor: holders.length > 0 ? holders.join(', ') : undefined,
        lanesUsed: Math.min(
          laneCount,
          active.reduce((sum, s) => sum + s.lanes, 0),
        ),
      };
    }

    const previous = out[out.length - 1];
    if (
      previous &&
      previous.status === segment.status &&
      previous.lanesUsed === segment.lanesUsed &&
      previous.reservedFor === segment.reservedFor
    ) {
      previous.end = end;
    } else {
      out.push(segment);
    }
  }
  return out;
}

function buildSections(
  track: ApiTrack,
  sections: ApiSection[],
  reservations: ApiReservation[],
  open: number,
  close: number,
  rangeClosed: boolean,
): LaneSection[] {
  // A range closed for the day closes every track, track 6 included.
  const officer = rangeClosed
    ? 'closed'
    : toTrackOfficer(track.trackSupervision);
  const own = sections
    .filter((s) => s.track_id === track.id)
    .sort((a, b) => a.position - b.position);
  // Only a subdivided track names its sections; one section is the whole track.
  const divided = own.length > 1;

  return own.map((s): LaneSection => {
    const segments: TimeSegment[] =
      officer === 'closed'
        ? [{ start: open, end: close, status: 'closed' }]
        : buildSegments(
            open,
            close,
            s.lane_count,
            reservations.filter((r) => r.track_section_id === s.id),
          );
    return {
      id: String(s.id),
      number: divided ? s.position : null,
      position: divided ? s.name : undefined,
      laneCount: s.lane_count,
      // A private event track is not open to other members, so its free time
      // is not free. Bookings on it still show as they are.
      segments:
        officer === 'private'
          ? segments.map((seg) =>
              seg.status === 'free' ? { ...seg, status: 'private' } : seg,
            )
          : segments,
    };
  });
}

/**
 * Map the live payloads into what the redesigned view needs, filling the gaps.
 * Real: name, description, notice, both supervisor statuses, opening hours,
 * sections, lane counts, reservations.
 * Placeholder: notes, the range officer exception. Sunset is not shown yet.
 */
export function toTrackViewDay(
  api: ApiDay | undefined,
  sections: ApiSection[] = [],
  reservations: ApiReservation[] = [],
): TrackViewDay | null {
  if (!api) return null;

  const open = toMinutes(api.open) ?? 10 * 60;
  const close = toMinutes(api.close) ?? 19 * 60;

  const tracks: TrackDetail[] = (api.tracks ?? []).map((track, index) => ({
    id: track.id,
    name: track.name,
    description: track.description ?? '',
    shortDescription: track.short_description ?? '',
    notice: track.notice ?? null,
    officer: toTrackOfficer(track.trackSupervision),
    requiresRangeOfficer: !NO_RANGE_OFFICER_NEEDED.has(index),
    sections: buildSections(
      track,
      sections,
      reservations,
      open,
      close,
      api.rangeSupervision === 'closed',
    ),
    notes: TRACK_NOTES[index] ?? [],
  }));

  return {
    date: api.date,
    open,
    close,
    rangeOfficer: toRangeOfficer(api.rangeSupervision),
    // Only while the officer is booked: arriving_at is never cleared on
    // check-in, so a present or closed day can still carry an old time.
    rangeOfficerArrivingAt:
      api.rangeSupervision === 'confirmed' ? toMinutes(api.arrivingAt) : null,
    // BACKEND(B9, #437): null renders nothing rather than a wrong time. The
    // real value (PR #465) matters on tracks 5 and 6, where shooting is
    // barred after dark.
    sunset: null,
    tracks,
  };
}
