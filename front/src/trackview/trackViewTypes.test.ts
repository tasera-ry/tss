import { describe, expect, it } from 'vitest';
import { unavailableReason } from './trackViewTypes';

/**
 * The rule, as the customer stated it.
 *
 * Kimmo Koivisto, 8.10.2026: shooting requires a range officer on site, members
 * may not enter a track with no track officer, and when the range officer is
 * away no track can be open.
 *
 * Pasi Autio, 12.10.2026, refining it: track 6 may be set to "track officer
 * present" while the range officer is away. No other track may. He also stated
 * the general case as a write-time constraint, not only a display rule.
 *
 * The backend enforces none of this — `range_supervisor` and `track_supervisor`
 * are independent columns — so the view derives it. These tests pin it down.
 */

const normal = { officer: 'present', requiresRangeOfficer: true } as const;
const track6 = { officer: 'present', requiresRangeOfficer: false } as const;

describe('unavailableReason', () => {
  it('allows use when both officers are present', () => {
    expect(unavailableReason({ rangeOfficer: 'present' }, normal)).toBeNull();
  });

  it.each([['absent'], ['confirmed'], ['not confirmed'], ['closed']] as const)(
    'blocks a normal track when the range officer is %s, even with a track officer present',
    (rangeOfficer) => {
      expect(unavailableReason({ rangeOfficer }, normal)).toBe(
        'noRangeOfficer',
      );
    },
  );

  it('blocks a track with no track officer, even when the range officer is present', () => {
    expect(
      unavailableReason(
        { rangeOfficer: 'present' },
        { ...normal, officer: 'absent' },
      ),
    ).toBe('noTrackOfficer');
  });

  it('reports the range officer first when both are missing', () => {
    // It is the broader fact: it explains every other track on the page too.
    expect(
      unavailableReason(
        { rangeOfficer: 'absent' },
        { ...normal, officer: 'absent' },
      ),
    ).toBe('noRangeOfficer');
  });

  it('does not treat a closed or private track as missing its officer', () => {
    // These are states of the track, not of its supervision. The segments carry
    // the closure; the officer line should not also claim nobody is there.
    expect(
      unavailableReason(
        { rangeOfficer: 'present' },
        { ...normal, officer: 'closed' },
      ),
    ).toBeNull();
    expect(
      unavailableReason(
        { rangeOfficer: 'present' },
        { ...normal, officer: 'private' },
      ),
    ).toBeNull();
  });

  describe('the track 6 exception', () => {
    it.each([['absent'], ['confirmed']] as const)(
      'stays usable with its own officer while the range officer is %s',
      (rangeOfficer) => {
        expect(unavailableReason({ rangeOfficer }, track6)).toBeNull();
      },
    );

    it('is still blocked without a track officer of its own', () => {
      // The exception is about the range officer, not about going unsupervised.
      expect(
        unavailableReason(
          { rangeOfficer: 'absent' },
          { ...track6, officer: 'absent' },
        ),
      ).toBe('noTrackOfficer');
    });

    it('applies to no other track', () => {
      expect(unavailableReason({ rangeOfficer: 'absent' }, normal)).toBe(
        'noRangeOfficer',
      );
    });
  });
});
