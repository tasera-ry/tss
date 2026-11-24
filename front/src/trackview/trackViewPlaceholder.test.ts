import { describe, expect, it } from 'vitest';
import {
  type ApiReservation,
  type ApiSection,
  buildSegments,
  formatTime,
  toMinutes,
  toTrackViewDay,
} from './trackViewPlaceholder';

describe('time helpers', () => {
  it('parses the time strings the API returns', () => {
    expect(toMinutes('10:00:00')).toBe(600);
    expect(toMinutes('18:32')).toBe(1112);
    expect(toMinutes('00:00:00')).toBe(0);
  });

  it('returns null rather than NaN for missing or malformed times', () => {
    expect(toMinutes(null)).toBeNull();
    expect(toMinutes(undefined)).toBeNull();
    expect(toMinutes('')).toBeNull();
    expect(toMinutes('not a time')).toBeNull();
  });

  it('formats in the Finnish style the customer specified', () => {
    // dd.mm.yyyy and hh.mm, agreed 7.10.2026. Dots, not colons.
    expect(formatTime(600)).toBe('10.00');
    expect(formatTime(765)).toBe('12.45');
    expect(formatTime(1112)).toBe('18.32');
    expect(formatTime(0)).toBe('00.00');
  });
});

const apiDay = {
  date: '2026-10-09',
  open: '10:00:00',
  close: '19:00:00',
  rangeSupervision: 'present',
  arrivingAt: null,
  sunset: '16:34:43',
  tracks: [
    {
      id: 1,
      name: 'Rata 1',
      description: 'Pistoolirata',
      short_description: '25m',
      notice: null,
      trackSupervision: 'present',
    },
    {
      id: 2,
      name: 'Rata 2',
      description: null,
      short_description: null,
      notice: 'Huolto kesken',
      trackSupervision: 'closed',
    },
  ],
};

// The customer's figures of 7.10.2026, in the shape of the #477 dev seed.
const sections: ApiSection[] = [
  {
    id: 11,
    track_id: 1,
    position: 1,
    lane_count: 20,
    name: 'Vasemmanpuoleisin',
    description: '20 paikan lohko',
  },
  {
    id: 12,
    track_id: 1,
    position: 2,
    lane_count: 20,
    name: 'Keskimmäinen',
    description: '20 paikan lohko',
  },
  {
    id: 13,
    track_id: 1,
    position: 3,
    lane_count: 20,
    name: 'Oikeanpuoleisin',
    description: '20 paikan lohko',
  },
  {
    id: 21,
    track_id: 2,
    position: 1,
    lane_count: 40,
    name: 'Rata 2',
    description: null,
  },
];

function reservation(overrides: Partial<ApiReservation>): ApiReservation {
  return {
    id: 1,
    track_section_id: 11,
    association_id: 5,
    association_name: 'Hirviseura',
    type: 'private_event',
    start_time: '11:00:00',
    end_time: '12:45:00',
    lanes_used: 10,
    description: null,
    ...overrides,
  };
}

describe('toTrackViewDay', () => {
  it('returns null when there is no payload', () => {
    expect(toTrackViewDay(undefined)).toBeNull();
  });

  it('maps the real fields through unchanged', () => {
    const day = toTrackViewDay(apiDay);
    expect(day?.date).toBe('2026-10-09');
    expect(day?.open).toBe(600);
    expect(day?.close).toBe(1140);
    expect(day?.rangeOfficer).toBe('present');
    expect(day?.sunset).toBe(16 * 60 + 34);
    expect(day?.tracks[0].name).toBe('Rata 1');
    expect(day?.tracks[0].description).toBe('Pistoolirata');
    expect(day?.tracks[1].notice).toBe('Huolto kesken');
  });

  it('maps the existing track_supervisor enum onto the officer state', () => {
    const day = toTrackViewDay(apiDay);
    expect(day?.tracks[0].officer).toBe('present');
    expect(day?.tracks[1].officer).toBe('closed');
  });

  it('treats an unknown or missing supervision value as absent', () => {
    const day = toTrackViewDay({
      ...apiDay,
      rangeSupervision: null,
      tracks: [{ ...apiDay.tracks[0], trackSupervision: null }],
    });
    expect(day?.rangeOfficer).toBe('absent');
    expect(day?.tracks[0].officer).toBe('absent');
  });

  it('gives each track its own sections from the API, in order', () => {
    const day = toTrackViewDay(apiDay, sections);
    // Numbered here; the view writes "Lohko 1" in the interface language.
    expect(day?.tracks[0].sections.map((s) => s.number)).toEqual([1, 2, 3]);
    expect(day?.tracks[0].sections[0].laneCount).toBe(20);
    expect(day?.tracks[1].sections).toHaveLength(1);
    expect(day?.tracks[1].sections[0].number).toBeNull();
    expect(day?.tracks[1].sections[0].laneCount).toBe(40);
  });

  it('names each lohko by where it sits, and leaves undivided tracks without', () => {
    // TASERA review, 10/2026.
    const day = toTrackViewDay(apiDay, sections);
    expect(day?.tracks[0].sections.map((s) => s.position)).toEqual([
      'Vasemmanpuoleisin',
      'Keskimmäinen',
      'Oikeanpuoleisin',
    ]);
    expect(day?.tracks[1].sections[0].position).toBeUndefined();
  });

  it('orders the lohkot by their position, not by the order they arrive in', () => {
    const day = toTrackViewDay(apiDay, [...sections].reverse());
    expect(day?.tracks[0].sections.map((s) => s.position)).toEqual([
      'Vasemmanpuoleisin',
      'Keskimmäinen',
      'Oikeanpuoleisin',
    ]);
  });

  it('gives a track with no sections none, rather than inventing a lane count', () => {
    const day = toTrackViewDay(apiDay, []);
    expect(day?.tracks[0].sections).toEqual([]);
  });

  it('puts each reservation on its own section only', () => {
    const day = toTrackViewDay(apiDay, sections, [
      reservation({ track_section_id: 12 }),
    ]);
    const [lohko1, lohko2] = day?.tracks[0].sections ?? [];
    expect(lohko1.segments).toEqual([
      { start: 600, end: 1140, status: 'free' },
    ]);
    expect(lohko2.segments.map((s) => s.status)).toEqual([
      'free',
      'private',
      'free',
    ]);
  });

  it('opens tracks 5 and 6 in winter while it is light, not only on Saturdays', () => {
    // Pasi Autio, review 10/2026.
    const tracks = Array.from({ length: 6 }, (_, i) => ({
      ...apiDay.tracks[0],
      id: i + 1,
      name: `Rata ${i + 1}`,
    }));
    const day = toTrackViewDay({ ...apiDay, tracks });
    const rule =
      'Ei ammuntaa pimeällä. Talvikaudella rata on käytössä vain valoisaan aikaan.';
    expect(day?.tracks[4].notes).toEqual([rule]);
    expect(day?.tracks[5].notes).toEqual(['Vain .22LR.', rule]);
  });

  it('renders a closed track as closed for the whole day, whatever is booked', () => {
    const day = toTrackViewDay(apiDay, sections, [
      reservation({ track_section_id: 21 }),
    ]);
    expect(day?.tracks[1].sections[0].segments).toEqual([
      { start: 600, end: 1140, status: 'closed' },
    ]);
  });

  it('maps a private event track and shows its free time as private, keeping its bookings', () => {
    // #419, track_supervisor 'private_event' since #451.
    const day = toTrackViewDay(
      {
        ...apiDay,
        tracks: [{ ...apiDay.tracks[1], trackSupervision: 'private_event' }],
      },
      sections,
      [reservation({ track_section_id: 21, type: 'official' })],
    );
    expect(day?.tracks[0].officer).toBe('private');
    expect(day?.tracks[0].sections[0].segments.map((s) => s.status)).toEqual([
      'private',
      'official',
      'private',
    ]);
  });

  it('keeps the arrival time only while the range officer is booked', () => {
    // arriving_at is never cleared on check-in (production, e.g. 14.11.2026).
    const at = (rangeSupervision: string) =>
      toTrackViewDay({ ...apiDay, rangeSupervision, arrivingAt: '09:45:00' })
        ?.rangeOfficerArrivingAt;
    expect(at('confirmed')).toBe(585);
    expect(at('present')).toBeNull();
    expect(at('closed')).toBeNull();
  });

  it('closes every track, track 6 included, when the range is closed for the day', () => {
    const tracks = Array.from({ length: 6 }, (_, i) => ({
      ...apiDay.tracks[0],
      id: i + 1,
      name: `Rata ${i + 1}`,
      trackSupervision: 'present',
    }));
    const sixTracks = tracks.map((t) => ({
      id: t.id * 10,
      track_id: t.id,
      position: 1,
      lane_count: 20,
      name: t.name,
      description: null,
    }));
    const day = toTrackViewDay(
      { ...apiDay, rangeSupervision: 'closed', tracks },
      sixTracks,
    );
    for (const track of day?.tracks ?? []) {
      expect(track.sections[0].segments).toEqual([
        { start: 600, end: 1140, status: 'closed' },
      ]);
    }
  });

  it('falls back to 10-19 when the day has no opening hours', () => {
    const day = toTrackViewDay({ ...apiDay, open: null, close: null });
    expect(day?.open).toBe(600);
    expect(day?.close).toBe(1140);
  });

  it('leaves sunset empty when the API reports no sunset', () => {
    const day = toTrackViewDay({ ...apiDay, sunset: null });
    expect(day?.sunset).toBeNull();
  });
});

describe('buildSegments', () => {
  const open = 600;
  const close = 1140;

  it('leaves a day with no reservations free from open to close', () => {
    expect(buildSegments(open, close, 20, [])).toEqual([
      { start: open, end: close, status: 'free' },
    ]);
  });

  it('places a reservation at its real times, to the quarter hour', () => {
    expect(buildSegments(open, close, 20, [reservation({})])).toEqual([
      { start: 600, end: 660, status: 'free' },
      {
        start: 660,
        end: 765,
        status: 'private',
        reservedFor: 'Hirviseura',
        lanesUsed: 10,
      },
      { start: 765, end: 1140, status: 'free' },
    ]);
  });

  it('names nobody for authority use, which no association holds', () => {
    const [, official] = buildSegments(open, close, 20, [
      reservation({
        type: 'official',
        association_id: null,
        association_name: null,
        lanes_used: 20,
      }),
    ]);
    expect(official).toEqual({
      start: 660,
      end: 765,
      status: 'official',
      reservedFor: undefined,
      lanesUsed: 20,
    });
  });

  it('adds up the lanes where two bookings overlap, and names both holders', () => {
    const segments = buildSegments(open, close, 40, [
      reservation({ start_time: '11:00:00', end_time: '13:00:00' }),
      reservation({
        id: 2,
        association_name: 'Pistooliseura',
        start_time: '12:00:00',
        end_time: '14:00:00',
        lanes_used: 15,
      }),
    ]);
    expect(segments.map((s) => [s.start, s.end, s.lanesUsed])).toEqual([
      [600, 660, undefined],
      [660, 720, 10],
      [720, 780, 25],
      [780, 840, 15],
      [840, 1140, undefined],
    ]);
    expect(segments[2].reservedFor).toBe('Hirviseura, Pistooliseura');
  });

  it('shows the stronger status where a private event and authority use overlap', () => {
    const segments = buildSegments(open, close, 40, [
      reservation({ start_time: '11:00:00', end_time: '13:00:00' }),
      reservation({
        id: 2,
        type: 'official',
        association_name: null,
        start_time: '12:00:00',
        end_time: '13:00:00',
      }),
    ]);
    expect(segments.map((s) => s.status)).toEqual([
      'free',
      'private',
      'official',
      'free',
    ]);
  });

  it('never counts more lanes than the section has', () => {
    const [, booked] = buildSegments(open, close, 20, [
      reservation({ lanes_used: 15 }),
      reservation({ id: 2, lanes_used: 15 }),
    ]);
    expect(booked.lanesUsed).toBe(20);
  });

  it('joins back-to-back bookings that read the same', () => {
    const segments = buildSegments(open, close, 20, [
      reservation({ start_time: '11:00:00', end_time: '12:00:00' }),
      reservation({ id: 2, start_time: '12:00:00', end_time: '13:00:00' }),
    ]);
    expect(segments.map((s) => [s.start, s.end, s.status])).toEqual([
      [600, 660, 'free'],
      [660, 780, 'private'],
      [780, 1140, 'free'],
    ]);
  });

  it('drops the part of a booking outside the opening hours', () => {
    const segments = buildSegments(open, close, 20, [
      reservation({ start_time: '08:00:00', end_time: '10:30:00' }),
      reservation({ id: 2, start_time: '20:00:00', end_time: '21:00:00' }),
    ]);
    expect(segments.map((s) => [s.start, s.end, s.status])).toEqual([
      [600, 630, 'private'],
      [630, 1140, 'free'],
    ]);
  });

  it('tiles the opening hours without gaps or overlaps', () => {
    const segments = buildSegments(open, close, 40, [
      reservation({ start_time: '10:15:00', end_time: '12:45:00' }),
      reservation({ id: 2, start_time: '12:00:00', end_time: '18:30:00' }),
      reservation({ id: 3, start_time: '16:00:00', end_time: '19:00:00' }),
    ]);
    expect(segments[0].start).toBe(open);
    expect(segments[segments.length - 1].end).toBe(close);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i].start).toBe(segments[i - 1].end);
    }
  });
});
