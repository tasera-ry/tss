/**
 * Placeholder data layer for the redesigned track view.
 *
 * PURPOSE: everything the redesign needs that the backend does not yet provide is
 * invented here, in one file, behind the types in `trackViewTypes.ts`. Real fields
 * from `GET /api/datesupreme/:date` are mapped through untouched; only the parts
 * belonging to #420 (lanes), #421 (time segments) and the track officer identity
 * are fabricated.
 *
 * WHAT THE BACKEND NEEDS TO ADD, to let this file be deleted:
 *   - `track.lane_count` (integer) and a lane-section table, or a JSON column —
 *     see LANE_CONFIG below for the real figures the customer gave on 7.10.2026.
 *   - a per-track reservation with a start and an end (#421). Note this is a new
 *     table, not two columns: `range_reservation` is one row per range per day,
 *     unique on (range_id, date), and nothing in the schema is finer than a day
 *     except the range's own opening hours.
 *   - `lanes_used` on that reservation (#420). Lanes within a track are identical,
 *     so this is a count, never a set of lane ids.
 *   - a link from a reservation to the association holding it. Today the only
 *     association link is at range level, so "reserved for X" per track has no
 *     data behind it.
 *   - `'private'` added to the `track_supervisor` enum (#419).
 *
 * Nothing here writes. The view is read-only; creating reservations is an admin
 * task and belongs in the scheduling view.
 */

import type {
  LaneSection,
  RangeOfficerState,
  TimeSegment,
  TrackDetail,
  TrackOfficerState,
  TrackViewDay,
} from './trackViewTypes';

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
 * PLACEHOLDER. Lane counts and sections, from the customer 7.10.2026.
 * Keyed by position in the track list because the database has no lane column to
 * key on yet. Replace with real data; do not extend this table.
 */
const LANE_CONFIG: {
  lanes: number;
  sections?: { name: string; lanes: number }[];
  notes: string[];
}[] = [
  {
    lanes: 60,
    sections: [
      { name: 'Lohko 1', lanes: 20 },
      { name: 'Lohko 2', lanes: 20 },
      { name: 'Lohko 3', lanes: 20 },
    ],
    notes: [],
  },
  { lanes: 40, notes: [] },
  { lanes: 40, notes: [] },
  {
    lanes: 24,
    sections: [
      { name: 'Merkityt paikat', lanes: 4 },
      { name: 'Merkitsemättömät paikat', lanes: 20 },
    ],
    notes: ['Soveltuu myös toiminnalliseen ammuntaan (SRA, IPSC, IDPA, CAS).'],
  },
  {
    lanes: 4,
    notes: [
      'Ei ammuntaa pimeällä. Talvikaudella rata on käytössä vain lauantaisin.',
    ],
  },
  {
    lanes: 60,
    notes: [
      'Vain .22LR.',
      'Ei ammuntaa pimeällä. Talvikaudella rata on käytössä vain lauantaisin.',
    ],
  },
  {
    lanes: 25,
    notes: [
      'Ensisijainen toiminnallisen ammunnan rata (SRA, IPSC, IDPA, CAS).',
    ],
  },
];

const DEFAULT_CONFIG = { lanes: 20, notes: [] as string[] };

/**
 * PLACEHOLDER. Which tracks may be used without a range officer on site.
 *
 * Only track 6, the 50 m .22LR range, by position in the list. Pasi Autio,
 * 12.10.2026. The backend should carry this as a column on the track, because
 * keying it to a position breaks the moment tracks are reordered.
 */
const NO_RANGE_OFFICER_NEEDED = new Set([5]);

/** PLACEHOLDER for #437. Deliberately one fixed time rather than a real one. */
export const PLACEHOLDER_SUNSET = 18 * 60 + 32;

function laneConfig(index: number) {
  return LANE_CONFIG[index] ?? DEFAULT_CONFIG;
}

/** The existing `track_supervisor` enum maps straight onto the new type. */
function toTrackOfficer(value: string | null): TrackOfficerState {
  switch (value) {
    case 'present':
    case 'closed':
      return value;
    // 'private' is #419 and cannot reach us yet; everything else means absent.
    default:
      return 'absent';
  }
}

function toRangeOfficer(value: string | null): RangeOfficerState {
  switch (value) {
    case 'present':
    case 'confirmed':
    case 'not confirmed':
    case 'en route':
    case 'closed':
      return value;
    default:
      return 'absent';
  }
}

/**
 * PLACEHOLDER. Deterministic pseudo-reservations so the view renders something
 * plausible without a backend, and renders the same thing on every load.
 * Seeded from the date and track id — no randomness, so tests are stable.
 */
function placeholderSegments(
  seed: number,
  open: number,
  close: number,
  laneCount: number,
): TimeSegment[] {
  const span = close - open;
  if (span <= 60) return [{ start: open, end: close, status: 'free' }];

  // Three shapes, chosen by seed: untouched, one block, one partial block.
  const shape = seed % 3;
  if (shape === 0) return [{ start: open, end: close, status: 'free' }];

  // Start one to three hours in, on a quarter hour; run for two hours less a quarter.
  const start = open + 60 * (1 + (seed % 3));
  const end = Math.min(start + 105, close);
  if (end <= start) return [{ start: open, end: close, status: 'free' }];

  const reserved: TimeSegment = {
    start,
    end,
    status: shape === 1 ? 'private' : 'official',
    reservedFor: shape === 1 ? 'Varattu seuran vuorolle' : 'Viranomaiskäyttö',
    // Half the lanes on the partial shape, all of them otherwise.
    lanesUsed:
      shape === 1 && laneCount > 4 ? Math.round(laneCount / 2) : laneCount,
  };

  const out: TimeSegment[] = [];
  if (start > open) out.push({ start: open, end: start, status: 'free' });
  out.push(reserved);
  if (end < close) out.push({ end: close, start: end, status: 'free' });
  return out;
}

function buildSections(
  track: ApiTrack,
  index: number,
  open: number,
  close: number,
): LaneSection[] {
  const config = laneConfig(index);
  const officerClosed = track.trackSupervision === 'closed';

  const make = (
    id: string,
    name: string,
    lanes: number,
    seed: number,
  ): LaneSection => ({
    id,
    name,
    laneCount: lanes,
    segments: officerClosed
      ? [{ start: open, end: close, status: 'closed' }]
      : placeholderSegments(seed, open, close, lanes),
  });

  if (config.sections) {
    return config.sections.map((s, i) =>
      make(`${track.id}-${i}`, s.name, s.lanes, track.id + i),
    );
  }
  return [make(String(track.id), '', config.lanes, track.id)];
}

/**
 * Map the live payload into what the redesigned view needs, filling the gaps.
 * Real: name, description, notice, both supervisor statuses, opening hours.
 * Placeholder: lane counts, sections, time segments, sunset.
 */
export function toTrackViewDay(api: ApiDay | undefined): TrackViewDay | null {
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
    sections: buildSections(track, index, open, close),
    notes: laneConfig(index).notes,
  }));

  return {
    date: api.date,
    open,
    close,
    rangeOfficer: toRangeOfficer(api.rangeSupervision),
    rangeOfficerArrivingAt: toMinutes(api.arrivingAt),
    // PLACEHOLDER until #437. Null renders nothing rather than a wrong time.
    // PLACEHOLDER until #437. A fixed time, not a real one for this date, so
    // nobody mistakes it for the feature working. The view marks it as such.
    // The real value would come from Ilmatieteen laitos or similar, and matters
    // on tracks 5 and 6 where shooting is barred after dark.
    sunset: PLACEHOLDER_SUNSET,
    tracks,
  };
}
