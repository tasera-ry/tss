import { describe, expect, it } from 'vitest';
import { formatTime, toMinutes, toTrackViewDay } from './trackViewPlaceholder';

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

  it('gives track 1 its three lohkot and the others a single section', () => {
    // PLACEHOLDER data, from the customer's track specs of 7.10.2026.
    const day = toTrackViewDay(apiDay);
    expect(day?.tracks[0].sections).toHaveLength(3);
    expect(day?.tracks[0].sections.map((s) => s.name)).toEqual([
      'Lohko 1',
      'Lohko 2',
      'Lohko 3',
    ]);
    expect(day?.tracks[0].sections[0].laneCount).toBe(20);
    expect(day?.tracks[1].sections).toHaveLength(1);
    expect(day?.tracks[1].sections[0].name).toBe('');
  });

  it('renders a closed track as closed for the whole day', () => {
    const day = toTrackViewDay(apiDay);
    const segments = day?.tracks[1].sections[0].segments ?? [];
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ start: 600, end: 1140, status: 'closed' });
  });

  it('produces segments that tile the opening hours without gaps or overlaps', () => {
    const day = toTrackViewDay(apiDay);
    for (const track of day?.tracks ?? []) {
      for (const section of track.sections) {
        expect(section.segments[0].start).toBe(day?.open);
        expect(section.segments[section.segments.length - 1].end).toBe(day?.close);
        for (let i = 1; i < section.segments.length; i += 1) {
          expect(section.segments[i].start).toBe(section.segments[i - 1].end);
        }
      }
    }
  });

  it('is deterministic, so the same day always renders the same way', () => {
    const a = toTrackViewDay(apiDay);
    const b = toTrackViewDay(apiDay);
    expect(a).toEqual(b);
  });

  it('falls back to 10-19 when the day has no opening hours', () => {
    const day = toTrackViewDay({ ...apiDay, open: null, close: null });
    expect(day?.open).toBe(600);
    expect(day?.close).toBe(1140);
  });
});
